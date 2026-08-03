import { useEffect, useMemo, useState } from 'react';
import { Store as StoreIcon, ArrowLeft, Heart, ShoppingCart, Tag, SlidersHorizontal, X } from 'lucide-react';
import { api, resolveMediaUrl } from '../lib/api';
import type { Store, Product, Category, ProductCondition } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Input, Field } from '../components/ui/Field';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/Feedback';
import { CategoryPageSkeleton } from '../components/ui/Skeleton';
import { CartProvider, useCart } from '../lib/cart';
import { WishlistProvider, useWishlist } from '../lib/wishlist';
import { WishlistDrawer } from '../components/storefront/WishlistDrawer';
import { StorefrontThemeProvider } from '../storefrontTheme/ThemeProvider';
import { mergeTheme } from '../storefrontTheme/mergeTheme';
import { ProductGrid } from '../components/theme/ProductGrid';
import { CategoryGrid } from '../components/theme/CategoryGrid';
import { Reveal } from '../components/theme/Reveal';

type SortKey = 'relevance' | 'newest' | 'price-asc' | 'price-desc';

const SORT_LABEL: Record<SortKey, string> = {
  relevance: 'Relevância',
  newest: 'Mais recentes',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
};

const CONDITION_LABEL: Record<ProductCondition, string> = {
  novo: 'Novo',
  usado: 'Usado',
  recondicionado: 'Recondicionado',
};

export function CategoryPage({
  slug,
  categoryId,
  navigate,
}: {
  slug: string;
  categoryId: string;
  navigate: (to: string) => void;
}) {
  return (
    <CartProvider slug={slug}>
      <WishlistProvider slug={slug}>
        <CategoryPageInner slug={slug} categoryId={categoryId} navigate={navigate} />
      </WishlistProvider>
    </CartProvider>
  );
}

