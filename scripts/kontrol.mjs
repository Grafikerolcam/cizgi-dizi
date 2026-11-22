// node scripts/kontrol.mjs <dizi> [bolum]
// Kredi harcamadan dosyaları doğrular, süreyi tahmin eder, karakter vitrini için karakterler.json yazar.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dogrula } from "./dogrula.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [dizi, bolum] = process.argv.slice(2);
if (!dizi) {
  console.error("kullanım: node scripts/kontrol.mjs <dizi> [bolum]");
  process.exit(1);
}
const dir = path.join(root, "diziler", dizi);
const D = JSON.parse(fs.readFileSync(path.join(dir, "dizi.json"), "utf8"));
const bolumler = bolum ? [bolum] : fs.readdirSync(dir).filter((f) => /^bolum-.*\.json$/.test(f)).map((f) => f.replace(/\.json$/, ""));
let hataVar = false;
const d0 = dogrula(D);
if (d0.length) {
  hataVar = true;
  console.log("dizi.json:\n - " + d0.join("\n - "));
}
for (const b of bolumler) {
  const B = JSON.parse(fs.readFileSync(path.join(dir, `${b}.json`), "utf8"));
  const h = dogrula(D, B).filter((x) => !d0.includes(x));
  let harf = 0, sure = 0, replik = 0;
  for (const s of B.sahneler)
    for (const c of s.cekimler) {
      if (c.kim && c.soz) {
        harf += c.soz.length;
        replik++;
        sure += 0.12 + c.soz.length / 12.5 + (c.sure ?? 0.22); // ~12.5 harf/sn (v3, duygulu okuma)
      } else sure += c.sure ?? 1.2;
    }
  console.log(`${b}: ${replik} replik, ~${sure.toFixed(0)} sn, ${harf} harf (ElevenLabs kredisi ≈ ${harf})`);
  if (sure > 175) console.log("  ! ~175 sn'den uzun: son kartla 3 dk Reels sınırını aşar, kısalt");
  if (h.length) {
    hataVar = true;
    console.log(" - " + h.join("\n - "));
  }
}
const out = path.join(root, "public", "diziler", dizi);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "karakterler.json"), JSON.stringify(Object.fromEntries(Object.entries(D.karakterler).map(([id, k]) => [id, { ad: k.ad, gorunum: k.gorunum }])), null, 2));
console.log(hataVar ? "\nHatalar var." : "\nTamam. Vitrin: npm run dev → Vitrin (dizi: " + dizi + ")");
process.exit(hataVar ? 1 : 0);
