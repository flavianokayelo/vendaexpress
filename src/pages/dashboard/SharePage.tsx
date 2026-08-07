import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Link2,
  Copy,
  ExternalLink,
  MessageCircle,
  Download,
  Printer,
  Check,
  QrCode,
  Instagram,
  Facebook,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Surface } from "../../components/ui/Surface";
import { useToast } from "../../components/ui/Toast";

const PRINT_SIZES = [
  { id: "a5", label: "A5", desc: "117 × 210 mm", px: 640 },
  { id: "a4", label: "A4", desc: "210 × 297 mm", px: 1024 },
  { id: "a3", label: "A3", desc: "297 × 420 mm", px: 1536 },
] as const;

type PrintSize = (typeof PRINT_SIZES)[number];

function storeUrl(slug: string): string {
  return `${window.location.origin}${window.location.pathname}#/s/${slug}`;
}

// Normaliza o telefone para o formato internacional que o WhatsApp espera (sem +, sem espaços).
// Números angolanos costumam vir com 9 dígitos (ex: 955578767); se não tiverem o
// indicativo do país, assume-se Angola (244).
function whatsappLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const withCountryCode = digits.startsWith("244")
    ? digits
    : `244${digits.replace(/^0+/, "")}`;
  return `https://wa.me/${withCountryCode}`;
}

