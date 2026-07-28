import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const faqBlock: BlockDefinition = {
  type: 'faq',
  label: 'FAQ',
  icon: 'HelpCircle',
  category: 'marketing',
  description: 'Perguntas frequentes',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Perguntas frequentes', placeholder: 'Título', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#ffffff', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#1e293b', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Perguntas frequentes',
    bgColor: '#ffffff',
    textColor: '#1e293b',
  },
  component: function FAQBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, bgColor, textColor } = settings as Record<string, any>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);
    const faqs = [
      { q: 'Quanto tempo demora a entrega?', a: 'As entregas demoram 2-5 dias úteis dependendo da localização.' },
      { q: 'Quais os métodos de pagamento?', a: 'Aceitamos Multicaixa Express, transferência bancária e pagamento na entrega.' },
      { q: 'Posso trocar um produto?', a: 'Sim, tens 7 dias após a receção para solicitar troca.' },
    ];

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#ffffff', ...style }}>
        <div className="mx-auto max-w-3xl">
          {title !== undefined && <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="mb-8 text-center text-2xl font-bold md:text-3xl" style={{ color: textColor }} />}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 open:border-blue-200 open:ring-1 open:ring-blue-100">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-slate-800">
                  {faq.q}
                  <svg className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  },
};
