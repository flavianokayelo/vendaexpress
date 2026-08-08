import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const testimonialsBlock: BlockDefinition = {
  type: 'testimonials',
  label: 'Depoimentos',
  icon: 'MessageSquare',
  category: 'marketing',
  description: 'Depoimentos de clientes',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'O que dizem os nossos clientes', placeholder: 'Título', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#f8fafc', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#1e293b', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'O que dizem os nossos clientes',
    bgColor: '#f8fafc',
    textColor: '#1e293b',
  },
  component: function TestimonialsBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, bgColor, textColor } = settings as Record<string, string>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);
    const testimonials = [
      { name: 'Maria Silva', text: 'Produtos de excelente qualidade e entrega super rápida. Recomendo!', rating: 5 },
      { name: 'João Santos', text: 'A melhor loja online de Angola. Preços imbatíveis.', rating: 5 },
      { name: 'Ana Paulo', text: 'Comprei pela primeira vez e fiquei impressionada com o atendimento.', rating: 4 },
    ];

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#f8fafc', color: textColor, ...style }}>
        {title !== undefined && <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="mb-10 text-center text-2xl font-bold md:text-3xl" style={{ color: textColor }} />}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, j) => (
                  <svg key={j} className={`h-4 w-4 ${j < t.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 text-sm font-semibold text-slate-800">— {t.name}</div>
            </div>
          ))}
        </div>
      </section>
    );
  },
};
