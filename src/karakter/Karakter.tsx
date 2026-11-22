// Düz (flat) 2D çizgi karakter: kalın koyu kontur, büyük kafa, iri badem göz, allık.
// Koordinatlar: (0,0) iki ayağın ortası, yukarı negatif y. Yetişkin ≈ 1100 birim boy.
import React, { useId } from "react";
import { Duygu, Gorunum, Poz } from "../types";

export const KONTUR = "#2b211d";
const KW = 5; // kontur kalınlığı

type Props = {
  g: Gorunum;
  duygu: Duygu;
  poz: Poz;
  yon: "sag" | "sol";
  otur: boolean;
  t: number; // saniye
  konusma: number; // 0..1 ağız açıklığı (ses zarfı)
  tohum: number;
};

// ---------- yardımcılar ----------
const koyu = (hex: string, k = 0.78) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
};

// Kalın çubuk (uzuv): önce kontur, sonra dolgu
const Cubuk: React.FC<{ x1: number; y1: number; x2: number; y2: number; w: number; renk: string }> = ({ x1, y1, x2, y2, w, renk }) => (
  <>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={KONTUR} strokeWidth={w + KW * 2} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={renk} strokeWidth={w} strokeLinecap="round" />
  </>
);

// İki kemikli ters kinematik: omuz → el hedefi, dirsek dışarı/aşağı bükülür
const ik = (sx: number, sy: number, hx: number, hy: number, l1: number, l2: number, disari: number) => {
  let dx = hx - sx, dy = hy - sy;
  let d = Math.hypot(dx, dy);
  const maxD = (l1 + l2) * 0.999;
  if (d > maxD) {
    dx *= maxD / d;
    dy *= maxD / d;
    d = maxD;
  }
  const a = Math.atan2(dy, dx);
  const cosB = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const b = Math.acos(Math.max(-1, Math.min(1, cosB)));
  // iki çözümden dirseği daha aşağıda (ve biraz dışarıda) olanı seç: doğal duruş
  const c1 = a + b, c2 = a - b;
  const puan = (c: number) => Math.sin(c) * 1 + Math.cos(c) * disari * 0.35;
  const aci = puan(c1) >= puan(c2) ? c1 : c2;
  const ex = sx + Math.cos(aci) * l1, ey = sy + Math.sin(aci) * l1;
  return { ex, ey, hx: sx + dx, hy: sy + dy };
};

// Pozlar: el hedefi (omuza göre). x>0 = dışa doğru, y>0 = aşağı.
type ElHedef = { x: number; y: number };
const POZ: Record<Poz, (yonTarafi: boolean, t: number) => ElHedef> = {
  ayakta: () => ({ x: 22, y: 430 }),
  oturuyor: () => ({ x: -40, y: 300 }),
  "basini-tutuyor": () => ({ x: 2, y: -200 }),
  "kollari-bagli": () => ({ x: -190, y: 150 }),
  isaret: (yt) => (yt ? { x: 300, y: 10 } : { x: 22, y: 430 }),
  koruyor: (yt) => (yt ? { x: 300, y: 170 } : { x: 22, y: 430 }),
  "eller-agizda": () => ({ x: -105, y: -95 }),
  "el-salliyor": (yt, t) => (yt ? { x: 120 + Math.sin(t * 9) * 45, y: -280 } : { x: 22, y: 430 }),
};