function QRCard({
  title,
  subtitle,
  data,
  accent,
  defaultSize,
  onSizeChange,
}: {
  title: string;
  subtitle: string;
  data: string;
  accent: string;
  defaultSize: PrintSize;
  onSizeChange: (size: PrintSize) => void;
}) {
  const toast = useToast();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<PrintSize>(defaultSize);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(data, { width: size.px, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [data, size.px]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const selectSize = (s: PrintSize) => {
    setSize(s);
    onSizeChange(s);
  };

  return (
    <Surface className="flex flex-col p-6">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center text-paper"
          style={{ background: accent, borderRadius: "2px" }}
        >
          <QrCode size={17} className="text-paper" />
        </span>
        <div>
          <h3 className="font-heading text-[16px] font-bold tracking-[-.01em] text-ink">
            {title}
          </h3>
          <p className="mt-0.5 font-mono text-[12px] text-ink-2">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-1 items-center justify-center rounded-[2px] border border-border bg-white p-6">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR code da ${title}`}
            className="h-auto max-w-[220px] mix-blend-multiply"
          />
        ) : (
          <div className="h-48 w-48 animate-pulse bg-ink/[0.05]" />
        )}
      </div>

      <div className="mt-5">
        <span className="mb-1.5 block font-mono text-[12px] font-semibold uppercase tracking-[0.05em] text-ink-2">
          Tamanho de impressão
        </span>
        <div className="grid grid-cols-3 gap-2">
          {PRINT_SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSize(s)}
              className={`border px-2 py-2 text-left font-mono transition-all ${
                size.id === s.id
                  ? "border-ink bg-ink text-paper"
                  : "border-border-2 bg-white text-ink hover:border-ink"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <div className="text-[13px] font-bold">{s.label}</div>
              <div className={`text-[10px] ${size.id === s.id ? "text-paper/60" : "text-ink-2"}`}>
                {s.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={copy} className="flex-1">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <Button variant="outline" size="sm" onClick={download} className="flex-1">
          <Download size={14} />
          Descarregar
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()} title="Imprimir">
          <Printer size={14} />
        </Button>
      </div>
    </Surface>
  );
}

export function SharePage() {
  const { store } = useAuth();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [printSize, setPrintSize] = useState<PrintSize>(PRINT_SIZES[1]);
  const printRef = useRef<HTMLDivElement>(null);

  const url = store ? storeUrl(store.slug) : "";
  const linkLabel = useMemo(() => {
    if (!store) return "";
    return url.replace(/^https?:\/\//, "");
  }, [store, url]);

  const wa = useMemo(() => whatsappLink(store?.whatsapp), [store]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const shareNative = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: store?.name ?? "A minha loja",
          text: `Visita a minha loja: ${store?.name ?? ""}`,
          url,
        });
        return;
      } catch {
        /* cancelado ou não suportado — cai no clipboard */
      }
    }
    await copyUrl();
  };

  const openStore = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!store) {
    toast.info("Loja não encontrada");
    return null;
  }

  return (
    <div>
      <div className="-mt-1 mb-7">
        <PageHeader
          title="Partilhar loja"
          subtitle="Copia o link, usa os códigos QR e divulga a tua loja onde quiseres"
        />
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Link da loja */}
        <Surface className="p-6">
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-border-2 bg-accent-soft/40 text-ink"
              style={{ borderRadius: "2px" }}
            >
              <Link2 size={16} />
            </span>
            <div>
              <h2 className="font-heading text-[16px] font-bold tracking-[-.01em] text-ink">
                O link da tua loja
              </h2>
              <p className="mt-0.5 font-mono text-[12px] text-ink-2">
                Partilha por mensagem, redes sociais ou e-mail.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[2px] border border-border-2 bg-muted/30 px-3">
              <Link2 size={15} className="shrink-0 text-ink-2" />
              <span className="truncate font-mono text-[13px] text-ink">{linkLabel}</span>
            </div>
            <div className="flex items-stretch gap-2">
              <Button variant="outline" onClick={copyUrl} title="Copiar link">
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button variant="primary" onClick={shareNative} className="flex-1 sm:flex-none">
                Partilhar
              </Button>
              <Button variant="outline" onClick={openStore} title="Abrir loja">
                <ExternalLink size={15} />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={wa ? `${wa}?text=${encodeURIComponent(`Olá! Visita a minha loja ${store.name}: ${url}`)}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={wa ? undefined : (e) => e.preventDefault()}
              className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[12px] font-semibold transition-colors ${
                wa
                  ? "border-success/30 bg-success/10 text-[#128C7E] hover:border-[#128C7E]"
                  : "cursor-not-allowed border-border-2 text-ink-2"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <MessageCircle size={15} />
              Partilhar no WhatsApp
            </a>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer size={15} /> Imprimir
            </Button>
          </div>
        </Surface>

        {/* Códigos QR */}
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center bg-accent-soft text-accent" style={{ borderRadius: "2px" }}>
              <QrCode size={13} />
            </span>
            <h2 className="font-heading text-[18px] font-bold tracking-[-.01em] text-ink">
              Cartões QR para impressão
            </h2>
          </div>

          <div ref={printRef} className="grid gap-5 md:grid-cols-2">
            <QRCard
              title="Loja online"
              subtitle="Leva o cliente direto à tua página"
              data={url}
              accent={store.theme_primary || "#15150E"}
              defaultSize={printSize}
              onSizeChange={setPrintSize}
            />
            {wa && (
              <QRCard
                title="WhatsApp"
                subtitle="Abre um chat direto contigo"
                data={wa}
                accent="#128C7E"
                defaultSize={printSize}
                onSizeChange={setPrintSize}
              />
            )}
          </div>

          <p className="mt-3 font-mono text-[11px] text-ink-2">
            Imprime em A5, A4 ou A3, coloca numa moldura ou pendura na montra. O QR continua a funcionar mesmo em preto e branco.
          </p>
        </div>

        {/* Dicas */}
        <Surface className="p-6">
          <h3 className="mb-4 font-heading text-[15px] font-bold tracking-[-.01em] text-ink">
            Ideias para divulgares a tua loja
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-2" style={{ borderRadius: "2px" }}>
                <Instagram size={16} />
              </span>
              <div>
                <div className="font-mono text-[13px] font-bold text-ink">Redes sociais</div>
                <p className="mt-0.5 font-mono text-[12px] text-ink-2">
                  Coloca o link da loja na bio do Instagram e Facebook e partilha fotos dos produtos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-2" style={{ borderRadius: "2px" }}>
                <MessageCircle size={16} />
              </span>
              <div>
                <div className="font-mono text-[13px] font-bold text-ink">Grupos e contactos</div>
                <p className="mt-0.5 font-mono text-[12px] text-ink-2">
                  Envia o link pelos teus grupos de WhatsApp e e-mail, com um pequeno texto de apresentação.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-2" style={{ borderRadius: "2px" }}>
                <Printer size={16} />
              </span>
              <div>
                <div className="font-mono text-[13px] font-bold text-ink">Embalagens</div>
                <p className="mt-0.5 font-mono text-[12px] text-ink-2">
                  Imprime o QR da loja e cola nas embalagens dos produtos que envias aos clientes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-2" style={{ borderRadius: "2px" }}>
                <Facebook size={16} />
              </span>
              <div>
                <div className="font-mono text-[13px] font-bold text-ink">Boca a boca</div>
                <p className="mt-0.5 font-mono text-[12px] text-ink-2">
                  Pede aos teus clientes para avaliarem e indicarem a loja a amigos e colegas.
                </p>
              </div>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}