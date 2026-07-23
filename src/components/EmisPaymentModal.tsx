import { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

type Props = {
  open: boolean;
  /** Referência devolvida por /signup/start — é por ela que sondamos o estado */
  reference: string | null;
  /** URL completo do iframe da EMIS (já traz ?token=...) */
  frameUrl: string | null;
  amount: number;
  planName?: string;
  /** true quando o backend não tem EMIS_MERCHANT_TOKEN configurado */
  mocked?: boolean;
  onClose: () => void;
  /** Chamado uma única vez, quando o pagamento é confirmado */
  onConfirmed: () => void;
  /** Chamado uma única vez quando a tentativa morre (recusada ou tempo esgotado) */
  onFailed?: (motivo: 'recusado' | 'expirado') => void;
};

const POLL_MS = 3000;
const TIMEOUT_MINUTES = 30;

export function EmisPaymentModal({
  open,
  reference,
  frameUrl,
  amount,
  planName,
  mocked = false,
  onClose,
  onConfirmed,
  onFailed,
}: Props) {
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'failed' | 'expired'>('waiting');
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_MINUTES * 60);
  const [manualBusy, setManualBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const firedRef = useRef(false);
  const failedRef = useRef(false);

  // Reset sempre que o modal reabre
  useEffect(() => {
    if (open) {
      setStatus('waiting');
      setSecondsLeft(TIMEOUT_MINUTES * 60);
      setNotice(null);
      firedRef.current = false;
      failedRef.current = false;
    }
  }, [open, reference]);

  // Sondagem do estado
  useEffect(() => {
    if (!open || !reference || status !== 'waiting') return;

    let cancelled = false;
    const tick = async () => {
      try {
        const res = await api.signup.status(reference);
        if (cancelled) return;

        if (res.ready) {
          setStatus('confirmed');
          if (!firedRef.current) {
            firedRef.current = true;
            onConfirmed();
          }
        } else if (res.status === 'failed' || res.status === 'cancelled') {
          setStatus('failed');
          if (!failedRef.current) { failedRef.current = true; onFailed?.('recusado'); }
        } else if (res.status === 'expired') {
          setStatus('expired');
          if (!failedRef.current) { failedRef.current = true; onFailed?.('expirado'); }
        }
      } catch {
        // rede instável — a próxima ronda tenta de novo
      }
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open, reference, status, onConfirmed, onFailed]);

  // Contagem decrescente
  useEffect(() => {
    if (!open || status !== 'waiting') return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setStatus('expired');
          if (!failedRef.current) { failedRef.current = true; onFailed?.('expirado'); }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, status, onFailed]);

  if (!open) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const confirmManually = async () => {
    if (!reference) return;
    setManualBusy(true);
    setNotice(null);
    try {
      await api.signup.confirmManual(reference);
      setStatus('confirmed');
      if (!firedRef.current) {
        firedRef.current = true;
        onConfirmed();
      }
    } catch (err: any) {
      setNotice(err.message || 'Não foi possível confirmar manualmente.');
    } finally {
      setManualBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pagamento Multicaixa Express</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {planName ? `Plano ${planName} — ` : ''}
              <strong className="text-slate-700">{amount.toLocaleString('pt-AO')} Kz</strong>
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

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto">
          {status === 'confirmed' && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <CheckCircle2 size={44} className="text-green-600" />
              <p className="text-sm font-semibold text-slate-900">Pagamento confirmado</p>
              <p className="text-xs text-slate-500">A preparar a tua loja...</p>
            </div>
          )}

          {(status === 'failed' || status === 'expired') && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <AlertCircle size={44} className="text-red-500" />
              <p className="text-sm font-semibold text-slate-900">
                {status === 'expired' ? 'O tempo esgotou' : 'O pagamento não foi confirmado'}
              </p>
              <p className="text-xs text-slate-500">
                Se o valor foi debitado, contacta o suporte. Caso contrário, podes tentar de novo.
              </p>
              <button
                onClick={onClose}
                className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Fechar e tentar de novo
              </button>
            </div>
          )}

          {status === 'waiting' && (
            <>
              {frameUrl ? (
                <iframe
                  src={frameUrl}
                  title="Multicaixa Express"
                  className="h-[440px] w-full border-0"
                  allow="payment"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <AlertCircle size={40} className="text-amber-500" />
                  <p className="text-sm font-semibold text-slate-900">
                    O portal de pagamentos não está configurado
                  </p>
                  <p className="text-xs text-slate-500">
                    Falta o <code className="rounded bg-slate-100 px-1">EMIS_MERCHANT_TOKEN</code> no{' '}
                    <code className="rounded bg-slate-100 px-1">.env</code> do backend.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                <Loader2 size={14} className="animate-spin" />
                <span>À espera da confirmação... {mm}:{ss}</span>
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        {status === 'waiting' && (
          <div className="space-y-2 border-t border-slate-200 px-5 py-3">
            <p className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-500">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-green-600" />
              Introduz o número da tua conta Multicaixa Express na janela acima e confirma no telemóvel.
              Nunca guardamos os teus dados bancários.
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

            {/* Atalho de desenvolvimento — a EMIS não consegue chamar localhost */}
            {import.meta.env.DEV && (
              <div className="border-t border-dashed border-slate-200 pt-2">
                <button
                  onClick={confirmManually}
                  disabled={manualBusy}
                  className="text-[11px] font-medium text-amber-700 hover:underline disabled:opacity-50"
                >
                  {manualBusy ? 'A confirmar...' : '[DEV] Simular pagamento confirmado'}
                </button>
                {mocked && (
                  <p className="mt-1 text-[11px] text-amber-600">
                    EMIS em modo simulado — sem token de comerciante configurado.
                  </p>
                )}
              </div>
            )}

            {notice && <p className="text-[11px] text-red-600">{notice}</p>}
          </div>
        )}
      </div>
    </div>
  );
}