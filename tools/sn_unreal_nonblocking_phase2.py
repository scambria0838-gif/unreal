#!/usr/bin/env python3
"""Non-blocking SuperNinja poller — cloud-poll vs local-8765.

This is the client-side counterpart to the in-Editor file watcher. It never
pretends a Cloud Agent VM can talk to the Windows Editor.

Transports
----------
cloud-poll
    Drop JSON into ``<bridge_dir>/sn_inbox`` and wait for
    ``<bridge_dir>/sn_outbox``. Safe from Linux Cloud Agents. This is the
    only transport this module will use unless you explicitly ask for
    local-8765.

local-8765
    HTTP to ``http://127.0.0.1:8765``. That socket is the Windows Editor
    machine. From a Cloud Agent this is a hard reject — we do not fall
    back to cloud-poll, we do not invent a success, we raise
    ``HardReject``.

Queue / TTL
-----------
``MAX_QUEUE_SIZE`` caps outstanding inbox requests. ``RESULT_TTL`` expires
outbox files by their result timestamp so a stalled Editor cannot leave
stale ``ok`` sitting around. Every stored result records ``result_ts``.

Status: static-only / unverified-until-live. This file has not been run
against a real Editor.
"""

from __future__ import annotations

import json
import os
import socket
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional


MAX_QUEUE_SIZE = 32
RESULT_TTL = 300.0
LOCAL_8765_HOST = "127.0.0.1"
LOCAL_8765_PORT = 8765
TRANSPORT_CLOUD_POLL = "cloud-poll"
TRANSPORT_LOCAL_8765 = "local-8765"


class HardReject(RuntimeError):
    """Refused on purpose. Do not retry as a different transport."""


def _now() -> float:
    return time.time()


def _is_windows() -> bool:
    return sys.platform == "win32"


def probe_local_8765(timeout: float = 0.4) -> bool:
    try:
        with socket.create_connection((LOCAL_8765_HOST, LOCAL_8765_PORT),
                                      timeout=timeout):
            return True
    except OSError:
        return False


def resolve_transport(requested: str) -> str:
    """Resolve a transport or hard-reject. Never silently remaps."""
    name = (requested or "").strip().lower()
    if name in ("cloud-poll", "file", "inbox", "cloud"):
        return TRANSPORT_CLOUD_POLL
    if name in ("local-8765", "8765", "http-8765", "local"):
        if not _is_windows():
            raise HardReject(
                "local-8765 is Windows-Editor only. This host is {} — "
                "refusing rather than falling back to cloud-poll. Ask for "
                "cloud-poll (inbox/outbox) if you want the file transport."
                .format(sys.platform)
            )
        if not probe_local_8765():
            raise HardReject(
                "local-8765 requested but nothing is listening on "
                "{}:{}. Hard reject — not falling back to cloud-poll."
                .format(LOCAL_8765_HOST, LOCAL_8765_PORT)
            )
        return TRANSPORT_LOCAL_8765
    raise HardReject(
        "unknown transport {!r}. Use cloud-poll or local-8765.".format(requested)
    )


class ResultStore:
    """Outbox results keyed by request name, expired by RESULT_TTL."""

    def __init__(self, ttl: float = RESULT_TTL) -> None:
        self.ttl = float(ttl)
        self._items: Dict[str, Dict[str, Any]] = {}

    def put(self, name: str, payload: Dict[str, Any], ts: Optional[float] = None) -> Dict[str, Any]:
        stamped = dict(payload)
        stamped["result_ts"] = float(ts if ts is not None else _now())
        self._items[name] = stamped
        self.expire()
        return stamped

    def get(self, name: str) -> Optional[Dict[str, Any]]:
        self.expire()
        return self._items.get(name)

    def expire(self, now: Optional[float] = None) -> int:
        cutoff = float(now if now is not None else _now()) - self.ttl
        dead = [k for k, v in self._items.items()
                if float(v.get("result_ts") or 0) < cutoff]
        for k in dead:
            del self._items[k]
        return len(dead)

    def __len__(self) -> int:
        self.expire()
        return len(self._items)


