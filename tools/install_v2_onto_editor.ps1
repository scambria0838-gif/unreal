# SuperNinja v2.1 cutover - run on the Windows Editor box.
# This Cloud Agent cannot reach C:\ or restart Unreal. You run this locally.
#
#   powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1
#   powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1 -Project "C:\Users\steve\Documents\Unreal Projects\NINJA"
#   powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1 -WhatIf
#   powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1 -CopySkill
#
# Copies ONLY .py from this repo. Never copies __pycache__ or *.pyc
# (Drive cpython-314 bytecode is CPython 3.14; UE 5.8 embeds 3.11).

[CmdletBinding()]
param(
    [string]$Project = "",
    [string]$RepoRoot = "",
    [switch]$CopySkill,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$ExpectedVersion = "2.1.0"
$ExpectedToolCount = 14

function Resolve-RepoRoot {
    param([string]$Hint)
    if ($Hint) {
        $candidate = (Resolve-Path $Hint).Path
    } else {
        $candidate = Split-Path -Parent $PSScriptRoot
    }
    $bridge = Join-Path $candidate "Plugins\SuperNinjaAI\Content\Python\superninja_bridge_v2.py"
    if (-not (Test-Path $bridge)) {
        throw "RepoRoot does not contain Plugins\SuperNinjaAI\Content\Python\superninja_bridge_v2.py: $candidate"
    }
    return $candidate
}

function Find-ProjectRoot {
    param([string]$Hint)
    $guesses = @()
    if ($Hint) { $guesses += $Hint }
    $userHome = $env:USERPROFILE
    if ($userHome) {
        $guesses += @(
            (Join-Path $userHome "Documents\Unreal Projects\NINJA"),
            (Join-Path $userHome "OneDrive\Documents\Unreal Projects\NINJA"),
            (Join-Path $userHome "Documents\Unreal Projects\ninja"),
            (Join-Path $userHome "OneDrive\Documents\Unreal Projects\ninja")
        )
    }
    $guesses += @(
        "C:\Users\steve\Documents\Unreal Projects\NINJA",
        "C:\Users\steve\OneDrive\Documents\Unreal Projects\NINJA",
        "C:\Users\sbcam\OneDrive\Documents\Unreal Projects\NINJA"
    )

    foreach ($g in $guesses) {
        if (-not $g) { continue }
        if (Test-Path $g -PathType Leaf) {
            if ([IO.Path]::GetExtension($g) -eq ".uproject") {
                return (Split-Path -Parent $g)
            }
        }
        if (Test-Path $g -PathType Container) {
            $up = Get-ChildItem -Path $g -Filter "*.uproject" -File -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($up) { return $g }
        }
    }
    throw "Could not find NINJA.uproject. Pass -Project `"C:\path\to\NINJA`" (folder or .uproject)."
}

function Find-PluginPython {
    param([string]$ProjectRoot)
    $preferred = @(
        (Join-Path $ProjectRoot "Plugins\SuperNinjaAI\Content\Python"),
        (Join-Path $ProjectRoot "Plugins\SuperNinja\Content\Python"),
        (Join-Path $ProjectRoot "Plugins\ninja\Content\Python")
    )
    foreach ($p in $preferred) {
        if (Test-Path $p) { return $p }
    }
    # Plugins are often junctions to a tree outside the project, so the search
    # has to follow reparse points. Prefer a folder that already holds a bridge;
    # fall back to any plugin that auto-runs Python.
    $pluginRoot = Join-Path $ProjectRoot "Plugins"
    foreach ($marker in @("superninja_bridge.py", "init_unreal.py")) {
        $hits = Get-ChildItem -Path $pluginRoot -Recurse -Force -FollowSymlink -Filter $marker -File -ErrorAction SilentlyContinue |
            Where-Object { $_.DirectoryName -like "*\Content\Python" } |
            Select-Object -ExpandProperty DirectoryName -Unique
        if ($hits) { return @($hits)[0] }
    }
    throw "No SuperNinja Python folder under $ProjectRoot\Plugins. Expected SuperNinjaAI\Content\Python, SuperNinja\Content\Python or ninja\Content\Python."
}

function Assert-NoPyc {
    param([string]$Path)
    $name = [IO.Path]::GetFileName($Path)
    if ($name -like "*.pyc" -or $name -eq "__pycache__") {
        throw "Refusing to copy bytecode: $Path"
    }
}

function Backup-IfExists {
    param([string]$Path, [string]$Stamp, [switch]$DryRun)
    if (-not (Test-Path $Path)) {
        Write-Host "  skip backup (missing): $Path"
        return
    }
    $dir = Split-Path -Parent $Path
    $base = [IO.Path]::GetFileNameWithoutExtension($Path)
    $bakStamp = Join-Path $dir "$base.v1.bak.$Stamp.py"
    $bakLatest = Join-Path $dir "$base.v1.bak.py"
    if ($DryRun) {
        Write-Host "  WHATIF backup $Path -> $bakStamp"
        return
    }
    Copy-Item $Path $bakStamp -Force
    Copy-Item $Path $bakLatest -Force
    Write-Host "  backed up $Path"
    Write-Host "    $bakStamp"
}

function Copy-Py {
    param([string]$Src, [string]$DestDir, [switch]$DryRun)
    Assert-NoPyc $Src
    if (-not (Test-Path $Src)) { throw "Source missing: $Src" }
    $dest = Join-Path $DestDir ([IO.Path]::GetFileName($Src))
    Assert-NoPyc $dest
    if ($DryRun) {
        Write-Host "  WHATIF copy $Src -> $dest"
        return
    }
    Copy-Item $Src $dest -Force
    Write-Host "  copied $([IO.Path]::GetFileName($Src))"
}

$repo = Resolve-RepoRoot $RepoRoot
$srcPy = Join-Path $repo "Plugins\SuperNinjaAI\Content\Python"
$bridgeSrc = Join-Path $srcPy "superninja_bridge_v2.py"
$shimSrc = Join-Path $srcPy "superninja_bridge.py"
$initSrc = Join-Path $srcPy "init_unreal.py"

$bridgeText = Get-Content -Raw $bridgeSrc
if ($bridgeText -notmatch 'BRIDGE_VERSION\s*=\s*"2\.1\.0"') {
    throw "Source bridge is not v2.1.0. Do not install from SUPERNINJA_V2_DELIVERY (that zip is v2.0.0 / 9 tools). RepoRoot=$repo"
}
if ($bridgeText -notmatch '"find_actors"' -or $bridgeText -notmatch '"save_level_as"') {
    throw "Source bridge is missing v2.1 first-class tools. Wrong tree: $bridgeSrc"
}

$projectRoot = Find-ProjectRoot $Project
$plug = Find-PluginPython $projectRoot
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "Repo     $repo"
Write-Host "Project  $projectRoot"
Write-Host "Plugin   $plug"
Write-Host "Version  $ExpectedVersion / $ExpectedToolCount tools"
if ($WhatIf) { Write-Host "Mode     WHATIF (no writes)" }

# Refuse to pull bytecode from a Drive extract sitting next to the dest.
$pycHits = @()
if (Test-Path $plug) {
    $pycHits += @(Get-ChildItem -Path $plug -Filter *.pyc -Recurse -File -ErrorAction SilentlyContinue)
    $pycHits += @(Get-ChildItem -Path $plug -Filter __pycache__ -Recurse -Directory -ErrorAction SilentlyContinue)
}
if ($pycHits.Count -gt 0) {
    Write-Host "WARNING: destination already has bytecode (leave it; do not copy more):"
    $pycHits | ForEach-Object { Write-Host "  $($_.FullName)" }
}

Backup-IfExists (Join-Path $plug "superninja_bridge.py") $stamp -DryRun:$WhatIf
Backup-IfExists (Join-Path $plug "init_unreal.py") $stamp -DryRun:$WhatIf

Copy-Py $bridgeSrc $plug -DryRun:$WhatIf
Copy-Py $shimSrc $plug -DryRun:$WhatIf
Copy-Py $initSrc $plug -DryRun:$WhatIf

if ($CopySkill) {
    $skillSrc = Join-Path $repo "skills\superninja-v2\SKILL.md"
    if (-not (Test-Path $skillSrc)) {
        $skillSrc = Join-Path $repo ".cursor\skills\superninja-v2\SKILL.md"
    }
    if (-not (Test-Path $skillSrc)) { throw "SKILL.md missing in repo" }
    $appData = $env:APPDATA
    if (-not $appData) { $appData = Join-Path $env:USERPROFILE "AppData\Roaming" }
    $snDestDirs = @(
        (Join-Path $env:USERPROFILE "Desktop\skill\superninja-v2"),
        "C:\Users\steve\Desktop\skill\superninja-v2"
    ) | Select-Object -Unique
    foreach ($skillDestDir in $snDestDirs) {
        if ($WhatIf) {
            Write-Host "  WHATIF skill $skillSrc -> $skillDestDir\SKILL.md"
        } else {
            New-Item -ItemType Directory -Force -Path $skillDestDir | Out-Null
            Copy-Item $skillSrc (Join-Path $skillDestDir "SKILL.md") -Force
            Write-Host "  copied SKILL.md -> $skillDestDir"
        }
    }

    $kitSrc = Join-Path $repo "skills\game-dev-kit"
    if (-not (Test-Path (Join-Path $kitSrc "SKILL.md"))) {
        throw "game-dev-kit SKILL.md missing in repo"
    }
    $kitDestDirs = @(
        (Join-Path $env:USERPROFILE "Desktop\skill\game-dev-kit"),
        "C:\Users\steve\Desktop\skill\game-dev-kit",
        (Join-Path $appData "kimi-desktop\daimon-share\daimon\skills\game-dev-kit"),
        "C:\Users\steve\AppData\Roaming\kimi-desktop\daimon-share\daimon\skills\game-dev-kit"
    ) | Select-Object -Unique
    foreach ($kitDest in $kitDestDirs) {
        if ($WhatIf) {
            Write-Host "  WHATIF skill $kitSrc -> $kitDest"
        } else {
            if (Test-Path $kitDest) { Remove-Item -Recurse -Force $kitDest }
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $kitDest) | Out-Null
            Copy-Item $kitSrc $kitDest -Recurse -Force
            Write-Host "  copied game-dev-kit -> $kitDest"
        }
    }
}

if (-not $WhatIf) {
    $installed = Get-Content -Raw (Join-Path $plug "superninja_bridge_v2.py")
    if ($installed -notmatch 'BRIDGE_VERSION\s*=\s*"2\.1\.0"') {
        throw "Install check failed: destination is not v2.1.0"
    }
}

$bridgeDir = Join-Path $projectRoot "Saved\SuperNinja"
$smoke = Join-Path $repo "tests\live_smoke_test.py"

Write-Host ""
Write-Host "NEXT (this script cannot do these):"
Write-Host "  1. Restart the Unreal Editor."
Write-Host "  2. Output Log must show:"
Write-Host "       [SuperNinja v2] watcher started"
Write-Host "       v$ExpectedVersion registered, $ExpectedToolCount tools"
Write-Host "     Reject v2.0.0 / 9 tools - that is the old Drive delivery zip."
Write-Host "  3. Live smoke (Windows only):"
Write-Host "       python `"$smoke`" --bridge-dir `"$bridgeDir`""
Write-Host "Until step 3 passes, treat every Editor claim as unverified-until-live."
Write-Host "Rollback:"
Write-Host "  Copy-Item `"$plug\superninja_bridge.v1.bak.py`" `"$plug\superninja_bridge.py`" -Force"
Write-Host "  Copy-Item `"$plug\init_unreal.v1.bak.py`" `"$plug\init_unreal.py`" -Force"
