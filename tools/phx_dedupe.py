"""
PHX_ duplicate cleanup — Phase 4.

The NINJA level accumulated 53+ duplicate PHX_* actors from failed rebuild
loops. This script groups level actors by label prefix, keeps one instance per
unique label, and destroys the rest.

DRY RUN BY DEFAULT. It prints the full plan and changes nothing until you pass
apply=True (ue-project-wide-dry-run: a sweep that can destroy dozens of actors
gets previewed before it runs).

Run it inside the Unreal Editor — Output Log, Python tab:

    exec(open(r"C:\\path\\to\\tools\\phx_dedupe.py").read())            # preview
    exec(open(r"C:\\path\\to\\tools\\phx_dedupe.py").read()); run(apply=True)

Or drive it through the v2 bridge inbox as an execute_python request.

"Earliest-spawned" is resolved as: the actor whose label has no numeric
duplicate suffix wins; otherwise the lowest suffix wins; ties break on the
shortest path name. Unreal does not expose a creation timestamp, so this is a
deterministic stand-in and it is stated rather than implied.
"""

import re
import unreal

PREFIX = "PHX_"
SUFFIX_RE = re.compile(r"^(?P<base>.*?)(?:[_\s-]?(?P<num>\d+))?$")


def _subsystem():
    return unreal.get_editor_subsystem(unreal.EditorActorSubsystem)


def _world_context():
    try:
        ues = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem)
        if ues.get_game_world():
            return "PIE"
        w = ues.get_editor_world()
        return "PIE" if w and "UEDPIE_" in w.get_path_name() else "Editor"
    except Exception:
        return "Unknown"


def _rank(actor):
    """Lower is better — this instance is the keeper."""
    label = actor.get_actor_label()
    m = SUFFIX_RE.match(label)
    num = int(m.group("num")) if m and m.group("num") else -1
    try:
        path_len = len(actor.get_path_name())
    except Exception:
        path_len = 0
    return (num, path_len, label)


def _base_label(label):
    m = SUFFIX_RE.match(label)
    return m.group("base").rstrip("_- ") if m else label


def run(apply=False, prefix=PREFIX, save=False):
    context = _world_context()
    if context != "Editor":
        unreal.log_error(
            "[phx_dedupe] world context is {} — refusing to run. Exit PIE and "
            "retry.".format(context))
        return {"ok": False, "reason": "world context {}".format(context)}

    sub = _subsystem()
    actors = list(sub.get_all_level_actors())
    targets = [a for a in actors if a.get_actor_label().startswith(prefix)]

    groups = {}
    for a in targets:
        groups.setdefault(_base_label(a.get_actor_label()), []).append(a)

    keep, destroy = [], []
    for base, members in sorted(groups.items()):
        members.sort(key=_rank)
        keep.append(members[0])
        destroy.extend(members[1:])

    unreal.log("[phx_dedupe] level actors: {}".format(len(actors)))
    unreal.log("[phx_dedupe] {}* actors: {}".format(prefix, len(targets)))
    unreal.log("[phx_dedupe] unique labels: {}".format(len(groups)))
    unreal.log("[phx_dedupe] would destroy: {}".format(len(destroy)))
    for base, members in sorted(groups.items()):
        if len(members) > 1:
            unreal.log("  {:<40} {} copies -> keep {}".format(
                base, len(members), members[0].get_actor_label()))

    if not apply:
        unreal.log_warning(
            "[phx_dedupe] DRY RUN — nothing destroyed. Re-run with "
            "run(apply=True) to execute.")
        return {"ok": True, "dry_run": True, "actors_total": len(actors),
                "prefix_actors": len(targets), "unique_labels": len(groups),
                "would_destroy": len(destroy),
                "would_destroy_labels": [a.get_actor_label() for a in destroy]}

    destroyed_labels = [a.get_actor_label() for a in destroy]
    with unreal.ScopedEditorTransaction("SuperNinja PHX dedupe"):
        for a in destroy:
            sub.destroy_actor(a)

    # verify
    remaining = [a for a in sub.get_all_level_actors()
                 if a.get_actor_label().startswith(prefix)]
    ok = len(remaining) == len(groups)
    unreal.log("[phx_dedupe] destroyed {} — {}* actors now {} (expected {})"
               .format(len(destroy), prefix, len(remaining), len(groups)))
    if not ok:
        unreal.log_error("[phx_dedupe] count mismatch — inspect before saving")

    result = {"ok": ok, "dry_run": False, "destroyed": len(destroy),
              "destroyed_labels": destroyed_labels,
              "remaining": len(remaining), "unique_labels": len(groups),
              "message": "Removed {} duplicate actors, kept {} unique actors."
                         .format(len(destroy), len(remaining))}
    unreal.log("[phx_dedupe] {}".format(result["message"]))

    if save and ok:
        unreal.log("[phx_dedupe] saving through the v2 bridge so the save is "
                   "verified against __ExternalActors__ ...")
        import json
        import superninja_bridge_v2 as sb
        save_res = json.loads(sb.SuperNinjaBridge().execute_tool(
            "save_level", json.dumps({"expect_removed": len(destroy)})))
        result["save"] = save_res
        unreal.log("[phx_dedupe] save verified={} reason={}".format(
            save_res.get("verified"), save_res.get("reason")))
    else:
        unreal.log_warning(
            "[phx_dedupe] NOT saved. Call run(apply=True, save=True), or send a "
            "save_level request with expect_removed={} through the bridge."
            .format(len(destroy)))
    return result


# Preview on exec.
_PREVIEW = run(apply=False)
