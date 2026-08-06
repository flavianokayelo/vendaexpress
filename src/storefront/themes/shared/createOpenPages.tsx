// =============================================================================
// createOpenPages — fábrica das PÁGINAS ABERTAS (Categoria / Produto / Pesquisa)
// para os temas que partilham o mesmo motor de mini-layout mas têm DNA próprio.
//
// Recebe o pageHeader do TEMA (o header compacto das páginas abertas, que segue
// a "pele" desse tema) e o ProductGrid do TEMA, e devolve componentes ThemePages
// (Categoria/Produto/Pesquisa). Tudo o resto usa os primitivos de UI partilhados
// e as CSS vars --sf-* do tema — assim cada tema fica com páginas SUAS, fiéis ao
// seu DNA, sem duplicar a lógica de filtros/ordenação/galeria três vezes.
//
// Regra central: as páginas consomem apenas a StorefrontApi — nunca fazem fetch.
// =============================================================================
import { type ComponentType, type ReactNode, useMemo, useRef, useState } from "react";
import {
  Tag,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Minus,
  Plus,
  Undo2,
  Heart,
  Check,
  Play,
  Volume2,
  VolumeX,
  Store as StoreIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { resolveMediaUrl } from "../../../lib/api";
import { formatCurrency, placeholderImage } from "../../../lib/format";
import { Button } from "../../../components/ui/Button";
import { Input, Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState } from "../../../components/ui/Feedback";
import { CategoryGrid } from "../../../components/theme/CategoryGrid";
import { Reveal } from "../../../components/theme/Reveal";
import { WishlistDrawer } from "../../../components/storefront/WishlistDrawer";
import type { StorefrontApi, ThemeProductGridProps, ThemePages } from "../../contract";
import type { Product, ProductCondition } from "../../../lib/types";

type OpenHeaderProps = { api: StorefrontApi };

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
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function TagStroke({ size = 16 }: { size?: number }) {
  return <Tag size={size} strokeWidth={1.6} />;
}

// -----------------------------------------------------------------------------
// Skin — dá "cara" própria ao corpo das páginas abertas de cada tema, à medida
// que o header já o faz ao topo. Cada tema passa o seu skin no createOpenPages;
// os raios vêm sempre das CSS vars --sf-radius-* (do config do tema).
// -----------------------------------------------------------------------------
export type OpenPagesSkin = {
  breadcrumb: "slash" | "chevron" | "dot" | "plain";
  titleAccent: "bar" | "underline" | "plain";
  controls: "chip" | "pill" | "underline" | "sharp";
  promoBadge: "ribbon" | "circle" | "tag";
  sectionTitle: "bar" | "underline" | "plain";
};

const DEFAULT_SKIN: OpenPagesSkin = {
  breadcrumb: "slash",
  titleAccent: "bar",
  controls: "chip",
  promoBadge: "ribbon",
  sectionTitle: "bar",
};

const BREADCRUMB_SEP: Record<OpenPagesSkin["breadcrumb"], string> = {
  slash: "/",
  chevron: "›",
  dot: "·",
  plain: "",
};

function sortChipClass(skin: OpenPagesSkin, active: boolean): string {
  const base =
    "flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-[12.5px] font-semibold transition-colors";
  switch (skin.controls) {
    case "pill":
      return `${base} rounded-[var(--sf-radius-pill)] ${
        active
          ? "bg-[var(--sf-primary)] text-white"
          : "bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
      }`;
    case "underline":
      return `${base} rounded-[2px] bg-transparent ${
        active
          ? "text-[var(--sf-primary)] shadow-[inset_0_-2px_0_var(--sf-primary)]"
          : "text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
      }`;
    case "sharp":
      return `${base} rounded-none border ${
        active
          ? "border-[var(--sf-primary)] bg-[var(--sf-primary)] text-white"
          : "border-transparent bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
      }`;
    default:
      return `${base} rounded-[var(--sf-radius-sm)] ${
        active
          ? "bg-[var(--sf-primary)] text-white"
          : "bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
      }`;
  }
}

function filterButtonClass(skin: OpenPagesSkin): string {
  const base =
    "relative flex flex-shrink-0 items-center gap-1.5 border border-[var(--sf-line)] bg-[var(--sf-surface)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-primary)]";
  switch (skin.controls) {
    case "pill":
      return `${base} rounded-[var(--sf-radius-pill)]`;
    case "sharp":
      return `${base} rounded-none`;
    default:
      return `${base} rounded-[var(--sf-radius-sm)]`;
  }
}

function Breadcrumb({ api, crumb, skin }: { api: StorefrontApi; crumb: string | null; skin: OpenPagesSkin }) {
  const { slug, navigate, store } = api;
  return (
    <div className="mb-4 flex items-center gap-2 text-[13px] text-[var(--sf-ink-secondary)]">
      <button onClick={() => navigate(`/s/${slug}`)} className="transition-colors hover:text-[var(--sf-ink)]">
        {store.name}
      </button>
      {skin.breadcrumb === "plain" ? (
        <span aria-hidden className="h-3 w-px bg-[var(--sf-line)]" />
      ) : (
        <span aria-hidden>{BREADCRUMB_SEP[skin.breadcrumb]}</span>
      )}
      <span className="text-[var(--sf-ink)]">{crumb ?? "Categoria"}</span>
    </div>
  );
}

function PageTitle({ title, accent }: { title: ReactNode; accent: OpenPagesSkin["titleAccent"] }) {
  const h1Class = "font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] text-[var(--sf-ink)]";
  if (accent === "underline") {
    return (
      <div>
        <h1 className={h1Class}>{title}</h1>
        <span aria-hidden className="mt-1.5 block h-[2px] w-10" style={{ background: "var(--sf-primary)" }} />
      </div>
    );
  }
  if (accent === "plain") return <h1 className={h1Class}>{title}</h1>;
  return (
    <div className="relative pl-3">
      <span aria-hidden className="absolute left-0 top-1/2 h-[70%] w-[3px] -translate-y-1/2" style={{ background: "var(--sf-primary)" }} />
      <h1 className={h1Class}>{title}</h1>
    </div>
  );
}

function SectionTitle({ title, skin }: { title: ReactNode; skin: OpenPagesSkin }) {
  const h2Class = "font-display text-[24px] font-semibold tracking-[-0.015em] text-[var(--sf-ink)]";
  if (skin.sectionTitle === "underline") {
    return (
      <div>
        <h2 className={h2Class}>{title}</h2>
        <span aria-hidden className="mt-1.5 block h-[2px] w-10" style={{ background: "var(--sf-primary)" }} />
      </div>
    );
  }
  if (skin.sectionTitle === "plain") return <h2 className={h2Class}>{title}</h2>;
  return (
    <h2 className={`relative pl-3 ${h2Class}`}>
      <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full" style={{ background: "var(--sf-primary)" }} />
      {title}
    </h2>
  );
}

function PromoBadge({ pct, skin }: { pct: number; skin: OpenPagesSkin }) {
  const text = `−${pct}%`;
  if (skin.promoBadge === "circle") {
    return (
      <span className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sf-primary)] font-display text-[12.5px] font-bold leading-none text-white shadow-md">
        {text}
      </span>
    );
  }
  if (skin.promoBadge === "tag") {
    return (
      <span
        className="absolute left-0 top-4 flex items-center bg-[var(--sf-primary)] py-1.5 pl-3 pr-4 font-display text-[13px] font-bold leading-none text-white shadow-md"
        style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)" }}
      >
        {text}
      </span>
    );
  }
  return (
    <span
      className="absolute -left-[2px] top-4 flex items-center bg-[var(--sf-primary)] py-1.5 pl-4 pr-5 font-display text-[14px] font-bold leading-none tracking-[0.01em] text-white shadow-md"
      style={{ clipPath: "polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)" }}
    >
      {text}
    </span>
  );
}

