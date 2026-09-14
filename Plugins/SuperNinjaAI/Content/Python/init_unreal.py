"""
SuperNinjaAI v2 - Unreal Python entry point.

Auto-runs when the plugin loads. Two jobs:

  1. Register the v2 bridge into builtins, so the C++ subsystem, the Output
     Log, and any other caller can reach it:
         superninja_execute_tool(name, args_json) -> result_json
         superninja_execute_plan(plan_json)       -> result_json

  2. Start the inbox/outbox file watcher, so an outside agent (Claude Code,
     a script, a scheduled task) can drive the Editor by dropping JSON files
     without any network listener, any port, and any pasted code.

Transport
---------
    <BRIDGE_DIR>/sn_inbox/<name>.json    request  -> {"tool": "...", "args": {...}}
                                                  or {"steps": [...]} for a plan
    <BRIDGE_DIR>/sn_outbox/<name>.json   response <- the bridge's result JSON
    <BRIDGE_DIR>/sn_inbox/processed/     request files are moved here after
                                         dispatch, so nothing runs twice

BRIDGE_DIR resolution order:
    1. env var SUPERNINJA_BRIDGE_DIR
    2. <ProjectDir>/Saved/SuperNinja          <- default, always writable
    3. <UserProfile>/Desktop/SuperNinjaBridge <- fallback

Why a Slate tick callback and not a thread or a sleep loop
----------------------------------------------------------
Unreal's Python API is not thread-safe. Touching actors from a worker thread
crashes the Editor, and a ``while True: time.sleep()`` loop in the Python
console freezes it (this project has already been burned by that). The
watcher therefore runs on the Slate post-tick callback on the game thread and
does at most one dispatch per poll interval.
"""

import json
import os
import shutil
import sys
import time
import traceback

import unreal

PLUGIN_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_DIR = os.path.dirname(os.path.abspath(__file__))
LEGACY_PYTHON_DIR = os.path.join(PLUGIN_DIR, "Python")

for _p in (PYTHON_DIR, LEGACY_PYTHON_DIR):
    if os.path.isdir(_p) and _p not in sys.path:
        sys.path.insert(0, _p)

POLL_INTERVAL_SECONDS = 0.75
STATE_NAME = "_superninja_v2_watcher"


def _resolve_bridge_dir():
    env = os.environ.get("SUPERNINJA_BRIDGE_DIR")
    if env:
        return os.path.normpath(env)
    try:
        project = unreal.Paths.convert_relative_path_to_full(
            unreal.Paths.project_saved_dir())
        return os.path.normpath(os.path.join(project, "SuperNinja"))
    except Exception:
        return os.path.normpath(os.path.join(
            os.path.expanduser("~"), "Desktop", "SuperNinjaBridge"))


