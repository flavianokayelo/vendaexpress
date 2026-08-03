import { type ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Palette,
  Paintbrush,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { resolveMediaUrl } from "../../lib/api";
import { Surface } from "../../components/ui/Surface";

export type DashPage =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "coupons"
  | "appearance"
  | "themes"
  | "settings";

const NAV: { id: DashPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Resumo", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "categories", label: "Categorias", icon: FolderTree },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "coupons", label: "Cupons", icon: Ticket },
  { id: "appearance", label: "Aparência", icon: Palette },
  { id: "themes", label: "Temas", icon: Paintbrush },
  { id: "settings", label: "Configurações", icon: Settings },
];

const NAV_GROUPS: { label: string; ids: DashPage[] }[] = [
  { label: "Geral", ids: ["overview"] },
  {
    label: "Gestão",
    ids: ["products", "categories", "orders", "customers", "coupons"],
  },
  { label: "Loja", ids: ["appearance", "themes", "settings"] },
];

function NavList({
  page,
  onNavigate,
}: {
  page: DashPage;
  onNavigate: (p: DashPage) => void;
}) {
  return (
    <>
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label} className={i === 0 ? "" : "mt-5"}>
          <div className="px-3 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-2/60">
            {group.label}
          </div>
          <div className="space-y-[1px]">
            {NAV.filter((item) => group.ids.includes(item.id)).map((item) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative flex w-full items-center gap-3 px-3 py-[9px] font-mono text-[13px] font-semibold transition-all duration-150 ${
                    active
                      ? "text-accent"
                      : "text-ink-2 hover:text-ink"
                  }`}
                  style={{ borderRadius: '2px' }}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-accent" />
                  )}
                  <span className={`flex h-7 w-7 items-center justify-center transition-colors duration-150 ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "bg-ink/[0.04] text-ink-2 group-hover:bg-ink/[0.08]"
                  }`} style={{ borderRadius: '2px' }}>
                    <item.icon size={15} />
                  </span>
                  {active ? <span className="text-ink">{item.label}</span> : item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const subdomain = store ? `${store.slug}.vendaexpress.ao` : "";
  const active = NAV.find((item) => item.id === page);

  return (
    <div className="min-h-screen bg-paper">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-paper md:flex">
        <div className="flex items-center gap-[10px] border-b border-border px-5 py-[14px]">
          <div className="flex h-9 w-15 items-center justify-center overflow-hidden text-paper">
            {store?.logo_url ? (
              <img src={resolveMediaUrl(store.logo_url) ?? ""} alt="" className="h-full w-full object-contain" />
            ) : (
              <Store size={19} />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-mono text-[13px] font-bold text-ink">
              {store?.name ?? "Loja"}
            </div>
            <div className="truncate font-mono text-[11px] text-ink-2">{subdomain}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-[11px] py-4">
          <NavList page={page} onNavigate={onNavigate} />
        </nav>
        <div className="space-y-[7px] border-t border-border px-[11px] py-[11px]">
          <a
            href={`#/s/${store?.slug ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 border border-border-2 px-[11px] py-[9px] font-mono text-[12px] font-semibold text-ink-2 transition-all hover:border-ink hover:text-ink"
            style={{ borderRadius: '2px' }}
          >
            <ExternalLink size={15} className="transition-transform duration-150 group-hover:translate-x-[1px]" /> Ver loja
          </a>
          <button
            onClick={signOut}
            className="group flex w-full items-center gap-2 px-[11px] py-[9px] font-mono text-[12px] font-semibold text-ink-2 transition-colors hover:text-danger"
            style={{ borderRadius: '2px' }}
          >
            <LogOut size={15} className="transition-transform duration-150 group-hover:-translate-y-[0.5px]" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-paper px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-ink text-paper overflow-hidden" style={{ borderRadius: '2px' }}>
            {store?.logo_url ? (
              <img src={resolveMediaUrl(store.logo_url) ?? ""} alt="" className="h-full w-full object-contain" />
            ) : (
              <Store size={16} />
            )}
          </div>
          <span className="font-mono text-sm font-bold text-ink">
            {store?.name}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-ink-2 hover:text-ink"
          style={{ borderRadius: '2px' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-paper shadow-xl transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="px-3 py-4">
            <NavList
              page={page}
              onNavigate={(p) => {
                onNavigate(p);
                setMobileOpen(false);
              }}
            />
          </nav>
          <div className="mt-2 space-y-1 border-t border-border px-3 py-3">
            <a
              href={`#/s/${store?.slug ?? ""}`}
              className="group flex items-center gap-3 px-3 py-2 font-mono text-[13px] font-semibold text-ink-2 transition-colors hover:text-ink"
              style={{ borderRadius: '2px' }}
            >
              <ExternalLink size={17} className="transition-transform duration-150 group-hover:translate-x-[1px]" /> Ver loja
            </a>
            <button
              onClick={signOut}
              className="group flex w-full items-center gap-3 px-3 py-2 font-mono text-[13px] font-semibold text-ink-2 transition-colors hover:text-danger"
              style={{ borderRadius: '2px' }}
            >
              <LogOut size={17} className="transition-transform duration-150 group-hover:-translate-y-[0.5px]" /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="md:pl-64">
        <div className="sticky top-0 z-10 hidden items-center justify-between border-b border-border bg-paper/80 px-8 py-[15px] backdrop-blur md:flex">
          <div className="flex items-center gap-2.5 font-mono text-[13px] font-semibold text-ink">
            {active && (
              <span className="flex h-6 w-6 items-center justify-center bg-accent-soft text-accent" style={{ borderRadius: '2px' }}>
                <active.icon size={13} />
              </span>
            )}
            {active?.label}
          </div>
          <span className="font-mono text-[11px] text-ink-2">{subdomain}</span>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
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
        {subtitle && <p className="mt-0.5 font-mono text-[13px] text-ink-2">{subtitle}</p>}
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
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "primary" | "amber" | "green" | "violet" | "teal" | "rose";
  onClick?: () => void;
}) {
  const colors = {
    primary: "text-primary bg-primary/10",
    amber:   "text-warning bg-amber-50",
    green:   "text-success bg-green-50",
    violet:  "text-accent bg-accent/10",
    teal:    "text-teal bg-teal-50",
    rose:    "text-rose bg-rose-50",
  };
  const ringColors = {
    primary: "ring-primary/20",
    amber:   "ring-warning/20",
    green:   "ring-success/20",
    violet:  "ring-accent/20",
    teal:    "ring-teal/20",
    rose:    "ring-rose/20",
  };
  return (
    <Surface
      as={onClick ? "button" : "div"}
      onClick={onClick}
      className={`relative overflow-hidden p-5 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-floating text-left" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center ring-1 ring-inset ${colors[accent]} ${ringColors[accent]}`}
          style={{ borderRadius: '2px' }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-2 font-heading text-[28px] font-bold tracking-[-.02em] text-ink">{value}</div>
    </Surface>
  );
}
