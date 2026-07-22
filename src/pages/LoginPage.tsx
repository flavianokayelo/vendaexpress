import { useEffect, useState } from 'react';
import { Store, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Field } from '../components/ui/Field';
import { useAuth } from '../lib/auth';

export function LoginPage({ navigate }: { navigate: (to: string) => void }) {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate('/app');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="mx-auto max-w-md px-6 py-10">
        <button onClick={() => navigate('/')} className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
              <Store size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Entrar na plataforma</h1>
              <p className="text-sm text-slate-500">Acede ao painel da tua loja.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="o@email.ao" />
            </Field>
            <Field label="Palavra-passe">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
            <strong>Conta demo:</strong> demo@vendaexpress.ao / demo123
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            Ainda não tens conta?{' '}
            <button onClick={() => navigate('/signup')} className="font-medium text-blue-700 hover:underline">
              Criar loja
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
