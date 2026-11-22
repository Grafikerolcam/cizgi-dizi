// Karakter vitrini: dizinin tüm karakterlerini salonda yan yana gösterir, duyguları sırayla değiştirir.
// Yeni karakter tasarlarken Remotion Studio'da ("npm run dev" → Vitrin) bakmak için.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTYAZI_FONT } from "./font";
import { Karakter } from "./karakter/Karakter";
import { Mekan, ayakY, olcek } from "./mekan/Mekan";
import { Duygu, Gorunum, Poz } from "./types";

const DUYGULAR: Duygu[] = ["normal", "mutlu", "uzgun", "aglama", "korku", "kizgin", "saskin", "sersem", "supheli", "utangac"];
const POZLAR: Poz[] = ["ayakta", "basini-tutuyor", "kollari-bagli", "isaret", "koruyor", "eller-agizda", "el-salliyor"];

export const KarakterVitrini: React.FC<{ dizi: string }> = ({ dizi }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [kar, setKar] = useState<Record<string, { ad: string; gorunum: Gorunum }> | null>(null);
  const [h] = useState(() => delayRender("karakterler"));
  useEffect(() => {
    fetch(staticFile(`diziler/${dizi}/karakterler.json`))
      .then((r) => r.json())
      .then((j) => setKar(j))
      .catch(() => setKar({}))
      .finally(() => continueRender(h));
  }, [dizi, h]);
  const t = frame / fps;
  const i = Math.floor(t / 1.2);
  const duygu = DUYGULAR[i % DUYGULAR.length];
  const poz = POZLAR[i % POZLAR.length];
  const liste = Object.entries(kar ?? {});
  const n = Math.max(1, liste.length);
  return (
    <AbsoluteFill style={{ background: "#222" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Mekan mekan="salon" zaman="gunduz" zengin={false} />
        {liste.map(([id, k], j) => {
          const der = n > 3 ? (j % 2) * 0.5 : 0;
          return (
            <g key={id} transform={`translate(${(1080 / (n + 1)) * (j + 1)},${ayakY(der)}) scale(${olcek(der) * (n > 3 ? 0.8 : 1)})`}>
              <Karakter g={k.gorunum} duygu={duygu} poz={poz} yon={j % 2 ? "sol" : "sag"} otur={false} t={t} konusma={Math.max(0, Math.sin(t * 11)) * 0.7} tohum={j * 5} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 80, width: "100%", textAlign: "center", color: "#fff", fontFamily: ALTYAZI_FONT, fontSize: 48, WebkitTextStroke: "8px #111", paintOrder: "stroke fill" }}>
        {duygu} · {poz}
        <div style={{ fontSize: 36 }}>{liste.map(([, k]) => k.ad).join("  ·  ")}</div>
      </div>
    </AbsoluteFill>
  );
};
