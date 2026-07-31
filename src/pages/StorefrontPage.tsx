import { useEffect, useMemo, useRef, useState } from "react";
import {
  Store as StoreIcon,
  Tag,
  Flame,
  Sparkles,
  Video,
  Check,
} from "lucide-react";
import { api, resolveMediaUrl } from "../lib/api";
import type { Store, Product, Category } from "../lib/types";
import { formatCurrency, placeholderImage } from "../lib/format";
import { Button } from "../components/ui/Button";
import { Input, Field, Textarea } from "../components/ui/Field";
import { EmptyState, PageLoader } from "../components/ui/Feedback";
import { Modal } from "../components/ui/Modal";
import { VideoCard } from "../components/product/VideoCard";
import { CartProvider, useCart } from "../lib/cart";
import { WishlistProvider, useWishlist } from "../lib/wishlist";
import { WishlistDrawer } from "../components/storefront/WishlistDrawer";
import { StorefrontThemeProvider } from "../storefrontTheme/ThemeProvider";
import { mergeTheme } from "../storefrontTheme/mergeTheme";
import { AnnouncementBar } from "../components/theme/AnnouncementBar";
import { Header } from "../components/theme/Header";
import { Hero, type HeroSlide } from "../components/theme/Hero";
import { Section } from "../components/theme/Section";
import { ProductGrid } from "../components/theme/ProductGrid";
import { CategoryGrid } from "../components/theme/CategoryGrid";
import { TrustStrip } from "../components/theme/TrustStrip";
import { CartDrawer } from "../components/theme/CartDrawer";
import { Footer } from "../components/theme/Footer";

function productThumb(p: Product) {
  return (
    resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) ||
    placeholderImage(p.name)
  );
}

export function StorefrontPage({
  slug,
  navigate,
}: {
  slug: string;
  navigate: (to: string) => void;
}) {
  return (
    <CartProvider slug={slug}>
      <WishlistProvider slug={slug}>
        <StorefrontPageInner slug={slug} navigate={navigate} />
      </WishlistProvider>
    </CartProvider>
  );
}

