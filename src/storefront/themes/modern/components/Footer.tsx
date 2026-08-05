// Footer do tema Modern — denso, escuro, alinhado à pele do Header.
import { useState } from "react";
import { ChevronDown, MessageCircle, Store as StoreIcon, MapPin } from "lucide-react";
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
    <footer className="mt-6 border-t-[3px] border-[var(--sf-primary)] bg-[#1B1B1B] text-white/70">
      <div className="mx-auto max-w-[1280px] px-4 pb-0 pt-10 sm:px-6">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              {store.logo_url ? (
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-white p-1.5">
                  <img
                    src={resolveMediaUrl(store.logo_url) ?? ""}
                    alt={store.name}
                    className="h-full w-full object-contain"
                  />
                </span>
              ) : (
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-white text-[#6E6E1E]">
                  <StoreIcon size={18} strokeWidth={2} />
                </span>
              )}
              <span className="font-display text-[19px] font-extrabold tracking-[-0.01em] text-white">
                {store.name}
              </span>
            </div>
            {store.description && (
              <p className="max-w-[34ch] text-[13px] leading-[1.6] text-white/50">{store.description}</p>
            )}
          </div>

          {categories.length > 0 && (
            <div>
              <div className="mb-3 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--sf-primary)]">
                Categorias
              </div>
              <ul className="flex flex-col gap-2 text-[13px]">
                {categories.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory?.(c.id)}
                      className="text-left text-white/55 transition-colors hover:text-white"
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
              <div className="mb-3 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--sf-primary)]">
                Apoio
              </div>
              <ul className="flex flex-col gap-1 text-[13px]">
                {supportItems.map((item, i) => {
                  const open = openItem === i;
                  return (
                    <li key={item.title} className="border-b border-white/10 py-2 first:pt-0 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenItem(open ? null : i)}
                        className="flex w-full items-center justify-between gap-2 text-left text-white/70 transition-colors hover:text-white"
                      >
                        {item.title}
                        <ChevronDown
                          size={14}
                          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[var(--sf-primary)]" : "text-white/35"}`}
                        />
                      </button>
                      {open && <p className="mt-1.5 text-[12px] leading-[1.55] text-white/45">{item.content}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-3 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--sf-primary)]">
              Contacto
            </div>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {waDigits ? (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                >
                  <MessageCircle size={14} /> {store.whatsapp}
                </a>
              ) : (
                <span className="text-white/35">Sem contacto configurado</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/10 py-5 text-center text-[12px] text-white/40 sm:flex-row sm:justify-between sm:text-left">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} /> © {year} {store.name}. Todos os direitos reservados.
          </span>
          <span>
            Loja criada com <span className="font-semibold text-white/60">Venda Express</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
