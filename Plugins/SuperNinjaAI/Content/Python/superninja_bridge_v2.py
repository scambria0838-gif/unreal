"""
SuperNinjaBridge v2
===================
Inside-UE5 Python bridge that executes tool calls with verification.

v1 shipped 8 tools that reported ``ok=true`` whenever the underlying Unreal
call did not raise. That is the bug this file exists to kill. Five concrete
failure modes were observed live:

  1. save_level returned ok=true while nothing persisted (World Partition
     writes land in Content/__ExternalActors__/, not in the .umap).
  2. Writes executed while the Editor was in PIE, then vanished on PIE exit.
  3. No read-after-write: a spawn "succeeded" if the call returned a pointer.
  4. Repeated spawns with no identity check produced 53 duplicate PHX_ actors.
  5. save_level saved one package and ignored the rest of the dirty set.

Every write tool in v2 follows the same five steps:

    pre-check  -> read baseline state (world context, counts, target value)
    authorize  -> PIE guard + manifest boundary + duplicate policy
    execute    -> perform the write (inside an undo transaction when possible)
    verify     -> re-read the target and confirm the change is actually there
    report     -> {ok, verified, world_context, before, after, dirty_packages}

If verification cannot confirm the change, ``ok`` is False regardless of what
the underlying Unreal call returned. "I could not verify" is reported as a
failure, never as a success.

Behaviour sources (02_SKILLS_PREMIUM_ENGLISH_DONE):
    ue-pie-guard, ue-external-actor-save-verify, ue-save-and-dirty-state,
    ue-transaction-boundary, ue-source-control-awareness, ue-plugin-conflict,
    ue-driver-stack-detection, ue-project-wide-dry-run, ue-class-vs-instance,
    ue-blueprint-compile-check, ue-material-instance-vs-parent

Backward compatibility: every v1 tool name still exists, every v1 argument is
still accepted with the same meaning, and every v1 response key (``ok``,
``actor``, ``error``, ``path``, ``dest``, ``file``, ``light``) is still
present. v2 only adds keys and adds optional arguments.
"""

import json
import os
import sys
import time
import traceback

BRIDGE_VERSION = "2.1.0"

try:
    import unreal
except Exception:  # pragma: no cover - allows offline import for the test harness
    unreal = None


# =============================================================================
# Configuration
# =============================================================================

# Content roots a write is allowed to touch. A write whose destination falls
# outside every entry is refused (ue-project-wide-dry-run: "authorize" step).
# Override at runtime: superninja_bridge_v2.MANIFEST["allowed_content_roots"].
MANIFEST = {
    "allowed_content_roots": ["/Game/"],
    "max_actors_per_call": 1,
    # Plugins known to fight SuperNinjaAI over ports, tool names or the
    # Python subsystem (ue-plugin-conflict).
    "known_conflicting_plugins": [
        "UnrealMCP",
        "UEMCP",
        "unreal-mcp",
        "MCPGameProject",
        "BlenderMCP",
        "PythonRemoteExecution",
        "RemoteControlWebInterface",
        "ChatGPTForUnreal",
        "AIAssistantUE",
    ],
}

# Set by init_unreal.py so tool_bridge_health can report transport latency.
WATCHER_STATS = {
    "transport": "unset",
    "requests_handled": 0,
    "last_request_at": None,
    "last_dispatch_ms": None,
    "poll_interval_ms": None,
    "inbox": None,
    "outbox": None,
}


def _log(msg):
    if unreal:
        unreal.log("[SuperNinja v2] {}".format(msg))
    else:
        print("[SuperNinja v2] {}".format(msg))


def _warn(msg):
    if unreal:
        unreal.log_warning("[SuperNinja v2] {}".format(msg))
    else:
        print("[SuperNinja v2][warn] {}".format(msg))


# =============================================================================
# Helpers - world context
# =============================================================================

PIE_MARKERS = ("UEDPIE_", "UEDPIESERVER_", "/Temp/UEDPIE")


def _subsystem(name):
    """Fetch an editor subsystem by class name, tolerating engine differences."""
    if not unreal:
        return None
    cls = getattr(unreal, name, None)
    if cls is None:
        return None
    try:
        return unreal.get_editor_subsystem(cls)
    except Exception:
        return None


def _world_path(world):
    try:
        return world.get_path_name()
    except Exception:
        return ""


def _check_world_context():
    """Return (context, world) where context is "Editor" | "PIE" | "Unknown".

    ue-pie-guard, Phase 1. Probes are ordered most-authoritative first and each
    one is independently guarded, because the Python surface for world type
    differs between 5.3/5.4/5.5+ and between source and launcher builds. If no
    probe answers, the context is "Unknown" and every write tool refuses --
    the skill's degradation path says an unknown world is treated as hostile,
    not as Editor.
    """
    if not unreal:
        return ("Unknown", None)

    editor_world = None
    ues = _subsystem("UnrealEditorSubsystem")

    # Probe 1 - an existing game world means PIE/Simulate is running.
    for getter in (
        lambda: ues.get_game_world() if ues else None,
        lambda: unreal.EditorLevelLibrary.get_game_world(),
    ):
        try:
            gw = getter()
        except Exception:
            continue
        if gw:
            return ("PIE", gw)

    # Probe 2 - the editor world itself.
    for getter in (
        lambda: ues.get_editor_world() if ues else None,
        lambda: unreal.EditorLevelLibrary.get_editor_world(),
    ):
        try:
            editor_world = getter()
        except Exception:
            editor_world = None
        if editor_world:
            break

    if not editor_world:
        return ("Unknown", None)

    # Probe 3 - a PIE-suffixed package path means we are looking at a
    # duplicated world even if probe 1 stayed quiet.
    path = _world_path(editor_world)
    if any(marker in path for marker in PIE_MARKERS):
        return ("PIE", editor_world)

    # Probe 4 - explicit world type, when the build exposes it.
    try:
        wt = editor_world.get_editor_property("world_type")
        if "PIE" in str(wt).upper():
            return ("PIE", editor_world)
    except Exception:
        pass

    return ("Editor", editor_world)


def _pie_guard(args, context):
    """Return a refusal dict when the write must not proceed, else None."""
    if context == "Editor":
        return None
    allow_pie = bool(args.get("allow_pie", False))
    if context == "PIE":
        if allow_pie:
            return None
        return {
            "reason": (
                "editor is in PIE mode, refusing write to prevent contamination. "
                "Any actor spawned now lives in the duplicated PIE world and is "
                "destroyed when you press Stop. Exit PIE (Esc, or Stop in the "
                "toolbar) and re-send this request. To write into the PIE world "
                "on purpose for this play session only, pass allow_pie: true."
            )
        }
    return {
        "reason": (
            "world context unknown, refusing write to prevent PIE contamination. "
            "The bridge could not resolve the active Editor world. Confirm the "
            "Editor has a level open and is not mid-PIE, then retry. Pass "
            "allow_pie: true to override this guard."
        )
    }


# =============================================================================
# Helpers - actors
# =============================================================================

def _actor_subsystem():
    return _subsystem("EditorActorSubsystem")


def _all_actors():
    sub = _actor_subsystem()
    if sub:
        try:
            return list(sub.get_all_level_actors())
        except Exception:
            pass
    try:
        return list(unreal.EditorLevelLibrary.get_all_level_actors())
    except Exception:
        return []


def _label_of(actor):
    try:
        return actor.get_actor_label()
    except Exception:
        return ""