function StorefrontPageInner({
  slug,
  navigate,
}: {
  slug: string;
  navigate: (to: string) => void;
}) {
  const { cart, setCartOpen, addToCart, clearCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlist, setWishlistOpen } =
    useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedCat, setSelectedCat] = useState<string>("");
  const [search, setSearch] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_percent: number;
  } | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappMissing, setWhatsappMissing] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
    [cart],
  );
  const discount = appliedCoupon
    ? subtotal * (appliedCoupon.discount_percent / 100)
    : 0;
  const total = subtotal - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const result = await api.storefront.validateCoupon(
        slug,
        couponCode.trim(),
      );
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
      lines.push(
        `- ${i.quantity}x ${i.product.name} — ${formatCurrency(Number(i.product.price) * i.quantity, store?.currency)}`,
      );
    });
    lines.push("");
    lines.push(`Subtotal: ${formatCurrency(subtotal, store?.currency)}`);
    if (discount > 0 && appliedCoupon) {
      lines.push(
        `Desconto (cupom ${appliedCoupon.code}): -${formatCurrency(discount, store?.currency)}`,
      );
    }
    lines.push(`Total: ${formatCurrency(total, store?.currency)}`);
    return lines.join("\n");
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setPlaceError(null);
    const whatsappMessage = buildWhatsappMessage();
    try {
      await api.storefront.placeOrder(slug, {
        name: orderForm.name,
        phone: orderForm.phone,
        address: orderForm.address,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        coupon_code: appliedCoupon?.code,
      });

      const digits = store?.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";
      if (digits) {
        window.open(
          `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`,
          "_blank",
        );
      }

      clearCart();
      setCheckoutOpen(false);
      setOrderSuccess(true);
      setOrderForm({ name: "", phone: "", address: "" });
      setCouponCode("");
      setAppliedCoupon(null);
    } catch (err) {
      setPlaceError(
        err instanceof Error ? err.message : "Não foi possível enviar o pedido",
      );
    } finally {
      setPlacing(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await api.storefront.get(slug);
        setStore(data.store);
        setProducts(data.products);
        setCategories(data.categories);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const promoProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.compare_at_price && Number(p.compare_at_price) > Number(p.price),
        )
        .slice(0, 8),
    [products],
  );
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const videoProducts = useMemo(
    () => products.filter((p) => p.video),
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const catOk = !selectedCat || p.category_id === selectedCat;
        const searchOk =
          !search || p.name.toLowerCase().includes(search.toLowerCase());
        return catOk && searchOk;
      }),
    [products, selectedCat, search],
  );

  const slides: HeroSlide[] = useMemo(() => {
    const list: HeroSlide[] = [];
    const banners =
      store?.banner_urls && store.banner_urls.length > 0
        ? store.banner_urls
        : store?.banner_url
          ? [store.banner_url]
          : [];

    banners.forEach((url, idx) => {
      list.push({
        image: resolveMediaUrl(url) || url,
        title: idx === 0 ? store!.name : undefined,
        subtitle: idx === 0 ? store!.description || undefined : undefined,
      });
    });

    promoProducts.slice(0, 3).forEach((p) => {
      list.push({
        image: productThumb(p),
        kicker: "Em promoção",
        title: p.name,
        subtitle: "Promoção especial por tempo limitado",
        cta: "Ver oferta",
      });
    });

    if (list.length === 0 && store) {
      list.push({
        image: placeholderImage(store.name),
        title: store.name,
        subtitle: store.description || undefined,
      });
    }
    return list;
  }, [store, promoProducts]);

  const scrollToCatalog = () =>
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (loading) return <PageLoader />;

  if (notFound || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
          <StoreIcon size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Loja não encontrada
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          A loja "{slug}" não existe ou foi removida.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => navigate("/")}
        >
          Voltar ao início
        </Button>
      </div>
    );
  }

  const theme = mergeTheme(store);
  const accent = theme.colors.primary;

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Pedido enviado!</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          O teu pedido foi recebido. O lojista entrará em contacto em breve.
        </p>
        <Button
          className="mt-6"
          style={{ backgroundColor: accent, borderColor: accent }}
          onClick={() => setOrderSuccess(false)}
        >
          Continuar a comprar
        </Button>
      </div>
    );
  }

  return (
    <StorefrontThemeProvider theme={theme} className="min-h-screen bg-[#f4f4f6]">
      <AnnouncementBar theme={theme} />

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

      <Hero slides={slides} onCtaClick={scrollToCatalog} />

      <TrustStrip />

      {categories.length > 0 && (
        <Section
          title="Comprar por categoria"
          icon={<Tag size={20} className="text-[var(--sf-primary)]" />}
        >
          <CategoryGrid
            categories={categories}
            onSelect={(id) => {
              setSelectedCat(id);
              scrollToCatalog();
            }}
          />
        </Section>
      )}

      <Section
        icon={
          <span className="inline-flex items-center gap-[7px] rounded-[var(--sf-radius-pill)] bg-[#fdecec] px-3 py-1 font-display text-[14px] font-semibold uppercase tracking-[0.02em] text-[#c93b33]">
            <Flame size={15} strokeWidth={1.6} />
            Em promoção
          </span>
        }
      >
        <ProductGrid
          products={promoProducts}
          currency={store.currency}
          categoryNames={categoryNames}
          layout="rail"
          onAdd={addToCart}
          onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
          isWishlisted={isWishlisted}
          onToggleWishlist={toggleWishlist}
        />
      </Section>

      <Section
        title="Novidades"
        icon={<Sparkles size={20} className="text-[var(--sf-primary)]" />}
      >
        <ProductGrid
          products={featuredProducts}
          currency={store.currency}
          categoryNames={categoryNames}
          layout="rail"
          onAdd={addToCart}
          onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
          isWishlisted={isWishlisted}
          onToggleWishlist={toggleWishlist}
        />
      </Section>

      {videoProducts.length > 0 && (
        <Section
          title="Vídeos"
          icon={<Video size={20} className="text-white" />}
          dark
        >
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {videoProducts.map((p) => (
              <VideoCard
                key={p.id}
                p={p}
                currency={store.currency}
                accent={accent}
                onAdd={addToCart}
              />
            ))}
          </div>
        </Section>
      )}

      <div ref={catalogRef} className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-[var(--sf-primary)]/[0.1] text-[var(--sf-primary)]">
              <Tag size={20} />
            </span>
            <h2 className="font-display text-[28px] font-semibold tracking-[-0.015em] text-[var(--sf-ink)]">
              Todos os produtos
            </h2>
          </div>
          <span className="flex-shrink-0 font-display text-[15px] font-semibold text-[var(--sf-ink)]/55">
            {selectedCat ? categoryNames.get(selectedCat) : "Todos"} · {filtered.length}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<StoreIcon size={28} />}
            title="Sem produtos"
            description="Esta loja ainda não tem produtos disponíveis."
          />
        ) : (
          <ProductGrid
            products={filtered}
            currency={store.currency}
            categoryNames={categoryNames}
            layout="grid"
            paginate
            onAdd={addToCart}
            onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
            isWishlisted={isWishlisted}
            onToggleWishlist={toggleWishlist}
          />
        )}
      </div>

      <Footer
        store={store}
        categories={categories}
        onSelectCategory={(id) => {
          setSelectedCat(id);
          catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <WishlistDrawer
        currency={store.currency}
        accent={accent}
        onAdd={addToCart}
      />

      <CartDrawer
        currency={store.currency}
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

      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Finalizar pedido"
      >
        <form onSubmit={placeOrder} className="space-y-4">
          {placeError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {placeError}
            </div>
          )}
          <Field label="Nome completo">
            <Input
              value={orderForm.name}
              onChange={(e) =>
                setOrderForm({ ...orderForm, name: e.target.value })
              }
              required
            />
          </Field>
          <Field label="Telefone">
            <Input
              value={orderForm.phone}
              onChange={(e) =>
                setOrderForm({ ...orderForm, phone: e.target.value })
              }
              required
              placeholder="+244 9XX XXX XXX"
            />
          </Field>
          <Field label="Endereço de entrega">
            <Textarea
              rows={2}
              value={orderForm.address}
              onChange={(e) =>
                setOrderForm({ ...orderForm, address: e.target.value })
              }
              required
            />
          </Field>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between font-bold">
              <span>Total a pagar</span>
              <span>{formatCurrency(total, store.currency)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCheckoutOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={placing}
              style={{ backgroundColor: accent, borderColor: accent }}
            >
              {placing ? "A enviar..." : "Confirmar pedido"}
            </Button>
          </div>
        </form>
      </Modal>
    </StorefrontThemeProvider>
  );
}
