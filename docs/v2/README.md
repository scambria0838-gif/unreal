# SuperNinja v2.1 — docs index

Patched SuperNinjaAI Unreal bridge. Fixes the five silent-success bugs from the
live session: unverified saves on World Partition levels, PIE contamination, no
read-after-write, duplicate spawns, and single-package saves.

**Start with `HANDOFF.md`.** That is the Windows completion playbook.
`TEST_RESULTS.md` states what the offline harness proved. The live Unreal
phase has **not** run.

| File | Read it when |
|---|---|
| `HANDOFF.md` | First. What is verified, what is not, the three-step Windows gate. |
| `TEST_RESULTS.md` | What's proven offline, what isn't. |
| `INTEGRATION_GUIDE.md` | Installing v2 into the plugin folder. |
| `CHANGELOG.md` | You want to know exactly what changed and why. |
| `KNOWN_LIMITATIONS.md` | Before trusting v2 with something expensive. |
| `NEXT_SKILLS.md` | Planning the session *after* live-green. |
| `../../Plugins/SuperNinjaAI/Content/Python/superninja_bridge_v2.py` | The bridge. |
| `../../Plugins/SuperNinjaAI/Content/Python/init_unreal.py` | Entry point + inbox/outbox file watcher. |
| `../../tests/offline_verification_harness.py` | `python tests/offline_verification_harness.py` → 74/74. No Unreal needed. |
| `../../tests/live_smoke_test.py` | Against the real Editor. Writes `TEST_RESULTS_live.md`. |
| `../../tools/phx_dedupe.py` | Phase 4 — PHX_ duplicate cleanup. Dry-run by default. |

## The 60-second version

```bash
# 1. prove the logic, no Unreal required
python tests/offline_verification_harness.py

# 2. install from THIS REPO (not SUPERNINJA_V2_DELIVERY.zip)
#    powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1

# 3. restart the Editor, watch the Output Log for:
#    [SuperNinja v2] v2.1.0 registered, 14 tools
#    [SuperNinja v2] watcher started

# 4. prove it against the real Editor
python tests/live_smoke_test.py --bridge-dir "<Project>/Saved/SuperNinja"

# 5. clean up the duplicates (Editor Python console, preview first)
#    exec(open(r"...\tools\phx_dedupe.py").read())
#    run(apply=True, save=True)
```

## The rule this bridge is built around

`ok` is never `true` when `verified` is `false`. If a tool can't re-read the
target and see its own change, it fails — no matter what Unreal's return value
said. That is the bug being fixed; a v2 that papered over it would be worthless.
