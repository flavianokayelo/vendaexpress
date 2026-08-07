// HomePage do tema Luxury — boutique premium editorial.
// Hero grande → Novidades selecionadas → Categorias curadas → Promoções discretas
// → Catálogo completo → Footer institucional. Consome StorefrontApi — nunca faz
// fetch nem reimplementa carrinho/checkout.
import { useMemo, useRef, useState } from "react";
import { Check, MessageCircle, Search as SearchIcon, Store as StoreIcon, ChevronRight } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/api";
import { formatCurrency, placeholderImage } from "../../../lib/format";
import { useCheckout } from "../../../lib/checkout";
import { Button } from "../../../components/ui/Button";
import { Input, Field, Textarea } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/Feedback";
import { Modal } from "../../../components/ui/Modal";
import { CartDrawer } from "../../../components/theme/CartDrawer";
import { WishlistDrawer } from "../../../components/storefront/WishlistDrawer";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProductGrid } from "./components/ProductGrid";
import type { StorefrontApi } from "../../contract";

function SectionHead({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--sf-line)] pb-4">
      <div>
        <div className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[var(--sf-accent)]">
          {kicker}
        </div>
        <h2 className="mt-1.5 font-display text-[26px] font-semibold uppercase leading-none tracking-[0.05em] text-[var(--sf-ink)] sm:text-[32px]">
          {title}
        </h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="hidden items-center gap-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--sf-ink-secondary)] transition-colors hover:text-[var(--sf-ink)] sm:inline-flex"
        >
          {action.label} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