class InboxQueue:
    """Bounded inbox. Full queue is a hard reject, not a silent drop."""

    def __init__(self, max_size: int = MAX_QUEUE_SIZE) -> None:
        self.max_size = int(max_size)
        self._pending: Dict[str, Dict[str, Any]] = {}

    def enqueue(self, name: str, request: Dict[str, Any]) -> None:
        if name in self._pending:
            raise HardReject("duplicate in-flight request: {}".format(name))
        if len(self._pending) >= self.max_size:
            raise HardReject(
                "inbox full ({}/{}). Wait for outbox results or raise "
                "MAX_QUEUE_SIZE.".format(len(self._pending), self.max_size)
            )
        self._pending[name] = {"request": request, "enqueued_ts": _now()}

    def complete(self, name: str) -> None:
        self._pending.pop(name, None)

    def __len__(self) -> int:
        return len(self._pending)


class CloudPollClient:
    """File-transport client. Writes inbox JSON, reads stamped outbox JSON."""

    def __init__(self, bridge_dir: str,
                 max_queue: int = MAX_QUEUE_SIZE,
                 result_ttl: float = RESULT_TTL) -> None:
        self.root = Path(bridge_dir)
        self.inbox = self.root / "sn_inbox"
        self.outbox = self.root / "sn_outbox"
        self.inbox.mkdir(parents=True, exist_ok=True)
        self.outbox.mkdir(parents=True, exist_ok=True)
        self.queue = InboxQueue(max_queue)
        self.results = ResultStore(result_ttl)

    def submit(self, name: str, request: Dict[str, Any]) -> Path:
        self.queue.enqueue(name, request)
        path = self.inbox / "{}.json".format(name)
        tmp = path.with_suffix(".json.part")
        payload = dict(request)
        payload.setdefault("submitted_ts", _now())
        tmp.write_text(json.dumps(payload), encoding="utf-8")
        os.replace(tmp, path)
        return path

    def ingest_outbox(self) -> int:
        ingested = 0
        if not self.outbox.is_dir():
            return 0
        for path in sorted(self.outbox.glob("*.json")):
            try:
                payload = json.loads(path.read_text(encoding="utf-8-sig"))
            except (OSError, json.JSONDecodeError):
                continue
            if not isinstance(payload, dict):
                continue
            name = path.stem
            mtime = path.stat().st_mtime
            self.results.put(name, payload, ts=float(payload.get("result_ts") or mtime))
            self.queue.complete(name)
            ingested += 1
        self.results.expire()
        return ingested

    def poll(self, name: str, timeout: float = 5.0, interval: float = 0.05) -> Dict[str, Any]:
        deadline = _now() + timeout
        while _now() <= deadline:
            self.ingest_outbox()
            hit = self.results.get(name)
            if hit is not None:
                return hit
            time.sleep(interval)
        raise TimeoutError(
            "cloud-poll timed out waiting for {}.json in {}".format(name, self.outbox)
        )


def submit(bridge_dir: str, name: str, request: Dict[str, Any],
           transport: str = TRANSPORT_CLOUD_POLL) -> Dict[str, Any]:
    """Submit one request. local-8765 hard-rejects off the Editor box."""
    mode = resolve_transport(transport)
    if mode == TRANSPORT_LOCAL_8765:
        raise HardReject(
            "local-8765 submit from this helper is not implemented — "
            "the Editor owns that socket. Use the Windows box."
        )
    client = CloudPollClient(bridge_dir)
    client.submit(name, request)
    return {"ok": False, "verified": False, "queued": True,
            "transport": mode, "request": name,
            "reason": "queued on cloud-poll; unverified-until-live"}


def main(argv: Optional[list] = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if not args or args[0] in ("-h", "--help"):
        print("usage: sn_unreal_nonblocking_phase2.py resolve <transport>")
        print("       sn_unreal_nonblocking_phase2.py enqueue <dir> <name> <json>")
        return 0
    cmd = args[0]
    if cmd == "resolve":
        print(resolve_transport(args[1] if len(args) > 1 else ""))
        return 0
    if cmd == "enqueue":
        if len(args) < 4:
            raise SystemExit("enqueue <bridge_dir> <name> <json>")
        result = submit(args[1], args[2], json.loads(args[3]))
        print(json.dumps(result))
        return 0
    raise SystemExit("unknown command: {}".format(cmd))


if __name__ == "__main__":
    sys.exit(main())
