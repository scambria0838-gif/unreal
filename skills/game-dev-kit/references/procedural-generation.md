# Procedural generation

Shipped numbers are from Scrap Runner (SR). See
`references/tuning-datasets.md`.

## Grid

- 56×40 tiles, 64 px each → ~3584×2560 px sector (2–3 screens).
- Tile values: `floor` or `wall`. Keep the grid in one typed array
  or 2D array owned by the generator, not by entities.

## Cellular automata yards

1. Fill each tile as wall with probability **0.44**. Above 0.5 the
   map becomes caves, not yards.
2. Smooth **4** passes:
   - wall if ≥5 wall neighbors (8-neighborhood)
   - floor if ≤3 wall neighbors
3. Result: coherent rooms plus chokepoints.

## Connectivity (non-negotiable)

1. Flood-fill from the spawn tile.
2. Cull every floor tile the fill did not reach (turn to wall, or
   delete loot in that region).
3. If the objective is not reachable, reject the seed and retry.

Unreachable loot is a bug, not a spice.

## Placement rules

| Thing | Rule |
|---|---|
| Spawn | Floor, open neighborhood (4-floor plus) |
| Objective | Floor, reachable, **≥640 px** from spawn |
| Hazard | Floor, reachable, not on spawn or objective |
| Enemy spawn | Floor, reachable, **≥520 px** from the player **at spawn time** |
| Loot | Floor, reachable, not inside a 1-tile alcove |

Validate distances at spawn time, not at design time. A moving player
does not excuse a point-blank first frame.

## Hazards

Place after connectivity. Budget by threat, not by count:

- Start threat 7, grow `+1.15/s * (1 + 0.05*t)`.
- Costs: drone 3, sentry 6, enforcer 14.
- Max alive 34.
- Enforcer beats at 18 s / 50 s / 80 s of a 90 s wave.

Telegraphs are part of the layout: a sentry with no paint line is
an unfair tile.

## Seeds

Store `seed` in `config.js` or a run object. Headless smoke uses a
fixed seed so walkthroughs replay. If a seed fails connectivity
within N retries, fail the generator — do not silently return a
broken map.

## What not to do

- Do not sprinkle entities before the flood-fill.
- Do not use `Math.random()` outside a seeded RNG.
- Do not place the exit adjacent to spawn "to be nice" — the 640 px
  gap is the level.
