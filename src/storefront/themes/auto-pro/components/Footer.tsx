// Footer do tema Auto Pro — contacto e suporte técnico em destaque.
// Fundo grafite (--sf-ink) com faixa amarela superior, colunas de marca,
// categorias, suporte técnico e contacto.
import { Headset, MessageCircle, Wrench } from "lucide-react";
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
    <footer className="border-t-2 border-[var(--sf-accent)] bg-[var(--sf-ink)] text-white/70">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* marca */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-1.5 flex-shrink-0 bg-[var(--sf-accent)]" aria-hidden />
            {store.logo_url ? (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-sm)] bg-white font-display text-[15px] font-extrabold text-[var(--sf-primary)]">
                {store.name[0] || "A"}
              </span>
            )}
            <span className="truncate font-display text-[16px] font-extrabold uppercase tracking-[0.05em] text-white">
              {store.name}
            </span>
          </div>
          {store.description && (
            <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-white/50">{store.description}</p>
          )}
        </div>

        {/* categorias */}
        <div>
          <h4 className="mb-3 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-accent)]">
            Categorias
          </h4>
          <ul className="space-y-2">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.(c.id)}
                  className="text-[13px] text-white/60 transition-colors hover:text-white"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* suporte técnico */}
        <div>
          <h4 className="mb-3 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-accent)]">
            Suporte técnico
          </h4>
          <ul className="space-y-2 text-[13px] text-white/60">
            <li className="inline-flex items-center gap-2">
              <Wrench size={14} className="text-[var(--sf-accent)]" /> Ajuda na escolha da peça
            </li>
            <li className="inline-flex items-center gap-2">
              <Headset size={14} className="text-[var(--sf-accent)]" /> Suporte pós-venda
            </li>
            {store.whatsapp && (
              <li className="inline-flex items-center gap-2">
                <MessageCircle size={14} className="text-[var(--sf-accent)]" /> {store.whatsapp}
              </li>
            )}
          </ul>
        </div>

        {/* contacto */}
        <div>
          <h4 className="mb-3 font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-accent)]">
            Contacto
          </h4>
          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--sf-accent)] px-4 py-2.5 font-display text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-ink)] transition-colors hover:bg-white"
            >
              <MessageCircle size={15} /> {store.whatsapp}
            </a>
          ) : (
            <p className="text-[13px] text-white/40">Sem contacto configurado</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-4 text-[12px] text-white/35 sm:flex-row sm:px-6">
          <span>© {year} {store.name}. Todos os direitos reservados.</span>
          <span>
            Loja criada com <span className="font-semibold text-white/50">Venda Express</span>
          </span>
        </div>
      </div>
    </footer>
  );
}