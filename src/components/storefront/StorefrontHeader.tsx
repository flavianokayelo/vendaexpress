import { ArrowLeft, Search, Heart, ShoppingCart } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import { Input } from '../ui/Field';
import type { Store } from '../../lib/types';

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold text-white">
      {n > 9 ? '9+' : n}
    </span>
  );
}

export function StorefrontHeader({
  store,
  accent,
  search,
  onSearchChange,
  cartCount,
  onCartClick,
  wishlistCount,
  onWishlistClick,
  onBack,
}: {
  store: Store;
  accent: string;
  search: string;
  onSearchChange: (v: string) => void;
  cartCount: number;
  onCartClick: () => void;
  wishlistCount: number;
  onWishlistClick: () => void;
  onBack: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onBack} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            <ArrowLeft size={18} />
          </button>

          {store.logo_url ? (
            <img src={resolveMediaUrl(store.logo_url) ?? ''} alt={store.name} className="h-9 w-9 flex-shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white font-bold" style={{ backgroundColor: accent }}>
              {store.name[0]}
            </div>
          )}

          <div className="min-w-0 flex-1 sm:flex-none">
            <div className="truncate font-bold text-slate-900">{store.name}</div>
            <div className="hidden text-xs text-slate-500 sm:block">{store.slug}.vendaexpress.ao</div>
          </div>

          {/* Pesquisa — em desktop fica aqui, no header, entre o nome e as ações */}
          <div className="relative ml-auto hidden max-w-sm flex-1 sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" placeholder="Procurar produtos..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </div>

          <button onClick={onWishlistClick} className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
            <Heart size={20} />
            {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
          </button>

          <button onClick={onCartClick} className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
            <ShoppingCart size={20} />
            {cartCount > 0 && <CountBadge n={cartCount} />}
          </button>
        </div>

        {/* Pesquisa — em mobile fica numa linha própria por baixo, para não apertar o header */}
        <div className="relative mt-2 sm:hidden">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="w-full pl-9" placeholder="Procurar produtos..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
      </div>
    </header>
  );
}