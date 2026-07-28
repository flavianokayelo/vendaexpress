import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Package,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  X,
  Zap,
} from "lucide-react";

function Link({
  href,
  children,
  className,
  navigate,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  navigate: (to: string) => void;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

const features = [
  {
    icon: Zap,
    title: "Loja em minutos",
    desc: "Temas prontos, domínio próprio e checkout ativo. Publique em instantes.",
  },
  {
    icon: MessageCircle,
    title: "IA no WhatsApp",
    desc: "Um assistente responde, recomenda e fecha pedidos 24 horas por dia.",
  },
  {
    icon: ShoppingCart,
    title: "Pagamentos integrados",
    desc: "Multicaixa, cartão e transferência. Menor taxa do mercado.",
  },
  {
    icon: Truck,
    title: "Logística automática",
    desc: "Frete, etiquetas e rastreio calculados sem você levantar um dedo.",
  },
  {
    icon: BarChart3,
    title: "Analytics em tempo real",
    desc: "Faturamento, produtos campeões e origem das vendas num painel claro.",
  },
  {
    icon: ExternalLink,
    title: "Migração sem trauma",
    desc: "Importe produtos e clientes de outras plataformas em um clique.",
  },
];

const steps = [
  {
    num: "1",
    title: "Monte sua loja",
    desc: "Escolha um tema, personalize a vitrine e publique. Sem código, sem designer.",
  },
  {
    num: "2",
    title: "Conecte e automatize",
    desc: "Ative pagamentos, frete e a IA do WhatsApp em poucos cliques.",
  },
  {
    num: "3",
    title: "Venda no piloto automático",
    desc: "Divulgue o link e veja os pedidos entrarem enquanto a operação roda sozinha.",
  },
];

const plans = [
  {
    name: "Início",
    desc: "Para validar sua ideia e fazer a primeira venda.",
    price: "Kz 4.900",
    per: "/mês",
    popular: false,
    perks: [
      "Loja + domínio grátis",
      "Multicaixa e cartão",
      "Até 100 produtos",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Crescimento",
    desc: "Para escalar com automação e IA vendendo por você.",
    price: "Kz 14.900",
    per: "/mês",
    popular: true,
    perks: [
      "Tudo do Início",
      "IA de vendas no WhatsApp",
      "Logística automática",
      "Produtos ilimitados",
      "Analytics avançado",
    ],
  },
  {
    name: "Enterprise",
    desc: "Para marcas com alto volume e integrações sob medida.",
    price: "Sob consulta",
    per: "",
    popular: false,
    perks: [
      "Tudo do Crescimento",
      "Gerente de conta dedicado",
      "API exclusiva",
      "SLA e taxas negociadas",
    ],
  },
];

const logos = [
  "LumaWear",
  "Café Norte",
  "TênisPro",
  "Bella Casa",
  "GadgetHub",
  "Verde Vida",
  "UrbanFit",
  "Doce Mel",
];

const iconTints = [
  "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600",
  "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 group-hover:bg-sky-500",
  "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:bg-indigo-600",
  "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600",
  "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 group-hover:bg-sky-500",
];

function AuroraField() {
  const reduce = useReducedMotion();
  const blobs = [
    {
      className: "left-[-10%] top-[-15%] h-[560px] w-[560px]",
      from: "rgba(0,80,203,0.55)",
      dur: 22,
    },
    {
      className: "right-[-15%] top-[5%] h-[480px] w-[480px]",
      from: "rgba(56,189,248,0.45)",
      dur: 26,
    },
    {
      className: "left-[20%] bottom-[-20%] h-[420px] w-[420px]",
      from: "rgba(0,80,203,0.35)",
      dur: 30,
    },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[110px] ${b.className}`}
          style={{
            background: `radial-gradient(circle, ${b.from}, transparent 70%)`,
          }}
          animate={
            reduce
              ? {}
              : {
                  x: [0, 40, -20, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,80,203,0.35) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay dark:opacity-[0.06]">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}

function DashboardMockup() {
  const reduce = useReducedMotion();

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      <div
        className="absolute -inset-[14%_10%] rounded-[56px] opacity-60 blur-[72px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(0,80,203,0.45), rgba(0,80,203,0) 70%)",
        }}
      />
      <div
        className="absolute -inset-[8%_6%] rounded-[44px] opacity-40 blur-[90px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 25% 65%, rgba(56,189,248,0.35), transparent 60%)",
        }}
      />
      <motion.div
        className="absolute -inset-2 rounded-[28px] pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, rgba(0,80,203,0.5), rgba(56,189,248,0.5), rgba(0,80,203,0.5))",
          backgroundSize: "200% 200%",
          filter: "blur(18px)",
          opacity: 0.5,
        }}
        animate={
          reduce ? {} : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, rotateX: 4 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: 1,
          delay: 0.3,
          ease: [0.16, 1, 0.3, 1] as const,
        }}
        className="relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/50"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/10" />

        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <div className="ml-3 flex flex-1 justify-center">
            <span className="rounded-md bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              minhaloja.vendaexpress.com
            </span>
          </div>
        </div>
        <div className="grid min-h-[270px] grid-cols-[64px_1fr]">
          <div className="flex flex-col items-center gap-3 border-r border-zinc-200 py-5 dark:border-zinc-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-600/40">
              <LayoutDashboard size={15} />
            </div>
            {[Package, BarChart3, MessageCircle].map((Icon, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 transition hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
              >
                <Icon size={13} />
              </div>
            ))}
          </div>
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-[.15em] text-zinc-400 uppercase">
                  Faturamento · hoje
                </div>
                <div className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Kz 84.700
                </div>
              </div>
              <div className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                +18%
              </div>
            </div>
            <div className="flex h-[72px] items-end gap-1.5 border-b border-zinc-200 py-2 dark:border-zinc-800">
              {[40, 58, 34, 72, 50, 86, 62, 94, 70].map((h, i) => (
                <motion.div
                  key={i}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.6 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  className="flex-1 rounded-sm origin-bottom"
                  style={{
                    height: `${h}%`,
                    background:
                      i >= 6
                        ? "linear-gradient(180deg, #38bdf8, #0050cb)"
                        : "rgba(0,80,203,0.12)",
                  }}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { label: "Pedidos", value: "142" },
                { label: "Visitas", value: "3.9k" },
                { label: "Conversão", value: "3,6%" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 1 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  className="rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/60"
                >
                  <div className="text-[10px] text-zinc-400">{item.label}</div>
                  <div className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
        transition={{
          opacity: { delay: 1.4, duration: 0.7 },
          scale: { delay: 1.4, duration: 0.7 },
          y: { delay: 2, duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-blue-200/70 bg-white/95 p-4 shadow-2xl shadow-blue-600/20 backdrop-blur-xl dark:border-blue-800 dark:bg-zinc-900/95"
      >
        <div className="mb-2.5 flex items-center gap-3">
          <motion.div
            animate={reduce ? {} : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-sm"
          >
            <MessageCircle size={15} />
          </motion.div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white">
              Assistente IA
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              online agora
            </div>
          </div>
          <span className="ml-auto rounded-full bg-gradient-to-r from-blue-600 to-sky-400 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            Vendas
          </span>
        </div>
        <div className="rounded-xl rounded-tl-sm bg-gradient-to-br from-blue-50 to-white p-3 text-xs leading-relaxed text-zinc-600 shadow-sm dark:from-blue-900/20 dark:to-zinc-900 dark:text-zinc-300">
          Fechei 3 pedidos enquanto você dormia —{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Kz 84.700
          </span>{" "}
          hoje
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-10 top-16 hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-600 shadow-xl shadow-emerald-500/10 backdrop-blur-xl dark:border-emerald-800 dark:bg-zinc-900/95 lg:flex"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1.8, duration: 0.6 },
          x: { delay: 1.8, duration: 0.6 },
          y: { delay: 2.4, duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <CheckCircle2 size={13} /> Pagamento aprovado
      </motion.div>
      <motion.div
        className="absolute -right-8 bottom-24 hidden items-center gap-1.5 rounded-full border border-blue-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-xl shadow-blue-500/10 backdrop-blur-xl dark:border-blue-800 dark:bg-zinc-900/95 lg:flex"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
        transition={{
          opacity: { delay: 2.1, duration: 0.6 },
          x: { delay: 2.1, duration: 0.6 },
          y: { delay: 2.7, duration: 4.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Truck size={13} /> Frete calculado
      </motion.div>
    </div>
  );
}

export function LandingPage({ navigate }: { navigate: (to: string) => void }) {
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = document.getElementById("numeros");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countedRef.current) {
          countedRef.current = true;
          const targets = [12000, 3, 60, 99];
          const dur = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const e = 1 - Math.pow(1 - p, 3);
            setCounts(targets.map((t) => Math.round(t * e)));
            if (p < 1) requestAnimationFrame(tick);
            else setCounts(targets);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const displayStats = [
    {
      node:
        counts[0] >= 1000
          ? `${(counts[0] / 1000).toFixed(counts[0] >= 10000 ? 0 : 1).replace(".", ",")}k`
          : counts[0],
      label: "Lojas ativas",
      suffix: "+",
    },
    { node: `Kz ${counts[1]}`, label: "Vendidos na plataforma", suffix: " bi" },
    { node: `${counts[2]}`, label: "Para criar uma loja", suffix: "s" },
    { node: `${counts[3]}`, label: "Uptime", suffix: "%" },
  ];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: reduce ? {} : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <style>{`
        @keyframes gradientPan { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .gradient-text-live { background-size: 200% auto; animation: gradientPan 6s ease-in-out infinite; }
        @keyframes shine { 0% { transform: translateX(-120%) skewX(-20deg); } 100% { transform: translateX(220%) skewX(-20deg); } }
        .shine-sweep::after {
          content: ''; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shine 3.2s ease-in-out infinite;
        }
        .conic-border { background: conic-gradient(from 0deg, #0050cb, #38bdf8, #0050cb); }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; }
      `}</style>

      <nav className="fixed inset-x-0 top-4 z-50">
        <div className="relative mx-auto flex h-16 w-[min(1280px,calc(100%-40px))] items-center justify-between rounded-2xl border border-zinc-200/70 bg-white/85 px-5 shadow-lg shadow-blue-900/10 backdrop-blur-2xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/85 dark:shadow-black/20">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.03]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px rounded-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent dark:via-blue-500/40" />

          <Link
            href="/"
            className="group relative z-10 flex items-center gap-2.5"
            navigate={navigate}
          >
            <motion.div
              whileHover={reduce ? {} : { scale: 1.05, rotate: -6 }}
              className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 text-[15px] font-bold text-white shadow-lg shadow-blue-500/40"
            >
              V
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </motion.div>
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-bold tracking-tight">
                Venda Express
              </span>
              <span className="hidden rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:border-blue-800 dark:from-blue-900/40 dark:to-sky-900/30 dark:text-blue-300 sm:inline-block">
                AO
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {[
              { href: "#recursos", label: "Recursos" },
              { href: "#como", label: "Como funciona" },
              { href: "#precos", label: "Preços" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                navigate={navigate}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="relative z-10 rounded-xl px-4 py-2 text-sm font-semibold text-zinc-500 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              navigate={navigate}
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="group relative z-10 inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/35 transition-all duration-200 hover:shadow-blue-600/55 hover:from-blue-700 hover:to-sky-500 active:scale-[0.97]"
              navigate={navigate}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Testar grátis
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </div>

          <button
            className="relative z-10 rounded-xl border border-zinc-200/70 bg-white/80 p-2.5 shadow-sm backdrop-blur-sm transition hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:border-blue-600 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/15 backdrop-blur-md md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
              className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-zinc-200/70 bg-white/95 px-5 py-6 shadow-2xl shadow-blue-900/20 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-black/30 md:hidden"
            >
              <div className="flex flex-col gap-1">
                {[
                  { href: "#recursos", label: "Recursos", icon: Store },
                  { href: "#como", label: "Como funciona", icon: Zap },
                  { href: "#precos", label: "Preços", icon: BarChart3 },
                ].map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.05 * i,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1] as const,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-600 transition hover:bg-blue-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      navigate={navigate}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 dark:from-blue-900/30 dark:to-sky-900/20 dark:text-blue-400">
                        <link.icon size={15} />
                      </span>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  className="flex flex-col gap-2"
                >
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    navigate={navigate}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/35"
                    navigate={navigate}
                  >
                    Testar grátis <ArrowRight size={18} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="relative min-h-[100dvh] pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -top-24 md:-top-28">
          <AuroraField />
          <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_0_140px_rgba(0,0,0,0.4)]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-5 py-14 md:px-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
              className="relative mb-6 inline-flex items-center gap-2 overflow-hidden rounded-full border border-blue-300/70 bg-gradient-to-r from-blue-50 via-white to-sky-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-blue-700 dark:from-blue-900/40 dark:via-zinc-900 dark:to-sky-900/30 dark:text-blue-300 shine-sweep"
            >
              <Sparkles
                size={14}
                className="text-blue-600 dark:text-blue-400"
              />
              IA que vende por ti 24h
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="text-[clamp(48px,7.5vw,88px)] font-bold leading-[.92] tracking-[-.045em]"
            >
              A tua loja.
              <br />
              <span className="gradient-text-live bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 bg-clip-text text-transparent">
                A vender sozinha.
              </span>
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-500 dark:text-zinc-400"
            >
              Enquanto tu dormes, a IA atende clientes, fecha pedidos e faz o
              dinheiro entrar. Sem equipa, sem complicação.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="mt-10 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-[length:200%_auto] px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-blue-600/40 transition-[background-position,box-shadow] duration-500 hover:bg-[position:100%_0] hover:shadow-blue-600/60 active:translate-y-px"
                navigate={navigate}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Testar grátis{" "}
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
              <Link
                href="#como"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-white/70 px-8 py-4 text-sm font-semibold text-zinc-900 shadow-sm backdrop-blur-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 active:translate-y-px dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:hover:border-blue-500 dark:hover:text-blue-400"
                navigate={navigate}
              >
                Ver demonstração
              </Link>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="mt-8 flex items-center gap-6 text-sm text-zinc-400 dark:text-zinc-500"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                14 dias grátis
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.35,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative border-y border-blue-200/40 bg-gradient-to-r from-blue-50 via-white to-sky-50 py-5 dark:border-blue-900/40 dark:from-blue-950/30 dark:via-zinc-900 dark:to-sky-950/20"
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-blue-600" /> Cancele quando
            quiser
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-blue-600" /> Suporte em
            português
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-blue-600" /> Atualizações
            grátis
          </span>
        </div>
      </motion.section>

      <section className="relative overflow-hidden border-b border-zinc-200/60 py-12 dark:border-zinc-800">
        <p className="mb-6 text-center text-xs tracking-[.22em] text-zinc-400 uppercase">
          +12.000 lojas já vendem com a Venda Express
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent dark:from-zinc-950" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent dark:from-zinc-950" />
          <div
            className="flex w-max animate-marquee gap-24"
            style={{ animationDuration: "35s" }}
          >
            {[...logos, ...logos].map((name, i) => (
              <span
                key={i}
                className="font-bold tracking-tight text-zinc-200 transition hover:bg-gradient-to-r hover:from-blue-600 hover:to-sky-400 hover:bg-clip-text hover:text-transparent dark:text-zinc-700"
                style={{ fontSize: "clamp(24px,3vw,32px)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-16 max-w-xl"
          >
            <p className="mb-3 text-xs font-semibold tracking-[.18em] text-blue-600 uppercase dark:text-blue-400">
              Recursos
            </p>
            <h2 className="text-[clamp(32px,4.2vw,52px)] font-bold leading-[1.02] tracking-[-.035em]">
              Uma operação inteira,
              <br />
              no automático.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              Seis recursos que fazem a sua loja vender sem você precisar de uma
              equipa.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-4 md:grid-cols-3 md:grid-rows-2"
          >
            {features.slice(0, 1).map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-8 shadow-lg shadow-blue-500/5 transition hover:shadow-2xl hover:shadow-blue-500/15 dark:border-blue-900/60 dark:from-blue-900/20 dark:via-zinc-950 dark:to-sky-950/10 md:col-span-2 md:row-span-2"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl transition group-hover:bg-blue-500/25 dark:bg-blue-500/20" />
                <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-400/15" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-600/30">
                  <Store size={22} />
                </div>
                <h3 className="text-xl font-bold">
                  Sua loja online, completa e pronta para vender
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {f.desc}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-blue-600" /> Temas
                    responsivos e customizáveis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-blue-600" /> Domínio
                    próprio ou subdomínio grátis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-blue-600" />{" "}
                    Checkout otimizado para dispositivos móveis
                  </li>
                </ul>
              </motion.div>
            ))}
            {features.slice(1).map((f, i) => (
              <motion.div key={f.title} variants={itemVariants}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/0 blur-2xl transition duration-300 group-hover:bg-blue-500/10" />
                  <div
                    className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:text-white ${iconTints[i % iconTints.length]}`}
                  >
                    <f.icon size={19} />
                  </div>
                  <h3 className="font-bold text-base">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        id="como"
        className="relative overflow-hidden border-y border-zinc-200 bg-zinc-50 py-28 md:py-36 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 md:px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-20 text-center"
          >
            <p className="mb-3 text-xs font-semibold tracking-[.18em] text-blue-600 uppercase dark:text-blue-400">
              Como funciona
            </p>
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-.03em]">
              Da ideia à primeira venda em 3 passos.
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[19px] top-0 h-full w-px bg-gradient-to-b from-blue-500 via-sky-400 to-blue-500 opacity-40" />
            <div className="space-y-20">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={reduce ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.15,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  className="relative ml-12"
                >
                  <div className="absolute -left-12 top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-transparent bg-gradient-to-br from-blue-600 to-sky-400 text-sm font-bold text-white shadow-lg shadow-blue-600/30">
                    {s.num}
                  </div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="numeros" className="py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-16 text-center"
          >
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-.03em]">
              Números que falam por si.
            </h2>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-5 md:grid-cols-4"
          >
            {displayStats.map((st) => (
              <motion.div
                key={st.label}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-sky-400 opacity-0 transition group-hover:opacity-100" />
                <div className="text-[clamp(44px,5vw,64px)] font-bold leading-none tracking-[-.035em] bg-gradient-to-br from-blue-600 to-sky-400 bg-clip-text text-transparent">
                  {st.node}
                  {st.suffix}
                </div>
                <div className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {st.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        id="precos"
        className="border-t border-zinc-200 bg-zinc-50 py-28 md:py-36 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="mx-auto mb-16 max-w-xl text-center"
          >
            <p className="mb-3 text-xs font-semibold tracking-[.18em] text-blue-600 uppercase dark:text-blue-400">
              Preços
            </p>
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.04] tracking-[-.03em]">
              Planos que crescem com você.
            </h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              14 dias grátis em qualquer plano. Sem cartão.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={
                  plan.popular
                    ? "relative rounded-2xl p-[2px] conic-border lg:-translate-y-3"
                    : ""
                }
              >
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-8 ${
                    plan.popular
                      ? "border-transparent bg-white shadow-2xl shadow-blue-500/20 dark:bg-zinc-800"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-blue-600 to-sky-400 px-3 py-1 text-xs font-bold text-white shadow-md shadow-blue-600/30">
                      Mais popular
                    </div>
                  )}
                  <h3 className="text-base font-bold">{plan.name}</h3>
                  <p className="mb-6 mt-1.5 min-h-[40px] text-sm text-zinc-500 dark:text-zinc-400">
                    {plan.desc}
                  </p>
                  <div className="mb-7 flex items-baseline gap-1.5">
                    <span className="text-[clamp(36px,4vw,42px)] font-bold tracking-[-.035em]">
                      {plan.price}
                    </span>
                    {plan.per && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {plan.per}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/signup"
                    className={`mb-8 rounded-xl py-3.5 text-center text-sm font-semibold transition active:translate-y-px ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
                        : "border border-zinc-300 text-zinc-900 hover:border-blue-600 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-blue-500 dark:hover:text-blue-400"
                    }`}
                    navigate={navigate}
                  >
                    Testar grátis
                  </Link>
                  <div className="flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
                    {plan.perks.map((perk) => (
                      <div
                        key={perk}
                        className="flex items-start gap-2.5 text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-blue-600"
                        />{" "}
                        {perk}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 pb-28 pt-20 md:pb-36 md:pt-28">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-600 via-blue-600 to-sky-500 px-8 py-20 text-center shadow-2xl shadow-blue-600/30 dark:border-blue-900"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
          <h2 className="relative text-[clamp(34px,5vw,56px)] font-bold leading-[1] tracking-[-.035em] text-white">
            Sua próxima venda
            <br />
            começa hoje.
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-base text-blue-50">
            Monte sua loja, conecte o WhatsApp e deixe a IA vender. Grátis por
            14 dias.
          </p>
          <Link
            href="/signup"
            className="relative mt-8 inline-flex items-center gap-2.5 rounded-xl bg-white px-9 py-4 text-base font-semibold text-blue-700 shadow-xl shadow-black/10 transition hover:bg-blue-50 active:translate-y-px"
            navigate={navigate}
          >
            Testar grátis <ArrowRight size={19} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 md:px-6">
          <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
            <div>
              <Link
                href="/"
                className="group flex items-center gap-2.5 mb-4"
                navigate={navigate}
              >
                <motion.div
                  whileHover={reduce ? {} : { scale: 1.05, rotate: -6 }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 text-[15px] font-bold text-white shadow-lg shadow-blue-500/40"
                >
                  V
                </motion.div>
                <span className="text-[17px] font-bold tracking-tight">
                  Venda Express
                </span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                A plataforma de e-commerce angolana que monta a sua loja,
                conecta o WhatsApp e deixa a IA vender por si.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { icon: MessageCircle, href: "#" },
                  { icon: BarChart3, href: "#" },
                  { icon: Zap, href: "#" },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:border-blue-300 hover:text-blue-600 hover:shadow-md dark:border-zinc-700 dark:hover:border-blue-600 dark:hover:text-blue-400"
                  >
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-[.15em] text-zinc-400 uppercase">
                Produto
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "#recursos", label: "Recursos" },
                  { href: "#precos", label: "Preços" },
                  { href: "#como", label: "Como funciona" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                      navigate={navigate}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-[.15em] text-zinc-400 uppercase">
                Conta
              </h4>
              <ul className="space-y-3">
                {[
                  { href: "/login", label: "Entrar" },
                  { href: "/signup", label: "Criar loja" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                      navigate={navigate}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-[.15em] text-zinc-400 uppercase">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <li>suporte@vendaexpress.com</li>
                <li>Benguela, Angola</li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Suporte 24h
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 md:flex-row dark:border-zinc-800">
            <span className="text-xs text-zinc-400">
              © 2026 Venda Express — Feito em Angola
            </span>
            <div className="flex gap-6 text-xs text-zinc-400">
              <span>Termos</span>
              <span>Privacidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
