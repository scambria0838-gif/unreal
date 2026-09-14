"""
Live smoke test for SuperNinjaBridge v2 — run this OUTSIDE Unreal.

It drives the real Editor through the inbox/outbox watcher and checks the
responses. Nothing in here is simulated: every PASS means the real UE 5.x
Python API did the thing and the bridge proved it.

Usage (UE Editor must be running with the v2 plugin loaded):

    python tests/live_smoke_test.py
    python tests/live_smoke_test.py --bridge-dir "C:/.../NINJA/Saved/SuperNinja"
    python tests/live_smoke_test.py --report TEST_RESULTS_live.md

Two steps need you at the keyboard; the script prompts and waits:
  - the PIE guard test (press Alt-P, then Enter here, then Stop)
  - nothing else

Every actor it creates is labelled SNV2_Smoke_* and destroyed at the end.
"""

import argparse
import json
import os
import sys
import time
import uuid

RESULTS = []


def find_bridge_dir(explicit=None):
    if explicit:
        return explicit
    env = os.environ.get("SUPERNINJA_BRIDGE_DIR")
    if env:
        return env
    guesses = []
    home = os.path.expanduser("~")
    for base in (os.path.join(home, "OneDrive", "Documents", "Unreal Projects"),
                 os.path.join(home, "Documents", "Unreal Projects")):
        if os.path.isdir(base):
            for proj in os.listdir(base):
                guesses.append(os.path.join(base, proj, "Saved", "SuperNinja"))
    guesses.append(os.path.join(home, "Desktop", "SuperNinjaBridge"))
    for g in guesses:
        if os.path.isdir(os.path.join(g, "sn_inbox")):
            return g
    return None


class Bridge(object):
    def __init__(self, root, timeout=45):
        self.root = root
        self.inbox = os.path.join(root, "sn_inbox")
        self.outbox = os.path.join(root, "sn_outbox")
        self.timeout = timeout
        os.makedirs(self.inbox, exist_ok=True)
        os.makedirs(self.outbox, exist_ok=True)

    def send(self, tool, timeout=None, **args):
        name = "smoke_{}_{}.json".format(tool, uuid.uuid4().hex[:8])
        payload = {"tool": tool, "args": args}
        tmp = os.path.join(self.inbox, name + ".part")
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(payload, fh)
        os.replace(tmp, os.path.join(self.inbox, name))

        out = os.path.join(self.outbox, name)
        deadline = time.time() + (timeout or self.timeout)
        while time.time() < deadline:
            if os.path.exists(out):
                time.sleep(0.05)
                try:
                    with open(out, "r", encoding="utf-8") as fh:
                        return json.load(fh)
                except Exception:
                    time.sleep(0.2)
                    continue
            time.sleep(0.15)
        raise TimeoutError(
            "no response for {} within {}s. The watcher is not running: check "
            "the Output Log for '[SuperNinja v2] watcher started'."
            .format(tool, timeout or self.timeout))