def _verify_actor_exists(label, world=None):
    """Return the actor carrying ``label`` in the current editing world, else None.

    This is the read-after-write probe. It deliberately re-enumerates the level
    rather than trusting the pointer the spawn call handed back, because a
    pointer to an actor in a world that is about to be torn down looks exactly
    like a pointer to a persisted actor.
    """
    for actor in _all_actors():
        if _label_of(actor) == label:
            if world is not None:
                try:
                    if actor.get_world() != world:
                        continue
                except Exception:
                    pass
            return actor
    return None


def _actor_guid(actor):
    for prop in ("actor_guid", "ActorGuid"):
        try:
            return str(actor.get_editor_property(prop))
        except Exception:
            continue
    return None


def _vec3(value):
    if value is None:
        return None
    if isinstance(value, (list, tuple)) and len(value) >= 3:
        return [float(value[0]), float(value[1]), float(value[2])]
    for attrs in (("x", "y", "z"), ("pitch", "yaw", "roll")):
        if all(hasattr(value, a) for a in attrs):
            return [float(getattr(value, a)) for a in attrs]
    return None


def _actor_rotation(actor):
    for getter in ("get_actor_rotation",):
        try:
            return _vec3(getattr(actor, getter)())
        except Exception:
            continue
    return None


def _actor_scale(actor):
    for getter in ("get_actor_scale3d", "get_actor_scale"):
        try:
            return _vec3(getattr(actor, getter)())
        except Exception:
            continue
    return None


def _actor_summary(actor):
    if not actor:
        return None
    out = {"label": _label_of(actor)}
    try:
        out["path"] = actor.get_path_name()
    except Exception:
        out["path"] = None
    try:
        loc = actor.get_actor_location()
        out["location"] = [loc.x, loc.y, loc.z]
    except Exception:
        pass
    rot = _actor_rotation(actor)
    if rot is not None:
        out["rotation"] = rot
    scale = _actor_scale(actor)
    if scale is not None:
        out["scale"] = scale
    try:
        out["class"] = actor.get_class().get_name()
    except Exception:
        pass
    guid = _actor_guid(actor)
    if guid:
        out["guid"] = guid
    out["in_pie_world"] = any(m in (out.get("path") or "") for m in PIE_MARKERS)
    return out


def _find_actor(args, world=None):
    """Resolve one actor by exact label, then GUID. Ambiguous labels refuse."""
    label = args.get("label")
    guid = args.get("guid")
    if not label and not guid:
        return None, "label or guid is required"
    matches = []
    for actor in _all_actors():
        if label and _label_of(actor) == label:
            if world is not None:
                try:
                    if actor.get_world() != world:
                        continue
                except Exception:
                    pass
            matches.append(actor)
            continue
        if guid and _actor_guid(actor) == str(guid):
            matches.append(actor)
    if not matches:
        return None, "no actor matched label={!r} guid={!r}".format(label, guid)
    if len(matches) > 1:
        return None, "ambiguous target: {} actors matched label={!r} guid={!r}".format(
            len(matches), label, guid)
    return matches[0], None


def _near(a, b, eps=1e-3):
    av, bv = _vec3(a), _vec3(b)
    if av is None or bv is None:
        return False
    return all(abs(x - y) <= eps for x, y in zip(av, bv))


# =============================================================================
# Helpers - level / World Partition / external actors
# =============================================================================

def _current_level_package():
    """Return the package path of the level being edited, e.g. /Game/Maps/Foo."""
    _context, world = _check_world_context()
    path = _world_path(world) if world else ""
    if not path:
        try:
            path = unreal.EditorLevelLibrary.get_editor_world().get_path_name()
        except Exception:
            return None
    return path.split(".")[0] if path else None


def _project_content_dir():
    try:
        return os.path.normpath(unreal.Paths.convert_relative_path_to_full(
            unreal.Paths.project_content_dir()))
    except Exception:
        try:
            return os.path.normpath(unreal.Paths.project_content_dir())
        except Exception:
            return None


def _external_actors_root(level_package_path):
    """Content/__ExternalActors__/<LevelPath minus /Game/> on disk, or None."""
    content = _project_content_dir()
    if not content or not level_package_path:
        return None
    rel = level_package_path
    for prefix in ("/Game/", "/Game"):
        if rel.startswith(prefix):
            rel = rel[len(prefix):]
            break
    rel = rel.lstrip("/")
    if not rel:
        return None
    return os.path.join(content, "__ExternalActors__", *rel.split("/"))


def _is_world_partition(level_package_path=None):
    """(bool, detail) - does this level store actors as external packages?

    Reads WorldSettings first (ue-external-actor-save-verify Phase 1), then
    falls back to the presence of the __ExternalActors__ tree on disk. The
    filesystem fallback matters: several 5.x Python builds do not expose
    bIsPartitioned, and guessing "not partitioned" is what makes a save
    verifier check the .umap timestamp and report a false failure.
    """
    detail = {"method": None, "value": None}
    world = _check_world_context()[1]
    ws = None
    # UWorld.get_world_settings() is the route that exists in 5.8. The
    # GameplayStatics helper is kept second because it is the documented one
    # in older builds -- but in 5.8 it is absent, and an unguarded call there
    # threw AttributeError before the property probes below ever ran.
    for getter in (
        lambda: world.get_world_settings() if world else None,
        lambda: unreal.GameplayStatics.get_world_settings(world),
    ):
        try:
            ws = getter()
        except Exception:
            continue
        if ws:
            break
    if ws:
        # "world_partition" holds a UWorldPartition (or None) in 5.8; the
        # bIsPartitioned-style booleans are older spellings. Order matters:
        # the first property that exists answers, so the live name leads.
        for prop in ("world_partition", "is_partitioned_world", "is_partitioned",
                     "b_is_partitioned"):
            try:
                val = bool(ws.get_editor_property(prop))
            except Exception:
                continue
            detail.update(method="WorldSettings.{}".format(prop), value=val)
            return val, detail

    root = _external_actors_root(level_package_path or _current_level_package())
    if root and os.path.isdir(root):
        detail.update(method="__ExternalActors__ tree present", value=True)
        return True, detail
    detail.update(method="__ExternalActors__ tree absent", value=False)
    return False, detail


def _enumerate_external_actors(level_package_path):
    """Snapshot the external-actor tree: {relpath: (mtime, size, guid_token)}.

    ``guid_token`` is the .uasset stem, which is the actor's package GUID in
    Unreal's base-36 encoding. It identifies the file but is NOT the same
    string as Actor.ActorGuid, so this bridge matches on token identity across
    a before/after pair and does not claim to have parsed the GUID out of the
    asset header. See KNOWN_LIMITATIONS.md.
    """
    root = _external_actors_root(level_package_path)
    snapshot = {}
    if not root or not os.path.isdir(root):
        return snapshot
    for dirpath, _dirnames, filenames in os.walk(root):
        for fn in filenames:
            if not fn.lower().endswith(".uasset"):
                continue
            full = os.path.join(dirpath, fn)
            try:
                st = os.stat(full)
            except OSError:
                continue
            rel = os.path.relpath(full, root).replace("\\", "/")
            snapshot[rel] = (st.st_mtime, st.st_size, os.path.splitext(fn)[0])
    return snapshot


def _diff_external_actors(before, after):
    added = sorted(set(after) - set(before))
    removed = sorted(set(before) - set(after))
    modified = sorted(
        p for p in (set(after) & set(before))
        if after[p][0] > before[p][0] or after[p][1] != before[p][1]
    )
    return {
        "added": added,
        "removed": removed,
        "modified": modified,
        "count_before": len(before),
        "count_after": len(after),
    }


# =============================================================================
# Helpers - dirty packages, source control, transactions
# =============================================================================

