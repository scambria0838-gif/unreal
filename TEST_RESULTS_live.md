# Live smoke test - SuperNinjaBridge v2

Run: 2026-09-13 23:27:35
Bridge folder: `C:/Users/steve/Projects/SuperNinja/important/ue5_project/NINJA/Saved/SuperNinja`
UE version: 5.8.0-55116800+++UE5+Release-5.8
Level: `/Game/SNV2_WP` (World Partition: True)
Round-trip latency: 803 ms

| Check | Result | Detail |
|---|---|---|
| bridge answers | PASS | None |
| bridge identity is v2.1.0 / 14 tools (not the 9-tool zip) | PASS | 2.1.0 |
| world context is Editor (not PIE, not Unknown) | PASS | Editor |
| spawn ok and verified | PASS | None |
| actor count increased | PASS | {'actor_count': 143, 'label_exists': True, 'spawned_actor': {'label': 'SNV2_Smoke_A', 'path': '/Game/SNV2_WP.SNV2_WP:PersistentLevel.StaticMeshActor_UAID_A0AD9F33413A730103_1727017133', 'location': [0.0, 0.0, 300.0], 'rotation': [0.0, 0.0, 0.0], 'scale': [1.0, 1.0, 1.0], 'class': 'StaticMeshActor', 'guid': "<Struct 'Guid' (0x00000224B796A750) {}>", 'in_pie_world': False}} |
| spawned path is not a PIE path | PASS | {'actor_count': 143, 'label_exists': True, 'spawned_actor': {'label': 'SNV2_Smoke_A', 'path': '/Game/SNV2_WP.SNV2_WP:PersistentLevel.StaticMeshActor_UAID_A0AD9F33413A730103_1727017133', 'location': [0.0, 0.0, 300.0], 'rotation': [0.0, 0.0, 0.0], 'scale': [1.0, 1.0, 1.0], 'class': 'StaticMeshActor', 'guid': "<Struct 'Guid' (0x00000224B796A750) {}>", 'in_pie_world': False}} |
| second spawn refused by default | PASS | actor with label SNV2_Smoke_A already exists. Pass on_duplicate: "replace" to overwrite it or "skip" to leave it alone. |
| on_duplicate=skip returns ok without creating | PASS | actor with label SNV2_Smoke_A already exists, skipped per on_duplicate=skip |
| on_duplicate=replace succeeds | PASS | None |
| manifest boundary enforced on engine content | PASS |  |
| save ok and verified | PASS | None |
| verification method reported | PASS | __ExternalActors__ tree diff |
| external-actor files were written | PASS | {'added': ['1/4Y/Q7NY272FPB99Q850ZZA9OT.uasset'], 'removed': [], 'modified': [], 'count_before': 143, 'count_after': 144} |
| .umap was not used as the evidence | PASS | 1 external actor packages added, 0 modified, 0 removed under C:\Users\steve\Projects\SuperNinja\important\ue5_project\NINJA\Content\__ExternalActors__\SNV2_WP. .umap mtime changed (not used as evidence for World Partition levels). |
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

**18 passed, 0 failed, 6 skipped, of 24**

**NOT VERIFIED** - this run does not certify the bridge.

Flagship checks that never ran:

- `context back to Editor after PIE exit`
- `nothing leaked into the level from the PIE attempt`
- `refusal message names PIE mode`
- `save also refused during PIE`
- `spawn refused during PIE`
- `world_context reported as PIE`