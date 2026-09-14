import { CFG } from "../src/config.js";
import { Input } from "../src/core/Input.js";
import { Camera } from "../src/core/Camera.js";
import { Particles } from "../src/core/Particles.js";
import { AudioSys } from "../src/core/AudioSys.js";
import { DemoGame } from "../src/game/DemoGame.js";

function makeGame() {
  const input = new Input();
  const game = new DemoGame({
    headless: true,
    audio: new AudioSys({ headless: true }),
    particles: new Particles(),
    input,
    camera: new Camera(),
  });
  return { game, input };
}

function runTape(label, chooseKeys, pred, maxSteps = 60 * 20) {
  const { game, input } = makeGame();
  input.inject(["start"]);
  game.step(CFG.step);
  input.clearInjected();
  for (let i = 0; i < maxSteps; i += 1) {
    input.inject(chooseKeys(game, i));
    game.step(CFG.step);
    game.assertSane();
    if (pred(game)) {
      console.log(`${label}: reached in ${i + 1} steps → ${game.state}`);
      return game;
    }
  }
  throw new Error(`${label}: did not finish (state=${game.state} collected=${game.collected})`);
}

function seekKeys(game, target) {
  const keys = [];
  const p = game.player;
  const hx = game.hazard.x - p.x;
  const hy = game.hazard.y - p.y;
  const hd = Math.hypot(hx, hy);
  let dx = target.x - p.x;
  let dy = target.y - p.y;
  if (hd < 140 && hd > 0.001) {
    dx -= (hx / hd) * 320;
    dy -= (hy / hd) * 320;
  }
  if (dx > 6) keys.push("right");
  if (dx < -6) keys.push("left");
  if (dy > 6) keys.push("down");
  if (dy < -6) keys.push("up");
  return keys;
}

runTape(
  "win",
  (game) => {
    const next = game.tokens.find((t) => !t.taken);
    if (!next) return [];
    return seekKeys(game, next);
  },
  (game) => game.state === "win" && game.outcome === "win",
);

runTape(
  "lose",
  (game) => {
    const p = game.player;
    const keys = [];
    const dx = game.hazard.x - p.x;
    const dy = game.hazard.y - p.y;
    if (dx > 2) keys.push("right");
    if (dx < -2) keys.push("left");
    if (dy > 2) keys.push("down");
    if (dy < -2) keys.push("up");
    return keys;
  },
  (game) => game.state === "lose" && game.outcome === "lose",
);

console.log("smoke passed: NaN-free, bounded, win and lose reachable");
