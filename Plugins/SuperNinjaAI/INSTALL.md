# 🔧 SuperNinja AI — Quick Install Guide

## 📋 Prerequisites Check

- [x] **Unreal Engine 5.3 or newer** installed
- [x] **Visual Studio 2022** (Windows) / **Xcode 14+** (Mac) / **clang-14+** (Linux) — required to compile C++ plugins
- [x] A UE5 **C++ project** (not Blueprint-only)
- [x] At least **4GB free disk space**

---

## 🚀 3-Step Installation

### Step 1 — Copy the Plugin

```bash
# Navigate to your UE5 project
cd /path/to/MyProject

# Create Plugins folder if it doesn't exist
mkdir -p Plugins

# Copy SuperNinjaAI folder
cp -r /path/to/SuperNinjaAI Plugins/
```

Your project should look like:
```
MyProject/
├── MyProject.uproject
├── Source/
└── Plugins/
    └── SuperNinjaAI/            ← right here
        └── SuperNinjaAI.uplugin
```

### Step 2 — Regenerate Project Files

**Windows:**
- Right-click `MyProject.uproject` → **Generate Visual Studio project files**

**Mac / Linux:**
```bash
# Replace with your UE5 install path
/Applications/EpicGames/UE_5.3/Engine/Build/BatchFiles/Mac/GenerateProjectFiles.sh MyProject.uproject
```

### Step 3 — Build

**From the Editor (easiest):**
1. Open `MyProject.uproject` — UE5 will prompt "Missing Modules"
2. Click **Yes** to build
3. Wait ~2-5 minutes for first-time compile
4. Editor launches with SuperNinjaAI enabled ✅

**From command line:**
```bash
# Linux
/path/to/UE5/Engine/Build/BatchFiles/Linux/Build.sh \
    MyProjectEditor Linux Development \
    -Project=/path/to/MyProject.uproject -waitmutex

# Windows (from a Developer PowerShell)
& "C:/Program Files/Epic Games/UE_5.3/Engine/Build/BatchFiles/Build.bat" `
    MyProjectEditor Win64 Development `
    -Project="C:/path/to/MyProject.uproject" -waitmutex
```

---

## ✅ Verify Installation

1. Open your project in UE5
2. Go to **Edit → Plugins** → search `SuperNinja` — should show as **enabled**
3. Top toolbar should now show a **🥷 ninja icon**
4. Menu bar: **Tools → SuperNinja AI → SuperNinja Builder**
5. Press `Ctrl+Shift+N` — the Builder panel should open
6. Open **Output Log**, filter by `LogSuperNinja` — you should see:
   ```
   LogSuperNinja: SuperNinjaAI runtime module started.
   LogSuperNinja: SuperNinjaSubsystem initialized.
   LogSuperNinja: SuperNinjaAI Editor module starting.
   LogSuperNinja: 🥷 SuperNinjaAI — bridge registered successfully.
   ```

---

## 🔑 First Use

1. **Edit → Project Settings → Plugins → SuperNinja AI**
2. Paste your API key (or start a local server — see `README.md`)
3. Open the **SuperNinja Builder** panel
4. Try a template: click **🌙 Lunar Horror**
5. Click **🚀 Build**

---

## 🐛 If Something Goes Wrong

**Build errors?**
- Delete `Intermediate/`, `Binaries/`, and `.vs/` folders
- Regenerate project files
- Rebuild

**Plugin won't load?**
- Check `Saved/Logs/*.log` — search for `SuperNinja`
- Verify `PythonScriptPlugin` is enabled in Edit → Plugins

**Python bridge errors?**
- Ensure Python Script Plugin is enabled
- `Window → Developer Tools → Output Log` → filter `Python`

**Still stuck?** Open an issue at https://github.com/ninjatech-ai/superninja-ue/issues with your full log.