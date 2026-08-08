import { useState } from 'react';
import { ChevronDown, MessageCircle, Zap } from 'lucide-react';
import { useStorefrontTheme } from '../../storefrontTheme/ThemeProvider';
import { resolveMediaUrl } from '../../lib/api';
import type { Store, Category } from '../../lib/types';

export function Footer({
  store,
  categories = [],
  onSelectCategory,
}: {
  store: Store;
  categories?: Category[];
  onSelectCategory?: (id: string) => void;
}) {
  const theme = useStorefrontTheme();
  const supportItems = theme.footer.supportItems;
  const [openItem, setOpenItem] = useState<number | null>(null);
  const year = new Date().getFullYear();
  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, '') : '';

  return (
    <footer className="relative mt-4 overflow-hidden bg-[var(--sf-ink)] text-white/75">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px 220px at 18% 0%, color-mix(in srgb, var(--sf-primary) 22%, transparent), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(520px 200px at 85% 100%, color-mix(in srgb, var(--sf-accent) 10%, transparent), transparent 70%)',
        }}
      />
      <div className="relative h-[3px] w-full" style={{ background: 'linear-gradient(90deg, var(--sf-accent), var(--sf-primary) 55%, color-mix(in srgb, var(--sf-primary) 40%, transparent))' }} />
      <div className="mx-auto max-w-[1240px] px-4 pb-0 pt-11 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              {store.logo_url ? (
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden">
                  <img
                    src={resolveMediaUrl(store.logo_url) ?? ''}
                    alt={store.name}
                    className="h-full w-full object-contain"
                  />
                </span>
              ) : (
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-md)] bg-white text-[var(--sf-primary)]">
                  <Zap size={18} strokeWidth={1.8} fill="currentColor" />
                </span>
              )}
              <span className="font-display text-[21px] font-extrabold tracking-[-0.01em] text-white">{store.name}</span>
            </div>
            {store.description && <p className="max-w-[34ch] text-[13.5px] leading-[1.6] text-white/55">{store.description}</p>}
          </div>

          {categories.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-1.5 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--sf-accent)]">
                Categorias
              </div>
              <ul className="flex flex-col gap-2.5 text-[13.5px]">
                {categories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory?.(c.id)}
                      className="group inline-flex items-center text-left text-white/60 transition-colors duration-150 hover:text-white"
                    >
                      <span className="border-b border-transparent transition-colors duration-150 group-hover:border-white/40">{c.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {supportItems.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-1.5 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--sf-accent)]">
                Apoio
              </div>
              <ul className="flex flex-col gap-1 text-[13.5px]">
                {supportItems.map((item, i) => {
                  const open = openItem === i;
                  return (
                    <li key={item.title} className="border-b border-white/10 py-2 first:pt-0 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenItem(open ? null : i)}
                        className="flex w-full items-center justify-between gap-2 text-left text-white/75 transition-colors duration-150 hover:text-white"
                      >
                        {item.title}
                        <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-[var(--sf-accent)]' : 'text-white/40'}`} />
                      </button>
                      {open && <p className="mt-1.5 text-[12.5px] leading-[1.55] text-white/50">{item.content}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-4 flex items-center gap-1.5 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--sf-accent)]">
              Contacto
            </div>
            <div className="flex flex-col gap-2.5 text-[13.5px]">
              {waDigits ? (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/65 transition-colors duration-150 hover:text-white"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors duration-150 group-hover:bg-[var(--sf-primary)]">
                    <MessageCircle size={13} />
                  </span>
                  {store.whatsapp}
                </a>
              ) : (
                <span className="text-white/40">Sem contacto configurado</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/10 py-6 text-center text-[12.5px] text-white/45 sm:flex-row sm:justify-between sm:text-left">
          <span>© {year} {store.name}. Todos os direitos reservados.</span>
          <span className="text-white/35">
            Loja criada com <span className="font-semibold text-white/55">Venda Express</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
