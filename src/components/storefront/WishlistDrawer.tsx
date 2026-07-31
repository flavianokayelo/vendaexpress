import { X, Heart, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useWishlist } from '../../lib/wishlist';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency, placeholderImage } from '../../lib/format';
import { EmptyState } from '../ui/Feedback';
import { Button } from '../ui/Button';
import type { Product } from '../../lib/types';

function thumb(p: Product) {
  return resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) || placeholderImage(p.name);
}

export function WishlistDrawer({ currency, accent, onAdd }: { currency?: string; accent: string; onAdd: (p: Product) => void }) {
  const { wishlist, wishlistOpen, setWishlistOpen, toggleWishlist } = useWishlist();

  return (
    <AnimatePresence>
      {wishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setWishlistOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="relative h-full w-full max-w-md bg-[var(--sf-surface)] shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
        <div className="flex items-center justify-between border-b border-[var(--sf-line)] px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-[var(--sf-ink)]">Favoritos</h2>
          <button onClick={() => setWishlistOpen(false)} className="rounded-lg p-1 text-[var(--sf-ink-secondary)] hover:bg-[color-mix(in_srgb,var(--sf-ink)_6%,transparent)]"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto p-5" style={{ height: 'calc(100% - 64px)' }}>
          {wishlist.length === 0 ? (
            <EmptyState icon={<Heart size={28} />} title="Sem favoritos" description="Guarda produtos que gostares para veres depois." />
          ) : (
            <div className="space-y-3">
              {wishlist.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-[var(--sf-radius-md)] border border-[var(--sf-line)] p-3">
                  <img src={thumb(p)} alt={p.name} className="h-14 w-14 rounded-[var(--sf-radius-sm)] object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[var(--sf-ink)]">{p.name}</div>
                    <div className="text-xs text-[var(--sf-ink-secondary)]">{formatCurrency(Number(p.price), currency)}</div>
                  </div>
                  <button onClick={() => toggleWishlist(p)} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Remover">
                    <Heart size={16} fill="currentColor" />
                  </button>
                  <Button size="sm" onClick={() => onAdd(p)} style={{ backgroundColor: accent, borderColor: accent }}>
                    <Plus size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}