export function HomePage(api: StorefrontApi) {
  const {
    slug,
    navigate,
    store,
    products,
    categories,
    currency,
    addToCart,
    wishlist,
    isWishlisted,
    toggleWishlist,
    setWishlistOpen,
    setCartOpen,
  } = api;

  const [selectedCat, setSelectedCat] = useState<string>("");
  const [search, setSearch] = useState("");

  const {
    subtotal,
    discount,
    total,
    cartCount,
    couponCode,
    setCouponCode,
    couponBusy,
    couponError,
    appliedCoupon,
    applyCoupon,
    checkoutOpen,
    setCheckoutOpen,
    orderForm,
    setOrderForm,
    placing,
    placeError,
    whatsappMissing,
    placeOrder,
    orderSuccess,
    setOrderSuccess,
    openCheckout,
  } = useCheckout(api);

  const catalogRef = useRef<HTMLElement>(null);
  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";
  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const promoProducts = useMemo(
    () => products.filter((p) => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)),
    [products],
  );
  const featured = useMemo(() => products.slice(0, 6), [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const catOk = !selectedCat || p.category_id === selectedCat;
        const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return catOk && searchOk;
      }),
    [products, selectedCat, search],
  );

  const banner = store.banner_urls?.[0] || (store.banner_url ? { url: store.banner_url } : null);

  const selectCategoryAndScroll = (id: string) => {
    setSelectedCat(id);
    scrollToCatalog();
  };

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--sf-surface-muted)] px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sf-success)]/15 text-[var(--sf-success)]">
          <Check size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--sf-ink)]">Pedido enviado!</h1>
        <p className="mt-2 max-w-sm text-sm text-[var(--sf-ink-secondary)]">
          O teu pedido foi recebido. O lojista entrará em contacto em breve.
        </p>
        <Button className="mt-6" onClick={() => setOrderSuccess(false)}>
          Continuar a comprar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--sf-surface)]">
      <Header
        store={store}
        search={search}
        onSearchChange={setSearch}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        wishlistCount={wishlist.length}
        onWishlistClick={() => setWishlistOpen(true)}
        categories={categories}
        selectedCategoryId={selectedCat}
        onSelectCategory={setSelectedCat}
        onHelpClick={scrollToCatalog}
      />

      <main className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6">
        {/* hero editorial */}
        {banner && (
          <section
            className="relative mt-5 overflow-hidden border border-[var(--sf-line)]"
            style={{ aspectRatio: "4/3" }}
          >
            <div className="absolute inset-0">
              <img
                src={resolveMediaUrl(banner.url) || banner.url}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--sf-primary)]/75 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12">
              {banner.title && (
                <h1 className="max-w-2xl font-display text-[32px] font-semibold uppercase leading-[1.05] tracking-[0.04em] text-white sm:text-[54px]">
                  {banner.title}
                </h1>
              )}
              {(banner.subtitle || store.description) && (
                <p className="mt-3 max-w-md text-[12px] uppercase tracking-[0.18em] text-white/70">
                  {banner.subtitle || store.description}
                </p>
              )}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="border border-white/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-[var(--sf-primary)]"
                >
                  Ver coleção
                </button>
              </div>
            </div>
          </section>
        )}

        {/* novidades selecionadas */}
        {!selectedCat && !search.trim() && featured.length > 0 && (
          <section className="py-12">
            <SectionHead kicker="A nossa seleção" title="Novidades" action={{ label: "Ver todas", onClick: scrollToCatalog }} />
            <ProductGrid
              products={featured}
              currency={currency}
              categoryNames={categoryNames}
              layout="grid"
              onAdd={addToCart}
              onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          </section>
        )}

        {/* categorias curadas */}
        {!selectedCat && !search.trim() && categories.length > 0 && (
          <section className="pb-12">
            <SectionHead kicker="Navegue" title="Categorias" action={{ label: "Ver catálogo", onClick: scrollToCatalog }} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCategoryAndScroll(c.id)}
                  className="group text-left"
                >
                  <div className="relative aspect-[3/4] overflow-hidden border border-[var(--sf-line)] bg-[var(--sf-surface-muted)]">
                    {c.icon_url ? (
                      <img
                        src={resolveMediaUrl(c.icon_url) ?? ""}
                        alt={c.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <img
                        src={placeholderImage(c.name)}
                        alt={c.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 right-3 truncate text-[11px] font-medium uppercase tracking-[0.12em] text-white">
                      {c.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* promoções discretas */}
        {promoProducts.length > 0 && (
          <section className="pb-12">
            <SectionHead kicker="Preços em baixa" title="Promoções" />
            <ProductGrid
              products={promoProducts}
              currency={currency}
              categoryNames={categoryNames}
              layout="grid"
              onAdd={addToCart}
              onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          </section>
        )}

        {/* catálogo completo */}
        <section ref={catalogRef} className="scroll-mt-40 py-8">
          <SectionHead
            kicker="Catálogo"
            title={search.trim() ? `Resultados — "${search.trim()}"` : selectedCat ? categoryNames.get(selectedCat) || "Produtos" : "Todas as peças"}
            action={
              selectedCat || search.trim()
                ? {
                    label: "Limpar filtros",
                    onClick: () => {
                      setSelectedCat("");
                      setSearch("");
                    },
                  }
                : undefined
            }
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={search.trim() ? <SearchIcon size={28} /> : <StoreIcon size={28} />}
              title={search.trim() ? `Nada encontrado para "${search.trim()}"` : "Sem produtos"}
              description={search.trim() ? "Tenta outra palavra ou confere a categoria selecionada." : "Esta loja ainda não tem produtos disponíveis."}
              action={search.trim() ? <Button variant="outline" onClick={() => setSearch("")}>Limpar busca</Button> : undefined}
            />
          ) : (
            <ProductGrid
              products={filtered}
              currency={currency}
              categoryNames={categoryNames}
              layout="grid"
              paginate
              onAdd={addToCart}
              onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          )}
        </section>
      </main>

      <Footer
        store={store}
        categories={categories}
        onSelectCategory={(id) => selectCategoryAndScroll(id)}
      />

      {/* WhatsApp flutuante */}
      {waDigits && (
        <a
          href={`https://wa.me/${waDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com a loja no WhatsApp"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={26} strokeWidth={1.8} fill="currentColor" />
        </a>
      )}

      <WishlistDrawer currency={currency} onAdd={addToCart} />

      <CartDrawer
        currency={currency}
        subtotal={subtotal}
        discount={discount}
        total={total}
        couponCode={couponCode}
        onCouponCodeChange={setCouponCode}
        couponBusy={couponBusy}
        couponError={couponError}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={applyCoupon}
        whatsappMissing={whatsappMissing}
        onCheckout={openCheckout}
      />

      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Finalizar pedido">
        <form onSubmit={placeOrder} className="space-y-4">
          {placeError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{placeError}</div>}
          <Field label="Nome completo">
            <Input value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} required />
          </Field>
          <Field label="Telefone">
            <Input
              value={orderForm.phone}
              onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
              required
              placeholder="+244 9XX XXX XXX"
            />
          </Field>
          <Field label="Endereço de entrega">
            <Textarea rows={2} value={orderForm.address} onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })} required />
          </Field>
          <div className="rounded border border-[var(--sf-line)] p-3 text-sm">
            <div className="flex justify-between font-semibold text-[var(--sf-ink)]">
              <span>Total a pagar</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={placing}>
              {placing ? "A enviar..." : "Confirmar pedido"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
