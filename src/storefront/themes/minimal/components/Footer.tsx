// Footer do tema Minimal — compacto e funcional. Uma barra preta com o nome da
// loja, categorias em linha e contacto. Sem ornamento.
import { MessageCircle, MapPin, Store as StoreIcon } from "lucide-react";
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
  const year = new Date().getFullYear();
  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";

  return (
    <footer className="border-t border-black bg-[var(--sf-primary)] text-white/60">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2.5">
            {store.logo_url ? (
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-white text-black">
                <StoreIcon size={15} strokeWidth={1.8} />
              </span>
            )}
            <span className="truncate font-display text-[15px] font-medium tracking-wide text-white">{store.name}</span>
          </div>

          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] text-white/50 transition-colors hover:text-white"
            >
              <MessageCircle size={14} /> {store.whatsapp}
            </a>
          ) : (
            <span className="text-[12px] text-white/30">Sem contacto configurado</span>
          )}
        </div>

        {categories.length > 0 && (
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5">
            {categories.slice(0, 12).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCategory?.(c.id)}
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white"
              >
                {c.name}
              </button>
            ))}
          </nav>
        )}

        <div className="flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-5 text-[12px] text-white/30 sm:flex-row sm:items-center">
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
