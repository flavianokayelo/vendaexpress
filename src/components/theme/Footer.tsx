import { useState } from 'react';
import { ChevronDown, MessageCircle, Zap } from 'lucide-react';
import { useStorefrontTheme } from '../../storefrontTheme/ThemeProvider';
import type { Store, Category } from '../../lib/types';

export function Footer({
  store,
  categories,
  onSelectCategory,
}: {
  store: Store;
  categories: Category[];
  onSelectCategory?: (id: string) => void;
}) {
  const theme = useStorefrontTheme();
  const supportItems = theme.footer.supportItems;
  const [openItem, setOpenItem] = useState<number | null>(null);
  const year = new Date().getFullYear();
  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, '') : '';

  return (
    <footer className="mt-4 bg-[var(--sf-ink)] text-white/75">
      <div className="mx-auto max-w-[1240px] px-4 pb-0 pt-10 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-white text-[var(--sf-primary)]">
                <Zap size={18} strokeWidth={1.8} fill="currentColor" />
              </span>
              <span className="font-display text-[21px] font-semibold text-white">{store.name}</span>
            </div>
            {store.description && <p className="max-w-[34ch] text-sm leading-[1.55] text-white/60">{store.description}</p>}
          </div>

          {categories.length > 0 && (
            <div>
              <div className="mb-3.5 font-display text-[13px] font-semibold uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--sf-accent)_55%,white)]">
                Categorias
              </div>
              <ul className="flex flex-col gap-2.5 text-sm">
                {categories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory?.(c.id)}
                      className="text-left text-white/65 transition-colors hover:text-white"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {supportItems.length > 0 && (
            <div>
              <div className="mb-3.5 font-display text-[13px] font-semibold uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--sf-accent)_55%,white)]">
                Apoio
              </div>
              <ul className="flex flex-col gap-1 text-sm">
                {supportItems.map((item, i) => {
                  const open = openItem === i;
                  return (
                    <li key={item.title} className="border-b border-white/10 py-1.5 first:pt-0 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenItem(open ? null : i)}
                        className="flex w-full items-center justify-between gap-2 text-left text-white/80 transition-colors hover:text-white"
                      >
                        {item.title}
                        <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </button>
                      {open && <p className="mt-1.5 text-[13px] leading-[1.5] text-white/55">{item.content}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-3.5 font-display text-[13px] font-semibold uppercase tracking-[0.09em] text-[color-mix(in_srgb,var(--sf-accent)_55%,white)]">
              Contacto
            </div>
            <div className="flex flex-col gap-2.5 text-sm">
              {waDigits ? (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/65 transition-colors hover:text-white"
                >
                  <MessageCircle size={15} /> {store.whatsapp}
                </a>
              ) : (
                <span className="text-white/45">Sem contacto configurado</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-9 border-t border-white/15 px-0 py-6 text-[13px] text-white/55">
          © {year} {store.name}. Loja criada com Venda Express.
        </div>
      </div>
    </footer>
  );
}
