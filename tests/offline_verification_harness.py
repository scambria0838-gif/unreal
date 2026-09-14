"""
Offline verification harness for superninja_bridge_v2.

What this is
------------
A fake ``unreal`` module that behaves like the parts of the Editor API the
bridge touches, plus a real temporary project directory on disk with a real
Content/__ExternalActors__/ tree. The bridge is imported against it unchanged.

What this proves
----------------
The bridge's DECISION LOGIC: PIE refusal, unknown-world refusal, duplicate-label
policy, read-after-write failure detection, World Partition save verification by
external-actor diff, dirty-package reporting, dry-run, plan halting, and the
"ok can never be true when verified is false" invariant.

What this does NOT prove
------------------------
That the real ``unreal`` API calls have the names and semantics assumed here.
Only a run inside a live UE 5.8 Editor proves that. See TEST_RESULTS.md for the
exact split, and tests/live_smoke_test.py for the live half.

Run:  python tests/offline_verification_harness.py
"""

import json
import os
import shutil
import sys
import tempfile
import time
import types

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PLUGIN_PY = os.path.join(
    REPO, "Plugins", "SuperNinjaAI", "Content", "Python")
sys.path.insert(0, PLUGIN_PY)
sys.path.insert(0, REPO)


# =============================================================================
# Fake unreal module
# =============================================================================

class FakeVector(object):
    def __init__(self, x=0, y=0, z=0):
        self.x, self.y, self.z = x, y, z


class FakeRotator(FakeVector):
    pass


class FakeColor(object):
    def __init__(self, r=1, g=1, b=1, a=1):
        self.r, self.g, self.b, self.a = r, g, b, a


class FakeClass(object):
    def __init__(self, name):
        self._name = name

    def get_name(self):
        return self._name


class FakeWorld(object):
    def __init__(self, path):
        self.path = path

    def get_path_name(self):
        return self.path

    def get_editor_property(self, name):
        raise Exception("not exposed")


class FakeLightComponent(object):
    def __init__(self):
        self.intensity = 0.0
        self.color = None

    def set_intensity(self, v):
        self.intensity = v

    def set_light_color(self, c):
        self.color = c


class FakeMeshComponent(object):
    def __init__(self):
        self.static_mesh = None

    def set_static_mesh(self, m):
        self.static_mesh = m


class FakeAsset(object):
    def __init__(self, path):
        self.path = path

    def get_path_name(self):
        return self.path


class FakeActor(object):
    def __init__(self, cls_name, world, loc, rot):
        self.cls = FakeClass(cls_name)
        self.world = world
        self.label = ""
        self.loc = loc
        self.rot = rot
        self.scale = None
        self.light_component = FakeLightComponent()
        self.static_mesh_component = FakeMeshComponent()
        self._id = "{}_{}".format(cls_name, id(self))

    # --- API surface the bridge uses ---
    def get_actor_label(self):
        return self.label

    def set_actor_label(self, v):
        self.label = v

    def get_path_name(self):
        return "{}:PersistentLevel.{}".format(self.world.get_path_name(), self._id)

    def get_actor_location(self):
        return FakeVector(*self.loc) if isinstance(self.loc, (list, tuple)) else self.loc

    def set_actor_location(self, loc, _sweep=False, _teleport=False):
        self.loc = [loc.x, loc.y, loc.z] if hasattr(loc, "x") else loc

    def set_actor_rotation(self, r, _teleport=False):
        self.rot = r

    def get_actor_rotation(self):
        if hasattr(self.rot, "x"):
            return self.rot
        if isinstance(self.rot, (list, tuple)):
            return FakeRotator(*self.rot)
        return FakeRotator()

    def set_actor_scale3d(self, s):
        self.scale = s

    def get_actor_scale3d(self):
        if self.scale is None:
            return FakeVector(1, 1, 1)
        if hasattr(self.scale, "x"):
            return self.scale
        return FakeVector(*self.scale)

    def get_class(self):
        return self.cls

    def get_world(self):
        return self.world

    def get_attach_parent_actor(self):
        return None

    def get_editor_property(self, name):
        if name in ("actor_guid", "ActorGuid"):
            return "GUID-{}".format(self._id)
        raise Exception("no property {}".format(name))


