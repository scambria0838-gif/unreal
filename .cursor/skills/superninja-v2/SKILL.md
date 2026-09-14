---
name: superninja-v2
description: Drive the SuperNinja Unreal Editor bridge v2. Use when spawning, moving, destroying, saving, or inspecting actors through the inbox/outbox poller. Enforces the five-step envelope — ok is never true when verified is false.
version: 2.1.0
tags: [unreal-engine, ue5.8, superninja, verification, static-only]
---

# SuperNinja v2 (verified writes)

The running Windows Editor is still on whatever is installed there. This
skill describes the **v2.1 source of truth in this repo**. Until those
files are copied onto the Editor box and a live smoke test is run, treat
every Editor-facing claim as **unverified-until-live**.

## Envelope (non-negotiable)

Every tool returns:

```json
{
  "ok": false,
  "verified": false,
  "world_context": "Editor | PIE | Unknown",
  "before": {},
  "after": {},
  "dirty_packages": [],
  "reason": "...",
  "bridge_version": "2.1.0"
}
```

`_result()` forces `ok = False` whenever `verified` is false. A spawn that
returns a pointer but cannot be re-read is a failure. Do not paper over it.

Five steps on every write: pre-check → authorize → execute → verify → report.

## Transport

| Mode | When | What happens from a Cloud Agent |
|---|---|---|
| `cloud-poll` | inbox/outbox files | Allowed. Drop JSON in `sn_inbox`, read `sn_outbox`. |
| `local-8765` | `http://127.0.0.1:8765` | **Hard reject.** That socket is the Windows Editor. Do not fall back. |

`tools/sn_unreal_nonblocking_phase2.py` enforces `MAX_QUEUE_SIZE=32`,
`RESULT_TTL=300s`, and stamps every stored result with `result_ts`.

Do not ship `__pycache__/*.cpython-314.pyc`. UE 5.8 embeds CPython 3.11.
Those bytecode files are from the Windows 3.14 build that authored v2 and
will fail to import inside the Editor.

## First-class tools (v2.1)

Read: `bridge_health`, `find_actors`, `take_screenshot`

Write (PIE-refused unless `allow_pie: true`):

- `spawn_actor` / `place_static_mesh` — `on_duplicate`: `error` (default), `skip`, `replace`
- `destroy_actor` — `label` or `guid`; `on_missing`: `error` (default) or `skip`
- `set_actor_transform` — `location` / `rotation` / `scale`; read-back compared
- `set_viewport_camera` — editor UI, not a saved asset
- `save_level` — World Partition diffs `__ExternalActors__`; never trusts `.umap` mtime
- `save_level_as` — new package path, verified by dest file presence
- `set_directional_light`, `create_folder`, `import_asset`
- `execute_python` — `ok` stays false unless the caller passes `expect`

## How to call

```json
{ "tool": "spawn_actor",
  "args": { "class_path": "/Script/Engine.StaticMeshActor",
            "location": [0, 0, 300],
            "label": "PHX_Cruiser_01",
            "on_duplicate": "error" } }
```

Plan (stops at first unverified write):

```json
{ "stop_on_failure": true,
  "steps": [
    { "id": 1, "tool": "place_static_mesh",
      "args": { "mesh_path": "/Game/KB3D/SM_Barrier", "label": "PHX_Barrier_01" } },
    { "id": 2, "tool": "save_level", "args": { "expect_added": 1 } }
  ] }
```

## Live vs static

- Static (this repo): `python tests/offline_verification_harness.py` and
  `python tests/test_envelope_and_poller.py`
- Live (Windows Editor only): `python tests/live_smoke_test.py --bridge-dir <Saved/SuperNinja>`
- This Cloud Agent cannot press Play, duplicate, or save a World Partition
  level. Do not invent those results.

## Install onto the Editor

See `docs/v2/INTEGRATION_GUIDE.md`. Copy
`Plugins/SuperNinjaAI/Content/Python/*.py` (not `.pyc`) into the project's
plugin Python folder, restart the Editor, and look for
`[SuperNinja v2] watcher started`.
