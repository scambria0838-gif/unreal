# CHANGELOG — SuperNinjaAI bridge v1 → v2

Version 2.1.0 adds first-class `find_actors`, `destroy_actor`,
`set_actor_transform`, `set_viewport_camera`, `save_level_as`, plus the
cloud-poll / local-8765 hard-reject poller. See `V2_1_ADDITIONS.md`.
Those tools are static-only / unverified-until-live.

Version 2.0.0. Source of truth for behaviour: the 13 skills in
`02_SKILLS_PREMIUM_ENGLISH_DONE/`.

---

## The one-line summary

v1 reported `ok=true` when the Unreal call didn't raise. v2 reports `ok=true`
only when it re-read the target and saw the change. Everything below is that
idea applied nine times.

---

## New response envelope (every tool)

```json
{
  "ok": false,
  "verified": false,
  "world_context": "Editor | PIE | Unknown",
  "before": { "...baseline state..." },
  "after":  { "...post-execute state..." },
  "dirty_packages": ["/Game/Maps/Lvl_FirstPerson"],
  "reason": "why this failed or could not be verified",
  "bridge_version": "2.0.0",
  "tool": "spawn_actor",
  "elapsed_ms": 84.2
}
```

Invariant enforced in `_result()`: **`ok` can never be `true` while `verified`
is `false`.** A tool that cannot prove its change fails, by construction.

Backward compatibility: every v1 tool name, every v1 argument, and every v1
response key (`ok`, `error`, `actor`, `path`, `dest`, `file`, `light`) is still
present. v2 only adds. Existing callers keep working; they just get more keys.

---

## New helpers

| Helper | Purpose |
|---|---|
| `_check_world_context()` | Returns `("Editor"\|"PIE"\|"Unknown", world)`. Four independent probes: game-world presence via `UnrealEditorSubsystem.get_game_world()`, editor world, `UEDPIE_` path markers, then `world_type` if the build exposes it. Every probe is individually guarded — the Python surface differs across 5.3/5.4/5.5+ and between source and launcher builds. |
| `_pie_guard(args, context)` | Turns the context into a refusal. `Unknown` refuses too (ue-pie-guard degradation path: an unresolvable world is treated as hostile, not as Editor). `allow_pie: true` is the only override. |
| `_verify_actor_exists(label, world)` | Re-enumerates the level and matches on label. Deliberately ignores the pointer the spawn call returned — a pointer into a world about to be torn down is indistinguishable from a good one. |
| `_enumerate_external_actors(level_path)` | `{relpath: (mtime, size, guid_token)}` for every `.uasset` under `Content/__ExternalActors__/<LevelPath>/`. |
| `_diff_external_actors(before, after)` | `added` / `removed` / `modified` (mtime advance or size change) + counts. |
| `_is_world_partition(level)` | `WorldSettings.is_partitioned_world` first (three property spellings tried), then falls back to "does the `__ExternalActors__` tree exist". The fallback matters: guessing "not partitioned" is exactly what makes a verifier check the `.umap` and report a false failure. |
| `_dirty_packages()` | `get_dirty_map_packages()` + `get_dirty_content_packages()`, de-duplicated, maps first. |
| `_source_control_state()` | `SourceControl.is_enabled()` / `is_available()`. |
| `_Transaction(desc)` | `ScopedEditorTransaction` wrapper that degrades to a no-op instead of raising. |
| `_within_manifest(path)` | Content-root boundary check. `MANIFEST["allowed_content_roots"]` defaults to `["/Game/"]`. |

---

## Bug fixes

### Bug 1 — silent success on save → FIXED
`tool_save_level` now detects World Partition, snapshots
`Content/__ExternalActors__/<LevelPath>/` before the save, re-snapshots after a
settle delay, and diffs. Verdict comes from **files written**, never from the
`.umap` timestamp. The `.umap` mtime is still reported, explicitly labelled
"not used as evidence for World Partition levels". A save that writes nothing
and clears no dirty package now returns `ok=false` with a reason naming the
external-actors root it inspected.

Optional `expect_added` / `expect_removed` arguments let the caller assert a
count; a short write (3 files when 15 were expected) fails instead of passing.

Classic non-partitioned levels fall back to `.umap` mtime + dirty-set clearing,
and say so in `verification_method`.

### Bug 2 — PIE-mode contamination → FIXED
`_pie_guard` runs at the top of `spawn_actor`, `place_static_mesh`,
`set_directional_light`, `save_level`, `import_asset`, `execute_python`, and
`create_folder`'s manifest path. Refusal message:

> editor is in PIE mode, refusing write to prevent contamination. Any actor
> spawned now lives in the duplicated PIE world and is destroyed when you press
> Stop. Exit PIE (Esc, or Stop in the toolbar) and re-send this request.

`allow_pie: true` proceeds and tags the result. Post-write, every actor's path
is re-checked for `UEDPIE_` — a write that *lands* in PIE despite the guard is
reported as failed, not as success (ue-pie-guard Phase 3).

### Bug 3 — no read-after-write verification → FIXED
Every write tool runs pre-check → authorize → execute → verify → report.
Concretely:

