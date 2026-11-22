# Çizgi Dizi 🎬

Instagram Reels / TikTok için **yapay zekâ seslendirmeli 2D çizgi dram dizisi** üretici.

Yassı karakterler, kalın kontur, gözyaşı ve şaşkınlık ifadeleri, tırnaklı (serif) altyazı, "Bölüm N · …" başlığı ve sonda "Devamı için takipte kalın 🔔".

- Senaryoyu JSON olarak yazarsın: sahneler, karakterler, replikler, duygular ve kamera.
- Her karakter **ElevenLabs** ile kendi sesinde konuşur. Duygu, sesin tonunu da belirler: ağlarken `[crying]`, kızgınken `[angry]`.
- Ağız hareketi sesten çıkarılır, göz kırpma ve nefes otomatik gelir.
- Kamera geniş, orta, yakın ve çok yakın planlar arasında geçer; yavaş zoom, sarsıntı ve flaş efektleri var.
- Açıklama metni (`caption.txt`) otomatik hazırlanır.

## Kurulum

```bash
npm install
cp .env.example .env   # ELEVENLABS_API_KEY=...
```

Gerekenler: Node 20+ ve PATH'te `ffmpeg` / `ffprobe` (`rubberband` filtresiyle).

## Kullanım

```bash
npm run kontrol   -- ornek-konak            # dosyaları doğrula, süre ve kredi tahmini (ücretsiz)
npm run seslendir -- ornek-konak bolum-01   # ElevenLabs seslendirme + zamanlama
npm run render    -- ornek-konak bolum-01   # out/…mp4 + caption.txt + kapak.png (Instagram kapağı)
npm run dev                                 # Remotion Studio (Bolum ve Vitrin kompozisyonları)
```

## Yapı

```
diziler/<dizi>/dizi.json        karakterler (görünüm + ses), hesap adı
diziler/<dizi>/bolum-01.json    sahneler, çekimler, replikler
src/karakter/Karakter.tsx       SVG karakter (yaş, saç, giysi, 10 duygu, 8 poz)
src/mekan/Mekan.tsx             salon, yatak odası, mutfak, sokak, hastane, ofis (gündüz/gece, zengin varyant)
src/Bolum.tsx                   kamera, altyazı, filigran, kanca, son kart
src/Kapak.tsx                   Instagram kapak görseli (dizi adı + BÖLÜM N)
src/Profil.tsx                  Instagram profil fotoğrafı (tüplü TV + ağlayan kahraman)
scripts/seslendir.mjs           TTS → ağız zarfı → data.json + caption.txt
scripts/kontrol.mjs             doğrulama + süre/kredi tahmini
skill/SKILL.md                  Claude Code skill'i (format referansı)
skill/senaryo-rehberi.md        tutan Türk dizisi kalıpları → ~3 dk bölüm yapısı
```

Ayrıntılı format için [`skill/SKILL.md`](skill/SKILL.md), senaryo için [`skill/senaryo-rehberi.md`](skill/senaryo-rehberi.md) dosyalarına bak.

## Claude Code skill'i

```bash
mkdir -p ~/.claude/skills/cizgi-dizi && cp skill/*.md ~/.claude/skills/cizgi-dizi/
```

Sonra Claude Code'a "çizgi dizi için yeni bölüm yaz: kayınvalide kalıbı" demen yeterli.

## Lisans

MIT. Örnek dizi ("Kimin Kızıyım?") özgündür. Üretilen ses ve videolar repoya girmez.
