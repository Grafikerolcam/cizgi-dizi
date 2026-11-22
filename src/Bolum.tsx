import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTYAZI_FONT } from "./font";
import { Karakter, basYuksekligi } from "./karakter/Karakter";
import { DUNYA, GeceTonu, Mekan, ayakY, olcek } from "./mekan/Mekan";
import { BolumData, BolumProps, CekimData } from "./types";

export const SON_KART = 2.2; // saniye

// ---------- kamera ----------
const kameraHesapla = (c: CekimData, data: BolumData, ilerleme: number, t: number) => {
  const kam = c.kamera;
  const nokta = (id?: string) => {
    const o = id ? c.oyuncular[id] : undefined;
    const g = id ? data.karakterler[id] : undefined;
    if (!o || !g) return { x: 540, y: 1100 };
    const bas = basYuksekligi(g, o.otur) * olcek(o.derinlik);
    return { x: o.x, y: ayakY(o.derinlik) - bas };
  };
  let s = 1, fx = 540, fy = 960, ekranY = 960;
  const h = nokta(kam.hedef);
  switch (kam.tip) {
    case "genis":
      s = 1.0;
      break;
    case "iki": {
      const h2 = nokta(kam.hedef2);
      const ara = Math.abs(h.x - h2.x);
      s = Math.min(1.6, Math.max(1.05, 860 / (ara + 380)));
      fx = (h.x + h2.x) / 2;
      fy = Math.min(h.y, h2.y) + 260;
      ekranY = 820;
      break;
    }
    case "orta":
      s = 1.55;
      fx = h.x;
      fy = h.y + 300;
      ekranY = 900;
      break;
    case "yakin":
      s = 2.25;
      fx = h.x;
      fy = h.y + 60;
      ekranY = 760;
      break;
    case "cok-yakin":
      s = 3.3;
      fx = h.x;
      fy = h.y - 10;
      ekranY = 820;
      break;
  }
  const hareket = kam.hareket ?? (kam.tip === "genis" ? "sabit" : "it");
  if (hareket === "it") s *= 1 + 0.06 * ilerleme;
  if (hareket === "cek") s *= 1.06 - 0.06 * ilerleme;
  let tx = 540 - fx * s;
  let ty = ekranY - fy * s;
  // dünyanın kenarı görünmesin
  tx = Math.min(0, Math.max(DUNYA.w - DUNYA.w * s, tx));
  ty = Math.min(0, Math.max(DUNYA.h - DUNYA.h * s, ty));
  if (hareket === "titrek" || c.efekt === "sarsinti") {
    const g = c.efekt === "sarsinti" ? Math.max(0, 1 - ilerleme * 4) * 14 : 3;
    tx += Math.sin(t * 23) * g;
    ty += Math.cos(t * 19) * g;
  }
  return { s, tx, ty };
};

// ---------- altyazı ----------
const Altyazi: React.FC<{ metin: string; giris: number }> = ({ metin, giris }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 60,
      top: 1290,
      textAlign: "center",
      fontFamily: ALTYAZI_FONT,
      fontWeight: 700,
      fontSize: 60,
      lineHeight: 1.18,
      color: "#fffaf0",
      WebkitTextStroke: "10px #1d1612",
      paintOrder: "stroke fill",
      textShadow: "0 4px 10px rgba(0,0,0,0.35)",
      opacity: giris,
      transform: `translateY(${(1 - giris) * 12}px)`,
    }}
  >
    {metin}
  </div>
);

// ---------- filigran ----------
const Filigran: React.FC<{ hesap: string }> = ({ hesap }) => (
  <div style={{ position: "absolute", left: 56, top: 120, opacity: 0.55, color: "#f6efe4", fontFamily: ALTYAZI_FONT }}>
    <svg width={150} height={70} viewBox="0 0 150 70" fill="none" stroke="#f6efe4" strokeWidth={4} strokeLinejoin="round">
      <path d="M 8 38 L 36 12 L 64 38 M 16 31 L 16 62 L 56 62 L 56 31" />
      <path d="M 28 62 L 28 46 L 44 46 L 44 62" />
      <path d="M 92 30 C 84 18 70 24 74 36 C 78 46 92 52 92 52 C 92 52 106 46 110 36 C 114 24 100 18 92 30 Z" stroke="#f0a6a0" />
      <path d="M 116 52 L 142 52 M 122 52 L 122 64 M 136 52 L 136 64" />
    </svg>
    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>@{hesap}</div>
  </div>
);

