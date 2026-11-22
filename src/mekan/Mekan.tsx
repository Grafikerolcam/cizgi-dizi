// Mekân arka planları. Dünya: 1080 x 1920. Duvar–zemin çizgisi y=1420, ön ayak çizgisi y=1720.
import React from "react";
import { KONTUR } from "../karakter/Karakter";
import { Mekan as MekanTip, Zaman } from "../types";

export const DUNYA = { w: 1080, h: 1920, zemin: 1420, onAyak: 1720 };
// derinlik 0 → ön, 1 → arka
export const ayakY = (derinlik: number) => DUNYA.onAyak - derinlik * 230;
export const olcek = (derinlik: number) => 1 - derinlik * 0.3;

const S = { stroke: KONTUR, strokeWidth: 5, strokeLinejoin: "round" as const };

// ---------- ortak parçalar ----------
const Duvar: React.FC<{ renk: string; motif: string; id: string; tip?: "cicek" | "damask" | "fayans" | "duz" }> = ({ renk, motif, id, tip = "cicek" }) => (
  <g>
    <defs>
      <pattern id={id} width={tip === "fayans" ? 90 : 120} height={tip === "fayans" ? 90 : 120} patternUnits="userSpaceOnUse">
        <rect width={130} height={130} fill={renk} />
        {tip === "cicek" && (
          <g fill={motif} opacity={0.55}>
            <path d="M 30 22 q 4 -10 8 0 q -4 6 -8 0 Z M 34 24 l 0 12" stroke={motif} strokeWidth={2} />
            <path d="M 90 82 q 4 -10 8 0 q -4 6 -8 0 Z M 94 84 l 0 12" stroke={motif} strokeWidth={2} />
          </g>
        )}
        {tip === "damask" && (
          <g fill={motif} opacity={0.45}>
            <path d="M 60 20 C 80 40 80 60 60 80 C 40 60 40 40 60 20 Z" />
            <circle cx={0} cy={100} r={8} />
            <circle cx={120} cy={100} r={8} />
          </g>
        )}
        {tip === "fayans" && <rect x={0} y={0} width={90} height={90} fill="none" stroke={motif} strokeWidth={4} opacity={0.6} />}
      </pattern>
    </defs>
    <rect x={0} y={0} width={DUNYA.w} height={DUNYA.zemin} fill={`url(#${id})`} />
    {/* duvarda hafif dikey gradyan */}
    <rect x={0} y={0} width={DUNYA.w} height={DUNYA.zemin} fill="url(#duvarGolge)" />
  </g>
);

const Parke: React.FC<{ renk?: string }> = ({ renk = "#9b7350" }) => (
  <g>
    <rect x={0} y={DUNYA.zemin} width={DUNYA.w} height={DUNYA.h - DUNYA.zemin} fill={renk} />
    {Array.from({ length: 11 }, (_, i) => {
      const y = DUNYA.zemin + 18 + i * i * 4.6 + i * 12;
      return <line key={i} x1={0} y1={y} x2={DUNYA.w} y2={y} stroke={KONTUR} strokeOpacity={0.25} strokeWidth={3} />;
    })}
    <rect x={0} y={DUNYA.zemin - 26} width={DUNYA.w} height={30} fill="#e9dfcf" {...S} strokeWidth={4} />
  </g>
);

const Hali: React.FC<{ renk: string; x?: number; w?: number }> = ({ renk, x = 140, w = 800 }) => (
  <g>
    <path d={`M ${x + 70} 1480 L ${x + w - 70} 1480 L ${x + w + 60} 1860 L ${x - 60} 1860 Z`} fill={renk} {...S} />
    <path d={`M ${x + 95} 1500 L ${x + w - 95} 1500 L ${x + w + 25} 1835 L ${x - 25} 1835 Z`} fill="none" stroke="#e7c3a8" strokeOpacity={0.6} strokeWidth={4} />
  </g>
);

