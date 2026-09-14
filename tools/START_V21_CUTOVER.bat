@echo off
setlocal
REM SuperNinja v2.1 cutover. Run on the Windows Editor box from this repo.
REM Does not restart Unreal and does not run the live smoke test.
REM Defaults to --copy-skill so Desktop and Daimon get sibling skill folders.

cd /d "%~dp0\.."
echo Installing SuperNinja v2.1 from %CD%
if "%*"=="" (
  python tools\install_v2_onto_editor.py --copy-skill
) else (
  python tools\install_v2_onto_editor.py %*
)
if errorlevel 1 (
  echo Trying PowerShell installer...
  if "%*"=="" (
    powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1 -CopySkill
  ) else (
    powershell -ExecutionPolicy Bypass -File tools\install_v2_onto_editor.ps1 %*
  )
)
echo.
echo Restart the Editor. Output Log must show v2.1.0 / 14 tools and watcher started.
echo Then: python tests\live_smoke_test.py --bridge-dir "<Project>\Saved\SuperNinja"
echo Playbook: docs\v2\HANDOFF.md
endlocal