// ---------- yüz ----------
type Ifade = {
  kasIc: number; // kaş iç ucu (+ aşağı)
  kasDis: number;
  kasY: number;
  gozAcik: number; // 0..1.4
  agiz: "gulus" | "duz" | "uzgun" | "acik" | "o" | "dis" | "titrek";
  allik: number;
  gozyasi: boolean;
  ter: boolean;
  bakisY: number;
};
const IFADE: Record<Duygu, Ifade> = {
  normal: { kasIc: 0, kasDis: 0, kasY: 0, gozAcik: 1, agiz: "duz", allik: 0.35, gozyasi: false, ter: false, bakisY: 0 },
  mutlu: { kasIc: -4, kasDis: -2, kasY: -4, gozAcik: 0.85, agiz: "gulus", allik: 0.55, gozyasi: false, ter: false, bakisY: 0 },
  uzgun: { kasIc: -12, kasDis: 8, kasY: 0, gozAcik: 0.72, agiz: "uzgun", allik: 0.5, gozyasi: false, ter: false, bakisY: 4 },
  aglama: { kasIc: -14, kasDis: 9, kasY: 0, gozAcik: 0.68, agiz: "titrek", allik: 0.85, gozyasi: true, ter: false, bakisY: 2 },
  korku: { kasIc: -16, kasDis: 6, kasY: -8, gozAcik: 1.3, agiz: "titrek", allik: 0.3, gozyasi: false, ter: true, bakisY: 0 },
  kizgin: { kasIc: 14, kasDis: -8, kasY: 4, gozAcik: 0.8, agiz: "dis", allik: 0.6, gozyasi: false, ter: false, bakisY: 0 },
  saskin: { kasIc: -10, kasDis: -10, kasY: -14, gozAcik: 1.35, agiz: "o", allik: 0.35, gozyasi: false, ter: false, bakisY: 0 },
  sersem: { kasIc: -6, kasDis: 6, kasY: 2, gozAcik: 0.5, agiz: "duz", allik: 0.45, gozyasi: false, ter: false, bakisY: 3 },
  supheli: { kasIc: 9, kasDis: -2, kasY: 2, gozAcik: 0.6, agiz: "duz", allik: 0.3, gozyasi: false, ter: false, bakisY: 0 },
  utangac: { kasIc: -6, kasDis: 2, kasY: 0, gozAcik: 0.8, agiz: "gulus", allik: 1, gozyasi: false, ter: false, bakisY: 6 },
};

const Goz: React.FC<{ x: number; f: Ifade; iris: string; acik: number; bakX: number; taraf: 1 | -1; uid: string }> = ({ x, f, iris, acik, bakX, taraf, uid }) => {
  const w = 31, h = 21 * acik;
  const ust = `M ${x - w} 0 Q ${x} ${-h * 1.5} ${x + w} ${-2}`;
  const alt = `Q ${x} ${h * 1.1} ${x - w} 0`;
  const id = `goz${uid}${taraf}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={`${ust} ${alt} Z`} />
        </clipPath>
      </defs>
      <path d={`${ust} ${alt} Z`} fill="#fbf7f2" />
      <g clipPath={`url(#${id})`}>
        <circle cx={x + bakX} cy={f.bakisY * 0.6} r={14} fill={iris} stroke={koyu(iris, 0.6)} strokeWidth={2} />
        <circle cx={x + bakX} cy={f.bakisY * 0.6} r={6.5} fill="#1c1512" />
        <circle cx={x + bakX + 4} cy={f.bakisY * 0.6 - 5} r={3.2} fill="#fff" />
      </g>
      {/* üst kapak: kalın çizgi + kirpik ucu */}
      <path d={ust} fill="none" stroke={KONTUR} strokeWidth={4.5} strokeLinecap="round" />
      <path d={`M ${x + w * taraf * -1} ${taraf === 1 ? 0 : -2} l ${-7 * taraf} ${-6}`} stroke={KONTUR} strokeWidth={3.5} strokeLinecap="round" />
      {/* alt kapak ve göz altı çizgisi */}
      <path d={`M ${x - w * 0.8} ${h * 0.55} Q ${x} ${h * 1.25} ${x + w * 0.8} ${h * 0.55}`} fill="none" stroke={KONTUR} strokeOpacity={0.35} strokeWidth={2} />
      <path d={`M ${x - w * 0.6} ${h * 1.1 + 9} Q ${x} ${h * 1.1 + 15} ${x + w * 0.6} ${h * 1.1 + 9}`} fill="none" stroke={KONTUR} strokeOpacity={0.18} strokeWidth={2} />
    </g>
  );
};

