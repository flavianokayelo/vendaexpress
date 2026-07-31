import { useEffect, useRef, useState } from 'react';
import {
  Store as StoreIcon, ArrowLeft, ChevronLeft, ChevronRight,
  ShoppingCart, Minus, Plus, Undo2, Heart, Check, Play, Volume2, VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';
import { api, resolveMediaUrl } from '../lib/api';
import type { Store, Product, Category } from '../lib/types';
import { formatCurrency, placeholderImage } from '../lib/format';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Feedback';
import { CartProvider, useCart } from '../lib/cart';
import { WishlistProvider, useWishlist } from '../lib/wishlist';
import { WishlistDrawer } from '../components/storefront/WishlistDrawer';
import { StorefrontThemeProvider } from '../storefrontTheme/ThemeProvider';
import { mergeTheme } from '../storefrontTheme/mergeTheme';
import { ProductGrid } from '../components/theme/ProductGrid';
import { Reveal } from '../components/theme/Reveal';

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
      <WishlistProvider slug={slug}>
        <ProductDetailPageInner slug={slug} productId={productId} navigate={navigate} />
      </WishlistProvider>
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
  const { isWishlisted, toggleWishlist, wishlist, setWishlistOpen } = useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    setQty(1);
    setVideoPlaying(true);
    setVideoMuted(true);
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

  const theme = mergeTheme(store);
  const accent = theme.colors.primary;
  const isPromo = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const productIsWishlisted = isWishlisted(product.id);

  const gallery: string[] =
    product.images && product.images.length > 0
      ? product.images.map((img) => resolveMediaUrl(img.url) || placeholderImage(product.name))
      : [resolveMediaUrl(product.image_url) || placeholderImage(product.name)];

  // Vídeo do produto entra como primeiro item da galeria (demo tipo Shopee),
  // em vez de bloco separado abaixo das fotos.
  const videoUrl = product.video ? resolveMediaUrl(product.video.url) : null;
  const videoThumb = product.video?.thumbnail_url ? resolveMediaUrl(product.video.thumbnail_url) : null;
  type MediaItem = { type: 'video'; url: string; poster: string | null } | { type: 'image'; url: string };
  const media: MediaItem[] = videoUrl
    ? [{ type: 'video', url: videoUrl, poster: videoThumb }, ...gallery.map((url): MediaItem => ({ type: 'image', url }))]
    : gallery.map((url): MediaItem => ({ type: 'image', url }));
  const activeMedia = media[activeImg] ?? media[0];

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <StorefrontThemeProvider theme={theme} className="min-h-screen bg-[var(--sf-surface-muted)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--sf-primary)] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate(`/s/${slug}`)} className="flex items-center gap-2 rounded-[var(--sf-radius-pill)] px-2 py-1.5 text-white transition-colors hover:bg-white/15">
            <ArrowLeft size={18} />
            <span className="hidden font-display text-sm font-semibold sm:inline">Voltar à loja</span>
          </button>
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img src={resolveMediaUrl(store.logo_url) ?? ''} alt={store.name} className="h-8 w-8 rounded-[10px] object-cover ring-2 ring-white/25" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white font-bold text-[var(--sf-primary)]">
                {store.name[0]}
              </div>
            )}
            <span className="font-display text-[15px] font-semibold text-white">{store.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWishlistOpen(true)} className="relative rounded-[var(--sf-radius-pill)] p-2.5 text-white transition-colors hover:bg-white/15">
              <Heart size={20} strokeWidth={1.7} />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button onClick={() => navigate(`/s/${slug}`)} className="relative rounded-[var(--sf-radius-pill)] p-2.5 text-white transition-colors hover:bg-white/15">
              <ShoppingCart size={22} strokeWidth={1.7} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div
              className="relative aspect-square w-full overflow-hidden rounded-[var(--sf-radius-lg)] bg-[var(--sf-surface-muted)]"
              onClick={() => {
                if (activeMedia.type !== 'video') return;
                const v = videoRef.current;
                if (!v) return;
                if (v.paused) v.play().catch(() => {});
                else v.pause();
              }}
            >
              {activeMedia.type === 'video' ? (
                <>
                  <video
                    ref={videoRef}
                    key={activeMedia.url}
                    src={activeMedia.url}
                    poster={activeMedia.poster ?? undefined}
                    autoPlay
                    loop
                    muted={videoMuted}
                    playsInline
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    className="h-full w-full cursor-pointer object-cover"
                  />
                  {!videoPlaying && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[var(--sf-ink)] shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
                        <Play size={26} fill="currentColor" stroke="none" />
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoMuted((m) => !m);
                    }}
                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-[var(--sf-radius-pill)] bg-black/50 text-white"
                  >
                    {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <span className="absolute left-3 bottom-3 rounded-[var(--sf-radius-pill)] bg-black/50 px-3 py-1 font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-white">
                    Vídeo
                  </span>
                </>
              ) : (
                <img src={activeMedia.url} alt={product.name} className="h-full w-full object-cover" />
              )}
              {isPromo && (
                <span
                  className="absolute -left-[2px] top-4 flex items-center bg-[var(--sf-danger)] py-1.5 pl-4 pr-5 font-display text-[14px] font-bold leading-none tracking-[0.01em] text-white shadow-[0_2px_6px_rgba(0,0,0,0.22)]"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)' }}
                >
                  −{Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}%
                </span>
              )}
              <motion.button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                whileTap={{ scale: 0.8 }}
                animate={{ scale: productIsWishlisted ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-[var(--sf-radius-pill)] border border-[var(--sf-line)] bg-white text-[var(--sf-ink)] shadow-[0_1px_3px_rgba(29,31,32,0.1)] ${
                  productIsWishlisted ? 'text-[var(--sf-danger)]' : ''
                }`}
                title={productIsWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart size={18} strokeWidth={1.5} fill={productIsWishlisted ? 'currentColor' : 'none'} />
              </motion.button>
              {media.length > 1 && (
                <>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + media.length) % media.length); }}
                    whileTap={{ scale: 0.88 }}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[var(--sf-radius-pill)] bg-white/90 text-[var(--sf-ink)] shadow-[0_2px_8px_rgba(29,31,32,0.14)] hover:bg-white"
                  >
                    <ChevronLeft size={18} />
                  </motion.button>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % media.length); }}
                    whileTap={{ scale: 0.88 }}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[var(--sf-radius-pill)] bg-white/90 text-[var(--sf-ink)] shadow-[0_2px_8px_rgba(29,31,32,0.14)] hover:bg-white"
                  >
                    <ChevronRight size={18} />
                  </motion.button>
                </>
              )}
            </div>
            {media.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {media.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[var(--sf-radius-md)] border-2 transition-opacity ${i === activeImg ? '' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={i === activeImg ? { borderColor: accent } : {}}
                  >
                    <img src={m.type === 'video' ? (m.poster ?? placeholderImage(product.name)) : m.url} alt="" className="h-full w-full object-cover" />
                    {m.type === 'video' && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <Play size={16} className="text-white" fill="currentColor" stroke="none" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {category && (
              <span className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--sf-ink-secondary)]">{category.name}</span>
            )}
            <h1 className="mt-1 font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-[var(--sf-ink)]">{product.name}</h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span
                className={`font-display text-[32px] font-semibold leading-none tracking-[0.01em] [font-feature-settings:'tnum'_1] ${
                  isPromo ? 'text-[var(--sf-danger)]' : 'text-[var(--sf-ink)]'
                }`}
              >
                {formatCurrency(Number(product.price), store.currency)}
              </span>
              {isPromo && (
                <span className="text-base text-[var(--sf-ink-secondary)] line-through [font-feature-settings:'tnum'_1]">
                  {formatCurrency(Number(product.compare_at_price), store.currency)}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--sf-ink-secondary)]">
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
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--sf-ink-secondary)]">{product.description}</p>
            )}

            <p className="mt-3 text-xs text-[var(--sf-ink-secondary)]">
              {product.stock > 0 ? `${product.stock} em stock` : 'Sem stock disponível'}
            </p>

            {/* Quantity + add to cart */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-10 items-center justify-center text-[var(--sf-ink-secondary)] transition-colors hover:text-[var(--sf-ink)]"
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center text-[14px] font-semibold text-[var(--sf-ink)]">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="flex h-11 w-10 items-center justify-center text-[var(--sf-ink-secondary)] transition-colors hover:text-[var(--sf-ink)]"
                >
                  <Plus size={15} />
                </button>
              </div>
              <motion.button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                whileTap={product.stock <= 0 ? undefined : { scale: 0.97 }}
                className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--sf-radius-sm)] px-6 text-[14px] font-semibold transition-colors ${
                  justAdded
                    ? 'bg-[var(--sf-success)] text-white'
                    : product.stock <= 0
                      ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                      : 'bg-[var(--sf-primary)] text-white shadow-[0_2px_10px_rgba(29,31,32,0.12)] hover:bg-[var(--sf-primary-hover)] hover:shadow-[0_6px_18px_rgba(29,31,32,0.16)]'
                }`}
              >
                {product.stock <= 0 ? (
                  'Indisponível'
                ) : justAdded ? (
                  <>
                    <Check size={16} strokeWidth={2} />
                    Adicionado
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} strokeWidth={1.6} />
                    Adicionar ao carrinho
                  </>
                )}
              </motion.button>
            </div>

            {product.return_policy && (
              <div className="mt-6 flex gap-2 rounded-[var(--sf-radius-md)] bg-[var(--sf-surface-muted)] p-3 text-xs text-[var(--sf-ink-secondary)]">
                <Undo2 size={16} className="mt-0.5 flex-shrink-0 text-[var(--sf-primary)]" />
                <p>{product.return_policy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-14">
            <Reveal className="mb-5 flex items-center gap-3.5">
              <h2 className="relative font-display text-[24px] font-semibold tracking-[-0.015em] text-[var(--sf-ink)]">
                <span
                  className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full"
                  style={{ background: 'var(--sf-primary)' }}
                />
                Também pode gostar
              </h2>
            </Reveal>
            <ProductGrid
              products={related}
              currency={store.currency}
              layout="grid"
              onAdd={addToCart}
              onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
              isWishlisted={isWishlisted}
              onToggleWishlist={toggleWishlist}
            />
          </div>
        )}
      </div>

      <WishlistDrawer currency={store.currency} accent={accent} onAdd={addToCart} />
    </StorefrontThemeProvider>
  );
}
