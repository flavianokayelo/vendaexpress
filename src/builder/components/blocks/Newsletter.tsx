import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const newsletterBlock: BlockDefinition = {
  type: 'newsletter',
  label: 'Newsletter',
  icon: 'Mail',
  category: 'marketing',
  description: 'Formulário de subscrição de newsletter',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Fica por dentro', placeholder: 'Título', section: 'Conteúdo' },
          { type: 'text', label: 'subtitle', default: 'Recebe as melhores ofertas diretamente no teu email', placeholder: 'Subtítulo', section: 'Conteúdo' },
          { type: 'text', label: 'buttonText', default: 'Subscrever', placeholder: 'Texto do botão', section: 'Conteúdo' },
          { type: 'text', label: 'placeholder', default: 'O teu email', placeholder: 'Placeholder do input', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#1e293b', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'buttonColor', default: '#3b82f6', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Fica por dentro',
    subtitle: 'Recebe as melhores ofertas diretamente no teu email',
    buttonText: 'Subscrever',
    placeholder: 'O teu email',
    bgColor: '#1e293b',
    textColor: '#ffffff',
    buttonColor: '#3b82f6',
  },
  component: function NewsletterBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, subtitle, buttonText, placeholder, bgColor, textColor, buttonColor } = settings as Record<string, string>;

    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-14 md:px-12 md:py-16" style={{ backgroundColor: bgColor || '#1e293b', color: textColor || '#ffffff', ...style }}>
        <div className="mx-auto max-w-xl text-center">
          {title !== undefined && <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="text-2xl font-bold md:text-3xl" />}
          {subtitle !== undefined && <EditableText tag="p" isEditing={isEditing} value={subtitle || ''} onChange={(v) => handleChange('subtitle', v)} className="mt-2 text-sm opacity-80" />}
          <div className="mt-6 flex gap-2">
            <input
              type="email"
              placeholder={placeholder || 'O teu email'}
              className="flex-1 rounded-xl border-0 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              readOnly
            />
            <EditableText tag="span" isEditing={isEditing} value={buttonText || ''} onChange={(v) => handleChange('buttonText', v)} className="rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-all hover:brightness-110" style={{ backgroundColor: buttonColor }} />
          </div>
        </div>
      </section>
    );
  },
};
