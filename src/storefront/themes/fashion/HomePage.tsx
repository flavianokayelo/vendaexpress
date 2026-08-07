// HomePage do tema Fashion — boutique editorial. Consome StorefrontApi — nunca
// faz fetch nem reimplementa carrinho/checkout.


import { useMemo, useState } from "react";
import { Check, MessageCircle, Search as SearchIcon, Store as StoreIcon, ChevronRight } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/api";
import { formatCurrency } from "../../../lib/format";
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

  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";
  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const promoProducts = useMemo(
    () => products.filter((p) => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)),
    [products],
  );
  const newArrivals = useMemo(() => products.slice(0, 8), [products]);

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
      />

      <main className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6">
        {/* hero */}
        {banner && (
          <section className="relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
            <img
              src={resolveMediaUrl(banner.url) || banner.url}
              alt={store.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6 sm:p-10">
              {banner.title && (
                <h1 className="max-w-xl font-display text-[30px] font-extrabold uppercase leading-[1.05] tracking-[0.02em] text-white sm:text-[52px]">
                  {banner.title}
                </h1>
              )}
              {(banner.subtitle || store.description) && (
                <p className="mt-2 max-w-md text-[13px] uppercase tracking-[0.12em] text-white/85 sm:text-[15px]">
                  {banner.subtitle || store.description}
                </p>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="bg-[var(--sf-surface)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sf-ink)] transition-colors hover:bg-[var(--sf-primary)] hover:text-white"
                >
                  Comprar
                </button>
              </div>
            </div>
          </section>
        )}

        {/* New in */}
        {!selectedCat && !search.trim() && newArrivals.length > 0 && (
          <section className="py-12">
            <div className="flex items-end justify-between gap-4 border-b border-[var(--sf-line)] pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sf-primary)]">
                  Recém-chegados
                </div>
                <h2 className="mt-1 font-display text-[24px] font-extrabold uppercase tracking-[0.02em] text-[var(--sf-ink)] sm:text-[30px]">
                  New in
                </h2>
              </div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sf-ink)] hover:text-[var(--sf-primary)] sm:inline-flex"
              >
                Ver tudo <ChevronRight size={14} />
              </button>
            </div>
            <ProductGrid
              products={newArrivals}
              currency={currency}
              categoryNames={categoryNames}
              layout="rail"
              onAdd={addToCart}
              onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          </section>
        )}

        {/* promoções */}
        {promoProducts.length > 0 && (
          <section className="py-4">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--sf-line)] pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--sf-primary)]">
                  Preços em baixa
                </div>
                <h2 className="mt-1 font-display text-[24px] font-extrabold uppercase tracking-[0.02em] text-[var(--sf-ink)] sm:text-[30px]">
                  Promoções
                </h2>
              </div>
            </div>
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
        <section className="py-8">
          <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-[var(--sf-line)] pb-4">
            <h2 className="font-display text-[24px] font-extrabold uppercase tracking-[0.02em] text-[var(--sf-ink)] sm:text-[30px]">
              {search.trim() ? `Resultados — "${search.trim()}"` : selectedCat ? categoryNames.get(selectedCat) || "Produtos" : "Todas as peças"}
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sf-ink-secondary)]">
              {filtered.length}
              {selectedCat && (
                <button onClick={() => setSelectedCat("")} className="ml-1 inline-flex items-center text-[var(--sf-primary)] hover:underline">
                  limpar <ChevronRight size={12} />
                </button>
              )}
            </span>
          </div>

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
        onSelectCategory={(id) => {
          setSelectedCat(id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
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