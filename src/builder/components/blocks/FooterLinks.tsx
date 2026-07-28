import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const footerLinksBlock: BlockDefinition = {
  type: 'footer-links',
  label: 'Rodapé',
  icon: 'ArrowDownToLine',
  category: 'footer',
  description: 'Rodapé com links e informação',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'storeName', default: 'Minha Loja', placeholder: 'Nome da loja', section: 'Conteúdo' },
          { type: 'textarea', label: 'description', default: 'A melhor loja online de Angola', placeholder: 'Descrição', section: 'Conteúdo' },
          { type: 'text', label: 'email', default: 'ola@minhaloja.co.ao', placeholder: 'Email de contacto', section: 'Conteúdo' },
          { type: 'text', label: 'phone', default: '+244 900 000 000', placeholder: 'Telefone', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'color', label: 'bgColor', default: '#0f172a', section: 'Estilo' },
          { type: 'color', label: 'textColor', default: '#94a3b8', section: 'Estilo' },
          { type: 'color', label: 'headingColor', default: '#ffffff', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    storeName: 'Minha Loja',
    description: 'A melhor loja online de Angola',
    email: 'ola@minhaloja.co.ao',
    phone: '+244 900 000 000',
    bgColor: '#0f172a',
    textColor: '#94a3b8',
    headingColor: '#ffffff',
  },
  component: function FooterLinksBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { storeName, description, email, phone, bgColor, textColor, headingColor } = settings as Record<string, string>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);

    return (
      <footer id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#0f172a', color: textColor || '#94a3b8', ...style }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <EditableText tag="h3" isEditing={isEditing} value={storeName || ''} onChange={(v) => handleChange('storeName', v)} className="text-lg font-bold" style={{ color: headingColor }} />
              {description !== undefined && <EditableText tag="p" isEditing={isEditing} value={description || ''} onChange={(v) => handleChange('description', v)} className="mt-2 text-sm leading-relaxed" />}
              <div className="mt-4 flex gap-3">
                <EditableText tag="span" isEditing={isEditing} value={email || ''} onChange={(v) => handleChange('email', v)} className="text-xs" />
                <EditableText tag="span" isEditing={isEditing} value={phone || ''} onChange={(v) => handleChange('phone', v)} className="text-xs" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: headingColor }}>Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#" className="transition-colors hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Produtos</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Contactos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: headingColor }}>Ajuda</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#" className="transition-colors hover:text-white">FAQ</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Envio e devoluções</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Política de privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs" style={{ color: textColor }}>
            &copy; 2025 <EditableText tag="span" isEditing={isEditing} value={storeName || ''} onChange={(v) => handleChange('storeName', v)} />. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    );
  },
};
