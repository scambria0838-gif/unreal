# SuperNinja v2.1 Handoff

The bridge exists and passes static tests. **It is not installed.** Nothing
about its behaviour inside a running Editor has been observed by anyone.

Prepared 2026-09-14. Repo `scambria0838-gif/unreal` · PR #3 · Project NINJA
(UE 5.8). Blocked on the live smoke test.

One sentence for the next chat: **SuperNinja v2.1 (14 tools) is in PR #3 of
`scambria0838-gif/unreal` and has never been installed; the Editor is still
on v1; the only remaining work is install, restart, run
`tests/live_smoke_test.py`, and paste `TEST_RESULTS_live.md` back.**

---

## The goal

An agent that can change an Unreal scene and **prove the change survived**.

Every failure this project exists to fix is the same failure: a write
reported success when nothing persisted. Fifty-three duplicate `PHX_`
actors. Spawns that vanished on PIE exit. A `save_level` that returned
true while the World Partition tree went untouched.

The rule the architecture hangs off: **a tool that cannot verify its own
change returns `ok=false`.** "I could not confirm" is a failure, never a
success. Do not weaken `_result()`.

---

## Three versions. Confusing them wastes the session.

| Version | Tools | Where | Status |
|---|---|---|---|
| v1 | 8 | Running in the Editor right now | Live. All five original bugs. |
| v2.0.0 | 9 | Local `SUPERNINJA_V2_COMPLETE\` and the Drive zip | **Superseded. Do not install.** |
| v2.1.0 | 14 | This repo, PR #3 | **Target. Install from the repo, never the zip.** |

v2.1 adds `find_actors`, `destroy_actor`, `set_actor_transform`,
`set_viewport_camera`, `save_level_as` on top of the original nine.

After restart, the Output Log must say `v2.1.0 registered, 14 tools`. If
it says `v2.0.0` or `9 tools`, the old delivery won — delete
`Content/Python/superninja_bridge*.py` by hand and re-run the installer.

---

## Evidence ledger

A fresh session should treat anything not marked **Verified** as an open
question. "Verified in-repo" is not "verified in the Editor."

| Claim | Status | How it is known |
|---|---|---|
| v2.1.0 exists; `TOOLS` has 14 keys; `_result()` forces `ok=false` when `verified` is false | **Verified in-repo** | Source read this session; `BRIDGE_VERSION` and `TOOLS` parsed; identity tests import the module |
| Installer backs up v1, copies only three `.py`, refuses `.pyc` / `__pycache__` | **Verified in-repo** | `tools/install_v2_onto_editor.py` read; fixture install in `test_install_v2.py` |
| Offline harness + envelope/poller + installer + kit + identity tests pass | **Verified static** | Re-run this session. Proves decision logic, **not** the UE API |
| `bridge_health` reports `tool_count` and `tools`; live smoke fail-fasts on 2.0.0 / 9 tools | **Verified static** | Added so a stale zip cannot look green |
| Partition / import / save fallbacks are coded (`is_partitioned_*`, `imported_object_paths`, `save_current_level`) | **Verified in-repo** | Read in `superninja_bridge_v2.py`. Names still unverified against live UE 5.8 |
| PIE refusal, `on_duplicate`, and World Partition save against a real `unreal` module | **Unverified** | Requires a running Editor. No one has observed this |
| NINJA_ENGINE_v1.9 is React + Three.js + Vite (browser, not Unreal) | **Verified (Drive metadata)** | `package.json` / README from Drive folder `1UlNt0qaQUoIT-1ueFmvdghOXOV_e4AO4`. Not in this repo. Not executed here |
| Engine `src/`, `.grok/skills/`, `server/` contents | **Unread as a corpus** | Do not import Engine into this repo |

`docs/v2/TEST_RESULTS.md` used to say 58/58 (nine tools). That number is
stale. Current harness count is **74/74**. `NEXT_SKILLS.md` already marks
`find_actors` / `destroy_actor` / `set_actor_transform` as shipped.

---

## Definition of done

Until all three hold, the project is incomplete regardless of how much
code exists or how many static tests pass.

1. The running Editor reports `v2.1.0` and `14 tools` — not v1, not the 9-tool zip.
2. `tests/live_smoke_test.py` produces a full-pass `TEST_RESULTS_live.md` on that machine.
3. The `PHX_` duplicate cleanup has been previewed, applied, and saved through the verified `save_level` path.

A cloud session cannot do any of this. There is no `C:\` and no Editor.

---

## Procedure — Windows box only

### 1. Get this repo on disk

If `C:\Users\steve\Desktop\unreal` already exists, fetch the PR branch.
Do not assume a missing clone; do not assume it is current.

```bat
cd C:\Users\steve\Desktop
if not exist unreal\.git git clone https://github.com/scambria0838-gif/unreal.git
cd unreal
git fetch origin
git checkout cursor/superninja-v2-source-of-truth-97ac
git pull origin cursor/superninja-v2-source-of-truth-97ac
dir tools\install_v2_onto_editor.ps1
```

`tools\install_v2_onto_editor.ps1` must exist before continuing.

### 2. Install onto NINJA (from this repo)

Preferred (copies skills too):

```bat
tools\START_V21_CUTOVER.bat
```

Or:

```powershell
python tools\install_v2_onto_editor.py --copy-skill
# if auto-detect misses the project:
python tools\install_v2_onto_editor.py --copy-skill --project "C:\Users\steve\Documents\Unreal Projects\NINJA"
```

Copies exactly three files into the plugin `Content/Python/`:
`superninja_bridge_v2.py`, `superninja_bridge.py`, `init_unreal.py`.

Never copy `__pycache__` or `*.cpython-314.pyc`. Those are CPython 3.14
bytecode. UE 5.8 runs Python 3.11.

`--copy-skill` writes `superninja-v2` and `game-dev-kit` as **sibling**
folders under `Desktop\skill\` (and the kit also into Daimon). Do not
nest SuperNinja under the kit.

### 3. Restart and confirm identity

Close the Editor fully, reopen NINJA, then read
Window → Developer Tools → Output Log. Two lines must appear:

```
[SuperNinja v2] watcher started
[SuperNinja v2] v2.1.0 registered, 14 tools: ...
```

Note the inbox path it prints (`...\Saved\SuperNinja\sn_inbox`). The next
step needs the parent directory.

### 4. Live smoke (the only evidence that matters)

```powershell
python tests\live_smoke_test.py --bridge-dir "C:\Users\steve\Documents\Unreal Projects\NINJA\Saved\SuperNinja"
```

This is the only evidence that matters. It fail-fasts if health is not
v2.1.0 / 14 tools. It exercises PIE refusal, `on_duplicate`, World
Partition `__ExternalActors__` diffs, and persistence. Two prompts need
you at the keyboard (Alt-P, then Stop).

### 5. PHX_ cleanup — only once the smoke test is green

In the Editor Python console:

```
exec(open(r"C:\Users\steve\Desktop\unreal\tools\phx_dedupe.py").read())
run(apply=False, save=False)   # preview first — always
run(apply=True,  save=True)    # then apply through verified save_level
```

Adjust the path if the clone is not on the Desktop.

### 6. Close the loop

Keep `TEST_RESULTS_live.md` and the Output Log excerpt. Paste both into
the next session. Merge PR #3 only once live-green.

---

## If the smoke test fails

The expected failure mode is an Unreal Python API name mismatch, not a
logic error. Three were flagged in advance:

- WorldSettings partition property names — `is_partitioned_world` vs
  `is_partitioned` vs `b_is_partitioned` (the bridge already tries all three)
- `AssetImportTask.imported_object_paths`
- The return type of `save_current_level`

Fix these in the repo against the live log. **Do not weaken `_result()`.**
Loosening the verification rule to make a test pass reintroduces the
exact bug the project exists to kill, and it will do so invisibly.

---

## After green — not before

1. **`tool_scene_diff`** — one scene verdict. Stops the PHX_ class of bug.
   Worth more than asset_validate, batch_spawn, and Blueprint edit combined.
2. A shared skill corpus with a `runtime:` tag (`ue5` / `browser` / `both`)
   is the right *shape* for SuperNinja + Ninja Engine. Doing it before
   live green writes `ue5` tags for tools nobody has confirmed exist.
3. Do **not** import NINJA_ENGINE into this repo. Two runtimes. Combining
   them produces something that looks substantial and does nothing.

`docs/v2/NEXT_SKILLS.md` is the ranked list. `set_actor_transform`,
`destroy_actor`, and `find_actors` are already shipped — do not rebuild them.

---

## Explicitly out of scope until live-green

- Ultimate Engine CoPilot and FlightDeck — different products
- `tool_scene_diff`, `tool_asset_validate`, `tool_blueprint_edit` — not required for completion
- Niagara, PCG, Sequencer tool names
- The Aikido scan — blocked unless the user is signed in
- Any claim from a cloud session that it exercised the Editor

---

## Protocol for the next session

Earlier in this project an assistant claimed a 2,000-line verified v2
bridge and 58/58 tests. None of it existed. The files on disk were
unpatched v1.

The guard is mechanical:

- A file is real when it has been **read in this session**.
- A test passes when its **output has been seen**. A cloud session cannot
  see Editor output, so it cannot report on Editor behaviour, in any wording.
- Version claims resolve against the `TOOLS` dict or the Output Log,
  never against a filename or a document.
- "I cannot reach that" is a complete and acceptable answer.

---

## Identifiers

| Item | Value |
|---|---|
| Repo | github.com/scambria0838-gif/unreal · PR #3 |
| Branch | `cursor/superninja-v2-source-of-truth-97ac` |
| Drive Engine folder | NINJA_ENGINE_v1.9 · `1UlNt0qaQUoIT-1ueFmvdghOXOV_e4AO4` |
| Drive Engine zip | `15aD5TQ2le_mDyT2oW9kdyxgZ6orfKtx2` · 2.5 MB · look only |
| Local stale zip | `C:\Users\steve\Downloads\unreal plugin\SUPERNINJA_V2_COMPLETE\` · v2.0.0 |
| Editor Python | 3.11 · reject cpython-314 bytecode |
