"""
SuperNinjaAI — Unreal Python entry point.

Auto-runs when the plugin loads. Registers the SuperNinja Python namespace
inside Unreal and wires up the bridge that executes MSA tool calls coming
from the runtime subsystem.
"""
import os
import sys
import importlib
import unreal

PLUGIN_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_DIR = os.path.join(PLUGIN_DIR, "Python")

if PYTHON_DIR not in sys.path:
    sys.path.insert(0, PYTHON_DIR)

unreal.log("🥷 SuperNinjaAI — Python bridge initializing...")

try:
    from superninja_bridge import SuperNinjaBridge
    bridge = SuperNinjaBridge()
    bridge.register()
    unreal.log("🥷 SuperNinjaAI — bridge registered successfully.")
except Exception as e:
    unreal.log_error(f"SuperNinjaAI — bridge failed to initialize: {e}")