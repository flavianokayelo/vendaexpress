import { Check, Plus, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency, placeholderImage } from '../../lib/format';
import type { Product } from '../../lib/types';
import { useStorefrontTheme } from '../../storefrontTheme/ThemeProvider';
import type { CardHoverEffect, CardImageAspect, CardStyle } from '../../storefrontTheme/types';

const CONDITION_LABEL: Record<string, string> = {
  novo: 'Novo',
  usado: 'Usado',
  recondicionado: 'Recondicionado',
};

const CARD_STYLE_CLASS: Record<CardStyle, string> = {
  flat: 'border border-[var(--sf-line)] bg-[var(--sf-surface)]',
  bordered: 'border-2 border-[var(--sf-ink)] bg-[var(--sf-surface)]',
  'padded-tint': 'border border-[var(--sf-line)] bg-[var(--sf-surface-muted)]',
};

const CARD_HOVER_CLASS: Record<CardHoverEffect, string> = {
  lift: 'hover:-translate-y-[3px] hover:shadow-[var(--sf-shadow-lg)]',
  zoom: 'hover:shadow-[var(--sf-shadow-lg)]',
  none: '',
};

const CARD_ASPECT_CLASS: Record<CardImageAspect, string> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '3:2': 'aspect-[3/2]',
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
  const savings = isPromo ? Number(p.compare_at_price) - Number(p.price) : 0;
  const outOfStock = p.stock <= 0;
  const lowStock = !outOfStock && p.stock > 0 && p.stock <= 5;
  const hasCondition = p.item_condition && p.item_condition !== 'novo';
  const staggerDelay = index !== undefined ? Math.min(index % 6, 5) * 0.04 : 0;
  const { card } = useStorefrontTheme();
  const contentPadding = card.style === 'padded-tint' ? 'p-3' : 'p-2.5';

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
      className={`group relative flex w-full flex-col overflow-hidden rounded-[10px] shadow-[var(--sf-shadow-sm)] transition-[transform,box-shadow,border-color] duration-200 hover:border-[var(--sf-primary)] ${CARD_STYLE_CLASS[card.style]} ${CARD_HOVER_CLASS[card.hoverEffect]} ${onView ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: staggerDelay }}
      onClick={() => onView?.(p)}
    >
      <div className={`relative ${CARD_ASPECT_CLASS[card.imageAspect]} overflow-hidden bg-[var(--sf-surface-muted)]`}>
        <img
          src={productThumb(p)}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-300 ${card.hoverEffect === 'zoom' ? 'group-hover:scale-[1.06]' : ''} ${outOfStock ? 'opacity-40' : ''}`}
        />
        {hasCondition && (
          <span className="absolute left-0 top-1.5 rounded-r-[4px] bg-[var(--sf-ink)] px-1.5 py-[3px] text-[10px] font-bold leading-none text-white">
            {CONDITION_LABEL[p.item_condition]}
          </span>
        )}
        {isPromo && (
          <span className="absolute right-1.5 top-1.5 rounded-[5px] bg-[var(--sf-danger)] px-1.5 py-[3px] text-[11px] font-extrabold leading-none text-white shadow-[var(--sf-shadow-sm)]">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="rounded-[var(--sf-radius-sm)] bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">Esgotado</span>
          </span>
        )}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }}
            className={`absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[var(--sf-ink-secondary)] opacity-100 shadow-[var(--sf-shadow-sm)] transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 ${
              isWishlisted ? 'text-[var(--sf-danger)] sm:opacity-100' : ''
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
            className={`absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full text-white opacity-100 shadow-[var(--sf-shadow-sm)] transition-[opacity,box-shadow] duration-200 hover:shadow-[var(--sf-shadow-md)] sm:opacity-0 sm:group-hover:opacity-100 ${
              justAdded ? 'bg-[var(--sf-success)] sm:opacity-100' : 'bg-[var(--sf-primary)]'
            }`}
            title="Adicionar ao carrinho"
          >
            {justAdded ? <Check size={13} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
          </motion.button>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-1 ${contentPadding}`}>
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
        <div className={compact ? '' : 'mt-auto pt-0.5'}>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-[16.5px] font-bold leading-none tabular-nums ${
                isPromo ? 'text-[var(--sf-danger)]' : 'text-[var(--sf-ink)]'
              }`}
            >
              {formatCurrency(Number(p.price), currency)}
            </span>
            {isPromo && (
              <span className="truncate text-[11px] tabular-nums text-[var(--sf-ink-secondary)] line-through">
                {formatCurrency(Number(p.compare_at_price), currency)}
              </span>
            )}
          </div>
          {isPromo && !compact && (
            <span className="text-[10.5px] font-semibold tabular-nums text-[var(--sf-success)]">
              Poupa {formatCurrency(savings, currency)}
            </span>
          )}
        </div>
        {lowStock && <span className="text-[10px] font-medium text-[var(--sf-warning)]">Só {p.stock} un.</span>}
      </div>
    </motion.div>
  );
}
