import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const textBlock: BlockDefinition = {
  type: 'text-block',
  label: 'Texto',
  icon: 'Type',
  category: 'content',
  description: 'Bloco de texto formatado',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Título da secção', placeholder: 'Título', section: 'Conteúdo' },
          { type: 'textarea', label: 'content', default: 'Escreve o teu conteúdo aqui...', placeholder: 'Conteúdo', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'select', label: 'textAlign', default: 'left', options: [{ value: 'left', label: 'Esquerda' }, { value: 'center', label: 'Centro' }, { value: 'right', label: 'Direita' }], section: 'Estilo' },
          { type: 'number', label: 'maxWidth', default: 720, min: 400, max: 1200, step: 20, section: 'Estilo' },
          { type: 'color', label: 'bgColor', default: 'transparent', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#475569', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Título da secção',
    content: 'Escreve o teu conteúdo aqui...',
    textAlign: 'left',
    maxWidth: 720,
    bgColor: 'transparent',
    textColor: '#475569',
  },
  component: function TextBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, content, textAlign, maxWidth, bgColor, textColor } = settings as Record<string, string>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);
    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || 'transparent', ...style }}>
        <div className="mx-auto" style={{ maxWidth: `${maxWidth ?? 720}px` }}>
          {title !== undefined && <EditableText tag="h2" isEditing={isEditing} value={title} onChange={(v) => handleChange('title', v)} className="text-2xl font-bold text-slate-900 md:text-3xl" style={{ textAlign: textAlign as any, color: textColor }} />}
          {content !== undefined && (
            <EditableText tag="div" isEditing={isEditing} value={content} onChange={(v) => handleChange('content', v)} className="mt-4 text-base leading-relaxed" style={{ textAlign: textAlign as any, color: textColor }} />
          )}
        </div>
      </section>
    );
  },
};
