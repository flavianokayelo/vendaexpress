// Página aberta de categoria do tema Modern. Consome a StorefrontApi (com
// route.categoryId) e deriva a lista de produtos de api.products — nunca faz fetch.
import { useMemo, useState } from "react";
import { Tag, SlidersHorizontal, X } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { ProductCondition } from "../../../../lib/types";
import { Button } from "../../../../components/ui/Button";
import { Input, Field } from "../../../../components/ui/Field";
import { Modal } from "../../../../components/ui/Modal";
import { EmptyState } from "../../../../components/ui/Feedback";
import { CategoryGrid } from "../../../../components/theme/CategoryGrid";
import { Reveal } from "../../../../components/theme/Reveal";
import { WishlistDrawer } from "../../../../components/storefront/WishlistDrawer";
import type { StorefrontApi } from "../../../contract";
import { ProductGrid } from "../components/ProductGrid";
import { ModernPageHeader } from "./modernPageHeader";

type SortKey = "relevance" | "newest" | "price-asc" | "price-desc";

const SORT_LABEL: Record<SortKey, string> = {
  relevance: "Relevância",
  newest: "Mais recentes",
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
};

const CONDITION_LABEL: Record<ProductCondition, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
};

export function CategoryPage(api: StorefrontApi) {
  const { slug, navigate, store, products, categories, currency, addToCart, isWishlisted, toggleWishlist } = api;

  const categoryId = api.route?.categoryId;
  const category = categories.find((c) => c.id === categoryId) ?? null;
  const categoryProducts = useMemo(() => products.filter((p) => p.category_id === categoryId), [products, categoryId]);
  const categoryProductCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category_id) continue;
      counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const [sort, setSort] = useState<SortKey>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [conditions, setConditions] = useState<ProductCondition[]>([]);

  const availableConditions = useMemo(() => Array.from(new Set(categoryProducts.map((p) => p.item_condition))), [categoryProducts]);

  const filteredProducts = useMemo(() => {
    const min = priceMin.trim() ? Number(priceMin) : null;
    const max = priceMax.trim() ? Number(priceMax) : null;

    let list = categoryProducts.filter((p) => {
      if (onlyPromo && !(p.compare_at_price && Number(p.compare_at_price) > Number(p.price))) return false;
      if (conditions.length > 0 && !conditions.includes(p.item_condition)) return false;
      if (min !== null && Number(p.price) < min) return false;
      if (max !== null && Number(p.price) > max) return false;
      return true;
    });

    list = [...list];
    if (sort === "newest") {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === "price-asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return list;
  }, [categoryProducts, sort, onlyPromo, conditions, priceMin, priceMax]);

  const activeFilterCount = (onlyPromo ? 1 : 0) + conditions.length + (priceMin.trim() ? 1 : 0) + (priceMax.trim() ? 1 : 0);

  const clearFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setOnlyPromo(false);
    setConditions([]);
  };

  const toggleCondition = (c: ProductCondition) => {
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <>
      <ModernPageHeader api={api} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center gap-1.5 text-[13px] text-[var(--sf-ink-secondary)]">
          <button onClick={() => navigate(`/s/${slug}`)} className="transition-colors hover:text-[var(--sf-ink)]">
            {store.name}
          </button>
          <span>/</span>
          {category ? <span className="text-[var(--sf-ink)]">{category.name}</span> : <span className="text-[var(--sf-ink)]">Categoria</span>}
        </div>

        {categories.length > 1 && (
          <div className="mb-6">
            <CategoryGrid
              categories={categories}
              activeId={category?.id}
              onSelect={(catId) => navigate(`/s/${slug}/categories/${catId}`)}
              productCounts={categoryProductCounts}
            />
          </div>
        )}

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--sf-line)] bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] shadow-sm">
            {category?.icon_url ? (
              <img src={resolveMediaUrl(category.icon_url) ?? ""} alt="" className="h-full w-full object-cover" />
            ) : (
              <Tag size={20} strokeWidth={1.6} />
            )}
          </span>
          <div>
            <h1 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] text-[var(--sf-ink)]">
              {category?.name ?? "Categoria não encontrada"}
            </h1>
            {category ? (
              <p className="text-sm text-[var(--sf-ink-secondary)]">
                {filteredProducts.length === categoryProducts.length
                  ? `${categoryProducts.length} produto${categoryProducts.length === 1 ? "" : "s"}`
                  : `${filteredProducts.length} de ${categoryProducts.length} produtos`}
              </p>
            ) : (
              <p className="text-sm text-[var(--sf-ink-secondary)]">Esta categoria não existe ou foi removida.</p>
            )}
          </div>
        </div>

        {!category ? (
          <EmptyState
            icon={<Tag size={28} />}
            title="Categoria não encontrada"
            description="Esta categoria não existe ou foi removida."
            action={<Button variant="outline" onClick={() => navigate(`/s/${slug}`)}>Voltar à loja</Button>}
          />
        ) : categoryProducts.length === 0 ? (
          <EmptyState icon={<Tag size={28} />} title="Sem produtos nesta categoria" description="Ainda não há produtos disponíveis aqui." />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
                {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-[6px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      sort === key ? "bg-[var(--sf-primary)] text-white" : "bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
                    }`}
                  >
                    {SORT_LABEL[key]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFiltersOpen(true)}
                className="relative flex flex-shrink-0 items-center gap-1.5 rounded-[6px] border border-[var(--sf-line)] bg-[var(--sf-surface)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-primary)]"
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
                  currency={currency}
                  layout="grid"
                  paginate
                  onAdd={addToCart}
                  onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
                  isWishlisted={(id) => isWishlisted(id)}
                  onToggleWishlist={toggleWishlist}
                />
              </Reveal>
            )}
          </>
        )}
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros" size="sm">
        <div className="space-y-5">
          <Field label={`Preço (${currency})`}>
            <div className="flex items-center gap-2">
              <Input type="number" min="0" placeholder="Mín" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
              <span className="text-[var(--sf-ink-secondary)]">—</span>
              <Input type="number" min="0" placeholder="Máx" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm text-[var(--sf-ink)]">
            <input type="checkbox" checked={onlyPromo} onChange={(e) => setOnlyPromo(e.target.checked)} className="rounded" />
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
                    className={`rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      conditions.includes(c) ? "bg-[var(--sf-primary)] text-white" : "bg-[var(--sf-surface-muted)] text-[var(--sf-ink-secondary)]"
                    }`}
                  >
                    {CONDITION_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-[var(--sf-line)] pt-4">
            <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-[13px] font-medium text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]">
              <X size={14} /> Limpar
            </button>
            <Button onClick={() => setFiltersOpen(false)}>
              Ver {filteredProducts.length} produto{filteredProducts.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </Modal>

      <WishlistDrawer currency={currency} onAdd={addToCart} />
    </>
  );
}
