# Juice checklist

Juice is half the deliverable. Work this list on every game. Skip an
item only if the genre makes it nonsense (document why).

## Hit-stop

- Pause simulation for `CFG.hit.hitStop` (0.05–0.06 s). Below 0.04 s
  is invisible; above 0.08 s feels laggy.
- Do not pause particles or popups — they sell the freeze.
- Stacking hits: refresh, do not add. One freeze at a time.

## Trauma shake

- Add trauma on hit (body 0.22, crit 0.5). Decay 1.8–2.6 /s.
- Offset = `trauma² * shakeMax` in a rotating/noise direction.
- Never exceed ~26 px. The camera must not lose the player.
- Decay trauma even during hit-stop so the tail is short.

## Squash-stretch

- On dash / land / hit: scale X/Y inversely (volume constant).
- Ease back with a spring (`k` high, damping high) — one overshoot
  max.
- Keep squash under 0.25 deviation or it reads as a bug.

## Particle taxonomy

Use a small set of jobs. Do not invent a new emitter per event.

| Job | Look | Life | Count |
|---|---|---|---|
| Impact | radial burst, warm | 0.2–0.4 s | 8–16 |
| Dust | gravity down, cool | 0.4–0.8 s | 4–8 |
| Spark | fast, additive-ish bright | 0.12–0.25 s | 6–12 |
| Pickup | up + fade, accent color | 0.3–0.5 s | 6–10 |
| Death | bigger burst + 1 ring | 0.4–0.7 s | 16–24 |

Pool particles. Cap around 128. Headless path must tolerate
`particles == null`.

## Popups

- Damage / pickup numbers spawn at the event, float up, fade.
- Crits are larger and a different color — two classes, not a
  gradient the player cannot read.
- Lifetime ~0.6 s. Never occlude the player for more than a blink.

## Procedural WebAudio

No sample files. Recipes:

- **Blip / pickup:** short sine or triangle, 880→1320 Hz, 80 ms,
  exponential gain.
- **Hit:** noise burst 40 ms + low square thunk 120 Hz.
- **Dash:** bandpass noise sweep, 80 ms.
- **Death:** descending saw 240→60 Hz, 300 ms, plus noise.
- **UI confirm:** two-note major third, 70 ms each.

Resume the AudioContext on first input. In `headless:true`, AudioSys
is a no-op. Always call `audio?.beep(...)`.

## Camera punctuation

- KO / win: zoom pulse 1.14, ease-back 2.2/s.
- Extraction / overview: zoom-out to 0.76.
- Velocity lead 0.15 s so motion reads ahead of the player.

## Pass / fail

A build fails juice if:

- Hits have no stop and no shake.
- Pickups have no sound and no particles.
- The camera is locked dead-center with no lead.
- Audio throws when the context is missing (headless must be silent,
  not crashing).
