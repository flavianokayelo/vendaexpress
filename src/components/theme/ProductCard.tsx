import { Flame, Heart } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency, placeholderImage } from '../../lib/format';
import { Badge } from '../ui/Badge';
import type { Product } from '../../lib/types';

const CONDITION_LABEL: Record<string, string> = {
  novo: 'Novo',
  usado: 'Usado',
  recondicionado: 'Recondicionado',
};

function productThumb(p: Product) {
  return resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) || placeholderImage(p.name);
}

export function ProductCard({
  p,
  currency,
  categoryName,
  index,
  onAdd,
  onView,
  isWishlisted,
  onToggleWishlist,
}: {
  p: Product;
  currency?: string;
  categoryName?: string;
  /** Posição na grelha — usado só para escalonar a animação de entrada. */
  index?: number;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: Product) => void;
}) {
  const isPromo = p.compare_at_price && Number(p.compare_at_price) > Number(p.price);
  const outOfStock = p.stock <= 0;
  const lowStock = !outOfStock && p.stock > 0 && p.stock <= 5;
  const staggerDelay = index !== undefined ? `${Math.min(index, 7) * 0.06}s` : undefined;

  return (
    <div
      className={`animate-sf-fade-up group flex w-full flex-col overflow-hidden rounded-[10px] border border-[var(--sf-line)] bg-[var(--sf-surface)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] ${onView ? 'cursor-pointer' : ''}`}
      style={staggerDelay ? { animationDelay: staggerDelay } : undefined}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-square overflow-hidden bg-[#F8F9FB] p-6">
        <img
          src={productThumb(p)}
          alt={p.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.06]"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isPromo && (
            <Badge color="red">
              <Flame size={12} className="mr-1 inline" />
              Promoção
            </Badge>
          )}
          {outOfStock && <Badge color="slate">Esgotado</Badge>}
          {lowStock && <Badge color="amber">Só {p.stock} un.</Badge>}
          {p.item_condition && p.item_condition !== 'novo' && (
            <Badge color="amber">{CONDITION_LABEL[p.item_condition]}</Badge>
          )}
        </div>
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-colors ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-500 hover:text-red-500'
            }`}
            title={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-3 pb-2 pt-3">
        {categoryName && (
          <span className="text-[11px] uppercase tracking-[0.04em] text-[#9CA3AF]">{categoryName}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-[1.35] text-[var(--sf-ink)]">{p.name}</h3>
        {p.color && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--sf-ink-secondary)]">
            <span
              className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10"
              style={{ backgroundColor: p.color_hex || '#ccc', boxShadow: '0 0 0 1.5px #fff' }}
            />
            {p.color}
          </p>
        )}
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-mono text-lg font-bold text-[var(--sf-ink)]">{formatCurrency(Number(p.price), currency)}</span>
          {isPromo && (
            <span className="font-mono text-xs text-[#9CA3AF] line-through">
              {formatCurrency(Number(p.compare_at_price), currency)}
            </span>
          )}
        </div>
      </div>
      <div className="px-3 pb-3.5 pt-1">
        <button
          type="button"
          disabled={outOfStock}
          onClick={(e) => { e.stopPropagation(); onAdd(p); }}
          className="w-full rounded-[8px] border border-[var(--sf-primary)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--sf-primary)] transition-colors hover:bg-[var(--sf-primary)] hover:text-white disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300 disabled:hover:bg-white"
        >
          {outOfStock ? 'Indisponível' : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}
