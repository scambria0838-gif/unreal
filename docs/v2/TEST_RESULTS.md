# TEST RESULTS — SuperNinjaBridge v2

**Read this section first. It is the part the brief cares about most.**

## What was NOT tested: the live Unreal Editor

Phase 3 (live smoke tests against NINJA) and Phase 4 (PHX_ duplicate cleanup)
**did not run.** Not "ran with caveats" — did not run at all. The machine this
session executed on does not have the project:

| Prompt assumed | Actually found (verified 2026-09-12) |
|---|---|
| `C:\Users\sbcam\OneDrive\Documents\Unreal Projects\NINJA\NINJA.uproject` | No `sbcam` user account exists. `C:\Users\` has `steve`. |
| A NINJA project with the plugin installed | Three `NINJA.uproject` files exist under `Downloads\`, all inside flattened documentation dumps where `Content`, `Plugins`, `Saved` are **0-byte regular files, not directories**. There is no loadable project. |
| UE 5.7 (5.8 maybe) | `C:\Program Files\Epic Games\` contains `UE_5.8` only. No 5.7. |
| Editor running or startable | No `UnrealEditor.exe` process. Nothing to start the missing project with. |
| Bridge at `...\Desktop\sn_inbox\` / `sn_outbox\` | Neither folder exists anywhere under the user profile. |
| `init_unreal.py` polls the inbox every 750 ms | **It does not.** The shipped `init_unreal.py` is 26 lines and only sets `builtins.superninja_execute_tool`. No file watcher exists anywhere in the kit; the other kit scripts poll `http://127.0.0.1:8765`. The inbox/outbox transport described in the brief did not exist until this session wrote it. |

So the 53+ duplicate `PHX_` actors could not be enumerated, deduplicated, or
counted, and no tool was exercised against a real `unreal` module.

**Phase 4 is delivered as `tools/phx_dedupe.py`, dry-run by default, not as a
completed cleanup.** When you run it, it prints the real counts and the
"Removed X duplicate actors, kept Y unique actors" line the brief asks for.

---

## What WAS tested: the decision logic, against a fake Editor

`tests/offline_verification_harness.py` builds a fake `unreal` module —
editor world, PIE world, actors, assets, dirty-package lists, subsystems — plus
a **real** temporary project directory on disk with a **real**
`Content/__ExternalActors__/` tree containing real `.uasset` files. The bridge
is imported against it unmodified.

```
$ python tests/offline_verification_harness.py
58/58 checks passed
```

Raw output: `tests/offline_harness_output.txt`.
Environment: Windows 11, Python 3.14.6, 2026-09-12.

This proves the logic. It does not prove the Unreal API call names — see
"Confidence" below.

### Bug 1 — silent success on save

| Check | Result |
|---|---|
| Detects World Partition when `WorldSettings` is unavailable (falls back to the `__ExternalActors__` tree) | PASS |
| Save that writes 15 external `.uasset` files → `ok=true, verified=true`, 15 files named | PASS |
| Verification method reported as `__ExternalActors__ tree diff` | PASS |
| External-actor count reported 110 → 125 | PASS |
| Response states the `.umap` mtime was not used as evidence | PASS |
| **Save that returns `True` but writes nothing → `ok=false`, "Nothing was persisted"** | PASS |
| Save that writes 3 files when `expect_added: 15` → `ok=false`, "expected 15 … saw 3" | PASS |
| Deleting 4 external actors → verified via `expect_removed` | PASS |
| Classic non-partitioned level verified via `.umap` mtime instead | PASS |
| Classic level with untouched `.umap` and no cleared package → `ok=false` | PASS |

The third-from-last row is the exact v1 bug, now reproduced deliberately and
caught.

### Bug 2 — PIE contamination

| Check | Result |
|---|---|
| `spawn_actor` during PIE → `ok=false, verified=false` | PASS |
| `world_context` reported as `"PIE"` | PASS |
| Refusal text names PIE mode and tells the user to exit PIE | PASS |
| No actor created by the refused call | PASS |
| `save_level` refused during PIE | PASS |
| `execute_python` refused during PIE | PASS |
| `allow_pie: true` overrides the guard | PASS |
| Unresolvable world (`Unknown`) also refuses | PASS |
| An actor that *lands* in a `UEDPIE_` path despite the guard → reported unverified | PASS |

### Bug 3 — read-after-write