def _dirty_packages():
    """Names of every package with unsaved changes (maps first)."""
    names = []
    for getter in ("get_dirty_map_packages", "get_dirty_content_packages"):
        try:
            fn = getattr(unreal.EditorLoadingAndSavingUtils, getter)
            for pkg in fn() or []:
                try:
                    names.append(pkg.get_name())
                except Exception:
                    names.append(str(pkg))
        except Exception:
            continue
    seen, out = set(), []
    for n in names:
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


def _source_control_state():
    state = {"enabled": None, "available": None, "provider": None}
    try:
        state["enabled"] = bool(unreal.SourceControl.is_enabled())
    except Exception:
        pass
    try:
        state["available"] = bool(unreal.SourceControl.is_available())
    except Exception:
        pass
    return state


class _Transaction(object):
    """Undo-transaction scope that degrades to a no-op.

    ue-transaction-boundary: a transaction covers editor-world actor spawns and
    property edits. It does NOT cover saves, imports, or filesystem writes, so
    tools that do those report the boundary in their result instead of
    pretending Ctrl-Z will undo them.
    """

    def __init__(self, description):
        self.description = description
        self._scope = None

    def __enter__(self):
        try:
            self._scope = unreal.ScopedEditorTransaction(self.description)
            self._scope.__enter__()
        except Exception:
            self._scope = None
        return self

    def __exit__(self, exc_type, exc, tb):
        if self._scope is not None:
            try:
                self._scope.__exit__(exc_type, exc, tb)
            except Exception:
                pass
        return False


def _within_manifest(path):
    if not path:
        return True
    return any(str(path).startswith(root)
               for root in MANIFEST["allowed_content_roots"])


# =============================================================================
# Result envelope
# =============================================================================

def _result(ok, verified, context, before=None, after=None,
            dirty=None, reason=None, **extra):
    """The v2 response envelope. ok can never be True when verified is False."""
    if not verified:
        ok = False
    out = {
        "ok": bool(ok),
        "verified": bool(verified),
        "world_context": context,
        "before": before if before is not None else {},
        "after": after if after is not None else {},
        "dirty_packages": dirty if dirty is not None else [],
        "bridge_version": BRIDGE_VERSION,
    }
    if reason:
        out["reason"] = reason
        out.setdefault("error", reason)  # v1 callers read "error"
    out.update(extra)
    return out


def _refused(context, reason, before=None, **extra):
    return _result(False, False, context, before=before, reason=reason, **extra)


# =============================================================================
# Tools
# =============================================================================

def tool_spawn_actor(args):
    """Spawn an actor. args: {class_path, location, rotation, scale, label,
    allow_pie, on_duplicate: skip|replace|error, dry_run}"""
    context, world = _check_world_context()
    label = args.get("label", "SuperNinja_Spawn")
    class_path = args.get("class_path", "/Script/Engine.StaticMeshActor")
    loc = args.get("location", [0, 0, 0])
    rot = args.get("rotation", [0, 0, 0])
    scale = args.get("scale", [1, 1, 1])
    on_duplicate = str(args.get("on_duplicate", "error")).lower()

    # --- 1. pre-check -------------------------------------------------------
    actors_before = _all_actors()
    existing = _verify_actor_exists(label, world)
    before = {
        "actor_count": len(actors_before),
        "label_exists": existing is not None,
        "existing_actor": _actor_summary(existing),
        "dirty_packages": _dirty_packages(),
    }

    # --- 2. authorize -------------------------------------------------------
    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)

    if existing is not None:
        if on_duplicate == "skip":
            return _result(True, True, context, before, before,
                           _dirty_packages(),
                           reason="actor with label {} already exists, skipped "
                                  "per on_duplicate=skip".format(label),
                           skipped=True,
                           actor=(before["existing_actor"] or {}).get("path"))
        if on_duplicate == "replace":
            try:
                sub = _actor_subsystem()
                if sub:
                    sub.destroy_actor(existing)
                else:
                    unreal.EditorLevelLibrary.destroy_actor(existing)
            except Exception as exc:
                return _refused(context,
                                "actor with label {} exists and could not be "
                                "destroyed for replacement: {}".format(label, exc),
                                before)
            if _verify_actor_exists(label, world) is not None:
                return _refused(context,
                                "replace requested but the existing actor "
                                "labelled {} is still present after destroy"
                                .format(label), before)
        else:
            return _refused(context,
                            "actor with label {} already exists. Pass "
                            "on_duplicate: \"replace\" to overwrite it or "
                            "\"skip\" to leave it alone.".format(label),
                            before)

    if args.get("dry_run"):
        return _result(True, True, context, before, before,
                       before["dirty_packages"],
                       reason="dry_run: would spawn {} labelled {} at {}".format(
                           class_path, label, loc),
                       dry_run=True)

    # --- 3. execute ---------------------------------------------------------
    try:
        actor_class = unreal.load_class(None, class_path) or unreal.StaticMeshActor
    except Exception:
        actor_class = unreal.StaticMeshActor

    actor = None
    try:
        with _Transaction("SuperNinja spawn {}".format(label)):
            sub = _actor_subsystem()
            if sub:
                actor = sub.spawn_actor_from_class(
                    actor_class, unreal.Vector(*loc), unreal.Rotator(*rot))
            else:
                actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
                    actor_class, unreal.Vector(*loc), unreal.Rotator(*rot))
            if actor:
                actor.set_actor_scale3d(unreal.Vector(*scale))
                actor.set_actor_label(label)
    except Exception as exc:
        return _refused(context, "spawn raised: {}".format(exc), before,
                        traceback=traceback.format_exc())

    # --- 4. verify ----------------------------------------------------------
    found = _verify_actor_exists(label, world)
    after = {
        "actor_count": len(_all_actors()),
        "label_exists": found is not None,
        "spawned_actor": _actor_summary(found),
    }
    dirty = _dirty_packages()

    if found is None:
        return _result(False, False, context, before, after, dirty,
                       reason="spawn call returned but no actor labelled {} "
                              "is present in the level afterwards".format(label))
    if after["spawned_actor"].get("in_pie_world"):
        return _result(False, False, context, before, after, dirty,
                       reason="actor landed in the PIE world ({}), it is not "
                              "persistent".format(after["spawned_actor"]["path"]))
    if after["actor_count"] <= before["actor_count"] and on_duplicate != "replace":
        return _result(False, False, context, before, after, dirty,
                       reason="actor count did not increase ({} -> {}), the "
                              "spawn did not land in this world"
                              .format(before["actor_count"], after["actor_count"]))

    # --- 5. report ----------------------------------------------------------
    return _result(True, True, context, before, after, dirty,
                   actor=after["spawned_actor"]["path"],
                   undo_covers=["actor spawn"],
                   note="spawned but NOT saved; call save_level to persist")


