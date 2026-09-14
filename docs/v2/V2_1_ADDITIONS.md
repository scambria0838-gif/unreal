# v2.1 additions (static-only / unverified-until-live)

Built against the real v2 envelope in `superninja_bridge_v2.py` after
reading it from Drive. None of this has run inside a live Editor.

## Envelope proof

`_result(ok, verified, ...)` still does:

```python
if not verified:
    ok = False
```

`tests/test_envelope_and_poller.py` calls `_result(True, False, ...)` and
asserts `ok is False`. The offline harness also loops every registered
tool and asserts the same invariant.

## First-class tools

| Tool | Verify |
|---|---|
| `find_actors` | world resolved; returns matched summaries |
| `destroy_actor` | actor gone and count decreased |
| `set_actor_transform` | location/rotation/scale read back |
| `set_viewport_camera` | camera location read back |
| `save_level_as` | dest `.umap` exists after save |

## Poller

`tools/sn_unreal_nonblocking_phase2.py`

- `cloud-poll` → inbox/outbox
- `local-8765` → hard reject off Windows / when 8765 is down
- `MAX_QUEUE_SIZE = 32`
- `RESULT_TTL = 300`
- every stored result has `result_ts`

## Still not in the running Editor

Until you copy these files onto the Windows project, the live Editor
does not have `on_duplicate`, `verified`, PIE refusal, WP save diffs, or
the v2.1 tools. That is unchanged.
