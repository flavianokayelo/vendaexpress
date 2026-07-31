import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="mx-auto mt-6 w-full max-w-[1240px] px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[18px] bg-[var(--sf-surface)] shadow-[0_4px_20px_rgba(29,31,32,0.08)]">
        <div className="relative h-[clamp(320px,40vw,440px)]">
          {slides.map((s, i) => {
            const hasText = !!(s.title || s.subtitle || s.cta);
            return (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? 'auto' : 'none' }}
              >
                {hasText ? (
                  <div className="grid h-full md:grid-cols-[1.05fr_1fr]">
                    <div
                      className={`relative flex flex-col justify-center gap-5 overflow-hidden px-6 py-10 text-white sm:px-10 md:px-[clamp(48px,6vw,80px)] ${
                        i % 2 === 0 ? 'bg-[#2f3b46] md:order-1' : 'bg-[#22313b] md:order-2'
                      }`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_at_0%_100%,rgba(255,255,255,0.09),transparent_60%)]" />
                      {s.kicker && (
                        <span className="relative inline-flex w-fit items-center rounded-[var(--sf-radius-pill)] bg-[var(--sf-accent)] px-3.5 py-1.5 font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-white">
                          {s.kicker}
                        </span>
                      )}
                      {s.title && (
                        <h2 className="relative font-display text-[clamp(32px,4vw,56px)] font-semibold leading-[1.04] tracking-[-0.015em]">
                          {s.title}
                        </h2>
                      )}
                      {s.subtitle && (
                        <p className="relative max-w-[42ch] text-[16px] leading-[1.55] text-white/85">
                          {s.subtitle}
                        </p>
                      )}
                      {s.cta && (
                        <div className="relative mt-2">
                          <button
                            onClick={onCtaClick}
                            className="inline-flex h-[48px] items-center rounded-[12px] bg-white px-7 font-display text-[15px] font-semibold text-[var(--sf-ink)] shadow-[0_2px_10px_rgba(29,31,32,0.12)] transition-all hover:-translate-y-[1px] hover:bg-[var(--sf-surface-muted)] hover:shadow-[0_6px_18px_rgba(29,31,32,0.16)]"
                          >
                            {s.cta}
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className={`relative hidden bg-[var(--sf-surface)] md:block ${
                        i % 2 === 0 ? 'md:order-2' : 'md:order-1'
                      }`}
                    >
                      <img
                        src={s.image}
                        alt={s.title || ''}
                        className={`h-full w-full object-cover ${i === idx ? 'animate-sf-kenburns' : ''}`}
                      />
                    </div>
                  </div>
                ) : (
                  <img
                    src={s.image}
                    alt={s.title || ''}
                    className={`h-full w-full object-cover ${i === idx ? 'animate-sf-kenburns' : ''}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
              aria-label="Anterior"
              className="absolute left-4 top-1/2 z-10 flex h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-[var(--sf-radius-pill)] bg-white/90 text-[var(--sf-ink)] shadow-[0_2px_8px_rgba(29,31,32,0.14)] transition-all hover:bg-white hover:shadow-[0_4px_14px_rgba(29,31,32,0.18)]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % slides.length)}
              aria-label="Seguinte"
              className="absolute right-4 top-1/2 z-10 flex h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-[var(--sf-radius-pill)] bg-white/90 text-[var(--sf-ink)] shadow-[0_2px_8px_rgba(29,31,32,0.14)] transition-all hover:bg-white hover:shadow-[0_4px_14px_rgba(29,31,32,0.18)]"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-[18px] left-0 right-0 z-10 flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Ir para banner ${i + 1}`}
                  className={`h-1.5 rounded-[var(--sf-radius-pill)] transition-all ${
                    i === idx ? 'w-7 bg-white' : 'w-2.5 bg-white/55'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
