import { Check, Plus, Heart } from 'lucide-react';
import { motion } from 'motion/react';
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
  compact,
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
  /** Esconde nome/categoria — usado nas calhas estreitas (ex: Ofertas relâmpago). */
  compact?: boolean;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: Product) => void;
}) {
  const isPromo = p.compare_at_price && Number(p.compare_at_price) > Number(p.price);
  const discountPct = isPromo ? Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100) : 0;
  const outOfStock = p.stock <= 0;
  const lowStock = !outOfStock && p.stock > 0 && p.stock <= 5;
  const hasCondition = p.item_condition && p.item_condition !== 'novo';
  const staggerDelay = index !== undefined ? Math.min(index % 6, 5) * 0.04 : 0;

  const [justAdded, setJustAdded] = useState(false);
  const addTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(addTimer.current), []);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAdd(p);
    setJustAdded(true);
    window.clearTimeout(addTimer.current);
    addTimer.current = window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.div
      className={`group flex w-full flex-col overflow-hidden rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)] bg-[var(--sf-surface)] transition-[transform,box-shadow] duration-150 hover:-translate-y-[2px] hover:border-[var(--sf-primary)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] ${onView ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: staggerDelay }}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--sf-surface-muted)]">
        <img
          src={productThumb(p)}
          alt={p.name}
          className={`h-full w-full object-cover ${outOfStock ? 'opacity-40' : ''}`}
        />
        {hasCondition && (
          <span className="absolute left-0 top-1.5 rounded-r-[3px] bg-[var(--sf-primary)] px-1.5 py-[3px] text-[10px] font-bold leading-none text-white">
            {CONDITION_LABEL[p.item_condition]}
          </span>
        )}
        {isPromo && (
          <span
            className="absolute right-0 top-0 rounded-bl-[6px] px-[5px] py-[2px] text-[11px] font-extrabold leading-none"
            style={{ background: 'color-mix(in srgb, var(--sf-primary) 12%, white)', color: 'var(--sf-primary)' }}
          >
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="rounded-[2px] bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">Esgotado</span>
          </span>
        )}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }}
            className={`absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-[var(--sf-ink-secondary)] ${
              isWishlisted ? 'text-[var(--sf-danger)]' : ''
            }`}
            title={isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={12} strokeWidth={2} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
        {!outOfStock && (
          <motion.button
            type="button"
            disabled={justAdded}
            onClick={handleAdd}
            whileTap={{ scale: 0.85 }}
            className={`absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] ${
              justAdded ? 'bg-[var(--sf-success)]' : 'bg-[var(--sf-primary)]'
            }`}
            title="Adicionar ao carrinho"
          >
            {justAdded ? <Check size={13} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
          </motion.button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[3px] p-2">
        {!compact && categoryName && (
          <span className="truncate text-[10px] uppercase tracking-[0.03em] text-[var(--sf-ink-secondary)]">
            {categoryName}
          </span>
        )}
        {!compact && (
          <h3 className="line-clamp-2 min-h-[32px] text-[13px] font-normal leading-[1.25] text-[var(--sf-ink)]">
            {p.name}
          </h3>
        )}
        <div className={`flex items-baseline gap-1.5 ${compact ? '' : 'mt-auto pt-0.5'}`}>
          <span
            className={`text-[16px] font-semibold leading-none [font-feature-settings:'tnum'_1] ${
              isPromo ? 'text-[var(--sf-primary)]' : 'text-[var(--sf-ink)]'
            }`}
          >
            {formatCurrency(Number(p.price), currency)}
          </span>
          {isPromo && (
            <span className="truncate text-[11px] text-[var(--sf-ink-secondary)] line-through [font-feature-settings:'tnum'_1]">
              {formatCurrency(Number(p.compare_at_price), currency)}
            </span>
          )}
        </div>
        {lowStock && <span className="text-[10px] font-medium text-[var(--sf-warning)]">Só {p.stock} un.</span>}
      </div>
    </motion.div>
  );
}
