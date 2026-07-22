export function formatCurrency(value: number, currency = 'AOA'): string {
  const symbol = currency === 'AOA' ? 'Kz' : currency;
  return `${Number(value).toLocaleString('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${symbol}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-AO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const PLACEHOLDER_SEEDS = ['store', 'shop', 'product', 'market', 'commerce'];

export function placeholderImage(seed: string, w = 600, h = 600): string {
  const s = encodeURIComponent(seed || PLACEHOLDER_SEEDS[Math.floor(Math.random() * PLACEHOLDER_SEEDS.length)]);
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}
