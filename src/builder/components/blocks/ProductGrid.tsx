import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

const LAYOUTS = [
  { value: 'grid', label: 'Grelha' },
  { value: 'list', label: 'Lista' },
];

export const productGridBlock: BlockDefinition = {
  type: 'product-grid',
  label: 'Produtos (Grelha)',
  icon: 'LayoutGrid',
  category: 'products',
  description: 'Grelha de produtos da loja',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Os nossos produtos', placeholder: 'Título da secção', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Configuração',
        fields: [
          { type: 'select', label: 'layout', default: 'grid', options: LAYOUTS, section: 'Configuração' },
          { type: 'number', label: 'columns', default: 4, min: 1, max: 6, step: 1, section: 'Configuração' },
          { type: 'number', label: 'limit', default: 8, min: 1, max: 50, step: 1, section: 'Configuração' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'cardBgColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#1e293b', section: 'Estilo' },
          { type: 'color', label: 'priceColor', default: '#1d4ed8', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Os nossos produtos',
    layout: 'grid',
    columns: 4,
    limit: 8,
    bgColor: '#ffffff',
    cardBgColor: '#ffffff',
    textColor: '#1e293b',
    priceColor: '#1d4ed8',
  },
  component: function ProductGridBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, layout, columns, limit, bgColor, cardBgColor, textColor, priceColor } = settings as Record<string, string>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);
    const placeholderProducts = Array.from({ length: +limit || 4 }, (_, i) => ({
      id: `p${i}`,
      name: `Produto ${i + 1}`,
      price: (Math.random() * 50000 + 1000).toFixed(0),
      image: null,
    }));

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#ffffff', ...style }}>
        {title !== undefined && <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="mb-8 text-center text-2xl font-bold md:text-3xl" style={{ color: textColor }} />}
        {layout === 'list' ? (
          <div className="mx-auto max-w-4xl space-y-4">
            {placeholderProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4" style={{ backgroundColor: cardBgColor }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400 text-xs">Foto</div>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: textColor }}>{p.name}</div>
                  <div className="text-sm font-semibold" style={{ color: priceColor }}>{+p.price} Kz</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-6xl" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${+columns || 4}, 1fr)`,
            gap: '1.5rem',
          }}>
            {placeholderProducts.map((p) => (
              <div key={p.id} className="group overflow-hidden rounded-2xl border border-slate-200 transition-shadow hover:shadow-lg" style={{ backgroundColor: cardBgColor }}>
                <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-400 text-sm">Imagem</div>
                <div className="p-4">
                  <div className="font-medium" style={{ color: textColor }}>{p.name}</div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: priceColor }}>{+p.price} Kz</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  },
};
