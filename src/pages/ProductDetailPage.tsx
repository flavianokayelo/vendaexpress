import { useEffect, useState } from 'react';
import {
  Store as StoreIcon, ArrowLeft, ChevronLeft, ChevronRight,
  ShoppingCart, Minus, Plus, Flame, Undo2,
} from 'lucide-react';
import { api, resolveMediaUrl } from '../lib/api';
import type { Store, Product, Category } from '../lib/types';
import { formatCurrency, placeholderImage } from '../lib/format';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Feedback';
import { ImageCard } from '../components/product/ImageCard';
import { CartProvider, useCart } from '../lib/cart';

export function ProductDetailPage({
  slug,
  productId,
  navigate,
}: {
  slug: string;
  productId: string;
  navigate: (to: string) => void;
}) {
  return (
    <CartProvider slug={slug}>
      <ProductDetailPageInner slug={slug} productId={productId} navigate={navigate} />
    </CartProvider>
  );
}

function ProductDetailPageInner({
  slug,
  productId,
  navigate,
}: {
  slug: string;
  productId: string;
  navigate: (to: string) => void;
}) {
  const { cart, addToCart } = useCart();

  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    setQty(1);
    (async () => {
      try {
        const data = await api.storefront.getProduct(slug, productId);
        if (cancelled) return;
        setStore(data.store);
        setProduct(data.product);
        setCategory(data.category);
        setRelated(data.related || []);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, productId]);

  if (loading) return <PageLoader />;

  if (notFound || !store || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
          <StoreIcon size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Produto não encontrado</h1>
        <p className="mt-2 text-sm text-slate-500">Este produto não existe ou foi removido.</p>
        <Button className="mt-6" variant="outline" onClick={() => navigate(`/s/${slug}`)}>Voltar à loja</Button>
      </div>
    );
  }

  const accent = store.theme_primary || '#0f766e';
  const isPromo = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);

  const gallery: string[] =
    product.images && product.images.length > 0
      ? product.images.map((img) => resolveMediaUrl(img.url) || placeholderImage(product.name))
      : [resolveMediaUrl(product.image_url) || placeholderImage(product.name)];

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate(`/s/${slug}`)} className="flex items-center gap-2 text-slate-600">
            <ArrowLeft size={18} />
            <span className="hidden text-sm font-medium sm:inline">Voltar à loja</span>
          </button>
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img src={resolveMediaUrl(store.logo_url) ?? ''} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold" style={{ backgroundColor: accent }}>
                {store.name[0]}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-900">{store.name}</span>
          </div>
          <button onClick={() => navigate(`/s/${slug}`)} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-700 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
              <img src={gallery[activeImg]} alt={product.name} className="h-full w-full object-cover" />
              {isPromo && (
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                  <Flame size={12} /> Promoção
                </span>
              )}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + gallery.length) % gallery.length)}
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-800 hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % gallery.length)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-800 hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${i === activeImg ? '' : 'border-transparent opacity-70'}`}
                    style={i === activeImg ? { borderColor: accent } : {}}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {product.video && (
              <div className="mt-4 overflow-hidden rounded-2xl bg-slate-900">
                <video
                  src={resolveMediaUrl(product.video.url) ?? undefined}
                  poster={resolveMediaUrl(product.video.thumbnail_url) ?? undefined}
                  controls
                  className="max-h-96 w-full"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {category && (
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{category.name}</span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">{formatCurrency(Number(product.price), store.currency)}</span>
              {isPromo && (
                <span className="text-base text-slate-400 line-through">
                  {formatCurrency(Number(product.compare_at_price), store.currency)}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              {product.color && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                    style={{ backgroundColor: product.color_hex || '#ccc' }}
                  />
                  {product.color}
                </span>
              )}
              {product.size && <span>Tamanho: {product.size}</span>}
              {product.item_condition && product.item_condition !== 'novo' && (
                <span className="capitalize">{product.item_condition}</span>
              )}
            </div>

            {product.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>
            )}

            <p className="mt-3 text-xs text-slate-400">
              {product.stock > 0 ? `${product.stock} em stock` : 'Sem stock disponível'}
            </p>

            {/* Quantity + add to cart */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-slate-500 hover:bg-slate-50"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="flex h-11 w-11 items-center justify-center text-slate-500 hover:bg-slate-50"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Button
                className="flex-1"
                size="lg"
                disabled={product.stock <= 0}
                style={{ backgroundColor: accent, borderColor: accent }}
                onClick={handleAddToCart}
              >
                {justAdded ? 'Adicionado!' : 'Adicionar ao carrinho'}
              </Button>
            </div>

            {product.return_policy && (
              <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
                <Undo2 size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <p>{product.return_policy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Também pode gostar</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ImageCard
                  key={p.id}
                  p={p}
                  currency={store.currency}
                  accent={accent}
                  onAdd={addToCart}
                  onView={(prod) => navigate(`/s/${slug}/products/${prod.id}`)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}