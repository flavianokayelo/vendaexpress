import { Tag } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import type { Category } from '../../lib/types';

export function CategoryGrid({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className="group flex flex-col items-center gap-2 rounded-[var(--sf-radius-lg)] border border-[var(--sf-line)] bg-[var(--sf-surface)] p-4 text-center transition-all hover:-translate-y-1 hover:shadow-soft"
        >
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--sf-surface-muted)] text-[var(--sf-primary)]">
            {c.icon_url ? (
              <img src={resolveMediaUrl(c.icon_url) ?? ''} alt={c.name} className="h-full w-full object-cover" />
            ) : (
              <Tag size={20} />
            )}
          </div>
          <span className="line-clamp-2 text-xs font-medium text-[var(--sf-ink)]">{c.name}</span>
        </button>
      ))}
    </div>
  );
}
