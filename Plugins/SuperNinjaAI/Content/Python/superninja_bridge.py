"""
superninja_bridge — compatibility shim (v2 installed).

The v1 implementation of this module reported ok=true whenever an Unreal call
did not raise, which is how 53 duplicate actors, a PIE-contaminated scene, and
three unnecessary scene rebuilds happened. It is preserved verbatim next to
this file as ``superninja_bridge.v1.original.py`` so the diff is reviewable.

This module now re-exports the verified v2 bridge. Anything that already does

    from superninja_bridge import SuperNinjaBridge
    bridge.execute_tool("spawn_actor", args_json)

keeps working unchanged and silently gains: PIE refusal, read-after-write
verification, duplicate-label guards, World Partition save verification against
the __ExternalActors__ tree, and full dirty-package reporting.

The one behavioural difference callers must know about: a tool that cannot
verify its own change now returns ok=false. That is the fix, not a regression.
See CHANGELOG.md and KNOWN_LIMITATIONS.md in the delivery folder.
"""

from superninja_bridge_v2 import (  # noqa: F401  (re-export surface)
    BRIDGE_VERSION,
    MANIFEST,
    TOOLS,
    WRITE_TOOLS,
    WATCHER_STATS,
    SuperNinjaBridge,
    tool_spawn_actor,
    tool_place_static_mesh,
    tool_set_directional_light,
    tool_take_screenshot,
    tool_save_level,
    tool_save_level_as,
    tool_create_folder,
    tool_import_asset,
    tool_execute_python,
    tool_bridge_health,
    tool_find_actors,
    tool_destroy_actor,
    tool_set_actor_transform,
    tool_set_viewport_camera,
)

__all__ = [
    "BRIDGE_VERSION", "MANIFEST", "TOOLS", "WRITE_TOOLS", "WATCHER_STATS",
    "SuperNinjaBridge",
    "tool_spawn_actor", "tool_place_static_mesh", "tool_set_directional_light",
    "tool_take_screenshot", "tool_save_level", "tool_save_level_as",
    "tool_create_folder", "tool_import_asset", "tool_execute_python",
    "tool_bridge_health", "tool_find_actors", "tool_destroy_actor",
    "tool_set_actor_transform", "tool_set_viewport_camera",
]

__version__ = BRIDGE_VERSION
