// Footer do tema Fresh Market — informações de entrega, horários e suporte.
// Fundo verde (--sf-primary), títulos com ponto laranja (--sf-accent) e
// contacto de WhatsApp em destaque.
import { Clock, MessageCircle, Truck } from "lucide-react";
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

  const titleCls = "mb-3 flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/80";

  return (
    <footer className="bg-[var(--sf-primary)] text-white/75">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* marca */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[var(--sf-accent)] ring-2 ring-white/30" aria-hidden />
            {store.logo_url ? (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-md)] bg-white font-display text-[15px] font-bold text-[var(--sf-primary)]">
                {store.name[0] || "M"}
              </span>
            )}
            <span className="truncate font-display text-[16px] font-semibold text-white">{store.name}</span>
          </div>
          {store.description && (
            <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-white/55">{store.description}</p>
          )}
        </div>

        {/* categorias */}
        <div>
          <h4 className={titleCls}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sf-accent)]" aria-hidden /> Categorias
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

        {/* entrega & horários */}
        <div>
          <h4 className={titleCls}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sf-accent)]" aria-hidden /> Entrega &amp; Horários
          </h4>
          <ul className="space-y-2 text-[13px] text-white/60">
            <li className="inline-flex items-center gap-2">
              <Truck size={14} className="text-[var(--sf-accent)]" /> Entrega rápida e segura
            </li>
            <li className="inline-flex items-center gap-2">
              <Clock size={14} className="text-[var(--sf-accent)]" /> Funcionamos todos os dias
            </li>
            <li>Encomendas em qualquer altura do dia</li>
          </ul>
        </div>

        {/* suporte */}
        <div>
          <h4 className={titleCls}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sf-accent)]" aria-hidden /> Suporte
          </h4>
          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--sf-accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:brightness-95"
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