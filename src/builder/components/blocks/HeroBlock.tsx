import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

const LAYOUTS = [
  { value: 'center', label: 'Centrado' },
  { value: 'left', label: 'Alinhado à esquerda' },
  { value: 'split', label: 'Dividido (imagem + texto)' },
  { value: 'full-image', label: 'Imagem de fundo' },
];

export const heroBlock: BlockDefinition = {
  type: 'hero',
  label: 'Hero',
  icon: 'LayoutTemplate',
  category: 'hero',
  description: 'Secção principal de destaque com título, imagem e CTA',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'A tua loja online', placeholder: 'Título principal', section: 'Conteúdo' },
          { type: 'textarea', label: 'subtitle', default: 'Descobre os melhores produtos com entrega rápida em todo o país', placeholder: 'Subtítulo', section: 'Conteúdo' },
          { type: 'text', label: 'buttonText', default: 'Comprar agora', placeholder: 'Texto do botão', section: 'Conteúdo' },
          { type: 'url', label: 'buttonUrl', default: '/s/{slug}/products', placeholder: 'Link do botão', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Media',
        fields: [
          { type: 'image', label: 'imageUrl', default: '', placeholder: 'URL da imagem', section: 'Media' },
          { type: 'text', label: 'imageAlt', default: 'Imagem de destaque', placeholder: 'Texto alternativo', section: 'Media' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#1e293b', section: 'Estilo' },
          { type: 'color', label: 'buttonColor', default: '#1d4ed8', section: 'Estilo' },
          { type: 'color', label: 'accentColor', default: '#3b82f6', section: 'Estilo' },
          { type: 'select', label: 'layout', default: 'center', options: LAYOUTS, section: 'Estilo' },
          { type: 'number', label: 'minHeight', default: 500, min: 200, max: 900, step: 10, section: 'Estilo' },
          { type: 'range', label: 'overlay', default: 0, min: 0, max: 100, step: 5, section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'A tua loja online',
    subtitle: 'Descobre os melhores produtos com entrega rápida em todo o país',
    buttonText: 'Comprar agora',
    buttonUrl: '/s/{slug}/products',
    imageUrl: '',
    imageAlt: 'Imagem de destaque',
    bgColor: '#ffffff',
    textColor: '#1e293b',
    buttonColor: '#1d4ed8',
    accentColor: '#3b82f6',
    layout: 'center',
    minHeight: 500,
    overlay: 0,
  },
  component: function HeroBlock({
    settings, style, isEditing, onSelect, id, onChangeSettings,
  }) {
    const {
      title, subtitle, buttonText, buttonUrl, imageUrl, imageAlt,
      bgColor, textColor, buttonColor, layout, minHeight, overlay,
    } = settings as Record<string, string>;
    const hasImage = imageUrl && imageUrl !== '';

    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);

    const layouts: Record<string, string> = {
      center: 'items-center justify-center text-center',
      left: 'items-start justify-center text-left',
      split: 'items-center justify-between text-left grid-cols-2',
      'full-image': 'items-center justify-center text-center',
    };

    if (layout === 'split') {
      return (
        <section
          id={id}
          onClick={() => onSelect?.(id)}
          className={`relative grid ${layouts[layout] ?? layouts.center} gap-8 px-6 md:px-12`}
          style={{ minHeight: `${minHeight ?? 500}px`, backgroundColor: bgColor, color: textColor, ...style }}
        >
          <div className="flex flex-col justify-center py-12">
            <EditableText tag="h1" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl" />
            {subtitle !== undefined && <EditableText tag="p" isEditing={isEditing} value={subtitle || ''} onChange={(v) => handleChange('subtitle', v)} className="mt-4 max-w-lg text-lg opacity-80" />}
            {buttonText && (
              <EditableText tag="span" isEditing={isEditing} value={buttonText} onChange={(v) => handleChange('buttonText', v)} className="mt-6 inline-flex h-12 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110" style={{ backgroundColor: buttonColor }} />
            )}
          </div>
          {hasImage && (
            <div className="flex items-center justify-center py-12">
              <img src={imageUrl} alt={imageAlt || ''} className="max-h-[450px] w-full rounded-2xl object-cover shadow-lg" />
            </div>
          )}
        </section>
      );
    }

    if (layout === 'full-image' && hasImage) {
      return (
        <section
          id={id}
          onClick={() => onSelect?.(id)}
          className="relative flex items-center justify-center overflow-hidden"
          style={{ minHeight: `${minHeight ?? 500}px`, ...style }}
        >
          <img src={imageUrl} alt={imageAlt || ''} className="absolute inset-0 h-full w-full object-cover" />
          {overlay > 0 && (
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(+overlay) / 100})` }} />
          )}
          <div className="relative z-10 max-w-2xl px-6 py-16 text-center" style={{ color: textColor }}>
            <EditableText tag="h1" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl" />
            {subtitle !== undefined && <EditableText tag="p" isEditing={isEditing} value={subtitle || ''} onChange={(v) => handleChange('subtitle', v)} className="mt-4 text-lg opacity-90" />}
            {buttonText && (
              <EditableText tag="span" isEditing={isEditing} value={buttonText} onChange={(v) => handleChange('buttonText', v)} className="mt-6 inline-flex h-12 items-center rounded-xl px-6 text-sm font-semibold shadow-sm transition-all hover:brightness-110" style={{ backgroundColor: buttonColor, color: '#fff' }} />
            )}
          </div>
        </section>
      );
    }

    return (
      <section
        id={id}
        onClick={() => onSelect?.(id)}
        className={`flex flex-col ${layouts[layout] ?? layouts.center} px-6 py-16 md:px-12 md:py-20`}
        style={{ minHeight: `${minHeight ?? 500}px`, backgroundColor: bgColor, color: textColor, ...style }}
      >
        <div className="max-w-3xl">
          {hasImage && layout !== 'split' && (
            <img src={imageUrl} alt={imageAlt || ''} className="mb-8 max-h-[300px] w-full rounded-2xl object-cover shadow-lg" />
          )}
          <EditableText tag="h1" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl" />
          {subtitle !== undefined && <EditableText tag="p" isEditing={isEditing} value={subtitle || ''} onChange={(v) => handleChange('subtitle', v)} className="mt-4 text-lg opacity-80" />}
          {buttonText && (
            <EditableText tag="span" isEditing={isEditing} value={buttonText} onChange={(v) => handleChange('buttonText', v)} className="mt-6 inline-flex h-12 items-center rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110" style={{ backgroundColor: buttonColor }} />
          )}
        </div>
      </section>
    );
  },
};
