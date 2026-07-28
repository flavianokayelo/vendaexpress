import { useCallback, useMemo } from 'react';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Sparkles } from 'lucide-react';
import { globalBlockRegistry } from '../../core/BlockRegistry';
import { createSection } from '../../utils/defaults';
import type { PageSection } from '../../types/page';
import type { DeviceMode } from '../../types/editor';
import type { BlockSettings } from '../../types/block';

const GRADIENT_MAP: Record<string, string> = {
  hero: 'from-violet-500 to-purple-600',
  products: 'from-blue-500 to-cyan-600',
  marketing: 'from-amber-500 to-orange-600',
  content: 'from-emerald-500 to-teal-600',
  footer: 'from-slate-600 to-slate-800',
  layout: 'from-rose-500 to-pink-600',
};

function SectionToolbar({ section, onSelect, onRemove, onDuplicate }: {
  section: PageSection;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const { attributes, listeners } = useSortable({ id: section.id });
  const block = globalBlockRegistry.get(section.type);

  return (
    <div className="absolute -top-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1.5 py-1 shadow-lg shadow-slate-200/50 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-0.5">
      <button
        {...attributes}
        {...listeners}
        className="flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        title="Arrastar"
      >
        <GripVertical size={12} />
      </button>
      <div className="mx-0.5 h-4 w-px bg-slate-200" />
      <div className="flex items-center gap-1 px-1.5 text-[10px] font-medium text-slate-500">
        <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${GRADIENT_MAP[section.type] || 'from-blue-500 to-blue-600'}`} />
        <span>{block?.label ?? section.type}</span>
      </div>
      <div className="mx-0.5 h-4 w-px bg-slate-200" />
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicate(section.id); }}
        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        title="Duplicar"
      >
        <Copy size={12} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(section.id); }}
        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Remover"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function SortableSection({ section, isSelected, onSelect, onRemove, onDuplicate, onChangeSettings }: {
  section: PageSection;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onChangeSettings?: (settings: BlockSettings) => void;
}) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const block = globalBlockRegistry.get(section.type);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        onClick={() => onSelect(section.id)}
        className={`relative rounded-lg transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white shadow-lg shadow-blue-100'
            : 'hover:ring-1 hover:ring-blue-300/40 hover:shadow-md'
        }`}
      >
        {block?.component && (
          <block.component
            id={section.id}
            type={section.type}
            settings={section.settings}
            style={section.style}
            isEditing={true}
            onSelect={onSelect}
            onChangeSettings={onChangeSettings}
          />
        )}
        {!block?.component && (
          <div className="flex items-center justify-center rounded-lg bg-amber-50 px-6 py-8 text-sm text-amber-700">
            Bloco &ldquo;{section.type}&rdquo; não encontrado
          </div>
        )}

        <div className={`pointer-events-none absolute inset-0 rounded-lg transition-all duration-200 ${
          isSelected
            ? 'bg-blue-500/5'
            : 'bg-transparent group-hover:bg-blue-50/30'
        }`} />
      </div>

      {isSelected && (
        <div className="absolute -left-1 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-blue-500 shadow-sm shadow-blue-300" />
      )}

      <SectionToolbar section={section} onSelect={onSelect} onRemove={onRemove} onDuplicate={onDuplicate} />

      {!isSelected && (
        <div className="mx-auto mt-0 h-px max-w-[calc(100%-4rem)] bg-transparent transition-colors group-hover:bg-blue-200/50" />
      )}
    </div>
  );
}

function DeviceFrame({ device, children }: { device: DeviceMode; children: React.ReactNode }) {
  if (device === 'desktop') return <>{children}</>;

  const frameClass = device === 'mobile'
    ? 'rounded-[2.5rem] border-[3px] border-slate-800 shadow-2xl overflow-hidden bg-white max-w-[375px] mx-auto'
    : 'rounded-2xl border-[2px] border-slate-300 shadow-2xl overflow-hidden bg-white max-w-[768px] mx-auto';

  return (
    <div className="flex flex-col items-center py-4">
      {device === 'mobile' && (
        <div className="mb-1 h-1 w-16 rounded-full bg-slate-800" />
      )}
      <div className={frameClass}>
        {device === 'mobile' && (
          <div className="flex items-center justify-center border-b border-slate-100 py-2 text-[10px] text-slate-400">
            <div className="rounded-full bg-slate-100 px-4 py-0.5">vendaexpress.ao</div>
          </div>
        )}
        <div className={device === 'mobile' ? 'min-h-[600px]' : 'min-h-[400px]'}>
          {children}
        </div>
      </div>
      {device === 'mobile' && (
        <div className="mt-2 flex gap-1">
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <div className="h-1 w-8 rounded-full bg-slate-300" />
          <div className="h-1 w-1 rounded-full bg-slate-300" />
        </div>
      )}
    </div>
  );
}

export function BuilderCanvas({
  sections, selectedId, device,
  onSelect, onRemove, onDuplicate, onAddBlock, onChangeSettings,
}: {
  sections: PageSection[];
  selectedId: string | null;
  device: DeviceMode;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddBlock?: (type: string, defaults?: Record<string, unknown>) => void;
  onChangeSettings?: (settings: BlockSettings) => void;
}) {
  const sortableIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const QUICK_BLOCKS = useMemo(() => {
    return ['hero', 'text-block', 'product-grid', 'promo-banner']
      .map((type) => ({ type, block: globalBlockRegistry.get(type) }))
      .filter((e) => e.block) as { type: string; block: NonNullable<ReturnType<typeof globalBlockRegistry.get>> }[];
  }, []);

  return (
    <div className="min-h-full">
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        {sections.length === 0 ? (
          <div className="flex items-center justify-center py-16 px-4">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-400 shadow-inner">
                <Sparkles size={36} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Página vazia</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Arrasta blocos da barra lateral ou clica em algum dos botões abaixo para começares a construir a tua página.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_BLOCKS.map(({ type, block }) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (onAddBlock) onAddBlock(type);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-700 hover:shadow-md transition-all"
                  >
                    + {block.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <DeviceFrame device={device}>
            <div className="divide-y divide-slate-100">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  isSelected={selectedId === section.id}
                  onSelect={onSelect}
                  onRemove={onRemove}
                  onDuplicate={onDuplicate}
                  onChangeSettings={onChangeSettings}
                />
              ))}
            </div>
          </DeviceFrame>
        )}
      </SortableContext>
    </div>
  );
}
