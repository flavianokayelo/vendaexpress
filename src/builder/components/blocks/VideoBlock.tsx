import type { BlockDefinition } from '../../types/block';

export const videoBlock: BlockDefinition = {
  type: 'video',
  label: 'Vídeo',
  icon: 'Video',
  category: 'content',
  description: 'Bloco de vídeo incorporado',
  schema: {
    sections: [
      {
        title: 'Conteúdo',
        fields: [
          { type: 'url', label: 'videoUrl', default: '', placeholder: 'URL do vídeo (YouTube, Vimeo)', section: 'Conteúdo' },
          { type: 'image', label: 'thumbnail', default: '', placeholder: 'URL da thumbnail', section: 'Conteúdo' },
        ],
      },
      {
        title: 'Opções',
        fields: [
          { type: 'boolean', label: 'autoplay', default: false, section: 'Opções' },
          { type: 'boolean', label: 'loop', default: false, section: 'Opções' },
          { type: 'boolean', label: 'muted', default: false, section: 'Opções' },
          { type: 'boolean', label: 'controls', default: true, section: 'Opções' },
        ],
      },
      {
        title: 'Estilo',
        fields: [
          { type: 'number', label: 'maxWidth', default: 800, min: 400, max: 1400, step: 20, section: 'Estilo' },
          { type: 'color', label: 'bgColor', default: '#f8fafc', section: 'Estilo' },
        ],
      },
    ],
  },
  defaults: {
    videoUrl: '',
    thumbnail: '',
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    maxWidth: 800,
    bgColor: '#f8fafc',
  },
  component: function VideoBlock({ settings, style, onSelect, id }) {
    const { videoUrl, thumbnail, controls, maxWidth, bgColor } = settings as Record<string, unknown>;
    const hasVideo = videoUrl && videoUrl !== '';

    const getEmbedUrl = (url: string): string | null => {
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      return null;
    };

    const embedUrl = hasVideo ? getEmbedUrl(videoUrl) : null;

    return (
      <section id={id} onClick={() => onSelect?.(id)} className="px-6 py-12 md:px-12" style={{ backgroundColor: bgColor || '#f8fafc', ...style }}>
        <div className="mx-auto" style={{ maxWidth: `${maxWidth ?? 800}px` }}>
          {embedUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl shadow-lg">
              <iframe
                src={embedUrl}
                className="h-full w-full"
                allow={controls !== false ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope' : ''}
                allowFullScreen
                title="Vídeo incorporado"
              />
            </div>
          ) : hasVideo ? (
            <video
              src={videoUrl}
              controls={controls !== false}
              poster={thumbnail || undefined}
              className="w-full rounded-2xl shadow-lg"
              style={{ maxHeight: '600px' }}
            />
          ) : (
            <div className="flex items-center justify-center rounded-2xl bg-slate-100 py-16 text-sm text-slate-400">
              Adiciona um URL de vídeo no inspector
            </div>
          )}
        </div>
      </section>
    );
  },
};
