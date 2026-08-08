import { type ReactNode, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Share2,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Palette,
  Paintbrush,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api, resolveMediaUrl } from "../../lib/api";
import { Surface } from "../../components/ui/Surface";

export type DashPage =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "coupons"
  | "share"
  | "appearance"
  | "themes"
  | "settings"
  | "help";

const NAV: { id: DashPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Resumo", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "categories", label: "Categorias", icon: FolderTree },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "coupons", label: "Cupons", icon: Ticket },
  { id: "share", label: "Partilhar", icon: Share2 },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "themes", label: "Temas", icon: Paintbrush },
  { id: "settings", label: "Configurações", icon: Settings },
  { id: "help", label: "Ajuda", icon: ExternalLink },
];

/** Navegação agrupada por domínio, até colapsável por grupo. */
const NAV_GROUPS: {
  label: string;
  icon: typeof LayoutDashboard;
  ids: DashPage[];
}[] = [
  { label: "Visão Geral", icon: LayoutDashboard, ids: ["overview"] },
  {
    label: "Catálogo",
    icon: Package,
    ids: ["products", "categories", "coupons"],
  },
  { label: "Vendas", icon: ShoppingCart, ids: ["orders", "customers"] },
  {
    label: "Loja",
    icon: Store,
    ids: ["share", "appearance", "themes", "settings"],
  },
  { label: "Ajuda", icon: ExternalLink, ids: ["help"] },
];

/** As 4 páginas de acesso direto na barra inferior do mobile — o resto vive na folha "Mais". */
const MOBILE_TAB_IDS: DashPage[] = ["overview", "products", "orders", "share"];

/** Mesmos grupos da sidebar, mas sem os itens já presentes na barra inferior. */
const MOBILE_MORE_GROUPS = NAV_GROUPS.map((group) => ({
  ...group,
  ids: group.ids.filter((id) => !MOBILE_TAB_IDS.includes(id)),
})).filter((group) => group.ids.length > 0);

type Stats = {
  products: number;
  orders: number;
  customers: number;
  revenue: number;
} | null;

function useSidebarStats() {
  const [stats, setStats] = useState<Stats>(null);
  useEffect(() => {
    api.stores
      .getStats()
      .then((d) =>
        setStats({
          products: d.products,
          orders: d.orders,
          customers: d.customers,
          revenue: d.revenue,
        }),
      )
      .catch(() => setStats(null));
  }, []);
  return stats;
}

function PlanBadge({ store }: { store: ReturnType<typeof useAuth>["store"] }) {
  const sub = store?.subscription;
  if (sub?.active && sub.plan) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-[2px] border border-accent/30 bg-accent/10 px-1.5 py-[1px] font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-accent"
        title={`Plano ${sub.plan.name}`}
      >
        {sub.plan.name}
      </span>
    );
  }
  if (store?.status === "trial" || sub?.reason === "trial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[2px] border border-warning/30 bg-warning/10 px-1.5 py-[1px] font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-warning">
        Teste
        {sub && sub.days_left >= 0 ? ` · ${sub.days_left}d` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-[2px] border border-border-2 px-1.5 py-[1px] font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-ink-2">
      Grátis
    </span>
  );
}

