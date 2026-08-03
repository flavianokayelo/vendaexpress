import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Store as StoreIcon,
  Tag,
  Zap,
  Sparkles,
  Check,
  MessageCircle,
  LifeBuoy,
  Search,
  Home,
  Grid3x3,
} from "lucide-react";
import { resolveMediaUrl } from "../../../lib/api";
import type { Product } from "../../../lib/types";
import { formatCurrency, placeholderImage } from "../../../lib/format";
import { generateBrandPatternDataUrl } from "../../../lib/brandPattern";
import { Button } from "../../../components/ui/Button";
import { Input, Field, Textarea } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/Feedback";
import { Modal } from "../../../components/ui/Modal";
import { useStorefrontTheme } from "../../../storefrontTheme/ThemeProvider";
import type { HomeSectionKey } from "../../../storefrontTheme/types";
import { AnnouncementBar } from "../../../components/theme/AnnouncementBar";
import { Header } from "../../../components/theme/Header";
import { Hero, type HeroSlide } from "../../../components/theme/Hero";
import { ShopProfileBar } from "../../../components/theme/ShopProfileBar";
import { ShopTabs } from "../../../components/theme/ShopTabs";
import { Section } from "../../../components/theme/Section";
import { Reveal } from "../../../components/theme/Reveal";
import { ProductGrid } from "../../../components/theme/ProductGrid";
import { CategoryGrid } from "../../../components/theme/CategoryGrid";
import { HeroSideCards } from "../../../components/theme/HeroSideCards";
import { FeatureRail } from "../../../components/theme/FeatureRail";
import { VoucherStrip } from "../../../components/theme/VoucherStrip";
import { PromoBannerGrid } from "../../../components/theme/PromoBannerGrid";
import { CartDrawer } from "../../../components/theme/CartDrawer";
import { Footer } from "../../../components/theme/Footer";
import { WishlistDrawer } from "../../../components/storefront/WishlistDrawer";
import type { StorefrontApi } from "../../contract";

function productThumb(p: Product) {
  return (
    resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) ||
    placeholderImage(p.name)
  );
}

