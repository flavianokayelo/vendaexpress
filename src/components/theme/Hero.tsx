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

export function Hero({ slides, onCtaClick }: { slides: HeroSlide[]; onCtaClick?: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => setIdx(0), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const s = slides[idx];
  const hasCaption = !!(s.title || s.kicker);

  return (
    <div className="relative h-full overflow-hidden rounded-[var(--sf-radius-md)] bg-[var(--sf-surface-muted)]">
        <div
          className={`relative h-full min-h-[150px] ${s.cta ? 'cursor-pointer' : ''}`}
          onClick={() => s.cta && onCtaClick?.()}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={idx}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <img src={s.image} alt={s.title || ''} className="h-full w-full object-cover" />
              {hasCaption && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent px-3 py-2.5 sm:px-5 sm:py-3.5">
                  {s.kicker && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-white/90 sm:text-[11px]">
                      {s.kicker}
                    </span>
                  )}
                  {s.title && (
                    <div className="truncate text-[13px] font-semibold text-white sm:text-[16px]">{s.title}</div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/45"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % slides.length)}
              aria-label="Seguinte"
              className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/45"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-1.5 left-0 right-0 z-10 flex justify-center gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Ir para banner ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
    </div>
  );
}
