import { useState } from 'react';
import {
  Trash2, Copy, Type, Palette, Layout, Eye,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';
import type { PageSection } from '../../types/page';
import type { BlockDefinition, FieldSchema } from '../../types/block';
import { globalBlockRegistry } from '../../core/BlockRegistry';

const CATEGORY_STYLE = 'bg-ink text-paper';

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
          className="h-8 w-8 cursor-pointer border-2 border-border p-0.5" style={{ borderRadius: '2px' }}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-border pointer-events-none" style={{ borderRadius: '2px' }} />
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-2 border-border px-2 py-1 font-mono text-xs text-ink focus:border-accent focus:outline-none" style={{ borderRadius: '2px' }}
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
      {label && <div className="font-mono text-[10px] font-medium text-ink-2">{label}</div>}
      <div className="flex items-center gap-2">
        <input
          type="range"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min} max={max} step={step}
          className="flex-1 h-1.5 appearance-none bg-ink/10 accent-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-sm" style={{ borderRadius: '2px' }}
        />
        <span className="w-8 text-right font-mono text-xs font-medium text-ink-2 tabular-nums">{value ?? 0}</span>
      </div>
    </div>
  );
}

function SpacingInput({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] text-ink-2">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-14 border-2 border-border px-2 py-1 font-mono text-xs text-ink text-right focus:border-accent focus:outline-none tabular-nums" style={{ borderRadius: '2px' }}
        />
        <span className="font-mono text-[10px] text-ink-2 w-5">px</span>
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

  const baseInput = 'w-full border-2 border-border bg-paper px-3 py-1.5 font-mono text-xs text-ink placeholder:text-ink-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft transition-all';
  const baseStyle = { borderRadius: '2px' };

  switch (field.type) {
    case 'text':
    case 'url':
      return (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          value={val as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput} style={baseStyle}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={val as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${baseInput} resize-y`} style={baseStyle}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={val as number}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min} max={field.max} step={field.step}
          className={baseInput} style={baseStyle}
        />
      );

    case 'range':
      return <RangeInput value={val as number} onChange={onChange} min={field.min} max={field.max} step={field.step} />;

    case 'color':
      return <ColorInput value={val as string} onChange={(v) => onChange(v)} />;

    case 'select': {
      const options = field.options ?? [];
      return (
        <select value={val as string} onChange={(e) => onChange(e.target.value)} className={baseInput} style={baseStyle}>
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
            className="h-4 w-4 border-2 border-border text-accent focus:ring-accent" style={{ borderRadius: '2px' }}
          />
          <span className="font-mono text-xs text-ink-2">{field.label}</span>
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
            className={baseInput} style={baseStyle}
          />
          {Boolean(val) && (
            <div className="relative h-24 w-full overflow-hidden border-2 border-border bg-ink/[0.02]" style={{ borderRadius: '2px' }}>
              <img src={val as string} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => onChange('')}
                className="absolute right-1 top-1 bg-paper/80 px-1.5 py-0.5 font-mono text-[10px] text-ink hover:bg-paper shadow-sm" style={{ borderRadius: '2px' }}
              >
                Remover
              </button>
            </div>
          )}
          <button className="w-full border-2 border-dashed border-border px-3 py-2 font-mono text-[10px] font-medium text-ink-2 hover:border-accent hover:text-accent transition-colors" style={{ borderRadius: '2px' }}>
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
          className={baseInput} style={baseStyle}
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
      <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-2">
        {field.label}
        {field.hint && <span className="ml-1 font-normal normal-case text-ink-3">— {field.hint}</span>}
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

  if (!section) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center bg-paper">
        <div className="mb-4 flex h-14 w-14 items-center justify-center bg-ink/5 text-ink-2 shadow-inner" style={{ borderRadius: '2px' }}>
          <Eye size={24} />
        </div>
        <p className="font-heading text-sm font-medium text-ink">Nenhum bloco selecionado</p>
        <p className="mt-1 font-mono text-xs text-ink-2 leading-relaxed">
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
    <div className="flex h-full flex-col border-l border-border bg-paper">
      {/* Section header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center ${CATEGORY_STYLE} shadow-sm`} style={{ borderRadius: '2px' }}>
            {(globalBlockRegistry.get(section.type)?.icon === 'Type' ? <Type size={14} /> : <Layout size={14} />)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-heading text-sm font-semibold text-ink">{block?.label ?? section.type}</div>
            <div className="font-mono text-[10px] text-ink-2 truncate">{section.id.slice(0, 16)}</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicate(section.id)}
              className="p-1.5 text-ink-2 hover:bg-ink/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}
              title="Duplicar"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => onRemove(section.id)}
              className="p-1.5 text-ink-2 hover:bg-danger/10 hover:text-danger transition-colors" style={{ borderRadius: '2px' }}
              title="Remover"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 font-mono text-xs font-medium transition-all ${
                isActive
                  ? 'border-accent text-accent bg-accent-soft'
                  : 'border-transparent text-ink-2 hover:text-ink hover:bg-ink/5'
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
              <div className="bg-ink/5 p-4 text-center" style={{ borderRadius: '2px' }}>
                <Type size={20} className="mx-auto mb-2 text-ink-3" />
                <p className="font-mono text-xs text-ink-2">Este bloco não tem conteúdo configurável.</p>
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
              <div className="bg-ink/5 p-4 text-center" style={{ borderRadius: '2px' }}>
                <Palette size={20} className="mx-auto mb-2 text-ink-3" />
                <p className="font-mono text-xs text-ink-2">Este bloco não tem estilos configuráveis.</p>
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
                <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-2">Cores rápidas</div>
                <div className="flex flex-wrap gap-1.5">
                  {['#000000', '#ffffff', '#1a4bf0', '#16a34a', '#ea580c', '#dc2626', '#7c3aed', '#0d9488', '#eab308', '#64748b'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        const colorField = styleFields.find((f) => f.type === 'color');
                        if (colorField) onChangeStyle({ [colorField.label]: c });
                      }}
                      className="h-6 w-6 border-2 border-border shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: c, borderRadius: '2px' }}
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
              <div className="flex items-center gap-1.5 mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-2">
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

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-1.5 mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-2">
                <Layout size={12} />
                Dimensões
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-2">Largura máx.</span>
                  <select
                    value={(section.style?.['maxWidth'] as string) || '100%'}
                    onChange={(e) => onChangeStyle({ maxWidth: e.target.value })}
                    className="border-2 border-border px-2 py-1 font-mono text-xs text-ink focus:border-accent focus:outline-none" style={{ borderRadius: '2px' }}
                  >
                    <option value="100%">100%</option>
                    <option value="1200px">1200px</option>
                    <option value="960px">960px</option>
                    <option value="768px">768px</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-1.5 mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-2">
                <AlignLeft size={12} />
                Alinhamento
              </div>
              <div className="flex gap-1 border-2 border-border p-0.5" style={{ borderRadius: '2px', width: 'fit-content' }}>
                {[
                  { icon: AlignLeft, value: 'left' },
                  { icon: AlignCenter, value: 'center' },
                  { icon: AlignRight, value: 'right' },
                ].map(({ icon: AlignIcon, value }) => (
                  <button
                    key={value}
                    onClick={() => onChangeStyle({ textAlign: value })}
                    className={`flex h-7 w-7 items-center justify-center text-xs transition-colors ${
                      (section.style?.textAlign as string) === value
                        ? 'bg-accent-soft text-accent'
                        : 'text-ink-2 hover:bg-ink/5 hover:text-ink'
                    }`}
                    style={{ borderRadius: '2px' }}
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
