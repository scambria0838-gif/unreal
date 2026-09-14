#!/usr/bin/env python3
"""Version claims resolve against the TOOLS dict, not a filename or a doc.

A file is real when it has been read. These checks parse the bridge source
and the handoff so a stale 9-tool / 58/58 claim cannot survive unnoticed.
"""

from __future__ import annotations

import ast
import re
import sys
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BRIDGE = REPO / "Plugins" / "SuperNinjaAI" / "Content" / "Python" / "superninja_bridge_v2.py"
HANDOFF = REPO / "docs" / "v2" / "HANDOFF.md"
TEST_RESULTS = REPO / "docs" / "v2" / "TEST_RESULTS.md"
NEXT_SKILLS = REPO / "docs" / "v2" / "NEXT_SKILLS.md"
README = REPO / "docs" / "v2" / "README.md"

sys.path.insert(0, str(REPO / "tests"))
from live_smoke_test import (  # noqa: E402
    EXPECTED_BRIDGE_VERSION,
    EXPECTED_TOOL_COUNT,
    EXPECTED_TOOLS,
    identity_mismatch,
)


def _parse_tools_dict(text: str) -> list[str]:
    match = re.search(r"^TOOLS = \{(.+?)^\}", text, re.M | re.S)
    if not match:
        raise AssertionError("TOOLS dict not found in superninja_bridge_v2.py")
    names = re.findall(r'"([a-z_]+)"\s*:', match.group(1))
    return names


class IdentityTests(unittest.TestCase):
    def test_source_version_and_tools_dict(self):
        text = BRIDGE.read_text(encoding="utf-8")
        self.assertIn('BRIDGE_VERSION = "2.2.0"', text)
        names = _parse_tools_dict(text)
        self.assertEqual(len(names), EXPECTED_TOOL_COUNT)
        self.assertEqual(set(names), set(EXPECTED_TOOLS))

    def test_imported_module_matches_dict(self):
        plugin = str(BRIDGE.parent)
        if plugin not in sys.path:
            sys.path.insert(0, plugin)
        import superninja_bridge_v2 as sb  # noqa: WPS433
        self.assertEqual(sb.BRIDGE_VERSION, EXPECTED_BRIDGE_VERSION)
        self.assertEqual(len(sb.TOOLS), EXPECTED_TOOL_COUNT)
        self.assertEqual(set(sb.TOOLS), set(EXPECTED_TOOLS))
        tree = ast.parse(BRIDGE.read_text(encoding="utf-8"))
        assigned = [
            node for node in tree.body
            if isinstance(node, ast.Assign)
            and any(isinstance(t, ast.Name) and t.id == "BRIDGE_VERSION" for t in node.targets)
        ]
        self.assertTrue(assigned)

    def test_identity_mismatch_rejects_v20_zip(self):
        self.assertIsNone(identity_mismatch({
            "bridge_version": "2.2.0",
            "tool_count": 15,
            "tools": list(EXPECTED_TOOLS),
        }))
        self.assertIn("wrong bridge version", identity_mismatch({
            "bridge_version": "2.0.0",
            "tool_count": 9,
        }) or "")
        self.assertIn("wrong tool_count", identity_mismatch({
            "bridge_version": "2.2.0",
            "tool_count": 9,
        }) or "")

    def test_handoff_states_the_three_gates(self):
        text = HANDOFF.read_text(encoding="utf-8")
        self.assertIn("v2.2.0", text)
        self.assertIn("15 tools", text)
        self.assertIn("live_smoke_test.py", text)
        self.assertIn("TEST_RESULTS_live.md", text)
        self.assertIn("phx_dedupe.py", text)
        self.assertIn("Do not weaken `_result()`", text)
        self.assertIn("Unverified", text)

    def test_docs_do_not_claim_stale_harness_count(self):
        results = TEST_RESULTS.read_text(encoding="utf-8")
        self.assertNotIn("58/58 checks passed", results)
        self.assertIn("74/74", results)
        readme = README.read_text(encoding="utf-8")
        self.assertNotIn("58/58", readme)
        self.assertIn("HANDOFF.md", readme)
        next_skills = NEXT_SKILLS.read_text(encoding="utf-8")
        self.assertIn("Shipped in v2.1", next_skills)
        self.assertIn("find_actors", next_skills)
        bat = (REPO / "tools" / "START_V21_CUTOVER.bat").read_text(encoding="utf-8")
        self.assertIn("--copy-skill", bat)
        self.assertIn("HANDOFF.md", bat)


if __name__ == "__main__":
    raise SystemExit(unittest.main())
