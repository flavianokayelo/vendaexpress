// Extrai a cor mais vibrante e representativa de uma imagem de logo, para usar
// como sugestão automática de theme_primary — cada loja fica com uma cor
// diferente sem o lojista precisar de escolher manualmente.

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    default: h = ((rn - gn) / d + 4) / 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem"));
    };
    img.src = url;
  });
}

/**
 * Devolve a cor dominante e vibrante de uma imagem (hex), ou null se a
 * imagem for essencialmente monocromática (preto/branco/cinza) — nesse
 * caso não há cor útil para extrair e o chamador deve manter o que já tinha.
 */
export async function extractDominantColor(file: File): Promise<string | null> {
  const img = await loadImage(file);
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    // getImageData falha em canvas "tainted" (imagem de outra origem sem CORS) —
    // sem forma de ler pixels nesse caso.
    return null;
  }

  const HUE_BUCKETS = 24;
  const buckets: { count: number; r: number; g: number; b: number }[] = Array.from(
    { length: HUE_BUCKETS },
    () => ({ count: 0, r: 0, g: 0, b: 0 }),
  );

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue; // transparente — não é "cor" real do logo
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 0.18 || l < 0.1 || l > 0.92) continue; // cinza/preto/branco quase puro
    const bucket = Math.min(HUE_BUCKETS - 1, Math.floor(h * HUE_BUCKETS));
    buckets[bucket].count += 1;
    buckets[bucket].r += r;
    buckets[bucket].g += g;
    buckets[bucket].b += b;
  }

  const best = buckets.reduce((a, b) => (b.count > a.count ? b : a), buckets[0]);
  if (best.count < 4) return null; // logo praticamente sem cor (p/b, cinza)

  const avgR = best.r / best.count, avgG = best.g / best.count, avgB = best.b / best.count;
  const [h, s] = rgbToHsl(avgR, avgG, avgB);

  // Normaliza saturação/luminosidade para uma cor de UI útil (nem lavada, nem escura demais).
  const uiSaturation = Math.min(0.8, Math.max(0.55, s));
  const uiLightness = 0.46;
  const [r, g, b] = hslToRgb(h, uiSaturation, uiLightness);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
