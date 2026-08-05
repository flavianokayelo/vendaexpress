// HomePage do tema Modern — marketplace denso. Consome StorefrontApi — nunca
// faz fetch nem reimplementa carrinho/checkout.
import { useMemo, useState } from "react";
import { Zap, Sparkles, Search as SearchIcon, Store as StoreIcon, Check, Tag, ChevronRight } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/api";
import { formatCurrency } from "../../../lib/format";
import { Button } from "../../../components/ui/Button";
import { Input, Field, Textarea } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/Feedback";
import { Modal } from "../../../components/ui/Modal";
import { Reveal } from "../../../components/theme/Reveal";
import { CategoryGrid } from "../../../components/theme/CategoryGrid";
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

  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const categoryProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category_id) continue;
      counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const promoProducts = useMemo(
    () => products.filter((p) => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)),
    [products],
  );
  const featuredProducts = useMemo(() => products.slice(0, 12), [products]);

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
  const accent = store.theme_primary || "#FB7701";

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
        <Button className="mt-6" style={{ backgroundColor: accent, borderColor: accent }} onClick={() => setOrderSuccess(false)}>
          Continuar a comprar
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--sf-surface-muted)]">
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
      />

      {banner && (
        <div className="mx-auto max-w-[1280px] px-3 pt-3 sm:px-4">
          <div className="relative overflow-hidden rounded-[10px]" style={{ aspectRatio: "16/5" }}>
            <img
              src={resolveMediaUrl(banner.url) || banner.url}
              alt={banner.title || store.name}
              className="h-full w-full object-cover"
            />
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/55 via-black/10 to-transparent px-6 sm:px-10">
                {banner.title && <h2 className="max-w-md text-[20px] font-extrabold text-white sm:text-[28px]">{banner.title}</h2>}
                {banner.subtitle && <p className="mt-1 max-w-sm text-[13px] text-white/85 sm:text-[15px]">{banner.subtitle}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1280px] px-3 pb-10 pt-4 sm:px-4">
        {categories.length > 0 && (
          <Reveal className="mb-6">
            <div className="mb-2.5 flex items-center gap-2">
              <Tag size={16} className="text-[var(--sf-primary)]" />
              <h2 className="text-[14px] font-bold text-[var(--sf-ink)]">Comprar por categoria</h2>
            </div>
            <CategoryGrid
              categories={categories}
              activeId={selectedCat || undefined}
              onSelect={(id) => setSelectedCat(id)}
              productCounts={categoryProductCounts}
            />
          </Reveal>
        )}

        {promoProducts.length > 0 && (
          <Reveal delay={0.05} className="mb-7">
            <div className="mb-2.5 flex items-center gap-2">
              <Zap size={17} className="text-[var(--sf-primary)]" fill="currentColor" />
              <h2 className="text-[15px] font-extrabold uppercase tracking-[0.02em] text-[var(--sf-primary)]">
                Ofertas em promoção
              </h2>
            </div>
            <ProductGrid
              products={promoProducts}
              currency={currency}
              categoryNames={categoryNames}
              layout="rail"
              compact
              onAdd={addToCart}
              onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          </Reveal>
        )}

        {featuredProducts.length > 0 && (
          <Reveal delay={0.08} className="mb-7">
            <div className="mb-2.5 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--sf-primary)]" />
              <h2 className="text-[14px] font-bold text-[var(--sf-ink)]">Novidades</h2>
            </div>
            <ProductGrid
              products={featuredProducts}
              currency={currency}
              categoryNames={categoryNames}
              layout="rail"
              onAdd={addToCart}
              onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          </Reveal>
        )}

        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold text-[var(--sf-ink)]">
            {search.trim() ? `Resultados para "${search.trim()}"` : "Todos os produtos"}
          </h2>
          <span className="flex items-center gap-1 text-[12px] font-medium text-[var(--sf-ink-secondary)]">
            {!search.trim() && (selectedCat ? categoryNames.get(selectedCat) : "Todos")}
            {!search.trim() && " · "}
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
      </main>

      <Footer
        store={store}
        categories={categories}
        onSelectCategory={(id) => {
          setSelectedCat(id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

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
          <div className="rounded-lg bg-[var(--sf-surface-muted)] p-3 text-sm">
            <div className="flex justify-between font-bold text-[var(--sf-ink)]">
              <span>Total a pagar</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={placing} style={{ backgroundColor: accent, borderColor: accent }}>
              {placing ? "A enviar..." : "Confirmar pedido"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
