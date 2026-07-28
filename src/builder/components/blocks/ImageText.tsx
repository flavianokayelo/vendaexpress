import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

const LAYOUTS = [
  { value: 'image-left', label: 'Imagem à esquerda' },
  { value: 'image-right', label: 'Imagem à direita' },
];

export const imageTextBlock: BlockDefinition = {
  type: 'image-text',
  label: 'Imagem + Texto',
  icon: 'Image',
  category: 'content',
  description: 'Secção com imagem e texto lado a lado',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Título da secção', placeholder: 'Título', section: 'Conteúdo' },
          { type: 'textarea', label: 'content', default: 'Descreve o teu produto ou serviço...', placeholder: 'Conteúdo', section: 'Conteúdo' },
          { type: 'text', label: 'buttonText', default: 'Saber mais', placeholder: 'Texto do botão', section: 'Conteúdo' },
          { type: 'url', label: 'buttonUrl', default: '#', placeholder: 'Link do botão', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Media',
        fields: [
          { type: 'image', label: 'imageUrl', default: '', placeholder: 'URL da imagem', section: 'Media' },
          { type: 'text', label: 'imageAlt', default: '', placeholder: 'Texto alternativo', section: 'Media' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'select', label: 'layout', default: 'image-left', options: LAYOUTS, section: 'Estilo' },
          { type: 'color', label: 'bgColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#1e293b', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Título da secção',
    content: 'Descreve o teu produto ou serviço...',
    buttonText: 'Saber mais',
    buttonUrl: '#',
    imageUrl: '',
    imageAlt: '',
    layout: 'image-left',
    bgColor: '#ffffff',
    textColor: '#1e293b',
  },
  component: function ImageTextBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, content, buttonText, buttonUrl, imageUrl, imageAlt, layout, bgColor, textColor } = settings as Record<string, string>;
    const isLeft = layout === 'image-left';
    const hasImage = imageUrl && imageUrl !== '';

    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#ffffff', ...style }}>
        <div className={`mx-auto flex max-w-6xl flex-col items-center gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
          {hasImage && (
            <div className="w-full md:w-1/2">
              <img src={imageUrl} alt={imageAlt || ''} className="h-auto w-full rounded-2xl object-cover shadow-lg" />
            </div>
          )}
          <div className={`w-full ${hasImage ? 'md:w-1/2' : 'md:max-w-2xl'}`}>
            <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="text-2xl font-bold md:text-3xl" style={{ color: textColor }} />
            <EditableText tag="p" isEditing={isEditing} value={content || ''} onChange={(v) => handleChange('content', v)} className="mt-4 text-base leading-relaxed opacity-80" style={{ color: textColor }} />
            {buttonText && (
              <EditableText tag="span" isEditing={isEditing} value={buttonText} onChange={(v) => handleChange('buttonText', v)} className="mt-6 inline-flex h-11 items-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800" />
            )}
          </div>
        </div>
      </section>
    );
  },
};