const Yuz: React.FC<{ g: Gorunum; duygu: Duygu; t: number; konusma: number; tohum: number; yon: "sag" | "sol"; uid: string }> = ({ g, duygu, t, konusma, tohum, yon, uid }) => {
  const f = IFADE[duygu];
  // göz kırpma: her ~3.5 sn, 0.12 sn
  const per = 3.2 + (tohum % 7) * 0.25;
  const faz = (t + tohum * 0.37) % per;
  const kirp = faz < 0.12 ? Math.abs(faz - 0.06) / 0.06 : 1;
  const acik = Math.max(0.06, f.gozAcik * kirp);
  const bakX = yon === "sag" ? 6 : -6;
  const ox = yon === "sag" ? 5 : -5;
  const yasli = g.yas === "yasli";

  // ağız
  const ag = konusma;
  const my = 78;
  let agiz: React.ReactNode;
  const acikAgiz = (gen: number, yuk: number) => (
    <g>
      <path d={`M ${-gen} 0 Q 0 ${-yuk * 0.35} ${gen} 0 Q 0 ${yuk * 1.25} ${-gen} 0 Z`} fill="#5b2a26" stroke={KONTUR} strokeWidth={3.5} strokeLinejoin="round" />
      {yuk > 9 && <path d={`M ${-gen * 0.7} ${yuk * 0.05} Q 0 ${yuk * 0.12} ${gen * 0.7} ${yuk * 0.05} L ${gen * 0.6} ${yuk * 0.3} Q 0 ${yuk * 0.38} ${-gen * 0.6} ${yuk * 0.3} Z`} fill="#fff" />}
      {yuk > 12 && <ellipse cx={0} cy={yuk * 0.85} rx={gen * 0.45} ry={yuk * 0.25} fill="#c9655f" />}
    </g>
  );
  if (ag > 0.08) {
    agiz = acikAgiz(18 + ag * 8, 6 + ag * 26);
  } else if (f.agiz === "gulus") {
    agiz = <path d="M -24 -2 Q 0 18 24 -2" fill="none" stroke={KONTUR} strokeWidth={4} strokeLinecap="round" />;
  } else if (f.agiz === "uzgun") {
    agiz = <path d="M -20 8 Q 0 -6 20 8" fill="none" stroke={KONTUR} strokeWidth={4} strokeLinecap="round" />;
  } else if (f.agiz === "titrek") {
    const w = Math.sin(t * 30) * 1.5;
    agiz = <path d={`M -20 ${6 + w} Q -10 ${-2 - w} 0 ${3 + w} Q 10 ${-2 + w} 20 ${6 - w}`} fill="none" stroke={KONTUR} strokeWidth={4} strokeLinecap="round" />;
  } else if (f.agiz === "o") {
    agiz = acikAgiz(11, 22);
  } else if (f.agiz === "dis") {
    agiz = (
      <g>
        <rect x={-24} y={-6} width={48} height={16} rx={6} fill="#fff" stroke={KONTUR} strokeWidth={3.5} />
        <line x1={-24} y1={2} x2={24} y2={2} stroke={KONTUR} strokeWidth={2} />
      </g>
    );
  } else {
    agiz = <path d="M -17 2 Q 0 6 17 2" fill="none" stroke={KONTUR} strokeWidth={4} strokeLinecap="round" />;
  }

  const kas = (taraf: 1 | -1) => {
    const ic = 18 * taraf, dis = 58 * taraf;
    const y0 = -40 + f.kasY;
    return (
      <path
        d={`M ${ic + ox} ${y0 + f.kasIc} Q ${(ic + dis) / 2 + ox} ${y0 - 9} ${dis + ox} ${y0 + f.kasDis}`}
        fill="none"
        stroke={koyu(g.sacRengi === "#f4f1ea" ? "#9a9590" : g.sacRengi, 0.75)}
        strokeWidth={7}
        strokeLinecap="round"
      />
    );
  };

  const damla = (x: number) => {
    const p = ((t * 0.9 + (x > 0 ? 0.4 : 0)) % 1);
    return (
      <g>
        <path d={`M ${x} 22 Q ${x - 7} 60 ${x - 2} 92 Q ${x + 4} 95 ${x + 7} 88 Q ${x + 6} 55 ${x + 4} 22 Z`} fill="#a9d4f0" stroke="#6aa8d4" strokeWidth={2} opacity={0.9} />
        <ellipse cx={x + 2} cy={92 + p * 40} rx={5} ry={7} fill="#a9d4f0" stroke="#6aa8d4" strokeWidth={2} opacity={1 - p} />
      </g>
    );
  };

  return (
    <g>
      {/* allık */}
      <ellipse cx={-62 + ox} cy={44} rx={24} ry={13} fill="#e88c86" opacity={f.allik * 0.7} />
      <ellipse cx={62 + ox} cy={44} rx={24} ry={13} fill="#e88c86" opacity={f.allik * 0.7} />
      {/* yaşlılık çizgileri */}
      {yasli && (
        <g stroke={KONTUR} strokeOpacity={0.3} strokeWidth={2.5} fill="none">
          <path d="M -40 -62 Q 0 -70 40 -62" />
          <path d="M -30 -75 Q 0 -82 30 -75" />
          <path d="M -40 52 Q -46 70 -36 86" />
          <path d="M 40 52 Q 46 70 36 86" />
        </g>
      )}
      {/* gözler */}
      <g transform={`translate(${ox},4)`}>
        <Goz x={-48} f={f} iris={g.gozRengi} acik={acik} bakX={bakX} taraf={-1} uid={uid} />
        <Goz x={48} f={f} iris={g.gozRengi} acik={acik} bakX={bakX} taraf={1} uid={uid} />
      </g>
      {kas(-1)}
      {kas(1)}
      {g.gozluk && (
        <g fill="none" stroke={KONTUR} strokeWidth={4}>
          <rect x={-86 + ox} y={-20} width={72} height={46} rx={14} />
          <rect x={14 + ox} y={-20} width={72} height={46} rx={14} />
          <path d={`M ${-14 + ox} -4 Q ${ox} -12 ${14 + ox} -4`} />
        </g>
      )}
      {/* burun */}
      <path d={`M ${ox * 1.6 - 2} 28 Q ${ox * 1.6 + 6} 46 ${ox * 1.6 - 6} 50`} fill="none" stroke={KONTUR} strokeOpacity={0.55} strokeWidth={3.5} strokeLinecap="round" />
      {/* sakal / bıyık */}
      {g.sakal === "kirli" && <path d="M -88 30 C -80 110 -40 138 0 140 C 40 138 80 110 88 30 C 70 70 40 66 0 66 C -40 66 -70 70 -88 30 Z" fill={KONTUR} opacity={0.14} />}
      {g.sakal === "sakal" && (
        <path d="M -96 20 C -92 120 -45 150 0 152 C 45 150 92 120 96 20 C 76 74 46 64 20 62 Q 0 70 -20 62 C -46 64 -76 74 -96 20 Z" fill={g.sacRengi} stroke={KONTUR} strokeWidth={3.5} />
      )}
      {(g.sakal === "biyik" || g.sakal === "sakal") && (
        <path d={`M ${-30 + ox} ${my - 12} Q ${ox} ${my - 24} ${30 + ox} ${my - 12} Q ${ox} ${my - 4} ${-30 + ox} ${my - 12} Z`} fill={g.sacRengi} stroke={KONTUR} strokeWidth={3} />
      )}
      <g transform={`translate(${ox * 1.2},${my})`}>{agiz}</g>
      {f.gozyasi && (
        <g transform={`translate(${ox},0)`}>
          {damla(-46)}
          {damla(50)}
        </g>
      )}
      {f.ter && <path d="M 88 -70 Q 78 -48 88 -40 Q 98 -48 88 -70 Z" fill="#bfe3f7" stroke="#6aa8d4" strokeWidth={2.5} />}
    </g>
  );
};