class SuperNinjaWatcher(object):
    """Non-blocking inbox/outbox poller running on the Slate post-tick."""

    def __init__(self, bridge, bridge_dir):
        self.bridge = bridge
        self.root = bridge_dir
        self.inbox = os.path.join(bridge_dir, "sn_inbox")
        self.outbox = os.path.join(bridge_dir, "sn_outbox")
        self.processed = os.path.join(self.inbox, "processed")
        self.failed = os.path.join(self.inbox, "failed")
        self.tick_handle = None
        self.last_poll = 0.0
        self.running = False
        for d in (self.inbox, self.outbox, self.processed, self.failed):
            try:
                os.makedirs(d, exist_ok=True)
            except Exception as exc:
                unreal.log_error(
                    "[SuperNinja v2] cannot create {}: {}".format(d, exc))

    # -- lifecycle --------------------------------------------------------
    def start(self):
        if self.running:
            unreal.log_warning("[SuperNinja v2] watcher already running")
            return False
        try:
            self.tick_handle = unreal.register_slate_post_tick_callback(self.on_tick)
        except Exception as exc:
            unreal.log_error(
                "[SuperNinja v2] could not register tick callback: {}. "
                "Bridge is still callable directly via "
                "superninja_execute_tool().".format(exc))
            return False
        self.running = True
        try:
            import superninja_bridge_v2 as sb
            sb.WATCHER_STATS.update(
                transport="file-watcher (inbox/outbox)",
                poll_interval_ms=int(POLL_INTERVAL_SECONDS * 1000),
                inbox=self.inbox, outbox=self.outbox)
        except Exception:
            pass
        unreal.log("[SuperNinja v2] watcher started")
        unreal.log("[SuperNinja v2]   inbox  {}".format(self.inbox))
        unreal.log("[SuperNinja v2]   outbox {}".format(self.outbox))
        unreal.log("[SuperNinja v2]   poll   {} ms".format(
            int(POLL_INTERVAL_SECONDS * 1000)))
        return True

    def stop(self):
        self.running = False
        if self.tick_handle is not None:
            try:
                unreal.unregister_slate_post_tick_callback(self.tick_handle)
            except Exception:
                pass
            self.tick_handle = None
        unreal.log_warning("[SuperNinja v2] watcher stopped")

    # -- polling ----------------------------------------------------------
    def on_tick(self, _delta_seconds):
        if not self.running:
            return False
        now = time.time()
        if now - self.last_poll < POLL_INTERVAL_SECONDS:
            return True
        self.last_poll = now
        try:
            self.poll_once()
        except Exception:
            unreal.log_error("[SuperNinja v2] watcher tick failed:\n{}".format(
                traceback.format_exc()))
        return True

    def poll_once(self):
        try:
            names = sorted(f for f in os.listdir(self.inbox)
                           if f.lower().endswith(".json"))
        except OSError:
            return
        if not names:
            return
        # One request per tick keeps the editor responsive under a burst.
        self.handle(names[0])

    def handle(self, filename):
        src = os.path.join(self.inbox, filename)
        started = time.time()
        try:
            with open(src, "r", encoding="utf-8-sig") as fh:
                raw = fh.read()
        except Exception as exc:
            unreal.log_error("[SuperNinja v2] cannot read {}: {}".format(src, exc))
            return

        try:
            request = json.loads(raw)
        except Exception as exc:
            self.write_result(filename, json.dumps({
                "ok": False, "verified": False, "world_context": "Unknown",
                "reason": "request is not valid JSON: {}".format(exc),
                "error": "bad json"}))
            self.retire(src, self.failed)
            return

        unreal.log("[SuperNinja v2] dispatch {} -> {}".format(
            filename, request.get("tool") or "plan"))
        if "control" in request:
            result_json = json.dumps(self.handle_control(request, filename))
            self.write_result(filename, result_json)
            self.retire(src, self.processed)
            return

        try:
            if "steps" in request:
                result_json = self.bridge.execute_plan(json.dumps(request))
            else:
                result_json = self.bridge.execute_tool(
                    request.get("tool"), json.dumps(request.get("args", {})))
        except Exception as exc:
            result_json = json.dumps({
                "ok": False, "verified": False, "world_context": "Unknown",
                "reason": "dispatch raised: {}".format(exc),
                "error": str(exc), "traceback": traceback.format_exc()})

        elapsed_ms = round((time.time() - started) * 1000.0, 1)
        try:
            payload = json.loads(result_json)
            payload["request_file"] = filename
            payload["dispatch_ms"] = elapsed_ms
            result_json = json.dumps(payload, default=str)
        except Exception:
            pass

        self.write_result(filename, result_json)
        self.retire(src, self.processed)

        try:
            import superninja_bridge_v2 as sb
            sb.WATCHER_STATS["requests_handled"] += 1
            sb.WATCHER_STATS["last_request_at"] = started
            sb.WATCHER_STATS["last_dispatch_ms"] = elapsed_ms
        except Exception:
            pass

    # -- control channel ---------------------------------------------------

    CONTROLS = ("pie_state", "begin_play", "end_play")

    def handle_control(self, request, filename):
        """Editor-session controls, deliberately outside the write guard.

        The PIE guard refuses every tool in WRITE_TOOLS while the editor is
        playing, and that must not be relaxed -- it is the whole reason the
        bridge exists. But it has a consequence nobody noticed until the live
        run: execute_python is itself a write tool, so the bridge could enter
        PIE and could not leave. The acceptance test therefore needed a human
        at the keyboard for the one section that proves the guard works.

        These three controls break that deadlock without touching the guard.
        None of them can modify the scene: they start a play session, end one,
        or report whether one is running. Ending PIE is not a write -- it is
        the operation that *discards* the throwaway PIE world and returns the
        editor to the state the guard is protecting.

        They are not tools. They are not in TOOLS and not in WRITE_TOOLS, so
        the 14-tool identity check that this project uses as its integrity
        signal is unchanged.
        """
        name = request.get("control")
        try:
            import superninja_bridge_v2 as sb
            les = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
            if name not in self.CONTROLS:
                return {"ok": False, "verified": False, "control": name,
                        "reason": "unknown control {!r}; expected one of {}".format(
                            name, ", ".join(self.CONTROLS)),
                        "request_file": filename}

            was = bool(les.is_in_play_in_editor())
            if name == "begin_play" and not was:
                les.editor_request_begin_play()
            elif name == "end_play" and was:
                les.editor_request_end_play()

            now = bool(les.is_in_play_in_editor())
            ctx = sb._check_world_context()[0]
            # begin/end are requests the editor services on a later tick, so
            # "changed" is reported honestly rather than assumed.
            return {"ok": True, "verified": True, "control": name,
                    "in_play_before": was, "in_play_after": now,
                    "changed": was != now, "world_context": ctx,
                    "request_file": filename}
        except Exception as exc:
            return {"ok": False, "verified": False, "control": name,
                    "reason": "control raised: {}".format(exc),
                    "traceback": traceback.format_exc(),
                    "request_file": filename}

    def write_result(self, filename, result_json):
        """Write atomically: a reader polling the outbox must never see a
        half-written file and parse it as a truncated result."""
        dst = os.path.join(self.outbox, filename)
        tmp = dst + ".part"
        try:
            with open(tmp, "w", encoding="utf-8") as fh:
                fh.write(result_json)
            os.replace(tmp, dst)
        except Exception as exc:
            unreal.log_error("[SuperNinja v2] cannot write {}: {}".format(dst, exc))

    def retire(self, src, dest_dir):
        try:
            dst = os.path.join(dest_dir, "{}_{}".format(
                time.strftime("%H%M%S"), os.path.basename(src)))
            shutil.move(src, dst)
        except Exception:
            try:
                os.remove(src)
            except Exception:
                pass


