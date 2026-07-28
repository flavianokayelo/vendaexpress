import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const categoryListBlock: BlockDefinition = {
  type: 'category-list',
  label: 'Categorias',
  icon: 'FolderTree',
  category: 'products',
  description: 'Lista de categorias da loja',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Categorias', placeholder: 'Título', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Configuração',
        fields: [
          { type: 'number', label: 'columns', default: 4, min: 1, max: 6, step: 1, section: 'Configuração' },
          { type: 'number', label: 'limit', default: 8, min: 1, max: 20, step: 1, section: 'Configuração' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'cardColor', default: '#f8fafc', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#1e293b', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Categorias',
    columns: 4,
    limit: 8,
    bgColor: '#ffffff',
    cardColor: '#f8fafc',
    textColor: '#1e293b',
  },
  component: function CategoryListBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, columns, limit, bgColor, cardColor, textColor } = settings as Record<string, any>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);
    const placeholders = ['Roupas', 'Calçados', 'Acessórios', 'Eletrónicos', 'Casa', 'Beleza', 'Desporto', 'Kids'].slice(0, +limit || 8);

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#ffffff', ...style }}>
        {title !== undefined && <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="mb-8 text-center text-2xl font-bold md:text-3xl" style={{ color: textColor }} />}
        <div className="mx-auto max-w-6xl" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${+columns || 4}, 1fr)`,
          gap: '1rem',
        }}>
          {placeholders.map((cat, i) => (
            <div
              key={i}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl p-6 text-center transition-shadow hover:shadow-md"
              style={{ backgroundColor: cardColor || '#f8fafc' }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm text-2xl">
                {String.fromCodePoint(0x1F3F7 + i)}
              </div>
              <span className="text-sm font-medium" style={{ color: textColor }}>{cat}</span>
            </div>
          ))}
        </div>
      </section>
    );
  },
};
