import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Store as StoreIcon, Tag, Flame, Sparkles, Video,
  ShoppingCart, Check, Minus, Plus, Trash2, X,
} from 'lucide-react';
import { api, resolveMediaUrl } from '../lib/api';
import type { Store, Product, Category } from '../lib/types';
import { formatCurrency, placeholderImage } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Input, Field, Textarea } from '../components/ui/Field';
import { EmptyState, PageLoader } from '../components/ui/Feedback';
import { Modal } from '../components/ui/Modal';
import { ImageCard } from '../components/product/ImageCard';
import { VideoCard } from '../components/product/VideoCard';
import { CartProvider, useCart } from '../lib/cart';
import { WishlistProvider, useWishlist } from '../lib/wishlist';
import { WishlistDrawer } from '../components/storefront/WishlistDrawer';
import { StorefrontHeader } from '../components/storefront/StorefrontHeader';
import { HeroCarousel, type HeroSlide } from '../components/storefront/HeroCarousel';
import { ProductSection } from '../components/storefront/ProductSection';

const PAGE_SIZE = 12;

function productThumb(p: Product) {
  return resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) || placeholderImage(p.name);
}

export function StorefrontPage({ slug, navigate }: { slug: string; navigate: (to: string) => void }) {
  return (
    <CartProvider slug={slug}>
      <WishlistProvider slug={slug}>
        <StorefrontPageInner slug={slug} navigate={navigate} />
      </WishlistProvider>
    </CartProvider>
  );
}

