import { loadFont } from "@remotion/google-fonts/Lora";

// Referanstaki gibi kalın, tırnaklı (serif) altyazı yazısı
const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });
export const ALTYAZI_FONT = `${fontFamily}, Georgia, serif`;
