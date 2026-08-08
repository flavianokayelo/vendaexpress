import { useMemo } from 'react';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Sparkles } from 'lucide-react';
import { globalBlockRegistry } from '../../core/BlockRegistry';
import type { PageSection } from '../../types/page';
import type { DeviceMode } from '../../types/editor';
import type { BlockSettings } from '../../types/block';

const CATEGORY_COLORS: Record<string, string> = {
  hero: 'bg-ink text-paper',
  products: 'bg-ink text-paper',
  marketing: 'bg-ink text-paper',
  content: 'bg-ink text-paper',
  footer: 'bg-ink text-paper',
  layout: 'bg-ink text-paper',
};

function SectionToolbar({ section, onRemove, onDuplicate }: {
  section: PageSection;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const { attributes, listeners } = useSortable({ id: section.id });
  const block = globalBlockRegistry.get(section.type);

  return (
    <div className="absolute -top-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 border-2 border-border bg-paper px-1.5 py-1 shadow-lg shadow-ink/5 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-0.5" style={{ borderRadius: '2px' }}>
      <button
        {...attributes}
        {...listeners}
        className="flex h-6 w-6 cursor-grab items-center justify-center text-ink-2 hover:bg-ink/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}
        title="Arrastar"
      >
        <GripVertical size={12} />
      </button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <div className="flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-ink-2">
        <div className={`h-2 w-2 ${CATEGORY_COLORS[section.type] || 'bg-ink'}`} />
        <span>{block?.label ?? section.type}</span>
      </div>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicate(section.id); }}
        className="flex h-6 w-6 items-center justify-center text-ink-2 hover:bg-accent-soft hover:text-accent transition-colors" style={{ borderRadius: '2px' }}
        title="Duplicar"
      >
        <Copy size={12} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(section.id); }}
        className="flex h-6 w-6 items-center justify-center text-ink-2 hover:bg-danger/10 hover:text-danger transition-colors" style={{ borderRadius: '2px' }}
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
        className={`relative transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'ring-2 ring-accent ring-offset-2 ring-offset-paper shadow-lg shadow-accent/10'
            : 'hover:ring-1 hover:ring-accent/30 hover:shadow-md'
        }`}
        style={{ borderRadius: '2px' }}
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
          <div className="flex items-center justify-center border-2 border-border bg-warning/10 px-6 py-8 font-mono text-sm text-warning" style={{ borderRadius: '2px' }}>
            Bloco &ldquo;{section.type}&rdquo; não encontrado
          </div>
        )}

        <div className={`pointer-events-none absolute inset-0 transition-all duration-200 ${
          isSelected
            ? 'bg-accent-soft'
            : 'bg-transparent group-hover:bg-accent-soft/20'
        }`} style={{ borderRadius: '2px' }} />
      </div>

      {isSelected && (
        <div className="absolute -left-1 top-1/2 h-8 w-0.5 -translate-y-1/2 bg-accent shadow-sm shadow-accent/30" style={{ borderRadius: '2px' }} />
      )}

      <SectionToolbar section={section} onRemove={onRemove} onDuplicate={onDuplicate} />

      {!isSelected && (
        <div className="mx-auto mt-0 h-px max-w-[calc(100%-4rem)] bg-transparent transition-colors group-hover:bg-accent/20" />
      )}
    </div>
  );
}

function DeviceFrame({ device, children }: { device: DeviceMode; children: React.ReactNode }) {
  if (device === 'desktop') return <>{children}</>;

  const frameClass = device === 'mobile'
    ? 'border-[3px] border-ink shadow-2xl overflow-hidden bg-paper max-w-[375px] mx-auto'
    : 'border-[2px] border-border shadow-2xl overflow-hidden bg-paper max-w-[768px] mx-auto';
  const frameRadius = device === 'mobile' ? '2rem' : '2px';

  return (
    <div className="flex flex-col items-center py-4">
      {device === 'mobile' && (
        <div className="mb-1 h-1 w-16 bg-ink" style={{ borderRadius: '2px' }} />
      )}
      <div className={frameClass} style={{ borderRadius: frameRadius }}>
        {device === 'mobile' && (
          <div className="flex items-center justify-center border-b border-border py-2 font-mono text-[10px] text-ink-2">
            <div className="bg-ink/5 px-4 py-0.5" style={{ borderRadius: '2px' }}>vendaexpress.ao</div>
          </div>
        )}
        <div className={device === 'mobile' ? 'min-h-[600px]' : 'min-h-[400px]'}>
          {children}
        </div>
      </div>
      {device === 'mobile' && (
        <div className="mt-2 flex gap-1">
          <div className="h-1 w-1 bg-ink-3" style={{ borderRadius: '2px' }} />
          <div className="h-1 w-8 bg-ink-3" style={{ borderRadius: '2px' }} />
          <div className="h-1 w-1 bg-ink-3" style={{ borderRadius: '2px' }} />
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
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-ink/5 text-ink-2 shadow-inner" style={{ borderRadius: '2px' }}>
                <Sparkles size={36} />
              </div>
              <h3 className="font-heading text-lg font-bold text-ink">Página vazia</h3>
              <p className="mt-2 font-mono text-sm text-ink-2 leading-relaxed">
                Arrasta blocos da barra lateral ou clica em algum dos botões abaixo para começares a construir a tua página.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_BLOCKS.map(({ type, block }) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (onAddBlock) onAddBlock(type);
                    }}
                    className="border-2 border-border bg-paper px-3 py-2 font-mono text-xs font-semibold text-ink shadow-sm hover:border-accent hover:text-accent hover:shadow-md transition-all" style={{ borderRadius: '2px' }}
                  >
                    + {block.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <DeviceFrame device={device}>
            <div className="divide-y divide-border">
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
