import { Tag } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import type { Category } from '../../lib/types';

/** Fila densa de ícones de categoria, tipo Shopee — ícone pequeno + rótulo,
 * sem cards grandes com borda/sombra. */
export function CategoryGrid({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 md:grid-cols-8">
      {categories.slice(0, 16).map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--sf-surface-muted)] text-[var(--sf-ink-secondary)] sm:h-14 sm:w-14">
            {c.icon_url ? (
              <img src={resolveMediaUrl(c.icon_url) ?? ''} alt={c.name} className="h-full w-full object-cover" />
            ) : (
              <Tag size={20} strokeWidth={1.6} />
            )}
          </span>
          <span className="line-clamp-2 text-[11px] leading-tight text-[var(--sf-ink)]">{c.name}</span>
        </button>
      ))}
    </div>
  );
}
