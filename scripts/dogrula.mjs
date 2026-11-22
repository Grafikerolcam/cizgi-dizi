// Dizi + bölüm dosyalarını kontrol eder; hata listesini döndürür.
export const MEKANLAR = ["salon", "yatak-odasi", "mutfak", "sokak", "hastane", "ofis"];
export const DUYGULAR = ["normal", "mutlu", "uzgun", "aglama", "korku", "kizgin", "saskin", "sersem", "supheli", "utangac"];
export const POZLAR = ["ayakta", "oturuyor", "basini-tutuyor", "kollari-bagli", "isaret", "koruyor", "eller-agizda", "el-salliyor"];
export const KAMERALAR = ["genis", "orta", "yakin", "cok-yakin", "iki"];
export const SACLAR = ["kisa", "dagnik", "uzun", "orgu", "topuz", "at-kuyrugu", "kel", "basortusu"];
export const YASLAR = ["cocuk", "genc", "yetiskin", "yasli"];

export const dogrula = (D, B) => {
  const h = [];
  if (!D.hesap) h.push("dizi.json: hesap (ör. @hesabim) eksik");
  for (const [id, k] of Object.entries(D.karakterler ?? {})) {
    const g = k.gorunum ?? {};
    if (!k.ses?.id) h.push(`karakter ${id}: ses.id eksik`);
    if (!YASLAR.includes(g.yas)) h.push(`karakter ${id}: yas ${YASLAR.join("|")} olmalı`);
    if (!SACLAR.includes(g.sac)) h.push(`karakter ${id}: sac ${SACLAR.join("|")} olmalı`);
    for (const r of ["ten", "sacRengi", "gozRengi", "ust", "alt"]) if (!/^#[0-9a-f]{6}$/i.test(g[r] ?? "")) h.push(`karakter ${id}: ${r} #rrggbb olmalı`);
  }
  if (!B) return h;
  for (const a of ["baslik", "aciklama", "soru"]) if (!B[a]) h.push(`bölüm: ${a} eksik`);
  if (!Array.isArray(B.sahneler) || !B.sahneler.length) h.push("bölüm: sahneler boş");
  const var_ = (id) => id in (D.karakterler ?? {});
  (B.sahneler ?? []).forEach((s, si) => {
    const yer = `sahne ${si + 1}`;
    if (!MEKANLAR.includes(s.mekan)) h.push(`${yer}: mekan ${MEKANLAR.join("|")} olmalı`);
    const sahnede = new Set(Object.keys(s.oyuncular ?? {}));
    for (const [id, o] of Object.entries(s.oyuncular ?? {})) {
      if (!var_(id)) h.push(`${yer}: ${id} dizi.json'da yok`);
      if (typeof o.x !== "number") h.push(`${yer}: ${id}.x sayı olmalı`);
      if (o.duygu && !DUYGULAR.includes(o.duygu)) h.push(`${yer}: ${id}.duygu "${o.duygu}" geçersiz`);
      if (o.poz && !POZLAR.includes(o.poz)) h.push(`${yer}: ${id}.poz "${o.poz}" geçersiz`);
    }
    (s.cekimler ?? []).forEach((c, ci) => {
      const y = `${yer} çekim ${ci + 1}`;
      for (const [id, o] of Object.entries(c.oyuncular ?? {})) {
        sahnede.add(id);
        if (!var_(id)) h.push(`${y}: ${id} dizi.json'da yok`);
        if (o.duygu && !DUYGULAR.includes(o.duygu)) h.push(`${y}: ${id}.duygu "${o.duygu}" geçersiz`);
        if (o.poz && !POZLAR.includes(o.poz)) h.push(`${y}: ${id}.poz "${o.poz}" geçersiz`);
      }
      if (c.kim && !sahnede.has(c.kim)) h.push(`${y}: konuşan ${c.kim} sahnede yok`);
      if (c.kim && !c.soz) h.push(`${y}: kim var ama soz yok`);
      if (c.duygu && !DUYGULAR.includes(c.duygu)) h.push(`${y}: duygu "${c.duygu}" geçersiz`);
      if (c.poz && !POZLAR.includes(c.poz)) h.push(`${y}: poz "${c.poz}" geçersiz`);
      if (c.kamera) {
        if (!KAMERALAR.includes(c.kamera.tip)) h.push(`${y}: kamera.tip ${KAMERALAR.join("|")} olmalı`);
        if (c.kamera.hedef && !sahnede.has(c.kamera.hedef)) h.push(`${y}: kamera hedefi ${c.kamera.hedef} sahnede yok`);
        if (c.kamera.tip === "iki" && !c.kamera.hedef2) h.push(`${y}: "iki" çekimi hedef2 ister`);
      }
      if (c.soz && c.soz.length > 120) h.push(`${y}: replik çok uzun (${c.soz.length} harf) — Reels için ≤ 90 harf, gerekirse ikiye böl`);
    });
  });
  return h;
};
