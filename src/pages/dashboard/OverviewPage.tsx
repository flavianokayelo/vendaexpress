import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { StatCard, PageHeader, type DashPage } from './Shell';
import { Select } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Feedback';
import type { Order, OrderStatus } from '../../lib/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};

export function OverviewPage({
  navigate,
  onGoToTab,
}: {
  navigate: (to: string) => void;
  onGoToTab: (page: DashPage) => void;
}) {
  const { store } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const data = await api.stores.getStats();
      setStats({
        products: data.products,
        orders: data.orders,
        customers: data.customers,
        revenue: data.revenue,
      });
      setRecent(data.recentOrders ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!store) return;
    load();
  }, [store]);

  const updateStatus = async (order: Order, status: OrderStatus) => {
    try {
      await api.orders.updateStatus(order.id, status);
      // Recarrega tudo (não só a linha) porque mudar o status também pode
      // alterar a receita mostrada no card, se entrar/sair de 'paid'/'shipped'/'delivered'.
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-slate-400">A carregar...</div>;

  return (
    <div>
      <PageHeader title="Resumo" subtitle={`Bem-vindo à ${store?.name ?? 'tua loja'}.`} />

      {/* Store URL banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
            <ExternalLink size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-blue-900">A tua loja está online</div>
            <div className="font-mono text-sm text-blue-800">{store?.slug}.vendaexpress.ao</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { if (store) navigate(`/s/${store.slug}`); }}>
            <ExternalLink size={16} /> Ver loja
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            if (store) {
              const url = `${window.location.origin}${window.location.pathname}#/s/${store.slug}`;
              navigator.clipboard?.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}>
            {copied ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar link</>}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => onGoToTab('products')} className="text-left transition-transform hover:-translate-y-0.5">
          <StatCard label="Produtos" value={String(stats.products)} icon={<Package size={18} />} accent="blue" />
        </button>
        <button type="button" onClick={() => onGoToTab('orders')} className="text-left transition-transform hover:-translate-y-0.5">
          <StatCard label="Pedidos" value={String(stats.orders)} icon={<ShoppingCart size={18} />} accent="blue" />
        </button>
        <button type="button" onClick={() => onGoToTab('customers')} className="text-left transition-transform hover:-translate-y-0.5">
          <StatCard label="Clientes" value={String(stats.customers)} icon={<Users size={18} />} accent="amber" />
        </button>
        <button type="button" onClick={() => onGoToTab('orders')} className="text-left transition-transform hover:-translate-y-0.5">
          <StatCard label="Receita" value={formatCurrency(stats.revenue, store?.currency)} icon={<TrendingUp size={18} />} accent="green" />
        </button>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Pedidos recentes</h2>
        {recent.length === 0 ? (
          <EmptyState icon={<Clock size={28} />} title="Sem pedidos ainda" description="Assim que receberes pedidos, eles aparecerão aqui." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{o.customer_name}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(Number(o.total), store?.currency)}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={o.status}
                        onChange={(e) => updateStatus(o, e.target.value as OrderStatus)}
                        className="!py-1 !text-xs"
                      >
                        {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}