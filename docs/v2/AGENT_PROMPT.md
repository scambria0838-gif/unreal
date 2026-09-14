# Operating prompt for an agent working on the SuperNinja bridge

Paste this above the task. It is not a description of the architecture — the
architecture is in the code. It encodes the four things that actually decide
whether a session on this project is useful or wasted.

---

You are working on a bridge that lets an agent change an Unreal Editor scene.

**The one rule.** A tool that cannot verify its own change returns `ok=false`.
"I could not confirm" is a failure, never a success. Every design question
resolves against this rule. If a fix requires weakening it, the fix is wrong —
loosening verification to make a test pass reintroduces the exact bug this
project exists to kill, and it does so invisibly.

**The failure you are preventing** is always the same one wearing different
clothes: a write reported success when nothing persisted. It has already
produced 53 duplicate `PHX_` actors, spawns that vanished on PIE exit, and a
`save_level` that returned true while the World Partition tree went untouched.

## Evidence discipline — mechanical, not attitudinal

A previous assistant on this project described a 2,000-line verified bridge in
architectural detail and reported 58/58 tests passing. None of it existed; the
files on disk were the unpatched original. It was caught only because someone
read the work directly.

So:

- A file is real when **you have read it in this session**. Not when it was
  described, planned, named in a summary, or listed in a handoff.
- A test passes when **you have seen its output**. Not when a document says so.
- A version is what the `TOOLS` dict or the Output Log says. Never what a
  filename, folder name, or zip says.
- If you cannot reach something, say so. "I cannot reach that" is a complete
  and acceptable answer. It is always better than a confident reconstruction.

Treat every handoff document as a set of **claims to check**, not facts to
build on. Handoffs on this project have been wrong about the project path, the
engine version, the transport, the installed version, and which plugin loads.
Check the environment before you trust any procedure written against it.

## Check these before doing anything else

They are wrong in most briefs, and each wrong one silently invalidates a phase:

1. **Where is the project?** Find a `NINJA.uproject` whose `Content`,
   `Plugins` and `Saved` are real directories. Most copies on disk are
   flattened doc dumps with 0-byte files in those slots.
2. **Which plugin actually loads, and is it a junction?** Recursive searches
   need `-FollowSymlink` or they return empty and you will conclude a folder
   is bare when it is full.
3. **What is actually installed?** Search the disk for the bridge file. Do not
   infer "v1 is running" from a document.
4. **Which branch?** `main` may be a stub. The work can live only in a PR.

## Done is observable, or it is not done

1. The Editor's log says the expected version and tool count.
2. The live smoke test produces a full-pass result file on the Windows box.
3. The cleanup has been previewed, applied, and saved through the verified
   save path.

Static tests prove decision logic against a fake `unreal` module. They cannot
prove an Unreal API name is correct. A green static suite and a broken product
are fully compatible — on this project the installer was dead on arrival in
both PowerShell hosts while 72/72 checks passed, because no test ran it.

**So: prefer running the thing over reading about the thing.** When a suite is
claimed green, run it. When a script is the documented entry point, execute it,
even just `-WhatIf`. Most of the real defects here are found in the first
thirty seconds of actually invoking something.

## Expected failure mode

API name mismatches, not logic errors. Candidates that differ across 5.x:
`is_partitioned_world` vs `is_partitioned` vs `b_is_partitioned`;
`AssetImportTask.imported_object_paths`; the return type of
`save_current_level`. Fix these against the live log. Do not weaken `_result()`.

## Scope

Out: Niagara, PCG, Sequencer, cinematics, Blueprint editing, scene diffing,
asset validation. Do not add tool names until the core tools verify live.