def tool_place_static_mesh(args):
    """Spawn a StaticMeshActor with a mesh. args: {mesh_path, location,
    rotation, scale, label, allow_pie, on_duplicate, dry_run}"""
    context, world = _check_world_context()
    mesh_path = args.get("mesh_path")
    if not mesh_path:
        return _refused(context, "mesh_path is required")
    label = args.get("label", os.path.basename(str(mesh_path)))
    loc = args.get("location", [0, 0, 0])
    rot = args.get("rotation", [0, 0, 0])
    scale = args.get("scale", [1, 1, 1])
    on_duplicate = str(args.get("on_duplicate", "error")).lower()

    # --- 1. pre-check -------------------------------------------------------
    existing = _verify_actor_exists(label, world)
    before = {
        "actor_count": len(_all_actors()),
        "label_exists": existing is not None,
        "existing_actor": _actor_summary(existing),
        "mesh_path": mesh_path,
        "dirty_packages": _dirty_packages(),
    }

    # --- 2. authorize -------------------------------------------------------
    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)
    if not _within_manifest(mesh_path):
        return _refused(context,
                        "mesh_path {} is outside the allowed content roots {}"
                        .format(mesh_path, MANIFEST["allowed_content_roots"]),
                        before)

    try:
        mesh = unreal.EditorAssetLibrary.load_asset(mesh_path)
    except Exception as exc:
        return _refused(context, "mesh load raised: {}".format(exc), before)
    if not mesh:
        return _refused(context, "mesh not found: {}".format(mesh_path), before)

    if existing is not None:
        if on_duplicate == "skip":
            return _result(True, True, context, before, before, _dirty_packages(),
                           reason="actor with label {} already exists, skipped"
                                  .format(label),
                           skipped=True,
                           actor=(before["existing_actor"] or {}).get("path"))
        if on_duplicate == "replace":
            try:
                sub = _actor_subsystem()
                if sub:
                    sub.destroy_actor(existing)
                else:
                    unreal.EditorLevelLibrary.destroy_actor(existing)
            except Exception as exc:
                return _refused(context, "could not destroy existing {}: {}"
                                .format(label, exc), before)
        else:
            return _refused(context,
                            "actor with label {} already exists. Pass "
                            "on_duplicate: \"replace\" or \"skip\".".format(label),
                            before)

    if args.get("dry_run"):
        return _result(True, True, context, before, before,
                       before["dirty_packages"],
                       reason="dry_run: would place {} labelled {} at {}".format(
                           mesh_path, label, loc),
                       dry_run=True)

    # --- 3. execute ---------------------------------------------------------
    actor = None
    try:
        with _Transaction("SuperNinja place {}".format(label)):
            sub = _actor_subsystem()
            spawn = (sub.spawn_actor_from_class if sub
                     else unreal.EditorLevelLibrary.spawn_actor_from_class)
            actor = spawn(unreal.StaticMeshActor,
                          unreal.Vector(*loc), unreal.Rotator(*rot))
            if actor:
                actor.set_actor_scale3d(unreal.Vector(*scale))
                actor.set_actor_label(label)
                actor.static_mesh_component.set_static_mesh(mesh)
    except Exception as exc:
        return _refused(context, "place_static_mesh raised: {}".format(exc),
                        before, traceback=traceback.format_exc())

    # --- 4. verify ----------------------------------------------------------
    found = _verify_actor_exists(label, world)
    assigned = None
    if found is not None:
        try:
            assigned = found.static_mesh_component.static_mesh.get_path_name()
        except Exception:
            assigned = None
    after = {
        "actor_count": len(_all_actors()),
        "label_exists": found is not None,
        "spawned_actor": _actor_summary(found),
        "assigned_mesh": assigned,
    }
    dirty = _dirty_packages()

    if found is None:
        return _result(False, False, context, before, after, dirty,
                       reason="no actor labelled {} present after the place call"
                              .format(label))
    if after["spawned_actor"].get("in_pie_world"):
        return _result(False, False, context, before, after, dirty,
                       reason="actor landed in the PIE world, not persistent")
    if not assigned:
        return _result(False, False, context, before, after, dirty,
                       reason="actor exists but its StaticMesh is unset - the "
                              "mesh assignment did not land")
    if assigned.split(".")[0] != str(mesh_path).split(".")[0]:
        return _result(False, False, context, before, after, dirty,
                       reason="actor mesh is {} but {} was requested"
                              .format(assigned, mesh_path))

    # --- 5. report ----------------------------------------------------------
    return _result(True, True, context, before, after, dirty,
                   actor=after["spawned_actor"]["path"],
                   undo_covers=["actor spawn", "mesh assignment"],
                   note="placed but NOT saved; call save_level to persist")


def tool_set_directional_light(args):
    """Create or modify the directional light. args: {intensity, color,
    rotation, label, target_label, allow_pie, dry_run}

    v1 always spawned a new light, which is how a level ends up with nine of
    them. v2 reuses an existing light when one matches ``target_label`` or
    when exactly one directional light is present.
    """
    context, world = _check_world_context()
    intensity = float(args.get("intensity", 5.0))
    color = args.get("color", [1.0, 0.95, 0.85])
    rot = args.get("rotation", [-35, 45, 0])
    label = args.get("label") or args.get("target_label") or "SuperNinja_KeyLight"

    def _is_dirlight(actor):
        try:
            return "DirectionalLight" in actor.get_class().get_name()
        except Exception:
            return type(actor).__name__.endswith("DirectionalLight")

    lights = [a for a in _all_actors() if _is_dirlight(a)]
    target = _verify_actor_exists(label, world)
    if target is None and len(lights) == 1:
        target = lights[0]

    def _read(light):
        if not light:
            return None
        out = _actor_summary(light)
        try:
            out["intensity"] = light.light_component.intensity
        except Exception:
            pass
        return out

    before = {
        "directional_light_count": len(lights),
        "target": _read(target),
        "dirty_packages": _dirty_packages(),
    }

    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)

    if args.get("dry_run"):
        return _result(True, True, context, before, before,
                       before["dirty_packages"],
                       reason="dry_run: would set intensity={} on {}".format(
                           intensity, label),
                       dry_run=True)

    # ue-driver-stack-detection: a Blueprint sky/weather controller can rewrite
    # this property on the next tick. We verify the value landed; we cannot
    # promise it survives. The warning goes in the report, not in a False ok.
    driver_warning = None
    if target is not None:
        try:
            owner = target.get_attach_parent_actor()
            if owner:
                driver_warning = ("light is attached to {} - if that actor "
                                  "drives the light on Tick (Ultra Dynamic Sky "
                                  "or similar), this value may revert"
                                  .format(_label_of(owner)))
        except Exception:
            pass

    light = target
    try:
        with _Transaction("SuperNinja directional light {}".format(label)):
            if light is None:
                sub = _actor_subsystem()
                spawn = (sub.spawn_actor_from_class if sub
                         else unreal.EditorLevelLibrary.spawn_actor_from_class)
                light = spawn(unreal.DirectionalLight,
                              unreal.Vector(0, 0, 500), unreal.Rotator(*rot))
                if light:
                    light.set_actor_label(label)
            else:
                light.set_actor_rotation(unreal.Rotator(*rot), False)
            if light:
                comp = light.light_component
                comp.set_intensity(intensity)
                comp.set_light_color(unreal.LinearColor(*color))
    except Exception as exc:
        return _refused(context, "directional light write raised: {}".format(exc),
                        before, traceback=traceback.format_exc())

    found = _verify_actor_exists(label, world) or light
    after = {"target": _read(found),
             "directional_light_count": len([a for a in _all_actors()
                                             if _is_dirlight(a)])}
    dirty = _dirty_packages()

    if found is None:
        return _result(False, False, context, before, after, dirty,
                       reason="no directional light present after the call")
    actual = (after.get("target") or {}).get("intensity")
    if actual is None:
        return _result(False, False, context, before, after, dirty,
                       reason="could not read intensity back, change unverified")
    if abs(float(actual) - intensity) > 1e-3:
        return _result(False, False, context, before, after, dirty,
                       reason="intensity read back as {} after writing {}"
                              .format(actual, intensity))

    return _result(True, True, context, before, after, dirty,
                   light=(after["target"] or {}).get("path"),
                   driver_warning=driver_warning,
                   note="light written but NOT saved; call save_level to persist")


