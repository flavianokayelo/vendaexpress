import { useCallback } from 'react';
import { EditableText } from '../shared/EditableText';
import type { BlockDefinition } from '../../types/block';

export const galleryBlock: BlockDefinition = {
  type: 'gallery',
  label: 'Galeria',
  icon: 'Images',
  category: 'content',
  description: 'Galeria de imagens',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'text', label: 'title', default: 'Galeria', placeholder: 'Título', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'number', label: 'columns', default: 3, min: 1, max: 6, step: 1, section: 'Estilo' },
          { type: 'number', label: 'gap', default: 16, min: 0, max: 64, step: 4, section: 'Estilo' },
          { type: 'color', label: 'bgColor', default: '#ffffff', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    title: 'Galeria',
    columns: 3,
    gap: 16,
    bgColor: '#ffffff',
    images: [],
  },
  component: function GalleryBlock({ settings, style, isEditing, onSelect, id, onChangeSettings }) {
    const { title, columns, gap, bgColor, images } = settings as Record<string, unknown>;
    const handleChange = useCallback((key: string, value: string) => {
      onChangeSettings?.({ [key]: value });
    }, [onChangeSettings]);
    const imgList: string[] = Array.isArray(images) ? (images as string[]) : [];

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#ffffff', ...style }}>
        {title !== undefined && <EditableText tag="h2" isEditing={isEditing} value={title || ''} onChange={(v) => handleChange('title', v)} className="mb-8 text-center text-2xl font-bold text-slate-900 md:text-3xl" />}
        {imgList.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 py-16 text-sm text-slate-400">
            Nenhuma imagem adicionada. Usa o inspector para adicionar URLs.
          </div>
        ) : (
          <div
            className="mx-auto grid max-w-6xl"
            style={{
              gridTemplateColumns: `repeat(${+columns || 3}, 1fr)`,
              gap: `${gap || 16}px`,
            }}
          >
            {imgList.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-xl">
                <img src={url} alt={`Galeria ${i + 1}`} className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  },
};
