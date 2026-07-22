import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

export type HeroSlide = {
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
};

export function HeroCarousel({
  slides,
  accent,
  onCtaClick,
}: {
  slides: HeroSlide[];
  accent: string;
  onCtaClick?: () => void;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => setIdx(0), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative h-56 w-full overflow-hidden bg-slate-800 sm:h-72 md:h-96">
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? 'auto' : 'none' }}
        >
          <img src={s.image} alt={s.title || ''} className="h-full w-full object-contain" />
          {(s.title || s.subtitle) && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 sm:px-8 sm:pb-10 md:px-12 md:pb-12">
                <div className="mx-auto max-w-6xl">
                  {s.title && <h2 className="text-xl font-bold text-white sm:text-2xl md:text-4xl">{s.title}</h2>}
                  {s.subtitle && <p className="mt-1.5 max-w-md text-xs text-white/80 sm:text-sm md:text-base">{s.subtitle}</p>}
                  {s.cta && (
                    <Button
                      className="mt-3 sm:mt-4"
                      size="sm"
                      style={{ backgroundColor: accent, borderColor: accent }}
                      onClick={onCtaClick}
                    >
                      {s.cta}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-800 hover:bg-white sm:left-3 sm:h-9 sm:w-9"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % slides.length)}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-800 hover:bg-white sm:right-3 sm:h-9 sm:w-9"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === idx ? 18 : 6, backgroundColor: i === idx ? accent : 'rgba(255,255,255,0.6)' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}