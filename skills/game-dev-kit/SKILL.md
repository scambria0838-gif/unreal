---
name: game-dev-kit
description: Use when the user asks to make, build, or prototype a game, playable demo, or browser game. Covers HTML5 Canvas / vanilla JS (ES modules, Canvas 2D, no build step), scaffolding, game-loop architecture, physics recipes, juice/game-feel, procedural generation, and a mandatory headless+browser verification gauntlet before delivery.
---

# Game Dev Kit

Build complete, playable, verified HTML5 Canvas games. Vanilla JS ES
modules + Canvas 2D. No build step; vite is only a dev server. Never
ship a game you have not run headlessly AND in a real browser.

## Workflow

1. **Scope the core loop first.** One paragraph: input → action →
   feedback → win/lose. Pick the smallest loop that is fun. Define
   states explicitly (e.g. `menu → play → ko → matchover` or
   `deploy → scavenge → extraction → win/lose`) and write them down
   before coding.
2. **Scaffold.** Run `node scripts/new_game.mjs <targetDir> "<Game Title>"`
   from this skill directory. It copies `assets/canvas-game-template/`
   (fixed-timestep loop, Input, Camera, Particles, AudioSys, tests)
   and renames the title. Never overwrite a non-empty directory — the
   script refuses; ask the user.
3. **Implement in modular layers.** `src/config.js` holds EVERY
   tunable number. Entities/components own state; a
   GameLoopManager-style class owns states, collisions, HUD, and the
   world interface passed to entities. Keep every module except
   `main.js` DOM-free so the headless smoke test can import them
   (`headless:true` constructor flag; null-safe `audio?` / `particles?`
   calls).
4. **Tune from proven numbers.** Do not invent physics constants from
   scratch — start from `references/tuning-datasets.md`, which contains
   battle-tested values from two shipped games, and adjust by feel.
5. **Apply juice.** Work through `references/juice-checklist.md`:
   hit-stop, trauma shake, squash-stretch, particle taxonomy, popups,
   procedural WebAudio. Juice is not optional polish; it is half the
   deliverable.
6. **Verify — mandatory, in this order** (full details:
   `references/verification-protocol.md`):
   1. `npm run check` — `node --check` every file.
   2. `npm run smoke` — headless fixed-step sim: NaN-free, bounded
      physics, and a scripted walkthrough that reaches BOTH the win
      and the lose path.
   3. `npm run test:browser` — vite + headless Chromium: zero console
      errors, non-blank canvas pixels, frame-diff liveness,
      screenshots. Inspect the screenshots with your own eyes.
   4. Kill the dev server when done. Never leave node/vite running.
7. **Deliver with:** file tree, `npm install` / `npm run dev`
   instructions, what was verified and how, known limitations. If the
   environment supports it, end with a `http://localhost:7100/`
   preview link per the client preview convention.

## When to read which reference

| Need | Read |
|---|---|
| Fixed timestep, verlet ropes, spring-damper tethers, steering, hit-stop, screen shake | `references/physics-recipes.md` |
| Proven constants (dash timings, camera lead, slow-mo scale, wobble forcing, AI difficulty tiers, threat budgets, drop rates) | `references/tuning-datasets.md` |
| Making it FEEL good: hit-stop, shake, squash-stretch, particles, popups, synth SFX recipes | `references/juice-checklist.md` |
| Map/level generation: cellular automata, connectivity, placement rules, hazards | `references/procedural-generation.md` |
| Pre-delivery verification gauntlet + pitfalls actually hit in production | `references/verification-protocol.md` |

## Hard rules

- All gameplay numbers live in `src/config.js`. No magic numbers in
  entity code.
- Fixed timestep (`CFG.step = 1/60`) with an accumulator for ALL
  simulation; clamp frame dt to `0.1s`; cap catch-up steps at `5`.
- No external assets. Everything drawn with canvas primitives; all
  audio synthesized via WebAudio.
- No runtime errors tolerated. A game that throws once is broken.
- `window.__game = game` in `main.js` — tests and debugging depend
  on it.
- Handle window resize (letterboxed logical resolution +
  `devicePixelRatio` scaling — the template already does this).

## Red flags — stop and fix

| Excuse | Reality |
|---|---|
| "I'll verify in the browser later" | Headless smoke is the gate. Browser is the second gate. Both. |
| "Win path is enough" | Smoke must reach BOTH win and lose. |
| "Magic number is just this once" | It lives in `config.js` or it does not ship. |
| "Leave vite running so they can look" | Kill the server. Never leave node/vite running. |
| "External PNG is faster" | No external assets. Canvas primitives + WebAudio only. |
