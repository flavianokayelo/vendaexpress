import { useEffect, useState } from "react";
import { ShoppingCart, Eye, Share2, Check } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/Feedback";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Surface } from "../../components/ui/Surface";
import { useToast } from "../../components/ui/Toast";
import type { Order, OrderItem, OrderStatus } from "../../lib/types";

const STATUS_COLOR: Record<
  string,
  "amber" | "green" | "blue" | "ink" | "red"
> = {
  pending: "amber",
  paid: "blue",
  shipped: "ink",
  delivered: "green",
  cancelled: "red",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_DOT: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#3b82f6",
  shipped: "#52504a",
  delivered: "#16a34a",
  cancelled: "#ef4444",
};

export function OrdersPage() {
  const { store } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{
    order: Order;
    items: OrderItem[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const shareLink = async () => {
    if (!store) return;
    const url = `${window.location.origin}${window.location.pathname}#/s/${store.slug}`;
    try {
      await navigator.clipboard?.writeText(url);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const load = async () => {
    try {
      const data = await api.orders.list();
      setOrders(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [store]);

  const updateStatus = async (order: Order, status: OrderStatus) => {
    try {
      await api.orders.updateStatus(order.id, status);
      toast.success("Estado do pedido atualizado");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar pedido");
    }
  };

  const view = async (order: Order) => {
    try {
      const items = await api.orders.getItems(order.id);
      setViewing({ order, items: items ?? [] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar detalhes do pedido");
    }
  };

  return (
    <div>
      <PageHeader title="Pedidos" subtitle={`${orders.length} pedidos`} />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={28} />}
          title="Sem pedidos ainda"
          description="Os pedidos dos teus clientes aparecerão aqui. Para começar a vender, partilha o link da tua loja."
          action={
            <Button onClick={shareLink}>
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? "Link copiado!" : "Partilhar o link da loja"}
            </Button>
          }
        />
      ) : (
        <>
          {/* Resumo por estado — filtra a lista de relance */}
          <div className="mb-5 flex flex-wrap gap-2">
            {(["all", ...Object.keys(STATUS_LABEL)] as (OrderStatus | "all")[]).map(
              (s) => {
                const count =
                  s === "all"
                    ? orders.length
                    : orders.filter((o) => o.status === s).length;
                const active = filter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[12px] font-semibold transition-colors ${
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-border-2 bg-paper text-ink-2 hover:border-ink hover:text-ink"
                    }`}
                    style={{ borderRadius: "2px" }}
                  >
                    {s !== "all" && (
                      <span
                        className="h-2 w-2 rounded-full ring-1 ring-inset ring-black/10"
                        style={{ backgroundColor: STATUS_DOT[s] }}
                      />
                    )}
                    {s === "all" ? "Todos" : STATUS_LABEL[s]}
                    <span className={active ? "opacity-70" : "text-ink-2/60"}>{count}</span>
                  </button>
                );
              },
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders
              .filter((o) => filter === "all" || o.status === filter)
              .map((o) => (
                <Surface
                  key={o.id}
                  className="flex flex-col p-4 hover:-translate-y-0.5 hover:shadow-floating"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-heading text-[15px] font-bold text-ink">
                        {o.customer_name}
                      </div>
                      <div className="truncate font-mono text-[12px] text-ink-2">
                        {o.customer_phone ?? "—"}
                      </div>
                    </div>
                    <Badge color={STATUS_COLOR[o.status]}>
                      {STATUS_LABEL[o.status]}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-2">
                        Total
                      </div>
                      <div className="mt-0.5 font-heading text-[22px] font-bold tracking-[-.02em] text-ink">
                        {formatCurrency(Number(o.total), store?.currency)}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-ink-2">
                      {formatDateTime(o.created_at)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end gap-2 border-t border-border pt-3">
                    <Select
                      value={o.status}
                      onChange={(e) =>
                        updateStatus(o, e.target.value as OrderStatus)
                      }
                      aria-label={`Estado do pedido de ${o.customer_name}`}
                      className="!py-1.5 !text-[12px] !font-mono !font-semibold"
                    >
                      {Object.entries(STATUS_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </Select>
                    <button
                      onClick={() => view(o)}
                      aria-label={`Ver detalhes do pedido de ${o.customer_name}`}
                      className="ml-auto flex h-7 w-9 items-center justify-center border border-border-2 text-ink-2 transition-colors hover:border-ink hover:text-ink"
                      style={{ borderRadius: "2px" }}
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </Surface>
              ))}
          </div>
        </>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Detalhes do pedido"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="bg-ink/[0.02] p-4" style={{ borderRadius: '2px' }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] text-ink-2">Estado</span>
                <Badge color={STATUS_COLOR[viewing.order.status]}>
                  {STATUS_LABEL[viewing.order.status]}
                </Badge>
              </div>
              <div className="mt-3 space-y-1 font-mono text-[13px]">
                <div>
                  <span className="text-ink-2">Cliente:</span>{" "}
                  <span className="font-semibold text-ink">
                    {viewing.order.customer_name}
                  </span>
                </div>
                <div>
                  <span className="text-ink-2">Telefone:</span>{" "}
                  <span className="font-semibold text-ink">
                    {viewing.order.customer_phone ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-ink-2">Endereço:</span>{" "}
                  <span className="font-semibold text-ink">
                    {viewing.order.customer_address ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-ink-2">Data:</span>{" "}
                  <span className="font-semibold text-ink">
                    {formatDateTime(viewing.order.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-heading text-sm font-bold text-ink">
                Itens
              </h4>
              <div className="space-y-2">
                {viewing.items.map((it) => (
                  <Surface
                    key={it.id}
                    className="flex items-center justify-between p-3 font-mono text-[13px]"
                  >
                    <div>
                      <div className="font-semibold text-ink">
                        {it.name}
                      </div>
                      <div className="text-[12px] text-ink-2">
                        {it.quantity} ×{" "}
                        {formatCurrency(Number(it.price), store?.currency)}
                      </div>
                    </div>
                    <span className="font-semibold text-ink">
                      {formatCurrency(
                        Number(it.price) * it.quantity,
                        store?.currency,
                      )}
                    </span>
                  </Surface>
                ))}
              </div>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-heading text-base font-bold text-ink">
              <span>Total</span>
              <span className="text-accent">
                {formatCurrency(Number(viewing.order.total), store?.currency)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
