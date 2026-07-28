import { useMemo, useState } from 'react';
import {
  Trash2, Copy, Type, Palette, Layout, Eye, ChevronDown,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';
import type { PageSection } from '../../types/page';
import type { BlockDefinition, FieldSchema, FieldType } from '../../types/block';
import { globalBlockRegistry } from '../../core/BlockRegistry';

const GRADIENT_MAP: Record<string, string> = {
  hero: 'from-violet-500 to-purple-600',
  products: 'from-blue-500 to-cyan-600',
  marketing: 'from-amber-500 to-orange-600',
  content: 'from-emerald-500 to-teal-600',
  footer: 'from-slate-600 to-slate-800',
  layout: 'from-rose-500 to-pink-600',
};

type TabId = 'content' | 'styles' | 'layout';

const TABS: { id: TabId; label: string; icon: typeof Type }[] = [
  { id: 'content', label: 'Conteúdo', icon: Type },
  { id: 'styles', label: 'Estilos', icon: Palette },
  { id: 'layout', label: 'Layout', icon: Layout },
];

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 p-0.5"
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-slate-200 pointer-events-none" />
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-mono text-slate-600 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}

function RangeInput({ value, onChange, min = 0, max = 100, step = 1, label }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; label?: string;
}) {
  return (
    <div className="space-y-1">
      {label && <div className="text-[10px] font-medium text-slate-500">{label}</div>}
      <div className="flex items-center gap-2">
        <input
          type="range"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min} max={max} step={step}
          className="flex-1 h-1.5 rounded-full appearance-none bg-slate-200 accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-sm"
        />
        <span className="w-8 text-right text-xs font-medium text-slate-500 tabular-nums">{value ?? 0}</span>
      </div>
    </div>
  );
}

