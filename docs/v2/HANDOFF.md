# SuperNinja v2.2 Handoff

The bridge is **installed, running, and live-verified**. A full-pass
`TEST_RESULTS_live.md` exists: 26 checks, 0 failures, 0 skips.

Prepared 2026-09-14. Repo `scambria0838-gif/unreal` · PR #3 · Project NINJA
(UE 5.8) at `C:\Users\steve\Projects\SuperNinja\important\ue5_project\NINJA`.

One sentence for the next chat: **SuperNinja v2.2.0 (15 tools) is installed as
a Python-only sidecar beside the existing SuperNinja Premium plugin, the live
smoke test passes 26/26 with `--auto-pie`, and the remaining work is to widen
`epic_call` across Epic's ~1,035 toolset tools.**

---

## The goal

An agent that can change an Unreal scene and **prove the change survived**.

Every failure this project exists to fix is the same failure: a write reported
success when nothing persisted. Fifty-three duplicate `PHX_` actors. Spawns
that vanished on PIE exit. A `save_level` that returned true while the World
Partition tree went untouched.

The rule the architecture hangs off: **a tool that cannot verify its own change
returns `ok=false`.** "I could not confirm" is a failure, never a success.
Do not weaken `_result()`.

That rule has now caught a real case in the wild. See "the save that lied".

---

## What is installed

`Plugins/SuperNinjaAI/` in the NINJA project — a **Python-only sidecar**:
`"Modules": []`, so no C++ and no compile prompt. It sits beside the
pre-existing `Plugins/SuperNinja` (SuperNinja Premium v3.0, HTTP bridge on
:8765), which is untouched. Both mount; `bridge_health` reports
`installed_plugins: ["SuperNinja", "SuperNinjaAI"]` and
`conflicting_plugins: []`.

Transport is the inbox/outbox file watcher on a Slate post-tick callback:
`<Project>/Saved/SuperNinja/sn_inbox` to `sn_outbox`, 750 ms poll.

---

## Evidence ledger

| Claim | Status | How it is known |
|---|---|---|
| v2.2.0 registers 15 tools in a real Editor | **Verified live** | Output Log after restart; `bridge_health` payload |
| Read-after-write on spawn / transform / destroy | **Verified live** | Smoke test on `/Game/SNV2_WP` |
| Duplicate-label guard refuses; `skip` and `replace` behave | **Verified live** | Smoke test |
| PIE guard refuses writes; nothing leaks on exit | **Verified live** | Smoke test with `--auto-pie` |
| WP save diffs `__ExternalActors__`, refuses `.umap` mtime as evidence | **Verified live** | One package added, 143 to 144 |
| `_is_world_partition()` answers via `WorldSettings.world_partition` | **Verified live, both directions** | `None` on PD_Station; a `UWorldPartition` object on a partitioned world |
| `epic_call` runs Epic's toolset functions and verifies the effect | **Verified live (manual)** | `SceneTools.add_to_scene_from_class` + `PrimitiveTools.add_cube`, then `save_level` diffed the exact package Epic named |
| Epic's MCP answers on :8000; 55 toolsets, ~1,035 tools | **Verified live** | Enumerated via `list_toolsets` / `describe_toolset` |
| Offline harness 74/74, plus envelope, install, kit, identity | **Verified static** | Re-run. Proves decision logic, not the UE API |
| `phx_dedupe.py` does its job | **No target** | Zero `PHX_` actors across all nine maps in NINJA |
| `epic_call` beyond the two tools exercised by hand | **Unverified** | Only `SceneTools.add_to_scene_from_class` and `PrimitiveTools.add_cube` have been run. The argument coercion layer covers actor/class/vector/rotator/transform/asset and nothing else |
| The ~1,035 tool count | **Approximate** | Regex over `describe_toolset` text, not an audited figure. The 55 toolsets are exact |
| Where the 53 `PHX_` duplicates actually live | **Unverified** | Not in NINJA. Never located. The bridge has never met the scene it was built for |

---

## Definition of done

1. ~~The running Editor reports the expected version and tool count.~~ **Met.**
2. ~~`tests/live_smoke_test.py` produces a full-pass `TEST_RESULTS_live.md`.~~
   **Met** — 26 passed, 0 failed, 0 skipped.
3. The `PHX_` cleanup — **no target exists.** `phx_dedupe.py` filters level
   actors by the `PHX_` prefix; every map in NINJA returns zero. Either they
   were cleaned before this work or the affected project is elsewhere. Find out
   which before closing this gate or dropping it.

---

## Reproducing the verified run

The run must happen on a World Partition level, or the two external-actor
checks skip and the report reads NOT VERIFIED. The fixture is `/Game/SNV2_WP`.
The Editor will not reliably open it — a map name on the command line is
ignored — so set it in `Config/DefaultEngine.ini`:

```ini
[/Script/EngineSettings.GameMapsSettings]
EditorStartupMap=/Game/SNV2_WP.SNV2_WP
```

Restart, let World Partition finish streaming (a run against a freshly-opened
WP level fails — see below), then:

```powershell
powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1
python tests\live_smoke_test.py --bridge-dir "C:\Users\steve\Projects\SuperNinja\important\ue5_project\NINJA\Saved\SuperNinja" --auto-pie
```

`--auto-pie` drives Play-In-Editor through the watcher's control channel, so no
keyboard is needed. Without it the test prompts for Alt-P and Stop.

---

## The save that lied

The first smoke run against `/Game/SNV2_WP` **failed**, immediately after the
Editor opened it:

