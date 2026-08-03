import type { ThemeBanners } from '../../storefrontTheme/types';
import { resolveMediaUrl } from '../../lib/api';

function src(image: string): string {
  return resolveMediaUrl(image) || image;
}

/** Área de banners promocionais configurável pelo tema — uma grelha de
 * promoções (banners.promoGrid) e/ou uma faixa horizontal de desconto
 * (banners.discountStrip). Só renderiza o que estiver preenchido. */
export function PromoBannerGrid({ banners }: { banners: ThemeBanners }) {
  const grid = banners.promoGrid ?? [];
  const strip = banners.discountStrip;

  if (grid.length === 0 && !strip) return null;

  return (
    <div className="space-y-1.5">
      {grid.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {grid.map((b, i) => (
            <a
              key={i}
              href={b.href || undefined}
              target={b.href ? '_blank' : undefined}
              rel={b.href ? 'noopener noreferrer' : undefined}
              className="group block overflow-hidden rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)] bg-[var(--sf-surface)] transition-colors duration-150 hover:border-[var(--sf-primary)]"
            >
              <img
                src={src(b.image)}
                alt={b.title || `Promoção ${i + 1}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              />
              {(b.title || b.subtitle) && (
                <div className="px-2 py-1.5">
                  {b.title && (
                    <span className="block truncate text-[12px] font-bold text-[var(--sf-ink)]">
                      {b.title}
                    </span>
                  )}
                  {b.subtitle && (
                    <span className="block truncate text-[11px] text-[var(--sf-ink-secondary)]">
                      {b.subtitle}
                    </span>
                  )}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      {strip && (
        <a
          href={strip.href || undefined}
          target={strip.href ? '_blank' : undefined}
          rel={strip.href ? 'noopener noreferrer' : undefined}
          className="group relative block h-[72px] overflow-hidden rounded-[var(--sf-radius-sm)] bg-[var(--sf-surface-muted)] sm:h-[88px]"
        >
          <img
            src={src(strip.image)}
            alt={strip.title || 'Promoção'}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {(strip.title || strip.subtitle) && (
            <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/55 via-black/20 to-transparent px-4 sm:px-6">
              {strip.title && (
                <span className="text-[14px] font-bold text-white sm:text-[16px]">
                  {strip.title}
                </span>
              )}
              {strip.subtitle && (
                <span className="text-[12px] text-white/85">{strip.subtitle}</span>
              )}
            </div>
          )}
        </a>
      )}
    </div>
  );
}