function SpacingInput({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-600">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-14 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 text-right focus:border-blue-500 focus:outline-none tabular-nums"
        />
        <span className="text-[10px] text-slate-400 w-5">px</span>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }: {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const val = value ?? field.default;

  const baseInput = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all';

  switch (field.type) {
    case 'text':
    case 'url':
      return (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          value={val as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={val as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${baseInput} resize-y`}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={val as number}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min} max={field.max} step={field.step}
          className={baseInput}
        />
      );

    case 'range':
      return <RangeInput value={val as number} onChange={onChange} min={field.min} max={field.max} step={field.step} />;

    case 'color':
      return <ColorInput value={val as string} onChange={(v) => onChange(v)} />;

    case 'select': {
      const options = field.options ?? [];
      return (
        <select value={val as string} onChange={(e) => onChange(e.target.value)} className={baseInput}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={!!val}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-600">{field.label}</span>
        </label>
      );

    case 'image':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={val as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da imagem"
            className={baseInput}
          />
          {val && (
            <div className="relative h-24 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img src={val as string} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => onChange('')}
                className="absolute right-1 top-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-white shadow-sm"
              >
                Remover
              </button>
            </div>
          )}
          <button className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[10px] font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            + Adicionar imagem
          </button>
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={String(val ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      );
  }
}

function FieldRenderer({ field, value, onChange }: {
  field: FieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {field.label}
        {field.hint && <span className="ml-1 font-normal normal-case text-slate-400">— {field.hint}</span>}
      </label>
      <FieldInput field={field} value={value} onChange={onChange} />
    </div>
  );
}

export function BuilderInspector({
  section, block,
  onChangeSettings, onChangeStyle,
  onRemove, onDuplicate,
}: {
  section: PageSection | null;
  block?: BlockDefinition;
  onChangeSettings: (settings: Record<string, unknown>) => void;
  onChangeStyle: (style: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (name: string) => {
    setCollapsedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  if (!section) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center bg-white">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 shadow-inner">
          <Eye size={24} />
        </div>
        <p className="text-sm font-medium text-slate-600">Nenhum bloco selecionado</p>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
          Clica num bloco do editor para veres e alterares as suas propriedades.
        </p>
      </div>
    );
  }

  const settingsFields = block?.schema?.fields ?? [];
  const styleFields = block?.schema?.styleFields ?? [];
  const layoutFields: FieldSchema[] = [
    { type: 'range', label: 'paddingTop', default: 0, min: 0, max: 120, step: 4 },
    { type: 'range', label: 'paddingBottom', default: 0, min: 0, max: 120, step: 4 },
    { type: 'range', label: 'marginTop', default: 0, min: 0, max: 80, step: 4 },
    { type: 'range', label: 'marginBottom', default: 0, min: 0, max: 80, step: 4 },
    { type: 'select', label: 'maxWidth', default: '100%', options: [{ label: '100%', value: '100%' }, { label: '1200px', value: '1200px' }, { label: '960px', value: '960px' }, { label: '768px', value: '768px' }] },
  ];

  return (
    <div className="flex h-full flex-col border-l border-slate-200 bg-white">
      {/* Section header */}
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${GRADIENT_MAP[section.type] || 'from-blue-500 to-blue-600'} text-white shadow-sm`}>
            {(globalBlockRegistry.get(section.type)?.icon === 'Type' ? <Type size={14} /> : <Layout size={14} />)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-800">{block?.label ?? section.type}</div>
            <div className="text-[10px] text-slate-400 font-mono truncate">{section.id.slice(0, 16)}</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicate(section.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Duplicar"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => onRemove(section.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Remover"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <TabIcon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'content' && (
          <div className="space-y-4">
            {settingsFields.length === 0 ? (
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-center">
                <Type size={20} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs text-slate-500">Este bloco não tem conteúdo configurável.</p>
              </div>
            ) : (
              settingsFields.map((field) => (
                <FieldRenderer
                  key={field.label}
                  field={field}
                  value={section.settings[field.label]}
                  onChange={(v) => onChangeSettings({ [field.label]: v })}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'styles' && (
          <div className="space-y-4">
            {styleFields.length === 0 ? (
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-center">
                <Palette size={20} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs text-slate-500">Este bloco não tem estilos configuráveis.</p>
              </div>
            ) : (
              styleFields.map((field) => (
                <FieldRenderer
                  key={field.label}
                  field={field}
                  value={section.style?.[field.label]}
                  onChange={(v) => onChangeStyle({ [field.label]: v })}
                />
              ))
            )}

            {styleFields.length > 0 && styleFields.some((f) => f.type === 'color') && (
              <div className="pt-2">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Cores rápidas</div>
                <div className="flex flex-wrap gap-1.5">
                  {['#000000', '#ffffff', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#0d9488', '#eab308', '#64748b'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        const colorField = styleFields.find((f) => f.type === 'color');
                        if (colorField) onChangeStyle({ [colorField.label]: c });
                      }}
                      className="h-6 w-6 rounded-lg border border-slate-200 shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <Layout size={12} />
                Espaçamento
              </div>
              <div className="space-y-2.5">
                {layoutFields.slice(0, 4).map((field) => (
                  <SpacingInput
                    key={field.label}
                    label={field.label === 'paddingTop' ? 'Topo' : field.label === 'paddingBottom' ? 'Fundo' : field.label === 'marginTop' ? 'Margem topo' : 'Margem fundo'}
                    value={(section.style?.[field.label] as number) || 0}
                    onChange={(v) => onChangeStyle({ [field.label]: v })}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <Layout size={12} />
                Dimensões
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">Largura máx.</span>
                  <select
                    value={(section.style?.['maxWidth'] as string) || '100%'}
                    onChange={(e) => onChangeStyle({ maxWidth: e.target.value })}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="100%">100%</option>
                    <option value="1200px">1200px</option>
                    <option value="960px">960px</option>
                    <option value="768px">768px</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <AlignLeft size={12} />
                Alinhamento
              </div>
              <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5 w-fit">
                {[
                  { icon: AlignLeft, value: 'left' },
                  { icon: AlignCenter, value: 'center' },
                  { icon: AlignRight, value: 'right' },
                ].map(({ icon: AlignIcon, value }) => (
                  <button
                    key={value}
                    onClick={() => onChangeStyle({ textAlign: value })}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${
                      (section.style?.textAlign as string) === value
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    <AlignIcon size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