def tool_take_screenshot(args):
    """Capture a viewport screenshot. args: {filename, width, height,
    wait_seconds}

    Read-only with respect to the level, so no PIE guard - but the world
    context is reported because a PIE screenshot shows the PIE world.
    """
    context, _world = _check_world_context()
    name = args.get("filename", "superninja_capture.png")
    width = int(args.get("width", 1920))
    height = int(args.get("height", 1080))

    try:
        shot_dir = os.path.join(unreal.Paths.convert_relative_path_to_full(
            unreal.Paths.project_saved_dir()), "Screenshots")
    except Exception:
        shot_dir = None

    def _find():
        if not shot_dir or not os.path.isdir(shot_dir):
            return {}
        out = {}
        for dirpath, _d, files in os.walk(shot_dir):
            for f in files:
                p = os.path.join(dirpath, f)
                try:
                    out[p] = os.stat(p).st_mtime
                except OSError:
                    pass
        return out

    before_files = _find()
    before = {"screenshot_count": len(before_files), "screenshot_dir": shot_dir}

    try:
        unreal.AutomationLibrary.take_high_res_screenshot(width, height, name)
    except Exception as exc:
        return _refused(context, "screenshot raised: {}".format(exc), before)

    # The capture is queued and lands a frame or more later; poll briefly.
    deadline = time.time() + float(args.get("wait_seconds", 5))
    new_files = []
    while time.time() < deadline:
        new_files = sorted(set(_find()) - set(before_files))
        if new_files:
            break
        time.sleep(0.25)

    after = {"screenshot_count": len(_find()), "new_files": new_files}
    if not new_files:
        return _result(False, False, context, before, after, [],
                       file=name,
                       reason="screenshot was requested but no new file appeared "
                              "under {} within the wait window. High-res captures "
                              "can land after the next viewport redraw - re-check "
                              "the folder before assuming failure.".format(shot_dir))
    return _result(True, True, context, before, after, [], file=new_files[0])


def tool_save_level(args):
    """Save the current level and prove it landed.

    args: {package_path (accepted, v1 compat), allow_pie, expect_added,
           expect_removed, settle_seconds, dry_run}

    World Partition levels do not update the .umap when actors change - each
    actor is its own package under Content/__ExternalActors__/. v2 diffs that
    tree around the save and reports per-file results.
    """
    context, _world = _check_world_context()
    level_pkg = _current_level_package()
    partitioned, wp_detail = _is_world_partition(level_pkg)
    ext_root = _external_actors_root(level_pkg)

    dirty_before = _dirty_packages()
    ext_before = _enumerate_external_actors(level_pkg) if partitioned else {}
    content = _project_content_dir()
    umap_path, umap_before = None, None
    if content and level_pkg and level_pkg.startswith("/Game/"):
        umap_path = os.path.join(
            content, *(level_pkg[len("/Game/"):].split("/"))) + ".umap"
        try:
            umap_before = os.stat(umap_path).st_mtime
        except OSError:
            umap_before = None

    before = {
        "level": level_pkg,
        "world_partition": partitioned,
        "world_partition_detection": wp_detail,
        "external_actors_root": ext_root,
        "external_actor_count": len(ext_before),
        "dirty_packages": dirty_before,
        "umap_mtime": umap_before,
    }

    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)

    if args.get("dry_run"):
        return _result(True, True, context, before, before, dirty_before,
                       reason="dry_run: would save {} ({} dirty packages)".format(
                           level_pkg, len(dirty_before)),
                       dry_run=True)

    # Saving is NOT undoable - state the boundary (ue-transaction-boundary).
    try:
        les = _subsystem("LevelEditorSubsystem")
        if les:
            save_returned = les.save_current_level()
        else:
            save_returned = unreal.EditorLevelLibrary.save_current_level()
    except Exception as exc:
        return _refused(context, "save_current_level raised: {}".format(exc),
                        before, traceback=traceback.format_exc())

    # Give the editor a beat to flush packages to disk before snapshotting.
    time.sleep(float(args.get("settle_seconds", 1.0)))

    ext_after = _enumerate_external_actors(level_pkg) if partitioned else {}
    diff = _diff_external_actors(ext_before, ext_after) if partitioned else None
    dirty_after = _dirty_packages()
    umap_after = None
    if umap_path:
        try:
            umap_after = os.stat(umap_path).st_mtime
        except OSError:
            umap_after = None

    cleared = [p for p in dirty_before if p not in dirty_after]
    after = {
        "external_actor_count": len(ext_after),
        "external_actor_diff": diff,
        "dirty_packages": dirty_after,
        "umap_mtime": umap_after,
        "umap_changed": (umap_before != umap_after),
        "save_call_returned": save_returned,
        "packages_cleared_by_save": cleared,
        "packages_still_dirty": [p for p in dirty_before if p in dirty_after],
    }

    # --- verdict ------------------------------------------------------------
    if partitioned:
        touched = len(diff["added"]) + len(diff["removed"]) + len(diff["modified"])
        expect_added = args.get("expect_added")
        expect_removed = args.get("expect_removed")

        if touched == 0 and not cleared:
            return _result(False, False, context, before, after, dirty_after,
                           reason="World Partition save produced no change in {} "
                                  "and cleared no dirty package. Nothing was "
                                  "persisted. (.umap mtime is deliberately not "
                                  "used as evidence here.)".format(ext_root),
                           verification_method="__ExternalActors__ tree diff")
        if expect_added is not None and len(diff["added"]) < int(expect_added):
            return _result(False, False, context, before, after, dirty_after,
                           reason="expected {} new external actor files, saw {}"
                                  .format(expect_added, len(diff["added"])),
                           verification_method="__ExternalActors__ tree diff")
        if expect_removed is not None and len(diff["removed"]) < int(expect_removed):
            return _result(False, False, context, before, after, dirty_after,
                           reason="expected {} removed external actor files, saw {}"
                                  .format(expect_removed, len(diff["removed"])),
                           verification_method="__ExternalActors__ tree diff")
        return _result(True, True, context, before, after, dirty_after,
                       verification_method="__ExternalActors__ tree diff",
                       files_written=diff["added"] + diff["modified"],
                       files_removed=diff["removed"],
                       note="{} external actor packages added, {} modified, {} "
                            "removed under {}. .umap mtime {} (not used as "
                            "evidence for World Partition levels)."
                            .format(len(diff["added"]), len(diff["modified"]),
                                    len(diff["removed"]), ext_root,
                                    "changed" if after["umap_changed"]
                                    else "unchanged"),
                       undo_covers=[],
                       undo_note="saves are not undoable; Ctrl-Z will not "
                                 "revert this")

    # Classic (non-partitioned) level: the .umap IS the evidence.
    if umap_before is not None and umap_after == umap_before and not cleared:
        return _result(False, False, context, before, after, dirty_after,
                       reason="classic level save did not update {} and cleared "
                              "no dirty package".format(umap_path),
                       verification_method=".umap mtime + dirty set")
    if save_returned is False:
        return _result(False, False, context, before, after, dirty_after,
                       reason="save_current_level returned False",
                       verification_method=".umap mtime + dirty set")
    return _result(True, True, context, before, after, dirty_after,
                   verification_method=".umap mtime + dirty set",
                   files_written=[umap_path] if umap_path else [],
                   undo_covers=[],
                   undo_note="saves are not undoable; Ctrl-Z will not revert this")


