import { Check, Sparkles, ArrowRight } from "lucide-react";
import type { DashPage } from "./Shell";

type Step = {
  key: string;
  label: string;
  hint: string;
  done: boolean;
  tab: DashPage;
  share?: boolean;
};

export function OnboardingCard({
  stats,
  hasLogo,
  hasBanner,
  onGoToTab,
  onShare,
}: {
  stats: { products: number; orders: number };
  hasLogo: boolean;
  hasBanner: boolean;
  onGoToTab: (page: DashPage) => void;
  onShare: () => void;
}) {
  const steps: Step[] = [
    {
      key: "product",
      label: "Adicionar o primeiro produto",
      hint: "Constrói o teu catálogo",
      done: stats.products > 0,
      tab: "products",
    },
    {
      key: "brand",
      label: "Personalizar logo e capa",
      hint: "Dá face à tua loja",
      done: hasLogo && hasBanner,
      tab: "appearance",
    },
    {
      key: "share",
      label: "Partilhar o link da loja",
      hint: "Recebe o primeiro pedido",
      done: stats.orders > 0,
      tab: "orders",
      share: true,
    },
  ];

  const total = steps.length;
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / total) * 100);
  const next = steps.find((s) => !s.done);

  // Tudo concluído — esconde o cartão para deixar espaço ao conteúdo.
  if (!next) return null;

  const activate = (s: Step) => {
    if (s.done) return;
    if (s.share) onShare();
    else onGoToTab(s.tab);
  };

  return (
    <div className="border border-accent/20 bg-paper p-5" style={{ borderRadius: "2px" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center bg-accent text-accent-foreground"
            style={{ borderRadius: "2px" }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-heading text-[15px] font-bold text-ink">
              {doneCount === 0 ? "Monta a tua loja" : "Continua a montar"}
            </div>
            <div className="font-mono text-[12px] text-ink-2">
              {doneCount}/{total} passos concluídos
            </div>
          </div>
        </div>
        <span className="font-mono text-[12px] font-bold text-accent">{pct}%</span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.07]">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((s) => {
          const isNext = !s.done && next?.key === s.key;
          return (
            <button
              key={s.key}
              onClick={() => activate(s)}
              disabled={s.done}
              aria-current={isNext ? "step" : undefined}
              className={`flex w-full items-center gap-3 border p-3 text-left transition-all ${
                isNext
                  ? "border-accent bg-accent-soft/40 hover:shadow-sm"
                  : s.done
                    ? "border-border bg-paper opacity-70"
                    : "border-border bg-paper hover:border-ink"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center ${
                  s.done
                    ? "bg-success text-white"
                    : "bg-ink/[0.04] text-ink-2"
                }`}
                style={{ borderRadius: "2px" }}
              >
                {s.done ? <Check size={15} /> : <span className="font-mono text-[11px] font-bold">{steps.indexOf(s) + 1}</span>}
              </span>
              <span className="min-w-0">
                <span className={`block truncate font-mono text-[13px] font-semibold ${s.done ? "text-ink-2 line-through" : "text-ink"}`}>
                  {s.label}
                </span>
                <span className="block font-mono text-[11px] text-ink-2">{s.hint}</span>
              </span>
              {isNext && (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold text-accent">
                  Continuar <ArrowRight size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}