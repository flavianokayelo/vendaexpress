// Header do tema Modern — marketplace denso.
//
// Pele fixa (não muda com a loja): barra utilitária escura, faixa "oliva" de
// pesquisa e barra de confiança verde. O accent (contagens do carrinho, pill
// activa de categoria) usa --sf-primary, que É controlado pela cor da loja.
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  Store as StoreIcon,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  ChevronRight,
} from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { Store, Category } from "../../../../lib/types";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-primary)] px-1 text-[11px] font-extrabold leading-none text-white ring-2 ring-[#6E6E22]">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function Header({
  store,
  search,
  onSearchChange,
  cartCount,
  onCartClick,
  wishlistCount,
  onWishlistClick,
  categories,
  selectedCategoryId = "",
  onSelectCategory,
  onHelpClick,
}: {
  store: Store;
  search: string;
  onSearchChange: (v: string) => void;
  cartCount: number;
  onCartClick: () => void;
  wishlistCount: number;
  onWishlistClick: () => void;
  categories?: Category[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  onHelpClick?: () => void;
}) {
  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";

  const prevCount = useRef(cartCount);
  const [pulsing, setPulsing] = useState(false);
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 700);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <header className="sticky top-0 z-40">
      {/* barra utilitária */}
      <div className="hidden bg-[#1B1B1B] text-[#EDEDED] sm:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 text-[12px]" style={{ height: 30 }}>
          <button
            type="button"
            onClick={onHelpClick}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <HelpCircle size={13} /> Ajuda &amp; trocas
          </button>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <MessageCircle size={13} /> Fale connosco
            </a>
          )}
        </div>
      </div>

      {/* cabeçalho principal — pele oliva fixa */}
      <div style={{ background: "linear-gradient(180deg, #8B8B24, #6E6E1E)" }}>
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-4">
          <div className="flex flex-shrink-0 items-center gap-2">
            {store.logo_url ? (
              <span className="flex h-8 max-w-[120px] flex-shrink-0 items-center justify-center rounded-[8px] bg-white px-1 sm:h-9">
                <img
                  src={resolveMediaUrl(store.logo_url) ?? ""}
                  alt={store.name}
                  className="h-full w-auto max-w-full object-contain"
                />
              </span>
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-white text-[#6E6E1E] sm:h-9 sm:w-9">
                <StoreIcon size={18} strokeWidth={2} />
              </div>
            )}
            <span className="hidden truncate font-display text-[19px] font-extrabold tracking-[-0.02em] text-white sm:block sm:text-[22px]">
              {store.name}
            </span>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex h-9 flex-1 items-center overflow-hidden rounded-full bg-white pl-4 sm:h-10"
          >
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Pesquisar em ${store.name}`}
              aria-label="Pesquisar"
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#222] outline-none sm:text-[14px]"
            />
            <button
              type="submit"
              aria-label="Pesquisar"
              className="flex h-full w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1B1B1B] text-white sm:w-12"
            >
              <Search size={17} strokeWidth={2} />
            </button>
          </form>

          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={onWishlistClick}
              aria-label="Favoritos"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 sm:h-10 sm:w-10"
            >
              <Heart size={20} strokeWidth={1.8} />
              {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
            </button>
            <button
              onClick={onCartClick}
              aria-label="Carrinho"
              className={`relative flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 sm:h-10 sm:w-10 ${pulsing ? "animate-sf-cartpulse" : ""}`}
            >
              <ShoppingCart size={21} strokeWidth={1.8} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>

        {/* pills de categoria */}
        {categories && categories.length > 0 && onSelectCategory && (
          <div className="no-scrollbar mx-auto flex max-w-[1280px] items-center gap-1.5 overflow-x-auto px-3 pb-2.5 sm:px-4">
            {[{ id: "", name: "Todos" }, ...categories.slice(0, 10)].map((c) => {
              const active = selectedCategoryId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCategory(c.id)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                    active ? "bg-white text-[#6E6E1E]" : "bg-white/15 text-white/90 hover:bg-white/25"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* barra de confiança */}
      <div className="hidden bg-[#0A8C4B] text-white sm:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-2 text-[12.5px]">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <ShieldCheck size={15} /> Porquê escolher a {store.name}?
          </span>
          <span className="inline-flex items-center gap-3.5">
            <span className="inline-flex items-center gap-1.5">
              <Lock size={13} /> Privacidade segura
            </span>
            <i className="h-3.5 w-px bg-white/40" />
            <span className="inline-flex items-center gap-1.5">
              <CreditCard size={13} /> Pagamentos seguros
            </span>
            <i className="h-3.5 w-px bg-white/40" />
            <span className="inline-flex items-center gap-1.5">
              <Truck size={13} /> Garantia de entrega
            </span>
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </header>
  );
}
