import { useEffect, useState } from "react";
import { Users, MessageCircle, Share2, Check } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatDate } from "../../lib/format";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Feedback";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Surface } from "../../components/ui/Surface";
import { useToast } from "../../components/ui/Toast";
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
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<"all" | "contactable">("all");

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
      const data = await api.customers.list();
      setCustomers(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [store]);

  const contactable = customers.filter((c) => whatsappLink(c.phone)).length; // guarda para o resumo
  const shown =
    filter === "all"
      ? customers
      : customers.filter((c) => whatsappLink(c.phone));

  return (
    <div>
      <PageHeader title="Clientes" subtitle={`${customers.length} clientes`} />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Ainda não tens clientes"
          description="Os clientes que fizerem pedidos aparecerão aqui. Partilha o link da tua loja para os atrair."
          action={
            <Button onClick={shareLink}>
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? "Link copiado!" : "Partilhar o link da loja"}
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {(
              [
                ["all", "Todos", customers.length],
                ["contactable", "Com WhatsApp", contactable],
              ] as const
            ).map(([v, label, count]) => {
              const active = filter === v;
              return (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[12px] font-semibold transition-colors ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-border-2 bg-paper text-ink-2 hover:border-ink hover:text-ink"
                  }`}
                  style={{ borderRadius: "2px" }}
                >
                  {label}
                  <span className={active ? "opacity-70" : "text-ink-2/60"}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
              <Surface
                key={c.id}
                className="flex flex-col p-4 hover:-translate-y-0.5 hover:shadow-floating"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-heading text-[15px] font-bold text-ink">
                      {c.name}
                    </div>
                    <div className="truncate font-mono text-[12px] text-ink-2">
                      {c.phone ?? c.email ?? "Sem contacto"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                  <span className="font-mono text-[11px] text-ink-2">
                    Desde {formatDate(c.created_at)}
                  </span>
                  {whatsappLink(c.phone) ? (
                    <a
                      href={whatsappLink(c.phone)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Conversar com ${c.name} no WhatsApp`}
                      title="Conversar no WhatsApp"
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
                        filter === "all"
                          ? "border-ink bg-ink text-paper hover:opacity-90"
                          : "border-border-2 text-ink-2 hover:border-ink hover:text-ink"
                      }`}
                      style={{ borderRadius: "2px" }}
                    >
                      <MessageCircle size={13} />
                      WhatsApp
                    </a>
                  ) : (
                    <span className="font-mono text-[11px] text-ink-2/50">
                      Sem WhatsApp
                    </span>
                  )}
                </div>
              </Surface>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
