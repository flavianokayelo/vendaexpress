import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const productFeaturedBlock: BlockDefinition = {
  type: 'product-featured',
  label: 'Produto em destaque',
  icon: 'Star',
  category: 'products',
  description: 'Produto principal em destaque',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'productId', default: '', placeholder: 'ID do produto', hint: 'Deixa vazio para mostrar placeholder', section: 'Conteúdo' },
          { type: 'text', label: 'title', default: 'Produto em destaque', placeholder: 'Título', section: 'Conteúdo' },
          { type: 'textarea', label: 'description', default: 'Descrição breve do produto em destaque...', placeholder: 'Descrição', section: 'Conteúdo' },
          { type: 'text', label: 'buttonText', default: 'Ver produto', placeholder: 'Texto do botão', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#f1f5f9', section: 'Estilo' },
          { type: 'color', label: 'accentColor', default: '#1d4ed8', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    productId: '',
    title: 'Produto em destaque',
    description: 'Descrição breve do produto em destaque...',
    buttonText: 'Ver produto',
    bgColor: '#f1f5f9',
    accentColor: '#1d4ed8',
  },
  component: function ProductFeaturedBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, description, buttonText, bgColor, accentColor } = settings as Record<string, string>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#f1f5f9', ...style }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row">
          <div className="flex aspect-square w-full max-w-md items-center justify-center rounded-2xl bg-slate-200 text-slate-400 md:w-1/2">
            <span className="text-sm">Imagem do produto</span>
          </div>
          <div className="md:w-1/2">
            <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="text-2xl font-bold text-slate-900 md:text-3xl" />
            <EditableText tag="p" isEditing={isEditing} value={description || ''} onChange={(v) => handleChange('description', v)} className="mt-4 text-base leading-relaxed text-slate-600" />
            <p className="mt-4 text-2xl font-bold" style={{ color: accentColor }}>25.000 Kz</p>
            <EditableText tag="span" isEditing={isEditing} value={buttonText || ''} onChange={(v) => handleChange('buttonText', v)} className="mt-6 inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110" style={{ backgroundColor: accentColor }} />
          </div>
        </div>
      </section>
    );
  },
};
