export type ColorSwatch = { name: string; hex: string };

export const COLOR_PALETTE: ColorSwatch[] = [
  { name: 'Preto', hex: '#111111' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Cinza', hex: '#9CA3AF' },
  { name: 'Vermelho', hex: '#EF4444' },
  { name: 'Laranja', hex: '#F97316' },
  { name: 'Amarelo', hex: '#EAB308' },
  { name: 'Verde', hex: '#22C55E' },
  { name: 'Azul', hex: '#3B82F6' },
  { name: 'Azul-marinho', hex: '#1E3A8A' },
  { name: 'Roxo', hex: '#8B5CF6' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Castanho', hex: '#92400E' },
  { name: 'Bege', hex: '#D6C7A1' },
  { name: 'Dourado', hex: '#D4AF37' },
  { name: 'Prateado', hex: '#C0C0C0' },
  { name: 'Vinho', hex: '#7F1D1D' },
  { name: 'Turquesa', hex: '#14B8A6' },
  { name: 'Creme', hex: '#F5F0E6' },
];

// Cores claras onde um ícone branco fica ilegível — usamos ícone escuro nesses casos
export const LIGHT_HEXES = new Set(['#FFFFFF', '#EAB308', '#D6C7A1', '#F5F0E6', '#C0C0C0']);

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const bigint = parseInt(full, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// Encontra a cor da paleta mais próxima de um hex arbitrário (distância euclidiana no RGB)
export function nearestColorName(hex: string): ColorSwatch {
  const [r, g, b] = hexToRgb(hex);
  let closest = COLOR_PALETTE[0];
  let minDist = Infinity;
  for (const c of COLOR_PALETTE) {
    const [cr, cg, cb] = hexToRgb(c.hex);
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = c;
    }
  }
  return closest;
}

export function findColorByName(name: string): ColorSwatch | undefined {
  return COLOR_PALETTE.find((c) => c.name.toLowerCase() === name.toLowerCase().trim());
}