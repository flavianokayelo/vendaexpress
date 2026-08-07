// HomePage do tema Electronics — moderna e funcional.
// Announcement → Hero promocional → Categorias → Ofertas → Destaques →
// Catálogo completo → Footer com suporte e garantia. Consome StorefrontApi.
import { useMemo, useRef, useState } from "react";
import { Check, MessageCircle, Search as SearchIcon, Store as StoreIcon, ArrowRight } from "lucide-react";
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

function SectionHead({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1 flex-shrink-0 rounded-full bg-[var(--sf-accent)]" aria-hidden />
        <h2 className="font-display text-[20px] font-bold leading-none tracking-tight text-[var(--sf-ink)] sm:text-[24px]">
          {title}
        </h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="hidden items-center gap-1 text-[12px] font-medium text-[var(--sf-primary)] transition-colors hover:text-[var(--sf-primary-hover)] sm:inline-flex"
        >
          {action.label} <ArrowRight size={13} />
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
  const featured = useMemo(() => products.slice(0, 8), [products]);

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
        {/* announcement */}
        <div className="mt-4 flex items-center justify-center gap-6 rounded-[var(--sf-radius-sm)] bg-[var(--sf-accent)]/10 px-4 py-2.5 text-center">
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--sf-primary)] sm:inline">
            Entrega rápida
          </span>
          <span className="hidden h-3 w-px bg-[var(--sf-accent)]/40 sm:block" aria-hidden />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--sf-primary)]">
            Pagamento seguro
          </span>
          <span className="hidden h-3 w-px bg-[var(--sf-accent)]/40 sm:block" aria-hidden />
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--sf-primary)] sm:inline">
            Suporte dedicado
          </span>
        </div>

        {/* hero promocional */}
        {banner && (
          <section
            className="relative mt-4 overflow-hidden rounded-[var(--sf-radius-lg)] bg-[var(--sf-primary)]"
            style={{ aspectRatio: "21/8" }}
          >
            <div className="absolute inset-0">
              <img
                src={resolveMediaUrl(banner.url) || banner.url}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--sf-primary)]/85 via-[var(--sf-primary)]/40 to-transparent" />
            <div className="relative flex h-full flex-col items-start justify-center p-6 sm:p-12">
              {banner.title ? (
                <h1 className="max-w-xl font-display text-[28px] font-bold leading-[1.1] tracking-tight text-white sm:text-[46px]">
                  {banner.title}
                </h1>
              ) : (
                <h1 className="max-w-xl font-display text-[28px] font-bold leading-[1.1] tracking-tight text-white sm:text-[46px]">
                  {store.name}
                </h1>
              )}
              {(banner.subtitle || store.description) && (
                <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75">
                  {banner.subtitle || store.description}
                </p>
              )}
              <button
                type="button"
                onClick={scrollToCatalog}
                className="mt-6 inline-flex items-center gap-2 rounded-[var(--sf-radius-pill)] bg-white px-6 py-3 text-[12px] font-semibold text-[var(--sf-primary)] transition-colors hover:bg-[var(--sf-accent)] hover:text-white"
              >
                Ver ofertas <ArrowRight size={14} />
              </button>
            </div>
          </section>
        )}

        {/* categorias */}
        {!selectedCat && !search.trim() && categories.length > 0 && (
          <section className="py-10">
            <SectionHead title="Categorias" action={{ label: "Ver catálogo", onClick: scrollToCatalog }} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCategoryAndScroll(c.id)}
                  className="group flex items-center gap-3 rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)] bg-[var(--sf-surface)] p-3 text-left transition-colors hover:border-[var(--sf-primary)]"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-[var(--sf-radius-sm)] bg-[var(--sf-surface-muted)]">
                    {c.icon_url ? (
                      <img src={resolveMediaUrl(c.icon_url) ?? ""} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-[15px] font-bold text-[var(--sf-primary)]">
                        {c.name[0]?.toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-[var(--sf-ink)]">{c.name}</span>
                    <span className="block text-[11px] text-[var(--sf-ink-secondary)]">Explorar</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ofertas */}
        {!selectedCat && !search.trim() && promoProducts.length > 0 && (
          <section className="pb-10">
            <SectionHead title="Ofertas" action={{ label: "Ver todas", onClick: scrollToCatalog }} />
            <ProductGrid
              products={promoProducts.slice(0, 8)}
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

        {/* destaques */}
        {!selectedCat && !search.trim() && featured.length > 0 && (
          <section className="pb-10">
            <SectionHead title="Destaques" action={{ label: "Ver todos", onClick: scrollToCatalog }} />
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

        {/* catálogo completo */}
        <section ref={catalogRef} className="scroll-mt-40 py-8">
          <SectionHead
            title={search.trim() ? `Resultados — "${search.trim()}"` : selectedCat ? categoryNames.get(selectedCat) || "Produtos" : "Catálogo"}
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

      <Footer store={store} categories={categories} onSelectCategory={(id) => selectCategoryAndScroll(id)} />

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
