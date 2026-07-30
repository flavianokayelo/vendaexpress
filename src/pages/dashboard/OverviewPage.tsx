import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { StatCard, PageHeader, type DashPage } from "./Shell";
import { Select } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import type { Order, OrderStatus } from "../../lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

function RevenueSparkline({ data, accent }: { data: number[]; accent: string }) {
  const w = 120;
  const h = 36;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={`spark-${accent}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts.join(" ")} ${w},${h}`}
        fill={`url(#spark-${accent})`}
      />
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

export function OverviewPage({
  navigate,
  onGoToTab,
}: {
  navigate: (to: string) => void;
  onGoToTab: (page: DashPage) => void;
}) {
  const { store } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
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
      load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-ink-2">A carregar...</div>;

  const sparkData = [40, 75, 60, 90, 85, 110, 95, 130, 120, 145, 170, 160];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resumo"
        subtitle={`Bem-vindo à ${store?.name ?? "tua loja"}.`}
      />

      {/* Store URL banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-paper p-5" style={{ borderRadius: '2px' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-white" style={{ borderRadius: '2px' }}>
            <ExternalLink size={18} />
          </div>
          <div>
            <div className="font-mono text-[13px] font-semibold text-ink">
              A tua loja está online
            </div>
            <div className="font-mono text-[13px] text-ink-2">
              {store?.slug}.vendaexpress.ao
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (store) navigate(`/s/${store.slug}`);
            }}
          >
            <ExternalLink size={15} /> Ver loja
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (store) {
                const url = `${window.location.origin}${window.location.pathname}#/s/${store.slug}`;
                navigator.clipboard?.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
          >
            {copied ? (
              <><Check size={15} /> Copiado!</>
            ) : (
              <><Copy size={15} /> Copiar link</>
            )}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Produtos"
          value={String(stats.products)}
          icon={<Package size={17} />}
          accent="primary"
          onClick={() => onGoToTab("products")}
        />
        <StatCard
          label="Pedidos"
          value={String(stats.orders)}
          icon={<ShoppingCart size={17} />}
          accent="violet"
          onClick={() => onGoToTab("orders")}
        />
        <StatCard
          label="Clientes"
          value={String(stats.customers)}
          icon={<Users size={17} />}
          accent="teal"
          onClick={() => onGoToTab("customers")}
        />
        <StatCard
          label="Receita"
          value={formatCurrency(stats.revenue, store?.currency)}
          icon={<TrendingUp size={17} />}
          accent="rose"
          onClick={() => onGoToTab("orders")}
        />
      </div>

      {/* Revenue mini chart & Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="border border-border bg-paper p-5 lg:col-span-2" style={{ borderRadius: '2px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">Receita (últimos 12 meses)</span>
            <span className="font-heading text-[22px] font-bold tracking-[-.02em] text-ink">
              {formatCurrency(stats.revenue, store?.currency)}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <RevenueSparkline data={sparkData} accent="#8b5cf6" />
            <div className="flex items-center gap-1.5 font-mono text-[12px] font-semibold text-success">
              <ArrowUpRight size={14} />
              +{((sparkData[sparkData.length - 1] - sparkData[0]) / sparkData[0] * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2 px-1">Atalhos</span>
          <button
            onClick={() => onGoToTab("products")}
            className="group flex items-center gap-3 border border-border bg-paper px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ borderRadius: '2px' }}
          >
            <span className="flex h-8 w-8 items-center justify-center bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white" style={{ borderRadius: '2px' }}>
              <Package size={15} />
            </span>
            <div>
              <div className="font-mono text-[13px] font-semibold text-ink">Adicionar produto</div>
              <div className="font-mono text-[11px] text-ink-2">Novo item ao catálogo</div>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-ink-2 transition-transform group-hover:translate-x-[1px]" />
          </button>
          <button
            onClick={() => onGoToTab("orders")}
            className="group flex items-center gap-3 border border-border bg-paper px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ borderRadius: '2px' }}
          >
            <span className="flex h-8 w-8 items-center justify-center bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground" style={{ borderRadius: '2px' }}>
              <ShoppingCart size={15} />
            </span>
            <div>
              <div className="font-mono text-[13px] font-semibold text-ink">Ver pedidos</div>
              <div className="font-mono text-[11px] text-ink-2">Gerir vendas recebidas</div>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-ink-2 transition-transform group-hover:translate-x-[1px]" />
          </button>
          <button
            onClick={() => onGoToTab("appearance")}
            className="group flex items-center gap-3 border border-border bg-paper px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ borderRadius: '2px' }}
          >
            <span className="flex h-8 w-8 items-center justify-center bg-teal-50 text-teal transition-colors group-hover:bg-teal group-hover:text-white" style={{ borderRadius: '2px' }}>
              <Sparkles size={15} />
            </span>
            <div>
              <div className="font-mono text-[13px] font-semibold text-ink">Personalizar loja</div>
              <div className="font-mono text-[11px] text-ink-2">Aparência e temas</div>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-ink-2 transition-transform group-hover:translate-x-[1px]" />
          </button>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-[18px] font-bold text-ink">
            Pedidos recentes
          </h2>
          <button
            onClick={() => onGoToTab("orders")}
            className="font-mono text-[12px] font-semibold text-ink-2 transition hover:text-ink"
          >
            Ver todos →
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={<Clock size={24} />}
            title="Sem pedidos ainda"
            description="Assim que receberes pedidos, eles aparecerão aqui."
          />
        ) : (
          <div className="overflow-hidden border border-border bg-paper" style={{ borderRadius: '2px' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent-soft/30">
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Cliente</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Total</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Estado</th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">
                      {o.customer_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-ink">
                      {formatCurrency(Number(o.total), store?.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={o.status}
                        onChange={(e) =>
                          updateStatus(o, e.target.value as OrderStatus)
                        }
                        className="!py-1 !text-[11px] !font-mono !font-semibold"
                      >
                        {Object.entries(STATUS_LABEL).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-2">
                      {formatDateTime(o.created_at)}
                    </td>
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