- `spawn_actor` — actor with that label exists afterwards, its path has no
  `UEDPIE_`, and the actor count actually increased.
- `place_static_mesh` — all of the above **plus** the component's
  `static_mesh` reads back as the requested asset. An actor with an unset mesh
  is a failure, not a success.
- `set_directional_light` — intensity is read back and compared against the
  written value (1e-3 tolerance).
- `create_folder` — `does_directory_exist` re-queried after creation.
- `import_asset` — the destination folder is listed before and after; "task ran
  but no new asset appeared" is a failure. `AssetImportTask` does not raise on
  failure, which is why v1 never noticed.
- `take_screenshot` — polls `Saved/Screenshots` for a genuinely new file
  instead of trusting the queued capture call.
- `execute_python` — see below.

### Bug 4 — duplicate actor spawn → FIXED
`spawn_actor` and `place_static_mesh` take `on_duplicate: "skip" | "replace" |
"error"`, default `error`:

- `error` → `ok=false`, `reason: actor with label X already exists...`
- `skip` → `ok=true, verified=true, skipped=true`, nothing created
- `replace` → destroys the existing actor, verifies it is gone, then spawns

`set_directional_light` gets the same treatment implicitly: it now reuses a
light matching `label`/`target_label`, or the only directional light in the
level, instead of spawning a new one every call (v1's behaviour is how a level
ends up with nine key lights).

### Bug 5 — multi-package saves → FIXED
`save_level` reports the complete dirty set before and after, and splits it into
`packages_cleared_by_save` and `packages_still_dirty`. It never auto-saves
unrelated dirty work — the still-dirty list is surfaced so the caller can decide.

---

## New tool

### `bridge_health`
Read-only. Returns: bridge version, UE version, world context + world path,
current level, World Partition status **and the method used to determine it**,
external-actors root and file count, actor count, full dirty set, source-control
enabled/available, installed plugins, conflicting plugins matched against
`MANIFEST["known_conflicting_plugins"]` (UnrealMCP, UEMCP, BlenderMCP,
RemoteControlWebInterface, …), transport stats from the watcher, and inbound
latency when the caller stamps `sent_at`.

`verified` is false if no Editor world could be resolved — a health check that
can't see a world is not a healthy bridge.

---

## Changed: `execute_python` is honest now

Arbitrary code cannot be verified by the bridge — it has no idea what the code
was supposed to do. So:

- Code that raises → `ok=false` with traceback (unchanged in spirit, better detail).
- Code that runs clean with no `expect` → **`ok=false, executed=true`**, with the
  observed effect (actor delta, newly dirty packages) and an explanation that
  passing `expect` is how you get a verified result.
- Code that runs clean with `expect: "<python expression>"` → the expression is
  evaluated in the same namespace; truthy means `ok=true, verified=true`.

This is deliberately stricter than v1. `ok=false` here means "it ran, I can't
vouch for it" — the whole point of the exercise.

---

## Changed: `execute_plan`

- Stops at the first step that isn't `ok` (`stop_on_failure: false` to override).
- Reports `halted_at`, `steps_executed`, `steps_skipped` — a halted plan never
  looks like a completed one.
- Top-level `{"dry_run": true}` propagates to every step (ue-project-wide-dry-run).

---

## New: transport (`init_unreal_v2.py`)

v1's `init_unreal.py` only registered `builtins.superninja_execute_tool`. There
was no file watcher anywhere in the plugin — the kit's other scripts poll
`http://127.0.0.1:8765`. v2 adds the inbox/outbox watcher the workflow assumes:

```
<BridgeDir>/sn_inbox/*.json      →  {"tool": "...", "args": {...}} or {"steps": [...]}
<BridgeDir>/sn_outbox/*.json     →  result JSON, same filename
<BridgeDir>/sn_inbox/processed/  →  dispatched requests, timestamped
<BridgeDir>/sn_inbox/failed/     →  unparseable requests
```

- `BridgeDir` = `SUPERNINJA_BRIDGE_DIR` env var, else `<Project>/Saved/SuperNinja`,
  else `~/Desktop/SuperNinjaBridge`.
- Polls every **750 ms** on `register_slate_post_tick_callback` — on the game
  thread, never a worker thread (Unreal's Python API is not thread-safe) and
  never a `while/sleep` loop (that freezes the Editor; this project has already
  been burned by it).
- One request per tick, so a burst can't stall the editor.
- Results are written to a `.part` file and `os.replace`d into place, so a
  reader polling the outbox can never parse a half-written file.
- Hot-reload safe: a previous watcher is stopped before a new one starts.

---

## Files

| File | What it is |
|---|---|
| `superninja_bridge_v2.py` | The patched bridge. Drop-in replacement for `superninja_bridge.py`. |
| `init_unreal_v2.py` | Entry point + inbox/outbox watcher. Replaces `init_unreal.py`. |
| `tests/offline_verification_harness.py` | Fake-`unreal` harness: 58 checks over the decision logic. Runs anywhere. |
| `tests/live_smoke_test.py` | Drives the real Editor through the inbox. Produces `TEST_RESULTS_live.md`. |
| `tools/phx_dedupe.py` | Phase-4 PHX_ duplicate cleanup. Dry-run by default. |
