// Instagram profil fotoğrafı (1080x1080, daire içinde görünür).
// Eski tüplü televizyon; ekranında dizinin ağlayan kahramanı. Küçük boyutta da okunsun diye yazı yok.
import React from "react";
import { AbsoluteFill } from "remotion";
import { KONTUR, Karakter, basYuksekligi } from "./karakter/Karakter";
import { BolumProps, Duygu } from "./types";

export type ProfilProps = BolumProps & { yuz?: string; duygu?: Duygu };

export const Profil: React.FC<ProfilProps> = ({ data, yuz, duygu = "aglama" }) => {
  if (!data) return <AbsoluteFill style={{ background: "#c0392b" }} />;
  const id = yuz ?? Object.keys(data.karakterler)[0];
  const g = data.karakterler[id];
  // ekran: x 250–830, y 330–790
  const s = 1.9;
  const basY = 590; // baş merkezinin ekrandaki yeri
  const ayak = basY + basYuksekligi(g, false) * s;
  const S = { stroke: KONTUR, strokeWidth: 16, strokeLinejoin: "round" as const };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} viewBox="0 0 1080 1080">
        <defs>
          <radialGradient id="pArka" cx="50%" cy="45%" r="70%">
            <stop offset="0" stopColor="#e2574a" />
            <stop offset="1" stopColor="#8e2219" />
          </radialGradient>
          <radialGradient id="pEkran" cx="50%" cy="40%" r="75%">
            <stop offset="0" stopColor="#5d6fa8" />
            <stop offset="1" stopColor="#262c52" />
          </radialGradient>
          <clipPath id="pEkranKes">
            <rect x={262} y={322} width={556} height={456} rx={70} />
          </clipPath>
          <pattern id="pCizgi" width={8} height={8} patternUnits="userSpaceOnUse">
            <rect width={8} height={3} fill="#000" opacity={0.12} />
          </pattern>
        </defs>
        <rect width={1080} height={1080} fill="url(#pArka)" />
        {/* arka plan ışınları */}
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={`M 540 560 L ${540 + Math.cos((i / 16) * Math.PI * 2) * 900} ${560 + Math.sin((i / 16) * Math.PI * 2) * 900} L ${540 + Math.cos(((i + 0.5) / 16) * Math.PI * 2) * 900} ${560 + Math.sin(((i + 0.5) / 16) * Math.PI * 2) * 900} Z`} fill="#fff" opacity={0.05} />
        ))}
        {/* antenler */}
        <line x1={540} y1={250} x2={400} y2={110} stroke={KONTUR} strokeWidth={16} strokeLinecap="round" />
        <line x1={540} y1={250} x2={690} y2={100} stroke={KONTUR} strokeWidth={16} strokeLinecap="round" />
        <circle cx={400} cy={110} r={22} fill="#f2c14e" {...S} strokeWidth={10} />
        <circle cx={690} cy={100} r={22} fill="#f2c14e" {...S} strokeWidth={10} />
        {/* gövde */}
        <rect x={190} y={250} width={700} height={620} rx={110} fill="#f4e3c8" {...S} />
        <rect x={190} y={250} width={700} height={620} rx={110} fill="#000" opacity={0.0} />
        <path d="M 230 820 Q 540 860 850 820 L 850 760 Q 540 800 230 760 Z" fill="#000" opacity={0.06} />
        {/* ayaklar */}
        <rect x={300} y={862} width={70} height={60} rx={14} fill="#6a4a36" {...S} strokeWidth={12} />
        <rect x={710} y={862} width={70} height={60} rx={14} fill="#6a4a36" {...S} strokeWidth={12} />
        {/* ekran */}
        <rect x={262} y={322} width={556} height={456} rx={70} fill="url(#pEkran)" />
        <g clipPath="url(#pEkranKes)">
          <g transform={`translate(540,${ayak}) scale(${s})`}>
            <Karakter g={g} duygu={duygu} poz="ayakta" yon="sag" otur={false} t={1.0} konusma={0} tohum={3} />
          </g>
          <rect x={262} y={322} width={556} height={456} fill="url(#pCizgi)" />
          <path d="M 300 360 Q 420 330 520 350 L 330 520 Q 300 440 300 360 Z" fill="#fff" opacity={0.12} />
        </g>
        <rect x={262} y={322} width={556} height={456} rx={70} fill="none" {...S} />
        {/* düğmeler */}
        <circle cx={540} cy={826} r={0} />
        {/* kayıt ışığı */}
        <circle cx={800} cy={830} r={14} fill="#e2574a" stroke={KONTUR} strokeWidth={6} />
      </svg>
    </AbsoluteFill>
  );
};