# =============================================================================
# Boot
# =============================================================================

unreal.log("[SuperNinja v2] Python bridge initializing...")

# Stop a previous watcher before starting a new one (hot reload safety).
_previous = globals().get(STATE_NAME) or getattr(unreal, STATE_NAME, None)
if _previous:
    try:
        _previous.stop()
    except Exception:
        pass

try:
    import superninja_bridge_v2
    try:
        import importlib
        importlib.reload(superninja_bridge_v2)
    except Exception:
        pass

    _bridge = superninja_bridge_v2.SuperNinjaBridge()
    _bridge.register()

    _dir = _resolve_bridge_dir()
    _watcher = SuperNinjaWatcher(_bridge, _dir)
    _watcher.start()

    globals()[STATE_NAME] = _watcher
    try:
        setattr(unreal, STATE_NAME, _watcher)  # survives module re-exec
    except Exception:
        pass

    import builtins
    builtins.superninja_watcher = _watcher

    unreal.log("[SuperNinja v2] bridge v{} ready. Drop a request in {}".format(
        superninja_bridge_v2.BRIDGE_VERSION, _watcher.inbox))
except Exception as _exc:
    unreal.log_error("[SuperNinja v2] bridge failed to initialize: {}\n{}".format(
        _exc, traceback.format_exc()))