export function HomePage(api: StorefrontApi) {
  const {
    slug,
    navigate,
    store,
    products,
    categories,
    publicCoupons,
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
  const categoriesRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Scroll-spy das ShopTabs — realça a tab da secção actualmente visível.
  const [activeTab, setActiveTab] = useState<"Início" | "Produtos" | "Categorias">("Início");
  useEffect(() => {
    const targets: [Element | null, "Início" | "Produtos" | "Categorias"][] = [
      [topRef.current, "Início"],
      [categoriesRef.current, "Categorias"],
      [catalogRef.current, "Produtos"],
    ];
    const valid = targets.filter(
      (t): t is [Element, "Início" | "Produtos" | "Categorias"] => !!t[0],
    );
    if (valid.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        const match = valid.find(([el]) => el === topMost.target);
        if (match) setActiveTab(match[1]);
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
    );
    valid.forEach(([el]) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories.length]);

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
      lines.push(
        `- ${i.quantity}x ${i.product.name} — ${formatCurrency(Number(i.product.price) * i.quantity, currency)}`,
      );
    });
    lines.push("");
    lines.push(`Subtotal: ${formatCurrency(subtotal, currency)}`);
    if (discount > 0 && appliedCoupon) {
      lines.push(
        `Desconto (cupom ${appliedCoupon.code}): -${formatCurrency(discount, currency)}`,
      );
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

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const categoryProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category_id) continue;
      counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
    }
    return counts;
  }, [products]);

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
  const maxDiscount = useMemo(
    () =>
      promoProducts.length === 0
        ? 0
        : Math.max(
            ...promoProducts.map((p) =>
              Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100),
            ),
          ),
    [promoProducts],
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

  // Sugestões do dropdown de busca — pesquisa na loja toda, sem o filtro de
  // categoria activo (diferente de "filtered", que respeita a categoria).
  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [products, search]);

  const theme = useStorefrontTheme();

  const slides: HeroSlide[] = useMemo(() => {
    const list: HeroSlide[] = [];
    const banners =
      store?.banner_urls && store.banner_urls.length > 0
        ? store.banner_urls
        : store?.banner_url
          ? [{ url: store.banner_url }]
          : [];

    banners.forEach((b, idx) => {
      list.push({
        image: resolveMediaUrl(b.url) || b.url,
        title: b.title || (idx === 0 ? store!.name : undefined),
        subtitle: b.subtitle || (idx === 0 ? store!.description || undefined : undefined),
        cta: b.cta,
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
        image: generateBrandPatternDataUrl(store.slug, theme.colors.primary),
        title: store.name,
        subtitle: store.description || undefined,
      });
    }
    return list;
  }, [store, promoProducts, theme.colors.primary]);

  const scrollToCatalog = () =>
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToCategories = () =>
    categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToPromo = () =>
    promoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToFeatured = () =>
    featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToFooter = () =>
    footerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const accent = theme.colors.primary;
  const sectionFree = theme.home.sections.filter((s) => s.enabled !== false);

  const sectionCount = (id: HomeSectionKey) => {
    const cfg = sectionFree.find((s) => s.id === id);
    return cfg?.limit ?? 8;
  };
  const sectionLayout = (id: HomeSectionKey): 'rail' | 'grid' => {
    const cfg = sectionFree.find((s) => s.id === id);
    return cfg?.layout ?? 'rail';
  };
  const sectionTitle = (id: HomeSectionKey, fallback: string) => {
    const cfg = sectionFree.find((s) => s.id === id);
    return cfg?.title ?? fallback;
  };

  const renderSection = (id: HomeSectionKey) => {
    switch (id) {
      case "announcement":
        return <AnnouncementBar key={id} theme={theme} />;

      case "hero":
        if (theme.hero.mode === "none") return null;
        return (
          <div key={id} className="mx-auto mt-2 w-full max-w-[1240px] px-2 sm:px-4">
            <div className="grid h-[clamp(170px,28vw,340px)] gap-2 sm:grid-cols-[2fr_1fr]">
              <Hero slides={slides} mode={theme.hero.mode} onCtaClick={scrollToCatalog} />
              <div className="hidden sm:block">
                <HeroSideCards maxDiscount={maxDiscount} publicCoupons={publicCoupons} whatsapp={store.whatsapp} onPromoClick={scrollToPromo} />
              </div>
            </div>
          </div>
        );

      case "promo-banners":
        return (
          <div key={id} className="mx-auto w-full max-w-[1240px] px-2 pt-2 sm:px-4">
            <PromoBannerGrid banners={theme.banners} />
          </div>
        );

      case "profile-bar":
        return (
          <ShopProfileBar
            key={id}
            store={store}
            productCount={products.length}
            categoryCount={categories.length}
          />
        );

      case "tabs":
        return (
          <ShopTabs
            key={id}
            activeLabel={activeTab}
            tabs={[
              { label: "Início", icon: Home, onClick: scrollToTop },
              { label: "Produtos", icon: Grid3x3, onClick: scrollToCatalog },
              ...(categories.length > 0
                ? [{ label: "Categorias", icon: Tag, onClick: scrollToCategories }]
                : []),
            ]}
          />
        );

      case "feature-rail":
        return (
          <div key={id} className="mx-auto w-full max-w-[1240px] px-2 pt-2 sm:px-4">
            <Reveal>
              <FeatureRail
                items={[
                  ...(categories.length > 0 ? [{ icon: Tag, label: "Categorias", onClick: scrollToCategories }] : []),
                  ...(promoProducts.length > 0 ? [{ icon: Zap, label: "Ofertas", onClick: scrollToPromo }] : []),
                  ...(featuredProducts.length > 0 ? [{ icon: Sparkles, label: "Novidades", onClick: scrollToFeatured }] : []),
                  ...(store.whatsapp
                    ? [{ icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${store.whatsapp.replace(/\D/g, "")}` }]
                    : []),
                  { icon: LifeBuoy, label: "Apoio", onClick: scrollToFooter },
                ]}
              />
            </Reveal>
          </div>
        );

      case "vouchers":
        if (publicCoupons.length === 0) return null;
        return (
          <div key={id} className="mx-auto w-full max-w-[1240px] px-2 pt-2 sm:px-4">
            <Reveal delay={0.05}>
              <VoucherStrip coupons={publicCoupons} />
            </Reveal>
          </div>
        );

      case "categories":
        if (categories.length === 0) return null;
        return (
          <div key={id} ref={categoriesRef}>
            <Section
              title={sectionTitle("categories", "Comprar por categoria")}
              icon={<Tag size={20} className="text-[var(--sf-primary)]" />}
            >
              <Reveal delay={0.08}>
                <CategoryGrid
                  categories={categories}
                  onSelect={(catId) => navigate(`/s/${slug}/categories/${catId}`)}
                  productCounts={categoryProductCounts}
                />
              </Reveal>
            </Section>
          </div>
        );

      case "promo":
        if (promoProducts.length === 0) return null;
        return (
          <div key={id} ref={promoRef}>
            <Section
              icon={
                <span className="inline-flex items-center gap-[7px] text-[14px] font-extrabold uppercase tracking-[0.03em] text-[var(--sf-primary)]">
                  <Zap size={16} strokeWidth={2} fill="currentColor" />
                  {sectionTitle("promo", "Ofertas relâmpago")}
                  <span className="relative ml-0.5 flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--sf-primary)]/60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--sf-primary)]" />
                  </span>
                </span>
              }
            >
              <ProductGrid
                products={promoProducts.slice(0, sectionCount("promo"))}
                currency={currency}
                categoryNames={categoryNames}
                layout={sectionLayout("promo")}
                compact
                onAdd={addToCart}
                onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
              />
            </Section>
          </div>
        );

      case "featured":
        if (featuredProducts.length === 0) return null;
        return (
          <div key={id} ref={featuredRef}>
            <Section
              title={sectionTitle("featured", "Novidades")}
              icon={<Sparkles size={20} className="text-[var(--sf-primary)]" />}
              onViewAll={scrollToCatalog}
            >
              <ProductGrid
                products={featuredProducts.slice(0, sectionCount("featured"))}
                currency={currency}
                categoryNames={categoryNames}
                layout={sectionLayout("featured")}
                onAdd={addToCart}
                onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
              />
            </Section>
          </div>
        );

      case "catalog": {
        const hasSearch = search.trim().length > 0;
        return (
          <Fragment key={id}>
            <div ref={catalogRef} className="mx-auto max-w-[1240px] px-2 pt-4 sm:px-4">
              <Reveal className="mb-2.5 flex items-center justify-between gap-2">
                <h2 className="text-[15px] font-bold text-[var(--sf-ink)]">
                  {hasSearch ? `Resultados para "${search.trim()}"` : "Todos os produtos"}
                </h2>
                <span className="flex-shrink-0 text-[12px] font-medium text-[var(--sf-ink-secondary)]">
                  {!hasSearch && (selectedCat ? categoryNames.get(selectedCat) : "Todos")}
                  {!hasSearch && " · "}
                  {filtered.length}
                </span>
              </Reveal>
            </div>

            <div className="mx-auto max-w-[1240px] px-2 pb-10 sm:px-4">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={hasSearch ? <Search size={28} /> : <StoreIcon size={28} />}
                  title={hasSearch ? `Nada encontrado para "${search.trim()}"` : "Sem produtos"}
                  description={
                    hasSearch
                      ? "Tenta outra palavra ou confere a categoria selecionada."
                      : "Esta loja ainda não tem produtos disponíveis."
                  }
                  action={
                    hasSearch ? (
                      <Button variant="outline" onClick={() => setSearch("")}>
                        Limpar busca
                      </Button>
                    ) : undefined
                  }
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
            </div>
          </Fragment>
        );
      }

      default:
        return null;
    }
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
    <>
      <Header
        store={store}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {
          setSelectedCat("");
          scrollToCatalog();
        }}
        suggestions={searchSuggestions}
        onSuggestionSelect={(p) => navigate(`/s/${slug}/products/${p.id}`)}
        currency={currency}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setCartOpen(true)}
        wishlistCount={wishlist.length}
        onWishlistClick={() => setWishlistOpen(true)}
        categories={categories}
        selectedCategoryId={selectedCat}
        onSelectCategory={setSelectedCat}
        onHelpClick={scrollToFooter}
      />

      <div ref={topRef} />

      {sectionFree.map((s) => renderSection(s.id))}

      <div ref={footerRef}>
        <Footer
          store={store}
          categories={categories}
          onSelectCategory={(id) => {
            setSelectedCat(id);
            catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </div>

      <WishlistDrawer
        currency={currency}
        onAdd={addToCart}
      />

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
          <div className="rounded-lg bg-[var(--sf-surface-muted)] p-3 text-sm">
            <div className="flex justify-between font-bold text-[var(--sf-ink)]">
              <span>Total a pagar</span>
              <span>{formatCurrency(total, currency)}</span>
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
    </>
  );
}