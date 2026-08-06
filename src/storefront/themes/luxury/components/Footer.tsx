// Footer do tema Luxury — institucional, navy profundo com destaques em ouro.
// Tipografia em maiúsculas, apoio em acordeão e contacto por WhatsApp.
import { useState } from "react";
import { ChevronDown, MessageCircle, MapPin, Store as StoreIcon } from "lucide-react";
import { useStorefrontTheme } from "../../../../storefrontTheme/ThemeProvider";
import { resolveMediaUrl } from "../../../../lib/api";
import type { Store, Category } from "../../../../lib/types";

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
  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";

  return (
    <footer className="bg-[var(--sf-ink)] text-white/70">
      <div className="h-px bg-[var(--sf-accent)]/60" aria-hidden />
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              {store.logo_url ? (
                <span className="flex h-9 items-center justify-center overflow-hidden">
                  <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-auto max-w-[140px] object-contain" />
                </span>
              ) : (
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-white">
                  <StoreIcon size={18} strokeWidth={1.5} />
                </span>
              )}
            </div>
            {store.description && (
              <p className="max-w-[34ch] text-[13px] leading-[1.8] text-white/45">{store.description}</p>
            )}
          </div>

          {categories.length > 0 && (
            <div>
              <div className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sf-accent)]">
                Categorias
              </div>
              <ul className="flex flex-col gap-2.5 text-[13px]">
                {categories.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory?.(c.id)}
                      className="text-left text-white/50 uppercase tracking-[0.08em] transition-colors hover:text-white"
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
              <div className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sf-accent)]">
                Apoio
              </div>
              <ul className="flex flex-col gap-1 text-[13px]">
                {supportItems.map((item, i) => {
                  const open = openItem === i;
                  return (
                    <li key={item.title} className="border-b border-white/10 py-2.5 first:pt-0 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenItem(open ? null : i)}
                        className="flex w-full items-center justify-between gap-2 text-left text-white/60 uppercase tracking-[0.08em] transition-colors hover:text-white"
                      >
                        {item.title}
                        <ChevronDown
                          size={14}
                          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[var(--sf-accent)]" : "text-white/30"}`}
                        />
                      </button>
                      {open && <p className="mt-2 text-[12px] leading-[1.8] text-white/40">{item.content}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-4 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sf-accent)]">
              Contacto
            </div>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {waDigits ? (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/50 transition-colors hover:text-[var(--sf-accent)]"
                >
                  <MessageCircle size={14} /> {store.whatsapp}
                </a>
              ) : (
                <span className="text-white/30">Sem contacto configurado</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center text-[12px] text-white/35 sm:flex-row sm:justify-between sm:text-left">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} /> © {year} {store.name}. Todos os direitos reservados.
          </span>
          <span>
            Loja criada com <span className="font-semibold text-white/50">Venda Express</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
