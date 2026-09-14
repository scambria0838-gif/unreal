import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function walk(dir, out = []) {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const st = await stat(full);
    if (st.isDirectory()) {
      if (name === "node_modules") continue;
      await walk(full, out);
    } else if (name.endsWith(".js") || name.endsWith(".mjs")) {
      out.push(full);
    }
  }
  return out;
}

const files = [
  ...(await walk(path.join(root, "src"))),
  ...(await walk(path.join(root, "test"))),
];

let failed = 0;
for (const file of files) {
  const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (r.status !== 0) {
    failed += 1;
    process.stderr.write(r.stderr || r.stdout || `check failed: ${file}\n`);
  } else {
    console.log("ok", path.relative(root, file));
  }
}

if (failed) {
  console.error(`check failed: ${failed} file(s)`);
  process.exit(1);
}
console.log(`check passed: ${files.length} files`);
