import { useEffect, useState } from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { PageHeader } from "./Shell";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/Feedback";
import type { Order, OrderItem, OrderStatus } from "../../lib/types";

const STATUS_COLOR: Record<
  string,
  "amber" | "green" | "blue" | "slate" | "red"
> = {
  pending: "amber",
  paid: "blue",
  shipped: "slate",
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

export function OrdersPage() {
  const { store } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{
    order: Order;
    items: OrderItem[];
  } | null>(null);

  const load = async () => {
    try {
      const data = await api.orders.list();
      setOrders(data);
    } catch (err) {
      console.error(err);
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
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const view = async (order: Order) => {
    try {
      const items = await api.orders.getItems(order.id);
      setViewing({ order, items: items ?? [] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <PageHeader title="Pedidos" subtitle={`${orders.length} pedidos`} />
      {loading ? (
        <div className="text-slate-400">A carregar...</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={28} />}
          title="Sem pedidos"
          description="Os pedidos dos teus clientes aparecerão aqui."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {o.customer_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.customer_phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatCurrency(Number(o.total), store?.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onChange={(e) =>
                        updateStatus(o, e.target.value as OrderStatus)
                      }
                      className="!py-1 !text-xs"
                    >
                      {Object.entries(STATUS_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(o.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => view(o)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Detalhes do pedido"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Estado</span>
                <Badge color={STATUS_COLOR[viewing.order.status]}>
                  {STATUS_LABEL[viewing.order.status]}
                </Badge>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div>
                  <span className="text-slate-500">Cliente:</span>{" "}
                  <span className="font-medium text-slate-900">
                    {viewing.order.customer_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Telefone:</span>{" "}
                  <span className="font-medium text-slate-900">
                    {viewing.order.customer_phone ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Endereço:</span>{" "}
                  <span className="font-medium text-slate-900">
                    {viewing.order.customer_address ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Data:</span>{" "}
                  <span className="font-medium text-slate-900">
                    {formatDateTime(viewing.order.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                Itens
              </h4>
              <div className="space-y-2">
                {viewing.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {it.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {it.quantity} ×{" "}
                        {formatCurrency(Number(it.price), store?.currency)}
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(
                        Number(it.price) * it.quantity,
                        store?.currency,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-blue-800">
                {formatCurrency(Number(viewing.order.total), store?.currency)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
