import { useEffect, useMemo, useState } from 'react';
import {
  Clock, AlertTriangle, X, Loader2, CheckCircle2, ShieldCheck, ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Plan } from '../lib/types';

/**
 * Aviso permanente no painel. NÃO se fecha — só desaparece quando a
 * subscrição fica activa por pagamento confirmado.
 *
 * Estados:
 *   trial          -> âmbar, conta os dias que faltam
 *   trial_expired  -> vermelho, loja suspensa
 *   plan_expired   -> vermelho, subscrição terminada
 *   plan           -> só aparece nos últimos 5 dias, discreto
 */
export function TrialBanner() {
  const { store, refreshStore } = useAuth();
  const [open, setOpen] = useState(false);

  const sub = store?.subscription;
  const reason = sub?.reason;
  const dias = sub?.days_left ?? 0;

  const estado = useMemo(() => {
    if (!store || !sub) return null;
    if (reason === 'trial') return 'trial';
    if (reason === 'trial_expired') return 'trial_expired';
    if (reason === 'plan_expired') return 'plan_expired';
    if (reason === 'plan' && dias <= 5) return 'a_expirar';
    return null;
  }, [store, sub, reason, dias]);

  if (!estado) return null;

  const critico = estado === 'trial_expired' || estado === 'plan_expired';

  const textos: Record<string, { titulo: string; corpo: string }> = {
    trial: {
      titulo: dias === 1 ? 'Último dia de teste' : `Faltam ${dias} dias de teste`,
      corpo: 'Regulariza o pagamento antes do prazo terminar para a loja continuar online. Os teus produtos e definições ficam guardados.',
    },
    trial_expired: {
      titulo: 'O período de teste terminou',
      corpo: 'A tua loja está suspensa e não aparece aos clientes. Paga o plano para a reactivares — nada foi apagado.',
    },
    plan_expired: {
      titulo: 'A tua subscrição expirou',
      corpo: 'A loja está suspensa. Renova o plano para voltar a vender.',
    },
    a_expirar: {
      titulo: dias === 1 ? 'O teu plano expira amanhã' : `O teu plano expira em ${dias} dias`,
      corpo: 'Renova agora para não haver interrupção.',
    },
  };

  const t = textos[estado];

  return (
    <>
      <div
        className={`mb-6 rounded-2xl border p-5 ${
          critico ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                critico ? 'bg-red-600' : 'bg-amber-500'
              }`}
            >
              {critico ? <AlertTriangle size={20} /> : <Clock size={20} />}
            </div>
            <div>
              <div className={`text-sm font-semibold ${critico ? 'text-red-900' : 'text-amber-900'}`}>
                {t.titulo}
              </div>
              <p className={`mt-1 max-w-xl text-xs leading-relaxed ${critico ? 'text-red-800' : 'text-amber-800'}`}>
                {t.corpo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              critico ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            Pagar agora
          </button>
        </div>
      </div>

      <RenovacaoModal
        open={open}
        onClose={() => setOpen(false)}
        onPago={async () => {
          await refreshStore();
          setOpen(false);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Modal de renovação — pede um token novo à EMIS a cada abertura.      */
/* ------------------------------------------------------------------ */

const POLL_MS = 3000;

function RenovacaoModal({
  open,
  onClose,
  onPago,
}: {
  open: boolean;
  onClose: () => void;
  onPago: () => void;
}) {
  const { store } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planoId, setPlanoId] = useState<string>('');
  const [fase, setFase] = useState<'escolher' | 'a_abrir' | 'a_pagar' | 'pago' | 'falhou'>('escolher');
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [manualBusy, setManualBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFase('escolher');
    setFrameUrl(null);
    setPaymentId(null);
    setErro(null);
    api.plans
      .list()
      .then((p) => {
        setPlans(p);
        setPlanoId(store?.plan_id || p[0]?.id || '');
      })
      .catch(() => setPlans([]));
  }, [open, store?.plan_id]);

  // Sondagem do estado do pagamento
  useEffect(() => {
    if (!open || fase !== 'a_pagar' || !paymentId) return;

    let cancelado = false;
    const tick = async () => {
      try {
        const res = await api.payments.status(paymentId);
        if (cancelado) return;
        if (res.payment?.status === 'paid') {
          setFase('pago');
          setTimeout(onPago, 1200);
        } else if (['failed', 'cancelled', 'expired'].includes(res.payment?.status)) {
          setFase('falhou');
        }
      } catch {
        /* rede instável — a próxima ronda tenta */
      }
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [open, fase, paymentId, onPago]);

  if (!open) return null;

  const plano = plans.find((p) => p.id === planoId) || null;

  const abrirPagamento = async () => {
    if (!planoId) return;
    setErro(null);
    setFase('a_abrir');
    try {
      const res = await api.payments.start(planoId);
      setPaymentId(res.payment.id);
      setFrameUrl(res.emis.frame_url);
      setFase('a_pagar');
      if (!res.emis.frame_url) {
        setErro(res.emis.error || 'O portal de pagamentos não devolveu a janela.');
      }
    } catch (err: any) {
      setErro(err.message || 'Não foi possível iniciar o pagamento.');
      setFase('escolher');
    }
  };

  const confirmarManual = async () => {
    if (!paymentId) return;
    setManualBusy(true);
    try {
      await api.payments.confirmManual(paymentId);
      setFase('pago');
      setTimeout(onPago, 1000);
    } catch (err: any) {
      setErro(err.message || 'Não foi possível confirmar manualmente.');
    } finally {
      setManualBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Regularizar pagamento</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {plano
                ? `${plano.name} — ${Number(plano.price).toLocaleString('pt-AO')} Kz`
                : 'Escolhe o plano'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {erro && (
            <div className="m-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{erro}</div>
          )}

          {fase === 'escolher' && (
            <div className="space-y-3 p-5">
              <p className="text-sm text-slate-600">Confirma o plano e abre o Multicaixa Express.</p>
              <div className="space-y-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanoId(p.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      planoId === p.id
                        ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                    <span className="text-sm text-slate-600">
                      {Number(p.price).toLocaleString('pt-AO')} Kz/mês
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={abrirPagamento}
                disabled={!planoId}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                Abrir Multicaixa Express
              </button>
            </div>
          )}

          {fase === 'a_abrir' && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <Loader2 size={36} className="animate-spin text-blue-700" />
              <p className="text-sm text-slate-600">A preparar o pagamento...</p>
            </div>
          )}

          {fase === 'a_pagar' && (
            <>
              {frameUrl ? (
                <iframe src={frameUrl} title="Multicaixa Express" className="h-[440px] w-full border-0" allow="payment" />
              ) : (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Não foi possível abrir a janela de pagamento.
                </div>
              )}
              <div className="flex items-center justify-center gap-2 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                <Loader2 size={14} className="animate-spin" />
                <span>À espera da confirmação...</span>
              </div>
            </>
          )}

          {fase === 'pago' && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <CheckCircle2 size={44} className="text-green-600" />
              <p className="text-sm font-semibold text-slate-900">Pagamento confirmado</p>
              <p className="text-xs text-slate-500">A tua loja está activa.</p>
            </div>
          )}

          {fase === 'falhou' && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <AlertTriangle size={44} className="text-red-500" />
              <p className="text-sm font-semibold text-slate-900">O pagamento não foi confirmado</p>
              <p className="text-xs text-slate-500">Se o valor foi debitado, contacta o suporte.</p>
              <button
                onClick={() => setFase('escolher')}
                className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Tentar de novo
              </button>
            </div>
          )}
        </div>

        {fase === 'a_pagar' && (
          <div className="space-y-2 border-t border-slate-200 px-5 py-3">
            <p className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-500">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-green-600" />
              Introduz o número da tua conta Multicaixa Express e confirma no telemóvel.
            </p>
            {frameUrl && (
              <a
                href={frameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:underline"
              >
                <ExternalLink size={12} /> A janela não carregou? Abrir num separador novo
              </a>
            )}
            {import.meta.env.DEV && (
              <div className="border-t border-dashed border-slate-200 pt-2">
                <button
                  onClick={confirmarManual}
                  disabled={manualBusy}
                  className="text-[11px] font-medium text-amber-700 hover:underline disabled:opacity-50"
                >
                  {manualBusy ? 'A confirmar...' : '[DEV] Simular pagamento confirmado'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}