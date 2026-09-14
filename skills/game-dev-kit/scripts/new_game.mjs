#!/usr/bin/env node
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = path.join(skillRoot, "assets", "canvas-game-template");

const destArg = process.argv[2];
const title = process.argv[3] || "New Game";

if (!destArg) {
  console.error('Usage: node scripts/new_game.mjs <targetDir> "<Game Title>"');
  process.exit(2);
}

const target = path.resolve(destArg);

if (existsSync(target)) {
  const entries = await readdir(target);
  if (entries.length > 0) {
    console.error(`Refusing to overwrite non-empty directory: ${target}`);
    process.exit(3);
  }
} else {
  await mkdir(target, { recursive: true });
}

await cp(template, target, {
  recursive: true,
  filter: (src) => {
    const base = path.basename(src);
    return base !== "node_modules" && base !== "screenshots" && !base.endsWith(".log");
  },
});

async function replaceIn(file, from, to) {
  const full = path.join(target, file);
  const text = await readFile(full, "utf8");
  await writeFile(full, text.replaceAll(from, to), "utf8");
}

await replaceIn("index.html", "Canvas Game Template", title);
await replaceIn("src/config.js", "Canvas Game Template", title);

const pkgPath = path.join(target, "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
pkg.name = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-game";
await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

console.log(`Scaffolded ${title} → ${target}`);
console.log("Next: cd there, npm install, npm run check && npm run smoke");