class FakeEditor(object):
    """Mutable state the tests drive."""

    def __init__(self, project_dir):
        self.project_dir = project_dir
        self.editor_world = FakeWorld("/Game/Maps/Lvl_FirstPerson.Lvl_FirstPerson")
        self.pie_world = None
        self.actors = []
        self.dirty_maps = []
        self.dirty_content = []
        self.assets = {}
        self.directories = set()
        self.save_hook = None
        self.save_as_hook = None
        self.save_returns = True
        self.spawn_into_pie = False
        self.camera_loc = [0.0, 0.0, 0.0]
        self.camera_rot = [0.0, 0.0, 0.0]

    def world(self):
        return self.pie_world or self.editor_world

    def spawn(self, cls_name, loc, rot):
        world = self.pie_world if (self.pie_world and self.spawn_into_pie) \
            else self.editor_world
        a = FakeActor(cls_name, world, loc, rot)
        self.actors.append(a)
        self.dirty_maps.append("/Game/Maps/Lvl_FirstPerson")
        return a


EDITOR = None  # set by the harness


def build_fake_unreal(editor):
    u = types.ModuleType("unreal")

    u.Vector, u.Rotator, u.LinearColor = FakeVector, FakeRotator, FakeColor
    u.StaticMeshActor = FakeClass("StaticMeshActor")
    u.DirectionalLight = FakeClass("DirectionalLight")

    u.log = lambda m: None
    u.log_warning = lambda m: None
    u.log_error = lambda m: None

    def load_class(_outer, path):
        return FakeClass(str(path).split(".")[-1])
    u.load_class = load_class

    # --- subsystems ---
    class UnrealEditorSubsystem(object):
        def get_editor_world(self):
            return editor.editor_world

        def get_game_world(self):
            return editor.pie_world

        def get_level_viewport_camera_info(self):
            return (FakeVector(*editor.camera_loc), FakeRotator(*editor.camera_rot))

        def set_level_viewport_camera_info(self, loc, rot):
            editor.camera_loc = [loc.x, loc.y, loc.z]
            editor.camera_rot = [rot.x, rot.y, rot.z]

    class EditorActorSubsystem(object):
        def get_all_level_actors(self):
            return list(editor.actors)

        def spawn_actor_from_class(self, cls, loc, rot):
            return editor.spawn(cls.get_name() if hasattr(cls, "get_name")
                                else str(cls), (loc.x, loc.y, loc.z), rot)

        def destroy_actor(self, actor):
            if actor in editor.actors:
                editor.actors.remove(actor)

    class LevelEditorSubsystem(object):
        def save_current_level(self):
            if editor.save_hook:
                editor.save_hook()
            editor.dirty_maps = []
            return editor.save_returns

        def save_current_level_as(self, package_path):
            if editor.save_as_hook:
                editor.save_as_hook(package_path)
            editor.dirty_maps = []
            return editor.save_returns

    u.UnrealEditorSubsystem = UnrealEditorSubsystem
    u.EditorActorSubsystem = EditorActorSubsystem
    u.LevelEditorSubsystem = LevelEditorSubsystem

    _instances = {
        UnrealEditorSubsystem: UnrealEditorSubsystem(),
        EditorActorSubsystem: EditorActorSubsystem(),
        LevelEditorSubsystem: LevelEditorSubsystem(),
    }
    u.get_editor_subsystem = lambda cls: _instances[cls]

    # --- legacy library: deliberately absent, to prove the subsystem path
    #     works on its own. Attribute access raises like a missing API would.
    class _MissingLibrary(object):
        def __getattr__(self, name):
            raise AttributeError("EditorLevelLibrary.{} not available".format(name))
    u.EditorLevelLibrary = _MissingLibrary()

    # --- paths ---
    class Paths(object):
        @staticmethod
        def project_content_dir():
            return os.path.join(editor.project_dir, "Content")

        @staticmethod
        def project_saved_dir():
            return os.path.join(editor.project_dir, "Saved")

        @staticmethod
        def project_dir():
            return editor.project_dir

        @staticmethod
        def convert_relative_path_to_full(p):
            return os.path.abspath(p)
    u.Paths = Paths

    # --- assets ---
    class EditorAssetLibrary(object):
        @staticmethod
        def load_asset(path):
            return editor.assets.get(path)

        @staticmethod
        def does_directory_exist(path):
            return path in editor.directories

        @staticmethod
        def make_directory(path):
            editor.directories.add(path)

        @staticmethod
        def list_assets(path, recursive=True):
            return [a for a in editor.assets if a.startswith(path)]
    u.EditorAssetLibrary = EditorAssetLibrary

    class _Pkg(object):
        def __init__(self, n):
            self.n = n

        def get_name(self):
            return self.n

    class EditorLoadingAndSavingUtils(object):
        @staticmethod
        def get_dirty_map_packages():
            return [_Pkg(n) for n in dict.fromkeys(editor.dirty_maps)]

        @staticmethod
        def get_dirty_content_packages():
            return [_Pkg(n) for n in dict.fromkeys(editor.dirty_content)]
    u.EditorLoadingAndSavingUtils = EditorLoadingAndSavingUtils

    class GameplayStatics(object):
        @staticmethod
        def get_world_settings(_world):
            raise Exception("WorldSettings not exposed in this build")
    u.GameplayStatics = GameplayStatics

    class SystemLibrary(object):
        @staticmethod
        def get_engine_version():
            return "5.8.0-fake"
    u.SystemLibrary = SystemLibrary

    class SourceControl(object):
        @staticmethod
        def is_enabled():
            return False

        @staticmethod
        def is_available():
            return False
    u.SourceControl = SourceControl

    class ScopedEditorTransaction(object):
        def __init__(self, desc):
            self.desc = desc

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False
    u.ScopedEditorTransaction = ScopedEditorTransaction

    class AutomationLibrary(object):
        @staticmethod
        def take_high_res_screenshot(w, h, name):
            return True
    u.AutomationLibrary = AutomationLibrary

    return u


