import { Flame, Plus, Heart } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency, placeholderImage } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Product } from '../../lib/types';

const CONDITION_LABEL: Record<string, string> = {
  novo: 'Novo',
  usado: 'Usado',
  recondicionado: 'Recondicionado',
};

function productThumb(p: Product) {
  return resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) || placeholderImage(p.name);
}

export function ImageCard({
  p,
  currency,
  accent,
  onAdd,
  onView,
  isWishlisted,
  onToggleWishlist,
}: {
  p: Product;
  currency?: string;
  accent: string;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: Product) => void;
}) {
  const isPromo = p.compare_at_price && Number(p.compare_at_price) > Number(p.price);

  return (
    <div
      className={`group flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg ${onView ? 'cursor-pointer' : ''}`}
      onClick={() => onView?.(p)}
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={productThumb(p)}
          alt={p.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isPromo && (
            <Badge color="red">
              <Flame size={12} className="mr-1 inline" />
              Promoção
            </Badge>
          )}
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
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-1">{p.name}</h3>
        {p.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{p.description}</p>}
        {p.color && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10"
              style={{ backgroundColor: p.color_hex || '#ccc', boxShadow: '0 0 0 1.5px #fff' }}
            />
            {p.color}
          </p>
        )}
        <div className="mt-3 flex flex-1 items-end justify-between gap-2">
          <div>
            <div className="font-bold text-slate-900">{formatCurrency(Number(p.price), currency)}</div>
            {isPromo && (
              <div className="text-xs text-slate-400 line-through">
                {formatCurrency(Number(p.compare_at_price), currency)}
              </div>
            )}
          </div>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onAdd(p); }} style={{ backgroundColor: accent, borderColor: accent }}>
            <Plus size={14} /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}