function CategoryPageInner({
  slug,
  categoryId,
  navigate,
}: {
  slug: string;
  categoryId: string;
  navigate: (to: string) => void;
}) {
  const { cart, addToCart } = useCart();
  const { isWishlisted, toggleWishlist, wishlist, setWishlistOpen } = useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [sort, setSort] = useState<SortKey>('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [conditions, setConditions] = useState<ProductCondition[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setSort('relevance');
    setPriceMin('');
    setPriceMax('');
    setOnlyPromo(false);
    setConditions([]);
    (async () => {
      try {
        const data = await api.storefront.get(slug);
        if (cancelled) return;
        const cat = (data.categories as Category[]).find((c) => c.id === categoryId) ?? null;
        if (!cat) {
          setNotFound(true);
          return;
        }
        const allProducts = data.products as Product[];
        const counts = new Map<string, number>();
        for (const p of allProducts) {
          if (!p.category_id) continue;
          counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
        }
        setStore(data.store);
        setCategory(cat);
        setCategories(data.categories as Category[]);
        setCategoryProductCounts(counts);
        setProducts(allProducts.filter((p) => p.category_id === categoryId));
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, categoryId]);

  const availableConditions = useMemo(
    () => Array.from(new Set(products.map((p) => p.item_condition))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const min = priceMin.trim() ? Number(priceMin) : null;
    const max = priceMax.trim() ? Number(priceMax) : null;

    let list = products.filter((p) => {
      if (onlyPromo && !(p.compare_at_price && Number(p.compare_at_price) > Number(p.price))) return false;
      if (conditions.length > 0 && !conditions.includes(p.item_condition)) return false;
      if (min !== null && Number(p.price) < min) return false;
      if (max !== null && Number(p.price) > max) return false;
      return true;
    });

    list = [...list];
    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'price-asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return list;
  }, [products, sort, onlyPromo, conditions, priceMin, priceMax]);

  const activeFilterCount =
    (onlyPromo ? 1 : 0) + conditions.length + (priceMin.trim() ? 1 : 0) + (priceMax.trim() ? 1 : 0);

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setOnlyPromo(false);
    setConditions([]);
  };

  const toggleCondition = (c: ProductCondition) => {
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  if (loading) return <CategoryPageSkeleton />;

  if (notFound || !store || !category) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
          <StoreIcon size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Categoria não encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">Esta categoria não existe ou foi removida.</p>
        <Button className="mt-6" variant="outline" onClick={() => navigate(`/s/${slug}`)}>Voltar à loja</Button>
      </div>
    );
  }

  const theme = mergeTheme(store);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <StorefrontThemeProvider theme={theme} className="min-h-screen bg-[var(--sf-surface-muted)]">
      <header className="sticky top-0 z-30 bg-[var(--sf-primary)] shadow-[var(--sf-shadow-md)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate(`/s/${slug}`)} className="flex items-center gap-2 rounded-[var(--sf-radius-pill)] px-2 py-1.5 text-white transition-colors hover:bg-white/15">
            <ArrowLeft size={18} />
            <span className="hidden font-display text-sm font-semibold sm:inline">Voltar à loja</span>
          </button>
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-1 ring-2 ring-white/25">
                <img src={resolveMediaUrl(store.logo_url) ?? ''} alt={store.name} className="h-full w-full object-contain" />
              </span>
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
        <div className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--sf-ink-secondary)]">
          <button onClick={() => navigate(`/s/${slug}`)} className="transition-colors hover:text-[var(--sf-ink)]">
            {store.name}
          </button>
          <span>/</span>
          <span className="text-[var(--sf-ink)]">{category.name}</span>
        </div>

        {categories.length > 1 && (
          <div className="mb-6">
            <CategoryGrid
              categories={categories}
              activeId={category.id}
              onSelect={(catId) => navigate(`/s/${slug}/categories/${catId}`)}
              productCounts={categoryProductCounts}
            />
          </div>
        )}

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--sf-line)] bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] shadow-[var(--sf-shadow-sm)]">
            {category.icon_url ? (
              <img src={resolveMediaUrl(category.icon_url) ?? ''} alt="" className="h-full w-full object-cover" />
            ) : (
              <Tag size={20} strokeWidth={1.6} />
            )}
          </span>
          <div>
            <h1 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] text-[var(--sf-ink)]">{category.name}</h1>
            <p className="text-sm text-[var(--sf-ink-secondary)]">
              {filteredProducts.length === products.length
                ? `${products.length} produto${products.length === 1 ? '' : 's'}`
                : `${filteredProducts.length} de ${products.length} produtos`}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={<Tag size={28} />}
            title="Sem produtos nesta categoria"
            description="Ainda não há produtos disponíveis aqui."
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
                {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-[var(--sf-radius-sm)] px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      sort === key
                        ? 'bg-[var(--sf-primary)] text-white'
                        : 'bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]'
                    }`}
                  >
                    {SORT_LABEL[key]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFiltersOpen(true)}
                className="relative flex flex-shrink-0 items-center gap-1.5 rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)] bg-[var(--sf-surface)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-primary)]"
              >
                <SlidersHorizontal size={14} />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--sf-primary)] px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal size={28} />}
                title="Nenhum produto com esses filtros"
                description="Tenta ajustar ou limpar os filtros aplicados."
                action={<Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>}
              />
            ) : (
              <Reveal>
                <ProductGrid
                  products={filteredProducts}
                  currency={store.currency}
                  layout="grid"
                  paginate
                  onAdd={addToCart}
                  onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={toggleWishlist}
                />
              </Reveal>
            )}
          </>
        )}
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros" size="sm">
        <div className="space-y-5">
          <Field label={`Preço (${store.currency})`}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Mín"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <span className="text-[var(--sf-ink-secondary)]">—</span>
              <Input
                type="number"
                min="0"
                placeholder="Máx"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm text-[var(--sf-ink)]">
            <input
              type="checkbox"
              checked={onlyPromo}
              onChange={(e) => setOnlyPromo(e.target.checked)}
              className="rounded"
            />
            Só produtos em promoção
          </label>

          {availableConditions.length > 1 && (
            <div>
              <div className="mb-2 text-sm font-medium text-[var(--sf-ink)]">Estado</div>
              <div className="flex flex-wrap gap-2">
                {availableConditions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={`rounded-[var(--sf-radius-sm)] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      conditions.includes(c)
                        ? 'bg-[var(--sf-primary)] text-white'
                        : 'bg-[var(--sf-surface-muted)] text-[var(--sf-ink-secondary)]'
                    }`}
                  >
                    {CONDITION_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-[var(--sf-line)] pt-4">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[13px] font-medium text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
            >
              <X size={14} /> Limpar
            </button>
            <Button onClick={() => setFiltersOpen(false)}>
              Ver {filteredProducts.length} produto{filteredProducts.length === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      </Modal>

      <WishlistDrawer currency={store.currency} onAdd={addToCart} />
    </StorefrontThemeProvider>
  );
}
