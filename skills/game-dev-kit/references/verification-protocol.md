# Verification protocol

Never ship a game you have not run headlessly AND in a real browser.
Order is mandatory. Skipping a step is a failed delivery.

## 1. `npm run check`

`node --check` every `.js` / `.mjs` file in `src/` and `test/`.

Pass: zero syntax errors.
Fail: fix before smoke. A file that does not parse is not a game.

## 2. `npm run smoke`

Headless fixed-step simulation. Import modules with
`headless: true`. No DOM, no AudioContext, no canvas.

Must prove:

1. **NaN-free.** After every step, positions, velocities, and HP are
   `Number.isFinite`.
2. **Bounded.** Entities stay inside
   `[-margin, width+margin] × [-margin, height+margin]` or wrap
   according to config — pick one and assert it.
3. **Win path.** A scripted input tape reaches the win state.
4. **Lose path.** A second tape (fresh instance) reaches the lose
   state.

If only one outcome is reachable, the game is unfinished.

Pitfalls actually hit in production:

- Forgetting `headless: true` and touching `document` in a
  constructor.
- Calling `audio.beep()` without `audio?.beep()`.
- Using `Date.now()` inside `step` — tests cannot replay.
- Win condition on a timer that the lose tape also trips.

## 3. `npm run test:browser`

vite (port **7100**) + headless Chromium (Playwright):

- Zero console errors (warnings may be noted; errors fail).
- Canvas pixels are not a blank clear-color.
- Frame-diff: two captures N frames apart must differ (the game is
  alive).
- Write screenshots. **Look at them.** A green script with a black
  frame is a fail.

If Playwright/Chromium is missing, the step fails. Do not mark
browser verification as passed because smoke passed.

## 4. Kill the server

When the browser step ends — pass or fail — kill vite and any
leftover node. Never leave `node` / `vite` running.

```js
try {
  // run checks
} finally {
  await proc.kill();
}
```

## Deliverable notes

Report, in the handoff:

- commands run and their exit codes
- win/lose paths used
- screenshot paths
- known limitations

If the environment supports it, a `http://localhost:7100/` preview
is extra, not a substitute for the gauntlet.