// ---------- saç ----------
const YUZ_YOLU = "M -105 -40 C -112 -150 112 -150 105 -40 C 103 40 62 126 0 134 C -62 126 -103 40 -105 -40 Z";

const SacArka: React.FC<{ g: Gorunum; t: number }> = ({ g, t }) => {
  const r = g.sacRengi;
  const s = { fill: r, stroke: KONTUR, strokeWidth: KW, strokeLinejoin: "round" as const };
  switch (g.sac) {
    case "uzun":
      return <path d="M -118 -60 C -140 -190 140 -190 118 -60 C 130 120 140 260 150 360 C 60 380 -60 380 -150 360 C -140 260 -130 120 -118 -60 Z" {...s} />;
    case "orgu": {
      const orgu = (x: number) =>
        Array.from({ length: 7 }, (_, i) => (
          <ellipse key={i} cx={x + Math.sin(i + t * 2) * 1.5} cy={40 + i * 26} rx={17 - i * 0.6} ry={15} {...s} strokeWidth={4} />
        ));
      return (
        <g>
          <path d="M -114 -50 C -136 -185 136 -185 114 -50 L 110 30 L -110 30 Z" {...s} />
          {orgu(-112)}
          {orgu(112)}
        </g>
      );
    }
    case "topuz":
      return (
        <g>
          <circle cx={0} cy={-168} r={52} {...s} />
          <path d="M -30 -188 Q 0 -200 30 -186" fill="none" stroke={KONTUR} strokeOpacity={0.4} strokeWidth={3} />
        </g>
      );
    case "at-kuyrugu":
      return <path d={`M 70 -110 C 170 -120 ${190 + Math.sin(t * 2.4) * 6} 40 ${150 + Math.sin(t * 2.4) * 8} 170 C 130 60 110 -20 60 -60 Z`} {...s} />;
    case "basortusu":
      return <path d="M -150 -40 C -150 -230 150 -230 150 -40 C 160 90 170 180 190 250 L -190 250 C -170 180 -160 90 -150 -40 Z" fill={r} stroke={KONTUR} strokeWidth={KW} />;
    default:
      return null;
  }
};

