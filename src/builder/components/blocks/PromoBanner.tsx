import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const promoBannerBlock: BlockDefinition = {
  type: 'promo-banner',
  label: 'Banner promocional',
  icon: 'Megaphone',
  category: 'marketing',
  description: 'Banner de promoção com CTA',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Promoção especial', placeholder: 'Título', section: 'Conteúdo' },
          { type: 'text', label: 'subtitle', default: 'Descontos incríveis por tempo limitado', placeholder: 'Subtítulo', section: 'Conteúdo' },
          { type: 'text', label: 'buttonText', default: 'Aproveitar', placeholder: 'Texto do botão', section: 'Conteúdo' },
          { type: 'url', label: 'buttonUrl', default: '#', placeholder: 'Link', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#1e3a8a', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'buttonColor', default: '#f59e0b', section: 'Estilo' },
          { type: 'image', label: 'bgImage', default: '', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Promoção especial',
    subtitle: 'Descontos incríveis por tempo limitado',
    buttonText: 'Aproveitar',
    buttonUrl: '#',
    bgColor: '#1e3a8a',
    textColor: '#ffffff',
    buttonColor: '#f59e0b',
    bgImage: '',
  },
  component: function PromoBannerBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, subtitle, buttonText, buttonUrl, bgColor, textColor, buttonColor, bgImage } = settings as Record<string, string>;
    const hasBgImage = bgImage && bgImage !== '';

    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);

    return (
      <section
        id={id}
        onClick={() => onSelect?.(id)}
        className="relative overflow-hidden px-6 py-16 md:px-12 md:py-20"
        style={{ backgroundColor: bgColor || '#1e3a8a', color: textColor || '#ffffff', ...style }}
      >
        {hasBgImage && (
          <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        )}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="text-3xl font-bold tracking-tight md:text-4xl" />
          {subtitle !== undefined && <EditableText tag="p" isEditing={isEditing} value={subtitle || ''} onChange={(v) => handleChange('subtitle', v)} className="mt-3 text-lg opacity-90" />}
          {buttonText && (
            <EditableText tag="span" isEditing={isEditing} value={buttonText} onChange={(v) => handleChange('buttonText', v)} className="mt-6 inline-flex h-12 items-center rounded-xl px-6 text-sm font-bold shadow-sm transition-all hover:brightness-110" style={{ backgroundColor: buttonColor, color: '#1e293b' }} />
          )}
        </div>
      </section>
    );
  },
};
