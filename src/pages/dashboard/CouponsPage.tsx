import { useEffect, useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Input, Field } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/Feedback";
import type { Coupon } from "../../lib/types";

export function CouponsPage() {
  const { store } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!store) return;
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    await supabase.from("coupons").insert({
      store_id: store.id,
      code: code.toUpperCase().trim(),
      discount_percent: Number(percent) || 0,
    });
    setSaving(false);
    setModalOpen(false);
    setCode("");
    setPercent("");
    load();
  };

  const toggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    load();
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Eliminar cupom "${c.code}"?`)) return;
    await supabase.from("coupons").delete().eq("id", c.id);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Cupons"
        subtitle="Cria cupões de desconto para os teus clientes"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Novo cupom
          </Button>
        }
      />
      {loading ? (
        <div className="text-slate-400">A carregar...</div>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={<Ticket size={28} />}
          title="Sem cupons"
          description="Cria cupões de desconto para promover vendas."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Novo cupom
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border border-border bg-paper p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ borderRadius: '2px' }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[15px] tracking-[-.01em] text-ink">
                    {c.code}
                  </span>
                  <Badge color={c.active ? "green" : "ink"}>
                    {c.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="mt-1 font-mono text-[12px] text-ink-2">
                  {c.discount_percent}% de desconto
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggle(c)}
                  className="px-2.5 py-1.5 font-mono text-[11px] font-semibold text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  style={{ borderRadius: '2px' }}
                >
                  {c.active ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => remove(c)}
                  className="p-2 text-ink-2 transition-colors hover:text-danger hover:bg-danger/5"
                  style={{ borderRadius: '2px' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo cupom"
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Código do cupom">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="PROMO10"
            />
          </Field>
          <Field label="Percentagem de desconto (%)">
            <Input
              type="number"
              min="1"
              max="100"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              required
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
