// node scripts/seslendir.mjs <dizi> <bolum> [--model eleven_v3|eleven_multilingual_v2] [--yeniden]
// diziler/<dizi>/dizi.json + diziler/<dizi>/<bolum>.json → ElevenLabs ile her repliği seslendirir,
// zamanlamayı ve ağız hareketini çıkarır → public/diziler/<dizi>/<bolum>/data.json (+ sesler/, caption.txt)
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dogrula } from "./dogrula.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.slice(2);
const [dizi, bolum] = arg.filter((a, i) => !a.startsWith("--") && !(arg[i - 1] ?? "").startsWith("--model"));
const bayrak = (b) => arg.includes(b);
const deger = (b, v) => (arg.includes(b) ? arg[arg.indexOf(b) + 1] : v);
if (!dizi || !bolum) {
  console.error("kullanım: node scripts/seslendir.mjs <dizi> <bolum>   (ör. ornek-konak bolum-01)");
  process.exit(1);
}
const MODEL = deger("--model", "eleven_v3");
const FPS = 30;

// .env
for (const f of [path.join(root, ".env")]) {
  if (!fs.existsSync(f)) continue;
  for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error(".env içinde ELEVENLABS_API_KEY yok (bkz. .env.example)");
  process.exit(1);
}

const diziDir = path.join(root, "diziler", dizi);
const D = JSON.parse(fs.readFileSync(path.join(diziDir, "dizi.json"), "utf8"));
const B = JSON.parse(fs.readFileSync(path.join(diziDir, `${bolum}.json`), "utf8"));
const hatalar = dogrula(D, B);
if (hatalar.length) {
  console.error("Bölüm dosyasında hata var:\n - " + hatalar.join("\n - "));
  process.exit(1);
}

const outDir = path.join(root, "public", "diziler", dizi, bolum);
const sesDir = path.join(outDir, "sesler");
const cache = path.join(root, ".cache", "tts");
fs.mkdirSync(sesDir, { recursive: true });
fs.mkdirSync(cache, { recursive: true });

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "buffer", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error("ffmpeg: " + r.stderr.toString());
  return r.stdout;
};
const sureOl = (f) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" });
  return parseFloat(r.stdout);
};

// duygu → ElevenLabs v3 ses etiketi
const TON = {
  aglama: "[crying]",
  korku: "[scared]",
  kizgin: "[angry]",
  saskin: "[surprised]",
  uzgun: "[sad]",
  mutlu: "[happy]",
  sersem: "[tired]",
  supheli: "[suspicious]",
  utangac: "[shy]",
};

const tts = async (metin, ses, model) => {
  const kararlilik = ses.stabilite ?? 0.5;
  const body = {
    text: metin,
    model_id: model,
    language_code: "tr",
    voice_settings: model === "eleven_v3" ? { stability: [0, 0.5, 1].reduce((a, b) => (Math.abs(b - kararlilik) < Math.abs(a - kararlilik) ? b : a)) } : { stability: kararlilik, similarity_boost: 0.8, style: 0.35 },
  };
  const h = crypto.createHash("sha1").update(JSON.stringify({ body, id: ses.id })).digest("hex").slice(0, 16);
  const f = path.join(cache, `${h}.mp3`);
  if (fs.existsSync(f) && !bayrak("--yeniden")) return f;
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ses.id}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  return f;
};