const SacOn: React.FC<{ g: Gorunum }> = ({ g }) => {
  const r = g.sacRengi;
  const s = { fill: r, stroke: KONTUR, strokeWidth: KW, strokeLinejoin: "round" as const };
  const parlak = <path d="M -60 -128 Q -20 -146 30 -136" fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={6} strokeLinecap="round" />;
  switch (g.sac) {
    case "kisa":
      return (
        <g>
          <path d="M -112 -20 C -128 -150 -40 -190 20 -178 C 96 -170 128 -110 112 -20 L 104 -36 C 96 -80 70 -96 40 -94 L 30 -110 L 14 -92 C -20 -96 -50 -100 -70 -90 L -82 -104 L -88 -78 C -100 -60 -104 -40 -104 -20 Z" {...s} />
          {parlak}
        </g>
      );
    case "dagnik":
      return (
        <g>
          <path d="M -116 -10 C -134 -160 -50 -196 20 -184 C 100 -176 134 -116 116 -10 L 106 -40 L 96 -26 C 92 -70 80 -84 60 -92 L 52 -74 L 36 -98 L 20 -76 L 4 -100 L -14 -78 L -30 -98 L -46 -76 L -66 -94 L -76 -70 C -92 -62 -102 -40 -106 -26 Z" {...s} />
          {parlak}
        </g>
      );
    case "uzun":
    case "orgu":
      return (
        <g>
          <path d="M 0 -150 C -60 -150 -112 -110 -118 -40 C -122 40 -128 120 -132 200 L -112 200 C -104 120 -100 40 -94 -20 C -80 -70 -40 -110 0 -122 Z" {...s} />
          <path d="M 0 -150 C 60 -150 112 -110 118 -40 C 122 40 128 120 132 200 L 112 200 C 104 120 100 40 94 -20 C 80 -70 40 -110 0 -122 Z" {...s} />
          {g.sac === "orgu" && <path d="M -100 -8 L -112 200 L -132 200 Z" fill={r} />}
          <path d="M -20 -140 Q -60 -120 -84 -60" fill="none" stroke={KONTUR} strokeOpacity={0.3} strokeWidth={3} />
          <path d="M 20 -140 Q 60 -120 84 -60" fill="none" stroke={KONTUR} strokeOpacity={0.3} strokeWidth={3} />
          {parlak}
        </g>
      );
    case "topuz":
    case "at-kuyrugu":
      return (
        <g>
          <path d="M -116 -6 C -134 -205 134 -205 116 -6 C 106 -60 82 -90 40 -98 C 15 -102 -15 -102 -40 -98 C -82 -90 -106 -60 -116 -6 Z" {...s} />
          <path d="M -40 -140 Q -10 -112 -4 -114 M 40 -140 Q 10 -112 4 -114" fill="none" stroke={KONTUR} strokeOpacity={0.3} strokeWidth={3} />
          {parlak}
        </g>
      );
    case "kel":
      return g.yas === "yasli" || g.cinsiyet === "erkek" ? (
        <g>
          <path d="M -108 -10 C -112 -50 -104 -80 -94 -90 C -90 -60 -96 -30 -96 -10 Z" {...s} />
          <path d="M 108 -10 C 112 -50 104 -80 94 -90 C 90 -60 96 -30 96 -10 Z" {...s} />
        </g>
      ) : null;
    case "basortusu":
      return (
        <g>
          <path d="M -128 -10 C -134 -170 134 -170 128 -10 C 118 -90 70 -126 0 -126 C -70 -126 -118 -90 -128 -10 Z" fill={r} stroke={KONTUR} strokeWidth={KW} />
          <path d="M -128 -10 C -128 80 -90 150 -40 170 L 40 170 C 90 150 128 80 128 -10" fill="none" stroke={KONTUR} strokeWidth={KW} />
          <path d="M -40 -110 Q 0 -100 40 -110" fill="none" stroke={KONTUR} strokeOpacity={0.3} strokeWidth={3} />
        </g>
      );
  }
};