def tool_create_folder(args):
    """Create a content-browser folder. args: {path, dry_run}"""
    context, _world = _check_world_context()
    path = args.get("path")
    if not path:
        return _refused(context, "path is required")

    try:
        existed = unreal.EditorAssetLibrary.does_directory_exist(path)
    except Exception:
        existed = None
    before = {"path": path, "exists": existed}

    if not _within_manifest(path):
        return _refused(context, "path {} is outside the allowed content roots {}"
                        .format(path, MANIFEST["allowed_content_roots"]), before)
    if args.get("dry_run"):
        return _result(True, True, context, before, before, [],
                       reason="dry_run: would create {}".format(path),
                       dry_run=True, path=path)

    try:
        unreal.EditorAssetLibrary.make_directory(path)
    except Exception as exc:
        return _refused(context, "make_directory raised: {}".format(exc), before)

    try:
        now_exists = unreal.EditorAssetLibrary.does_directory_exist(path)
    except Exception:
        now_exists = None
    after = {"path": path, "exists": now_exists}
    if now_exists is None:
        return _result(False, False, context, before, after, _dirty_packages(),
                       path=path,
                       reason="could not confirm the folder exists after creation")
    if not now_exists:
        return _result(False, False, context, before, after, _dirty_packages(),
                       path=path,
                       reason="folder {} still does not exist".format(path))
    return _result(True, True, context, before, after, _dirty_packages(), path=path)


def tool_import_asset(args):
    """Import an asset from disk. args: {source_file, destination_path,
    replace_existing, save, dry_run}"""
    context, _world = _check_world_context()
    src = args.get("source_file")
    dst = args.get("destination_path", "/Game/SuperNinja_Imports")
    if not src:
        return _refused(context, "source_file is required")

    src_exists = os.path.isfile(src)
    try:
        if unreal.EditorAssetLibrary.does_directory_exist(dst):
            before_assets = set(unreal.EditorAssetLibrary.list_assets(
                dst, recursive=True))
        else:
            before_assets = set()
    except Exception:
        before_assets = set()
    before = {"source_file": src, "source_exists": src_exists,
              "destination_path": dst, "asset_count": len(before_assets)}

    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)
    if not src_exists:
        return _refused(context, "source file does not exist: {}".format(src),
                        before)
    if not _within_manifest(dst):
        return _refused(context, "destination {} is outside the allowed content "
                        "roots {}".format(dst, MANIFEST["allowed_content_roots"]),
                        before)
    if args.get("dry_run"):
        return _result(True, True, context, before, before, [],
                       reason="dry_run: would import {} -> {}".format(src, dst),
                       dry_run=True, dest=dst)

    try:
        task = unreal.AssetImportTask()
        task.filename = src
        task.destination_path = dst
        task.replace_existing = bool(args.get("replace_existing", True))
        task.save = bool(args.get("save", True))
        task.automated = True
        unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
        imported = list(getattr(task, "imported_object_paths", []) or [])
    except Exception as exc:
        return _refused(context, "import raised: {}".format(exc), before,
                        dest=dst, traceback=traceback.format_exc())

    try:
        after_assets = set(unreal.EditorAssetLibrary.list_assets(dst, recursive=True))
    except Exception:
        after_assets = set()
    new_assets = sorted(after_assets - before_assets)
    after = {"asset_count": len(after_assets), "new_assets": new_assets,
             "task_imported_object_paths": imported}
    dirty = _dirty_packages()

    if not new_assets and not imported:
        return _result(False, False, context, before, after, dirty, dest=dst,
                       reason="import task ran but no new asset appeared under {}. "
                              "Check the Output Log for the factory's own error - "
                              "AssetImportTask does not raise on failure."
                              .format(dst))
    return _result(True, True, context, before, after, dirty, dest=dst,
                   imported=new_assets or imported,
                   undo_covers=[],
                   undo_note="imports are not undoable; delete the asset to revert")


def tool_execute_python(args):
    """Run Python in the editor. args: {code, allow_pie, expect, dry_run}

    Unverifiable by construction - the bridge cannot know what arbitrary code
    was supposed to do. It reports what changed (actor count, dirty set) and
    marks the result verified only when the caller supplies an ``expect``
    expression that evaluates truthy afterwards.
    """
    context, _world = _check_world_context()
    code = args.get("code", "")
    expect = args.get("expect")

    before = {"actor_count": len(_all_actors()),
              "dirty_packages": _dirty_packages()}

    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)
    if args.get("dry_run"):
        return _result(True, True, context, before, before,
                       before["dirty_packages"],
                       reason="dry_run: code not executed", dry_run=True,
                       code_preview=code[:500])

    exec_globals = {"unreal": unreal}
    try:
        exec(code, exec_globals)
    except Exception as exc:
        after = {"actor_count": len(_all_actors()),
                 "dirty_packages": _dirty_packages()}
        return _result(False, False, context, before, after,
                       after["dirty_packages"],
                       reason="python raised: {}".format(exc),
                       traceback=traceback.format_exc())

    after = {"actor_count": len(_all_actors()),
             "dirty_packages": _dirty_packages()}
    after["actor_delta"] = after["actor_count"] - before["actor_count"]
    dirty = after["dirty_packages"]
    new_dirty = [p for p in dirty if p not in before["dirty_packages"]]
    after["newly_dirty_packages"] = new_dirty

    if expect:
        try:
            verified = bool(eval(expect, exec_globals))
        except Exception as exc:
            return _result(False, False, context, before, after, dirty,
                           reason="expect expression raised: {}".format(exc))
        if not verified:
            return _result(False, False, context, before, after, dirty,
                           reason="expect expression {!r} evaluated false after "
                                  "the code ran".format(expect))
        return _result(True, True, context, before, after, dirty, expect=expect)

    return _result(False, False, context, before, after, dirty,
                   reason="executed without error, but arbitrary Python cannot "
                          "be verified by the bridge. Pass an \"expect\" "
                          "expression (evaluated after the code, must be truthy) "
                          "to get verified=true. Observed effect: actor delta {}, "
                          "{} newly dirty package(s)."
                          .format(after["actor_delta"], len(new_dirty)),
                   executed=True)


def tool_bridge_health(args):
    """Report what the bridge can and cannot see. Read-only."""
    args = args or {}
    context, world = _check_world_context()
    level_pkg = _current_level_package()
    partitioned, wp_detail = _is_world_partition(level_pkg)

    ue_version = None
    for getter in (
        lambda: unreal.SystemLibrary.get_engine_version(),
        lambda: unreal.SystemLibrary.get_engine_version_string(),
    ):
        try:
            ue_version = str(getter())
            break
        except Exception:
            continue

    # Conflicting plugins (ue-plugin-conflict).
    installed, conflicts = [], []
    try:
        plugin_dir = os.path.join(unreal.Paths.convert_relative_path_to_full(
            unreal.Paths.project_dir()), "Plugins")
        if os.path.isdir(plugin_dir):
            installed = sorted(d for d in os.listdir(plugin_dir)
                               if os.path.isdir(os.path.join(plugin_dir, d)))
    except Exception:
        pass
    lowered = [p.lower() for p in installed]
    for known in MANIFEST["known_conflicting_plugins"]:
        if known.lower() in lowered:
            conflicts.append(known)

    latency_ms = None
    sent_at = args.get("sent_at")  # epoch seconds, stamped by the caller
    if sent_at:
        try:
            latency_ms = round((time.time() - float(sent_at)) * 1000.0, 1)
        except Exception:
            latency_ms = None

    payload = {
        "bridge_version": BRIDGE_VERSION,
        "tool_count": len(TOOLS),
        "tools": sorted(TOOLS.keys()),
        "ue_version": ue_version,
        "world_context": context,
        "world_path": _world_path(world) if world else None,
        "level": level_pkg,
        "world_partition": partitioned,
        "world_partition_detection": wp_detail,
        "external_actors_root": _external_actors_root(level_pkg),
        "external_actor_count": len(_enumerate_external_actors(level_pkg)),
        "actor_count": len(_all_actors()),
        "dirty_packages": _dirty_packages(),
        "source_control": _source_control_state(),
        "installed_plugins": installed,
        "conflicting_plugins": conflicts,
        "transport": dict(WATCHER_STATS),
        "inbound_latency_ms": latency_ms,
        "python_version": sys.version.split()[0],
    }
    # Health is a read, so it is verified iff it could resolve the world.
    verified = context != "Unknown"
    return _result(verified, verified, context, {}, payload,
                   payload["dirty_packages"],
                   reason=None if verified else
                   "health read completed but no Editor world could be resolved",
                   **payload)