// ağız zarfı: kare başına RMS → 0..1
const zarf = (f) => {
  const pcm = ff(["-i", f, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"]);
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 4);
  const adim = 16000 / FPS;
  const e = [];
  for (let i = 0; i + adim <= x.length; i += adim) {
    let s = 0;
    for (let j = 0; j < adim; j++) s += x[i + j] * x[i + j];
    e.push(Math.sqrt(s / adim));
  }
  const sirali = [...e].sort((a, b) => a - b);
  const tepe = sirali[Math.floor(sirali.length * 0.95)] || 1;
  // hece hissi: hızlı aç, biraz yavaş kapa; sessizlikte tam kapalı
  let onceki = 0;
  return e.map((v) => {
    let n = Math.min(1, v / tepe);
    n = n < 0.12 ? 0 : (n - 0.12) / 0.88;
    onceki = n > onceki ? n : onceki * 0.55 + n * 0.45;
    return Math.round(onceki * 100) / 100;
  });
};

const karakterler = D.karakterler;
const cekimler = [];
let t = 0;
let sesNo = 0;
let toplamKarakter = 0;

for (const [si, sahne] of B.sahneler.entries()) {
  // sahne başı durum
  const durum = {};
  for (const [id, o] of Object.entries(sahne.oyuncular)) {
    durum[id] = { duygu: "normal", poz: "ayakta", yon: o.x < 540 ? "sag" : "sol", derinlik: 0, otur: false, gizli: false, ...o };
  }
  for (const c of sahne.cekimler) {
    for (const [id, o] of Object.entries(c.oyuncular ?? {})) durum[id] = { ...(durum[id] ?? { x: 540, duygu: "normal", poz: "ayakta", yon: "sag", derinlik: 0, otur: false, gizli: false }), ...o };
    if (c.kim && durum[c.kim]) {
      if (c.duygu) durum[c.kim].duygu = c.duygu;
      if (c.poz) durum[c.kim].poz = c.poz;
    }
    const kamera = c.kamera ?? (c.kim ? { tip: "orta", hedef: c.kim } : { tip: "genis" });
    const kayit = {
      bas: t,
      son: t,
      mekan: sahne.mekan,
      zaman: sahne.zaman ?? "gunduz",
      zengin: !!sahne.zengin,
      oyuncular: structuredClone(durum),
      kamera,
      efekt: c.efekt,
      sahneNo: si,
    };
    if (c.kim && c.soz) {
      const k = karakterler[c.kim];
      const duygu = durum[c.kim]?.duygu ?? "normal";
      const ton = c.ton ?? TON[duygu] ?? "";
      let ham;
      try {
        ham = await tts(MODEL === "eleven_v3" && ton ? `${ton} ${c.soz}` : c.soz, k.ses, MODEL);
      } catch (e) {
        if (MODEL !== "eleven_v3") throw e;
        console.warn(`  v3 olmadı (${e.message.slice(0, 80)}), eleven_multilingual_v2 deneniyor`);
        ham = await tts(c.soz, k.ses, "eleven_multilingual_v2");
      }
      toplamKarakter += c.soz.length;
      const ad = `${String(++sesNo).padStart(2, "0")}-${c.kim}.mp3`;
      const hedef = path.join(sesDir, ad);
      const perde = k.ses.perde ?? 0;
      const hiz = k.ses.hiz ?? 1;
      const filtre = [
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03",
        "areverse",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08",
        "areverse",
        perde || hiz !== 1 ? `rubberband=pitch=${Math.pow(2, perde / 12).toFixed(4)}:tempo=${hiz}` : null,
        "loudnorm=I=-16:TP=-1.5:LRA=11",
      ]
        .filter(Boolean)
        .join(",");
      ff(["-i", ham, "-af", filtre, "-ar", "44100", "-ac", "1", "-b:a", "128k", hedef]);
      const sure = sureOl(hedef);
      const sesBas = 0.12;
      kayit.kim = c.kim;
      kayit.soz = c.soz;
      kayit.ses = `diziler/${dizi}/${bolum}/sesler/${ad}`;
      kayit.sesBas = sesBas;
      kayit.env = zarf(hedef);
      kayit.son = t + sesBas + sure + (c.sure ?? 0.22);
      console.log(`  ${ad.padEnd(18)} ${sure.toFixed(2)} sn  ${c.soz}`);
    } else {
      if (c.soz) kayit.soz = c.soz; // konuşmasız yazı (ör. iç ses / anlatım kartı)
      kayit.son = t + (c.sure ?? 1.2);
    }
    t = kayit.son;
    cekimler.push(kayit);
  }
}

const data = {
  fps: FPS,
  sure: t,
  dizi: D.ad,
  hesap: D.hesap.replace(/^@/, ""),
  baslik: B.baslik,
  kanca: B.kanca,
  karakterler: Object.fromEntries(Object.entries(karakterler).map(([id, k]) => [id, k.gorunum])),
  cekimler,
  muzik: B.muzik,
};
fs.writeFileSync(path.join(outDir, "data.json"), JSON.stringify(data));
fs.writeFileSync(
  path.join(root, "public", "diziler", dizi, "karakterler.json"),
  JSON.stringify(Object.fromEntries(Object.entries(karakterler).map(([id, k]) => [id, { ad: k.ad, gorunum: k.gorunum }])), null, 2),
);

const caption = [
  `${D.ad} · ${B.baslik} ✏️`,
  "",
  B.aciklama,
  "",
  `${B.soru} Yorumlara yazın 👇`,
  "",
  "Devamı için takipte kalın 🔔",
  "",
  B.etiketler.map((e) => "#" + e.replace(/^#/, "")).join(" "),
].join("\n");
fs.writeFileSync(path.join(outDir, "caption.txt"), caption);

console.log(`\n${cekimler.length} çekim, ${t.toFixed(1)} sn (+ son kart), ${toplamKarakter} karakter seslendirildi`);
console.log(`→ public/diziler/${dizi}/${bolum}/data.json\n→ caption: public/diziler/${dizi}/${bolum}/caption.txt`);
console.log(`Sonra: npm run render -- ${dizi} ${bolum}`);
