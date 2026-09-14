# Next tools — proposals only, not built

Five executable tools, ranked by leverage. Each one closes a gap that v2 can
currently only report around. Nothing here was implemented this session.

A note on ordering: #1 is worth more than #2–#5 combined, because it removes the
whole category of "the AI said it worked and the level says otherwise" for scene
work, rather than one instance of it.

---

## 1. `tool_scene_diff` — snapshot and compare the whole level

**The gap.** Every v2 tool verifies its own single write. Nothing verifies the
*scene*. After a 60-step Phoenix Dispatch rebuild you have 60 individually
verified writes and no answer to "is the scene what I asked for?" The 53
duplicate PHX_ actors were created by exactly that blind spot — each spawn was
individually fine.

**What it does.**
- `tool_scene_snapshot` → writes a JSON manifest of every actor: label, class,
  transform, mesh/material assignments, GUID, Data Layer, external-actor file.
- `tool_scene_diff` → compares two snapshots, or a snapshot against the live
  level: added / removed / moved / re-meshed / duplicated, grouped by label base.

**Why it's first.** It turns "did my build work?" from a 60-response reading
exercise into one call. It makes a rebuild resumable — diff, then apply only the
missing steps, instead of re-running the whole plan and duplicating everything.
It makes cleanup safe: preview the diff before destroying. And it gives the next
session a way to prove a scene state without an Unreal expert reading the log.

Roughly a day, no new Unreal API surface beyond what v2 already touches.

---

## 2. `tool_asset_validate` — does this asset actually work?

**The gap.** `place_static_mesh` proves an actor holds a mesh reference. It says
nothing about whether the mesh has a valid material, a nanite build, collision, a
non-zero bounds box, or any LODs. A KitBash3D import with broken material slots
places cleanly, verifies cleanly, and renders as grey checkerboard.

**What it does.** Given an asset path: load it, then report material slots and
whether each resolves, missing/null material references, shader compile errors
from the last build, collision presence, LOD count, nanite status, triangle
count, and the referencing chain. Batchable across a folder, so a whole KitBash
kit can be validated after import in one call.

**Why.** It's the single most common "the AI said it worked" failure left after
v2, and it's the one that costs the most time to diagnose by eye.

---

## 3. `tool_actor_modify` — remaining property writes (transform is shipped)

**Shipped in v2.1.** `find_actors`, `destroy_actor`, and `set_actor_transform`
already exist on the five-step envelope. Do not rebuild those.

**The remaining gap.** Re-meshing, re-materialing, and arbitrary property
writes still go through `execute_python`, which is unverifiable unless you
pass `expect`.

**What it does.** `{ label | guid, properties: {...}, on_missing }` with the full
five-step pattern: read current values, apply, re-read, compare per property.
Reports per-property ✅/❌ instead of one aggregate boolean. Implements
`ue-class-vs-instance`: refuses ambiguous targets and states explicitly whether
the write hit the instance or the class default.

**Why.** Scene iteration is mostly modification, not creation. Without this, the
second pass over a scene falls back to `execute_python` and loses verification.

---

## 4. `tool_blueprint_edit` + compile check

**The gap.** `ue-blueprint-compile-check` exists as a skill with nothing to
apply it to. v2 has no Blueprint tool, so 911 Dispatcher logic work is entirely
manual.

**What it does.** Add/remove variables, set class defaults, set a parent class —
then compile and report the compile status (`UpToDate` / `Dirty` / `Error`) with
the actual compiler messages. Refuses to report success on a Blueprint that
compiles with errors, and flags `Dirty` (modified but not recompiled), which is
the state that breaks at runtime instead of at edit time.

**Why.** The 911 Dispatcher blueprint in `06_PROJECT_CONTEXT/` is the actual
project goal. Scene dressing is the prerequisite; the logic is the product.

---

## 5. `tool_batch_spawn` — one call, N actors, one transaction, one verdict

**The gap.** Dressing a scene means dozens of spawns. Through the inbox that's
dozens of files at 750 ms each, and a partial failure leaves the level in a state
nobody has enumerated.

**What it does.** Takes a list of placements. Dry-runs the whole set first
(`ue-project-wide-dry-run`), checks every label for collisions *before* spawning
anything, wraps the batch in one undo transaction, spawns, verifies each, and
returns a per-item table plus an aggregate. On partial failure it either rolls
back the transaction or reports precisely which items landed — caller's choice
via `on_partial_failure: "rollback" | "report"`.

**Why.** It makes the Phoenix Dispatch rebuild a single reviewable operation with
a single reviewable result, and the pre-flight label collision check makes the
53-duplicate scenario structurally impossible rather than merely guarded.

---

## Deliberately not proposed

- **A materials tool.** Real value, but `ue-material-instance-vs-parent` warns
  that a wrong parent edit recompiles shaders for hours. Wants its own session
  with a plan, not a slot in a list of five.
- **Source-control enforcement.** Only matters when NINJA becomes a team project.
  Reporting (already in `bridge_health`) is enough for solo work.
- **An HTTP transport.** The kit has `unreal_live_bridge_server.py` on port 8765
  and v2 now has the file watcher. A third transport is surface area, not
  leverage — pick one and delete the others.