// ---------- tek çekim ----------
const CekimGoruntu: React.FC<{ c: CekimData; data: BolumData }> = ({ c, data }) => {
  const frame = useCurrentFrame(); // Sequence içinde: çekim başından beri
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const genelT = c.bas + t;
  const sure = c.son - c.bas;
  const ilerleme = Math.min(1, t / Math.max(0.1, sure));
  const kam = kameraHesapla(c, data, ilerleme, genelT);

  const konusma = (id: string) => {
    if (id !== c.kim || !c.env) return 0;
    const i = Math.round((t - (c.sesBas ?? 0)) * fps);
    return i >= 0 && i < c.env.length ? c.env[i] : 0;
  };

  // derinliğe göre sırala (arkadakiler önce)
  const sirali = Object.entries(c.oyuncular)
    .filter(([id, o]) => !o.gizli && data.karakterler[id])
    .sort((a, b) => b[1].derinlik - a[1].derinlik);

  const flas = c.efekt === "flas" ? interpolate(t, [0, 0.35], [1, 0], { extrapolateRight: "clamp" }) : 0;
  const karar = c.efekt === "karar" ? interpolate(t, [0, 0.6], [1, 0], { extrapolateRight: "clamp" }) : 0;
  const altyaziGiris = interpolate(t - (c.sesBas ?? 0), [-0.05, 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${kam.tx},${kam.ty}) scale(${kam.s})`}>
          <Mekan mekan={c.mekan} zaman={c.zaman} zengin={c.zengin} />
          {sirali.map(([id, o], i) => (
            <g key={id} transform={`translate(${o.x},${ayakY(o.derinlik)}) scale(${olcek(o.derinlik)})`}>
              <Karakter
                g={data.karakterler[id]}
                duygu={o.duygu}
                poz={o.poz}
                yon={o.yon}
                otur={o.otur}
                t={genelT}
                konusma={konusma(id)}
                tohum={i * 7 + id.length * 3}
              />
            </g>
          ))}
          <GeceTonu zaman={c.zaman} mekan={c.mekan} />
        </g>
        {/* vinyet */}
        <defs>
          <radialGradient id="vinyet" cx="50%" cy="45%" r="75%">
            <stop offset="0.6" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.35} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#vinyet)" />
      </svg>
      {c.soz && <Altyazi metin={c.soz} giris={altyaziGiris} />}
      {c.ses && (
        <Sequence from={Math.round((c.sesBas ?? 0) * fps)} layout="none">
          <Audio src={staticFile(c.ses)} />
        </Sequence>
      )}
      {flas > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flas }} />}
      {karar > 0 && <AbsoluteFill style={{ background: "#000", opacity: karar }} />}
    </AbsoluteFill>
  );
};

// ---------- açılış kancası ve son kart ----------
const Kanca: React.FC<{ metin: string; baslik: string; dizi: string }> = ({ metin, baslik, dizi }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const op = interpolate(t, [0, 0.2, 2.4, 2.8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bolumNo = baslik.split("·")[0].trim();
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 230, textAlign: "center", opacity: op, fontFamily: ALTYAZI_FONT }}>
      <div style={{ display: "inline-block", background: "#c0392b", color: "#fff", fontSize: 34, fontWeight: 700, padding: "8px 26px", borderRadius: 40, marginBottom: 18 }}>{dizi} · {bolumNo}</div>
      <div style={{ fontSize: 64, fontWeight: 700, color: "#fffaf0", WebkitTextStroke: "10px #1d1612", paintOrder: "stroke fill", lineHeight: 1.15 }}>{metin}</div>
    </div>
  );
};

const SonKart: React.FC<{ hesap: string }> = ({ hesap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const op = interpolate(t, [0, 0.35], [0, 1], { extrapolateRight: "clamp" });
  const zil = Math.sin(t * 14) * 14 * Math.max(0, 1 - t / 1.4);
  return (
    <AbsoluteFill style={{ background: `rgba(14,10,8,${0.72 * op})`, justifyContent: "center", alignItems: "center", fontFamily: ALTYAZI_FONT, opacity: op }}>
      <svg width={150} height={150} viewBox="0 0 100 100" style={{ transform: `rotate(${zil}deg)` }}>
        <path d="M 50 12 C 30 12 24 30 24 46 L 24 62 L 14 74 L 86 74 L 76 62 L 76 46 C 76 30 70 12 50 12 Z" fill="#f2c14e" stroke="#1d1612" strokeWidth={4} strokeLinejoin="round" />
        <circle cx={50} cy={82} r={8} fill="#f2c14e" stroke="#1d1612" strokeWidth={4} />
      </svg>
      <div style={{ fontSize: 70, fontWeight: 700, color: "#fffaf0", marginTop: 20, textAlign: "center", lineHeight: 1.15 }}>
        Devamı için
        <br />
        takipte kalın
      </div>
      <div style={{ fontSize: 40, color: "#f0a6a0", marginTop: 26 }}>@{hesap}</div>
    </AbsoluteFill>
  );
};

export const Bolum: React.FC<BolumProps> = ({ data }) => {
  const { fps } = useVideoConfig();
  if (!data) return <AbsoluteFill style={{ background: "#111" }} />;
  const son = data.cekimler[data.cekimler.length - 1];
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {data.cekimler.map((c, i) => {
        const from = Math.round(c.bas * fps);
        const bitis = i === data.cekimler.length - 1 ? Math.round((c.son + SON_KART) * fps) : Math.round(c.son * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, bitis - from)}>
            <CekimGoruntu c={c} data={data} />
          </Sequence>
        );
      })}
      <Filigran hesap={data.hesap} />
      {data.kanca && (
        <Sequence durationInFrames={Math.round(3 * fps)}>
          <Kanca metin={data.kanca} baslik={data.baslik} dizi={data.dizi} />
        </Sequence>
      )}
      <Sequence from={Math.round(son.son * fps)}>
        <SonKart hesap={data.hesap} />
      </Sequence>
      {data.muzik && <Audio src={staticFile(data.muzik)} volume={0.12} loop />}
    </AbsoluteFill>
  );
};
