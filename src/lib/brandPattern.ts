// Gera um padrão abstrato determinístico a partir do slug da loja — mesma
// loja gera sempre o mesmo padrão, lojas diferentes nunca colidem. Usado
// como hero de fallback (em vez de foto de stock genérica) quando a loja
// ainda não tem banners próprios.

function hashSeed(str: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967295;
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const v = hex.replace("#", "");
  return {
    r: parseInt(v.substring(0, 2), 16),
    g: parseInt(v.substring(2, 4), 16),
    b: parseInt(v.substring(4, 6), 16),
  };
}

/** Gera a imagem (data URL PNG) do padrão de marca para uma loja. */
export function generateBrandPatternDataUrl(
  seed: string,
  color: string,
  width = 800,
  height = 500,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const rgb = hexToRgb(color);
  const darker = `rgb(${Math.round(rgb.r * 0.6)}, ${Math.round(rgb.g * 0.6)}, ${Math.round(rgb.b * 0.6)})`;
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, color);
  grad.addColorStop(1, darker);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const rand = hashSeed(seed);
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";

  const shapeCount = 16 + Math.floor(rand() * 10);
  for (let i = 0; i < shapeCount; i++) {
    const kind = rand();
    const x = rand() * width;
    const y = rand() * height;
    const size = 24 + rand() * 90;

    if (kind < 0.4) {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind < 0.75) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.lineWidth = 2 + rand() * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size * (rand() - 0.5), y + size * (rand() - 0.5));
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/png");
}
