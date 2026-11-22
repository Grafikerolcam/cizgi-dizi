// Dizi ve bölüm veri tipleri.
// diziler/<dizi>/dizi.json  → Dizi (karakterler, sesler, hesap adı)
// diziler/<dizi>/bolum-XX.json → Bolum (sahneler, çekimler, replikler)
// scripts/seslendir.mjs ikisini birleştirip public/diziler/<dizi>/<bolum>/data.json (BolumData) üretir.

export type Duygu =
  | "normal"
  | "mutlu"
  | "uzgun"
  | "aglama"
  | "korku"
  | "kizgin"
  | "saskin"
  | "sersem"
  | "supheli"
  | "utangac";

export type Poz =
  | "ayakta"
  | "oturuyor"
  | "basini-tutuyor"
  | "kollari-bagli"
  | "isaret"
  | "koruyor" // bir kolunu yana açmış, arkasındakini koruyor
  | "eller-agizda"
  | "el-salliyor";

export type SacStili = "kisa" | "dagnik" | "uzun" | "orgu" | "topuz" | "at-kuyrugu" | "kel" | "basortusu";

export type Gorunum = {
  yas: "cocuk" | "genc" | "yetiskin" | "yasli";
  cinsiyet: "kadin" | "erkek";
  ten: string;
  sac: SacStili;
  sacRengi: string;
  gozRengi: string;
  ust: string; // üst giysi rengi
  alt: string; // pantolon/etek rengi
  etek?: boolean;
  elbise?: boolean; // tek parça elbise (ust rengi kullanılır)
  desen?: "yok" | "puantiye" | "cizgili" | "ekose";
  yaka?: boolean;
  sakal?: "yok" | "biyik" | "kirli" | "sakal";
  gozluk?: boolean;
  ayakkabi?: string;
  kisaKol?: boolean;
  boy?: number; // 1 = varsayılan (yaşa göre)
};

export type Karakter = {
  ad: string; // ekranda / caption'da görünen ad
  gorunum: Gorunum;
  ses: { id: string; perde?: number; hiz?: number; stabilite?: number };
};

export type Dizi = {
  ad: string;
  hesap: string; // @kullanici
  karakterler: Record<string, Karakter>;
};

export type Mekan = "salon" | "yatak-odasi" | "mutfak" | "sokak" | "hastane" | "ofis";
export type Zaman = "gunduz" | "gece";

export type OyuncuDurum = {
  x: number; // 0..1080 dünya koordinatı (ayak ortası)
  duygu?: Duygu;
  poz?: Poz;
  yon?: "sag" | "sol"; // baktığı yön
  derinlik?: number; // 0 = ön (büyük), 1 = arka (küçük)
  otur?: boolean; // koltuğa/yatağa/sandalyeye oturuyor
  gizli?: boolean; // sahnede ama görünmüyor
};

export type KameraTip = "genis" | "orta" | "yakin" | "cok-yakin" | "iki";

export type Kamera = {
  tip: KameraTip;
  hedef?: string; // karakter id; "iki" için hedef + hedef2
  hedef2?: string;
  hareket?: "it" | "cek" | "sabit" | "titrek"; // yavaş zoom içeri/dışarı
};

export type Cekim = {
  kim?: string; // konuşan; yoksa sessiz tepki çekimi
  soz?: string; // altyazı + seslendirme metni
  duygu?: Duygu; // konuşanın duygusu (kısayol: oyuncular[kim].duygu)
  poz?: Poz; // konuşanın pozu
  ton?: string; // ElevenLabs v3 ses etiketi (ör. "[crying]"); yoksa duygudan türetilir
  sure?: number; // sessiz çekim süresi (saniye) ya da replik sonrası ek bekleme
  kamera?: Kamera;
  oyuncular?: Record<string, Partial<OyuncuDurum>>; // sahne durumunu bu çekimden itibaren değiştirir
  efekt?: "flas" | "karar" | "sarsinti" | "yok"; // geçiş/vurgu
};

export type Sahne = {
  mekan: Mekan;
  zaman?: Zaman;
  zengin?: boolean; // konak / lüks varyant
  oyuncular: Record<string, OyuncuDurum>;
  cekimler: Cekim[];
};

export type Bolum = {
  no: number;
  baslik: string; // "Bölüm 1 · Uyandığımda karım benden korkuyordu…"
  aciklama: string; // caption gövdesi
  soru: string; // yorum sorusu
  etiketler: string[];
  kanca?: string; // açılışta ekrana basılan büyük yazı (isteğe bağlı)
  sahneler: Sahne[];
};

// ---- render verisi ----
export type CekimData = {
  bas: number; // saniye
  son: number;
  mekan: Mekan;
  zaman: Zaman;
  zengin: boolean;
  oyuncular: Record<string, Required<Pick<OyuncuDurum, "x" | "duygu" | "poz" | "yon" | "derinlik" | "otur" | "gizli">>>;
  kamera: Kamera;
  kim?: string;
  soz?: string;
  ses?: string; // public/ altına göre
  sesBas?: number; // replik sesinin çekim içindeki başlangıcı
  env?: number[]; // kare başına 0..1 ağız açıklığı
  efekt?: Cekim["efekt"];
  sahneNo: number;
};

export type BolumData = {
  fps: number;
  sure: number;
  dizi: string;
  hesap: string;
  baslik: string;
  kanca?: string;
  karakterler: Record<string, Gorunum>;
  cekimler: CekimData[];
  muzik?: string;
};

export type BolumProps = { dizi: string; bolum: string; data?: BolumData };
