import { useState, useRef, useEffect } from 'react';
import {
  Undo2, Redo2, Monitor, Tablet, Smartphone,
  Download, Upload, Eye, EyeOff, ZoomIn, ZoomOut,
  ChevronDown, Check, ArrowLeft, Globe,
} from 'lucide-react';
import type { DeviceMode } from '../../types/editor';
import type { PageStatus } from '../../types/page';

interface BuilderToolbarProps {
  device: DeviceMode;
  mode: 'edit' | 'preview';
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
  zoom: number;
  pageTitle: string;
  pageStatus?: PageStatus;
  storeName?: string;
  onDeviceChange: (device: DeviceMode) => void;
  onModeChange: (mode: 'edit' | 'preview') => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: (status?: PageStatus) => void;
  onExport: () => void;
  onImport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPageTitleChange: (title: string) => void;
  onBack: () => void;
}

const devices: { id: DeviceMode; icon: typeof Monitor; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function BuilderToolbar({
  device, mode, canUndo, canRedo, dirty, zoom, pageTitle, pageStatus, storeName,
  onDeviceChange, onModeChange, onUndo, onRedo,
  onSave, onExport, onImport, onZoomIn, onZoomOut, onPageTitleChange, onBack,
}: BuilderToolbarProps) {
  const [publishOpen, setPublishOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const publishRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (publishRef.current && !publishRef.current.contains(e.target as Node)) {
        setPublishOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-md">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Voltar"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm">
            <Globe size={14} />
          </div>
          <span className="hidden sm:inline truncate text-sm font-medium text-slate-500">{storeName ?? 'Loja'}</span>
          <span className="hidden sm:inline text-slate-300">/</span>
        </div>

        {editingTitle ? (
          <input
            ref={titleRef}
            value={pageTitle}
            onChange={(e) => onPageTitleChange(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false); }}
            className="max-w-[180px] rounded-lg border border-blue-300 bg-blue-50/50 px-2 py-1 text-sm font-semibold text-slate-800 outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="truncate text-sm font-semibold text-slate-800 hover:text-blue-700 transition-colors max-w-[200px]"
          >
            {pageTitle}
          </button>
        )}

        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          dirty
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {dirty ? 'Não guardado' : 'Guardado'}
        </span>

        {pageStatus === 'published' && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            Publicado
          </span>
        )}
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-0.5 shadow-inner">
          {devices.map((d) => {
            const Icon = d.icon;
            const isActive = device === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onDeviceChange(d.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                <Icon size={13} />
                <span className="hidden lg:inline">{d.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="w-10 text-center text-xs font-medium text-slate-500 tabular-nums">{zoom}%</span>
          <button
            onClick={onZoomIn}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={14} />
            <span className="hidden lg:inline">Desfazer</span>
            <kbd className="hidden xl:inline ml-1 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] text-slate-400">⌘Z</kbd>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 size={14} />
            <span className="hidden lg:inline">Refazer</span>
            <kbd className="hidden xl:inline ml-1 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] text-slate-400">⌘⇧Z</kbd>
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" />

          <button
            onClick={onImport}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Importar JSON"
          >
            <Upload size={14} />
          </button>
          <button
            onClick={onExport}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Exportar JSON"
          >
            <Download size={14} />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" />
        </div>

        <button
          onClick={() => onModeChange(mode === 'edit' ? 'preview' : 'edit')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            mode === 'preview'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {mode === 'preview' ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden sm:inline">{mode === 'preview' ? 'Editar' : 'Pré-visualizar'}</span>
        </button>

        <div className="relative" ref={publishRef}>
          <button
            onClick={() => setPublishOpen(!publishOpen)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-md active:scale-[0.97]"
          >
            <Check size={14} />
            <span>{pageStatus === 'published' ? 'Publicado' : 'Publicar'}</span>
            <ChevronDown size={12} className={`transition-transform ${publishOpen ? 'rotate-180' : ''}`} />
          </button>

          {publishOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
              <button
                onClick={() => { onSave('draft'); setPublishOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Check size={13} />
                </div>
                <div className="text-left">
                  <div>Guardar rascunho</div>
                  <div className="text-[10px] text-slate-400">Ctrl+S</div>
                </div>
              </button>
              <button
                onClick={() => { onSave('published'); setPublishOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-50 text-green-600">
                  <Globe size={13} />
                </div>
                <div className="text-left">
                  <div>Publicar</div>
                  <div className="text-[10px] text-slate-400">Tornar página visível</div>
                </div>
              </button>
              {pageStatus === 'published' && (
                <button
                  onClick={() => { onSave('draft'); setPublishOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                    <EyeOff size={13} />
                  </div>
                  <div className="text-left">
                    <div>Despublicar</div>
                    <div className="text-[10px] text-slate-400">Tornar página invisível</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
