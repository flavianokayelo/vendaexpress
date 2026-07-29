import { useEffect, useState } from "react";
import {
  Shield,
  Store,
  Users,
  CreditCard,
  BarChart3,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCurrency, formatDate } from "../lib/format";
import { Badge } from "../components/ui/Badge";
import { PageLoader, EmptyState } from "../components/ui/Feedback";
import type { Store as StoreType, Plan } from "../lib/types";

type AdminStore = StoreType & { owner_email: string; plan_name: string | null };

const STATUS_COLOR: Record<string, "green" | "amber" | "red"> = {
  active: "green",
  trial: "amber",
  suspended: "red",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  trial: "Trial",
  suspended: "Suspensa",
};

export function AdminPage({ navigate }: { navigate: (to: string) => void }) {
  const { user, loading } = useAuth();
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState({
    stores: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "stores" | "plans">("overview");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [storesData, plansData, statsData] = await Promise.all([
          api.admin.listStores(),
          api.plans.list(),
          api.admin.getStats(),
        ]);
        setStores(storesData);
        setPlans(plansData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <PageLoader />;

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 text-white">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-bold">Admin Venda Express</div>
              <div className="text-xs text-slate-400">Painel da plataforma</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              { id: "overview", label: "Resumo", icon: BarChart3 },
              { id: "stores", label: "Lojas", icon: Store },
              { id: "plans", label: "Planos", icon: CreditCard },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-gradient-to-r from-blue-700 to-blue-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <PageLoader />
        ) : tab === "overview" ? (
          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Lojas",
                  value: stats.stores,
                  icon: <Store size={18} />,
                },
                {
                  label: "Produtos",
                  value: stats.products,
                  icon: <Users size={18} />,
                },
                {
                  label: "Pedidos",
                  value: stats.orders,
                  icon: <CreditCard size={18} />,
                },
                {
                  label: "Receita plataforma",
                  value: formatCurrency(stats.revenue),
                  icon: <BarChart3 size={18} />,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      {s.label}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      {s.icon}
                    </div>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-900">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Lojas recentes
              </h2>
              {stores.length === 0 ? (
                <EmptyState
                  icon={<Store size={28} />}
                  title="Sem lojas"
                  description="Ainda não há lojas criadas na plataforma."
                />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Loja</th>
                        <th className="px-4 py-3 font-medium">Dono</th>
                        <th className="px-4 py-3 font-medium">Subdomínio</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Criada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stores.slice(0, 5).map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {s.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {s.owner_email}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">
                            {s.slug}.vendaexpress.ao
                          </td>
                          <td className="px-4 py-3">
                            <Badge color={STATUS_COLOR[s.status]}>
                              {STATUS_LABEL[s.status]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDate(s.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : tab === "stores" ? (
          <div>
            {stores.length === 0 ? (
              <EmptyState
                icon={<Store size={28} />}
                title="Sem lojas"
                description="Ainda não há lojas criadas na plataforma."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Loja</th>
                      <th className="px-4 py-3 font-medium">Dono</th>
                      <th className="px-4 py-3 font-medium">Subdomínio</th>
                      <th className="px-4 py-3 font-medium">Plano</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">Criada</th>
                      <th className="px-4 py-3 font-medium">Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {s.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {s.owner_email}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          {s.slug}.vendaexpress.ao
                        </td>
                        <td className="px-4 py-3">
                          <Badge color="blue">{s.plan_name ?? "—"}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={STATUS_COLOR[s.status]}>
                            {STATUS_LABEL[s.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(s.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/s/${s.slug}`)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <div className="mt-2 text-2xl font-bold text-blue-800">
                  {formatCurrency(p.price)}
                  <span className="text-sm font-normal text-slate-500">
                    /mês
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {p.product_limit
                    ? `Até ${p.product_limit} produtos`
                    : "Produtos ilimitados"}
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-slate-700">
                      • {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
