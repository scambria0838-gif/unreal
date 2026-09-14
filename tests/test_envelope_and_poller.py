#!/usr/bin/env python3
"""Static checks that do not need a live Unreal Editor.

Covers:
  - v2 envelope invariant: ok cannot be true when verified is false
  - local-8765 hard-reject from a non-Windows / no-listener host
  - MAX_QUEUE_SIZE / RESULT_TTL / result timestamps on the cloud-poll store

Status: static-only / unverified-until-live for any Editor-facing claim.
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import time
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PLUGIN_PY = os.path.join(REPO, "Plugins", "SuperNinjaAI", "Content", "Python")
sys.path.insert(0, PLUGIN_PY)
sys.path.insert(0, os.path.join(REPO, "tools"))

import superninja_bridge_v2 as sb  # noqa: E402
from sn_unreal_nonblocking_phase2 import (  # noqa: E402
    MAX_QUEUE_SIZE,
    RESULT_TTL,
    CloudPollClient,
    HardReject,
    InboxQueue,
    ResultStore,
    resolve_transport,
)


class EnvelopeTests(unittest.TestCase):
    def test_ok_forced_false_when_unverified(self):
        out = sb._result(True, False, "Editor", reason="unverified on purpose")
        self.assertFalse(out["ok"])
        self.assertFalse(out["verified"])
        self.assertEqual(out["world_context"], "Editor")
        self.assertEqual(out["reason"], "unverified on purpose")
        self.assertEqual(out["error"], "unverified on purpose")

    def test_ok_true_only_when_verified(self):
        out = sb._result(True, True, "Editor")
        self.assertTrue(out["ok"])
        self.assertTrue(out["verified"])

    def test_refused_is_unverified(self):
        out = sb._refused("PIE", "editor is in PIE mode")
        self.assertFalse(out["ok"])
        self.assertFalse(out["verified"])


class TransportHardRejectTests(unittest.TestCase):
    def test_cloud_poll_aliases(self):
        self.assertEqual(resolve_transport("cloud-poll"), "cloud-poll")
        self.assertEqual(resolve_transport("file"), "cloud-poll")

    def test_local_8765_hard_rejects_off_windows(self):
        if sys.platform == "win32":
            self.skipTest("this host is Windows; hard-reject path is for Cloud Agents")
        with self.assertRaises(HardReject) as ctx:
            resolve_transport("local-8765")
        msg = str(ctx.exception)
        self.assertIn("Windows-Editor only", msg)
        self.assertIn("falling back", msg)

    def test_unknown_transport_hard_rejects(self):
        with self.assertRaises(HardReject):
            resolve_transport("telepathy")


class QueueTtlTests(unittest.TestCase):
    def test_queue_hard_rejects_when_full(self):
        q = InboxQueue(max_size=2)
        q.enqueue("a", {"tool": "bridge_health"})
        q.enqueue("b", {"tool": "bridge_health"})
        with self.assertRaises(HardReject) as ctx:
            q.enqueue("c", {"tool": "bridge_health"})
        self.assertIn("inbox full", str(ctx.exception))
        self.assertEqual(q.max_size, 2)

    def test_result_ttl_expires_stale_entries(self):
        store = ResultStore(ttl=0.05)
        store.put("old", {"ok": True, "verified": True}, ts=time.time() - 1)
        store.put("fresh", {"ok": False, "verified": False}, ts=time.time())
        self.assertIsNone(store.get("old"))
        self.assertIsNotNone(store.get("fresh"))
        self.assertIn("result_ts", store.get("fresh"))

    def test_cloud_poll_stamps_and_reads_outbox(self):
        root = tempfile.mkdtemp(prefix="sn_poll_")
        client = CloudPollClient(root, max_queue=4, result_ttl=30)
        client.submit("health", {"tool": "bridge_health", "args": {}})
        self.assertEqual(len(client.queue), 1)
        out = client.outbox / "health.json"
        payload = {"ok": True, "verified": True, "world_context": "Editor"}
        out.write_text(json.dumps(payload), encoding="utf-8")
        got = client.poll("health", timeout=1.0, interval=0.01)
        self.assertTrue(got["ok"])
        self.assertIn("result_ts", got)
        self.assertEqual(len(client.queue), 0)

    def test_defaults_match_module_constants(self):
        self.assertEqual(MAX_QUEUE_SIZE, 32)
        self.assertEqual(RESULT_TTL, 300.0)


if __name__ == "__main__":
    raise SystemExit(unittest.main())
