import type { ReactNode } from 'react';
import { ImageCard } from '../product/ImageCard';
import type { Product } from '../../lib/types';

export function ProductSection({
  title,
  icon,
  products,
  currency,
  accent,
  onAdd,
  onView,
  isWishlisted,
  onToggleWishlist,
  dark,
}: {
  title: string;
  icon: ReactNode;
  products: Product[];
  currency?: string;
  accent: string;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: (id: string) => boolean;
  onToggleWishlist?: (p: Product) => void;
  dark?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <div className={dark ? 'bg-slate-900 py-6' : 'py-6'}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-4 flex items-center gap-2">
          {icon}
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth">
          {products.map((p) => (
            <div key={p.id} className="w-40 flex-shrink-0 snap-start sm:w-56">
              <ImageCard
                p={p}
                currency={currency}
                accent={accent}
                onAdd={onAdd}
                onView={onView}
                isWishlisted={isWishlisted?.(p.id)}
                onToggleWishlist={onToggleWishlist}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}