import { MessageCircle } from 'lucide-react';
import type { Store, Category } from '../../lib/types';

const SUPPORT_ITEMS = ['Entregas e prazos', 'Trocas e devoluções', 'Garantia', 'Perguntas frequentes'];

export function Footer({ store, categories }: { store: Store; categories: Category[] }) {
  const year = new Date().getFullYear();
  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, '') : '';

  return (
    <footer className="border-t border-[var(--sf-line)] bg-[var(--sf-ink)] text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-base font-bold text-white">{store.name}</div>
            {store.description && <p className="mt-2 max-w-xs text-sm text-slate-400">{store.description}</p>}
          </div>

          {categories.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categorias</div>
              <ul className="mt-3 space-y-2 text-sm">
                {categories.slice(0, 6).map((c) => (
                  <li key={c.id} className="text-slate-400">{c.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Apoio</div>
            <ul className="mt-3 space-y-2 text-sm">
              {SUPPORT_ITEMS.map((label) => (
                <li key={label} className="text-slate-400">{label}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto</div>
            <div className="mt-3 space-y-2 text-sm">
              {waDigits ? (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-white"
                >
                  <MessageCircle size={15} /> {store.whatsapp}
                </a>
              ) : (
                <span className="text-slate-500">Sem contacto configurado</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-500">
          © {year} {store.name}. Loja criada com Venda Express.
        </div>
      </div>
    </footer>
  );
}
