# Live smoke test - SuperNinjaBridge v2

Run: 2026-09-13 23:52:52
Bridge folder: `C:/Users/steve/Projects/SuperNinja/important/ue5_project/NINJA/Saved/SuperNinja`
UE version: 5.8.0-55116800+++UE5+Release-5.8
Level: `/Game/SNV2_WP` (World Partition: True)
Round-trip latency: 653 ms

| Check | Result | Detail |
|---|---|---|
| bridge answers | PASS | None |
| bridge identity is v2.1.0 / 14 tools (not the 9-tool zip) | PASS | 2.1.0 |
| world context is Editor (not PIE, not Unknown) | PASS | Editor |
| spawn ok and verified | PASS | None |
| actor count increased | PASS | {'actor_count': 143, 'label_exists': True, 'spawned_actor': {'label': 'SNV2_Smoke_A', 'path': '/Game/SNV2_WP.SNV2_WP:PersistentLevel.StaticMeshActor_UAID_A0AD9F33413A750103_1089089479', 'location': [0.0, 0.0, 300.0], 'rotation': [0.0, 0.0, 0.0], 'scale': [1.0, 1.0, 1.0], 'class': 'StaticMeshActor', 'guid': "<Struct 'Guid' (0x0000025D1F751650) {}>", 'in_pie_world': False}} |
| spawned path is not a PIE path | PASS | {'actor_count': 143, 'label_exists': True, 'spawned_actor': {'label': 'SNV2_Smoke_A', 'path': '/Game/SNV2_WP.SNV2_WP:PersistentLevel.StaticMeshActor_UAID_A0AD9F33413A750103_1089089479', 'location': [0.0, 0.0, 300.0], 'rotation': [0.0, 0.0, 0.0], 'scale': [1.0, 1.0, 1.0], 'class': 'StaticMeshActor', 'guid': "<Struct 'Guid' (0x0000025D1F751650) {}>", 'in_pie_world': False}} |
| second spawn refused by default | PASS | actor with label SNV2_Smoke_A already exists. Pass on_duplicate: "replace" to overwrite it or "skip" to leave it alone. |
| on_duplicate=skip returns ok without creating | PASS | actor with label SNV2_Smoke_A already exists, skipped per on_duplicate=skip |
| on_duplicate=replace succeeds | PASS | None |
| manifest boundary enforced on engine content | PASS |  |
| save ok and verified | PASS | None |
| verification method reported | PASS | __ExternalActors__ tree diff |
| external-actor files were written | PASS | {'added': ['6/3Z/Q7L2BF44HUPH2U5TEQZ1N0.uasset'], 'removed': [], 'modified': [], 'count_before': 143, 'count_after': 144} |
| .umap was not used as the evidence | PASS | 1 external actor packages added, 0 modified, 0 removed under C:\Users\steve\Projects\SuperNinja\important\ue5_project\NINJA\Content\__ExternalActors__\SNV2_WP. .umap mtime changed (not used as evidence for World Partition levels). |
| dirty packages listed | PASS | [] |
| actor still present after save | PASS | None |
| editor entered PIE | PASS | pie_state never reported in_play |
| spawn refused during PIE | PASS | editor is in PIE mode, refusing write to prevent contamination. Any actor spawned now lives in the duplicated PIE world and is destroyed when you press Stop. Exit PIE (Esc, or Stop in the toolbar) and re-send this request. To write into the PIE world on purpose for this play session only, pass allow_pie: true. |
| world_context reported as PIE | PASS | PIE |
| refusal message names PIE mode | PASS | editor is in PIE mode, refusing write to prevent contamination. Any actor spawned now lives in the duplicated PIE world and is destroyed when you press Stop. Exit PIE (Esc, or Stop in the toolbar) and re-send this request. To write into the PIE world on purpose for this play session only, pass allow_pie: true. |
| save also refused during PIE | PASS | editor is in PIE mode, refusing write to prevent contamination. Any actor spawned now lives in the duplicated PIE world and is destroyed when you press Stop. Exit PIE (Esc, or Stop in the toolbar) and re-send this request. To write into the PIE world on purpose for this play session only, pass allow_pie: true. |
| editor left PIE | PASS | pie_state still reports in_play |
| context back to Editor after PIE exit | PASS | Editor |
| nothing leaked into the level from the PIE attempt | PASS | None |
| smoke actors removed | PASS | None |
| cleanup saved | PASS | None |

**26 passed, 0 failed, 0 skipped, of 26**

**VERIFIED** - every flagship check ran and passed.