function PlanUsageBar({ stats }: { stats: Stats }) {
  const { store } = useAuth();
  const limit = store?.subscription?.plan?.product_limit;
  if (limit == null || stats == null) return null;
  const used = Math.min(stats.products, limit);
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const full = stats.products >= limit;
  return (
    <div className="px-[11px] pb-1">
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-2">
        <span>Produtos</span>
        <span className={full ? "text-danger" : ""}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.07]">
        <div
          className={`h-full transition-all duration-500 ${
            full ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-accent"
          }`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

function NavList({
  page,
  onNavigate,
  counts,
  collapsed,
  groups = NAV_GROUPS,
}: {
  page: DashPage;
  onNavigate: (p: DashPage) => void;
  counts: Stats;
  collapsed: boolean;
  groups?: typeof NAV_GROUPS;
}) {
  const [closedGroups, setClosedGroups] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("ve_dash_closed_groups");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleGroup = (label: string) => {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      try {
        localStorage.setItem(
          "ve_dash_closed_groups",
          JSON.stringify([...next]),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const badgeFor = (id: DashPage): number | null =>
    id === "orders" ? (counts?.orders ?? 0) : null;

  return (
    <>
      {groups.map((group, i) => {
        const closed = closedGroups.has(group.label);
        const items = NAV.filter((item) => group.ids.includes(item.id));
        return (
          <div key={group.label} className={i === 0 ? "" : "mt-4"}>
            {collapsed ? (
              i === 0 ? null : (
                <div className="mb-2 h-px bg-border-2/60" />
              )
            ) : (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-3 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-2/60"
                title={group.label}
              >
                <span className="flex items-center gap-2">
                  <group.icon size={12} className="opacity-60" />
                  {group.label}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-150 ${
                    closed ? "-rotate-90" : ""
                  }`}
                />
              </button>
            )}
            <div
              className={`space-y-[1px] ${closed && !collapsed ? "hidden" : ""}`}
            >
              {items.map((item) => {
                const active = page === item.id;
                const badge = badgeFor(item.id);
                return (
                  <button
                    key={item.id}
                    title={collapsed ? item.label : undefined}
                    onClick={() => onNavigate(item.id)}
                    className={`group relative flex w-full items-center gap-3 px-3 py-[9px] font-mono text-[13px] font-semibold transition-all duration-150 ${
                      collapsed ? "justify-center" : ""
                    } ${active ? "text-accent" : "text-ink-2 hover:text-ink"}`}
                    style={{ borderRadius: "2px" }}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-accent" />
                    )}
                    <span
                      className={`flex h-7 w-7 items-center justify-center transition-colors duration-150 ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "bg-ink/[0.04] text-ink-2 group-hover:bg-ink/[0.08]"
                      }`}
                      style={{ borderRadius: "2px" }}
                    >
                      <item.icon size={15} />
                    </span>
                    {!collapsed && item.label}
                    {!collapsed && badge != null && badge > 0 && (
                      <span className="ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink/[0.06] px-1 font-mono text-[10px] font-bold text-ink-2">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Barra de navegação inferior fixa, ao estilo de app nativa (mobile only). */
function MobileTabBar({
  page,
  onNavigate,
  moreOpen,
  onToggleMore,
  counts,
}: {
  page: DashPage;
  onNavigate: (p: DashPage) => void;
  moreOpen: boolean;
  onToggleMore: () => void;
  counts: Stats;
}) {
  const items = NAV.filter((item) => MOBILE_TAB_IDS.includes(item.id));
  const moreActive = !moreOpen && !MOBILE_TAB_IDS.includes(page);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-paper/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const active = !moreOpen && page === item.id;
        const badge = item.id === "orders" ? (counts?.orders ?? 0) : null;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2 font-mono text-[10px] font-semibold transition-colors ${
              active ? "text-accent" : "text-ink-2"
            }`}
          >
            {active && (
              <span className="absolute top-0 h-[2px] w-8 rounded-full bg-accent" />
            )}
            <span className="relative">
              <item.icon size={20} strokeWidth={active ? 2.4 : 2} />
              {badge != null && badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            {item.label}
          </button>
        );
      })}
      <button
        onClick={onToggleMore}
        className={`relative flex flex-1 flex-col items-center gap-1 py-2 font-mono text-[10px] font-semibold transition-colors ${
          moreActive ? "text-accent" : "text-ink-2"
        }`}
      >
        {moreActive && (
          <span className="absolute top-0 h-[2px] w-8 rounded-full bg-accent" />
        )}
        <Menu size={20} strokeWidth={moreActive ? 2.4 : 2} />
        Mais
      </button>
    </nav>
  );
}

export function DashboardShell({
  page,
  onNavigate,
  children,
}: {
  page: DashPage;
  onNavigate: (p: DashPage) => void;
  children: ReactNode;
}) {
  const { store, signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("ve_dash_sidebar_closed");
      if (stored != null) return stored === "1";
    } catch {
      /* ignore */
    }
    // Sem preferência guardada: tablet começa recolhida (mais espaço de ecrã), desktop expandida.
    return typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches;
  });
  const stats = useSidebarStats();

  const toggleSidebar = () => {
    setSidebarClosed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ve_dash_sidebar_closed", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const subdomain = store ? `${store.slug}.vendaexpress.ao` : "";
  const active = NAV.find((item) => item.id === page);

  return (
    <div className="min-h-screen bg-paper">
      {/* Sidebar - desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-paper transition-all duration-200 md:flex ${
          sidebarClosed ? "w-[68px]" : "w-64"
        }`}
      >
        <div className="flex items-center gap-[10px] border-b border-border px-4 py-[14px]">
          <button
            onClick={toggleSidebar}
            className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center text-ink-2 transition-colors hover:text-ink md:mx-0"
            title={sidebarClosed ? "Abrir menu" : "Recolher menu"}
            style={{ borderRadius: "2px" }}
          >
            {sidebarClosed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          {!sidebarClosed && (
            <>
              {store?.logo_url ? (
                <span className="flex h-9 w-10 shrink-0 items-center justify-center overflow-hidden">
                  <img
                    src={resolveMediaUrl(store.logo_url) ?? ""}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
              ) : (
                <div className="flex h-9 w-10 shrink-0 items-center justify-center bg-ink text-paper">
                  <Store size={19} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="truncate font-mono text-[13px] font-bold text-ink">
                    {store?.name ?? "Loja"}
                  </div>
                </div>
                <div className="truncate font-mono text-[11px] text-ink-2">
                  {subdomain}
                </div>
                <div className="mt-1">
                  <PlanBadge store={store} />
                </div>
              </div>
            </>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-[11px] py-4">
          <NavList
            page={page}
            onNavigate={onNavigate}
            counts={stats}
            collapsed={sidebarClosed}
          />
        </nav>
        <div className="space-y-[7px] border-t border-border px-[11px] py-[11px]">
          {!sidebarClosed && <PlanUsageBar stats={stats} />}
          <a
            href={`#/s/${store?.slug ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            title={sidebarClosed ? "Ver loja" : undefined}
            className="group flex items-center gap-2 border border-border-2 px-[11px] py-[9px] font-mono text-[12px] font-semibold text-ink-2 transition-all hover:border-ink hover:text-ink"
            style={{ borderRadius: "2px" }}
          >
            <ExternalLink
              size={15}
              className={`shrink-0 transition-transform duration-150 group-hover:translate-x-[1px] ${sidebarClosed ? "mx-auto" : ""}`}
            />
            {!sidebarClosed && "Ver loja"}
          </a>
          <button
            onClick={signOut}
            title={sidebarClosed ? "Sair" : undefined}
            className={`group flex w-full items-center gap-2 px-[11px] py-[9px] font-mono text-[12px] font-semibold text-ink-2 transition-colors hover:text-danger ${
              sidebarClosed ? "justify-center" : ""
            }`}
            style={{ borderRadius: "2px" }}
          >
            <LogOut
              size={15}
              className="shrink-0 transition-transform duration-150 group-hover:-translate-y-[0.5px]"
            />
            {!sidebarClosed && "Sair"}
          </button>
        </div>
      </aside>

      {/* Cabeçalho mobile */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-paper/95 px-4 py-3 backdrop-blur-lg md:hidden"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {store?.logo_url ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden" style={{ borderRadius: "2px" }}>
              <img
                src={resolveMediaUrl(store.logo_url) ?? ""}
                alt=""
                className="h-full w-full object-contain"
              />
            </span>
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center bg-ink text-paper overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              <Store size={16} />
            </div>
          )}
          <span className="truncate font-mono text-sm font-bold text-ink">
            {store?.name}
          </span>
        </div>
        <a
          href={`#/s/${store?.slug ?? ""}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver loja"
          className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-2 transition-colors hover:text-ink"
          style={{ borderRadius: "2px" }}
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Folha "Mais" — sobe do fundo, ao estilo de app nativa */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${moreOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!moreOpen}
      >
        <div
          onClick={() => setMoreOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${
            moreOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-border bg-paper shadow-xl transition-transform duration-300 ease-out ${
            moreOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        >
          <div className="flex justify-center pt-2.5">
            <span className="h-1 w-9 rounded-full bg-border-2" />
          </div>
          <div className="flex items-center justify-between px-4 pb-1 pt-2.5">
            <span className="font-heading text-[15px] font-bold tracking-[-.01em] text-ink">
              Mais
            </span>
            <button
              onClick={() => setMoreOpen(false)}
              className="flex h-8 w-8 items-center justify-center text-ink-2 hover:text-ink"
              style={{ borderRadius: "2px" }}
            >
              <X size={18} />
            </button>
          </div>
          <nav className="px-3 py-2">
            <NavList
              page={page}
              onNavigate={(p) => {
                onNavigate(p);
                setMoreOpen(false);
              }}
              counts={stats}
              collapsed={false}
              groups={MOBILE_MORE_GROUPS}
            />
          </nav>
          <div className="mt-2 space-y-1 border-t border-border px-3 py-3">
            <a
              href={`#/s/${store?.slug ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-2 font-mono text-[13px] font-semibold text-ink-2 transition-colors hover:text-ink"
              style={{ borderRadius: "2px" }}
            >
              <ExternalLink
                size={17}
                className="transition-transform duration-150 group-hover:translate-x-[1px]"
              />{" "}
              Ver loja
            </a>
            <button
              onClick={signOut}
              className="group flex w-full items-center gap-3 px-3 py-2 font-mono text-[13px] font-semibold text-ink-2 transition-colors hover:text-danger"
              style={{ borderRadius: "2px" }}
            >
              <LogOut
                size={17}
                className="transition-transform duration-150 group-hover:-translate-y-[0.5px]"
              />{" "}
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main
        className={`transition-all duration-200 ${sidebarClosed ? "md:pl-[68px]" : "md:pl-64"}`}
      >
        <div className="sticky top-0 z-10 hidden items-center justify-between border-b border-border bg-paper/80 px-8 py-[15px] backdrop-blur md:flex">
          <div className="flex items-center gap-2.5 font-mono text-[13px] font-semibold text-ink">
            {active && (
              <span
                className="flex h-6 w-6 items-center justify-center bg-accent-soft text-accent"
                style={{ borderRadius: "2px" }}
              >
                <active.icon size={13} />
              </span>
            )}
            {active?.label}
          </div>
          <span className="font-mono text-[11px] text-ink-2">{subdomain}</span>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:py-8">
          {children}
        </div>
        {/* Espaço de segurança para a barra inferior + notch dos telemóveis */}
        <div
          className="md:hidden"
          style={{ height: "env(safe-area-inset-bottom)" }}
        />
      </main>

      <MobileTabBar
        page={page}
        onNavigate={(p) => {
          setMoreOpen(false);
          onNavigate(p);
        }}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((v) => !v)}
        counts={stats}
      />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="relative pl-4">
        <span className="absolute left-0 top-1 h-6 w-[3px] rounded-r-full bg-accent" />
        <h1 className="font-heading text-[24px] font-bold tracking-[-.02em] text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 font-mono text-[13px] text-ink-2">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = "primary",
  onClick,
  delta,
  sparkline,
  hint,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "primary" | "amber" | "green" | "violet" | "teal" | "rose";
  onClick?: () => void;
  delta?: number | null;
  sparkline?: number[];
  hint?: string;
}) {
  const colors = {
    primary: "text-primary bg-primary/10",
    amber: "text-warning bg-amber-50",
    green: "text-success bg-green-50",
    violet: "text-accent bg-accent/10",
    teal: "text-teal bg-teal-50",
    rose: "text-rose bg-rose-50",
  };
  const ringColors = {
    primary: "ring-primary/20",
    amber: "ring-warning/20",
    green: "ring-success/20",
    violet: "ring-accent/20",
    teal: "ring-teal/20",
    rose: "ring-rose/20",
  };
  const hasDelta = typeof delta === "number";
  const up = (delta ?? 0) >= 0;
  return (
    <Surface
      as={onClick ? "button" : "div"}
      onClick={onClick}
      className={`relative overflow-hidden p-5 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-floating text-left"
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
          {label}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center ring-1 ring-inset ${colors[accent]} ${ringColors[accent]}`}
          style={{ borderRadius: "2px" }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-2 font-heading text-[28px] font-bold tracking-[-.02em] text-ink">
        {value}
      </div>
      {(hasDelta || hint) && (
        <div className="mt-2 flex items-center gap-2">
          {hasDelta ? (
            <span
              className={`inline-flex items-center gap-1 font-mono text-[12px] font-bold ${
                up ? "text-success" : "text-danger"
              }`}
            >
              {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {up ? "+" : ""}
              {delta}%
            </span>
          ) : null}
          {hint ? (
            <span className="font-mono text-[11px] text-ink-2">{hint}</span>
          ) : null}
        </div>
      )}
      {sparkline && sparkline.length > 1 && (
        <Sparkline
          data={sparkline}
          accent={
            accent === "rose"
              ? "#e11d48"
              : accent === "violet"
                ? "#8b5cf6"
                : accent === "teal"
                  ? "#0d9488"
                  : "#6b7280"
          }
          className="mt-3"
        />
      )}
    </Surface>
  );
}

function Sparkline({
  data,
  accent,
  className = "",
}: {
  data: number[];
  accent: string;
  className?: string;
}) {
  const w = 100;
  const h = 28;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
