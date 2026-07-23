import { useEffect, useState } from 'react';
import { Store, ArrowLeft, Check, AlertCircle, Lock, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <button onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Criar a minha loja</h1>
              <p className="text-sm text-slate-500">Escolhe o plano, paga por Multicaixa Express e a loja fica activa.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Caminho alternativo, depois de tentativas de pagamento falhadas */}
          {trial?.eligible && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <Clock size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    O pagamento não passou {trial.failed_attempts} vezes
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    Para não ficares à porta, podes começar já com {trial.trial_days} dias de teste
                    e regularizar o pagamento antes de terminarem.
                  </p>
                  <Button
                    type="button"
                    onClick={handleTrial}
                    disabled={trialBusy || !selectedPlan || !storeName.trim() || password.length < 6}
                    className="mt-3 w-full sm:w-auto"
                  >
                    {trialBusy ? 'A abrir a loja...' : `Começar com ${trial.trial_days} dias de teste`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {trial && !trial.eligible && trial.failed_attempts > 0 && tentativasEmFalta! > 0 && (
            <div className="mb-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
              Tentativa de pagamento registada ({trial.failed_attempts} de {trial.needed}). Podes tentar de novo.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Escolhe o teu plano <span className="text-red-600">*</span>
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      selectedPlan === p.id ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                      {selectedPlan === p.id && <Check size={16} className="text-blue-700" />}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{p.price.toLocaleString('pt-AO')} Kz/mês</div>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Nome da loja">
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: João Shop" />
            </Field>

            <Field label="Endereço da loja" hint={`${slug || 'o-teu-slug'}.vendaexpress.ao`}>
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="joaoshop" />
            </Field>

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

            <Button type="submit" className="w-full" size="lg" disabled={busy || !selectedPlan}>
              {busy
                ? 'A abrir o pagamento...'
                : chosen
                ? `Pagar ${chosen.price.toLocaleString('pt-AO')} Kz e criar loja`
                : 'Escolhe um plano acima'}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
              <Lock size={12} /> A conta só é criada depois do pagamento ser confirmado pela EMIS.
            </p>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Já tens conta?{' '}
            <button onClick={() => navigate('/login')} className="font-medium text-blue-700 hover:underline">
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