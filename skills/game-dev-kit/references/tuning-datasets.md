# Tuning Datasets — Proven Constants

Every value below shipped in a playtested game. Start from these;
adjust by feel. Each line carries its rationale.

Two sources:

- **SR** = "Scrap Runner: District 9" (top-down roguelite scavenger)
- **WD** = "Wobble Duel" (verlet floppy fighter)

## Core loop & timestep

| Constant | Value | Source | Why |
|---|---|---|---|
| Fixed step | 1/60 s | both | Deterministic sim; headless tests replay exactly |
| Frame dt clamp | 0.1 s | both | Tab-back doesn't teleport entities |
| Max catch-up steps | 5 / frame | both | Spiral-of-death guard on slow machines |

## Player movement & dash (SR)

| Constant | Value | Why |
|---|---|---|
| Accel / maxSpeed / friction | 2800 px/s², 335 px/s, 7.0 (exp rate) | Snappy but drifty; momentum is readable |
| Dash duration / cooldown | 0.2 s / 1.2 s | Long enough to dodge through a burst, short enough to stay precise |
| Dash speed | 980 px/s (~3× run) | Reads as a blink, covers ~2 tiles |
| Dash i-frames | 0.22 s (~13 frames) | Slightly longer than the dash so the tail is safe |
| Dash shockwave radius | 130 px | Deflects projectiles in a readable bubble |
| Carry-mass inertia penalty | 1 + ratio·0.5 | Full hold = 1.5× sluggish — felt, not crippling |

## Camera (SR top-down / WD fixed frame)

| Constant | Value | Why |
|---|---|---|
| Follow stiffness | 6.5 (exp lerp rate) | Settles in ~0.5 s without rubber-banding |
| Velocity lead | 0.15 s of velocity | Reveals where you're heading |
| Aim lead max | 130 px toward cursor | Aiming reveals threats without motion sickness |
| Trauma decay | 1.8–2.6 /s | Shake lasts ~0.5 s |
| Shake max offset | 16–26 px at trauma 1 | Strong but never loses the player |
| KO zoom pulse | 1.14, ease-back rate 2.2/s | Punctuates the moment |
| Extraction zoom-out | 0.76 | Battlefield awareness during defense waves |

## Hit feedback (both)

| Constant | Value | Why |
|---|---|---|
| Hit-stop | 0.05 s (SR) / 0.06 s (WD) | Below 0.04 s is invisible; above 0.08 s feels laggy |
| Post-hit mercy i-frames | 0.35 s | Prevents hazard/melee melt without invulnerability runs |
| KO slow-mo scale | 0.22 for 1.7 s | Dramatic, ends before it drags |
| Body-hit shake / crit shake | 0.22 / 0.5 trauma | Two clearly distinguishable impact classes |

## Wobble body physics (WD)

| Constant | Value | Why |
|---|---|---|
| Verlet points / seg length | 9 / 26 px | Tall enough to wobble, cheap to constrain |
| Gravity / damping | 1500 px/s² / 0.986 | Falls fast, settles slowly — "gelatinous" |
| Constraint iterations | 4 | Stiff enough to stand, soft enough to flop |
| Muscle K (alive / stunned / KO) | 0.16 / 0.03 / 0 | Per-step fraction of angle error corrected |
| Travelling wave amp | 0.16 rad, freq 2.6, phase lag 0.55/segment | The "always alive" ripple |
| Sway layers (amp/freq) | 0.42@1.7, 0.20@2.9, 0.10@5.3 | Irrational-ish ratios = never repeats; layer 3 is cheap pseudo-noise |
| Lean max / rate | 0.5 rad / 3.5 s⁻¹ | Player control fights the wobble, doesn't override it |

## Projectiles & pressure economy (WD)

| Constant | Value | Why |
|---|---|---|
| Power / gravity | 640 px/s / 950 px/s² | A satisfying ~45° arc across a 960px arena |
| Cooldown / pressure cost / regen | 0.55 s, 30/100, 24/s | Spam guard: ~3 shots then must pause ~1.2 s |
| Recoil | 260 (applied to own rope) | Firing disrupts your own aim — self-balancing |
| Crit radius | 20 px at the tip | Risky precision shots pay 2× damage |
| Damage body / crit | 11 / 22 (100 HP) | ~9 body hits or ~5 crits per round |

## AI difficulty tiers (WD)

| Tier | errThresh (px) | reaction (s) | jitter | dodge | move |
|---|---|---|---|---|---|
| easy | 72 | 0.55 | 0.6 | 0.25 | 0.4 |
| normal | 44 | 0.32 | 0.35 | 0.6 | 0.7 |
| hard | 27 | 0.18 | 0.18 | 0.9 | 1.0 |

Pattern: AI simulates its own ballistic trajectory each frame (60 steps
of dt=1/30), leads the target by ~0.6× travel time using estimated
target velocity, and fires when closest approach <
`errThresh · (0.85 + rng·0.3)`. Difficulty scales accuracy + reaction
+ dodge chance — never unfair speed.

## Enemies & waves (SR)

| Constant | Value | Why |
|---|---|---|
| Drone HP / speed / dmg | 30 / 240 px/s / 8 | Two bolts to kill; dangerous in packs only |
| Drone attack range / cooldown | 26 px / 1.0 s | Point-blank commitment, punishable |
| Sentry HP / range / telegraph | 85 / 560 px / 1.5 s | The laser paint IS the warning; frontal armor 0.15×, rear vent 2.0× |
| Sentry burst | 3 rounds, 0.09 s gap, 900 px/s | Dodgeable by dash if you move on the flash |
| Enforcer HP / charge speed | 340 / 900 px/s | Miniboss: telegraph 0.8 s, wall-stun 2.0 s at 2× damage taken |
| Threat budget start | 7, +1.15/s · (1+0.05·t) | Smoothly escalating pressure |
| Enemy costs | drone 3, sentry 6, enforcer 14 | A Rig eats half a mid-wave budget |
| Enforcer timestamps | 18 s / 50 s / 80 s into a 90 s wave | Three escalation beats |
| Spawn min distance | 520 px | Never point-blank; validate at SPAWN time |
| Max alive | 34 | Perf + readability cap |

## Economy & drops (SR)

| Constant | Value | Why |
|---|---|---|
| Scrap tiers common/alloy/core | 70% / 25% / 5% | Rarity curve: cores stay exciting |
| Carry mass per tier | 1 / 3 / 8 | Greed vs. inertia tradeoff |
| Inventory capacity | 60 mass | ~2 core runs or a pocketful of commons per trip |
| Mod costs | 6–14 common + 2–6 alloy (+1 core) | One deposit ≈ one upgrade |
| Min spawn↔objective distance | 640 px (40 units) | Forced traversal through the hazard field |

## Procedural generation (SR)

| Constant | Value | Why |
|---|---|---|
| Grid / tile | 56×40 tiles, 64 px | ~3.5k×2.5k px sector, 2–3 screens per yard |
| CA initial wall fill | 0.44 | Above 0.5 → caves, not yards |
| CA smoothing passes | 4 (wall if ≥5 neighbors, floor if ≤3) | Coherent rooms + chokepoints |
| Connectivity | flood-fill from spawn, cull unreached | No unreachable loot, ever |
