# Integration guide — SuperNinjaBridge v2.1

Install from **this git repo**, not from `SUPERNINJA_V2_DELIVERY.zip`.
That zip is **v2.0.0 / 9 tools**. The Editor cutover is **v2.1.0 / 14 tools**.

This Cloud Agent cannot reach `C:\`, restart Unreal, or run the live smoke
test. You run the steps below on the Windows Editor box.

Until `tests/live_smoke_test.py` passes on that box, treat every Editor
claim as **unverified-until-live**.

---

## 0. Find the project

Typical locations:

```
C:\Users\steve\Documents\Unreal Projects\NINJA\NINJA.uproject
C:\Users\steve\OneDrive\Documents\Unreal Projects\NINJA\NINJA.uproject
```

Plugin Python folder is one of:

```
<Project>\Plugins\SuperNinjaAI\Content\Python\
<Project>\Plugins\ninja\Content\Python\
```

Do **not** copy `__pycache__` or `*.cpython-314.pyc`. Those are CPython 3.14.
UE 5.8 embeds CPython 3.11.

---

## 1. One-shot install (preferred)

From a clone of this repo on the Windows box:

```powershell
cd <this-repo>
# double-click tools\START_V21_CUTOVER.bat  or:
python tools\install_v2_onto_editor.py
python tools\install_v2_onto_editor.py --project "C:\Users\steve\Documents\Unreal Projects\NINJA"
python tools\install_v2_onto_editor.py --what-if
python tools\install_v2_onto_editor.py --copy-skill
# PowerShell twin (same contract):
powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1
```

The script:

1. Backs up existing `superninja_bridge.py` and `init_unreal.py` to
   `*.v1.bak.py` and a timestamped `*.v1.bak.<stamp>.py`
2. Copies **only** these three files from the repo:
   - `Plugins/SuperNinjaAI/Content/Python/superninja_bridge_v2.py`
   - `Plugins/SuperNinjaAI/Content/Python/superninja_bridge.py` (shim)
   - `Plugins/SuperNinjaAI/Content/Python/init_unreal.py` (watcher)
3. Refuses to copy if the source is not v2.1.0
4. Never copies `.pyc` / `__pycache__`

---

## 2. Manual copy (same files, same order)

```powershell
$src  = "C:\Path\To\this-repo\Plugins\SuperNinjaAI\Content\Python"
$plug = "C:\Path\To\NINJA\Plugins\SuperNinjaAI\Content\Python"

Copy-Item "$plug\superninja_bridge.py" "$plug\superninja_bridge.v1.bak.py"
Copy-Item "$plug\init_unreal.py"       "$plug\init_unreal.v1.bak.py"

Copy-Item "$src\superninja_bridge_v2.py" $plug -Force
Copy-Item "$src\superninja_bridge.py"    $plug -Force
Copy-Item "$src\init_unreal.py"          $plug -Force
```

`init_unreal.py` is what Unreal auto-runs on plugin load. It imports
`superninja_bridge_v2` and starts the inbox/outbox watcher.

---

## 3. Restart the Editor and check the Output Log

You want:

```
[SuperNinja v2] Python bridge initializing...
[SuperNinja v2] v2.1.0 registered, 14 tools: bridge_health, create_folder, destroy_actor, execute_python, find_actors, import_asset, place_static_mesh, save_level, save_level_as, set_actor_transform, set_directional_light, set_viewport_camera, spawn_actor, take_screenshot
[SuperNinja v2] watcher started
[SuperNinja v2]   inbox  C:\...\NINJA\Saved\SuperNinja\sn_inbox
[SuperNinja v2]   outbox C:\...\NINJA\Saved\SuperNinja\sn_outbox
```

Reject **v2.0.0 / 9 tools** — that is the old Drive delivery zip, not this repo.

Copy the inbox path. To override the bridge folder, set
`SUPERNINJA_BRIDGE_DIR` before launching the Editor.

If the watcher line never appears but "registered" does: the Slate tick
callback failed. The bridge still works via
`superninja_execute_tool("bridge_health", "{}")`.

---

## 4. First request

```powershell
$inbox = "C:\Path\To\NINJA\Saved\SuperNinja\sn_inbox"
'{"tool":"bridge_health","args":{}}' | Set-Content "$inbox\health.json" -Encoding utf8
Start-Sleep 2
Get-Content "C:\Path\To\NINJA\Saved\SuperNinja\sn_outbox\health.json"
```

Expect `bridge_version` = `2.1.0`, `world_context` = `Editor`.

---

## 5. Live smoke test (proves the Editor, not this repo)

```powershell
python tests\live_smoke_test.py --bridge-dir "C:\Path\To\NINJA\Saved\SuperNinja"
```

It spawns, duplicates, saves, verifies against `__ExternalActors__`, asks
you to press Alt-P for the PIE test, cleans up, and writes
`TEST_RESULTS_live.md`. Until that file exists with a full pass, do not
treat Editor behaviour as verified.

---

## 6. Optional Desktop skill

```powershell
powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1 -CopySkill
```

or copy `skills/superninja-v2/SKILL.md` to
`C:\Users\steve\Desktop\skill\superninja-v2\SKILL.md`.

---

## 7. PHX_ duplicates (preview first)

In the Editor Python console:

```
exec(open(r"C:\Path\To\this-repo\tools\phx_dedupe.py").read())
```

Nothing is destroyed. When the plan looks right:

```
run(apply=True, save=True)
```

---

## Request format

```json
{ "tool": "spawn_actor",
  "args": { "class_path": "/Script/Engine.StaticMeshActor",
            "location": [0, 0, 300],
            "label": "PHX_Cruiser_01",
            "on_duplicate": "error" } }
```

| Argument | Effect |
|---|---|
| `dry_run: true` | Report what would happen; change nothing. |
| `allow_pie: true` | Override the PIE refusal for this call only. |
| `on_duplicate` | `"error"` (default), `"skip"`, `"replace"`. |
| `expect_added` / `expect_removed` | `save_level` asserts this many external-actor files changed. |
| `expect` | `execute_python` only — expression that must be truthy afterwards. |
| `settle_seconds` | `save_level` wait before re-snapshotting (default 1.0). |

---

## Rolling back

```powershell
Copy-Item "$plug\superninja_bridge.v1.bak.py" "$plug\superninja_bridge.py" -Force
Copy-Item "$plug\init_unreal.v1.bak.py"       "$plug\init_unreal.py" -Force
```

Restart the Editor.

---

## Write boundary

`superninja_bridge_v2.MANIFEST["allowed_content_roots"]` defaults to
`["/Game/"]`. Engine and plugin content are refused unless you append a
root for the session.
