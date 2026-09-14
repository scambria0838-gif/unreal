# SuperNinja Unreal plugin — v2 source of truth

This repository is the version-controlled copy of the SuperNinja v2 Editor
bridge that previously lived only on a Windows box and in Drive zips.

**The running Editor stays on whatever is installed there until you copy
these files over.** Nothing in this repo has been executed against a live
UE 5.8 Editor. Live claims are marked **unverified-until-live**.

## Layout

```
Plugins/SuperNinjaAI/          whole plugin (C++ + Python)
  Content/Python/
    superninja_bridge_v2.py    verified bridge (v2.1.0)
    superninja_bridge.py       shim that re-exports v2
    init_unreal.py             inbox/outbox watcher
    *.v1.original.py           archived v1, for the diff
  Source/                      C++ unchanged from the Drive plugin zip
docs/v2/                       delivery notes (changelog, limits, tests)
tests/                         offline harness + envelope/poller checks
tools/
  sn_unreal_nonblocking_phase2.py   cloud-poll / local-8765 hard-reject
  phx_dedupe.py                     PHX_ duplicate cleanup (dry-run)
.cursor/skills/superninja-v2/  v2-native SKILL.md
```

## Do not copy `.pyc`

The Drive plugin zip included `__pycache__/*.cpython-314.pyc`. Magic
`0x0e2b` is CPython 3.14. UE 5.8 embeds CPython 3.11. Those files are
excluded here on purpose.

## Prove the logic (no Editor)

```bash
python tests/offline_verification_harness.py
python tests/test_envelope_and_poller.py
```

## Transports

- **cloud-poll** — drop JSON in `Saved/SuperNinja/sn_inbox`, read `sn_outbox`.
- **local-8765** — `http://127.0.0.1:8765` on the Windows Editor machine.
  From a Linux Cloud Agent this is a **hard reject**. We do not fall back.

## Install onto the Editor

This Linux Cloud Agent cannot reach `C:\` or restart Unreal. On the
Windows Editor box, from a clone of **this repo** (not the Drive v2.0
delivery zip):

```powershell
python tools\install_v2_onto_editor.py
# or: tools\START_V21_CUTOVER.bat
# or: powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1
```

That backs up v1, copies the three `.py` files, and refuses `.pyc`.
Restart the Editor. Output Log must show **v2.1.0 / 14 tools** and
`[SuperNinja v2] watcher started`. Then:

```powershell
python tests\live_smoke_test.py --bridge-dir "<Project>\Saved\SuperNinja"
```

Full detail: `docs/v2/INTEGRATION_GUIDE.md`.
