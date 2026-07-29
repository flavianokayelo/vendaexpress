import { useEffect, useState } from "react";
import { Users, MessageCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatDate } from "../../lib/format";
import { PageHeader } from "./Shell";
import { EmptyState } from "../../components/ui/Feedback";
import type { Customer } from "../../lib/types";

// Normaliza o telefone para o formato internacional que o WhatsApp espera (sem +, sem espaços).
// Números angolanos costumam vir com 9 dígitos (ex: 955578767); se não tiverem o
// indicativo do país, assume-se Angola (244).
function whatsappLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const withCountryCode = digits.startsWith("244")
    ? digits
    : `244${digits.replace(/^0+/, "")}`;
  return `https://wa.me/${withCountryCode}`;
}

export function CustomersPage() {
  const { store } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.customers.list();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [store]);

  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${customers.length} clientes`} />
      {loading ? (
        <div className="text-slate-400">A carregar...</div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Sem clientes"
          description="Os clientes que fizerem pedidos aparecerão aqui."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {whatsappLink(c.phone) ? (
                      <a
                        href={whatsappLink(c.phone)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Conversar no WhatsApp"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