const Pencere: React.FC<{ x: number; y: number; w: number; h: number; zaman: Zaman; perde?: string; id: string }> = ({ x, y, w, h, zaman, perde = "#a8695a", id }) => {
  const gece = zaman === "gece";
  const binalar = [
    [0, 0.45, 0.16], [0.14, 0.25, 0.14], [0.27, 0.55, 0.12], [0.38, 0.32, 0.18], [0.55, 0.15, 0.13], [0.67, 0.4, 0.16], [0.82, 0.22, 0.18],
  ];
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={gece ? "#232a52" : "#a9d2ee"} />
      <g clipPath={`url(#${id})`}>
        {!gece && (
          <g fill="#fff" opacity={0.85}>
            <ellipse cx={x + w * 0.3} cy={y + h * 0.18} rx={60} ry={22} />
            <ellipse cx={x + w * 0.75} cy={y + h * 0.3} rx={50} ry={18} />
          </g>
        )}
        {gece && <circle cx={x + w * 0.8} cy={y + h * 0.12} r={26} fill="#f3eccc" opacity={0.9} />}
        {binalar.map(([bx, by, bw], i) => {
          const X = x + bx * w, Y = y + by * h, W = bw * w;
          return (
            <g key={i}>
              <rect x={X} y={Y} width={W} height={h} fill={gece ? "#343d6e" : "#8aa4bf"} />
              {Array.from({ length: 14 }, (_, j) => {
                const wx = X + 10 + ((j * 37 + i * 13) % Math.max(10, W - 24));
                const wy = Y + 20 + ((j * 53 + i * 29) % (h * 0.8));
                return <rect key={j} x={wx} y={wy} width={13} height={16} fill={gece ? "#e8d27a" : "#c8dcec"} opacity={(j + i) % 3 === 0 ? 0.25 : 0.95} />;
              })}
            </g>
          );
        })}
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#efe9df" strokeWidth={18} />
      <rect x={x - 9} y={y - 9} width={w + 18} height={h + 18} fill="none" stroke={KONTUR} strokeWidth={4} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#efe9df" strokeWidth={12} />
      <line x1={x} y1={y + h * 0.42} x2={x + w} y2={y + h * 0.42} stroke="#efe9df" strokeWidth={12} />
      <rect x={x - 30} y={y + h + 6} width={w + 60} height={22} fill="#efe9df" {...S} strokeWidth={4} />
      {/* perdeler */}
      <path d={`M ${x - 70} ${y - 50} L ${x + 40} ${y - 50} C ${x + 30} ${y + h * 0.4} ${x + 50} ${y + h * 0.8} ${x + 20} ${y + h + 60} L ${x - 70} ${y + h + 60} Z`} fill={perde} {...S} />
      <path d={`M ${x + w + 70} ${y - 50} L ${x + w - 40} ${y - 50} C ${x + w - 30} ${y + h * 0.4} ${x + w - 50} ${y + h * 0.8} ${x + w - 20} ${y + h + 60} L ${x + w + 70} ${y + h + 60} Z`} fill={perde} {...S} />
      <rect x={x - 90} y={y - 66} width={w + 180} height={18} rx={9} fill="#6a4a36" {...S} strokeWidth={4} />
    </g>
  );
};

const Tablo: React.FC<{ x: number; y: number; w: number; h: number; tur: "manzara" | "karanlik" | "cicek"; altin?: boolean }> = ({ x, y, w, h, tur, altin }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={altin ? "#c9a24c" : "#3a2c24"} {...S} />
    <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill={tur === "karanlik" ? "#1d2236" : "#9db1b8"} />
    {tur === "manzara" && (
      <g>
        <path d={`M ${x + 14} ${y + h - 14} L ${x + w * 0.35} ${y + h * 0.4} L ${x + w * 0.55} ${y + h * 0.62} L ${x + w * 0.72} ${y + h * 0.35} L ${x + w - 14} ${y + h - 14} Z`} fill="#6f8a8a" />
        <rect x={x + 14} y={y + h * 0.78} width={w - 28} height={h * 0.22 - 14} fill="#8c9a6a" />
      </g>
    )}
    {tur === "karanlik" && (
      <g>
        <path d={`M ${x + w * 0.35} ${y + 14} L ${x + w * 0.65} ${y + 14} L ${x + w * 0.85} ${y + h - 14} L ${x + w * 0.15} ${y + h - 14} Z`} fill="#f2e7b8" opacity={0.22} />
        <rect x={x + w * 0.45} y={y + h * 0.45} width={w * 0.1} height={h * 0.4} rx={8} fill="#5b78c4" />
        <circle cx={x + w * 0.5} cy={y + h * 0.4} r={w * 0.06} fill="#5b78c4" />
      </g>
    )}
    {tur === "cicek" && (
      <g>
        <rect x={x + w * 0.42} y={y + h * 0.55} width={w * 0.16} height={h * 0.3} fill="#c78a5a" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={x + w * (0.3 + i * 0.1)} cy={y + h * (0.4 + (i % 2) * 0.08)} r={w * 0.07} fill={["#d9707a", "#f0c35a", "#e28fb0"][i % 3]} />
        ))}
      </g>
    )}
  </g>
);

