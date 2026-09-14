# 🥷 SuperNinja AI — Unreal Engine Plugin

**Build entire games from natural language, directly inside the Unreal Editor.**

![SuperNinja AI](Resources/Icon1024.png)

Type a prompt → SuperNinja's 13 AI agents plan, build, validate, and iterate on your game **inside UE5**. No leaving the editor. No copy-paste. No friction.

```
"Build a scary game on the moon"     →  full playable level
"Make a neon cyberpunk alley"        →  full playable level
"Noir detective police station"      →  full playable level
```

---

## ✨ Features

- 🎛️ **Dockable editor panel** — full UI inside UE5 (Window → SuperNinja Builder)
- 🚀 **Toolbar button & main menu entry** — one-click access
- ⌨️ **Hotkey**: `Ctrl+Shift+N` = Quick Build
- 🧩 **Blueprint nodes** — call SuperNinja from any Blueprint
- 🐍 **Python bridge** — MSA agents drive the editor directly via the UE5 Python API
- 🔁 **Visual self-correction loop** — screenshots viewport, AI-critiques, iterates
- 📦 **6 one-click templates**: Lunar Horror, Arcade Racer, Fantasy RPG, Police Station, Open World, Cyberpunk Alley
- ☁️ **Cloud / 🏠 Local / 🔀 Hybrid modes**
- 🎨 **Cancel, clear, and monitor** running builds in real time

---

## 🏗️ Architecture

```
┌───────────────────────── UNREAL EDITOR ─────────────────────────┐
│                                                                 │
│  ┌──────────────────┐       ┌────────────────────────────────┐  │
│  │ Slate UI Panel   │◄─────►│  USuperNinjaSubsystem (C++)    │  │
│  │ (SuperNinja tab) │       │  - HTTP client                 │  │
│  └──────────────────┘       │  - Event system                │  │
│                              │  - Blueprint nodes             │  │
│                              └────────┬───────────────────────┘  │
│                                       │                          │
│  ┌────────────────────────────────────▼────────────┐             │
│  │  SuperNinjaBridge (Python)                      │             │
│  │  - spawn_actor, place_mesh, set_light           │             │
│  │  - import_asset, take_screenshot, save_level    │             │
│  │  - execute_python (full UE Python API)          │             │
│  └────────────────────┬────────────────────────────┘             │
└─────────────────────── │ ───────────────────────────────────────┘
                         │  HTTP/JSON
                         ▼
         ┌─────────────────────────────────┐
         │   Meta-Studio Agent (MSA)       │
         │   13 specialized AI agents      │
         │  ──────────────────────────────  │
         │  WorldAgent · LogicAgent        │
         │  MaterialAgent · AssetAgent     │
         │  LightingAgent · SpatialAgent   │
         │  BlueprintAgent · AnimAgent     │
         │  AutonomousAgent · CppAgent     │
         │  StyleAgent · BackendAgent      │
         │  AssetIntelligenceAgent         │
         └─────────────────────────────────┘
```

---

## 📥 Installation

### Option 1: Drop-In Plugin
```bash
# In your UE5 project:
YourProject/
└── Plugins/
    └── SuperNinjaAI/          ← extract the zip here
        ├── SuperNinjaAI.uplugin
        ├── Source/
        ├── Content/
        └── Resources/
```

Then **regenerate project files** and rebuild:
```bash
# Windows
"C:/Program Files/Epic Games/UE_5.x/Engine/Binaries/DotNET/UnrealBuildTool/UnrealBuildTool.exe" \
    -projectfiles -project="YourProject.uproject" -game -rocket

# Linux / Mac
Engine/Build/BatchFiles/Linux/Build.sh SuperNinjaAIEditor Linux Development -Project="YourProject.uproject"
```

### Option 2: Engine-Wide Install
Copy into `<UE5>/Engine/Plugins/Marketplace/SuperNinjaAI/` to enable across all projects.

### Option 3: Marketplace (coming soon)
Search "SuperNinja AI" in the Fab marketplace.

---

## 🎯 Prerequisites

- **Unreal Engine 5.3+** (5.4 / 5.5 supported)
- **Python Script Plugin** enabled (auto-enabled by SuperNinjaAI)
- **Editor Scripting Utilities** enabled (auto-enabled)
- **Remote Control API** enabled (auto-enabled)
- An API key from https://www.ninjatech.ai (for Cloud mode) **OR** a local MSA server

---

## 🚀 Quick Start

1. **Enable the plugin** — it auto-activates on launch
2. **Open the panel** — `Window → SuperNinja Builder` or click the ninja icon on the toolbar
3. **Configure** — Edit → Project Settings → SuperNinja AI → paste your API key
4. **Type a prompt** like `"Build a scary game on the moon"`
5. Click **🚀 Build**
6. Watch the agents build your game live in the viewport

---

## 🧠 Blueprint Usage

Drop these nodes into any Blueprint:

| Node | Description |
|------|-------------|
| `SuperNinja: Build From Prompt` | Send a prompt to the MSA |
| `Get Current Status` | Live agent state |
| `Build Level From Template` | Shortcut for preset genres |
| `Cancel Build` | Stop the running build |
| `Execute Tool` | Advanced — call a single MSA tool |