// ---------- gövde ölçüleri ----------
const OLCU = {
  cocuk: { govde: 0.5, kafa: 0.8, gen: 0.92 },
  genc: { govde: 0.95, kafa: 0.98, gen: 0.96 },
  yetiskin: { govde: 1, kafa: 1, gen: 1 },
  yasli: { govde: 0.96, kafa: 1, gen: 1.04 },
};

// Karakterin dünya ölçeğinde baş merkezinin ayaklara göre yüksekliği (kamera için)
export const basYuksekligi = (g: Gorunum, otur: boolean) => {
  const o = OLCU[g.yas];
  const k = o.govde * (g.boy ?? 1);
  const omuz = (otur ? 600 : 760) * k;
  return omuz + 40 * k + 130 * o.kafa * (g.yas === "cocuk" ? 1 : 1);
};

export const Karakter: React.FC<Props> = ({ g, duygu, poz, yon, otur, t, konusma, tohum }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const o = OLCU[g.yas];
  const k = o.govde * (g.boy ?? 1);
  const gen = o.gen;
  const kadin = g.cinsiyet === "kadin";
  const ayak = g.ayakkabi ?? (kadin ? "#d8d2c8" : "#3b3431");

  // nefes ve konuşurken baş sallama
  const nefes = Math.sin(t * 2.1 + tohum) * 0.006;
  const kafaAci = Math.sin(t * 5.3 + tohum) * 2.2 * konusma + Math.sin(t * 0.9 + tohum) * 0.8;
  const titreme = duygu === "korku" || duygu === "aglama" ? Math.sin(t * 38) * 1.2 : 0;

  // dikey düzen (yetişkin birimi, sonra k ile ölçeklenir)
  const kalca = otur ? -300 : -460;
  const omuzY = otur ? -600 : -760;
  const omuzX = (kadin ? 112 : 125) * gen;
  const belX = (kadin ? 100 : 115) * gen;
  const govdeRenk = g.ust;
  const altRenk = g.elbise ? g.ust : g.alt;

  const desenId = `desen${uid}`;
  const desen = g.desen && g.desen !== "yok";
  const dolgu = desen ? `url(#${desenId})` : govdeRenk;

  // kollar
  const yonIsaret = yon === "sag" ? 1 : -1;
  const l1 = 225, l2 = 215;
  const kol = (taraf: 1 | -1) => {
    const yt = taraf === yonIsaret;
    const pz = otur && poz === "ayakta" ? "oturuyor" : poz;
    const h = POZ[pz](yt, t);
    const sx = taraf * (omuzX - 22), sy = omuzY + 30;
    const r = ik(sx, sy, sx + taraf * h.x, sy + h.y, l1, l2, taraf === 1 ? 1 : -1);
    const kolRenk = g.kisaKol ? g.ten : govdeRenk;
    return (
      <g key={taraf}>
        <Cubuk x1={sx} y1={sy} x2={r.ex} y2={r.ey} w={62} renk={govdeRenk} />
        <Cubuk x1={r.ex} y1={r.ey} x2={r.hx} y2={r.hy} w={54} renk={kolRenk} />
        {g.kisaKol && <Cubuk x1={sx} y1={sy} x2={(sx + r.ex) / 2} y2={(sy + r.ey) / 2} w={64} renk={govdeRenk} />}
        {!g.kisaKol && (
          <line x1={r.ex + (r.hx - r.ex) * 0.86} y1={r.ey + (r.hy - r.ey) * 0.86} x2={r.ex + (r.hx - r.ex) * 0.86 + 1} y2={r.ey + (r.hy - r.ey) * 0.86 + 1} stroke={koyu(govdeRenk, 0.8)} strokeWidth={60} strokeLinecap="round" />
        )}
        <circle cx={r.hx} cy={r.hy} r={33} fill={g.ten} stroke={KONTUR} strokeWidth={KW} />
      </g>
    );
  };

  // bacaklar
  const bacaklar = otur ? (
    <g>
      {/* diz (önden kısalmış uyluk) */}
      <rect x={-belX - 6} y={kalca - 20} width={(belX + 6) * 2} height={90} rx={36} fill={altRenk} stroke={KONTUR} strokeWidth={KW} />
      <line x1={0} y1={kalca} x2={0} y2={kalca + 60} stroke={KONTUR} strokeWidth={3} strokeOpacity={0.5} />
      {[-1, 1].map((s) => (
        <g key={s}>
          <Cubuk x1={s * 58 * gen} y1={kalca + 60} x2={s * 60 * gen} y2={-40} w={86} renk={g.etek || g.elbise ? g.ten : altRenk} />
          <ellipse cx={s * 62 * gen} cy={-18} rx={58} ry={26} fill={ayak} stroke={KONTUR} strokeWidth={KW} />
        </g>
      ))}
    </g>
  ) : (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <Cubuk x1={s * 52 * gen} y1={kalca + 20} x2={s * 54 * gen} y2={-44} w={g.etek || g.elbise ? 58 : 90} renk={g.etek || g.elbise ? (g.yas === "cocuk" ? "#f4f1ea" : g.ten) : altRenk} />
          <ellipse cx={s * 58 * gen} cy={-20} rx={60} ry={26} fill={ayak} stroke={KONTUR} strokeWidth={KW} />
        </g>
      ))}
      {!(g.etek || g.elbise) && <line x1={0} y1={kalca + 10} x2={0} y2={kalca + 120} stroke={KONTUR} strokeWidth={3} strokeOpacity={0.4} />}
    </g>
  );

  // etek / elbise alt kısmı
  const etekBoy = g.yas === "cocuk" ? 300 : 360;
  const etek =
    (g.etek || g.elbise) && !otur ? (
      <path
        d={`M ${-belX} ${kalca - 10} L ${-belX - 45} ${kalca + etekBoy} Q 0 ${kalca + etekBoy + 18} ${belX + 45} ${kalca + etekBoy} L ${belX} ${kalca - 10} Z`}
        fill={g.elbise ? dolgu : altRenk}
        stroke={KONTUR}
        strokeWidth={KW}
        strokeLinejoin="round"
      />
    ) : (g.etek || g.elbise) && otur ? (
      <rect x={-belX - 10} y={kalca - 20} width={(belX + 10) * 2} height={110} rx={36} fill={g.elbise ? dolgu : altRenk} stroke={KONTUR} strokeWidth={KW} />
    ) : null;

  const govde = (
    <path
      d={`M ${-omuzX} ${omuzY + 20} Q ${-omuzX} ${omuzY - 6} ${-omuzX + 40} ${omuzY - 10} L ${omuzX - 40} ${omuzY - 10} Q ${omuzX} ${omuzY - 6} ${omuzX} ${omuzY + 20} L ${belX + 6} ${kalca + 10} L ${-belX - 6} ${kalca + 10} Z`}
      fill={dolgu}
      stroke={KONTUR}
      strokeWidth={KW}
      strokeLinejoin="round"
    />
  );

  const kafaY = omuzY - 40;
  const hs = o.kafa / k; // kafa, gövde ölçeğinden bağımsız

  return (
    <g transform={`translate(${titreme},0) scale(${k}) scale(1,${1 + nefes})`}>
      <defs>
        {g.desen === "puantiye" && (
          <pattern id={desenId} width={36} height={36} patternUnits="userSpaceOnUse">
            <rect width={36} height={36} fill={govdeRenk} />
            <circle cx={9} cy={9} r={4} fill={koyu(govdeRenk, 0.75)} opacity={0.8} />
            <circle cx={27} cy={27} r={3} fill="#d98c8c" opacity={0.7} />
          </pattern>
        )}
        {g.desen === "cizgili" && (
          <pattern id={desenId} width={30} height={30} patternUnits="userSpaceOnUse">
            <rect width={30} height={30} fill={govdeRenk} />
            <rect width={30} height={9} fill={koyu(govdeRenk, 0.8)} />
          </pattern>
        )}
        {g.desen === "ekose" && (
          <pattern id={desenId} width={60} height={60} patternUnits="userSpaceOnUse">
            <rect width={60} height={60} fill={govdeRenk} />
            <rect x={0} y={24} width={60} height={10} fill={koyu(govdeRenk, 0.75)} opacity={0.6} />
            <rect x={24} y={0} width={10} height={60} fill={koyu(govdeRenk, 0.75)} opacity={0.6} />
            <line x1={0} y1={50} x2={60} y2={50} stroke="#b04a3c" strokeWidth={2} />
          </pattern>
        )}
      </defs>

      {/* gölge */}
      <ellipse cx={0} cy={-6} rx={170 * gen} ry={26} fill="#000" opacity={0.18} />

      {/* arka saç (gövdenin arkasında) */}
      <g transform={`translate(0,${kafaY}) scale(${hs}) rotate(${kafaAci}) translate(0,-130)`}>
        <SacArka g={g} t={t} />
      </g>

      {bacaklar}
      {etek}
      {govde}
      {/* gövde gölgelendirme */}
      <path d={`M ${omuzX - 30} ${omuzY} L ${belX} ${kalca + 6} L ${belX - 40} ${kalca + 6} Q ${omuzX - 60} ${(omuzY + kalca) / 2} ${omuzX - 50} ${omuzY}`} fill="#000" opacity={0.07} />
      {/* yaka ve düğmeler */}
      {g.yaka && (
        <g>
          <path d={`M -48 ${omuzY - 8} L -6 ${omuzY + 36} L -56 ${omuzY + 34} Z`} fill={koyu(govdeRenk, 0.95)} stroke={KONTUR} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M 48 ${omuzY - 8} L 6 ${omuzY + 36} L 56 ${omuzY + 34} Z`} fill={koyu(govdeRenk, 0.95)} stroke={KONTUR} strokeWidth={4} strokeLinejoin="round" />
          {(g.kolye ? [120, 200, 280] : [80, 170, 260]).map((y) => (omuzY + y < kalca ? <circle key={y} cx={0} cy={omuzY + y} r={6} fill={KONTUR} /> : null))}
        </g>
      )}
      {!g.yaka && <path d={`M -44 ${omuzY - 9} Q 0 ${omuzY + 34} 44 ${omuzY - 9}`} fill={g.ten} stroke={KONTUR} strokeWidth={4} />}
      {g.yas !== "cocuk" && !g.elbise && !g.etek && <line x1={-belX - 4} y1={kalca} x2={belX + 4} y2={kalca} stroke={koyu(altRenk, 0.6)} strokeWidth={10} />}

      {/* boyun */}
      <rect x={-27 * hs} y={kafaY - 10} width={54 * hs} height={60} fill={g.ten} stroke={KONTUR} strokeWidth={KW} />
      <rect x={-27 * hs + 3} y={kafaY + 34} width={54 * hs - 6} height={14} fill={g.ten} />

      {/* ay kolye */}
      {g.kolye && (
        <g>
          <path d={`M ${-24 * hs} ${omuzY - 16} Q ${-14 * hs} ${omuzY + 30} 0 ${omuzY + 34} Q ${14 * hs} ${omuzY + 30} ${24 * hs} ${omuzY - 16}`} fill="none" stroke={g.kolye} strokeWidth={3.5} />
          <g transform={`translate(0,${omuzY + 54})`}>
            <circle r={30} fill={g.kolye} opacity={0.18} />
            <path d="M 7 -18 A 19 19 0 1 0 7 18 A 14 14 0 1 1 7 -18 Z" fill={g.kolye} stroke={KONTUR} strokeWidth={3} strokeLinejoin="round" />
            <circle cx={-9} cy={-6} r={3} fill="#fff" opacity={0.85} />
          </g>
        </g>
      )}

      {/* kafa */}
      <g transform={`translate(0,${kafaY}) scale(${hs}) rotate(${kafaAci}) translate(0,-130)`}>
        {g.sac !== "basortusu" && (
          <>
            <ellipse cx={-108} cy={4} rx={16} ry={24} fill={g.ten} stroke={KONTUR} strokeWidth={KW} />
            <ellipse cx={108} cy={4} rx={16} ry={24} fill={g.ten} stroke={KONTUR} strokeWidth={KW} />
          </>
        )}
        <path d={YUZ_YOLU} fill={g.ten} stroke={KONTUR} strokeWidth={KW} strokeLinejoin="round" />
        <path d="M 60 100 C 90 60 102 20 104 -30 C 106 40 70 116 20 132 C 34 124 50 112 60 100 Z" fill="#000" opacity={0.06} />
        <Yuz g={g} duygu={duygu} t={t} konusma={konusma} tohum={tohum} yon={yon} uid={uid} />
        <SacOn g={g} />
      </g>

      {/* kollar en önde */}
      {kol(-1)}
      {kol(1)}
    </g>
  );
};
