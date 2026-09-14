#!/usr/bin/env python3
"""Prove the v2.1 installer backs up v1 and copies only .py — no Editor."""

from __future__ import annotations

import os
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "tools"))

from install_v2_onto_editor import (  # noqa: E402
    EXPECTED_VERSION,
    InstallError,
    install,
)


class InstallV21Tests(unittest.TestCase):
    def _fake_ninja(self) -> Path:
        root = Path(tempfile.mkdtemp(prefix="ninja_proj_"))
        (root / "NINJA.uproject").write_text('{"FileVersion": 3}', encoding="utf-8")
        plug = root / "Plugins" / "ninja" / "Content" / "Python"
        plug.mkdir(parents=True)
        (plug / "superninja_bridge.py").write_text("# v1 bridge\n", encoding="utf-8")
        (plug / "init_unreal.py").write_text("# v1 init\n", encoding="utf-8")
        (plug / "__pycache__").mkdir()
        (plug / "__pycache__" / "superninja_bridge.cpython-314.pyc").write_bytes(b"\x2b\x0e\x0d\x0a")
        return root

    def test_what_if_does_not_write(self):
        project = self._fake_ninja()
        plug = project / "Plugins" / "ninja" / "Content" / "Python"
        install(str(project), str(REPO), False, True)
        self.assertFalse((plug / "superninja_bridge_v2.py").exists())
        self.assertEqual((plug / "superninja_bridge.py").read_text(encoding="utf-8"), "# v1 bridge\n")
        self.assertFalse(any(plug.glob("*.v1.bak.py")))

    def test_install_backs_up_and_copies_v21(self):
        project = self._fake_ninja()
        plug = project / "Plugins" / "ninja" / "Content" / "Python"
        result = install(str(project), str(REPO), False, False)
        self.assertEqual(result["version"], EXPECTED_VERSION)
        self.assertTrue((plug / "superninja_bridge.v1.bak.py").is_file())
        self.assertTrue((plug / "init_unreal.v1.bak.py").is_file())
        self.assertEqual((plug / "superninja_bridge.v1.bak.py").read_text(encoding="utf-8"), "# v1 bridge\n")
        dest = (plug / "superninja_bridge_v2.py").read_text(encoding="utf-8")
        self.assertIn('BRIDGE_VERSION = "2.1.0"', dest)
        self.assertIn('"find_actors"', dest)
        shim = (plug / "superninja_bridge.py").read_text(encoding="utf-8")
        self.assertIn("from superninja_bridge_v2 import", shim)
        init = (plug / "init_unreal.py").read_text(encoding="utf-8")
        self.assertIn("watcher started", init)
        # installer must not add new pyc; leftover 314 pyc stays (we refuse to copy more)
        self.assertTrue((plug / "__pycache__" / "superninja_bridge.cpython-314.pyc").is_file())

    def test_refuses_missing_project(self):
        with self.assertRaises(InstallError):
            install("/no/such/ninja/project", str(REPO), False, True)


if __name__ == "__main__":
    raise SystemExit(unittest.main())
