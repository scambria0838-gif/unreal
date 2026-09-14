"""
SuperNinjaBridge
----------------
Inside-UE5 Python bridge that executes MSA tool calls.

The plugin's C++ runtime subsystem sends requests to the MSA API (cloud or
local). The MSA decides what to do and returns a sequence of tool calls
(spawn_actor, set_light, create_material, etc.). This bridge executes them
inside the Unreal Editor.
"""
import json
import os
import unreal


# -----------------------------------------------------------------------------
# Tool implementations — each accepts a dict of args and returns a dict
# -----------------------------------------------------------------------------
def tool_spawn_actor(args: dict) -> dict:
    """Spawn an actor at a location. args: {class_path, location, rotation, scale, label}"""
    class_path = args.get("class_path", "/Script/Engine.StaticMeshActor")
    loc = args.get("location", [0, 0, 0])
    rot = args.get("rotation", [0, 0, 0])
    scale = args.get("scale", [1, 1, 1])
    label = args.get("label", "SuperNinja_Spawn")

    actor_class = unreal.load_class(None, class_path) or unreal.StaticMeshActor
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        actor_class,
        unreal.Vector(*loc),
        unreal.Rotator(*rot),
    )
    if actor:
        actor.set_actor_scale3d(unreal.Vector(*scale))
        actor.set_actor_label(label)
        return {"ok": True, "actor": actor.get_path_name()}
    return {"ok": False, "error": "spawn failed"}


def tool_place_static_mesh(args: dict) -> dict:
    """Spawn a StaticMeshActor with a specific mesh. args: {mesh_path, location, rotation, scale, label}"""
    mesh_path = args["mesh_path"]
    mesh = unreal.EditorAssetLibrary.load_asset(mesh_path)
    if not mesh:
        return {"ok": False, "error": f"mesh not found: {mesh_path}"}

    loc = args.get("location", [0, 0, 0])
    rot = args.get("rotation", [0, 0, 0])
    scale = args.get("scale", [1, 1, 1])
    label = args.get("label", os.path.basename(mesh_path))

    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.StaticMeshActor,
        unreal.Vector(*loc),
        unreal.Rotator(*rot),
    )
    actor.set_actor_scale3d(unreal.Vector(*scale))
    actor.set_actor_label(label)
    actor.static_mesh_component.set_static_mesh(mesh)
    return {"ok": True, "actor": actor.get_path_name()}


def tool_set_directional_light(args: dict) -> dict:
    """Create/modify the main directional light. args: {intensity, color, rotation}"""
    intensity = args.get("intensity", 5.0)
    color = args.get("color", [1.0, 0.95, 0.85])
    rot = args.get("rotation", [-35, 45, 0])

    light = unreal.EditorLevelLibrary.spawn_actor_from_class(
        unreal.DirectionalLight, unreal.Vector(0, 0, 500), unreal.Rotator(*rot)
    )
    if not light:
        return {"ok": False, "error": "failed"}
    comp = light.light_component
    comp.set_intensity(intensity)
    comp.set_light_color(unreal.LinearColor(*color))
    return {"ok": True, "light": light.get_path_name()}


def tool_take_screenshot(args: dict) -> dict:
    """Capture a viewport screenshot. args: {filename}"""
    name = args.get("filename", "superninja_capture.png")
    unreal.AutomationLibrary.take_high_res_screenshot(1920, 1080, name)
    return {"ok": True, "file": name}


def tool_save_level(args: dict) -> dict:
    """Save current level. args: {package_path (optional)}"""
    unreal.EditorLevelLibrary.save_current_level()
    return {"ok": True}


def tool_create_folder(args: dict) -> dict:
    """Create a content browser folder. args: {path}"""
    path = args["path"]
    unreal.EditorAssetLibrary.make_directory(path)
    return {"ok": True, "path": path}


def tool_import_asset(args: dict) -> dict:
    """Import an asset from disk. args: {source_file, destination_path}"""
    src = args["source_file"]
    dst = args.get("destination_path", "/Game/SuperNinja_Imports")
    task = unreal.AssetImportTask()
    task.filename = src
    task.destination_path = dst
    task.replace_existing = True
    task.save = True
    task.automated = True
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    return {"ok": True, "dest": dst}


def tool_execute_python(args: dict) -> dict:
    """Run arbitrary Python in the editor. args: {code}"""
    code = args.get("code", "")
    try:
        exec_globals = {"unreal": unreal}
        exec(code, exec_globals)
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# -----------------------------------------------------------------------------
# Bridge
# -----------------------------------------------------------------------------
TOOLS = {
    "spawn_actor":             tool_spawn_actor,
    "place_static_mesh":       tool_place_static_mesh,
    "set_directional_light":   tool_set_directional_light,
    "take_screenshot":         tool_take_screenshot,
    "save_level":              tool_save_level,
    "create_folder":           tool_create_folder,
    "import_asset":            tool_import_asset,
    "execute_python":          tool_execute_python,
}


class SuperNinjaBridge:
    """Registers into UE5 so the C++ subsystem can call it."""

    def register(self):
        # Expose `superninja_execute_tool` as a global Python callable
        # that the MSA backend or RemoteControl calls can invoke.
        import builtins
        builtins.superninja_execute_tool = self.execute_tool
        unreal.log(f"🥷 SuperNinjaBridge — {len(TOOLS)} tools registered: "
                   f"{', '.join(sorted(TOOLS.keys()))}")

    def execute_tool(self, tool_name: str, args_json: str) -> str:
        """Entry point called from the MSA response stream."""
        try:
            args = json.loads(args_json) if isinstance(args_json, str) else (args_json or {})
        except json.JSONDecodeError as e:
            return json.dumps({"ok": False, "error": f"bad json: {e}"})

        tool = TOOLS.get(tool_name)
        if not tool:
            return json.dumps({"ok": False, "error": f"unknown tool: {tool_name}",
                               "available": list(TOOLS.keys())})
        try:
            result = tool(args)
            return json.dumps(result)
        except Exception as e:
            return json.dumps({"ok": False, "error": str(e)})

    def execute_plan(self, plan_json: str) -> str:
        """Execute a sequence of tool calls from the MSA."""
        try:
            plan = json.loads(plan_json)
        except json.JSONDecodeError as e:
            return json.dumps({"ok": False, "error": f"bad plan json: {e}"})

        results = []
        for step in plan.get("steps", []):
            name = step.get("tool")
            args = step.get("args", {})
            results.append({
                "step":  step.get("id"),
                "tool":  name,
                "result": json.loads(self.execute_tool(name, json.dumps(args)))
            })

        return json.dumps({
            "ok": all(r["result"].get("ok", False) for r in results),
            "results": results
        })