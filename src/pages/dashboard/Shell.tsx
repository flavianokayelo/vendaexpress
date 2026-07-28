import { type ReactNode, useState } from 'react';
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Ticket,
  Settings, Store, LogOut, Menu, X, ExternalLink, Palette, Paintbrush, FileText,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';

export type DashPage =
  | 'overview' | 'products' | 'categories' | 'orders' | 'customers'
  | 'coupons' | 'appearance' | 'themes' | 'settings' | 'pages';

const NAV: { id: DashPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Resumo', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'categories', label: 'Categorias', icon: FolderTree },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'coupons', label: 'Cupons', icon: Ticket },
  { id: 'pages', label: 'Páginas', icon: FileText },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'themes', label: 'Temas', icon: Paintbrush },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const NAV_GROUPS: { label: string; ids: DashPage[] }[] = [
  { label: 'Geral', ids: ['overview'] },
  { label: 'Gestão', ids: ['products', 'categories', 'orders', 'customers', 'coupons'] },
  { label: 'Conteúdo', ids: ['pages'] },
  { label: 'Loja', ids: ['appearance', 'themes', 'settings'] },
];

function NavList({ page, onNavigate }: { page: DashPage; onNavigate: (p: DashPage) => void }) {
  return (
    <>
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label} className={i === 0 ? '' : 'mt-4'}>
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </div>
          <div className="space-y-1">
            {NAV.filter((item) => group.ids.includes(item.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-sm font-medium transition-colors ${
                  page === item.id
                    ? 'border-blue-700 bg-blue-50 text-blue-800'
                    : 'border-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon size={18} />
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
  page, onNavigate, children,
}: {
  page: DashPage;
  onNavigate: (p: DashPage) => void;
  children: ReactNode;
}) {
  const { store, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const subdomain = store ? `${store.slug}.vendaexpress.ao` : '';
  const active = NAV.find((item) => item.id === page);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
            <Store size={20} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{store?.name ?? 'Loja'}</div>
            <div className="truncate text-xs text-slate-500">{subdomain}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <NavList page={page} onNavigate={onNavigate} />
        </nav>
        <div className="space-y-2 border-t border-slate-200 p-3">
          <a
            href={`#/s/${store?.slug ?? ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <ExternalLink size={16} /> Ver loja
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-white">
            <Store size={16} />
          </div>
          <span className="text-sm font-bold text-slate-900">{store?.name}</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-white shadow-xl transition-transform duration-200 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="px-3 py-4">
            <NavList page={page} onNavigate={(p) => { onNavigate(p); setMobileOpen(false); }} />
          </nav>
          <div className="mt-2 space-y-1 border-t border-slate-200 px-3 py-3">
            <a
              href={`#/s/${store?.slug ?? ''}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <ExternalLink size={18} /> Ver loja
            </a>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="md:pl-64">
        <div className="sticky top-0 z-10 hidden items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-3 backdrop-blur md:flex">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            {active && <active.icon size={16} className="text-slate-400" />}
            {active?.label}
          </div>
          <span className="text-xs text-slate-400">{subdomain}</span>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon, accent = 'blue' }: { label: string; value: string; icon: ReactNode; accent?: 'blue' | 'amber' | 'green' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[accent]}`}>{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