# =============================================================================
# Test runner
# =============================================================================

RESULTS = []


def check(name, condition, detail=""):
    RESULTS.append((name, bool(condition), detail))
    print("{} {}{}".format("PASS" if condition else "FAIL", name,
                           "  <- {}".format(detail) if detail and not condition else ""))


def ext_dir(project, sub="Maps/Lvl_FirstPerson"):
    return os.path.join(project, "Content", "__ExternalActors__", *sub.split("/"))


def write_ext_actor(project, token, size=100):
    d = os.path.join(ext_dir(project), token[:2], token[2:4])
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, "{}.uasset".format(token))
    with open(p, "wb") as fh:
        fh.write(b"x" * size)
    return p


def main():
    global EDITOR
    project = tempfile.mkdtemp(prefix="sn_fake_project_")
    os.makedirs(os.path.join(project, "Content"), exist_ok=True)
    os.makedirs(os.path.join(project, "Saved", "Screenshots"), exist_ok=True)
    os.makedirs(os.path.join(project, "Plugins", "UnrealMCP"), exist_ok=True)
    os.makedirs(os.path.join(project, "Plugins", "SuperNinjaAI"), exist_ok=True)

    EDITOR = FakeEditor(project)
    sys.modules["unreal"] = build_fake_unreal(EDITOR)

    import superninja_bridge_v2 as sb
    sb.unreal = sys.modules["unreal"]
    bridge = sb.SuperNinjaBridge()

    def call(tool, **args):
        return json.loads(bridge.execute_tool(tool, json.dumps(args)))

    print("\n--- Bug 2: PIE guard ---")
    EDITOR.pie_world = FakeWorld(
        "/Game/Maps/UEDPIE_0_Lvl_FirstPerson.UEDPIE_0_Lvl_FirstPerson")
    r = call("spawn_actor", label="PIE_Test")
    check("PIE: spawn refused", r["ok"] is False and r["verified"] is False, r)
    check("PIE: context reported as PIE", r["world_context"] == "PIE", r)
    check("PIE: reason names PIE mode", "PIE mode" in r.get("reason", ""), r)
    check("PIE: no actor created", len(EDITOR.actors) == 0, EDITOR.actors)
    r = call("save_level")
    check("PIE: save_level also refused", r["ok"] is False, r)
    r = call("execute_python", code="pass")
    check("PIE: execute_python also refused", r["ok"] is False, r)
    r = call("spawn_actor", label="PIE_OK", allow_pie=True)
    check("PIE: allow_pie=true overrides the guard", r["world_context"] == "PIE"
          and "PIE mode" not in r.get("reason", ""), r)
    EDITOR.actors = []
    EDITOR.pie_world = None

    print("\n--- Unknown world guard ---")
    saved_world = EDITOR.editor_world
    EDITOR.editor_world = None
    r = call("spawn_actor", label="NoWorld")
    check("Unknown world: spawn refused", r["ok"] is False
          and r["world_context"] == "Unknown", r)
    EDITOR.editor_world = saved_world

    print("\n--- Bug 3: read-after-write verification ---")
    r = call("spawn_actor", label="SmokeTest_A", location=[100, 0, 0])
    check("spawn: ok and verified", r["ok"] and r["verified"], r)
    check("spawn: before/after counts present",
          r["before"]["actor_count"] == 0 and r["after"]["actor_count"] == 1, r)
    check("spawn: dirty_packages reported", r["dirty_packages"] == [
        "/Game/Maps/Lvl_FirstPerson"], r)
    check("spawn: world_context Editor", r["world_context"] == "Editor", r)

    # Simulate the exact v1 bug: the spawn call returns an actor, but nothing
    # lands in the level. v1 returned ok=true here.
    orig_spawn = EDITOR.spawn
    EDITOR.spawn = lambda c, l, rt: FakeActor(c, EDITOR.editor_world, l, rt)  # not appended
    r = call("spawn_actor", label="Ghost")
    check("spawn: phantom actor detected as failure",
          r["ok"] is False and "no actor labelled Ghost" in r.get("reason", ""), r)
    EDITOR.spawn = orig_spawn

    # Simulate a spawn that silently lands in the PIE world.
    EDITOR.pie_world = FakeWorld("/Game/Maps/UEDPIE_0_Lvl.UEDPIE_0_Lvl")
    EDITOR.spawn_into_pie = True
    r = call("spawn_actor", label="Leaked", allow_pie=True)
    check("spawn: actor landing in PIE world reported unverified",
          r["ok"] is False and "PIE world" in r.get("reason", ""), r)
    EDITOR.pie_world = None
    EDITOR.spawn_into_pie = False
    EDITOR.actors = [a for a in EDITOR.actors if a.label == "SmokeTest_A"]

    print("\n--- Bug 4: duplicate-label guard ---")
    r = call("spawn_actor", label="SmokeTest_A", location=[200, 0, 0])
    check("duplicate: default policy refuses", r["ok"] is False
          and "already exists" in r.get("reason", ""), r)
    check("duplicate: no second actor created", len(EDITOR.actors) == 1,
          len(EDITOR.actors))
    r = call("spawn_actor", label="SmokeTest_A", on_duplicate="skip")
    check("duplicate: skip returns ok with skipped=true",
          r["ok"] and r.get("skipped") is True, r)
    check("duplicate: skip created nothing", len(EDITOR.actors) == 1,
          len(EDITOR.actors))
    r = call("spawn_actor", label="SmokeTest_A", on_duplicate="replace",
             location=[300, 0, 0])
    check("duplicate: replace succeeds", r["ok"] and r["verified"], r)
    check("duplicate: replace leaves exactly one", len(EDITOR.actors) == 1,
          len(EDITOR.actors))

    print("\n--- place_static_mesh: mesh assignment verified ---")
    EDITOR.assets["/Game/KB3D/SM_Wall"] = FakeAsset("/Game/KB3D/SM_Wall.SM_Wall")
    r = call("place_static_mesh", mesh_path="/Game/KB3D/SM_Wall", label="Wall_A")
    check("mesh: ok and verified", r["ok"] and r["verified"], r)
    check("mesh: assigned mesh reported",
          r["after"]["assigned_mesh"] == "/Game/KB3D/SM_Wall.SM_Wall", r)
    r = call("place_static_mesh", mesh_path="/Game/Missing/SM_Nope", label="Nope")
    check("mesh: missing mesh refused", r["ok"] is False
          and "mesh not found" in r.get("reason", ""), r)
    r = call("place_static_mesh", mesh_path="/Engine/Basic/Cube", label="Outside")
    check("mesh: path outside manifest refused", r["ok"] is False
          and "outside the allowed content roots" in r.get("reason", ""), r)

    print("\n--- Bug 1 + 5: World Partition save verification ---")
    # Pre-seed a partitioned level with 110 external actors.
    for i in range(110):
        write_ext_actor(project, "A{:05d}Z".format(i))
    EDITOR.dirty_maps = ["/Game/Maps/Lvl_FirstPerson"]
    EDITOR.dirty_content = ["/Game/KB3D/M_Asphalt"]

    r = call("bridge_health")
    check("health: detects World Partition", r["world_partition"] is True, r)
    check("health: counts 110 external actors",
          r["external_actor_count"] == 110, r["external_actor_count"])
    check("health: flags conflicting plugin UnrealMCP",
          r["conflicting_plugins"] == ["UnrealMCP"], r["conflicting_plugins"])
    check("health: reports UE version", r["ue_version"] == "5.8.0-fake", r)
    check("health: reports dirty packages", len(r["dirty_packages"]) == 2, r)
    check("health: reports v2.2.0", r.get("bridge_version") == "2.2.0", r)
    check("health: reports 15 tools",
          r.get("tool_count") == 15 and len(r.get("tools") or []) == 15, r)

    # A save that really writes 15 new external actors.
    def good_save():
        for i in range(15):
            write_ext_actor(project, "B{:05d}Z".format(i))
    EDITOR.save_hook = good_save
    r = call("save_level", settle_seconds=0, expect_added=15)
    check("save WP: ok and verified", r["ok"] and r["verified"], r.get("reason"))
    check("save WP: verified via external actors",
          r["verification_method"] == "__ExternalActors__ tree diff", r)
    check("save WP: 15 files reported written",
          len(r["after"]["external_actor_diff"]["added"]) == 15, r)
    check("save WP: count 110 -> 125",
          r["before"]["external_actor_count"] == 110
          and r["after"]["external_actor_count"] == 125, r)
    check("save WP: .umap explicitly not used as evidence",
          "not used as evidence" in r.get("note", ""), r)
    check("save WP: cleared dirty packages listed",
          "/Game/Maps/Lvl_FirstPerson" in r["after"]["packages_cleared_by_save"], r)
    check("save WP: still-dirty packages listed (Bug 5)",
          r["after"]["packages_still_dirty"] == ["/Game/KB3D/M_Asphalt"], r)

    # THE v1 BUG: save call returns True, nothing is written, no package cleared.
    EDITOR.save_hook = None
    EDITOR.dirty_maps = []
    EDITOR.dirty_content = ["/Game/KB3D/M_Asphalt"]
    EDITOR.save_returns = True
    r = call("save_level", settle_seconds=0)
    check("save WP: silent no-op save reported as FAILURE",
          r["ok"] is False and "Nothing was persisted" in r.get("reason", ""), r)

    # Expectation mismatch: 3 files written but 15 expected.
    EDITOR.save_hook = lambda: [write_ext_actor(project, "C{:05d}Z".format(i))
                                for i in range(3)]
    EDITOR.dirty_maps = ["/Game/Maps/Lvl_FirstPerson"]
    r = call("save_level", settle_seconds=0, expect_added=15)
    check("save WP: partial write vs expectation reported as failure",
          r["ok"] is False and "expected 15 new external actor files, saw 3"
          in r.get("reason", ""), r)

    # Deletion path: removing external actors is verified too.
    victims = sorted(os.listdir(os.path.join(ext_dir(project), "A0", "00")))[:4]
    EDITOR.save_hook = lambda: [os.remove(os.path.join(
        ext_dir(project), "A0", "00", v)) for v in victims]
    EDITOR.dirty_maps = ["/Game/Maps/Lvl_FirstPerson"]
    r = call("save_level", settle_seconds=0, expect_removed=4)
    check("save WP: deletions verified",
          r["ok"] and len(r["after"]["external_actor_diff"]["removed"]) == 4, r)

    print("\n--- Classic (non-partitioned) level save ---")
    shutil.rmtree(os.path.join(project, "Content", "__ExternalActors__"))
    umap = os.path.join(project, "Content", "Maps", "Lvl_FirstPerson.umap")
    os.makedirs(os.path.dirname(umap), exist_ok=True)
    open(umap, "w").close()
    os.utime(umap, (1000, 1000))
    EDITOR.dirty_maps = ["/Game/Maps/Lvl_FirstPerson"]
    EDITOR.save_hook = lambda: os.utime(umap, None)
    r = call("save_level", settle_seconds=0)
    check("save classic: verified via .umap mtime",
          r["ok"] and r["verification_method"] == ".umap mtime + dirty set", r)
    os.utime(umap, (1000, 1000))
    EDITOR.dirty_maps = []
    EDITOR.save_hook = None
    r = call("save_level", settle_seconds=0)
    check("save classic: untouched .umap reported as failure",
          r["ok"] is False and "did not update" in r.get("reason", ""), r)

    print("\n--- execute_python honesty ---")
    r = call("execute_python", code="x = 1 + 1")
    check("python: unverifiable code is NOT reported ok",
          r["ok"] is False and r.get("executed") is True
          and "cannot be verified" in r.get("reason", ""), r)
    r = call("execute_python", code="x = 41 + 1", expect="True")
    check("python: expect expression makes it verified", r["ok"] and r["verified"], r)
    r = call("execute_python", code="x = 1", expect="False")
    check("python: false expect reported as failure",
          r["ok"] is False and "evaluated false" in r.get("reason", ""), r)
    r = call("execute_python", code="raise ValueError('boom')")
    check("python: exception reported with traceback",
          r["ok"] is False and "boom" in r.get("reason", "")
          and "traceback" in r, r)

    print("\n--- create_folder / import_asset ---")
    r = call("create_folder", path="/Game/SuperNinja_Test")
    check("folder: created and verified", r["ok"] and r["after"]["exists"], r)
    check("folder: v1 key 'path' preserved", r.get("path") == "/Game/SuperNinja_Test", r)
    r = call("import_asset", source_file=os.path.join(project, "nope.fbx"))
    check("import: missing source refused", r["ok"] is False
          and "does not exist" in r.get("reason", ""), r)

    print("\n--- dry run ---")
    n_before = len(EDITOR.actors)
    r = call("spawn_actor", label="DryRunActor", dry_run=True)
    check("dry_run: reports what it would do", r["ok"] and r.get("dry_run") is True, r)
    check("dry_run: nothing spawned", len(EDITOR.actors) == n_before, EDITOR.actors)

    print("\n--- plan execution ---")
    plan = {"steps": [
        {"id": 1, "tool": "spawn_actor", "args": {"label": "Plan_A"}},
        {"id": 2, "tool": "spawn_actor", "args": {"label": "Plan_A"}},
        {"id": 3, "tool": "spawn_actor", "args": {"label": "Plan_C"}},
    ]}
    r = json.loads(bridge.execute_plan(json.dumps(plan)))
    check("plan: halts at the duplicate step", r["ok"] is False
          and r["halted_at"]["step"] == 2, r["halted_at"])
    check("plan: remaining steps skipped, not silently run",
          r["steps_executed"] == 2 and r["steps_skipped"] == 1, r)
    r = json.loads(bridge.execute_plan(json.dumps(dict(plan, dry_run=True))))
    check("plan: dry_run executes nothing", r["dry_run"] is True, r)

    # all([]) is True, so the obvious aggregation reports a pass for a plan
    # that ran nothing. That is this project's own bug, one layer up.
    r = json.loads(bridge.execute_plan(json.dumps({"steps": []})))
    check("plan: an empty plan is a failure, not a vacuous pass",
          r["ok"] is False and r["verified"] is False, r)
    check("plan: empty plan says why", "proved nothing" in (r.get("reason") or ""), r)

    r = json.loads(bridge.execute_plan(json.dumps({
        "steps": [{"id": "p1", "tool": "spawn_actor",
                   "args": {"label": "PlanPersist_A"}}],
        "verify_persistence": True})))
    pers = r.get("persistence")
    check("plan: verify_persistence reconciles claims against disk",
          isinstance(pers, dict) and "claimed" in pers and "unproven" in pers, pers)
    check("plan: reconciliation names the step behind each claim",
          isinstance(pers, dict) and isinstance(pers.get("claimed_by_step"), dict), pers)
    check("plan: unproven claims sink the whole plan",
          (not pers.get("unproven")) or (r["ok"] is False and r["verified"] is False), r)

    print("\n--- first-class actor / camera / save-as tools ---")
    r = call("find_actors", name_contains="Smoke")
    check("find_actors: verified read", r["ok"] and r["verified"] and r["count"] >= 1, r)
    r = call("set_actor_transform", label="SmokeTest_A", location=[9, 8, 7],
             rotation=[1, 2, 3], scale=[2, 2, 2])
    check("set_actor_transform: ok and verified", r["ok"] and r["verified"], r)
    check("set_actor_transform: location read back",
          r["after"]["target"]["location"] == [9.0, 8.0, 7.0], r)
    r = call("set_actor_transform", label="MissingActor", location=[0, 0, 0])
    check("set_actor_transform: missing actor refused",
          r["ok"] is False and "no actor matched" in r.get("reason", ""), r)
    n_before = len(EDITOR.actors)
    r = call("destroy_actor", label="SmokeTest_A")
    check("destroy_actor: ok and verified", r["ok"] and r["verified"], r)
    check("destroy_actor: actor gone", len(EDITOR.actors) == n_before - 1, EDITOR.actors)
    r = call("destroy_actor", label="SmokeTest_A")
    check("destroy_actor: missing is a failure by default", r["ok"] is False, r)
    r = call("destroy_actor", label="SmokeTest_A", on_missing="skip")
    check("destroy_actor: on_missing=skip is verified",
          r["ok"] and r.get("skipped") is True, r)
    r = call("set_viewport_camera", location=[10, 20, 30], rotation=[0, 45, 0])
    check("set_viewport_camera: ok and verified", r["ok"] and r["verified"], r)
    check("set_viewport_camera: location read back",
          r["after"]["location"] == [10.0, 20.0, 30.0], r)

    dest_umap = os.path.join(project, "Content", "Maps", "Lvl_Copy.umap")

    def write_copy(_path):
        os.makedirs(os.path.dirname(dest_umap), exist_ok=True)
        open(dest_umap, "w").close()
    EDITOR.save_as_hook = write_copy
    r = call("save_level_as", package_path="/Game/Maps/Lvl_Copy", settle_seconds=0)
    check("save_level_as: ok and verified", r["ok"] and r["verified"], r)
    check("save_level_as: dest file exists", os.path.isfile(dest_umap), dest_umap)
    r = call("save_level_as", package_path="/Engine/Maps/Nope", settle_seconds=0)
    check("save_level_as: outside manifest refused",
          r["ok"] is False and "outside the allowed" in r.get("reason", ""), r)
    EDITOR.save_as_hook = None
    r = call("save_level_as", package_path="/Game/Maps/GhostCopy", settle_seconds=0)
    check("save_level_as: missing dest file is a failure",
          r["ok"] is False and "was not created" in r.get("reason", ""), r)

    print("\n--- envelope invariants ---")
    every = []
    for tool in sb.TOOLS:
        res = call(tool, code="pass", path="/Game/X", source_file="nope",
                   mesh_path="/Game/KB3D/SM_Wall", label="Envelope_" + tool)
        every.append((tool, res))
    check("envelope: every tool returns ok/verified/world_context/before/after/"
          "dirty_packages",
          all(all(k in res for k in ("ok", "verified", "world_context", "before",
                                     "after", "dirty_packages"))
              for _t, res in every),
          [t for t, res in every
           if not all(k in res for k in ("ok", "verified", "world_context"))])
    check("envelope: ok is never true while verified is false",
          all(not (res["ok"] and not res["verified"]) for _t, res in every), "")
    check("envelope: every failure carries a reason",
          all(res.get("reason") for _t, res in every if not res["ok"]), "")
    check("envelope: unknown tool rejected",
          json.loads(bridge.execute_tool("nope", "{}"))["ok"] is False, "")
    check("envelope: malformed json rejected",
          json.loads(bridge.execute_tool("spawn_actor", "{not json"))["ok"] is False, "")

    shutil.rmtree(project, ignore_errors=True)

    passed = sum(1 for _n, ok, _d in RESULTS if ok)
    total = len(RESULTS)
    print("\n{}/{} checks passed".format(passed, total))
    if passed != total:
        print("FAILURES:")
        for n, ok, d in RESULTS:
            if not ok:
                print("  - {}  {}".format(n, d))
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
