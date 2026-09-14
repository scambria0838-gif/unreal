# PIE guard - live evidence, and why the smoke test cannot close it alone

Captured 2026-09-13 on the Windows box, UE 5.8.0-55116800, NINJA project,
bridge v2.1.0, level `/Game/SNV2_Scratch`.

The smoke test's PIE section requires a human to press Alt-P and then Stop.
PIE entry turned out to be scriptable; **PIE exit is not**, for a reason worth
recording. Four of the six PIE checks were therefore verified out of band, and
two were verified indirectly. None of it came from the smoke test.

## Entering PIE from the bridge works

`editor_request_begin_play()` via `execute_python` puts the editor in PIE, and
the guard sees it immediately:

| Request | ok | verified | world_context |
|---|---|---|---|
| `bridge_health` during PIE | true | true | **PIE** |
| `spawn_actor` during PIE | **false** | false | PIE |
| `save_level` during PIE | **false** | false | PIE |

Refusal text, verbatim:

> editor is in PIE mode, refusing write to prevent contamination. Any actor
> spawned now lives in the duplicated PIE world and is destroyed when you
> press Stop.

That covers four flagship checks: spawn refused, context reported as PIE,
refusal message names PIE mode, save also refused.

## Leaving PIE from the bridge does not work - and that is now fixed

**Superseded 2026-09-13, later the same session.** The deadlock below was
real, and the fix is a control channel in the watcher rather than a change to
the guard. Read the rest of this section for why the deadlock existed; the
resolution is at the end.

### The deadlock (as originally found)

`execute_python` is in `WRITE_TOOLS`. Once the editor is in PIE, the guard
refuses it like any other write. So the call that would end PIE is refused by
the same rule that makes the guard correct:

```
5. exit PIE   ok=False verified=False ctx=PIE
   reason: editor is in PIE mode, refusing write to prevent contamination...
```

**The bridge can enter PIE and cannot leave it.** This is not a bug in the
guard - narrowing the guard to let `execute_python` through during PIE would
reopen the exact contamination hole it exists to close. But it does mean PIE
exit is a human action, or an action for something outside the bridge, and any
attempt to automate the smoke test end-to-end will hit this wall.

Three non-bridge routes were tried and none ended PIE:

- the Premium plugin's `:8765` queue, `run_python_snippet` calling
  `editor_request_end_play()` - accepted and consumed (`queue_length: 0`,
  `unreal_connected: true`), PIE continued
- the same call deferred to a Slate post-tick callback - no effect
- `unreal.EditorLevelLibrary.editor_end_play` - present in `dir()`, not reached

The editor was ultimately restarted.

## The two remaining checks, verified indirectly

After a clean restart with the scratch level reloaded:

- **nothing leaked into the level from the PIE attempt** - a scan for
  `SNV2_*` labels returned `result == 0` against the *saved* map. Stronger
  than the in-session check the smoke test would have run, since it survives a
  reload rather than reading live editor state.
- **context back to Editor after PIE exit** - `world_context: Editor`. Weaker
  than the real check: this is context after a restart, not after a PIE exit.
  Treat it as unproven until someone presses Stop.

Also confirmed by the restart: `v2.1.0 registered, 14 tools` and
`watcher started` appear again, so registration survives an editor restart.

### Resolution: a control channel, not a weaker guard

`init_unreal.py` now handles requests shaped `{"control": "..."}` before tool
dispatch, supporting `pie_state`, `begin_play` and `end_play`. They are not
tools: not in `TOOLS`, not in `WRITE_TOOLS`, so the 14-tool identity check is
unchanged and the write guard is untouched. None of them can modify the
scene. Ending PIE is not a write - it is the operation that *discards* the
throwaway PIE world and restores the state the guard protects.

`live_smoke_test.py --auto-pie` drives PIE through that channel. Because
begin/end are serviced on a later tick, it polls `pie_state` until the editor
actually transitions rather than trusting the immediate reply.

Verified live, no keyboard:

```
--- PIE guard ---
PASS  editor entered PIE
PASS  spawn refused during PIE
PASS  world_context reported as PIE
PASS  refusal message names PIE mode
PASS  save also refused during PIE
PASS  editor left PIE
PASS  context back to Editor after PIE exit
PASS  nothing leaked into the level from the PIE attempt

26 passed, 0 failed, 0 skipped, of 26 live checks
```

## Reproducing the full pass

The run must happen on a World Partition level, or the two external-actor
checks skip and the report reads NOT VERIFIED. `/Game/SNV2_WP` is the
fixture. The editor does not reliably open it: a map name on the command line
is ignored, and loading a WP level *through the watcher* risks the assertion
in KNOWN_LIMITATIONS.md. Set it in `Config/DefaultEngine.ini`:

```ini
[/Script/EngineSettings.GameMapsSettings]
EditorStartupMap=/Game/SNV2_WP.SNV2_WP
```

then restart the editor, let World Partition finish streaming, and run:

```
python tests/live_smoke_test.py --bridge-dir <project>/Saved/SuperNinja --auto-pie
```

This file's own config change was reverted after the verified run; the line
above is the only manual step.
