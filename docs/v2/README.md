# SUPERNINJA_V2_DELIVERY

Patched SuperNinjaAI Unreal bridge. Fixes the five silent-success bugs from the
live session: unverified saves on World Partition levels, PIE contamination, no
read-after-write, duplicate spawns, and single-package saves.

**Start with `TEST_RESULTS.md`.** It states plainly what was tested and what was
not — the live Unreal phase did not run, because the NINJA project does not
exist on the machine this was built on.

| File | Read it when |
|---|---|
| `TEST_RESULTS.md` | First. What's proven, what isn't, what to run to close the gap. |
| `INTEGRATION_GUIDE.md` | Installing v2 into the plugin folder. ~10 minutes. |
| `CHANGELOG.md` | You want to know exactly what changed and why. |
| `KNOWN_LIMITATIONS.md` | Before trusting v2 with something expensive. |
| `NEXT_SKILLS.md` | Planning the next session. |
| `superninja_bridge_v2.py` | The bridge. Drop-in replacement for `superninja_bridge.py`. |
| `init_unreal_v2.py` | Entry point + inbox/outbox file watcher. Replaces `init_unreal.py`. |
| `tests/offline_verification_harness.py` | `python tests/offline_verification_harness.py` → 58/58. Runs anywhere, no Unreal needed. |
| `tests/live_smoke_test.py` | Against the real Editor. Writes `TEST_RESULTS_live.md`. |
| `tests/offline_harness_output.txt` | Raw output of the offline run. |
| `tools/phx_dedupe.py` | Phase 4 — PHX_ duplicate cleanup. Dry-run by default. |

## The 60-second version

```bash
# 1. prove the logic, no Unreal required
python tests/offline_verification_harness.py

# 2. install (see INTEGRATION_GUIDE.md for the careful version)
copy superninja_bridge_v2.py init_unreal_v2.py  <Project>\Plugins\ninja\Content\Python\

# 3. restart the Editor, watch the Output Log for:
#    [SuperNinja v2] watcher started
#    [SuperNinja v2]   inbox  <Project>\Saved\SuperNinja\sn_inbox

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
