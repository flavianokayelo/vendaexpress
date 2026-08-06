import { useEffect, useState } from 'react';
import { Store, ArrowLeft, Check, AlertCircle, Lock, Clock } from 'lucide-react';
import { Input, Field } from '../components/ui/Field';
import { EmisPaymentModal } from '../components/EmisPaymentModal';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { slugify } from '../lib/format';
import type { Plan } from '../lib/types';

type StartedPayment = {
  reference: string;
  frame_url: string | null;
  amount: number;
  plan_name: string;
  mocked: boolean;
};

type TrialInfo = {
  eligible: boolean;
  failed_attempts: number;
  needed: number;
  trial_days: number;
};

export function SignupPage({ navigate, planId }: { navigate: (to: string) => void; planId?: string }) {
  const { user, adoptSession } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState<StartedPayment | null>(null);
  const [trial, setTrial] = useState<TrialInfo | null>(null);
  const [trialBusy, setTrialBusy] = useState(false);

  useEffect(() => {
    api.plans
      .list()
      .then((p) => {
        setPlans(p);
        if (planId && p.some((x: Plan) => x.id === planId)) setSelectedPlan(planId);
      })
      .catch(() => setPlans([]));
  }, [planId]);

  useEffect(() => {
    setSlug(slugify(storeName));
  }, [storeName]);

  useEffect(() => {
    if (user) navigate('/app');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPlan) return setError('Escolhe um plano para continuar.');
    if (!storeName.trim() || !slug.trim()) return setError('Indica o nome da tua loja.');
    if (password.length < 6) return setError('A palavra-passe deve ter pelo menos 6 caracteres.');

    setBusy(true);
    try {
      const started = await api.signup.start({
        email: email.trim().toLowerCase(),
        password,
        store_name: storeName.trim(),
        slug,
        plan_id: selectedPlan,
      });

      setPayment({
        reference: started.reference,
        frame_url: started.frame_url,
        amount: started.amount,
        plan_name: started.plan_name,
        mocked: started.mocked,
      });
    } catch (err: any) {
      setError(err.message || 'Não foi possível iniciar o pagamento.');
      // Falhar a emitir o token também conta como tentativa
      await refreshTrial();
    } finally {
      setBusy(false);
    }
  };

  /** Vai perguntar ao backend se esta pessoa já pode entrar em modo de teste. */
  const refreshTrial = async () => {
    const e = email.trim().toLowerCase();
    if (!e.includes('@')) return;
    try {
      const info = await api.signup.trialEligibility(e);
      setTrial(info);
    } catch {
      /* silencioso — é só um extra */
    }
  };

  /** Fecha a tentativa no backend para contar já, e reavalia a elegibilidade. */
  const closeAttempt = async (motivo: string) => {
    const ref = payment?.reference;
    setPayment(null);
    if (!ref) return;
    try {
      const res = await api.signup.abandon(ref, motivo);
      setTrial({
        eligible: res.eligible,
        failed_attempts: res.failed_attempts,
        needed: res.needed,
        trial_days: res.trial_days,
      });
    } catch {
      await refreshTrial();
    }
  };

  const handleConfirmed = async () => {
    if (!payment) return;
    try {
      const { user: newUser, token } = await api.signup.complete(payment.reference);
      await adoptSession(newUser, token);
      setPayment(null);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Pagamento confirmado, mas houve um erro a entrar. Tenta iniciar sessão.');
      setPayment(null);
    }
  };

  const handleTrial = async () => {
    setError(null);
    setTrialBusy(true);
    try {
      const { user: newUser, token } = await api.signup.startTrial({
        email: email.trim().toLowerCase(),
        password,
        store_name: storeName.trim(),
        slug,
        plan_id: selectedPlan,
      });
      await adoptSession(newUser, token);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Não foi possível abrir o período de teste.');
    } finally {
      setTrialBusy(false);
    }
  };

  const chosen = plans.find((p) => p.id === selectedPlan) || null;
  const tentativasEmFalta = trial ? Math.max(0, trial.needed - trial.failed_attempts) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      {/* Decorative paper + colour palette — same mood as the landing */}
      <div className="pointer-events-none absolute -top-44 -left-32 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-52 -right-28 h-[560px] w-[560px] rounded-full bg-violet-500/25 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/4 right-1/3 h-[380px] w-[380px] rounded-full bg-amber-400/15 blur-[110px]" />
      <div className="pointer-events-none absolute top-2/3 left-1/4 h-[300px] w-[300px] rounded-full bg-rose-400/10 blur-[100px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1a1a14 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 py-8">
        <button onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/25 ring-4 ring-primary/10">
            <Store size={24} />
          </div>
          <div>
            <span className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-ink-2">
              começar · nova loja
            </span>
            <h1 className="font-heading text-[26px] font-bold leading-none tracking-[-.03em] text-ink">
              Criar a minha loja
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft-lg sm:p-7">
          <p className="text-sm text-ink-2">
            Escolhe o plano, paga por Multicaixa Express e a loja fica activa em minutos.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Caminho alternativo, depois de tentativas de pagamento falhadas */}
          {trial?.eligible && (
            <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-warning" />
                <div className="flex-1">
                  <p className="font-heading text-sm font-semibold text-ink">
                    O pagamento não passou {trial.failed_attempts} vezes
                  </p>
                  <p className="mt-1 text-xs text-ink-2">
                    Para não ficares à porta, podes começar já com {trial.trial_days} dias de teste
                    e regularizar o pagamento antes de terminarem.
                  </p>
                  <button
                    type="button"
                    onClick={handleTrial}
                    disabled={trialBusy || !selectedPlan || !storeName.trim() || password.length < 6}
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-violet-600 px-5 py-2.5 font-heading text-[14px] font-semibold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {trialBusy ? 'A abrir a loja...' : `Começar com ${trial.trial_days} dias de teste`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {trial && !trial.eligible && trial.failed_attempts > 0 && tentativasEmFalta! > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-paper p-3 font-mono text-xs text-ink-2">
              Tentativa de pagamento registada ({trial.failed_attempts} de {trial.needed}). Podes tentar de novo.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <span className="mb-2 block font-mono text-[12px] font-semibold text-ink">
                Escolhe o teu plano <span className="text-danger">*</span>
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`relative rounded-xl border p-3 text-left transition-all active:scale-[.98] ${
                      selectedPlan === p.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-soft'
                        : 'border-border bg-surface hover:border-ink/40 hover:shadow-soft'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-[13px] font-semibold text-ink">{p.name}</span>
                      {selectedPlan === p.id && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-2">
                      {p.price.toLocaleString('pt-AO')} Kz/mês
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome da loja">
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: João Shop" />
              </Field>
              <Field label="Endereço da loja" hint={`${slug || 'o-teu-slug'}.vendaexpress.ao`}>
                <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="joaoshop" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={refreshTrial}
                  required
                  placeholder="o@email.ao"
                />
              </Field>
              <Field label="Palavra-passe">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mín. 6 caracteres" />
              </Field>
            </div>

            <button
              type="submit"
              disabled={busy || !selectedPlan}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-violet-600 px-6 py-3 font-heading text-[15px] font-semibold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? 'A abrir o pagamento...'
                : chosen
                ? `Pagar ${chosen.price.toLocaleString('pt-AO')} Kz e criar loja`
                : 'Escolhe um plano acima'}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-center font-mono text-xs text-ink-2">
              <Lock size={13} /> A conta só é criada depois do pagamento ser confirmado pela EMIS.
            </p>
          </form>

          <p className="mt-5 text-center text-sm text-ink-2">
            Já tens conta?{' '}
            <button onClick={() => navigate('/login')} className="font-heading font-semibold text-primary underline-offset-4 hover:underline">
              Entrar
            </button>
          </p>
        </div>
      </div>

      <EmisPaymentModal
        open={Boolean(payment)}
        reference={payment?.reference ?? null}
        frameUrl={payment?.frame_url ?? null}
        amount={payment?.amount ?? 0}
        planName={payment?.plan_name}
        mocked={payment?.mocked}
        onClose={() => closeAttempt('fechado pelo utilizador')}
        onConfirmed={handleConfirmed}
        onFailed={(motivo) => closeAttempt(motivo)}
      />
    </div>
  );
}