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
  FileText,
} from "lucide-react";
import { useAuth } from "../../lib/auth";

export type DashPage =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "coupons"
  | "appearance"
  | "themes"
  | "settings"
  | "pages";

const NAV: { id: DashPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Resumo", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "categories", label: "Categorias", icon: FolderTree },
  { id: "orders", label: "Pedidos", icon: ShoppingCart },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "coupons", label: "Cupons", icon: Ticket },
  { id: "pages", label: "Páginas", icon: FileText },
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
  { label: "Conteúdo", ids: ["pages"] },
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
        <div key={group.label} className={i === 0 ? "" : "mt-4"}>
          <div className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-2">
            {group.label}
          </div>
          <div className="space-y-[2px]">
            {NAV.filter((item) => group.ids.includes(item.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 px-3 py-[9px] font-mono text-[13px] font-semibold transition-all ${
                  page === item.id
                    ? "text-ink bg-black/5"
                    : "text-ink-2 hover:text-ink hover:bg-black/[0.03]"
                }`}
                style={{ borderRadius: '2px' }}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
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
        <div className="flex items-center gap-[10px] px-5 py-[18px]">
          <div className="flex h-9 w-9 items-center justify-center bg-ink text-paper" style={{ borderRadius: '2px' }}>
            <Store size={19} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-mono text-[13px] font-bold text-ink">
              {store?.name ?? "Loja"}
            </div>
            <div className="truncate font-mono text-[11px] text-ink-2">{subdomain}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-[11px] py-2">
          <NavList page={page} onNavigate={onNavigate} />
        </nav>
        <div className="space-y-[7px] border-t border-border p-[11px]">
          <a
            href={`#/s/${store?.slug ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-border-2 px-[11px] py-[9px] font-mono text-[12px] font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink"
            style={{ borderRadius: '2px' }}
          >
            <ExternalLink size={15} /> Ver loja
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 px-[11px] py-[9px] font-mono text-[12px] font-semibold text-ink-2 transition-colors hover:text-danger"
            style={{ borderRadius: '2px' }}
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-paper px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-ink text-paper" style={{ borderRadius: '2px' }}>
            <Store size={16} />
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
              className="flex items-center gap-3 px-3 py-2 font-mono text-[13px] font-semibold text-ink-2 hover:text-ink"
              style={{ borderRadius: '2px' }}
            >
              <ExternalLink size={18} /> Ver loja
            </a>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 px-3 py-2 font-mono text-[13px] font-semibold text-ink-2 hover:text-danger"
              style={{ borderRadius: '2px' }}
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="md:pl-64">
        <div className="sticky top-0 z-10 hidden items-center justify-between border-b border-border bg-paper/80 px-8 py-[15px] backdrop-blur md:flex">
          <div className="flex items-center gap-2 font-mono text-[13px] font-semibold text-ink-2">
            {active && <active.icon size={15} className="text-ink-2" />}
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
      <div>
        <h1 className="font-heading text-[22px] font-bold text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 font-mono text-[13px] text-ink-2">{subtitle}</p>}
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
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "primary" | "amber" | "green";
}) {
  const colors = {
    primary: "text-primary bg-accent-soft",
    amber: "text-warning bg-amber-50",
    green: "text-success bg-green-50",
  };
  return (
    <div className="border border-border bg-white p-5 transition-shadow hover:shadow-md" style={{ borderRadius: '2px' }}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] font-semibold text-ink-2">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center ${colors[accent]}`}
          style={{ borderRadius: '2px' }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 font-heading text-[26px] font-bold text-ink">{value}</div>
    </div>
  );
}