// Kanepe: oturma yüzeyi ayakY(0)-300 civarı (oturan karakterle uyumlu)
const Kanepe: React.FC<{ x: number; w: number; renk: string; id: string }> = ({ x, w, renk, id }) => {
  const otur = DUNYA.onAyak - 290;
  return (
    <g>
      <defs>
        <pattern id={id} width={80} height={80} patternUnits="userSpaceOnUse">
          <rect width={80} height={80} fill={renk} />
          <rect x={0} y={34} width={80} height={6} fill="#000" opacity={0.12} />
          <rect x={34} y={0} width={6} height={80} fill="#000" opacity={0.12} />
          <line x1={0} y1={70} x2={80} y2={70} stroke="#b0504a" strokeWidth={2} opacity={0.5} />
        </pattern>
      </defs>
      <rect x={x} y={otur - 360} width={w} height={380} rx={40} fill={`url(#${id})`} {...S} />
      <rect x={x + 20} y={otur - 20} width={w - 40} height={130} rx={24} fill={`url(#${id})`} {...S} />
      <rect x={x - 50} y={otur - 200} width={110} height={330} rx={44} fill={`url(#${id})`} {...S} />
      <rect x={x + w - 60} y={otur - 200} width={110} height={330} rx={44} fill={`url(#${id})`} {...S} />
      <rect x={x} y={otur + 110} width={22} height={60} fill="#3a2c24" />
      <rect x={x + w - 22} y={otur + 110} width={22} height={60} fill="#3a2c24" />
    </g>
  );
};

const Lamba: React.FC<{ x: number; y: number; yanik: boolean }> = ({ x, y, yanik }) => (
  <g>
    {yanik && <circle cx={x} cy={y + 40} r={220} fill="url(#lambaIsik)" />}
    <line x1={x} y1={y + 60} x2={x} y2={y + 380} stroke={KONTUR} strokeWidth={8} />
    <ellipse cx={x} cy={y + 384} rx={50} ry={14} fill="#3a2c24" />
    <path d={`M ${x - 70} ${y + 70} L ${x - 44} ${y} L ${x + 44} ${y} L ${x + 70} ${y + 70} Z`} fill={yanik ? "#f6deb0" : "#d8c6a8"} {...S} />
  </g>
);

// ---------- mekânlar ----------
const Salon: React.FC<{ zaman: Zaman; zengin: boolean }> = ({ zaman, zengin }) => (
  <g>
    <Duvar renk={zengin ? "#5f7a62" : "#d8c49c"} motif={zengin ? "#c9b06a" : "#8a6f4c"} id="salonDuvar" tip={zengin ? "damask" : "cicek"} />
    <Pencere x={560} y={330} w={400} h={560} zaman={zaman} id="salonPencere" perde={zengin ? "#7a2b34" : "#a8695a"} />
    <Tablo x={110} y={420} w={300} h={220} tur="manzara" altin={zengin} />
    <Tablo x={430} y={200} w={110} h={170} tur="karanlik" altin={zengin} />
    {zengin && (
      <g>
        <line x1={540} y1={0} x2={540} y2={110} stroke="#8a6d2f" strokeWidth={6} />
        <path d="M 440 110 L 640 110 L 600 170 L 480 170 Z" fill="#d9b85c" {...S} />
        {[460, 500, 540, 580, 620].map((cx) => (
          <circle key={cx} cx={cx} cy={185} r={10} fill="#fff6d6" stroke={KONTUR} strokeWidth={3} />
        ))}
      </g>
    )}
    <Parke renk={zengin ? "#6e4a33" : "#9b7350"} />
    <Hali renk={zengin ? "#5a2230" : "#7b3a35"} />
    <Kanepe x={150} w={780} renk={zengin ? "#3f5d73" : "#4c62a0"} id="salonKanepe" />
    {/* sehpa ve şişeler (dağınık ev hissi) */}
    {!zengin && (
      <g>
        <rect x={60} y={1600} width={150} height={20} fill="#6a4a36" {...S} strokeWidth={4} />
        <rect x={70} y={1620} width={12} height={90} fill="#3a2c24" />
        <rect x={188} y={1620} width={12} height={90} fill="#3a2c24" />
      </g>
    )}
  </g>
);