export function createOpenPages({
  pageHeader: PageHeader,
  grid: Grid,
  skin = DEFAULT_SKIN,
}: {
  pageHeader: ComponentType<PagesHeaderProps>;
  grid: ComponentType<ThemeProductGridProps>;
  skin?: OpenPagesSkin;
}): Pick<ThemePages, "Category" | "Product" | "Search"> {
  // ---------------------------------------------------------------------------
  // CATEGORY
  // ---------------------------------------------------------------------------
  function CategoryPage(api: StorefrontApi) {
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
      if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      else if (sort === "price-asc") list.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sort === "price-desc") list.sort((a, b) => Number(b.price) - Number(a.price));
      return list;
    }, [categoryProducts, sort, onlyPromo, conditions, priceMin, priceMax]);

    const activeFilterCount = (onlyPromo ? 1 : 0) + conditions.length + (priceMin.trim() ? 1 : 0) + (priceMax.trim() ? 1 : 0);

    const clearFilters = () => {
      setPriceMin("");
      setPriceMax("");
      setOnlyPromo(false);
      setConditions([]);
    };

    const toggleCondition = (c: ProductCondition) =>
      setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

    return (
      <>
        <PageHeader api={api} />

        <div className="mx-auto max-w-6xl px-4 py-6">
          <Breadcrumb api={api} crumb={category?.name ?? null} skin={skin} />

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
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-[var(--sf-radius-lg)] border border-[var(--sf-line)] bg-[var(--sf-surface)] text-[var(--sf-ink-secondary)] shadow-[var(--sf-shadow-sm)]">
              {category?.icon_url ? (
                <img src={resolveMediaUrl(category.icon_url) ?? ""} alt="" className="h-full w-full object-cover" />
              ) : (
                <TagStroke />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <PageTitle title={category?.name ?? "Categoria não encontrada"} accent={skin.titleAccent} />
              {category ? (
                <p className="mt-1 text-sm text-[var(--sf-ink-secondary)]">
                  {filteredProducts.length === categoryProducts.length
                    ? `${categoryProducts.length} produto${categoryProducts.length === 1 ? "" : "s"}`
                    : `${filteredProducts.length} de ${categoryProducts.length} produtos`}
                </p>
              ) : (
                <p className="mt-1 text-sm text-[var(--sf-ink-secondary)]">Esta categoria não existe ou foi removida.</p>
              )}
            </div>
          </div>

          {!category ? (
            <EmptyState
              type="notFound"
              title="Categoria não encontrada"
              description="Esta categoria não existe ou foi removida."
              action={<Button variant="outline" onClick={() => navigate(`/s/${slug}`)}>Voltar à loja</Button>}
            />
          ) : categoryProducts.length === 0 ? (
            <EmptyState type="products" title="Sem produtos nesta categoria" description="Ainda não há produtos disponíveis aqui." />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
                  {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                    <button key={key} onClick={() => setSort(key)} className={sortChipClass(skin, sort === key)}>
                      {SORT_LABEL[key]}
                    </button>
                  ))}
                </div>
                <button onClick={() => setFiltersOpen(true)} className={filterButtonClass(skin)}>
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
                  <Grid
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

        <FiltersModal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          currency={currency}
          count={filteredProducts.length}
          title="produtos"
          priceMin={priceMin}
          priceMax={priceMax}
          setPriceMin={setPriceMin}
          setPriceMax={setPriceMax}
          onlyPromo={onlyPromo}
          setOnlyPromo={setOnlyPromo}
          conditions={conditions}
          availableConditions={availableConditions}
          toggleCondition={toggleCondition}
          clearFilters={clearFilters}
        />

        <WishlistDrawer currency={currency} onAdd={addToCart} />
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------------------------
  function SearchPage(api: StorefrontApi) {
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

    const availableConditions = useMemo(() => Array.from(new Set(baseResults.map((p) => p.item_condition))), [baseResults]);

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
      if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      else if (sort === "price-asc") list.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sort === "price-desc") list.sort((a, b) => Number(b.price) - Number(a.price));
      return list;
    }, [baseResults, sort, onlyPromo, conditions, priceMin, priceMax]);

    const activeFilterCount = (onlyPromo ? 1 : 0) + conditions.length + (priceMin.trim() ? 1 : 0) + (priceMax.trim() ? 1 : 0);

    const clearFilters = () => {
      setPriceMin("");
      setPriceMax("");
      setOnlyPromo(false);
      setConditions([]);
    };

    const toggleCondition = (c: ProductCondition) =>
      setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

    return (
      <>
        <PageHeader api={api} />

        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <PageTitle title={queryValue ? <>Resultados para “{queryValue}”</> : "Busca de produtos"} accent={skin.titleAccent} />
              <p className="mt-1 text-sm text-[var(--sf-ink-secondary)]">
                {results.length === 0 ? "Nenhum resultado" : `${results.length} resultado${results.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>

          {queryValue === "" || results.length === 0 ? (
            <EmptyState
              type="search"
              title={queryValue === "" ? "Digite para pesquisar" : "Nenhum produto encontrado"}
              description={queryValue === "" ? "Pesquise por nome ou descrição de um produto." : "Verifique a ortografia ou tente outros termos."}
            />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
                  {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                    <button key={key} onClick={() => setSort(key)} className={sortChipClass(skin, sort === key)}>
                      {SORT_LABEL[key]}
                    </button>
                  ))}
                </div>
                <button onClick={() => setFiltersOpen(true)} className={filterButtonClass(skin)}>
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
                  type="filter"
                  title="Nenhum produto com esses filtros"
                  description="Tenta ajustar ou limpar os filtros aplicados."
                  action={<Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>}
                />
              ) : (
                <Reveal>
                  <Grid
                    products={results}
                    currency={currency}
                    layout="grid"
                    paginate
                    onAdd={addToCart}
                    onView={(p) => api.navigate(`/s/${api.slug}/products/${p.id}`)}
                    isWishlisted={(id) => isWishlisted(id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </Reveal>
              )}
            </>
          )}
        </div>

        <FiltersModal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          currency={currency}
          count={results.length}
          title="resultados"
          priceMin={priceMin}
          priceMax={priceMax}
          setPriceMin={setPriceMin}
          setPriceMax={setPriceMax}
          onlyPromo={onlyPromo}
          setOnlyPromo={setOnlyPromo}
          conditions={conditions}
          availableConditions={availableConditions}
          toggleCondition={toggleCondition}
          clearFilters={clearFilters}
        />

        <WishlistDrawer currency={currency} onAdd={addToCart} />
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // PRODUCT
  // ---------------------------------------------------------------------------
  function ProductPage(api: StorefrontApi) {
    const { slug, navigate, store, products, categories, currency, addToCart, isWishlisted, toggleWishlist } = api;

    const productId = api.route?.productId;
    const product = products.find((p) => p.id === productId) ?? null;
    const category = product?.category_id ? categories.find((c) => c.id === product.category_id) ?? null : null;
    const related = product ? products.filter((p) => p.id !== product.id && p.category_id === product.category_id).slice(0, 12) : [];

    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(true);
    const [videoMuted, setVideoMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    if (!product) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--sf-surface-muted)] px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sf-line)] text-[var(--sf-ink-secondary)]">
            <StoreIcon size={28} />
          </div>
          <h1 className="text-xl font-bold text-[var(--sf-ink)]">Produto não encontrado</h1>
          <p className="mt-2 text-sm text-[var(--sf-ink-secondary)]">Este produto não existe ou foi removido.</p>
          <Button className="mt-6" variant="outline" onClick={() => navigate(`/s/${slug}`)}>
            Voltar à loja
          </Button>
        </div>
      );
    }

    const accent = store.theme_primary || "#FB7701";
    const isPromo = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
    const productIsWishlisted = isWishlisted(product.id);

    const gallery: string[] =
      product.images && product.images.length > 0
        ? product.images.map((img) => resolveMediaUrl(img.url) || placeholderImage(product.name))
        : [resolveMediaUrl(product.image_url) || placeholderImage(product.name)];

    const videoUrl = product.video ? resolveMediaUrl(product.video.url) : null;
    const videoThumb = product.video?.thumbnail_url ? resolveMediaUrl(product.video.thumbnail_url) : null;
    type MediaItem = { type: "video"; url: string; poster: string | null } | { type: "image"; url: string };
    const media: MediaItem[] = videoUrl
      ? [{ type: "video", url: videoUrl, poster: videoThumb }, ...gallery.map((url): MediaItem => ({ type: "image", url }))]
      : gallery.map((url): MediaItem => ({ type: "image", url }));
    const activeMedia = media[activeImg] ?? media[0];

    const handleAddToCart = () => {
      for (let i = 0; i < qty; i++) addToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    };

    return (
      <>
        <PageHeader api={api} />

        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Gallery */}
            <div>
              <div
                className="relative aspect-square w-full overflow-hidden rounded-[var(--sf-radius-lg)] bg-[var(--sf-surface-muted)]"
                onClick={() => {
                  if (activeMedia.type !== "video") return;
                  const v = videoRef.current;
                  if (!v) return;
                  if (v.paused) v.play().catch(() => {});
                  else v.pause();
                }}
              >
                {activeMedia.type === "video" ? (
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
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[var(--sf-ink)] shadow-lg">
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
                      className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white"
                    >
                      {videoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-white">
                      Vídeo
                    </span>
                  </>
                ) : (
                  <img src={activeMedia.url} alt={product.name} className="h-full w-full object-cover" />
                )}
                {isPromo && (
                  <PromoBadge
                    pct={Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}
                    skin={skin}
                  />
                )}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  whileTap={{ scale: 0.8 }}
                  animate={{ scale: productIsWishlisted ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--sf-line)] bg-white text-[var(--sf-ink)] shadow-sm ${
                    productIsWishlisted ? "text-[var(--sf-danger)]" : ""
                  }`}
                  title={productIsWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart size={18} strokeWidth={1.5} fill={productIsWishlisted ? "currentColor" : "none"} />
                </motion.button>
                {media.length > 1 && (
                  <>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImg((i) => (i - 1 + media.length) % media.length);
                      }}
                      whileTap={{ scale: 0.88 }}
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--sf-ink)] shadow-md transition-transform duration-200 hover:scale-105 hover:bg-white"
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImg((i) => (i + 1) % media.length);
                      }}
                      whileTap={{ scale: 0.88 }}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--sf-ink)] shadow-md transition-transform duration-200 hover:scale-105 hover:bg-white"
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
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[var(--sf-radius-md)] border-2 transition-opacity ${
                        i === activeImg ? "" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      style={i === activeImg ? { borderColor: accent } : {}}
                    >
                      <img
                        src={m.type === "video" ? (m.poster ?? placeholderImage(product.name)) : m.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {m.type === "video" && (
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
                <button
                  onClick={() => navigate(`/s/${slug}/categories/${category.id}`)}
                  className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--sf-ink-secondary)] transition-colors hover:text-[var(--sf-primary)]"
                >
                  {category.name}
                </button>
              )}
              <h1 className="mt-1 font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-[var(--sf-ink)]">
                {product.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span
                  className={`font-display text-[32px] font-semibold leading-none tracking-[0.01em] [font-feature-settings:'tnum'_1] ${
                    isPromo ? "text-[var(--sf-primary)]" : "text-[var(--sf-ink)]"
                  }`}
                >
                  {formatCurrency(Number(product.price), currency)}
                </span>
                {isPromo && (
                  <span className="text-base text-[var(--sf-ink-secondary)] line-through [font-feature-settings:'tnum'_1]">
                    {formatCurrency(Number(product.compare_at_price), currency)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--sf-ink-secondary)]">
                {product.color && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: product.color_hex || "#ccc" }} />
                    {product.color}
                  </span>
                )}
                {product.size && <span>Tamanho: {product.size}</span>}
                {product.item_condition && product.item_condition !== "novo" && <span className="capitalize">{product.item_condition}</span>}
              </div>

              {product.description && (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--sf-ink-secondary)]">{product.description}</p>
              )}

              <p className="mt-3 text-xs text-[var(--sf-ink-secondary)]">
                {product.stock > 0 ? `${product.stock} em stock` : "Sem stock disponível"}
              </p>

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
                  className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--sf-radius-sm)] px-6 text-[14px] font-semibold transition-[background-color,box-shadow] duration-200 ${
                    justAdded
                      ? "bg-[var(--sf-success)] text-white"
                      : product.stock <= 0
                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                        : "bg-[var(--sf-primary)] text-white shadow-sm hover:bg-[var(--sf-primary-hover)] hover:shadow-md"
                  }`}
                >
                  {product.stock <= 0 ? (
                    "Indisponível"
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

          {related.length > 0 && (
            <div className="mt-14">
              <Reveal className="mb-5">
                <SectionTitle title="Também pode gostar" skin={skin} />
              </Reveal>
              <Grid
                products={related}
                currency={currency}
                layout="grid"
                onAdd={addToCart}
                onView={(p) => navigate(`/s/${slug}/products/${p.id}`)}
                isWishlisted={(id) => isWishlisted(id)}
                onToggleWishlist={toggleWishlist}
              />
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-[var(--sf-line)] bg-[var(--sf-surface)] px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] sm:hidden">
          <div className="min-w-0 flex-shrink-0">
            <div
              className={`font-display text-[17px] font-semibold leading-none [font-feature-settings:'tnum'_1] ${
                isPromo ? "text-[var(--sf-primary)]" : "text-[var(--sf-ink)]"
              }`}
            >
              {formatCurrency(Number(product.price), currency)}
            </div>
            {isPromo && (
              <div className="text-[11px] text-[var(--sf-ink-secondary)] line-through [font-feature-settings:'tnum'_1]">
                {formatCurrency(Number(product.compare_at_price), currency)}
              </div>
            )}
          </div>
          <motion.button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            whileTap={product.stock <= 0 ? undefined : { scale: 0.97 }}
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--sf-radius-sm)] px-4 text-[14px] font-semibold transition-colors ${
              justAdded
                ? "bg-[var(--sf-success)] text-white"
                : product.stock <= 0
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-[var(--sf-primary)] text-white hover:bg-[var(--sf-primary-hover)]"
            }`}
          >
            {product.stock <= 0 ? (
              "Indisponível"
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

        <WishlistDrawer currency={currency} onAdd={addToCart} />
      </>
    );
  }

  return {
    Product: ProductPage,
    Category: CategoryPage,
    Search: SearchPage,
  };
}

// -----------------------------------------------------------------------------
// Helper partilhado
// -----------------------------------------------------------------------------
type PagesHeaderProps = { api: StorefrontApi };

function FiltersModal({
  open,
  onClose,
  currency,
  count,
  title,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  onlyPromo,
  setOnlyPromo,
  conditions,
  availableConditions,
  toggleCondition,
  clearFilters,
}: {
  open: boolean;
  onClose: () => void;
  currency?: string;
  count: number;
  title: string;
  priceMin: string;
  priceMax: string;
  setPriceMin: (v: string) => void;
  setPriceMax: (v: string) => void;
  onlyPromo: boolean;
  setOnlyPromo: (v: boolean) => void;
  conditions: ProductCondition[];
  availableConditions: ProductCondition[];
  toggleCondition: (c: ProductCondition) => void;
  clearFilters: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Filtros" size="sm">
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
          <Button onClick={onClose}>
            Ver {count} {title}
          </Button>
        </div>
      </div>
    </Modal>
  );
}