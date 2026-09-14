import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 7100;
const url = `http://127.0.0.1:${port}/`;

let vite = null;

function waitForServer(proc, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("vite did not start")), timeoutMs);
    const onData = (buf) => {
      const s = String(buf);
      if (s.includes("Local:") || s.includes(String(port))) {
        clearTimeout(t);
        resolve();
      }
    };
    proc.stdout?.on("data", onData);
    proc.stderr?.on("data", onData);
    proc.on("exit", (code) => {
      clearTimeout(t);
      reject(new Error(`vite exited early: ${code}`));
    });
  });
}

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    throw new Error("Playwright is not installed. Run npm install in the game directory.");
  }

  await mkdir(path.join(root, "test", "screenshots"), { recursive: true });

  vite = spawn("npx", ["vite", "--port", String(port), "--strictPort", "--host", "127.0.0.1"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none" },
  });
  vite.stdout?.pipe(createWriteStream(path.join(root, "test", "vite.stdout.log")));
  vite.stderr?.pipe(createWriteStream(path.join(root, "test", "vite.stderr.log")));
  await waitForServer(vite);

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const shotA = path.join(root, "test", "screenshots", "frame-a.png");
  await page.screenshot({ path: shotA, fullPage: true });

  const alive = await page.evaluate(() => {
    const game = window.__game;
    const canvas = document.getElementById("game");
    if (!game || !canvas) return { ok: false, reason: "missing game or canvas" };
    const ctx = canvas.getContext("2d");
    const sample = ctx.getImageData(0, 0, Math.min(64, canvas.width), Math.min(64, canvas.height)).data;
    let nonempty = 0;
    for (let i = 0; i < sample.length; i += 4) {
      if (sample[i] + sample[i + 1] + sample[i + 2] > 12) nonempty += 1;
    }
    return { ok: nonempty > 8, nonempty, state: game.state };
  });
  if (!alive.ok) throw new Error(`blank canvas: ${JSON.stringify(alive)}`);

  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  const shotB = path.join(root, "test", "screenshots", "frame-b.png");
  await page.screenshot({ path: shotB, fullPage: true });

  const changed = await page.evaluate(() => window.__game && window.__game.state !== "menu");
  if (!changed) throw new Error("frame-diff / input: game did not leave menu");
  if (errors.length) throw new Error(`console errors: ${errors.join(" | ")}`);

  await browser.close();
  console.log("browser-check passed");
  console.log("screenshots:", shotA, shotB);
  console.log("preview", url);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (vite && !vite.killed) {
      vite.kill("SIGTERM");
    }
  });
