# Known limitations — SuperNinjaBridge v2

What v2 still cannot verify, and why. Written so that the next session doesn't
rediscover these the expensive way.

---

## 1. The bridge has not been run against a live Unreal Editor

See `TEST_RESULTS.md`. All 58 passing checks are against a fake `unreal` module.
Every Unreal API call is guarded and falls back, so a wrong API guess produces a
refusal rather than a false success — but the first live run may still surface
name mismatches (most likely candidates: `WorldSettings` property spelling,
`AssetImportTask.imported_object_paths`, the exact `save_current_level` return
type). **Treat the first live session as the real test.**

---

## 2. External-actor GUID matching is by filename token, not by parsed header

`ue-external-actor-save-verify` Phase 3 step 3 says to cross-check the actor GUID
*inside* the `.uasset` to catch shard collisions. v2 does not do that. It records
the file's stem (Unreal's base-36-encoded package GUID) and matches tokens across
a before/after snapshot pair.

Consequence: a shard collision — a file at the expected path containing a
different actor — reads as a normal modification. In practice this is vanishingly
rare, and detecting it needs a `.uasset` header parser. The verdict "❓ file
exists but GUID mismatch" from the skill's reporting template is therefore never
produced.

---

## 3. Save verification is a snapshot diff, so concurrent writes confuse it

`save_level` snapshots the tree, saves, waits `settle_seconds` (default 1.0),
re-snapshots. If something else writes into `__ExternalActors__` during that
window — an autosave, a second bridge instance, Perforce syncing, a source-control
operation — those files are attributed to this save.

Mitigations: raise `settle_seconds` on a slow disk or a huge level; don't run two
bridges at once (`bridge_health` now lists conflicting plugins for this reason);
use `expect_added` / `expect_removed` so a wrong count fails loudly.

A save that takes longer than `settle_seconds` to flush reads as "nothing
persisted" — a **false negative**. That's the safe direction of error, but it can
still look alarming. If you see it, raise the settle window before concluding
anything.

---

## 4. Data Layer instance files are not verified

World Partition can also persist state to Data Layer assets and to HLOD/external
*object* packages (`__ExternalObjects__`). v2 diffs `__ExternalActors__` only.
Moving actors between Data Layers, or edits that touch Data Layer assets, are
reported through the dirty-package list but are not individually verified.

---

## 5. Downstream Blueprint dependencies are invisible

If a spawned actor is referenced by a Blueprint, a Level Sequence, a Data Asset,
or an HLOD build, v2 does not know. It verifies the actor exists with the
expected mesh at the expected transform. It cannot tell you that destroying a
duplicate broke a reference somewhere else in the project.

`tools/phx_dedupe.py` inherits this: it keeps one actor per label group and
destroys the rest, without checking whether anything referenced the specific
instances it destroys. **Preview the plan before applying it**, and if the
Phoenix Dispatch scene has Blueprint logic pointing at specific PHX_ actors,
check those references by hand first.

No Blueprint compile check is implemented either — `ue-blueprint-compile-check`
describes the behaviour, but v2 has no tool that edits Blueprints, so there is
nothing to compile-check yet. See `NEXT_SKILLS.md`.

---

## 6. Material changes are not verified at all

`ue-material-instance-vs-parent` is not implemented, because v2 has no material
tool. `place_static_mesh` verifies the mesh assignment but says nothing about the
materials on that mesh, whether they compiled, or whether a slot override landed.
A mesh placed with a broken or missing material reports `ok=true`.

---

## 7. Driver-stack reversion is detected weakly

`set_directional_light` verifies the intensity reads back correctly *immediately*
after the write. If Ultra Dynamic Sky or a time-of-day Blueprint rewrites the
property on the next Tick, v2 has already reported success.

It emits `driver_warning` when the light is attached to a parent actor, which
catches the common Ultra Dynamic Sky layout. It does **not** scan for Blueprint
actors that drive lights without attachment, and it does not re-read the value a
few ticks later. `ue-driver-stack-detection` describes a fuller check; v2
implements the cheap half.

---

## 8. `execute_python` is a hole in the safety model

The PIE guard runs before the code executes, and the result reports actor-count
and dirty-package deltas. Beyond that, arbitrary code can do anything: bypass the
manifest, write to `/Engine/`, save packages directly, spawn a hundred actors.
v2's answer is to refuse to *claim* verification (`ok=false` unless you pass
`expect`), not to sandbox the code. There is no sandbox.

If a caller wants a verified mutation, it should use a real tool or supply a
precise `expect` expression.

---

## 9. Source control is reported, never enforced

`bridge_health` reports whether source control is enabled and available.
`ue-source-control-awareness` calls for refusing writes to files checked out by
someone else — v2 does **not** check per-file checkout state and does **not**
refuse on that basis. On a solo project this is fine. On a team project with
Perforce exclusive checkout, v2 can clobber a teammate's file exactly as v1 could.

---

## 10. Transaction coverage is honest but partial

Spawns and property edits run inside `ScopedEditorTransaction`, so Ctrl-Z works.
Saves, imports, folder creation, and anything `execute_python` does are **not**
undoable, and the responses say so in `undo_note`. If `ScopedEditorTransaction`
is unavailable in your build, `_Transaction` silently becomes a no-op — the write
still happens, it just isn't undoable, and the response does not currently tell
you the transaction didn't take.

---

## 11. Watcher constraints

- **One request per 750 ms tick.** A 200-step plan sent as 200 separate files
  takes 150 seconds of polling. Use a single plan request instead.
- **Long operations block the game thread.** `save_level` on a large World
  Partition level plus the settle delay freezes the Editor UI for that duration.
  This is inherent to doing Unreal work on the game thread; the alternative
  (worker threads) crashes.
- **No authentication.** Anything that can write to `sn_inbox` can drive the
  Editor, including `execute_python`. Keep the bridge folder local — the default
  is `<Project>/Saved/SuperNinja`, which is deliberately not a synced folder. If
  you point `SUPERNINJA_BRIDGE_DIR` at OneDrive or Dropbox, you have given
  anything with access to that share arbitrary code execution on your machine.
- **The watcher does not survive a Python-subsystem reload cleanly in every
  case.** It stops the previous instance when re-run, but if the Editor's Python
  interpreter is reinitialized the handle may leak. Restart the Editor if the
  inbox stops being polled.

---

## 12. Screenshot verification is timing-based

`take_screenshot` polls `Saved/Screenshots` for a new file for `wait_seconds`
(default 5). High-res captures land after the next viewport redraw, which on a
heavy scene can exceed that. A slow capture reports `ok=false` with a reason that
says to re-check the folder — a false negative, not a false positive.

---

## 13. `_is_world_partition` can be wrong on a fresh partitioned level

If `WorldSettings` isn't readable and the level is partitioned but has never had
an actor saved, `__ExternalActors__/<Level>/` doesn't exist yet, so the fallback
says "not partitioned" and the save is verified against the `.umap`. The first
save on such a level may therefore be verified by the weaker method. Once any
actor has been saved externally, detection is correct from then on.
