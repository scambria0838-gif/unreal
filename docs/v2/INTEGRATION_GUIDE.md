# Integration guide — SuperNinjaBridge v2

Ten minutes, four steps. Nothing here overwrites v1 until you say so.

---

## 0. Before you start

Find your real project. The prompt this work came from says
`C:\Users\sbcam\OneDrive\Documents\Unreal Projects\NINJA\NINJA.uproject`, but on
the machine this was built on there is no `sbcam` user and no such project — only
flattened doc dumps. So: locate `NINJA.uproject`, and confirm the plugin lives at

```
<Project>\Plugins\ninja\Content\Python\superninja_bridge.py
<Project>\Plugins\ninja\Content\Python\init_unreal.py
```

(the folder may be `Plugins\SuperNinjaAI\` instead — either is fine, the files
are what matter).

Also confirm your engine version. UE **5.8** is what's installed on this machine;
the kit docs say 5.7. v2 targets the 5.x editor-subsystem API and falls back to
the legacy `EditorLevelLibrary` names, so both work — but note which one you're
on, because `TEST_RESULTS.md` needs it.

---

## 1. Back up v1

```powershell
$plug = "C:\Path\To\NINJA\Plugins\ninja\Content\Python"
Copy-Item "$plug\superninja_bridge.py" "$plug\superninja_bridge.v1.bak.py"
Copy-Item "$plug\init_unreal.py"       "$plug\init_unreal.v1.bak.py"
```

---

## 2. Copy the v2 files in

```powershell
$src  = "C:\Path\To\SUPERNINJA_V2_DELIVERY"
$plug = "C:\Path\To\NINJA\Plugins\ninja\Content\Python"

Copy-Item "$src\superninja_bridge_v2.py" $plug
Copy-Item "$src\init_unreal_v2.py"       $plug
```

Two ways to activate it:

**Option A — side by side (recommended for the first run).** Leave v1's
`init_unreal.py` alone and load v2 by hand from the Editor's Python console:

```
exec(open(r"C:\Path\To\NINJA\Plugins\ninja\Content\Python\init_unreal_v2.py").read())
```

Nothing changes on restart; you can compare v1 and v2 responses on the same
editor session.

**Option B — make it the default.** Replace the auto-run entry point:

```powershell
Copy-Item "$src\init_unreal_v2.py" "$plug\init_unreal.py" -Force
```

`init_unreal.py` is what Unreal auto-runs on plugin load; the file's own name
doesn't matter beyond that, and it imports `superninja_bridge_v2` explicitly.

---

## 3. Restart the Editor and check the Output Log

You want these lines:

```
[SuperNinja v2] Python bridge initializing...
[SuperNinja v2] v2.0.0 registered, 9 tools: bridge_health, create_folder, ...
[SuperNinja v2] watcher started
[SuperNinja v2]   inbox  C:\...\NINJA\Saved\SuperNinja\sn_inbox
[SuperNinja v2]   outbox C:\...\NINJA\Saved\SuperNinja\sn_outbox
[SuperNinja v2]   poll   750 ms
[SuperNinja v2] bridge v2.0.0 ready. Drop a request in C:\...\sn_inbox
```

Copy that inbox path — everything else uses it.

If you'd rather put the bridge folder somewhere else (Desktop, a synced folder),
set `SUPERNINJA_BRIDGE_DIR` before launching the Editor:

```powershell
[Environment]::SetEnvironmentVariable("SUPERNINJA_BRIDGE_DIR","C:\Users\<you>\Desktop\sn_bridge","User")
```

Then the folders become `...\sn_bridge\sn_inbox` and `...\sn_bridge\sn_outbox`.

**If the watcher line never appears** but the "registered" line does: the Slate
tick callback failed to register. The bridge still works via the console —
`superninja_execute_tool("bridge_health", "{}")` — and the log will say why.

---

## 4. First request

```powershell
$inbox = "C:\Path\To\NINJA\Saved\SuperNinja\sn_inbox"
'{"tool":"bridge_health","args":{}}' | Set-Content "$inbox\health.json" -Encoding utf8
Start-Sleep 2
Get-Content "C:\Path\To\NINJA\Saved\SuperNinja\sn_outbox\health.json"
```

You should get back UE version, world context, whether your level is World
Partition, the external-actors count, dirty packages, source-control state, and
any conflicting plugins.

---

## 5. Run the live smoke test

```bash
python tests/live_smoke_test.py --bridge-dir "C:/Path/To/NINJA/Saved/SuperNinja"
```

It spawns, duplicates, saves, verifies against `__ExternalActors__`, asks you to
press Alt-P for the PIE test, cleans up after itself, and writes
`TEST_RESULTS_live.md`. That file is the one that proves v2 works on *your*
machine — the shipped `TEST_RESULTS.md` only covers what could be verified
without an Editor.

---

## 6. Clean up the PHX_ duplicates (Phase 4)

In the Editor's Python console — preview first:

```
exec(open(r"C:\Path\To\SUPERNINJA_V2_DELIVERY\tools\phx_dedupe.py").read())
```

It prints every label group, how many copies exist, and which one it would keep.
Nothing is destroyed. When the plan looks right:

```
run(apply=True, save=True)
```

`save=True` routes the save through `tool_save_level`, so you get the
external-actor diff as proof — `expect_removed` is set to the number of actors
destroyed, and the save fails loudly if that many files don't disappear.

---

## Request format reference

Single tool:

```json
{ "tool": "spawn_actor",
  "args": { "class_path": "/Script/Engine.StaticMeshActor",
            "location": [0, 0, 300],
            "label": "PHX_Cruiser_01",
            "on_duplicate": "error" } }
```

Plan (stops at the first failure):

```json
{ "dry_run": false,
  "stop_on_failure": true,
  "steps": [
    { "id": 1, "tool": "place_static_mesh",
      "args": { "mesh_path": "/Game/KB3D/SM_Barrier", "label": "PHX_Barrier_01" } },
    { "id": 2, "tool": "save_level", "args": { "expect_added": 1 } }
  ] }
```

Useful arguments across the write tools:

| Argument | Effect |
|---|---|
| `dry_run: true` | Report what would happen; change nothing. |
| `allow_pie: true` | Override the PIE refusal for this call only. |
| `on_duplicate` | `"error"` (default), `"skip"`, `"replace"`. |
| `expect_added` / `expect_removed` | `save_level` asserts this many external-actor files changed. |
| `expect` | `execute_python` only — a Python expression that must be truthy afterwards. |
| `settle_seconds` | `save_level` wait before re-snapshotting the tree (default 1.0). Raise it on a slow disk or a very large level. |

---

## Rolling back

```powershell
Copy-Item "$plug\superninja_bridge.v1.bak.py" "$plug\superninja_bridge.py" -Force
Copy-Item "$plug\init_unreal.v1.bak.py"       "$plug\init_unreal.py" -Force
```

Restart the Editor. v2's files can stay where they are; nothing auto-loads them
once `init_unreal.py` is back to v1.

---

## Tightening the write boundary

`superninja_bridge_v2.MANIFEST["allowed_content_roots"]` defaults to `["/Game/"]`
— engine and plugin content are refused. To allow a specific extra root for a
session, from the Editor console:

```python
import superninja_bridge_v2 as sb
sb.MANIFEST["allowed_content_roots"].append("/Engine/BasicShapes/")
```

Add your own conflict-prone plugin names to
`sb.MANIFEST["known_conflicting_plugins"]` and `bridge_health` will flag them.