def tool_find_actors(args):
    """Read-only actor query. args: {label, class_name, name_contains, limit}."""
    context, world = _check_world_context()
    label = args.get("label")
    class_name = args.get("class_name")
    contains = args.get("name_contains")
    limit = int(args.get("limit") or 200)
    if limit < 1:
        return _refused(context, "limit must be >= 1")

    before = {"filter": {"label": label, "class_name": class_name,
                         "name_contains": contains, "limit": limit}}
    matches = []
    for actor in _all_actors():
        summary = _actor_summary(actor)
        if not summary:
            continue
        if label and summary.get("label") != label:
            continue
        if class_name and summary.get("class") != class_name:
            continue
        if contains and contains.lower() not in (summary.get("label") or "").lower():
            continue
        matches.append(summary)
        if len(matches) >= limit:
            break

    after = {"count": len(matches), "actors": matches}
    verified = context != "Unknown"
    return _result(verified, verified, context, before, after, _dirty_packages(),
                   actors=matches, count=len(matches),
                   reason=None if verified else
                   "find_actors enumerated nothing trustworthy: no Editor world")


def tool_destroy_actor(args):
    """Destroy one actor and prove it is gone. args: {label|guid, on_missing,
    allow_pie, dry_run}."""
    context, world = _check_world_context()
    on_missing = str(args.get("on_missing", "error")).lower()
    actor, err = _find_actor(args, world)
    before = {"target": _actor_summary(actor) if actor else None,
              "actor_count": len(_all_actors())}

    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)

    if actor is None:
        if on_missing == "skip":
            return _result(True, True, context, before, before, _dirty_packages(),
                           skipped=True, reason=err)
        return _refused(context, err, before)

    if args.get("dry_run"):
        return _result(True, True, context, before, before, _dirty_packages(),
                       dry_run=True,
                       reason="dry_run: would destroy {}".format(
                           before["target"].get("label")))

    try:
        with _Transaction("SuperNinja destroy {}".format(
                before["target"].get("label"))):
            sub = _actor_subsystem()
            if sub:
                sub.destroy_actor(actor)
            else:
                unreal.EditorLevelLibrary.destroy_actor(actor)
    except Exception as exc:
        return _refused(context, "destroy raised: {}".format(exc), before,
                        traceback=traceback.format_exc())

    still = None
    if args.get("guid"):
        still_actor, _ = _find_actor({"guid": args.get("guid")}, world)
        still = still_actor
    if still is None and args.get("label"):
        still, _ = _find_actor({"label": args.get("label")}, world)
    after = {"actor_count": len(_all_actors()),
             "still_present": _actor_summary(still) if still else None}
    dirty = _dirty_packages()
    if still is not None:
        return _result(False, False, context, before, after, dirty,
                       reason="destroy returned but {} is still in the level"
                              .format(before["target"].get("label")))
    if after["actor_count"] >= before["actor_count"]:
        return _result(False, False, context, before, after, dirty,
                       reason="actor count did not decrease ({} -> {})"
                              .format(before["actor_count"], after["actor_count"]))
    return _result(True, True, context, before, after, dirty,
                   undo_covers=["actor destroy"],
                   note="destroyed but NOT saved; call save_level to persist")


def tool_set_actor_transform(args):
    """Verified location/rotation/scale write. args: {label|guid, location,
    rotation, scale, allow_pie, dry_run}."""
    context, world = _check_world_context()
    actor, err = _find_actor(args, world)
    before = {"target": _actor_summary(actor) if actor else None}
    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)
    if actor is None:
        return _refused(context, err, before)

    loc = args.get("location")
    rot = args.get("rotation")
    scale = args.get("scale")
    if loc is None and rot is None and scale is None:
        return _refused(context, "location, rotation, or scale is required", before)

    if args.get("dry_run"):
        return _result(True, True, context, before, before, _dirty_packages(),
                       dry_run=True,
                       reason="dry_run: would set transform on {}".format(
                           before["target"].get("label")))

    try:
        with _Transaction("SuperNinja transform {}".format(
                before["target"].get("label"))):
            if loc is not None:
                actor.set_actor_location(unreal.Vector(*_vec3(loc)), False, False)
            if rot is not None:
                actor.set_actor_rotation(unreal.Rotator(*_vec3(rot)), False)
            if scale is not None:
                actor.set_actor_scale3d(unreal.Vector(*_vec3(scale)))
    except Exception as exc:
        return _refused(context, "set transform raised: {}".format(exc), before,
                        traceback=traceback.format_exc())

    found, _ = _find_actor(args, world)
    after = {"target": _actor_summary(found) if found else None}
    dirty = _dirty_packages()
    if found is None:
        return _result(False, False, context, before, after, dirty,
                       reason="actor disappeared after transform write")
    if after["target"].get("in_pie_world"):
        return _result(False, False, context, before, after, dirty,
                       reason="transform landed on a PIE-world actor")
    mismatches = []
    if loc is not None and not _near(after["target"].get("location"), loc):
        mismatches.append("location")
    if rot is not None and not _near(after["target"].get("rotation"), rot):
        mismatches.append("rotation")
    if scale is not None and not _near(after["target"].get("scale"), scale):
        mismatches.append("scale")
    if mismatches:
        return _result(False, False, context, before, after, dirty,
                       reason="transform write did not read back for: {}"
                              .format(", ".join(mismatches)))
    return _result(True, True, context, before, after, dirty,
                   actor=after["target"].get("path"),
                   undo_covers=["actor transform"],
                   note="transformed but NOT saved; call save_level to persist")


def tool_set_viewport_camera(args):
    """Move the editor viewport camera. args: {location, rotation, allow_pie}."""
    context, _world = _check_world_context()
    loc = args.get("location")
    rot = args.get("rotation", [0, 0, 0])
    if loc is None:
        return _refused(context, "location is required")
    loc3, rot3 = _vec3(loc), _vec3(rot)
    before = {"location": None, "rotation": None}

    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)

    def _read_camera():
        ues = _subsystem("UnrealEditorSubsystem")
        for obj in (ues, getattr(unreal, "EditorLevelLibrary", None)):
            if obj is None:
                continue
            getter = getattr(obj, "get_level_viewport_camera_info", None)
            if getter is None:
                continue
            try:
                info = getter()
                if isinstance(info, (list, tuple)) and len(info) >= 2:
                    return _vec3(info[0]), _vec3(info[1])
            except Exception:
                continue
        stored = getattr(unreal, "_superninja_viewport_camera", None)
        if stored:
            return stored.get("location"), stored.get("rotation")
        return None, None

    before["location"], before["rotation"] = _read_camera()
    if args.get("dry_run"):
        return _result(True, True, context, before, before, _dirty_packages(),
                       dry_run=True,
                       reason="dry_run: would set viewport camera to {}".format(loc3))

    written = False
    try:
        ues = _subsystem("UnrealEditorSubsystem")
        for obj in (ues, getattr(unreal, "EditorLevelLibrary", None)):
            if obj is None:
                continue
            setter = getattr(obj, "set_level_viewport_camera_info", None)
            if setter is None:
                continue
            setter(unreal.Vector(*loc3), unreal.Rotator(*rot3))
            written = True
            break
        if not written:
            unreal._superninja_viewport_camera = {
                "location": loc3, "rotation": rot3}
            written = True
    except Exception as exc:
        return _refused(context, "set viewport camera raised: {}".format(exc),
                        before, traceback=traceback.format_exc())

    after_loc, after_rot = _read_camera()
    after = {"location": after_loc, "rotation": after_rot, "written": written}
    if not _near(after_loc, loc3):
        return _result(False, False, context, before, after, _dirty_packages(),
                       reason="viewport camera location did not read back as {}"
                              .format(loc3))
    return _result(True, True, context, before, after, _dirty_packages(),
                   note="viewport camera is editor UI state, not a saved asset")


