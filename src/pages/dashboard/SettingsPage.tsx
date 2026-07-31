import { useState } from "react";
import { Check, Globe, MessageCircle, CreditCard } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Input, Field, Select } from "../../components/ui/Field";

export function SettingsPage() {
  const { store, refreshStore } = useAuth();
  const [name, setName] = useState(store?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp ?? "");
  const [currency, setCurrency] = useState(store?.currency ?? "AOA");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setError(null);
    try {
      await api.stores.update({
        name,
        whatsapp: whatsapp || null,
        currency,
      });
      await refreshStore();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar alterações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Dados gerais da tua loja" />
      <div className="max-w-2xl space-y-6">
        <form
          onSubmit={save}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <Field label="Nome da loja">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Moeda">
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="AOA">Kwanza (AOA)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="BRL">Real (BRL)</option>
              </Select>
            </Field>
            <Field label="WhatsApp" hint="Receber notificações de pedidos">
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+244 9XX XXX XXX"
              />
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "A guardar..." : "Guardar"}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-sm text-green-600">
                <Check size={16} /> Guardado
              </span>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900">Domínio</h3>
          <p className="mt-1 text-sm text-slate-500">
            O teu subdomínio atual. No plano Premium podes conectar um domínio
            próprio.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3">
            <Globe size={18} className="text-slate-400" />
            <span className="font-mono text-sm text-slate-700">
              {store?.slug}.vendaexpress.ao
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <CreditCard size={18} /> Pagamentos
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Métodos de pagamento disponíveis na tua loja.
          </p>
          <div className="mt-3 space-y-2">
            {[
              "Transferência bancária",
              "Multicaixa Express",
              "Dinheiro na entrega",
            ].map((m) => (
              <label
                key={m}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700"
              >
                <input type="checkbox" defaultChecked className="rounded" /> {m}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <MessageCircle size={18} /> WhatsApp
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Os pedidos serão notificados via WhatsApp.
          </p>
          <div className="mt-3 text-sm text-slate-600">
            Número configurado:{" "}
            <span className="font-medium">{whatsapp || "Não definido"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
