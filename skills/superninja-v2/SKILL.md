---
name: superninja-v2
description: Drive the SuperNinja Unreal Editor bridge v2. Use when spawning, moving, destroying, saving, or inspecting actors through the inbox/outbox poller. Enforces the five-step envelope — ok is never true when verified is false.
version: 2.1.0
tags: [unreal-engine, ue5.8, superninja, verification, static-only]
---

# SuperNinja v2 (verified writes)

Copy of `.cursor/skills/superninja-v2/SKILL.md`. Intended mirror for
`C:\Users\steve\Desktop\skill\superninja-v2\` — this Cloud Agent cannot
write that Windows path.

The running Windows Editor is still on whatever is installed there. This
skill describes the **v2.1 source of truth in this repo**. Until those
files are copied onto the Editor box and a live smoke test is run, treat
every Editor-facing claim as **unverified-until-live**.

## Envelope (non-negotiable)

Every tool returns `ok`, `verified`, `world_context`, `before`, `after`,
`dirty_packages`. `_result()` forces `ok = False` whenever `verified` is
false.

Five steps on every write: pre-check → authorize → execute → verify → report.

## Transport

- `cloud-poll` — inbox/outbox files. Allowed from a Cloud Agent.
- `local-8765` — `http://127.0.0.1:8765`. **Hard reject** off the Windows
  Editor box. Do not fall back.

`tools/sn_unreal_nonblocking_phase2.py` uses `MAX_QUEUE_SIZE=32`,
`RESULT_TTL=300s`, and stamps results with `result_ts`.

Do not ship `__pycache__/*.cpython-314.pyc`. UE 5.8 = CPython 3.11.

## First-class tools (v2.1)

`find_actors`, `destroy_actor`, `set_actor_transform`,
`set_viewport_camera`, `save_level_as`, plus the original v2.0 nine.

See `.cursor/skills/superninja-v2/SKILL.md` for call examples.
