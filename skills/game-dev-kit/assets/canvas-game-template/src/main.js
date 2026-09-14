import { CFG } from "./config.js";
import { AudioSys } from "./core/AudioSys.js";
import { Camera } from "./core/Camera.js";
import { Input } from "./core/Input.js";
import { Particles } from "./core/Particles.js";
import { DemoGame } from "./game/DemoGame.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const input = new Input();
input.attach(window);
const audio = new AudioSys({ headless: false });
const particles = new Particles();
const camera = new Camera();
const game = new DemoGame({ headless: false, audio, particles, input, camera });
window.__game = game;

window.addEventListener("pointerdown", () => audio.resume(), { once: true });
window.addEventListener("keydown", () => audio.resume(), { once: true });

let acc = 0;
let last = performance.now();

function frame(now) {
  const frameDt = Math.min((now - last) / 1000, CFG.dtClamp);
  last = now;
  acc += frameDt;
  let steps = 0;
  while (acc >= CFG.step && steps < CFG.maxCatchUp) {
    game.step(CFG.step);
    acc -= CFG.step;
    steps += 1;
  }
  fitCanvas();
  game.draw(ctx);
  requestAnimationFrame(frame);
}

function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / CFG.width, vh / CFG.height);
  const cssW = Math.floor(CFG.width * scale);
  const cssH = Math.floor(CFG.height * scale);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.width = Math.floor(CFG.width * dpr);
  canvas.height = Math.floor(CFG.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  document.body.style.background = CFG.letterbox;
}

requestAnimationFrame(frame);
