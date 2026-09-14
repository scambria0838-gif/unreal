#!/usr/bin/env python3
"""Prove the game-dev-kit tree, scaffolder, and headless gauntlet."""

from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
KIT = REPO / "skills" / "game-dev-kit"
TEMPLATE = KIT / "assets" / "canvas-game-template"
NEW_GAME = KIT / "scripts" / "new_game.mjs"

REQUIRED = (
    "SKILL.md",
    "scripts/new_game.mjs",
    "references/tuning-datasets.md",
    "references/juice-checklist.md",
    "references/physics-recipes.md",
    "references/procedural-generation.md",
    "references/verification-protocol.md",
    "assets/canvas-game-template/index.html",
    "assets/canvas-game-template/package.json",
    "assets/canvas-game-template/src/config.js",
    "assets/canvas-game-template/src/main.js",
    "assets/canvas-game-template/src/core/AudioSys.js",
    "assets/canvas-game-template/src/core/Camera.js",
    "assets/canvas-game-template/src/core/Input.js",
    "assets/canvas-game-template/src/core/Particles.js",
    "assets/canvas-game-template/src/game/DemoGame.js",
    "assets/canvas-game-template/test/browser-check.mjs",
    "assets/canvas-game-template/test/check-all.mjs",
    "assets/canvas-game-template/test/smoke.mjs",
)


class GameDevKitTests(unittest.TestCase):
    def test_required_files(self):
        for rel in REQUIRED:
            self.assertTrue((KIT / rel).is_file(), rel)
        skill = (KIT / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn("name: game-dev-kit", skill)
        self.assertIn("npm run smoke", skill)
        self.assertIn("CFG.step", skill)
        tuning = (KIT / "references" / "tuning-datasets.md").read_text(encoding="utf-8")
        self.assertIn("2800", tuning)
        self.assertIn("Scrap Runner", tuning)

    def test_new_game_refuses_nonempty(self):
        dest = Path(tempfile.mkdtemp(prefix="gdk_full_"))
        (dest / "keep.txt").write_text("no", encoding="utf-8")
        r = subprocess.run(
            ["node", str(NEW_GAME), str(dest), "Blocked Game"],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(r.returncode, 3, r.stderr)
        self.assertIn("Refusing to overwrite", r.stderr)
        self.assertTrue((dest / "keep.txt").is_file())
        self.assertFalse((dest / "src" / "config.js").exists())

    def test_new_game_scaffolds_empty(self):
        dest = Path(tempfile.mkdtemp(prefix="gdk_empty_"))
        r = subprocess.run(
            ["node", str(NEW_GAME), str(dest), "Token Run"],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(r.returncode, 0, r.stderr)
        cfg = (dest / "src" / "config.js").read_text(encoding="utf-8")
        self.assertIn("Token Run", cfg)
        self.assertIn("step: 1 / 60", cfg)

    def test_template_check_and_smoke(self):
        check = subprocess.run(
            ["node", str(TEMPLATE / "test" / "check-all.mjs")],
            cwd=TEMPLATE,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(check.returncode, 0, check.stderr + check.stdout)
        smoke = subprocess.run(
            ["node", str(TEMPLATE / "test" / "smoke.mjs")],
            cwd=TEMPLATE,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(smoke.returncode, 0, smoke.stderr + smoke.stdout)
        self.assertIn("win", smoke.stdout)
        self.assertIn("lose", smoke.stdout)


if __name__ == "__main__":
    raise SystemExit(unittest.main())
