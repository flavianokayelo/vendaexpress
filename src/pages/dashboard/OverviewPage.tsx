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
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { StatCard, PageHeader, type DashPage } from "./Shell";
import { OnboardingCard } from "./OnboardingCard";
import { Select } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { Skeleton, SkeletonStatsGrid, SkeletonTableRows } from "../../components/ui/Skeleton";
import type { Order, OrderStatus } from "../../lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

function RevenueSparkline({
  data,
  accent,
}: {
  data: number[];
  accent: string;
}) {
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

type Milestone = {
  key: string;
  title: string;
  done: boolean;
  hint: string;
};

function Milestones({
  stats,
  onGoToTab,
}: {
  stats: { products: number; orders: number; customers: number; revenue: number };
  onGoToTab: (page: DashPage) => void;
}) {
  const milestones: Milestone[] = [
    {
      key: "product",
      title: "Primeiro produto no catálogo",
      done: stats.products >= 1,
      hint: stats.products >= 1 ? `${stats.products} no catálogo` : "Adiciona o teu primeiro item",
    },
    {
      key: "order",
      title: "Primeira venda",
      done: stats.orders >= 1,
      hint: stats.orders >= 1 ? `${stats.orders} pedidos` : "Partilha o link da loja",
    },
    {
      key: "customer",
      title: "Primeiro cliente",
      done: stats.customers >= 1,
      hint: stats.customers >= 1 ? `${stats.customers} contactos` : "Aparece após a 1ª venda",
    },
    {
      key: "revenue",
      title: "Primeira receita",
      done: stats.revenue > 0,
      hint: stats.revenue > 0 ? formatCurrency(stats.revenue, undefined) : "Da primeira venda em diante",
    },
  ];

  const total = milestones.length;
  const done = milestones.filter((m) => m.done).length;
  const pct = Math.round((done / total) * 100);
  const next = milestones.find((m) => !m.done);

  return (
    <div className="border border-border bg-paper p-4" style={{ borderRadius: "2px" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
          Conquistas
        </span>
        <span className="font-heading text-[18px] font-bold tracking-[-.02em] text-ink">
          {done}/{total}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden bg-ink/[0.06]"
        style={{ borderRadius: "2px" }}
      >
        <div
          className="h-full bg-success transition-all"
          style={{ borderRadius: "2px", width: `${pct}%` }}
        />
      </div>
      <ul className="mt-3 space-y-2.5">
        {milestones.map((m) => (
          <li key={m.key} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${
                m.done
                  ? "border-success bg-success text-white"
                  : m.key === next?.key
                    ? "border-ink bg-ink text-paper"
                    : "border-border-2 text-transparent"
              }`}
              style={{ borderRadius: "2px" }}
              aria-hidden
            >
              {m.done ? <Check size={11} strokeWidth={3} /> : "•"}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={`font-mono text-[13px] font-semibold ${
                  m.done ? "text-ink" : "text-ink-2"
                }`}
              >
                {m.title}
                {m.key === next?.key && (
                  <span className="ml-1.5 align-middle text-[10px] font-bold uppercase tracking-wide text-info">
                    · próximo
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-ink-2/70">{m.hint}</div>
            </div>
          </li>
        ))}
      </ul>
      {done === total && (
        <p className="mt-3 border-t border-border pt-3 font-mono text-[11px] text-info">
          Loja em pleno funcionamento. Continua a fazer crescer!
        </p>
      )}
      {done === 0 && next && (
        <button
          onClick={() => onGoToTab("products")}
          className="mt-3 w-full border border-ink bg-ink px-3 py-2 font-mono text-[12px] font-bold text-paper transition-opacity hover:opacity-90"
          style={{ borderRadius: "2px" }}
        >
          Começar pelo 1º produto
        </button>
      )}
    </div>
  );
}

export function OverviewPage({
  onGoToTab,
}: {
  onGoToTab: (page: DashPage) => void;
}) {
  const { store } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
  const [revenueByMonth, setRevenueByMonth] = useState<number[]>([]);
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
      setRevenueByMonth(data.revenueByMonth ?? []);
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

  const copyLink = async () => {
    if (!store) return;
    const url = `${window.location.origin}${window.location.pathname}#/s/${store.slug}`;
    try {
      await navigator.clipboard?.writeText(url);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading)
    return (
      <div className="space-y-8">
        <div className="mb-1">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <SkeletonStatsGrid count={4} />
        <Skeleton className="h-6 w-40" />
        <SkeletonTableRows rows={5} cols={5} />
      </div>
    );

  const sparkData = revenueByMonth.length > 0 ? revenueByMonth : Array(12).fill(0);
  const revenue12 = sparkData.reduce((a, b) => a + b, 0);
  const first = sparkData[0] ?? 0;
  const last = sparkData[sparkData.length - 1] ?? 0;
  const deltaPct =
    first > 0 ? Math.round(((last - first) / first) * 100) : last > 0 ? 100 : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resumo"
        subtitle={`Bem-vindo à ${store?.name ?? "tua loja"}.`}
      />

      {/* Store URL banner */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 border border-border bg-paper p-5"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center bg-primary text-white"
            style={{ borderRadius: "2px" }}
          >
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
              if (store) {
                const url = `${window.location.origin}${window.location.pathname}#/s/${store.slug}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <ExternalLink size={15} /> Ver loja
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyLink}
            aria-label="Copiar o link da loja"
          >
            {copied ? (
              <>
                <Check size={15} /> Copiado!
              </>
            ) : (
              <>
                <Copy size={15} /> Copiar link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Onboarding / próximo passo inteligente */}
      <OnboardingCard
        stats={stats}
        hasLogo={Boolean(store?.logo_url)}
        hasBanner={Boolean(store?.banner_url || store?.banner_urls?.length)}
        onGoToTab={onGoToTab}
        onShare={copyLink}
      />

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
          hint="Totais recebidos"
        />
        <StatCard
          label="Clientes"
          value={String(stats.customers)}
          icon={<Users size={17} />}
          accent="teal"
          onClick={() => onGoToTab("customers")}
          hint="Compradores únicos"
        />
        <StatCard
          label="Receita"
          value={formatCurrency(stats.revenue, store?.currency)}
          icon={<TrendingUp size={17} />}
          accent="rose"
          onClick={() => onGoToTab("orders")}
          delta={deltaPct}
          sparkline={sparkData}
        />
      </div>

      {/* Revenue mini chart & Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div
          className="border border-border bg-paper p-5 lg:col-span-2"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
              Receita (últimos 12 meses)
            </span>
            <span className="font-heading text-[22px] font-bold tracking-[-.02em] text-ink">
              {formatCurrency(revenue12, store?.currency)}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <RevenueSparkline data={sparkData} accent="#8b5cf6" />
            <div className="flex items-center gap-1.5 font-mono text-[12px] font-semibold text-success">
              {deltaPct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {deltaPct >= 0 ? "+" : ""}
              {deltaPct}%
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Milestones stats={stats} onGoToTab={onGoToTab} />

          <div className="flex flex-col gap-3">
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2 px-1">
            Atalhos
          </span>
          <button
            onClick={() => onGoToTab("products")}
            className="group flex items-center gap-3 border border-border bg-paper px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ borderRadius: "2px" }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
              style={{ borderRadius: "2px" }}
            >
              <Package size={15} />
            </span>
            <div>
              <div className="font-mono text-[13px] font-semibold text-ink">
                Adicionar produto
              </div>
              <div className="font-mono text-[11px] text-ink-2">
                Novo item ao catálogo
              </div>
            </div>
            <ArrowUpRight
              size={14}
              className="ml-auto text-ink-2 transition-transform group-hover:translate-x-[1px]"
            />
          </button>
          <button
            onClick={() => onGoToTab("orders")}
            className="group flex items-center gap-3 border border-border bg-paper px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ borderRadius: "2px" }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
              style={{ borderRadius: "2px" }}
            >
              <ShoppingCart size={15} />
            </span>
            <div>
              <div className="font-mono text-[13px] font-semibold text-ink">
                Ver pedidos
              </div>
              <div className="font-mono text-[11px] text-ink-2">
                Gerir vendas recebidas
              </div>
            </div>
            <ArrowUpRight
              size={14}
              className="ml-auto text-ink-2 transition-transform group-hover:translate-x-[1px]"
            />
          </button>
          <button
            onClick={() => onGoToTab("appearance")}
            className="group flex items-center gap-3 border border-border bg-paper px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ borderRadius: "2px" }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center bg-teal-50 text-teal transition-colors group-hover:bg-teal group-hover:text-white"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles size={15} />
            </span>
            <div>
              <div className="font-mono text-[13px] font-semibold text-ink">
                Personalizar loja
              </div>
              <div className="font-mono text-[11px] text-ink-2">
                Aparência e temas
              </div>
            </div>
            <ArrowUpRight
              size={14}
              className="ml-auto text-ink-2 transition-transform group-hover:translate-x-[1px]"
            />
          </button>
          </div>
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
          <div
            className="overflow-x-auto rounded-[2px] border border-border bg-paper"
            style={{ borderRadius: "2px" }}
          >
            <table className="w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="border-b border-border bg-accent-soft/30">
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((o) => (
                  <tr
                    key={o.id}
                    className="transition-colors hover:bg-ink/[0.02]"
                  >
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
