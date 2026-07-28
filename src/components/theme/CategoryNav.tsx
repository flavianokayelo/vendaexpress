import type { Category } from '../../lib/types';

export function CategoryNav({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect('')}
        className={`flex-shrink-0 rounded-[var(--sf-radius-pill)] px-4 py-1.5 text-sm font-medium transition-colors ${
          !selectedId
            ? 'bg-[var(--sf-primary)] text-white'
            : 'bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:bg-[var(--sf-surface-muted)]'
        }`}
      >
        Todos
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`flex-shrink-0 rounded-[var(--sf-radius-pill)] px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedId === c.id
              ? 'bg-[var(--sf-primary)] text-white'
              : 'bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:bg-[var(--sf-surface-muted)]'
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
