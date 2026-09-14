# Live smoke test - SuperNinjaBridge v2

Run: 2026-09-13 23:20:20
Bridge folder: `C:/Users/steve/Projects/SuperNinja/important/ue5_project/NINJA/Saved/SuperNinja`
UE version: 5.8.0-55116800+++UE5+Release-5.8
Level: `/Game/SNV2_Scratch` (World Partition: False)
Round-trip latency: 502 ms

| Check | Result | Detail |
|---|---|---|
| bridge answers | PASS | None |
| bridge identity is v2.1.0 / 14 tools (not the 9-tool zip) | PASS | 2.1.0 |
| world context is Editor (not PIE, not Unknown) | PASS | Editor |
| spawn ok and verified | PASS | None |
| actor count increased | PASS | {'actor_count': 1, 'label_exists': True, 'spawned_actor': {'label': 'SNV2_Smoke_A', 'path': '/Game/SNV2_Scratch.SNV2_Scratch:PersistentLevel.StaticMeshActor_2', 'location': [0.0, 0.0, 300.0], 'rotation': [0.0, 0.0, 0.0], 'scale': [1.0, 1.0, 1.0], 'class': 'StaticMeshActor', 'guid': "<Struct 'Guid' (0x000002BA14FA0250) {}>", 'in_pie_world': False}} |
| spawned path is not a PIE path | PASS | {'actor_count': 1, 'label_exists': True, 'spawned_actor': {'label': 'SNV2_Smoke_A', 'path': '/Game/SNV2_Scratch.SNV2_Scratch:PersistentLevel.StaticMeshActor_2', 'location': [0.0, 0.0, 300.0], 'rotation': [0.0, 0.0, 0.0], 'scale': [1.0, 1.0, 1.0], 'class': 'StaticMeshActor', 'guid': "<Struct 'Guid' (0x000002BA14FA0250) {}>", 'in_pie_world': False}} |
| second spawn refused by default | PASS | actor with label SNV2_Smoke_A already exists. Pass on_duplicate: "replace" to overwrite it or "skip" to leave it alone. |
| on_duplicate=skip returns ok without creating | PASS | actor with label SNV2_Smoke_A already exists, skipped per on_duplicate=skip |
| on_duplicate=replace succeeds | PASS | None |
| manifest boundary enforced on engine content | PASS |  |
| save ok and verified | PASS | None |
| verification method reported | PASS | .umap mtime + dirty set |
| external-actor files were written | SKIP | level is not World Partition - no __ExternalActors__ tree to diff |
| .umap was not used as the evidence | SKIP | level is not World Partition - the .umap is the only save evidence |
| dirty packages listed | PASS | [] |
| actor still present after save | PASS | None |
| spawn refused during PIE | SKIP | --skip-pie was passed; the PIE guard was never exercised |
| world_context reported as PIE | SKIP | --skip-pie was passed; the PIE guard was never exercised |
| refusal message names PIE mode | SKIP | --skip-pie was passed; the PIE guard was never exercised |
| save also refused during PIE | SKIP | --skip-pie was passed; the PIE guard was never exercised |
| context back to Editor after PIE exit | SKIP | --skip-pie was passed; the PIE guard was never exercised |
| nothing leaked into the level from the PIE attempt | SKIP | --skip-pie was passed; the PIE guard was never exercised |
| smoke actors removed | PASS | None |
| cleanup saved | PASS | None |

**16 passed, 0 failed, 8 skipped, of 24**

**NOT VERIFIED** - this run does not certify the bridge.

Flagship checks that never ran:

- `.umap was not used as the evidence`
- `context back to Editor after PIE exit`
- `external-actor files were written`
- `nothing leaked into the level from the PIE attempt`
- `refusal message names PIE mode`
- `save also refused during PIE`
- `spawn refused during PIE`
- `world_context reported as PIE`