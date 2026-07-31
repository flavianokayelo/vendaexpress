import { ChevronRight, Tag } from 'lucide-react';
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
      {categories.slice(0, 6).map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className="group flex items-center gap-[20px] overflow-hidden rounded-[16px] border border-[var(--sf-line)] bg-[var(--sf-surface)] p-[20px] text-left shadow-[0_2px_6px_rgba(29,31,32,0.04)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_30px_rgba(29,31,32,0.12)]"
        >
          <span className="flex h-[86px] w-[86px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[var(--sf-surface-muted)] text-[var(--sf-accent)]">
            {c.icon_url ? (
              <img
                src={resolveMediaUrl(c.icon_url) ?? ''}
                alt={c.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
              />
            ) : (
              <Tag size={28} strokeWidth={1.6} />
            )}
          </span>
          <span className="flex flex-col gap-1.5">
            <span className="font-display text-[22px] font-semibold leading-tight tracking-[-0.01em] text-[var(--sf-ink)]">
              {c.name}
            </span>
            <span className="flex items-center gap-1 text-[13px] text-[var(--sf-ink-secondary)]">
              Ver produtos
              <ChevronRight
                size={15}
                className="-ml-1 text-[var(--sf-accent)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
