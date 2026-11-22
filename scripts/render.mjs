// node scripts/render.mjs <dizi> <bolum> [ekstra remotion argümanları]  →  out/<dizi>-<bolum>.mp4
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [dizi, bolum, ...rest] = process.argv.slice(2);
if (!dizi || !bolum) {
  console.error("kullanım: node scripts/render.mjs <dizi> <bolum>");
  process.exit(1);
}
if (!fs.existsSync(path.join(root, "public", "diziler", dizi, bolum, "data.json"))) {
  console.error(`data.json yok. Önce: npm run seslendir -- ${dizi} ${bolum}`);
  process.exit(1);
}
fs.mkdirSync(path.join(root, "out"), { recursive: true });
const props = path.join(root, "out", `props-${dizi}-${bolum}.json`);
fs.writeFileSync(props, JSON.stringify({ dizi, bolum }));
const cikti = `out/${dizi}-${bolum}.mp4`;
const r = spawnSync("npx", ["remotion", "render", "Bolum", cikti, `--props=${props}`, ...rest], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (r.status === 0) {
  const cap = path.join(root, "public", "diziler", dizi, bolum, "caption.txt");
  fs.copyFileSync(cap, path.join(root, "out", `${dizi}-${bolum}-caption.txt`));
  console.log(`\n→ ${cikti}\n→ out/${dizi}-${bolum}-caption.txt`);
}
process.exit(r.status ?? 1);
