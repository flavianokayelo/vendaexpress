// Página aberta de busca do tema standard. Consome a StorefrontApi (com
// route.query) e filtra api.products — nunca faz fetch.
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Product, ProductCondition } from "../../../../lib/types";
import { Button } from "../../../../components/ui/Button";
import { Input, Field } from "../../../../components/ui/Field";
import { Modal } from "../../../../components/ui/Modal";
import { EmptyState } from "../../../../components/ui/Feedback";
import { ProductGrid } from "../../../../components/theme/ProductGrid";
import { Reveal } from "../../../../components/theme/Reveal";
import { WishlistDrawer } from "../../../../components/storefront/WishlistDrawer";
import type { StorefrontApi } from "../../../contract";
import { PublicPageHeader } from "./publicPageHeader";

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

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function SearchPage(api: StorefrontApi) {
  const { products, currency, addToCart, isWishlisted, toggleWishlist } = api;

  const queryValue = (api.route?.query ?? "").trim();
  const query = normalize(queryValue);

  const baseResults = useMemo(() => {
    if (!query) return [];
    const score = (name: string): number => {
      const n = normalize(name);
      let r = 0;
      if (n.startsWith(query)) r += 4;
      if (n.includes(` ${query}`)) r += 3;
      if (n.includes(query)) r += 2;
      return r;
    };
    return products
      .map((p) => ({ p, s: score(p.name) + (normalize(p.description ?? "").includes(query) ? 1 : 0) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);
  }, [products, query]);

  const [sort, setSort] = useState<SortKey>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [conditions, setConditions] = useState<ProductCondition[]>([]);

  const availableConditions = useMemo(
    () => Array.from(new Set(baseResults.map((p) => p.item_condition))),
    [baseResults],
  );

  const results = useMemo(() => {
    const min = priceMin.trim() ? Number(priceMin) : null;
    const max = priceMax.trim() ? Number(priceMax) : null;

    let list = baseResults.filter((p) => {
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
  }, [baseResults, sort, onlyPromo, conditions, priceMin, priceMax]);

  const activeFilterCount =
    (onlyPromo ? 1 : 0) + conditions.length + (priceMin.trim() ? 1 : 0) + (priceMax.trim() ? 1 : 0);

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
      <PublicPageHeader api={api} />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] text-[var(--sf-ink)]">
              {queryValue ? <>Resultados para “{queryValue}”</> : "Busca de produtos"}
            </h1>
            <p className="text-sm text-[var(--sf-ink-secondary)]">
              {results.length === 0
                ? "Nenhum resultado"
                : `${results.length} resultado${results.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {queryValue === "" || results.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title={queryValue === "" ? "Digite para pesquisar" : "Nenhum produto encontrado"}
            description={
              queryValue === ""
                ? "Pesquise por nome ou descrição de um produto."
                : "Verifique a ortografia ou tente outros termos."
            }
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
                        ? "bg-[var(--sf-primary)] text-white"
                        : "bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
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

            {results.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal size={28} />}
                title="Nenhum produto com esses filtros"
                description="Tenta ajustar ou limpar os filtros aplicados."
                action={<Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>}
              />
            ) : (
              <Reveal>
                <ProductGrid
                  products={results}
                  currency={currency}
                  layout="grid"
                  paginate
                  onAdd={addToCart}
                  onView={(p) => navigateTo(api, p)}
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
                    className={`rounded-[var(--sf-radius-sm)] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      conditions.includes(c)
                        ? "bg-[var(--sf-primary)] text-white"
                        : "bg-[var(--sf-surface-muted)] text-[var(--sf-ink-secondary)]"
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
              Ver {results.length} resultado{results.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </Modal>

      <WishlistDrawer currency={currency} onAdd={addToCart} />
    </>
  );
}

// O ProductGrid exige onView; desacopla a navegação para não poluir o corpo do
// componente (evita referência em inicializador de useMemo dependente de api).
function navigateTo(api: StorefrontApi, p: Product) {
  api.navigate(`/s/${api.slug}/products/${p.id}`);
}