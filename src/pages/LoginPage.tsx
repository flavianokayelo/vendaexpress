import { useEffect, useState } from "react";
import { Store, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input, Field } from "../components/ui/Field";
import { useAuth } from "../lib/auth";

export function LoginPage({ navigate }: { navigate: (to: string) => void }) {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/app");
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
    <div className="relative min-h-screen overflow-hidden bg-paper">
      {/* Decorative paper + colour palette — same mood as the landing hero */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-24 h-[520px] w-[520px] rounded-full bg-violet-500/25 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-amber-400/15 blur-[110px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1a1a14 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <button
          onClick={() => navigate("/")}
          className="mb-9 inline-flex w-fit items-center gap-1.5 font-body text-sm font-medium text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/25 ring-4 ring-primary/10">
            <Store size={24} />
          </div>
          <div>
            <span className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-ink-2">
              acesso · loja
            </span>
            <h1 className="font-heading text-[26px] font-bold leading-none tracking-[-.03em] text-ink">
              Entrar na plataforma
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-7 shadow-soft-lg sm:p-9">
          <p className="text-sm text-ink-2">
            Acede ao painel da tua loja e continua a vender.
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/5 p-3.5 text-sm text-danger">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="o@email.ao"
                autoComplete="email"
              />
            </Field>
            <Field label="Palavra-passe">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-violet-600 px-6 py-4 font-heading text-[15px] font-semibold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-2">
              ou
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-4 text-center text-sm text-ink-2">
            Ainda não tens conta?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-heading font-semibold text-primary underline-offset-4 hover:underline"
            >
              Criar loja
            </button>
          </p>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center font-mono text-[11px] text-ink-2">
          <CheckCircle2 size={13} className="text-success" />
          Feito para lojas e todo tipo de negócio · Pagamentos via WhatsApp
        </p>
      </div>
    </div>
  );
}