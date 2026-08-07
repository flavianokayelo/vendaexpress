import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { toast as toastPreset } from "../../lib/animations";
import { Surface } from "./Surface";

type ToastKind = "success" | "error" | "info";
type ToastAction = { label: string; onClick: () => void };
type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
  duration: number;
  action?: ToastAction;
};

const MAX_VISIBLE = 3;

type ToastApi = {
  success: (message: string, duration?: number, action?: ToastAction) => void;
  error: (message: string, duration?: number, action?: ToastAction) => void;
  info: (message: string, duration?: number, action?: ToastAction) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

function iconFor(kind: ToastKind, className: string) {
  switch (kind) {
    case "success":
      return <CheckCircle2 className={className} />;
    case "error":
      return <AlertTriangle className={className} />;
    default:
      return <Info className={className} />;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback(
    (
      kind: ToastKind,
      message: string,
      duration = 4000,
      action?: ToastAction,
    ) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, kind, message, duration, action }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api: ToastApi = {
    success: (m, d, a) => push("success", m, d, a),
    error: (m, d, a) => push("error", m, d, a),
    info: (m, d, a) => push("info", m, d, a),
  };

  const visible = toasts.slice(0, MAX_VISIBLE);
  const queued = toasts.length - visible.length;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence initial={false}>
          {visible.map((t) => (
            <motion.div
              key={t.id}
              variants={toastPreset}
              initial="initial"
              animate="animate"
              exit="exit"
              className="pointer-events-auto"
            >
              <div className="flex items-start gap-3 rounded-[2px] border border-border bg-paper px-4 py-3 shadow-floating">
                <span
                  className={`mt-0.5 ${
                    t.kind === "success"
                      ? "text-success"
                      : t.kind === "error"
                        ? "text-danger"
                        : "text-info"
                  }`}
                >
                  {iconFor(t.kind, "h-5 w-5")}
                </span>
                <div className="flex-1 font-mono text-[13px] font-medium text-ink">
                  {t.message}
                </div>
                {t.action && (
                  <button
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                    className="shrink-0 border border-ink bg-ink px-2.5 py-1 font-mono text-[11px] font-bold text-paper transition-opacity hover:opacity-90"
                    style={{ borderRadius: "2px" }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-ink-2 transition-colors hover:text-ink"
                  aria-label="Fechar"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {queued > 0 && (
          <Surface className="pointer-events-auto px-4 py-2 text-center font-mono text-[11px] text-ink-2">
            +{queued} na fila
          </Surface>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}