### Example: Build on button click
```
[Button Pressed] → [SuperNinja: Build From Prompt]
                    Prompt: "Medieval castle with a moat"
```

### Example: React to completion
```
[Event Begin Play] → [Get SuperNinja Subsystem]
                     → [Bind to On Build Complete]
                     
[On Build Complete] → [Print String "Game built!"]
                   → [Load Level (result.ModifiedLevels[0])]
```

---

## 🐍 Python Usage (Inside UE5)

Open `Window → Developer Tools → Python Editor`:

```python
import unreal

# Method 1: Via subsystem
subsystem = unreal.get_engine_subsystem(unreal.SuperNinjaSubsystem)
subsystem.build_from_prompt("Build a haunted mansion level")

# Method 2: Direct bridge call (for testing)
import superninja_bridge as snb
bridge = snb.SuperNinjaBridge()
bridge.execute_tool("place_static_mesh", json.dumps({
    "mesh_path": "/Engine/BasicShapes/Cube",
    "location": [0, 0, 100],
    "label": "TestCube"
}))
```

---

## 🛠️ Available Tools (Python Bridge)

| Tool | Purpose |
|------|---------|
| `spawn_actor` | Generic actor spawning |
| `place_static_mesh` | Place a specific mesh |
| `set_directional_light` | Configure sun/main light |
| `take_screenshot` | Viewport capture for QA |
| `save_level` | Persist changes |
| `create_folder` | Organize Content Browser |
| `import_asset` | FBX/OBJ/GLTF/texture import |
| `execute_python` | Arbitrary UE Python for custom ops |

Add your own in `Content/Python/superninja_bridge.py`.

---

## ⚙️ Settings

`Edit → Project Settings → Plugins → SuperNinja AI`

| Setting | Default | Description |
|---------|---------|-------------|
| Mode | `Cloud` | Cloud / Local / Hybrid |
| API Endpoint | `https://api.ninjatech.ai/v1/msa` | MSA server URL |
| API Key | *(empty)* | Your NinjaTech key |
| Auto Screenshot Validation | `true` | Visual QA loop |
| Max Iterations | `5` | Self-correction passes |
| Dry Run | `false` | Plan without executing |

---

## 📂 Plugin Structure

```
SuperNinjaAI/
├── SuperNinjaAI.uplugin           ← UE5 plugin descriptor
├── README.md                      ← this file
├── Resources/
│   ├── Icon128.png                ← toolbar/menu icon
│   ├── Featured.png               ← marketplace splash
│   └── Icon1024.png               ← high-res source
├── Config/
│   ├── DefaultSuperNinjaAI.ini    ← default settings
│   └── FilterPlugin.ini           ← packaging filter
├── Content/
│   └── Python/
│       ├── init_unreal.py         ← auto-loads on editor start
│       └── superninja_bridge.py   ← Python tool implementations
└── Source/
    ├── SuperNinjaAI/              ← Runtime module
    │   ├── SuperNinjaAI.Build.cs
    │   ├── Public/
    │   │   ├── SuperNinjaAI.h
    │   │   ├── SuperNinjaTypes.h
    │   │   ├── SuperNinjaSubsystem.h
    │   │   └── SuperNinjaBlueprintLibrary.h
    │   └── Private/
    │       ├── SuperNinjaAI.cpp
    │       ├── SuperNinjaSubsystem.cpp
    │       └── SuperNinjaBlueprintLibrary.cpp
    └── SuperNinjaAIEditor/        ← Editor-only module
        ├── SuperNinjaAIEditor.Build.cs
        ├── Public/
        │   ├── SuperNinjaAIEditor.h
        │   └── SSuperNinjaBuilderPanel.h
        └── Private/
            ├── SuperNinjaAIEditor.cpp
            └── SSuperNinjaBuilderPanel.cpp
```

---

## 🧪 Local MSA Server (No Cloud Needed)

Run SuperNinja fully offline:

```bash
cd ai_game_builder/
pip install -r requirements.txt
python -m msa_main --serve --port 8765
```

Then in the plugin settings:
- **Mode**: `Local`
- **API Endpoint**: `http://localhost:8765/v1/msa`

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Plugin doesn't load | Check `Output Log` for `LogSuperNinja` messages; ensure `PythonScriptPlugin` is enabled |
| "HTTP 401" in log | Add your API key in project settings |
| Python bridge not found | Verify `Content/Python/init_unreal.py` ran — check the output log |
| Slate widgets missing | Rebuild: delete `Intermediate/` and `Binaries/` and regenerate |

---

## 📜 License

Proprietary — NinjaTech AI © 2025. For evaluation and personal use.
Contact enterprise@ninjatech.ai for commercial licensing.

---

## 🔗 Links

- 🌐 [NinjaTech AI](https://www.ninjatech.ai)
- 📖 [Documentation](https://www.ninjatech.ai/docs/superninja-ue)
- 💬 [Discord](https://discord.gg/ninjatech)
- 🐛 [Report Issues](https://github.com/ninjatech-ai/superninja-ue/issues)

---

**Built with 🥷 by NinjaTech AI**