// Footer do tema Electronics — suporte, garantia e entrega em destaque.
// Stripe de beneficios (entrega/pagamento/suporte) e colunas de marca,
// categorias, garantia e contacto.
import { Headset, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { Store, Category } from "../../../../lib/types";

const BENEFITS = [
  { icon: Truck, label: "Entrega rápida" },
  { icon: ShieldCheck, label: "Garantia de qualidade" },
  { icon: Headset, label: "Suporte dedicado" },
];

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
    <footer className="border-t border-[var(--sf-line)] bg-[var(--sf-primary)] text-white/70">
      {/* stripe de benefícios */}
      <div className="bg-[var(--sf-accent)]/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6">
          {BENEFITS.map((b) => (
            <span key={b.label} className="inline-flex items-center gap-2 text-[12px] font-medium text-white/80">
              <b.icon size={15} className="text-[var(--sf-accent)]" />
              {b.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* marca */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {store.logo_url ? (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-[var(--sf-radius-md)] bg-white p-1">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-md)] bg-white font-display text-[15px] font-bold text-[var(--sf-primary)]">
                {store.name[0] || "T"}
              </span>
            )}
            <span className="truncate font-display text-[16px] font-semibold text-white">{store.name}</span>
          </div>
          {store.description && (
            <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-white/50">{store.description}</p>
          )}
        </div>

        {/* categorias */}
        <div>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Categorias</h4>
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

        {/* garantia & entrega */}
        <div>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Garantia &amp; Entrega</h4>
          <ul className="space-y-2 text-[13px] text-white/60">
            <li>Produtos verificados antes da entrega</li>
            <li>Embalagem segura e protegida</li>
            <li>Suporte pós-venda dedicado</li>
          </ul>
        </div>

        {/* contacto */}
        <div>
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Contacto</h4>
          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--sf-radius-pill)] bg-white/10 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/20"
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