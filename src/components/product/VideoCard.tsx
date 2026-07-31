import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX, Plus } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import type { Product } from '../../lib/types';

// Fração mínima do card visível para considerar "na tela" e disparar o autoplay,
// igual ao comportamento de feeds de vídeo tipo Reels/TikTok.
const VISIBILITY_THRESHOLD = 0.6;

export function VideoCard({
  p,
  currency,
  accent,
  onAdd,
}: {
  p: Product;
  currency?: string;
  accent: string;
  onAdd: (p: Product) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userPausedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const videoUrl = p.video ? resolveMediaUrl(p.video.url) : null;
  const posterUrl = p.video?.thumbnail_url ? resolveMediaUrl(p.video.thumbnail_url) ?? undefined : undefined;

/* 
  console.log('[debug VideoCard]', {
    productName: p.name,
    rawVideo: p.video,
    resolvedVideoUrl: videoUrl,
    resolvedPosterUrl: posterUrl,
  });
*/

  // Autoplay enquanto o card estiver visível na tela; pausa ao sair.
  // Se o utilizador pausou manualmente, não retoma sozinho até ele tocar de novo.
  useEffect(() => {
    if (!videoUrl) return;
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_THRESHOLD) {
          if (!userPausedRef.current) {
            video.play().then(() => setPlaying(true)).catch(() => {});
          }
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, VISIBILITY_THRESHOLD, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [videoUrl]);

  if (!videoUrl) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      className="relative aspect-[9/16] w-40 flex-shrink-0 cursor-pointer snap-center overflow-hidden rounded-2xl bg-slate-900 transition-transform duration-200 hover:scale-[1.02] sm:w-48"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[var(--sf-ink)] shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
            <Play size={22} fill="currentColor" stroke="none" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">{p.name}</h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white">{formatCurrency(Number(p.price), currency)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(p);
            }}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}