| Check | Result |
|---|---|
| Successful spawn reports `before.actor_count` / `after.actor_count` | PASS |
| **Spawn call returns a valid actor pointer but nothing lands in the level → `ok=false`** | PASS |
| `place_static_mesh` verifies the assigned mesh path matches the request | PASS |
| Missing mesh refused before spawning anything | PASS |
| Path outside `MANIFEST["allowed_content_roots"]` refused | PASS |
| `create_folder` re-queries `does_directory_exist` after creating | PASS |
| `import_asset` with a nonexistent source file refused | PASS |
| `execute_python` with no `expect` → `ok=false, executed=true` ("cannot be verified") | PASS |
| `execute_python` with truthy `expect` → `ok=true, verified=true` | PASS |
| `execute_python` with falsy `expect` → `ok=false` | PASS |
| Raised exception reported with traceback | PASS |

### Bug 4 — duplicate spawns

| Check | Result |
|---|---|
| Second spawn with the same label → `ok=false`, "already exists" | PASS |
| Refused duplicate creates nothing (count stays 1) | PASS |
| `on_duplicate: "skip"` → `ok=true, skipped=true`, nothing created | PASS |
| `on_duplicate: "replace"` → succeeds and leaves exactly one actor | PASS |

### Bug 5 — multi-package saves

| Check | Result |
|---|---|
| Full dirty set reported before and after the save | PASS |
| `packages_cleared_by_save` lists what the save actually flushed | PASS |
| `packages_still_dirty` lists unrelated dirty work, unsaved | PASS |
| Unrelated dirty packages are **not** auto-saved | PASS |

### New tool — `bridge_health`

| Check | Result |
|---|---|
| Reports UE version | PASS |
| Reports World Partition status + the detection method used | PASS |
| Counts external-actor files (110) | PASS |
| Reports the full dirty set | PASS |
| Flags a conflicting plugin (`UnrealMCP` planted in `Plugins/`) | PASS |

Latency reporting is implemented (`sent_at` → `inbound_latency_ms`, plus watcher
round-trip stats) but is only meaningful against the live watcher, so it is
untested here.

### Envelope invariants and plans

| Check | Result |
|---|---|
| All 9 tools return `ok` / `verified` / `world_context` / `before` / `after` / `dirty_packages` | PASS |
| **`ok` is never `true` while `verified` is `false`** (checked across all 9) | PASS |
| Every failing response carries a `reason` | PASS |
| Unknown tool name rejected | PASS |
| Malformed JSON rejected | PASS |
| `dry_run` reports the plan and changes nothing | PASS |
| A plan halts at the failing step; remaining steps counted as skipped, not run | PASS |
| Plan-level `dry_run` propagates to every step | PASS |

---

## Confidence: what the offline harness can and cannot tell you

**High confidence** (pure logic, fully exercised): the PIE guard, the
duplicate-label policy, the external-actors diff and its verdicts, the dirty-set
split, the response envelope, plan halting, dry-run.

**Medium confidence** (real filesystem, fake Unreal): World Partition detection.
The `__ExternalActors__` fallback path is tested against real directories. The
`WorldSettings.is_partitioned_world` path is not — the harness deliberately makes
`GameplayStatics.get_world_settings` raise, to force the fallback.

**Unverified until the live run** — every actual Unreal API name and semantic:

- `UnrealEditorSubsystem.get_game_world()` returning `None` outside PIE
- `EditorActorSubsystem.spawn_actor_from_class` / `destroy_actor` behaviour
- `LevelEditorSubsystem.save_current_level()`'s return value
- `EditorLoadingAndSavingUtils.get_dirty_map_packages()` availability
- `ScopedEditorTransaction` as a context manager
- `AssetImportTask.imported_object_paths` population
- `register_slate_post_tick_callback` signature and return-value semantics
- The real `__ExternalActors__` shard layout for your specific level

Every one of these is wrapped in `try/except` with a fallback, so a wrong guess
degrades to `Unknown`/refusal rather than to a false success — but "degrades
safely" is not "works". **Run `tests/live_smoke_test.py` before trusting v2 with
the Phoenix Dispatch rebuild.**

---

## How to complete Phases 3 and 4

1. Start the Editor on the real NINJA project with the v2 files installed
   (`INTEGRATION_GUIDE.md` steps 1–4).
2. `python tests/live_smoke_test.py --bridge-dir "<Project>/Saved/SuperNinja"`
   → writes `TEST_RESULTS_live.md` with real pass/fail per bug category,
   including the interactive PIE test.
3. In the Editor console, `exec(open(r"...\tools\phx_dedupe.py").read())` for the
   duplicate preview, then `run(apply=True, save=True)`.
4. Append both outputs to this file. Until then, the live column is empty and
   this document says so.
