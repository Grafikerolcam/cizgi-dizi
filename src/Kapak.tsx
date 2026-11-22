// Instagram kapak görseli (1080x1920). Profil ızgarası 3:4 (1080x1440, y 240–1680) kırptığı için
// yazılar ve yüzler bu alanın içinde tutulur.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ALTYAZI_FONT } from "./font";
import { Karakter, basYuksekligi } from "./karakter/Karakter";
import { Mekan } from "./mekan/Mekan";
import { BolumData, BolumProps, Duygu } from "./types";

export type KapakProps = BolumProps & {
  ana?: string; // öndeki büyük karakter (varsayılan: ilk karakter)
  yanlar?: string[]; // arkadaki iki karakter
  anaDuygu?: Duygu;
  yanDuygular?: Duygu[];
};

const KarakterYer: React.FC<{ data: BolumData; id: string; x: number; basY: number; s: number; duygu: Duygu; yon: "sag" | "sol" }> = ({ data, id, x, basY, s, duygu, yon }) => {
  const g = data.karakterler[id];
  if (!g) return null;
  const ayak = basY + basYuksekligi(g, false) * s;
  return (
    <g transform={`translate(${x},${ayak}) scale(${s})`}>
      <Karakter g={g} duygu={duygu} poz="ayakta" yon={yon} otur={false} t={1.0} konusma={0} tohum={3} />
    </g>
  );
};

export const Kapak: React.FC<KapakProps> = ({ data, ana, yanlar, anaDuygu = "aglama", yanDuygular = ["supheli", "kizgin"] }) => {
  if (!data) return <AbsoluteFill style={{ background: "#111" }} />;
  const ids = Object.keys(data.karakterler);
  const A = ana ?? ids[0];
  const Y = yanlar ?? ids.filter((i) => i !== A && data.karakterler[i].yas !== "cocuk").slice(0, 2);
  const ilk = data.cekimler[0];
  const bolumNo = data.baslik.split("·")[0].trim().toLocaleUpperCase("tr");
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="kapakIsik" cx="50%" cy="38%" r="60%">
            <stop offset="0" stopColor="#ffe6a8" stopOpacity={0.28} />
            <stop offset="1" stopColor="#ffe6a8" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="kapakAlt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="#0d0907" stopOpacity={0} />
            <stop offset="0.75" stopColor="#0d0907" stopOpacity={0.75} />
            <stop offset="1" stopColor="#0d0907" stopOpacity={0.95} />
          </linearGradient>
          <radialGradient id="kapakVinyet" cx="50%" cy="40%" r="75%">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
        </defs>
        <g transform="translate(-270,-300) scale(1.5)">
          <Mekan mekan={ilk?.mekan === "sokak" ? "salon" : "salon"} zaman="gece" zengin />
        </g>
        <rect width={1080} height={1920} fill="#1a1f4a" opacity={0.3} />
        {/* arkadaki iki karakter */}
        {Y[0] && <KarakterYer data={data} id={Y[0]} x={180} basY={330} s={1.25} duygu={yanDuygular[0] ?? "supheli"} yon="sag" />}
        {Y[1] && <KarakterYer data={data} id={Y[1]} x={905} basY={300} s={1.25} duygu={yanDuygular[1] ?? "kizgin"} yon="sol" />}
        <rect width={1080} height={1920} fill="#0d0907" opacity={0.25} />
        <rect width={1080} height={1920} fill="url(#kapakIsik)" />
        {/* öndeki ana karakter */}
        <KarakterYer data={data} id={A} x={540} basY={430} s={2.05} duygu={anaDuygu} yon="sag" />
        <rect width={1080} height={1920} fill="url(#kapakAlt)" />
        <rect width={1080} height={1920} fill="url(#kapakVinyet)" />
      </svg>

      <div style={{ position: "absolute", left: 50, right: 50, top: 1225, textAlign: "center", fontFamily: ALTYAZI_FONT }}>
        <div
          style={{
            display: "inline-block",
            background: "#c0392b",
            color: "#fff",
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: 6,
            padding: "10px 38px",
            borderRadius: 50,
            boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
          }}
        >
          {bolumNo}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: data.dizi.length > 16 ? 124 : 150,
            fontWeight: 700,
            lineHeight: 1.0,
            color: "#fff6e6",
            WebkitTextStroke: "14px #1d1612",
            paintOrder: "stroke fill",
            textShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          {data.dizi}
        </div>
        <div style={{ marginTop: 26, fontSize: 34, color: "#f0a6a0", fontWeight: 700 }}>@{data.hesap}</div>
      </div>
    </AbsoluteFill>
  );
};
