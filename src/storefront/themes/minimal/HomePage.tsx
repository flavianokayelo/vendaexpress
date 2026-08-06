// HomePage do tema Minimal — limpa e funcional.
// Header simples → Hero estático curto → Categorias → Destaques → Catálogo
// completo → Footer compacto. Consome StorefrontApi — nunca faz fetch.
import { useMemo, useRef, useState } from "react";
import { Check, MessageCircle, Search as SearchIcon, Store as StoreIcon, ArrowRight } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/api";
import { formatCurrency, placeholderImage } from "../../../lib/format";
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
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--sf-line)] pb-3">
      <h2 className="text-[19px] font-semibold leading-none tracking-tight text-[var(--sf-ink)] sm:text-[22px]">
        {title}
      </h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="hidden items-center gap-1 text-[12px] text-[var(--sf-ink-secondary)] transition-colors hover:text-[var(--sf-ink)] sm:inline-flex"
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
    cart,
    addToCart,
    clearCart,
    wishlist,
    isWishlisted,
    toggleWishlist,
    setWishlistOpen,
    setCartOpen,
  } = api;

  const [selectedCat, setSelectedCat] = useState<string>("");
  const [search, setSearch] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", address: "" });
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappMissing, setWhatsappMissing] = useState(false);

  const catalogRef = useRef<HTMLElement>(null);
  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
    [cart],
  );
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount_percent / 100) : 0;
  const total = subtotal - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const result = await api.validateCoupon(couponCode.trim());
      setAppliedCoupon(result);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Cupom inválido");
    } finally {
      setCouponBusy(false);
    }
  };

  const openCheckout = () => {
    if (!store?.whatsapp) {
      setWhatsappMissing(true);
      return;
    }
    setWhatsappMissing(false);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const buildWhatsappMessage = () => {
    const lines: string[] = [];
    lines.push(`*Novo pedido - ${store?.name}*`);
    lines.push("");
    lines.push(`Cliente: ${orderForm.name}`);
    lines.push(`Telefone: ${orderForm.phone}`);
    lines.push(`Endereço: ${orderForm.address}`);
    lines.push("");
    lines.push("Itens:");
    cart.forEach((i) => {
      lines.push(`- ${i.quantity}x ${i.product.name} — ${formatCurrency(Number(i.product.price) * i.quantity, currency)}`);
    });
    lines.push("");
    lines.push(`Subtotal: ${formatCurrency(subtotal, currency)}`);
    if (discount > 0 && appliedCoupon) {
      lines.push(`Desconto (cupom ${appliedCoupon.code}): -${formatCurrency(discount, currency)}`);
    }
    lines.push(`Total: ${formatCurrency(total, currency)}`);
    return lines.join("\n");
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setPlaceError(null);
    const whatsappMessage = buildWhatsappMessage();
    try {
      await api.placeOrder({
        name: orderForm.name,
        phone: orderForm.phone,
        address: orderForm.address,
        items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        coupon_code: appliedCoupon?.code,
      });

      const digits = store?.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";
      if (digits) {
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
      }

      clearCart();
      setCheckoutOpen(false);
      setOrderSuccess(true);
      setOrderForm({ name: "", phone: "", address: "" });
      setCouponCode("");
      setAppliedCoupon(null);
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : "Não foi possível enviar o pedido");
    } finally {
      setPlacing(false);
    }
  };

  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";
  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

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
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setCartOpen(true)}
        wishlistCount={wishlist.length}
        onWishlistClick={() => setWishlistOpen(true)}
        categories={categories}
        selectedCategoryId={selectedCat}
        onSelectCategory={setSelectedCat}
        onHelpClick={scrollToCatalog}
      />

      <main className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6">
        {/* hero estático curto */}
        {banner && (
          <section
            className="relative mt-5 overflow-hidden bg-[var(--sf-primary)]"
            style={{ aspectRatio: "16/7" }}
          >
            <div className="absolute inset-0">
              <img
                src={resolveMediaUrl(banner.url) || banner.url}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex flex-col items-start justify-center p-6 sm:p-10">
              {banner.title ? (
                <h1 className="max-w-2xl text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[42px]">
                  {banner.title}
                </h1>
              ) : (
                <h1 className="max-w-2xl text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[42px]">
                  {store.name}
                </h1>
              )}
              {(banner.subtitle || store.description) && (
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/70">
                  {banner.subtitle || store.description}
                </p>
              )}
              <button
                type="button"
                onClick={scrollToCatalog}
                className="mt-5 bg-white px-5 py-2.5 text-[12px] font-semibold text-black transition-colors hover:bg-zinc-200"
              >
                Ver produtos
              </button>
            </div>
          </section>
        )}

        {/* categorias */}
        {!selectedCat && !search.trim() && categories.length > 0 && (
          <section className="py-12">
            <SectionHead title="Categorias" action={{ label: "Ver catálogo", onClick: scrollToCatalog }} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((c) => (
                <button key={c.id} type="button" onClick={() => selectCategoryAndScroll(c.id)} className="group text-left">
                  <div className="relative aspect-square overflow-hidden bg-[var(--sf-surface-muted)]">
                    {c.icon_url ? (
                      <img
                        src={resolveMediaUrl(c.icon_url) ?? ""}
                        alt={c.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <img
                        src={placeholderImage(c.name)}
                        alt={c.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/25" />
                    <span className="absolute bottom-2 left-3 right-3 truncate text-[12px] font-medium text-white">
                      {c.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* destaque */}
        {!selectedCat && !search.trim() && featured.length > 0 && (
          <section className="pb-12">
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