```
FAIL  save ok and verified
      World Partition save produced no change ... Nothing was persisted.
      {'added': [], 'count_before': 139, 'count_after': 139}
```

The identical sequence a minute later passed and wrote 142 to 143. The level
was still streaming; the actor never got an external package.

**The `.umap` mtime changed both times.** v1 would have called the first one a
success. Treat a WP save failure right after opening a level as wait-and-retry,
and do not relax the check to make it pass.

---

## Plan receipts

`execute_plan` takes `"verify_persistence": true` and, after running the
steps, saves once and reconciles **every package the steps claimed against
the files actually on disk**:

```
ok: True | verified: True | steps: 2
claimed   : ['RB/C58JCLWZK0MYIXIB0XOJAX', 'WB/DI19S73EM917Z7QP5ZVPPZ']
proven    : ['RB/C58JCLWZK0MYIXIB0XOJAX', 'WB/DI19S73EM917Z7QP5ZVPPZ']
unproven  : []
unclaimed : []
by_step   : {'RB/C58JCL...': 'p3-a', 'WB/DI19S7...': 'p3-b'}
```

If any claimed package is missing, the **whole plan** fails and
`unproven_steps` names which step is responsible. That is the part no other
tool in this space does: at a thousand chained operations, knowing that
something did not persist is useless unless you know *which* something.

`unclaimed_on_disk` lists files the save wrote that no step claimed. Not a
failure — earlier unsaved edits legitimately flush here — but an unexplained
pile of them means the plan is not the only thing touching the level.

An empty plan returns `ok=false`. `all([])` is `True`, so the obvious
aggregation reports a pass for a plan that ran nothing; that was a live bug
in `execute_plan` until 2.2.0.

### One unexplained observation

During the first plan run, two consecutive reads of the same outbox file
returned different payloads — the first showing three unproven packages with
GUIDs that appear nowhere in the settled result. `write_result` uses
tmp + `os.replace`, so a torn read should be impossible, and it did not
reproduce across two further runs. Cause unknown. Recorded rather than
explained away: if a client ever sees a receipt whose `claimed` tokens match
no step, re-read before acting on it.

---

## Gotchas that cost real time

- **World Partition through the watcher crashes UE 5.8.** Creating or opening a
  WP level from the Slate post-tick dispatch trips
  `Assertion failed: !FWorldPartitionLoadingContext::IsDeferringRawObjects()`.
  Actor-level work through the watcher is fine. See `KNOWN_LIMITATIONS.md`.
- **`new_level_from_template` returns `False` while still creating and saving
  the asset.** Check the disk, not the return value.
- **In a commandlet, `new_level()` leaves the world in a transient `/Temp/`
  package**, so saves cannot be verified headlessly — every save route returns
  False there.
- **Epic's MCP needs `Connection: keep-alive`.** `tools/call` streams its result
  on the POST's own response; `Connection: close` makes the server hang up and
  you get 200, `text/event-stream`, 0 bytes. `GET /mcp` is 405 by design.
- **`execute_python` is a write tool**, so it is refused during PIE. That is why
  PIE exit needs the control channel, not a tool.

---

## The control channel

`init_unreal.py` handles requests shaped `{"control": "..."}` before tool
dispatch: `pie_state`, `begin_play`, `end_play`. They are **not tools** — not in
`TOOLS`, not in `WRITE_TOOLS` — so the identity check is unaffected and the
write guard is untouched. Ending PIE is not a write; it discards the throwaway
PIE world and restores the state the guard protects.

---

## What is next

1. **Widen `epic_call`.** Epic ships ~1,035 tools across 55 toolsets in UE 5.8
   as Python modules under `Engine/Plugins/Experimental/Toolsets/`. `epic_call`
   already imports and invokes them and verifies the effect; the work is
   argument-coercion coverage and a catalogue. Nobody else in this market
   verifies persistence — not Epic, not ue-mcp, not Ultimate Engine CoPilot,
   whose own README assigns validation to the user.
2. **Find the `PHX_` scene**, or retire gate 3.
3. A shared skill corpus with a `runtime:` tag (`ue5` / `browser` / `both`).
   Now unblocked: the ue5 half describes tools that have been watched running.
4. Do **not** import NINJA_ENGINE into this repo. Two runtimes.

---

## Protocol for the next session

Earlier in this project an assistant claimed a 2,000-line verified v2 bridge
and 58/58 tests. None of it existed.

The guard is mechanical:

- A file is real when it has been **read in this session**.
- A test passes when its **output has been seen**.
- Version claims resolve against the `TOOLS` dict or the Output Log, never a
  filename or a document.
- "I cannot reach that" is a complete and acceptable answer.

This applies to claims about *other people's* software too. A competitor's
transport was reported broken in this project on the strength of a client bug
in our own harness. Establish it yourself before repeating it.

---

## Identifiers

| Item | Value |
|---|---|
| Repo | github.com/scambria0838-gif/unreal · PR #3 |
| Branch | `cursor/superninja-v2-source-of-truth-97ac` |
| Project | `C:\Users\steve\Projects\SuperNinja\important\ue5_project\NINJA` |
| Sidecar | `Plugins/SuperNinjaAI` (Python-only, `"Modules": []`) |
| Bridge dir | `<Project>\Saved\SuperNinja` |
| WP fixture | `/Game/SNV2_WP` — the only partitioned level in the project |
| Epic MCP | `127.0.0.1:8000`, `ModelContextProtocol.StartServer` |
| Editor Python | 3.11 — reject cpython-314 bytecode |