const YatakOdasi: React.FC<{ zaman: Zaman; zengin: boolean }> = ({ zaman, zengin }) => (
  <g>
    <Duvar renk={zengin ? "#b8a2c4" : "#c9c0d8"} motif="#6d5c86" id="yatakDuvar" tip="cicek" />
    <Pencere x={620} y={300} w={340} h={480} zaman={zaman} id="yatakPencere" perde="#6d5c86" />
    <Tablo x={140} y={360} w={220} h={170} tur="cicek" altin={zengin} />
    <Parke renk="#a07b58" />
    {/* yatak */}
    <rect x={40} y={1060} width={560} height={420} rx={30} fill="#7a5a44" {...S} />
    <rect x={20} y={1330} width={620} height={200} rx={26} fill="#f0ece4" {...S} />
    <rect x={20} y={1380} width={620} height={170} rx={26} fill={zengin ? "#9a3c48" : "#6d86b8"} {...S} />
    <rect x={70} y={1270} width={180} height={80} rx={34} fill="#fff" {...S} />
    <rect x={300} y={1270} width={180} height={80} rx={34} fill="#fff" {...S} />
    <rect x={680} y={1300} width={160} height={180} fill="#7a5a44" {...S} />
    <Lamba x={760} y={1000} yanik={zaman === "gece"} />
  </g>
);

const Mutfak: React.FC<{ zaman: Zaman; zengin: boolean }> = ({ zaman, zengin }) => (
  <g>
    <Duvar renk={zengin ? "#e9e4da" : "#e8dcc6"} motif="#b9a888" id="mutfakDuvar" tip="fayans" />
    <Pencere x={360} y={260} w={360} h={360} zaman={zaman} id="mutfakPencere" perde="#d9a35a" />
    {/* üst dolaplar */}
    <rect x={20} y={240} width={300} height={360} fill={zengin ? "#f4f1ea" : "#9c7a58"} {...S} />
    <rect x={760} y={240} width={300} height={360} fill={zengin ? "#f4f1ea" : "#9c7a58"} {...S} />
    <line x1={170} y1={240} x2={170} y2={600} stroke={KONTUR} strokeWidth={4} />
    <line x1={910} y1={240} x2={910} y2={600} stroke={KONTUR} strokeWidth={4} />
    {/* tezgâh */}
    <rect x={0} y={960} width={1080} height={40} fill="#d6d2c8" {...S} />
    <rect x={20} y={1000} width={1040} height={420} fill={zengin ? "#f4f1ea" : "#9c7a58"} {...S} />
    {[20, 280, 540, 800].map((x) => (
      <g key={x}>
        <rect x={x + 20} y={1030} width={220} height={360} fill="none" stroke={KONTUR} strokeWidth={4} />
        <rect x={x + 120} y={1060} width={30} height={10} rx={5} fill={KONTUR} />
      </g>
    ))}
    {/* ocak üstü tencere */}
    <rect x={430} y={880} width={150} height={80} rx={10} fill="#b8b8c0" {...S} />
    <rect x={410} y={870} width={190} height={18} rx={9} fill="#9a9aa4" {...S} strokeWidth={4} />
    <Parke renk="#b9a58a" />
    {/* masa */}
    <ellipse cx={540} cy={1560} rx={300} ry={60} fill="#7a5a44" {...S} />
  </g>
);

const Sokak: React.FC<{ zaman: Zaman }> = ({ zaman }) => {
  const gece = zaman === "gece";
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1420} fill={gece ? "#1f2547" : "#9fcbe8"} />
      {gece && <circle cx={860} cy={200} r={60} fill="#f3eccc" />}
      {[
        [0, 380, 300, "#7d5f52"], [280, 260, 280, "#b0876a"], [540, 420, 260, "#8a7f9c"], [780, 300, 300, "#a26b5e"],
      ].map(([x, y, w, r], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={w as number} height={1420 - (y as number)} fill={gece ? "#3a3f66" : (r as string)} {...S} />
          {Array.from({ length: 12 }, (_, j) => (
            <rect
              key={j}
              x={(x as number) + 30 + (j % 3) * (((w as number) - 60) / 3)}
              y={(y as number) + 40 + Math.floor(j / 3) * 160}
              width={60}
              height={90}
              fill={gece ? ((j + i) % 3 ? "#e8d27a" : "#272b4a") : "#d9ecf5"}
              stroke={KONTUR}
              strokeWidth={3}
            />
          ))}
        </g>
      ))}
      <rect x={0} y={1420} width={1080} height={500} fill={gece ? "#3b3b44" : "#8a8a90"} />
      <rect x={0} y={1400} width={1080} height={60} fill={gece ? "#55555e" : "#b4b4b8"} {...S} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={60 + i * 280} y={1760} width={140} height={20} fill="#e9e2c8" opacity={0.8} />
      ))}
      {/* sokak lambası */}
      {gece && <circle cx={200} cy={700} r={260} fill="url(#lambaIsik)" />}
      <rect x={190} y={700} width={20} height={720} fill="#2f3036" />
      <path d="M 150 700 L 250 700 L 230 660 L 170 660 Z" fill={gece ? "#f6deb0" : "#ccc"} {...S} />
    </g>
  );
};

