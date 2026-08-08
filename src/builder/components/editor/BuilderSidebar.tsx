import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  LayoutTemplate, Type, Image, Images, Video, LayoutGrid, Star,
  FolderTree, Megaphone, MessageSquare, HelpCircle, Mail,
  ArrowDownToLine, Share2, Search, X, Sparkles,
} from 'lucide-react';
import { BLOCK_CATEGORIES, type BlockCategory, type BlockDefinition } from '../../types/block';

const ICON_MAP: Record<string, typeof LayoutTemplate> = {
  LayoutTemplate, Type, Image, Images, Video, LayoutGrid, Star,
  FolderTree, Megaphone, MessageSquare, HelpCircle, Mail,
  ArrowDownToLine, Share2, Sparkles,
};

function DraggableBlockCard({ block }: { block: BlockDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: { type: block.type, defaults: block.defaults },
  });
  const Icon = ICON_MAP[block.icon] || LayoutTemplate;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group cursor-grab border-2 border-border bg-paper p-3 transition-all hover:border-accent hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${
        isDragging ? 'opacity-50 ring-2 ring-accent scale-95' : ''
      }`}
      style={{ borderRadius: '2px' }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-paper`} style={{ borderRadius: '2px' }}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-sm font-semibold text-ink">{block.label}</div>
          {block.description && (
            <div className="mt-0.5 font-mono text-[11px] text-ink-2 leading-tight line-clamp-2">{block.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="bg-ink/5 px-2 py-0.5 font-mono text-[9px] font-medium text-ink-2 uppercase tracking-wider" style={{ borderRadius: '2px' }}>
          {BLOCK_CATEGORIES[block.category as BlockCategory]?.label ?? block.category}
        </span>
        <span className="ml-auto font-mono text-[10px] text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Arrastar +
        </span>
      </div>
    </div>
  );
}

const CATEGORY_ORDER: BlockCategory[] = ['hero', 'products', 'content', 'marketing', 'footer', 'layout'];

const CATEGORY_ICONS: Record<string, typeof LayoutTemplate> = {
  hero: Sparkles,
  products: LayoutGrid,
  content: Type,
  marketing: Megaphone,
  footer: ArrowDownToLine,
  layout: LayoutTemplate,
};

export function BuilderSidebar({
  blocks,
}: {
  blocks: BlockDefinition[];
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const result: Record<string, BlockDefinition[]> = {};
    for (const block of blocks) {
      const cat = block.category;
      if (!result[cat]) result[cat] = [];
      result[cat].push(block);
    }
    return result;
  }, [blocks]);

  const filtered = useMemo(() => {
    if (!search.trim() && !activeCategory) return grouped;
    const q = search.toLowerCase().trim();

    const result: Record<string, BlockDefinition[]> = {};
    for (const [cat, catBlocks] of Object.entries(grouped)) {
      if (activeCategory && cat !== activeCategory) continue;
      const filtered = q
        ? catBlocks.filter(
            (b) => b.label.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
          )
        : catBlocks;
      if (filtered.length > 0) result[cat] = filtered;
    }
    return result;
  }, [grouped, search, activeCategory]);

  const flattenFiltered = useMemo(() => {
    return Object.values(filtered).flat();
  }, [filtered]);

  const hasActiveFilter = search.trim().length > 0 || activeCategory !== null;

  return (
    <div className="flex h-full flex-col border-r border-border bg-paper">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-sm font-semibold text-ink">Blocos</h2>
          <span className="font-mono text-[10px] text-ink-2">{blocks.length} disponíveis</span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procurar blocos..."
            className="w-full border-2 border-border bg-ink/[0.02] py-1.5 pl-9 pr-8 font-mono text-xs text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:bg-paper focus:ring-2 focus:ring-accent-soft transition-all" style={{ borderRadius: '2px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="border-b border-border px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_ORDER.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat] || LayoutTemplate;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] font-medium transition-all ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'bg-ink/5 text-ink-2 hover:bg-ink/10 hover:text-ink'
                }`}
                style={{ borderRadius: '2px' }}
              >
                <CatIcon size={10} />
                {BLOCK_CATEGORIES[cat]?.label ?? cat}
              </button>
            );
          })}
          {hasActiveFilter && (
            <button
              onClick={() => { setSearch(''); setActiveCategory(null); }}
              className="flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors" style={{ borderRadius: '2px' }}
            >
              <X size={10} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Block grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {!hasActiveFilter ? (
          CATEGORY_ORDER.map((cat) => {
            const catBlocks = grouped[cat];
            if (!catBlocks?.length) return null;
            return (
              <div key={cat} className="mb-5">
                <div className="mb-2 bg-ink px-3 py-2" style={{ borderRadius: '2px' }}>
                  <div className="font-heading text-xs font-bold text-paper">{BLOCK_CATEGORIES[cat]?.label ?? cat}</div>
                  <div className="font-mono text-[10px] text-paper/70">{BLOCK_CATEGORIES[cat]?.description}</div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {catBlocks.map((block) => (
                    <DraggableBlockCard key={block.type} block={block} />
                  ))}
                </div>
              </div>
            );
          })
        ) : flattenFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center bg-ink/5 text-ink-2" style={{ borderRadius: '2px' }}>
              <Search size={24} />
            </div>
            <p className="font-mono text-sm font-medium text-ink-2">Nenhum bloco encontrado</p>
            <p className="mt-1 font-mono text-xs text-ink-3">Tenta outros termos de pesquisa</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {flattenFiltered.map((block) => (
              <DraggableBlockCard key={block.type} block={block} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