function StorefrontPageInner({ slug, navigate }: { slug: string; navigate: (to: string) => void }) {
  const { cart, cartOpen, setCartOpen, addToCart, updateQty, removeFromCart, clearCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlist, setWishlistOpen } = useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '' });
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappMissing, setWhatsappMissing] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
    [cart]
  );
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount_percent / 100) : 0;
  const total = subtotal - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const result = await api.storefront.validateCoupon(slug, couponCode.trim());
      setAppliedCoupon(result);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : 'Cupom inválido');
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
    lines.push('');
    lines.push(`Cliente: ${orderForm.name}`);
    lines.push(`Telefone: ${orderForm.phone}`);
    lines.push(`Endereço: ${orderForm.address}`);
    lines.push('');
    lines.push('Itens:');
    cart.forEach((i) => {
      lines.push(`- ${i.quantity}x ${i.product.name} — ${formatCurrency(Number(i.product.price) * i.quantity, store?.currency)}`);
    });
    lines.push('');
    lines.push(`Subtotal: ${formatCurrency(subtotal, store?.currency)}`);
    if (discount > 0 && appliedCoupon) {
      lines.push(`Desconto (cupom ${appliedCoupon.code}): -${formatCurrency(discount, store?.currency)}`);
    }
    lines.push(`Total: ${formatCurrency(total, store?.currency)}`);
    return lines.join('\n');
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
        items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        coupon_code: appliedCoupon?.code,
      });

      const digits = store?.whatsapp ? store.whatsapp.replace(/\D/g, '') : '';
      if (digits) {
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      }

      clearCart();
      setCheckoutOpen(false);
      setOrderSuccess(true);
      setOrderForm({ name: '', phone: '', address: '' });
      setCouponCode('');
      setAppliedCoupon(null);
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : 'Não foi possível enviar o pedido');
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

  const promoProducts = useMemo(
    () => products.filter((p) => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)).slice(0, 8),
    [products]
  );
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const videoProducts = useMemo(() => products.filter((p) => p.video), [products]);

  const filtered = useMemo(() => products.filter((p) => {
    const catOk = !selectedCat || p.category_id === selectedCat;
    const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  }), [products, selectedCat, search]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedCat, search]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);
  const visibleProducts = filtered.slice(0, visibleCount);

  const slides: HeroSlide[] = useMemo(() => {
    const list: HeroSlide[] = [];
    const banners = store?.banner_urls && store.banner_urls.length > 0
      ? store.banner_urls
      : (store?.banner_url ? [store.banner_url] : []);

    banners.forEach((url, idx) => {
      list.push({
        image: resolveMediaUrl(url) || url,
        title: idx === 0 ? store!.name : undefined,
        subtitle: idx === 0 ? (store!.description || undefined) : undefined,
      });
    });

    promoProducts.slice(0, 3).forEach((p) => {
      list.push({
        image: productThumb(p),
        title: p.name,
        subtitle: 'Promoção especial por tempo limitado',
        cta: 'Ver oferta',
      });
    });

    if (list.length === 0 && store) {
      list.push({ image: placeholderImage(store.name), title: store.name, subtitle: store.description || undefined });
    }
    return list;
  }, [store, promoProducts]);

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (loading) return <PageLoader />;

  if (notFound || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
          <StoreIcon size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Loja não encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">A loja "{slug}" não existe ou foi removida.</p>
        <Button className="mt-6" variant="outline" onClick={() => navigate('/')}>Voltar ao início</Button>
      </div>
    );
  }

  const accent = store.theme_primary || '#0f766e';

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Pedido enviado!</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">O teu pedido foi recebido. O lojista entrará em contacto em breve.</p>
        <Button className="mt-6" style={{ backgroundColor: accent, borderColor: accent }} onClick={() => setOrderSuccess(false)}>
          Continuar a comprar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontHeader
        store={store}
        accent={accent}
        search={search}
        onSearchChange={setSearch}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onCartClick={() => setCartOpen(true)}
        wishlistCount={wishlist.length}
        onWishlistClick={() => setWishlistOpen(true)}
        onBack={() => navigate('/')}
      />

      <HeroCarousel slides={slides} accent={accent} onCtaClick={scrollToCatalog} />

      <ProductSection
        title="Em promoção"
        icon={<Flame size={20} className="text-red-500" />}
        products={promoProducts}
        currency={store.currency}
        accent={accent}
        onAdd={addToCart}
        onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
        isWishlisted={isWishlisted}
        onToggleWishlist={toggleWishlist}
      />

      <ProductSection
        title="Novidades"
        icon={<Sparkles size={20} style={{ color: accent }} />}
        products={featuredProducts}
        currency={store.currency}
        accent={accent}
        onAdd={addToCart}
        onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
        isWishlisted={isWishlisted}
        onToggleWishlist={toggleWishlist}
      />

      {videoProducts.length > 0 && (
        <div className="bg-slate-900 py-6">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-4 flex items-center gap-2">
              <Video size={20} className="text-white" />
              <h2 className="text-lg font-bold text-white">Vídeos</h2>
            </div>
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
              {videoProducts.map((p) => (
                <VideoCard key={p.id} p={p} currency={store.currency} accent={accent} onAdd={addToCart} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={catalogRef} className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Tag size={20} className="text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Todos os produtos</h2>
        </div>
        <div className="mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCat('')}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!selectedCat ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            style={!selectedCat ? { backgroundColor: accent } : {}}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCat === c.id ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              style={selectedCat === c.id ? { backgroundColor: accent } : {}}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        {filtered.length === 0 ? (
          <EmptyState icon={<StoreIcon size={28} />} title="Sem produtos" description="Esta loja ainda não tem produtos disponíveis." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((p) => (
                <ImageCard
                  key={p.id}
                  p={p}
                  currency={store.currency}
                  accent={accent}
                  onAdd={addToCart}
                  onView={(prod) => navigate(`/s/${slug}/products/${prod.id}`)}
                  isWishlisted={isWishlisted(p.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div ref={sentinelRef} className="flex justify-center py-8 text-sm text-slate-400">
                A carregar mais produtos...
              </div>
            )}
          </>
        )}
      </div>

      <WishlistDrawer currency={store.currency} accent={accent} onAdd={addToCart} />

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setCartOpen(false)} />
          <div className="relative h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Carrinho</h2>
              <button onClick={() => setCartOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="flex flex-col" style={{ height: 'calc(100% - 64px)' }}>
              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <EmptyState icon={<ShoppingCart size={28} />} title="Carrinho vazio" description="Adiciona produtos para continuar." />
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                        <img src={productThumb(item.product)} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{item.product.name}</div>
                          <div className="text-xs text-slate-500">{formatCurrency(Number(item.product.price), store.currency)}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <button onClick={() => updateQty(item.product.id, -1)} className="rounded p-1 hover:bg-slate-100"><Minus size={14} /></button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQty(item.product.id, 1)} className="rounded p-1 hover:bg-slate-100"><Plus size={14} /></button>
                            <button onClick={() => removeFromCart(item.product.id)} className="ml-auto rounded p-1 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-t border-slate-200 p-5">
                  <div className="mb-3 flex gap-2">
                    <Input className="flex-1" placeholder="Cupom" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                    <Button variant="outline" onClick={applyCoupon} disabled={couponBusy}>
                      {couponBusy ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                  {couponError && <p className="mb-2 text-xs text-red-600">{couponError}</p>}
                  {appliedCoupon && <p className="mb-2 text-xs text-green-600">Cupom {appliedCoupon.code} aplicado: {appliedCoupon.discount_percent}%</p>}
                  <div className="mb-3 space-y-1 text-sm">
                    <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(subtotal, store.currency)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatCurrency(discount, store.currency)}</span></div>}
                    <div className="flex justify-between text-base font-bold text-slate-900"><span>Total</span><span>{formatCurrency(total, store.currency)}</span></div>
                  </div>
                  {whatsappMissing && (
                    <p className="mb-2 text-xs text-red-600">
                      Esta loja ainda não tem um número de WhatsApp configurado para receber pedidos. Contacte o lojista diretamente.
                    </p>
                  )}
                  <Button className="w-full" size="lg" style={{ backgroundColor: accent, borderColor: accent }} onClick={openCheckout}>
                    Finalizar pedido
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Finalizar pedido">
        <form onSubmit={placeOrder} className="space-y-4">
          {placeError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{placeError}</div>}
          <Field label="Nome completo">
            <Input value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} required />
          </Field>
          <Field label="Telefone">
            <Input value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} required placeholder="+244 9XX XXX XXX" />
          </Field>
          <Field label="Endereço de entrega">
            <Textarea rows={2} value={orderForm.address} onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })} required />
          </Field>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between font-bold"><span>Total a pagar</span><span>{formatCurrency(total, store.currency)}</span></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={placing} style={{ backgroundColor: accent, borderColor: accent }}>
              {placing ? 'A enviar...' : 'Confirmar pedido'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}