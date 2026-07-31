import { Check, Heart, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency, placeholderImage } from '../../lib/format';
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
  const discountPct = isPromo ? Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100) : 0;
  const outOfStock = p.stock <= 0;
  const lowStock = !outOfStock && p.stock > 0 && p.stock <= 5;
  const staggerDelay = index !== undefined ? `${Math.min(index, 7) * 0.06}s` : undefined;

  const [justAdded, setJustAdded] = useState(false);
  const addTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(addTimer.current), []);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(p);
    setJustAdded(true);
    window.clearTimeout(addTimer.current);
    addTimer.current = window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className={`animate-sf-fade-up group flex w-full flex-col overflow-hidden rounded-[16px] border border-[var(--sf-line)] bg-[var(--sf-surface)] shadow-[0_2px_6px_rgba(29,31,32,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(29,31,32,0.13)] ${onView ? 'cursor-pointer' : ''}`}
      style={staggerDelay ? { animationDelay: staggerDelay } : undefined}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--sf-surface-muted)]">
        <img
          src={productThumb(p)}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
        />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {isPromo && (
            <span className="rounded-[var(--sf-radius-pill)] bg-[var(--sf-danger)] px-[9px] py-1 font-display text-[12px] font-semibold leading-none tracking-[0.02em] text-white">
              −{discountPct}%
            </span>
          )}
          {outOfStock && (
            <span className="rounded-[var(--sf-radius-pill)] bg-[#e9edf2] px-[9px] py-1 font-display text-[12px] font-semibold leading-none tracking-[0.02em] text-[#1d1f20]/70">
              Esgotado
            </span>
          )}
          {lowStock && (
            <span className="rounded-[var(--sf-radius-pill)] bg-[#fbe8c6] px-[9px] py-1 font-display text-[12px] font-semibold leading-none tracking-[0.02em] text-[#8a5300]">
              Só {p.stock} un.
            </span>
          )}
          {p.item_condition && p.item_condition !== 'novo' && (
            <span className="rounded-[var(--sf-radius-pill)] bg-[#e9edf2] px-[9px] py-1 font-display text-[12px] font-semibold leading-none tracking-[0.02em] text-[var(--sf-accent)]">
              {CONDITION_LABEL[p.item_condition]}
            </span>
          )}
        </div>
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[var(--sf-radius-pill)] border border-[var(--sf-line)] bg-white text-[var(--sf-ink)] shadow-[0_1px_3px_rgba(29,31,32,0.1)] transition-transform hover:scale-[1.08] ${
              isWishlisted ? 'text-[var(--sf-danger)]' : ''
            }`}
            title={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={17} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {categoryName && (
          <span className="text-[11px] uppercase tracking-[0.07em] text-[var(--sf-ink-secondary)]">
            {categoryName}
          </span>
        )}
        <h3 className="line-clamp-2 font-display text-[18px] font-semibold leading-[1.2] tracking-[-0.01em] text-[var(--sf-ink)]">
          {p.name}
        </h3>
        {p.color && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--sf-ink-secondary)]">
            <span
              className="h-[11px] w-[11px] rounded-[var(--sf-radius-pill)] border border-[var(--sf-line)]"
              style={{ backgroundColor: p.color_hex || '#ccc' }}
            />
            {p.color}
          </p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span
            className={`font-display text-[24px] font-semibold leading-none tracking-[0.01em] [font-feature-settings:'tnum'_1] ${
              isPromo ? 'text-[#c93b33]' : 'text-[var(--sf-ink)]'
            }`}
          >
            {formatCurrency(Number(p.price), currency)}
          </span>
          {isPromo && (
            <span className="text-[13px] text-[var(--sf-ink-secondary)] line-through [font-feature-settings:'tnum'_1]">
              {formatCurrency(Number(p.compare_at_price), currency)}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={outOfStock || justAdded}
          onClick={handleAdd}
          className={`mt-3 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] px-4 font-display text-[15px] font-semibold transition-all ${
            justAdded
              ? 'border border-[var(--sf-success)] bg-[var(--sf-success)] text-white'
              : outOfStock
                ? 'cursor-not-allowed border border-slate-300 bg-slate-200 text-slate-400'
                : 'border border-[var(--sf-accent)] bg-[var(--sf-accent)] text-white shadow-[0_2px_10px_rgba(29,31,32,0.12)] hover:-translate-y-[1px] hover:bg-[var(--sf-accent)]/85 hover:shadow-[0_6px_18px_rgba(29,31,32,0.16)]'
          }`}
        >
          {outOfStock ? (
            'Indisponível'
          ) : justAdded ? (
            <>
              <Check size={16} strokeWidth={2} />
              Adicionado
            </>
          ) : (
            <>
              <ShoppingCart size={16} strokeWidth={1.6} />
              Adicionar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
