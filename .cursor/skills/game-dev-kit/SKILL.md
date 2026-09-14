---
name: game-dev-kit
description: Use when the user asks to make, build, or prototype a game, playable demo, or browser game. Covers HTML5 Canvas / vanilla JS (ES modules, Canvas 2D, no build step), scaffolding, game-loop architecture, physics recipes, juice/game-feel, procedural generation, and a mandatory headless+browser verification gauntlet before delivery.
---

Copy of `skills/game-dev-kit/SKILL.md`. Intended mirror for
`C:\Users\steve\Desktop\skill\game-dev-kit\` and
`%APPDATA%\kimi-desktop\daimon-share\daimon\skills\game-dev-kit\`.
This Cloud Agent cannot write those Windows paths; the installer
does it on the Editor box (`--copy-skill`).

Read the full skill at `skills/game-dev-kit/SKILL.md`. Scaffold with
`node skills/game-dev-kit/scripts/new_game.mjs <dir> "<Title>"`.
Never ship a game that has not passed `npm run check`, `npm run smoke`
(win AND lose), and `npm run test:browser`.
