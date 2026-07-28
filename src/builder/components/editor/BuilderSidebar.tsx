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

const GRADIENT_MAP: Record<string, string> = {
  hero: 'from-violet-500 to-purple-600',
  products: 'from-blue-500 to-cyan-600',
  marketing: 'from-amber-500 to-orange-600',
  content: 'from-emerald-500 to-teal-600',
  footer: 'from-slate-600 to-slate-800',
  layout: 'from-rose-500 to-pink-600',
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
      className={`group cursor-grab rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${
        isDragging ? 'opacity-50 ring-2 ring-blue-400 scale-95' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENT_MAP[block.category] || 'from-blue-500 to-blue-600'} text-white shadow-sm`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-800">{block.label}</div>
          {block.description && (
            <div className="mt-0.5 text-[11px] text-slate-400 leading-tight line-clamp-2">{block.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500 uppercase tracking-wider">
          {BLOCK_CATEGORIES[block.category as BlockCategory]?.label ?? block.category}
        </span>
        <span className="ml-auto text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
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
  blocks, onAddBlock,
}: {
  blocks: BlockDefinition[];
  onAddBlock: (type: string, settings?: Record<string, unknown>) => void;
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
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">Blocos</h2>
          <span className="text-[10px] text-slate-400 font-medium">{blocks.length} disponíveis</span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procurar blocos..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-8 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="border-b border-slate-100 px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_ORDER.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat] || LayoutTemplate;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                <CatIcon size={10} />
                {BLOCK_CATEGORIES[cat]?.label ?? cat}
              </button>
            );
          })}
          {hasActiveFilter && (
            <button
              onClick={() => { setSearch(''); setActiveCategory(null); }}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
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
            const gradient = GRADIENT_MAP[cat] || 'from-blue-500 to-blue-600';
            return (
              <div key={cat} className="mb-5">
                <div className={`mb-2 rounded-lg bg-gradient-to-r ${gradient} px-3 py-2`}>
                  <div className="text-xs font-bold text-white">{BLOCK_CATEGORIES[cat]?.label ?? cat}</div>
                  <div className="text-[10px] text-white/70">{BLOCK_CATEGORIES[cat]?.description}</div>
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
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <Search size={24} />
            </div>
            <p className="text-sm font-medium text-slate-600">Nenhum bloco encontrado</p>
            <p className="mt-1 text-xs text-slate-400">Tenta outros termos de pesquisa</p>
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
