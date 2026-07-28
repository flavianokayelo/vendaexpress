import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { LayoutTemplate } from 'lucide-react';
import { globalBlockRegistry } from '../../core/BlockRegistry';
import { Serializer } from '../../core/Serializer';
import { createSection } from '../../utils/defaults';
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderSidebar } from './BuilderSidebar';
import { BuilderInspector } from './BuilderInspector';
import { BuilderToolbar } from './BuilderToolbar';
import type { BuilderContextType } from '../../hooks/useBuilder';
import type { PageSection } from '../../types/page';
import type { BlockDefinition } from '../../types/block';
import type { DeviceMode } from '../../types/editor';

const GRADIENT_MAP: Record<string, string> = {
  hero: 'from-violet-500 to-purple-600',
  products: 'from-blue-500 to-cyan-600',
  marketing: 'from-amber-500 to-orange-600',
  content: 'from-emerald-500 to-teal-600',
  footer: 'from-slate-600 to-slate-800',
  layout: 'from-rose-500 to-pink-600',
};

function PaletteDragPreview({ type, block }: { type: string; block?: BlockDefinition }) {
  const Icon = LayoutTemplate;
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-blue-400 bg-white px-4 py-3 shadow-2xl rotate-[1deg] scale-[1.02]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENT_MAP[block?.category || ''] || 'from-blue-500 to-blue-600'} text-white shadow-sm`}>
        <Icon size={16} />
      </div>
      <div className="text-sm font-semibold text-slate-800">{block?.label ?? type}</div>
    </div>
  );
}

function SectionDragPreview({ section }: { section: PageSection }) {
  const block = globalBlockRegistry.get(section.type);
  return (
    <div className="rounded-xl border-2 border-blue-400 bg-white shadow-2xl opacity-90 rotate-[1deg] scale-[1.02]">
      {block?.component && (
        <block.component
          id={section.id}
          type={section.type}
          settings={section.settings}
          style={section.style}
          isEditing={false}
        />
      )}
    </div>
  );
}

function useKeyboardShortcuts({
  onUndo, onRedo, onSave, onRemove, onDeselect,
}: {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onRemove: () => void;
  onDeselect: () => void;
}) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        onRemove();
        return;
      }

      if (e.key === 'Escape') {
        onDeselect();
        return;
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onUndo, onRedo, onSave, onRemove, onDeselect]);
}

export function BuilderEditor({
  builder,
  onBack,
  onSave: onSaveExternal,
}: {
  builder: BuilderContextType;
  onBack?: () => void;
  onSave?: () => Promise<void>;
}) {
  const { state, dispatch, getBlock, getSelected, canUndo, canRedo } = builder;
  const { sections, selectedId, device, mode, dirty, zoom } = state;
  const [pageTitle, setPageTitle] = useState(state.page?.title ?? 'Nova página');
  const [dragTarget, setDragTarget] = useState<{ kind: 'palette'; type: string } | { kind: 'section'; section: PageSection } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropTargetRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (state.page?.title) setPageTitle(state.page.title);
  }, [state.page?.title]);

  const availableBlocks = globalBlockRegistry.getAll();

  const handleSelect = useCallback((id: string) => {
    dispatch({ type: 'SELECT_SECTION', id });
  }, [dispatch]);

  const handleRemove = useCallback((id?: string) => {
    const targetId = id ?? selectedId;
    if (targetId) dispatch({ type: 'REMOVE_SECTION', id: targetId });
  }, [dispatch, selectedId]);

  const handleDuplicate = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_SECTION', id });
  }, [dispatch]);

  const handleReorder = useCallback((newSections: PageSection[]) => {
    dispatch({ type: 'REORDER_SECTIONS', sections: newSections });
  }, [dispatch]);

  const handleAddBlock = useCallback((type: string, defaults?: Record<string, unknown>) => {
    const block = globalBlockRegistry.get(type);
    const section = createSection(type, block?.schema, defaults ?? block?.defaults);
    dispatch({ type: 'ADD_SECTION', section });
  }, [dispatch]);

  const handleChangeSettings = useCallback((settings: Record<string, unknown>) => {
    const sel = getSelected();
    if (sel) dispatch({ type: 'UPDATE_SECTION', id: sel.id, settings });
  }, [dispatch, getSelected]);

  const handleChangeStyle = useCallback((style: Record<string, unknown>) => {
    const sel = getSelected();
    if (sel) dispatch({ type: 'UPDATE_SECTION_STYLE', id: sel.id, style });
  }, [dispatch, getSelected]);

  const handleUndo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const handleRedo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);

  const handleSave = useCallback(() => {
    if (onSaveExternal) onSaveExternal();
    else dispatch({ type: 'MARK_CLEAN' });
  }, [dispatch, onSaveExternal]);

  const handleExport = useCallback(() => {
    if (!state.page) return;
    Serializer.downloadExport({ ...state.page, title: pageTitle });
  }, [state.page, pageTitle]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = Serializer.importFromJson(text);
      setPageTitle(imported.title);
      if (state.page) {
        dispatch({
          type: 'SET_PAGE',
          page: { ...state.page, title: imported.title, sections: imported.sections, template: imported.template, meta: imported.meta },
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao importar');
    }
    e.target.value = '';
  }, [dispatch, state.page]);

  const handleDeviceChange = useCallback((d: DeviceMode) => {
    dispatch({ type: 'SET_DEVICE', device: d });
  }, [dispatch]);

  const handleModeChange = useCallback((m: 'edit' | 'preview') => {
    dispatch({ type: 'SET_MODE', mode: m });
  }, [dispatch]);

  const handleZoomIn = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', zoom: Math.min(zoom + 10, 200) });
  }, [dispatch, zoom]);

  const handleZoomOut = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', zoom: Math.max(zoom - 10, 25) });
  }, [dispatch, zoom]);

  const handlePageTitleChange = useCallback((title: string) => {
    setPageTitle(title);
  }, []);

  const handleDeselect = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
  }, [dispatch]);

  const handleRemoveSelected = useCallback(() => {
    if (selectedId) dispatch({ type: 'REMOVE_SECTION', id: selectedId });
  }, [dispatch, selectedId]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    if (id.startsWith('palette-')) {
      const type = id.slice(8);
      setDragTarget({ kind: 'palette', type });
    } else {
      const section = sections.find((s) => s.id === id);
      if (section) setDragTarget({ kind: 'section', section });
    }
  }, [sections]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setDragTarget(null);

    const id = active.id as string;

    if (id.startsWith('palette-')) {
      const type = id.slice(8);
      const block = globalBlockRegistry.get(type);
      let insertIndex: number | undefined;
      if (over && !over.id.toString().startsWith('palette-')) {
        const idx = sections.findIndex((s) => s.id === over.id);
        if (idx >= 0) insertIndex = idx;
      }
      const section = createSection(type, block?.schema, block?.defaults);
      dispatch({ type: 'ADD_SECTION', section, index: insertIndex });
      return;
    }

    if (!over || id === over.id) return;

    const oldIdx = sections.findIndex((s) => s.id === id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    dispatch({ type: 'REORDER_SECTIONS', sections: reordered });
  }, [sections, dispatch]);

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleSave,
    onRemove: handleRemoveSelected,
    onDeselect: handleDeselect,
  });

  const selectedSection = getSelected();
  const selectedBlock = selectedSection ? getBlock(selectedSection.type) : undefined;

  if (mode === 'preview') {
    return (
      <div className="min-h-screen bg-white">
        <BuilderToolbar
          device={device}
          mode={mode}
          canUndo={canUndo}
          canRedo={canRedo}
          dirty={dirty}
          zoom={zoom}
          pageTitle={pageTitle}
          onBack={onBack}
          onDeviceChange={handleDeviceChange}
          onModeChange={handleModeChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onExport={handleExport}
          onImport={handleImport}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPageTitleChange={handlePageTitleChange}
        />
        <div className="mx-auto max-w-6xl">
          {sections.map((section) => {
            const block = globalBlockRegistry.get(section.type);
            if (!block?.component) return null;
            return (
              <block.component
                key={section.id}
                id={section.id}
                type={section.type}
                settings={section.settings}
                style={section.style}
                isEditing={false}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 antialiased">
      <BuilderToolbar
        device={device}
        mode={mode}
        canUndo={canUndo}
        canRedo={canRedo}
        dirty={dirty}
        zoom={zoom}
        pageTitle={pageTitle}
        onBack={onBack}
        onDeviceChange={handleDeviceChange}
        onModeChange={handleModeChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onPageTitleChange={handlePageTitleChange}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar — block library */}
          <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
            <BuilderSidebar blocks={availableBlocks} onAddBlock={handleAddBlock} />
          </aside>

          {/* Center — canvas */}
          <main
            className="flex flex-1 flex-col overflow-hidden bg-slate-100/70"
            onClick={handleDeselect}
          >
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div
                className="mx-auto transition-all duration-200"
                style={{
                  maxWidth: device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                <BuilderCanvas
                  sections={sections}
                  selectedId={selectedId}
                  device={device}
                  onSelect={handleSelect}
                  onRemove={handleRemove}
                  onDuplicate={handleDuplicate}
                  onAddBlock={handleAddBlock}
                  onChangeSettings={handleChangeSettings}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>{sections.length} secção{sections.length !== 1 ? 'ões' : ''}</span>
                <span className="text-slate-200">|</span>
                <span>Zoom: {zoom}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Estado: <span className={dirty ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>{dirty ? 'modificado' : 'guardado'}</span></span>
              </div>
            </div>
          </main>

          {/* Right sidebar — inspector */}
          <aside className="w-72 shrink-0 border-l border-slate-200 bg-white">
            <BuilderInspector
              section={selectedSection}
              block={selectedBlock}
              onChangeSettings={handleChangeSettings}
              onChangeStyle={handleChangeStyle}
              onRemove={handleRemove}
              onDuplicate={handleDuplicate}
            />
          </aside>
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {dragTarget?.kind === 'palette' && (
            <PaletteDragPreview type={dragTarget.type} block={globalBlockRegistry.get(dragTarget.type)} />
          )}
          {dragTarget?.kind === 'section' && (
            <SectionDragPreview section={dragTarget.section} />
          )}
        </DragOverlay>
      </DndContext>

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
