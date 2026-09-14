# SuperNinjaAI plugin — v2.0.0 (patched, drop-in)

> **Superseded.** This page describes the 9-tool / v2.0.0 zip. The target
> in this repo is **v2.1.0 / 14 tools**. Install from the repo via
> [`HANDOFF.md`](HANDOFF.md), not from this document.

This is the **whole plugin**, patched. Not a diff, not a set of loose files —
copy `SuperNinjaAI/` into `<YourProject>/Plugins/` and it works.

```
<YourProject>/
├── YourProject.uproject
└── Plugins/
    └── SuperNinjaAI/          ← copy this folder
        ├── SuperNinjaAI.uplugin        (2.0.0)
        ├── Content/Python/
        │   ├── init_unreal.py                  ← v2: bridge + inbox/outbox watcher
        │   ├── superninja_bridge_v2.py         ← v2: the verified bridge
        │   ├── superninja_bridge.py            ← compat shim → re-exports v2
        │   ├── init_unreal.v1.original.py      ← archived, for the diff
        │   └── superninja_bridge.v1.original.py← archived, for the diff
        ├── Source/            (C++ unchanged)
        ├── Config/  Resources/
        └── ...
```

## What changed

`superninja_bridge.py` is now a shim that re-exports the v2 bridge. Anything
that already does `from superninja_bridge import SuperNinjaBridge` keeps working
and silently gains verification. The v1 files are archived beside it, unmodified,
so you can diff them.

`init_unreal.py` is the v2 entry point: it registers the bridge into `builtins`
(as v1 did) **and** starts the inbox/outbox file watcher, which v1 never had.

The five bugs, fixed: unverified saves on World Partition levels, PIE
contamination, no read-after-write, duplicate spawns, single-package saves.
Full detail in `../SUPERNINJA_V2_DELIVERY/CHANGELOG.md`.

## Install

1. Copy `SuperNinjaAI/` into `<Project>/Plugins/`.
2. This plugin has C++ modules, so the project must be a C++ project. Right-click
   the `.uproject` → **Generate Visual Studio project files**, then build.
   (Python-only use: the `Content/Python/` files work without compiling, loaded
   by the PythonScriptPlugin.)
3. Launch the Editor. Output Log should show:

```
[SuperNinja v2] v2.0.0 registered, 9 tools: bridge_health, create_folder, ...
[SuperNinja v2] watcher started
[SuperNinja v2]   inbox  <Project>\Saved\SuperNinja\sn_inbox
```

4. Smoke-test it:

```powershell
'{"tool":"bridge_health","args":{}}' | Set-Content "<Project>\Saved\SuperNinja\sn_inbox\health.json" -Encoding utf8
Get-Content "<Project>\Saved\SuperNinja\sn_outbox\health.json"
```

## Also in this folder

| Path | What |
|---|---|
| `Tests/offline_verification_harness.py` | 58 checks against a fake `unreal`. Runs with no Editor: `python Tests/offline_verification_harness.py` |
| `Tests/live_smoke_test.py` | Drives the real Editor through the inbox; writes `TEST_RESULTS_live.md` |
| `Tools/phx_dedupe.py` | PHX_ duplicate cleanup, dry-run by default |

## Verified before shipping

- The plugin's own `Content/Python/` tree imports cleanly: importing the shim
  with a stub `unreal` module exposes all 9 tools at version 2.0.0.
- With no Editor world resolvable, `spawn_actor` returns
  `ok=false, world_context="Unknown"` — it refuses rather than guessing.
- 58/58 offline logic checks pass.

**Not verified:** anything requiring a live UE 5.8 Editor. See
`../SUPERNINJA_V2_DELIVERY/TEST_RESULTS.md`.