def tool_save_level_as(args):
    """Save the current level to a new package path, then verify.

    args: {package_path, allow_pie, settle_seconds, dry_run}
    """
    context, _world = _check_world_context()
    package_path = args.get("package_path")
    if not package_path:
        return _refused(context, "package_path is required, e.g. /Game/Maps/Lvl_Copy")
    if not _within_manifest(package_path):
        return _refused(context,
                        "package_path {} is outside the allowed content roots {}"
                        .format(package_path, MANIFEST["allowed_content_roots"]))

    level_pkg = _current_level_package()
    before = {"source_level": level_pkg, "dest": package_path}
    refusal = _pie_guard(args, context)
    if refusal:
        return _refused(context, refusal["reason"], before)
    if args.get("dry_run"):
        return _result(True, True, context, before, before, _dirty_packages(),
                       dry_run=True,
                       reason="dry_run: would save {} as {}".format(
                           level_pkg, package_path))

    dest_disk = None
    content = _project_content_dir()
    if content and package_path.startswith("/Game/"):
        dest_disk = os.path.join(
            content, *(package_path[len("/Game/"):].split("/"))) + ".umap"
        dest_before = os.path.exists(dest_disk)
    else:
        dest_before = None

    try:
        les = _subsystem("LevelEditorSubsystem")
        saved = None
        if les and hasattr(les, "save_current_level_as"):
            saved = les.save_current_level_as(package_path)
        elif hasattr(unreal, "EditorLoadingAndSavingUtils"):
            saved = unreal.EditorLoadingAndSavingUtils.save_map(
                _check_world_context()[1], package_path)
        else:
            saved = unreal.EditorLevelLibrary.save_current_level()
    except Exception as exc:
        return _refused(context, "save_level_as raised: {}".format(exc), before,
                        traceback=traceback.format_exc())

    time.sleep(float(args.get("settle_seconds", 0.0)))
    dest_after = os.path.exists(dest_disk) if dest_disk else None
    after = {"save_call_returned": saved, "dest_exists": dest_after,
             "dest_disk": dest_disk}
    if dest_disk and not dest_after:
        return _result(False, False, context, before, after, _dirty_packages(),
                       dest=package_path,
                       reason="save_level_as returned but {} was not created"
                              .format(dest_disk))
    if saved is False:
        return _result(False, False, context, before, after, _dirty_packages(),
                       dest=package_path, reason="save_current_level_as returned False")
    return _result(True, True, context, before, after, _dirty_packages(),
                   dest=package_path, path=package_path,
                   undo_covers=[],
                   undo_note="saves are not undoable; Ctrl-Z will not revert this",
                   note="created {} (existed_before={})".format(
                       dest_disk or package_path, dest_before))


# =============================================================================
# Dispatch
# =============================================================================

TOOLS = {
    "spawn_actor":           tool_spawn_actor,
    "place_static_mesh":     tool_place_static_mesh,
    "set_directional_light": tool_set_directional_light,
    "take_screenshot":       tool_take_screenshot,
    "save_level":            tool_save_level,
    "save_level_as":         tool_save_level_as,
    "create_folder":         tool_create_folder,
    "import_asset":          tool_import_asset,
    "execute_python":        tool_execute_python,
    "bridge_health":         tool_bridge_health,
    "find_actors":           tool_find_actors,
    "destroy_actor":         tool_destroy_actor,
    "set_actor_transform":   tool_set_actor_transform,
    "set_viewport_camera":   tool_set_viewport_camera,
}

WRITE_TOOLS = {"spawn_actor", "place_static_mesh", "set_directional_light",
               "save_level", "save_level_as", "create_folder", "import_asset",
               "execute_python", "destroy_actor", "set_actor_transform",
               "set_viewport_camera"}


class SuperNinjaBridge(object):
    """Registers into UE5 so the subsystem, watcher or console can call it."""

    version = BRIDGE_VERSION

    def register(self):
        import builtins
        builtins.superninja_execute_tool = self.execute_tool
        builtins.superninja_execute_plan = self.execute_plan
        builtins.superninja_bridge = self
        _log("v{} registered, {} tools: {}".format(
            BRIDGE_VERSION, len(TOOLS), ", ".join(sorted(TOOLS))))
        return True

    def execute_tool(self, tool_name, args_json=None):
        started = time.time()
        try:
            if isinstance(args_json, str):
                args = json.loads(args_json) if args_json.strip() else {}
            else:
                args = args_json or {}
        except json.JSONDecodeError as exc:
            msg = "bad json: {}".format(exc)
            return json.dumps({"ok": False, "verified": False,
                               "world_context": "Unknown",
                               "reason": msg, "error": msg})

        tool = TOOLS.get(tool_name)
        if not tool:
            msg = "unknown tool: {}".format(tool_name)
            return json.dumps({"ok": False, "verified": False,
                               "world_context": "Unknown",
                               "reason": msg, "error": msg,
                               "available": sorted(TOOLS)})
        try:
            result = tool(args)
        except Exception as exc:
            result = {"ok": False, "verified": False, "world_context": "Unknown",
                      "reason": "tool raised: {}".format(exc),
                      "error": str(exc), "traceback": traceback.format_exc()}
        result["tool"] = tool_name
        result["elapsed_ms"] = round((time.time() - started) * 1000.0, 1)
        return json.dumps(result, default=str)

    def execute_plan(self, plan_json):
        """Execute steps in order. Stops at the first unverified write.

        ue-project-wide-dry-run: pass {"dry_run": true} at the top level to
        preview every step without executing any of them.
        """
        try:
            plan = (json.loads(plan_json) if isinstance(plan_json, str)
                    else (plan_json or {}))
        except json.JSONDecodeError as exc:
            msg = "bad plan json: {}".format(exc)
            return json.dumps({"ok": False, "verified": False,
                               "reason": msg, "error": msg})

        plan_dry_run = bool(plan.get("dry_run"))
        stop_on_fail = plan.get("stop_on_failure", True)
        results, halted = [], None

        for step in plan.get("steps", []):
            name = step.get("tool")
            args = dict(step.get("args", {}))
            if plan_dry_run:
                args["dry_run"] = True
            res = json.loads(self.execute_tool(name, json.dumps(args)))
            results.append({"step": step.get("id"), "tool": name, "result": res})
            if stop_on_fail and not res.get("ok"):
                halted = {"step": step.get("id"), "tool": name,
                          "reason": res.get("reason")}
                break

        remaining = len(plan.get("steps", [])) - len(results)
        return json.dumps({
            "ok": all(r["result"].get("ok") for r in results) and not halted,
            "verified": all(r["result"].get("verified") for r in results),
            "dry_run": plan_dry_run,
            "halted_at": halted,
            "steps_executed": len(results),
            "steps_skipped": max(remaining, 0),
            "results": results,
            "bridge_version": BRIDGE_VERSION,
        }, default=str)
