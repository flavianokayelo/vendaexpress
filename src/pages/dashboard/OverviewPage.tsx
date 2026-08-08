import { useEffect, useRef, useState } from "react";
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

const SHORT_MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function monthLabels(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(SHORT_MONTHS[d.getMonth()]);
  }
  return out;
}

function compactValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(Math.round(v));
}

function RevenueChart({
  data,
  currency,
}: {
  data: number[];
  currency?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 640, h: 220 });
  const labels = monthLabels(data.length);

  const hasData = data.some((v) => v > 0) && data.length >= 2;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      if (r.width > 0 && r.height > 0) {
        setBox({ w: Math.round(r.width), h: Math.round(r.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = box.w || 640;
  const H = box.h || 220;
  const padL = 48;
  const padR = 8;
  const padT = 12;
  const padB = 22;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const rawMax = Math.max(...data, 1);
  const tickCount = 4;
  const rawStep = rawMax / tickCount;
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const norm = rawStep / pow;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * pow;
  const niceMax = Math.max(step * tickCount, rawMax);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => step * i);
  const y = (v: number) => padT + plotH - (v / niceMax) * plotH;

  if (!hasData) {
    return (
      <div
        ref={wrapRef}
        className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-center"
      >
        <div className="font-mono text-[13px] font-bold text-ink">
          Sem receita neste período
        </div>
        <div className="font-mono text-[11px] text-ink-2/70">
          A receita dos pedidos aparecerá aqui
        </div>
      </div>
    );
  }

  const band = plotW / data.length;
  const barW = Math.min(30, band * 0.55);

  return (
    <>
      <div ref={wrapRef} className="relative min-h-[180px] flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <style>{`
            @keyframes ve-grow {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
            .ve-bar {
              transform-box: fill-box;
              transform-origin: bottom;
              animation: ve-grow 0.55s cubic-bezier(.22,.61,.36,1) both;
            }
          `}</style>

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(t)}
                y2={y(t)}
                stroke="#000"
                strokeOpacity={t === 0 ? 0.12 : 0.05}
                strokeDasharray={t === 0 ? undefined : "3 4"}
              />
              <text
                x={padL - 8}
                y={y(t) + 3.5}
                textAnchor="end"
                className="fill-ink/50 font-mono text-[10px]"
              >
                {compactValue(t)}
              </text>
            </g>
          ))}

          {data.map((v, i) => {
            const cx = padL + band * i + band / 2;
            const h = Math.max((v / niceMax) * plotH, 2);
            const by = padT + plotH;
            const active = hover === i;
            return (
              <g key={i}>
                {active && (
                  <line
                    x1={cx}
                    x2={cx}
                    y1={padT}
                    y2={padT + plotH}
                    stroke="#8b5cf6"
                    strokeOpacity={0.25}
                  />
                )}
                <rect
                  x={cx - barW / 2}
                  y={by - h}
                  width={barW}
                  height={h}
                  rx={2}
                  fill={active ? "#6d28d9" : "#8b5cf6"}
                  fillOpacity={v === 0 ? 0.25 : active ? 1 : 0.85}
                  className="ve-bar"
                />
                <rect
                  x={cx - band / 2}
                  y={padT}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
                <text
                  x={cx}
                  y={padT + plotH + 18}
                  textAnchor="middle"
                  className={`font-mono text-[10px] ${
                    active ? "fill-ink" : "fill-ink/50"
                  }`}
                >
                  {labels[i]}
                </text>
                {active && (
                  <g transform={`translate(${cx}, ${Math.max(padT + 4, by - h - 26)})`}>
                    <rect
                      x={-34}
                      y={10}
                      width={68}
                      height={22}
                      rx={3}
                      fill="#111"
                    />
                    <text
                      textAnchor="middle"
                      y={24.5}
                      className="fill-paper font-mono text-[10px] font-bold"
                    >
                      {compactValue(v)} {currency === "AOA" ? "Kz" : ""}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-1 flex items-center gap-2 font-mono text-[10px] text-ink-2/70">
        <span className="inline-block h-[8px] w-[8px]" style={{ borderRadius: "2px", background: "#8b5cf6" }} />
        Receita por mês · passa o rato para veres os valores
      </p>
    </>
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

      {/* Revenue chart & Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div
          className="flex flex-col border border-border bg-paper p-5 lg:col-span-2"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
              Receita (últimos 12 meses)
            </span>
            <div className="flex items-center gap-2.5">
              <span className="font-heading text-[22px] font-bold tracking-[-.02em] text-ink">
                {formatCurrency(revenue12, store?.currency)}
              </span>
              <span className="flex items-center gap-1 font-mono text-[12px] font-semibold text-success">
                {deltaPct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {deltaPct >= 0 ? "+" : ""}
                {deltaPct}%
              </span>
            </div>
          </div>
          <RevenueChart data={sparkData} currency={store?.currency} />
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
