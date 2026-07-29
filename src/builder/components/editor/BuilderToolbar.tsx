import { useState, useRef, useEffect } from "react";
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Upload,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Check,
  ArrowLeft,
  Globe,
} from "lucide-react";
import type { DeviceMode } from "../../types/editor";
import type { PageStatus } from "../../types/page";

interface BuilderToolbarProps {
  device: DeviceMode;
  mode: "edit" | "preview";
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
  zoom: number;
  pageTitle: string;
  pageStatus?: PageStatus;
  storeName?: string;
  onDeviceChange: (device: DeviceMode) => void;
  onModeChange: (mode: "edit" | "preview") => void;
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
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export function BuilderToolbar({
  device,
  mode,
  canUndo,
  canRedo,
  dirty,
  zoom,
  pageTitle,
  pageStatus,
  storeName,
  onDeviceChange,
  onModeChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onImport,
  onZoomIn,
  onZoomOut,
  onPageTitleChange,
  onBack,
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
      if (
        publishRef.current &&
        !publishRef.current.contains(e.target as Node)
      ) {
        setPublishOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-paper/90 px-4 shadow-sm backdrop-blur-md">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center text-ink-2 hover:bg-ink/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}
          title="Voltar"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center bg-accent text-paper shadow-sm" style={{ borderRadius: '2px' }}>
            <Globe size={14} />
          </div>
          <span className="hidden sm:inline truncate font-mono text-sm font-medium text-ink-2">
            {storeName ?? "Loja"}
          </span>
          <span className="hidden sm:inline text-border-2">/</span>
        </div>

        {editingTitle ? (
          <input
            ref={titleRef}
            value={pageTitle}
            onChange={(e) => onPageTitleChange(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingTitle(false);
            }}
            className="max-w-[180px] border-2 border-accent bg-accent-soft px-2 py-1 font-heading text-sm font-semibold text-ink outline-none" style={{ borderRadius: '2px' }}
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="truncate font-heading text-sm font-semibold text-ink hover:text-accent transition-colors max-w-[200px]"
          >
            {pageTitle}
          </button>
        )}

        <span
          className={`px-2 py-0.5 font-mono text-[10px] font-semibold border-2 ${
            dirty
              ? "border-warning/30 bg-warning/10 text-warning"
              : "border-success/30 bg-success/10 text-success"
          }`}
          style={{ borderRadius: '2px' }}
        >
          {dirty ? "Não guardado" : "Guardado"}
        </span>

        {pageStatus === "published" && (
          <span className="border-2 border-accent-soft bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-accent" style={{ borderRadius: '2px' }}>
            Publicado
          </span>
        )}
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-0.5 bg-ink/5 p-0.5" style={{ borderRadius: '2px' }}>
          {devices.map((d) => {
            const Icon = d.icon;
            const isActive = device === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onDeviceChange(d.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs font-medium transition-all ${
                  isActive
                    ? "bg-paper text-ink shadow-sm"
                    : "text-ink-2 hover:text-ink hover:bg-paper/50"
                }`}
                style={{ borderRadius: '2px' }}
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
            className="p-1.5 text-ink-2 hover:bg-ink/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}
          >
            <ZoomOut size={14} />
          </button>
          <span className="w-10 text-center font-mono text-xs font-medium text-ink-2 tabular-nums">
            {zoom}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 text-ink-2 hover:bg-ink/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}
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
            className="flex items-center gap-1 px-2 py-1.5 font-mono text-xs font-medium text-ink-2 hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ borderRadius: '2px' }}
          >
            <Undo2 size={14} />
            <span className="hidden lg:inline">Desfazer</span>
            <kbd className="hidden xl:inline ml-1 border border-border bg-ink/[0.03] px-1 py-0.5 font-mono text-[10px] text-ink-2" style={{ borderRadius: '2px' }}>
              ⌘Z
            </kbd>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-2 py-1.5 font-mono text-xs font-medium text-ink-2 hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ borderRadius: '2px' }}
          >
            <Redo2 size={14} />
            <span className="hidden lg:inline">Refazer</span>
            <kbd className="hidden xl:inline ml-1 border border-border bg-ink/[0.03] px-1 py-0.5 font-mono text-[10px] text-ink-2" style={{ borderRadius: '2px' }}>
              ⌘⇧Z
            </kbd>
          </button>

          <div className="mx-1 h-5 w-px bg-border" />

          <button
            onClick={onImport}
            className="p-1.5 text-ink-2 hover:bg-ink/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}
            title="Importar JSON"
          >
            <Upload size={14} />
          </button>
          <button
            onClick={onExport}
            className="p-1.5 text-ink-2 hover:bg-ink/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}
            title="Exportar JSON"
          >
            <Download size={14} />
          </button>

          <div className="mx-1 h-5 w-px bg-border" />
        </div>

        <button
          onClick={() => onModeChange(mode === "edit" ? "preview" : "edit")}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-medium transition-all ${
            mode === "preview"
              ? "bg-accent-soft text-accent"
              : "text-ink-2 hover:bg-ink/5"
          }`}
          style={{ borderRadius: '2px' }}
        >
          {mode === "preview" ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden sm:inline">
            {mode === "preview" ? "Editar" : "Pré-visualizar"}
          </span>
        </button>

        <div className="relative" ref={publishRef}>
          <button
            onClick={() => setPublishOpen(!publishOpen)}
            className="flex items-center gap-1.5 bg-accent px-4 py-1.5 font-mono text-xs font-semibold text-paper shadow-sm hover:bg-accent/90 transition-all hover:shadow-md active:scale-[0.97]" style={{ borderRadius: '2px' }}
          >
            <Check size={14} />
            <span>{pageStatus === "published" ? "Publicado" : "Publicar"}</span>
            <ChevronDown
              size={12}
              className={`transition-transform ${publishOpen ? "rotate-180" : ""}`}
            />
          </button>

          {publishOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 border-2 border-border bg-paper p-1.5 shadow-xl z-50" style={{ borderRadius: '2px' }}>
              <button
                onClick={() => {
                  onSave("draft");
                  setPublishOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 font-mono text-xs font-medium text-ink hover:bg-ink/5 transition-colors" style={{ borderRadius: '2px' }}
              >
                <div className="flex h-6 w-6 items-center justify-center bg-accent-soft text-accent" style={{ borderRadius: '2px' }}>
                  <Check size={13} />
                </div>
                <div className="text-left">
                  <div>Guardar rascunho</div>
                  <div className="font-mono text-[10px] text-ink-2">Ctrl+S</div>
                </div>
              </button>
              <button
                onClick={() => {
                  onSave("published");
                  setPublishOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 font-mono text-xs font-medium text-ink hover:bg-ink/5 transition-colors" style={{ borderRadius: '2px' }}
              >
                <div className="flex h-6 w-6 items-center justify-center bg-success/10 text-success" style={{ borderRadius: '2px' }}>
                  <Globe size={13} />
                </div>
                <div className="text-left">
                  <div>Publicar</div>
                  <div className="font-mono text-[10px] text-ink-2">
                    Tornar página visível
                  </div>
                </div>
              </button>
              {pageStatus === "published" && (
                <button
                  onClick={() => {
                    onSave("draft");
                    setPublishOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-mono text-xs font-medium text-ink hover:bg-ink/5 transition-colors" style={{ borderRadius: '2px' }}
                >
                  <div className="flex h-6 w-6 items-center justify-center bg-warning/10 text-warning" style={{ borderRadius: '2px' }}>
                    <EyeOff size={13} />
                  </div>
                  <div className="text-left">
                    <div>Despublicar</div>
                    <div className="font-mono text-[10px] text-ink-2">
                      Tornar página invisível
                    </div>
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