const Hastane: React.FC<{ zaman: Zaman }> = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1420} fill="#cfe0d6" />
    <rect x={0} y={900} width={1080} height={520} fill="#a9c7b8" />
    <line x1={0} y1={900} x2={1080} y2={900} stroke={KONTUR} strokeWidth={4} />
    {/* kapılar */}
    {[120, 700].map((x) => (
      <g key={x}>
        <rect x={x} y={520} width={260} height={900} fill="#e9eef0" {...S} />
        <rect x={x + 60} y={600} width={140} height={200} fill="#b9d4e4" {...S} strokeWidth={4} />
        <circle cx={x + 220} cy={1000} r={12} fill={KONTUR} />
      </g>
    ))}
    <rect x={430} y={300} width={220} height={80} rx={10} fill="#3d7a5e" {...S} />
    <path d="M 520 320 h 40 v 15 h 15 v 30 h -15 v 15 h -40 v -15 h -15 v -30 h 15 Z" fill="#fff" transform="translate(-10,-12) scale(1)" />
    <rect x={0} y={1420} width={1080} height={500} fill="#d9dcd6" />
    {Array.from({ length: 8 }, (_, i) => (
      <line key={i} x1={i * 150} y1={1420} x2={i * 150 - 200} y2={1920} stroke={KONTUR} strokeOpacity={0.15} strokeWidth={3} />
    ))}
    {/* bekleme sırası */}
    <rect x={400} y={1240} width={280} height={30} fill="#5c7f9c" {...S} strokeWidth={4} />
    <rect x={400} y={1140} width={280} height={100} rx={10} fill="#5c7f9c" {...S} strokeWidth={4} />
  </g>
);

const Ofis: React.FC<{ zaman: Zaman; zengin: boolean }> = ({ zaman }) => (
  <g>
    <Duvar renk="#d7d9de" motif="#9aa0ac" id="ofisDuvar" tip="duz" />
    <Pencere x={80} y={260} w={920} h={620} zaman={zaman} id="ofisPencere" perde="#8a8f9c" />
    <Parke renk="#5e5f66" />
    <rect x={160} y={1250} width={760} height={40} fill="#3e3330" {...S} />
    <rect x={190} y={1290} width={40} height={240} fill="#3e3330" />
    <rect x={850} y={1290} width={40} height={240} fill="#3e3330" />
    <rect x={420} y={1110} width={240} height={140} rx={8} fill="#2b2f3a" {...S} />
    <rect x={520} y={1250} width={40} height={10} fill="#2b2f3a" />
  </g>
);

export const Mekan: React.FC<{ mekan: MekanTip; zaman: Zaman; zengin: boolean }> = ({ mekan, zaman, zengin }) => (
  <g>
    <defs>
      <linearGradient id="duvarGolge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity={0.18} />
        <stop offset="0.5" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.1} />
      </linearGradient>
      <radialGradient id="lambaIsik">
        <stop offset="0" stopColor="#ffe6a8" stopOpacity={0.55} />
        <stop offset="1" stopColor="#ffe6a8" stopOpacity={0} />
      </radialGradient>
    </defs>
    {mekan === "salon" && <Salon zaman={zaman} zengin={zengin} />}
    {mekan === "yatak-odasi" && <YatakOdasi zaman={zaman} zengin={zengin} />}
    {mekan === "mutfak" && <Mutfak zaman={zaman} zengin={zengin} />}
    {mekan === "sokak" && <Sokak zaman={zaman} />}
    {mekan === "hastane" && <Hastane zaman={zaman} />}
    {mekan === "ofis" && <Ofis zaman={zaman} zengin={zengin} />}
  </g>
);

// Gece: sahnenin üstüne mavi-mor ton (karakterler dahil, ama yumuşak)
export const GeceTonu: React.FC<{ zaman: Zaman; mekan: MekanTip }> = ({ zaman, mekan }) =>
  zaman === "gece" ? <rect x={0} y={0} width={DUNYA.w} height={DUNYA.h} fill="#1a1f4a" opacity={mekan === "sokak" ? 0.22 : 0.12} style={{ mixBlendMode: "multiply" }} /> : null;
