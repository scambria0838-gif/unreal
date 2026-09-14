# Physics recipes

All simulation uses a fixed step (`CFG.step = 1/60`) and an
accumulator. Frame dt is clamped to 0.1 s; catch-up is capped at 5
steps. See `references/tuning-datasets.md` for shipped numbers.

## Fixed timestep

```js
acc += Math.min(frameDt, CFG.dtClamp);
let steps = 0;
while (acc >= CFG.step && steps < CFG.maxCatchUp) {
  game.step(CFG.step);
  acc -= CFG.step;
  steps += 1;
}
```

Render may interpolate, but gameplay state only changes inside
`step`. Headless smoke calls `step(CFG.step)` directly.

## Integrators

**Semi-implicit Euler** (top-down runners, SR):

```
v += a * dt
v *= Math.exp(-friction * dt)   // exponential drag, frame-rate safe
speed = min(|v|, maxSpeed)
x += v * dt
```

Accel 2800, maxSpeed 335, friction 7.0. Feels snappy with a readable
coast.

**Verlet** (floppy fighters, WD):

```
n = x + (x - prev) * damping + g * dt * dt
prev = x
x = n
```

Then satisfy distance constraints 4 times per step. 9 points, 26 px
segments, gravity 1500, damping 0.986.

## Spring-damper tethers

```
delta = other - self
dist = |delta|
force = (dist - rest) * k + relVelAlong * d
```

Use for grapples, wobbly weapons, camera-ish springs. Keep `k` and
`d` in `config.js`. Unstable if `k * dt` is large — prefer 4–8
constraint iterations over a huge `k`.

## Steering

Desired velocity = `normalize(target - pos) * maxSpeed`.
Steer = desired - current, clamp to `maxAccel`.

For aim-lead, add `velocity * 0.15` (seconds of travel) to the
follow target. Cap aim lead at 130 px.

## Hit-stop

Set `hitStop = CFG.hit.hitStop` on a confirmed hit. While
`hitStop > 0`, skip movement integration; still tick decay on
trauma and VFX. Do not accumulate leftover dt into a teleport.

## Screen shake

`trauma` is 0..1. Each hit adds a classed amount (0.22 body, 0.5
crit). Decay `trauma -= decay * dt`. Offset:

```
mag = trauma * trauma * shakeMax
cam.x += cos(phase) * mag
cam.y += sin(phase * 1.17) * mag
```

## Dash (SR)

For `dashDuration` (0.2 s) override velocity to a facing * 980 px/s.
i-frames last 0.22 s (longer than the dash). Cooldown 1.2 s. Optional
shockwave radius 130 px on start.

## Slow-mo

On KO: `timeScale = 0.22` for 1.7 s, then ease back. Apply the scale
to the step size passed into gameplay, not to the accumulator — tests
must still be deterministic when `timeScale === 1`.

## Bounds

Every `step` must keep positions finite. If `!Number.isFinite(x)`,
the game is broken — fail the smoke test, do not clamp silently in
production code without logging.
