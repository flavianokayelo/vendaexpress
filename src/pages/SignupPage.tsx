import { useEffect, useState } from 'react';
import { Store, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Field } from '../components/ui/Field';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { slugify } from '../lib/format';
import type { Plan } from '../lib/types';

export function SignupPage({ navigate, planId }: { navigate: (to: string) => void; planId?: string }) {
  const { signUp, user, refreshStore } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.plans
      .list()
      .then((p) => {
        setPlans(p);
        const initial = planId && p.some((x) => x.id === planId) ? planId : p[0]?.id ?? '';
        setSelectedPlan(initial);
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
    if (!storeName.trim() || !slug.trim()) {
      setError('Indica o nome da tua loja.');
      return;
    }
    setBusy(true);

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError);
      setBusy(false);
      return;
    }

    try {
      await api.stores.create({
        name: storeName.trim(),
        slug,
        plan_id: selectedPlan || null,
      });
      await refreshStore();
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar a loja');
    } finally {
      setBusy(false);
    }
  };

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
              <p className="text-sm text-slate-500">Regista-te e recebe a tua loja em segundos.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Escolhe o teu plano</span>
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
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="o@email.ao" />
              </Field>
              <Field label="Palavra-passe">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Mín. 6 caracteres" />
              </Field>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? 'A criar loja...' : 'Criar loja e começar a vender'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Já tens conta?{' '}
            <button onClick={() => navigate('/login')} className="font-medium text-blue-700 hover:underline">
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}