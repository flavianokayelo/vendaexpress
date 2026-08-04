import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export type HeroSlide = {
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  kicker?: string;
};

export function Hero({
  slides,
  mode = 'carousel',
  onCtaClick,
}: {
  slides: HeroSlide[];
  mode?: 'carousel' | 'static' | 'none';
  onCtaClick?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const isCarousel = mode === 'carousel';

  useEffect(() => setIdx(0), [slides.length, mode]);

  useEffect(() => {
    if (!isCarousel || slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length, isCarousel]);

  if (mode === 'none' || slides.length === 0) return null;

  const s = slides[idx];
  const hasCaption = !!(s.title || s.kicker);

  return (
    <div className="group relative h-full overflow-hidden rounded-[var(--sf-radius-lg)] bg-[var(--sf-surface-muted)] shadow-[var(--sf-shadow-md)]">
        <div
          className={`relative h-full min-h-[150px] ${s.cta ? 'cursor-pointer' : ''}`}
          onClick={() => s.cta && onCtaClick?.()}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={idx}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={s.image} alt={s.title || ''} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              {hasCaption && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-1.5 px-4 py-3.5 sm:px-6 sm:py-5">
                  {s.kicker && (
                    <span className="rounded-[var(--sf-radius-pill)] bg-white/20 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white backdrop-blur-sm sm:text-[11.5px]">
                      {s.kicker}
                    </span>
                  )}
                  {s.title && (
                    <div className="max-w-[85%] truncate font-display text-[16px] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[24px]">
                      {s.title}
                    </div>
                  )}
                  {s.subtitle && (
                    <div className="hidden max-w-[70%] truncate text-[12.5px] text-white/85 sm:block">
                      {s.subtitle}
                    </div>
                  )}
                  {s.cta && (
                    <span className="pointer-events-auto mt-1 inline-flex items-center gap-1.5 rounded-[var(--sf-radius-pill)] bg-white px-3.5 py-1.5 text-[11.5px] font-bold text-[var(--sf-ink)] shadow-[var(--sf-shadow-sm)] transition-transform duration-200 hover:scale-[1.04] sm:px-4 sm:text-[13px]">
                      {s.cta}
                      <ChevronRight size={13} strokeWidth={2.5} />
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {isCarousel && slides.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + slides.length) % slides.length); }}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/40 hover:scale-105 group-hover:opacity-100"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % slides.length); }}
              aria-label="Seguinte"
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/40 hover:scale-105 group-hover:opacity-100"
            >
              <ChevronRight size={17} />
            </button>
            <div className="absolute bottom-2.5 left-0 right-0 z-10 flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  aria-label={`Ir para banner ${i + 1}`}
                  className={`h-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all duration-300 ${
                    i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
    </div>
  );
}
