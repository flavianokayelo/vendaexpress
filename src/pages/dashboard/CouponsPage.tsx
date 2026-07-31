import { useEffect, useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
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
  const [isPublic, setIsPublic] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!store) return;
    try {
      const data = await api.coupons.list();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [store]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api.coupons.create({
        code: code.toUpperCase().trim(),
        discount_percent: Number(percent) || 0,
        is_public: isPublic,
      });
      setModalOpen(false);
      setCode("");
      setPercent("");
      setIsPublic(false);
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao criar cupão");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Coupon) => {
    await api.coupons.update(c.id, { active: !c.active });
    load();
  };

  const togglePublic = async (c: Coupon) => {
    await api.coupons.update(c.id, { is_public: !c.is_public });
    load();
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Eliminar cupom "${c.code}"?`)) return;
    await api.coupons.remove(c.id);
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
                  {c.is_public && <Badge color="amber">Público</Badge>}
                </div>
                <div className="mt-1 font-mono text-[12px] text-ink-2">
                  {c.discount_percent}% de desconto
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => togglePublic(c)}
                  title={c.is_public ? "Deixar de mostrar na loja" : "Mostrar publicamente na loja"}
                  className="px-2.5 py-1.5 font-mono text-[11px] font-semibold text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  style={{ borderRadius: '2px' }}
                >
                  {c.is_public ? "Ocultar" : "Publicar"}
                </button>
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
          {saveError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{saveError}</div>
          )}
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
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Mostrar publicamente na loja (faixa de cupões)
          </label>
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
