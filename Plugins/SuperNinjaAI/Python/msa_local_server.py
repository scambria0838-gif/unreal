#!/usr/bin/env python3
"""
msa_local_server.py
-------------------
Local Flask server that exposes the Meta-Studio Agent (MSA) to the
SuperNinjaAI Unreal plugin over HTTP. Run this on your machine to use
the plugin in "Local" mode (no cloud, no API key needed).

Usage:
    python msa_local_server.py --port 8765 --msa-root ../../ai_game_builder

Then in UE5 plugin settings:
    Mode          = Local
    API Endpoint  = http://localhost:8765/v1/msa
"""
import argparse
import json
import logging
import os
import sys
import threading
import traceback
from pathlib import Path

try:
    from flask import Flask, request, jsonify
except ImportError:
    sys.exit("Missing dependency: pip install flask")

log = logging.getLogger("msa_server")
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")

app = Flask(__name__)
MSA_INSTANCE = None
BUSY_LOCK = threading.Lock()


def load_msa(msa_root: str):
    """Attempt to import the Meta-Studio Agent. Fall back to a mock."""
    global MSA_INSTANCE

    msa_path = Path(msa_root).resolve()
    if msa_path.exists():
        sys.path.insert(0, str(msa_path))
        try:
            from msa_main import MetaStudioAgent, ProjectMode  # type: ignore
            MSA_INSTANCE = MetaStudioAgent(project_mode=ProjectMode.UNREAL_ENGINE)
            log.info(f"✅ Loaded real MSA from {msa_path}")
            return
        except Exception as e:
            log.warning(f"Could not load real MSA ({e}); using mock.")
    else:
        log.warning(f"MSA path not found: {msa_path}; using mock.")

    MSA_INSTANCE = MockMSA()


class MockMSA:
    """Stand-in MSA for testing without the real Python backend."""
    def process_command(self, prompt: str) -> dict:
        log.info(f"[MOCK-MSA] Received: {prompt!r}")
        return {
            "summary": f"[MOCK] Parsed prompt '{prompt}' and dispatched 13 agents.",
            "created_assets": [
                "/Game/SuperNinja_Generated/Lvl_Main.umap",
                "/Game/SuperNinja_Generated/MI_HeroMaterial.uasset",
                "/Game/SuperNinja_Generated/BP_Character.uasset",
            ],
            "modified_levels": ["/Game/SuperNinja_Generated/Lvl_Main"],
            "plan": [
                {"step": 1, "agent": "WorldAgent",    "task": "Generate terrain"},
                {"step": 2, "agent": "LightingAgent", "task": "Configure Lumen GI"},
                {"step": 3, "agent": "AssetAgent",    "task": "Place props"},
                {"step": 4, "agent": "LogicAgent",    "task": "Spawn player controller"},
                {"step": 5, "agent": "AutonomousAgent", "task": "Screenshot & validate"},
            ],
        }

    def execute_tool(self, tool: str, args: dict) -> dict:
        return {"ok": True, "tool": tool, "echoed_args": args}


# ---------------------------- Endpoints --------------------------------------
@app.route("/v1/msa/build", methods=["POST"])
def build():
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"summary": "empty prompt"}), 400

    if not BUSY_LOCK.acquire(blocking=False):
        return jsonify({"summary": "MSA busy"}), 429

    try:
        log.info(f"[BUILD] {prompt!r}  mode={data.get('mode')}  dry_run={data.get('dry_run')}")
        result = MSA_INSTANCE.process_command(prompt)
        return jsonify(result)
    except Exception as e:
        log.error(traceback.format_exc())
        return jsonify({"summary": f"error: {e}"}), 500
    finally:
        BUSY_LOCK.release()


@app.route("/v1/msa/tool", methods=["POST"])
def tool():
    data = request.get_json(silent=True) or {}
    tool_name = data.get("tool")
    args = data.get("args")
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except Exception:
            pass

    log.info(f"[TOOL] {tool_name}  args={args}")
    if hasattr(MSA_INSTANCE, "execute_tool"):
        return jsonify(MSA_INSTANCE.execute_tool(tool_name, args or {}))
    return jsonify({"ok": True, "note": "tool routing delegated to UE Python bridge"})


@app.route("/v1/msa/health", methods=["GET"])
def health():
    return jsonify({
        "status":   "ok",
        "msa_type": type(MSA_INSTANCE).__name__,
        "busy":     BUSY_LOCK.locked(),
    })


@app.route("/", methods=["GET"])
def root():
    return (
        "<h1>🥷 SuperNinja AI — Local MSA Server</h1>"
        "<p>POST <code>/v1/msa/build</code> with <code>{\"prompt\": \"...\"}</code></p>"
        "<p>GET <code>/v1/msa/health</code> to check status.</p>"
    )


# -----------------------------------------------------------------------------
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=8765)
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--msa-root", default="../../ai_game_builder",
                   help="Path to ai_game_builder folder (MSA backend)")
    args = p.parse_args()

    load_msa(args.msa_root)
    log.info(f"🥷 SuperNinja Local MSA Server listening on http://{args.host}:{args.port}")
    log.info("   Plugin setting → API Endpoint = http://%s:%s/v1/msa", args.host, args.port)
    app.run(host=args.host, port=args.port, threaded=True, debug=False)


if __name__ == "__main__":
    main()