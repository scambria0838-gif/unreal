#!/usr/bin/env python3
"""SuperNinja v2.1 cutover — same contract as install_v2_onto_editor.ps1.

Run on the Windows Editor box. This Linux Cloud Agent cannot reach C:\\ or
restart Unreal. A fixture mode exists so the copy/backup logic can be proven
without an Editor:

    python tools/install_v2_onto_editor.py --project <NINJA>
    python tools/install_v2_onto_editor.py --what-if
    python tools/install_v2_onto_editor.py --copy-skill
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path


EXPECTED_VERSION = "2.1.0"
EXPECTED_TOOL_COUNT = 14
SOURCE_FILES = (
    "superninja_bridge_v2.py",
    "superninja_bridge.py",
    "init_unreal.py",
)


class InstallError(RuntimeError):
    pass


def repo_root_from(hint: str | None) -> Path:
    if hint:
        root = Path(hint).resolve()
    else:
        root = Path(__file__).resolve().parent.parent
    bridge = root / "Plugins" / "SuperNinjaAI" / "Content" / "Python" / "superninja_bridge_v2.py"
    if not bridge.is_file():
        raise InstallError(
            "RepoRoot missing Plugins/SuperNinjaAI/Content/Python/"
            "superninja_bridge_v2.py: {}".format(root)
        )
    return root


def assert_source_is_v21(bridge_src: Path) -> None:
    text = bridge_src.read_text(encoding="utf-8")
    if 'BRIDGE_VERSION = "2.1.0"' not in text:
        raise InstallError(
            "Source bridge is not v2.1.0. Do not install from "
            "SUPERNINJA_V2_DELIVERY (that zip is v2.0.0 / 9 tools): {}".format(bridge_src)
        )
    if '"find_actors"' not in text or '"save_level_as"' not in text:
        raise InstallError("Source bridge is missing v2.1 first-class tools: {}".format(bridge_src))


def assert_not_pyc(path: Path) -> None:
    if path.suffix == ".pyc" or path.name == "__pycache__":
        raise InstallError("Refusing to copy bytecode: {}".format(path))


def _project_is_real(root: Path) -> bool:
    """Reject the flattened doc dumps.

    Downloads holds dozens of copies of this project in which Content, Plugins
    and Saved are 0-byte *files*. They pass a "*.uproject" glob and then fail
    to load. A real project has those as directories.
    """
    return not any((root / d).is_file() for d in ("Content", "Plugins", "Saved"))


def find_project_root(hint: str | None) -> Path:
    if hint:
        h = Path(hint)
        if h.is_file() and h.suffix == ".uproject":
            return h.parent
        if h.is_dir() and any(h.glob("*.uproject")) and _project_is_real(h):
            return h
        raise InstallError(
            "--project {} is not a loadable Unreal project (no *.uproject, or "
            "Content/Plugins/Saved are files rather than directories -- that is "
            "a flattened doc dump). Not falling back to auto-detection: an "
            "explicit target must be honoured or refused.".format(hint)
        )
    guesses = []
    home = Path.home()
    guesses.extend([
        # The real NINJA on the Windows box. It is not under Documents; the
        # copies that are have 0-byte files where Content/Plugins/Saved should
        # be, so they satisfy a *.uproject glob and then will not load.
        home / "Projects" / "SuperNinja" / "important" / "ue5_project" / "NINJA",
        Path(r"C:\Users\steve\Projects\SuperNinja\important\ue5_project\NINJA"),
        home / "Documents" / "Unreal Projects" / "NINJA",
        home / "OneDrive" / "Documents" / "Unreal Projects" / "NINJA",
        home / "Documents" / "Unreal Projects" / "ninja",
        home / "OneDrive" / "Documents" / "Unreal Projects" / "ninja",
        Path(r"C:\Users\steve\Documents\Unreal Projects\NINJA"),
        Path(r"C:\Users\steve\OneDrive\Documents\Unreal Projects\NINJA"),
        Path(r"C:\Users\sbcam\OneDrive\Documents\Unreal Projects\NINJA"),
    ])
    for g in guesses:
        if g.is_file() and g.suffix == ".uproject":
            return g.parent
        if g.is_dir() and any(g.glob("*.uproject")) and _project_is_real(g):
            return g
    raise InstallError(
        "Could not find NINJA.uproject. Pass --project "
        "C:\\path\\to\\NINJA (folder or .uproject)."
    )


def find_plugin_python(project_root: Path) -> Path:
    preferred = [
        project_root / "Plugins" / "SuperNinjaAI" / "Content" / "Python",
        project_root / "Plugins" / "SuperNinja" / "Content" / "Python",
        project_root / "Plugins" / "ninja" / "Content" / "Python",
    ]
    for p in preferred:
        if p.is_dir():
            return p
    plugins = project_root / "Plugins"
    if plugins.is_dir():
        for hit in plugins.rglob("superninja_bridge.py"):
            return hit.parent
    raise InstallError(
        "No SuperNinja Python folder under {}\\Plugins. Expected "
        "SuperNinjaAI\\Content\\Python or ninja\\Content\\Python.".format(project_root)
    )


def backup_if_exists(path: Path, stamp: str, dry_run: bool) -> None:
    if not path.is_file():
        print("  skip backup (missing): {}".format(path))
        return
    bak_stamp = path.with_name("{}.v1.bak.{}.py".format(path.stem, stamp))
    bak_latest = path.with_name("{}.v1.bak.py".format(path.stem))
    if dry_run:
        print("  WHATIF backup {} -> {}".format(path, bak_stamp))
        return
    shutil.copy2(path, bak_stamp)
    shutil.copy2(path, bak_latest)
    print("  backed up {}".format(path))


def copy_py(src: Path, dest_dir: Path, dry_run: bool) -> None:
    assert_not_pyc(src)
    if not src.is_file():
        raise InstallError("Source missing: {}".format(src))
    dest = dest_dir / src.name
    assert_not_pyc(dest)
    if dry_run:
        print("  WHATIF copy {} -> {}".format(src, dest))
        return
    dest_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    print("  copied {}".format(src.name))


def _unique_dirs(paths: list[Path]) -> list[Path]:
    seen: set[str] = set()
    out: list[Path] = []
    for dest in paths:
        key = str(dest).replace("\\", "/").lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(dest)
    return out


def superninja_skill_dest_dirs() -> list[Path]:
    home = Path.home()
    return _unique_dirs([
        home / "Desktop" / "skill" / "superninja-v2",
        Path(r"C:\Users\steve\Desktop\skill\superninja-v2"),
    ])


def game_dev_kit_dest_dirs() -> list[Path]:
    """Kimi/Daimon and Desktop expect the kit as its own skill folder."""
    home = Path.home()
    appdata = os.environ.get("APPDATA") or str(home / "AppData" / "Roaming")
    return _unique_dirs([
        home / "Desktop" / "skill" / "game-dev-kit",
        Path(r"C:\Users\steve\Desktop\skill\game-dev-kit"),
        Path(appdata) / "kimi-desktop" / "daimon-share" / "daimon" / "skills" / "game-dev-kit",
        Path(r"C:\Users\steve\AppData\Roaming\kimi-desktop\daimon-share\daimon\skills\game-dev-kit"),
    ])


def skill_dest_dirs() -> list[Path]:
    """All --copy-skill destinations (superninja-v2 + game-dev-kit)."""
    return superninja_skill_dest_dirs() + game_dev_kit_dest_dirs()


def _copy_tree(src: Path, dest_dir: Path, dry_run: bool) -> Path:
    if dry_run:
        print("  WHATIF skill {} -> {}".format(src, dest_dir))
        return dest_dir
    dest_dir.parent.mkdir(parents=True, exist_ok=True)
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    shutil.copytree(src, dest_dir)
    print("  copied skill tree -> {}".format(dest_dir))
    return dest_dir


def copy_skill(repo: Path, dry_run: bool) -> list[Path]:
    sn_src = repo / "skills" / "superninja-v2" / "SKILL.md"
    if not sn_src.is_file():
        sn_src = repo / ".cursor" / "skills" / "superninja-v2" / "SKILL.md"
    if not sn_src.is_file():
        raise InstallError("superninja-v2 SKILL.md missing in repo")

    kit_src = repo / "skills" / "game-dev-kit"
    if not (kit_src / "SKILL.md").is_file():
        raise InstallError("game-dev-kit SKILL.md missing in repo")

    written: list[Path] = []
    for dest_dir in superninja_skill_dest_dirs():
        dest = dest_dir / "SKILL.md"
        if dry_run:
            print("  WHATIF skill {} -> {}".format(sn_src, dest))
        else:
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(sn_src, dest)
            print("  copied SKILL.md -> {}".format(dest_dir))
        written.append(dest)

    for dest_dir in game_dev_kit_dest_dirs():
        written.append(_copy_tree(kit_src, dest_dir, dry_run))
    return written


def install(project: str | None, repo_root: str | None,
            copy_skill_flag: bool, dry_run: bool) -> dict:
    repo = repo_root_from(repo_root)
    src_py = repo / "Plugins" / "SuperNinjaAI" / "Content" / "Python"
    bridge_src = src_py / "superninja_bridge_v2.py"
    assert_source_is_v21(bridge_src)

    project_root = find_project_root(project)
    plug = find_plugin_python(project_root)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    print("Repo     {}".format(repo))
    print("Project  {}".format(project_root))
    print("Plugin   {}".format(plug))
    print("Version  {} / {} tools".format(EXPECTED_VERSION, EXPECTED_TOOL_COUNT))
    if dry_run:
        print("Mode     WHATIF (no writes)")

    pyc_hits = list(plug.rglob("*.pyc")) + [p for p in plug.rglob("__pycache__") if p.is_dir()]
    if pyc_hits:
        print("WARNING: destination already has bytecode (leave it; do not copy more):")
        for p in pyc_hits:
            print("  {}".format(p))

    backup_if_exists(plug / "superninja_bridge.py", stamp, dry_run)
    backup_if_exists(plug / "init_unreal.py", stamp, dry_run)
    for name in SOURCE_FILES:
        copy_py(src_py / name, plug, dry_run)

    skill_dest = []
    if copy_skill_flag:
        skill_dest = copy_skill(repo, dry_run)

    if not dry_run:
        installed = (plug / "superninja_bridge_v2.py").read_text(encoding="utf-8")
        if 'BRIDGE_VERSION = "2.1.0"' not in installed:
            raise InstallError("Install check failed: destination is not v2.1.0")

    bridge_dir = project_root / "Saved" / "SuperNinja"
    smoke = repo / "tests" / "live_smoke_test.py"
    print("")
    print("NEXT (this script cannot do these):")
    print("  1. Restart the Unreal Editor.")
    print("  2. Output Log must show:")
    print("       [SuperNinja v2] watcher started")
    print("       v{} registered, {} tools".format(EXPECTED_VERSION, EXPECTED_TOOL_COUNT))
    print("     Reject v2.0.0 / 9 tools — that is the old Drive delivery zip.")
    print("  3. Live smoke (Windows only):")
    print("       python \"{}\" --bridge-dir \"{}\"".format(smoke, bridge_dir))
    print("Until step 3 passes, treat every Editor claim as unverified-until-live.")
    return {
        "repo": str(repo),
        "project": str(project_root),
        "plugin": str(plug),
        "bridge_dir": str(bridge_dir),
        "skill": [str(p) for p in skill_dest],
        "dry_run": dry_run,
        "version": EXPECTED_VERSION,
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Install SuperNinja v2.1 onto a UE project")
    ap.add_argument("--project", default="", help="NINJA project folder or .uproject")
    ap.add_argument("--repo-root", default="", help="This git repo root")
    ap.add_argument("--copy-skill", action="store_true")
    ap.add_argument("--what-if", action="store_true")
    args = ap.parse_args(argv)
    try:
        install(
            args.project or None,
            args.repo_root or None,
            args.copy_skill,
            args.what_if,
        )
    except InstallError as exc:
        print("ERROR: {}".format(exc), file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
