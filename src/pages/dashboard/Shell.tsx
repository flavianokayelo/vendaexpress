import { type ReactNode, useState } from 'react';
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Ticket,
  Settings, Store, LogOut, Menu, X, ExternalLink, Palette,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/ui/Button';

export type DashPage =
  | 'overview' | 'products' | 'categories' | 'orders' | 'customers'
  | 'coupons' | 'appearance' | 'settings';

const NAV: { id: DashPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Resumo', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'categories', label: 'Categorias', icon: FolderTree },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'coupons', label: 'Cupons', icon: Ticket },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
            <Store size={20} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{store?.name ?? 'Loja'}</div>
            <div className="truncate text-xs text-slate-500">{subdomain}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                page === item.id ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <a
            href={`#/s/${store?.slug ?? ''}`}
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <ExternalLink size={18} /> Ver loja
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={18} /> Sair
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
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white">
            <nav className="space-y-1 px-3 py-4">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    page === item.id ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon size={18} /> {item.label}
                </button>
              ))}
              <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                <LogOut size={18} /> Sair
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="md:pl-64">
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
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[accent]}`}>{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
