// Footer do tema Fashion Luxe — institucional e elegante. Fundo quase preto
// (--sf-primary), linha fina de ouro (--sf-accent) no topo e colunas em
// maiúsculas com tracking largo. Políticas discretas e contacto.
import { MessageCircle } from "lucide-react";
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

  const titleCls = "mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50";

  return (
    <footer className="bg-[var(--sf-primary)] text-white/70">
      <div className="h-[3px] bg-[var(--sf-accent)]" aria-hidden />
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* marca */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white font-display text-[15px] font-bold text-[var(--sf-primary)]">
                {store.name[0] || "L"}
              </span>
            )}
            <span className="truncate font-display text-[15px] font-semibold uppercase tracking-[0.12em] text-white">
              {store.name}
            </span>
          </div>
          {store.description && (
            <p className="mt-4 line-clamp-3 text-[12px] leading-relaxed text-white/45">{store.description}</p>
          )}
        </div>

        {/* categorias */}
        <div>
          <h4 className={titleCls}>Coleções</h4>
          <ul className="space-y-2.5">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.(c.id)}
                  className="text-[12px] text-white/60 transition-colors hover:text-[var(--sf-accent)]"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* políticas */}
        <div>
          <h4 className={titleCls}>Informação</h4>
          <ul className="space-y-2.5 text-[12px] text-white/60">
            <li>Envio cuidado e seguro</li>
            <li>Devoluções simples</li>
            <li>Pagamento na entrega</li>
            <li>Atendimento dedicado</li>
          </ul>
        </div>

        {/* contacto */}
        <div>
          <h4 className={titleCls}>Contacto</h4>
          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-[var(--sf-accent)] pb-1 text-[12px] font-medium text-white transition-colors hover:text-[var(--sf-accent)]"
            >
              <MessageCircle size={14} strokeWidth={1.6} /> {store.whatsapp}
            </a>
          ) : (
            <p className="text-[12px] text-white/40">Sem contacto configurado</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11px] uppercase tracking-[0.14em] text-white/35 sm:flex-row sm:px-6">
          <span>© {year} {store.name}. Todos os direitos reservados.</span>
          <span>
            Loja criada com <span className="font-semibold text-white/50">Venda Express</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