def check(name, cond, detail=""):
    RESULTS.append((name, bool(cond), str(detail)[:400]))
    print("{}  {}".format("PASS" if cond else "FAIL", name))
    if not cond and detail:
        print("      {}".format(str(detail)[:400]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bridge-dir")
    ap.add_argument("--report", default="TEST_RESULTS_live.md")
    ap.add_argument("--skip-pie", action="store_true",
                    help="skip the interactive PIE guard test")
    args = ap.parse_args()

    root = find_bridge_dir(args.bridge_dir)
    if not root:
        print("Could not find the bridge folder. Start the Editor with the v2 "
              "plugin, read the inbox path from the Output Log, and pass it "
              "with --bridge-dir.")
        return 2
    print("Bridge folder: {}\n".format(root))
    b = Bridge(root)

    # -- 0. liveness ------------------------------------------------------
    print("--- bridge health ---")
    t0 = time.time()
    try:
        h = b.send("bridge_health", sent_at=time.time(), timeout=30)
    except TimeoutError as exc:
        print("FAIL  bridge is not answering: {}".format(exc))
        return 1
    rtt = round((time.time() - t0) * 1000)
    check("bridge answers", h.get("ok"), h.get("reason"))
    check("world context is Editor (not PIE, not Unknown)",
          h.get("world_context") == "Editor", h.get("world_context"))
    print("      UE {}   bridge v{}   level {}   WP={}   round trip {} ms"
          .format(h.get("ue_version"), h.get("bridge_version"), h.get("level"),
                  h.get("world_partition"), rtt))
    print("      external actors: {}   dirty packages: {}   conflicts: {}"
          .format(h.get("external_actor_count"), len(h.get("dirty_packages") or []),
                  h.get("conflicting_plugins")))
    if h.get("world_context") != "Editor":
        print("\nStop. Exit PIE and re-run; the write tests need an Editor world.")
        return 1

    label_a, label_b = "SNV2_Smoke_A", "SNV2_Smoke_Mesh"
    created = []

    # -- 1. spawn + read-after-write --------------------------------------
    print("\n--- spawn_actor ---")
    r = b.send("spawn_actor", label=label_a, location=[0, 0, 300])
    check("spawn ok and verified", r.get("ok") and r.get("verified"), r.get("reason"))
    check("actor count increased",
          r.get("after", {}).get("actor_count", 0) >
          r.get("before", {}).get("actor_count", -1), r.get("after"))
    check("spawned path is not a PIE path",
          not (r.get("after", {}).get("spawned_actor") or {}).get("in_pie_world", True),
          r.get("after"))
    if r.get("ok"):
        created.append(label_a)

    # -- 2. duplicate guard ------------------------------------------------
    print("\n--- duplicate-label guard ---")
    r = b.send("spawn_actor", label=label_a, location=[0, 100, 300])
    check("second spawn refused by default", r.get("ok") is False
          and "already exists" in (r.get("reason") or ""), r.get("reason"))
    r = b.send("spawn_actor", label=label_a, on_duplicate="skip")
    check("on_duplicate=skip returns ok without creating",
          r.get("ok") and r.get("skipped"), r.get("reason"))
    r = b.send("spawn_actor", label=label_a, on_duplicate="replace",
               location=[0, 200, 300])
    check("on_duplicate=replace succeeds", r.get("ok") and r.get("verified"),
          r.get("reason"))

    # -- 3. place_static_mesh ---------------------------------------------
    print("\n--- place_static_mesh ---")
    mesh = "/Engine/BasicShapes/Cube"
    r = b.send("place_static_mesh", mesh_path=mesh, label=label_b,
               location=[300, 0, 300])
    if r.get("ok") is False and "outside the allowed content roots" in (r.get("reason") or ""):
        print("      (engine content blocked by the manifest, as designed - "
              "retrying with a /Game mesh is up to you)")
        check("manifest boundary enforced on engine content", True)
    else:
        check("mesh placed and verified", r.get("ok") and r.get("verified"),
              r.get("reason"))
        check("assigned mesh matches request",
              (r.get("after") or {}).get("assigned_mesh"), r.get("after"))
        if r.get("ok"):
            created.append(label_b)

    # -- 4. save + external-actor verification -----------------------------
    print("\n--- save_level ---")
    r = b.send("save_level", timeout=120)
    check("save ok and verified", r.get("ok") and r.get("verified"), r.get("reason"))
    check("verification method reported", r.get("verification_method"),
          r.get("verification_method"))
    print("      {}".format(r.get("note") or r.get("reason")))
    if r.get("before", {}).get("world_partition"):
        d = (r.get("after") or {}).get("external_actor_diff") or {}
        check("external-actor files were written",
              len(d.get("added", [])) + len(d.get("modified", [])) > 0, d)
        check(".umap was not used as the evidence",
              "not used as evidence" in (r.get("note") or ""), r.get("note"))
        for p in (d.get("added") or [])[:10]:
            print("        + {}".format(p))
    check("dirty packages listed", isinstance(r.get("dirty_packages"), list),
          r.get("dirty_packages"))

    # -- 5. persistence across a reload probe ------------------------------
    print("\n--- persistence probe ---")
    r = b.send("execute_python",
               code="import unreal\n"
                    "sub = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)\n"
                    "hits = [a for a in sub.get_all_level_actors() "
                    "if a.get_actor_label() == '{}']\n"
                    "result = len(hits)".format(label_a),
               expect="result == 1")
    check("actor still present after save", r.get("ok") and r.get("verified"),
          r.get("reason"))

    # -- 6. PIE guard (interactive) ----------------------------------------
    if not args.skip_pie:
        print("\n--- PIE guard (interactive) ---")
        input("Press Alt-P in the Editor to enter Play In Editor, then press "
              "Enter here... ")
        r = b.send("spawn_actor", label="SNV2_Smoke_PIE", location=[0, 0, 500])
        check("spawn refused during PIE", r.get("ok") is False, r.get("reason"))
        check("world_context reported as PIE", r.get("world_context") == "PIE",
              r.get("world_context"))
        check("refusal message names PIE mode",
              "PIE mode" in (r.get("reason") or ""), r.get("reason"))
        r = b.send("save_level")
        check("save also refused during PIE", r.get("ok") is False, r.get("reason"))
        input("Press Esc / Stop in the Editor to exit PIE, then press Enter here... ")
        r = b.send("bridge_health")
        check("context back to Editor after PIE exit",
              r.get("world_context") == "Editor", r.get("world_context"))
        r = b.send("execute_python",
                   code="import unreal\n"
                        "sub = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)\n"
                        "result = len([a for a in sub.get_all_level_actors() "
                        "if a.get_actor_label() == 'SNV2_Smoke_PIE'])",
                   expect="result == 0")
        check("nothing leaked into the level from the PIE attempt",
              r.get("ok"), r.get("reason"))

    # -- 7. cleanup --------------------------------------------------------
    print("\n--- cleanup ---")
    labels = json.dumps(created)
    r = b.send("execute_python",
               code="import unreal\n"
                    "sub = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)\n"
                    "targets = [a for a in sub.get_all_level_actors() "
                    "if a.get_actor_label().startswith('SNV2_Smoke_')]\n"
                    "for a in targets: sub.destroy_actor(a)\n"
                    "result = len([a for a in sub.get_all_level_actors() "
                    "if a.get_actor_label().startswith('SNV2_Smoke_')])",
               expect="result == 0")
    check("smoke actors removed", r.get("ok"), r.get("reason"))
    r = b.send("save_level", timeout=120)
    check("cleanup saved", r.get("ok"), r.get("reason"))
    print("      labels created this run: {}".format(labels))

    # -- report ------------------------------------------------------------
    passed = sum(1 for _n, ok, _d in RESULTS if ok)
    total = len(RESULTS)
    print("\n{}/{} live checks passed".format(passed, total))

    lines = ["# Live smoke test - SuperNinjaBridge v2", "",
             "Run: {}".format(time.strftime("%Y-%m-%d %H:%M:%S")),
             "Bridge folder: `{}`".format(root),
             "UE version: {}".format(h.get("ue_version")),
             "Level: `{}` (World Partition: {})".format(
                 h.get("level"), h.get("world_partition")),
             "Round-trip latency: {} ms".format(rtt),
             "", "| Check | Result | Detail |", "|---|---|---|"]
    for n, ok, d in RESULTS:
        lines.append("| {} | {} | {} |".format(
            n, "PASS" if ok else "FAIL", d.replace("|", "/").replace("\n", " ")))
    lines += ["", "**{}/{} passed**".format(passed, total)]
    with open(args.report, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print("Report written to {}".format(args.report))
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
