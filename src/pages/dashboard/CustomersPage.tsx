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
        <div className="overflow-hidden border border-border bg-paper" style={{ borderRadius: '2px' }}>
          <table className="w-full text-sm">
            <thead>
                  <tr className="border-b border-border bg-accent-soft/30">
                <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Nome</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Telefone</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Email</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Desde</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] text-ink-2">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-ink-2">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-2">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {whatsappLink(c.phone) ? (
                      <a
                        href={whatsappLink(c.phone)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Conversar no WhatsApp"
                        className="inline-flex items-center gap-1.5 border border-border-2 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink"
                        style={{ borderRadius: '2px' }}
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </a>
                    ) : (
                      <span className="font-mono text-[11px] text-ink-2/50">—</span>
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
