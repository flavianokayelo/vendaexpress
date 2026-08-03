import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { useAuth } from "../lib/auth";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  useInView,
  type MotionValue,
} from "motion/react";
import {
  ArrowRight,
  MessageCircle,
  BarChart3,
  Zap,
  ShoppingCart,
  CheckCircle2,
  Bot,
  TrendingUp,
  Quote,
  ShieldCheck,
  CreditCard,
  Clock,
  Undo2,
  User,
} from "lucide-react";
import { resolveMediaUrl } from "../lib/api";

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

function ParallaxLayer({
  children,
  speed = 0.4,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => v * speed * -0.5);
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TiltCard({
  children,
  className = "",
  style,
  glare = false,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(x, [0, 1], [-6, 6]), {
    damping: 18,
    stiffness: 180,
  });
  const ry = useSpring(useTransform(y, [0, 1], [6, -6]), {
    damping: 18,
    stiffness: 180,
  });
  const mxPct = useTransform(x, (v) => `${v * 100}%`);
  const myPct = useTransform(y, (v) => `${v * 100}%`);
  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const handleLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: ry,
        rotateY: rx,
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...(glare
          ? ({ "--mx": mxPct, "--my": myPct } as unknown as React.CSSProperties)
          : {}),
        ...style,
      }}
      className={`relative overflow-hidden group ${className}`}
    >
      {children}
      {glare && (
        <span
          aria-hidden
          className="glare-layer pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            mixBlendMode: "soft-light",
            background:
              "radial-gradient(280px circle at var(--mx) var(--my), rgba(255,255,255,0.55), transparent 65%)",
          }}
        />
      )}
    </motion.div>
  );
}

function MagneticWrap({
  children,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 10, stiffness: 120 });
  const springY = useSpring(y, { damping: 10, stiffness: 120 });
  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { damping: 25, stiffness: 200 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[110] h-[3px] origin-left pointer-events-none"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #1a4bf0, #8b5cf6, #f59e0b)",
      }}
    />
  );
}

function CustomCursor() {
  const reduce = useReducedMotion();
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const springX = useSpring(cx, { damping: 22, stiffness: 180 });
  const springY = useSpring(cy, { damping: 22, stiffness: 180 });
  const [hoverBtn, setHoverBtn] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    if (reduce) return;
    const move = (e: MouseEvent) => {
      cx.set(e.clientX - 10);
      cy.set(e.clientY - 10);
    };
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const labelEl = el.closest("[data-cursor]");
      const btnEl = el.closest("a,button,[data-magnetic]");
      setLabel(labelEl ? labelEl.getAttribute("data-cursor") : null);
      setHoverBtn(!!btnEl && !labelEl);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      style={{ translateX: springX, translateY: springY }}
      className={`pointer-events-none fixed top-0 left-0 z-[999] flex items-center justify-center mix-blend-difference rounded-full bg-ink text-paper font-body text-[11px] font-semibold tracking-wide transition-[width,height] duration-200 ${
        label ? "px-3.5 h-9 whitespace-nowrap" : hoverBtn ? "size-8" : "size-5"
      }`}
    >
      {label}
    </motion.div>
  );
}

function Particles({
  count = 24,
  color = "rgba(21,21,14,0.08)",
}: {
  count?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let anim: number;
    const dots: { x: number; y: number; vx: number; vy: number; r: number }[] =
      [];
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.6,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > c.width) d.vx *= -1;
        if (d.y < 0 || d.y > c.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />
  );
}

const logos = [
  "Bella Casa",
  "GadgetHub",
  "Verde Vida",
  "UrbanFit",
  "Doce Mel",
  "Lumina",
  "Kianda Store",
  "Muxima",
];

const tourPanels = [
  {
    id: "p-vendas",
    url: "app.vendaexpress.ao/vendas",
    title: "Vendas ao vivo",
    no: "01",
    desc: "Acompanha os teus pedidos e faturação num painel simples e direto.",
    content: (reduce: boolean) => (
      <div>
        <div className="mb-3 flex items-baseline gap-3">
          <span className="font-heading text-[38px] font-bold tracking-[-.03em] text-ink leading-none">
            Kz 84.700
          </span>
          <span
            className="font-mono text-xs font-bold text-success border border-success/30 bg-success/5 px-2 py-1"
            style={{ borderRadius: "999px" }}
          >
            +18%
          </span>
        </div>
        <div className="flex items-end gap-[10px] h-[70px] mb-4">
          {[44, 62, 50, 78, 60, 90, 100].map((h, i) => (
            <div
              key={i}
              className="flex-1 origin-bottom"
              style={{
                height: `${h}%`,
                borderRadius: "2px",
                background: i >= 6 ? "#1a4bf0" : "rgba(26,75,240,0.08)",
              }}
            />
          ))}
        </div>
        <div className="space-y-0 border-t border-border">
          {[
            { p: "Ténis UrbanFit", c: "Luanda", v: "Kz 18.900" },
            { p: "Bolsa Lumina", c: "Lubango", v: "Kz 24.000" },
            { p: "Fone GadgetHub", c: "Lobito", v: "Kz 8.900" },
          ].map((o, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-border text-sm"
            >
              <span>
                <span className="text-ink font-medium">{o.p}</span>
                <span className="font-mono text-xs text-ink-2 ml-2">
                  · {o.c}
                </span>
              </span>
              <span className="font-heading font-bold text-ink">{o.v}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "p-ia",
    url: "app.vendaexpress.ao/ia-whatsapp",
    title: "Vendas via WhatsApp",
    no: "02",
    desc: "Recebes e geres pedidos diretamente pelo chat sem sair do painel.",
    content: () => (
      <div className="flex flex-col gap-3">
        {[
          {
            text: "Olá! Ainda têm o vestido Bella Casa tamanho M?",
            who: "cliente",
            time: "02:14",
            side: "them",
          },
          {
            text: "Temos sim! Custa Kz 12.500 e entregamos em Luanda em 24h. Queres que eu reserve já?",
            who: "ia",
            time: "02:14",
            side: "me",
          },
          {
            text: "Sim, quero. Pago por Multicaixa Express.",
            who: "cliente",
            time: "02:15",
            side: "them",
          },
          {
            text: "Pedido criado ✓ Envie o comprovativo aqui e despacho hoje mesmo.",
            who: "ia",
            time: "02:15",
            side: "me",
          },
        ].map((msg, i) => (
          <div
            key={i}
            className={`max-w-[76%] ${msg.side === "me" ? "self-end" : "self-start"}`}
          >
            <div
              className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.side === "me"
                  ? "bg-primary text-white"
                  : "bg-paper text-ink"
              }`}
              style={{
                borderRadius: "12px",
                borderBottomLeftRadius: msg.side === "them" ? "3px" : "12px",
                borderBottomRightRadius: msg.side === "me" ? "3px" : "12px",
              }}
            >
              {msg.text}
              <span className="block font-mono text-[10px] opacity-60 mt-1">
                {msg.who} · {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div className="self-start flex items-center gap-1.5 font-mono text-[11px] text-ink-2">
          <span className="w-[5px] h-[5px] rounded-full bg-ink-2 animate-bounce" />
          <span
            className="w-[5px] h-[5px] rounded-full bg-ink-2 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="w-[5px] h-[5px] rounded-full bg-ink-2 animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />{" "}
          a escrever…
        </div>
      </div>
    ),
  },
  {
    id: "p-prod",
    url: "app.vendaexpress.ao/produtos",
    title: "Produtos",
    no: "03",
    desc: "Publica, edita e organiza o teu catálogo em segundos.",
    content: () => (
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            n: "Ténis UrbanFit",
            p: "Kz 18.900",
            g: "linear-gradient(135deg,#DDE3F7,#EFF1FB)",
          },
          {
            n: "Vestido Bella Casa",
            p: "Kz 12.500",
            g: "linear-gradient(135deg,#F1E6F7,#F6EEFB)",
          },
          {
            n: "Kit Verde Vida",
            p: "Kz 6.750",
            g: "linear-gradient(135deg,#E3F3EC,#F0F8F3)",
          },
          {
            n: "Bolsa Lumina",
            p: "Kz 24.000",
            g: "linear-gradient(135deg,#F7EFE1,#FBF6EE)",
          },
          {
            n: "Fone GadgetHub",
            p: "Kz 8.900",
            g: "linear-gradient(135deg,#E1F1F7,#EEF7FB)",
          },
          {
            n: "Perfume Doce Mel",
            p: "Kz 9.800",
            g: "linear-gradient(135deg,#F7E5E5,#FBEFEF)",
          },
        ].map((prod, i) => (
          <div
            key={i}
            className="border border-border p-3 transition hover:-translate-y-[3px] hover:border-border-2"
            style={{ borderRadius: "10px" }}
          >
            <div
              className="h-[70px] mb-2.5"
              style={{ borderRadius: "8px", background: prod.g }}
            />
            <div className="text-xs text-ink font-medium">{prod.n}</div>
            <div className="font-heading text-sm font-bold text-primary mt-1">
              {prod.p}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "p-log",
    url: "app.vendaexpress.ao/logistica",
    title: "Logística",
    no: "04",
    desc: "Calcula frete, gera etiquetas e rastreia sem fazer nada.",
    content: () => (
      <div className="space-y-0">
        {[
          {
            id: "#VE-2041",
            from: "Luanda → Talatona",
            pill: "em trânsito",
            pillClass: "bg-accent-soft text-primary",
          },
          {
            id: "#VE-2040",
            from: "Benguela → Lobito",
            pill: "entregue",
            pillClass: "bg-success/10 text-success",
          },
          {
            id: "#VE-2039",
            from: "Huambo → Caála",
            pill: "a preparar",
            pillClass: "bg-[#FBF0DD] text-[#9A7414]",
          },
          {
            id: "#VE-2038",
            from: "Lubango → Namibe",
            pill: "em trânsito",
            pillClass: "bg-accent-soft text-primary",
          },
          {
            id: "#VE-2037",
            from: "Luanda → Viana",
            pill: "entregue",
            pillClass: "bg-success/10 text-success",
          },
        ].map((l, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-3.5 text-sm ${i < 4 ? "border-b border-border" : ""}`}
          >
            <span className="font-mono text-xs text-ink-2">{l.id}</span>
            <span className="text-ink font-medium">{l.from}</span>
            <span
              className={`font-mono text-[10.5px] font-semibold px-2 py-1 ${l.pillClass}`}
              style={{ borderRadius: "100px" }}
            >
              {l.pill}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "p-ana",
    url: "app.vendaexpress.ao/analytics",
    title: "Analytics",
    no: "05",
    desc: "Vê o que vende mais e de onde vêm os teus clientes.",
    content: () => (
      <div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { l: "receita", v: "Kz 3.1M", d: "↑ 22%" },
            { l: "pedidos", v: "642", d: "↑ 14%" },
            { l: "ticket médio", v: "Kz 4.8k", d: "↑ 6%" },
          ].map((a, i) => (
            <div
              key={i}
              className="border border-border p-3.5"
              style={{ borderRadius: "10px" }}
            >
              <div className="font-mono text-[10.5px] text-ink-2">{a.l}</div>
              <div className="font-heading text-2xl font-bold text-ink mt-1.5">
                {a.v}
              </div>
              <div className="font-mono text-[10.5px] text-success mt-0.5">
                {a.d}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-[10px] h-[90px]">
          {[40, 65, 52, 80, 60, 92, 74].map((h, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${h}%`,
                borderRadius: "2px",
                background: i % 2 === 0 ? "#1a4bf0" : "#C9D4F8",
              }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

const testimonials = [
  {
    num: "+212%",
    lab: "em vendas nos primeiros 3 meses",
    quote:
      "Configurei a loja num sábado à tarde. No domingo já tinha pedidos a entrar pelo WhatsApp sem eu tocar em nada.",
    avatar: "/images/landing/produtos.jpg",
    name: "Bella Casa",
    role: "decoração · luanda",
    color: "#1a4bf0",
  },
  {
    num: "3×",
    lab: "mais pedidos fechados pelo WhatsApp",
    quote:
      "Os clientes pedem pelo WhatsApp e eu recebo na hora. Nunca foi tão fácil vender.",
    avatar: "/images/landing/gadget.jpg",
    name: "GadgetHub",
    role: "eletrónica · benguela",
    color: "#8b5cf6",
  },
  {
    num: "−40%",
    lab: "menos tempo perdido com logística",
    quote:
      "A plataforma calcula o frete e gera as etiquetas por mim. Só me preocupo em vender.",
    avatar: "/images/landing/loja.jpg",
    name: "Verde Vida",
    role: "naturais · lobito",
    color: "#f59e0b",
  },
];

const gradients = [
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  "linear-gradient(135deg, #f97316, #ec4899)",
];

function TestimonialCarousel({
  testimonials,
}: {
  testimonials: typeof testimonials;
}) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setInterval(
      () => setActive((p) => (p + 1) % testimonials.length),
      3800,
    );
    return () => clearInterval(t);
  }, [testimonials.length]);

  return (
    <div className="relative">
      <div className="grid md:grid-cols-3 gap-5 min-h-[320px]">
        {testimonials.map((t, i) => {
          const isActive = i === active;
          return (
            <motion.button
              key={t.name}
              data-cursor="Ler"
              onClick={() => setActive(i)}
              whileHover={!reduce ? { scale: 1.01 } : undefined}
              className={`h-full text-left p-7 md:p-8 transition-all duration-500 ${
                isActive
                  ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.15)] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] opacity-50 hover:opacity-80"
              }`}
              style={{
                borderRadius: "16px",
                borderWidth: "1px",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <Quote
                size={22}
                className="mb-3"
                style={{ color: "#ec4899", opacity: 0.3 }}
              />
              <div
                className="font-heading text-[58px] font-bold tracking-[-.04em] leading-none"
                style={{
                  background: gradients[i],
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {t.num}
              </div>
              <div className="font-[family-name:var(--font-mono)] text-xs text-[#9ca3af] mt-2">
                {t.lab}
              </div>
              <div
                className="relative overflow-hidden mt-5"
                style={{ height: "4.5em" }}
              >
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.p
                      key={t.name}
                      initial={!reduce ? { opacity: 0, y: 10 } : undefined}
                      animate={{ opacity: 1, y: 0 }}
                      exit={!reduce ? { opacity: 0, y: -10 } : undefined}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="text-sm text-[#9ca3af] leading-relaxed absolute inset-0"
                    >
                      &ldquo;{t.quote}&rdquo;
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-[34px] h-[34px] overflow-hidden transition-all duration-500 shrink-0 ${
                      isActive ? "scale-110" : ""
                    }`}
                    style={{
                      borderRadius: "999px",
                      boxShadow: isActive ? "0 0 0 2px rgba(255,255,255,0.15)" : undefined,
                    }}
                  >
                    <img
                      src={t.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="font-heading text-[14.5px] font-semibold text-[#f5f5f5]">
                      {t.name}
                    </div>
                    <div className="font-[family-name:var(--font-mono)] text-[11.5px] text-[#6b7280]">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-2.5 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`transition-all duration-500 rounded-full ${
              i === active
                ? "w-8 h-[6px] bg-[#ec4899]"
                : "w-[6px] h-[6px] bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.3)]"
            }`}
            aria-label={`testemunho ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const plans = [
  {
    tag: "início",
    name: "Início",
    desc: "Para validar a tua ideia e fazer a primeira venda.",
    price: "Kz 4.900",
    per: "/mês",
    pop: false,
    color: "#0d9488",
    perks: [
      "Loja + domínio grátis",
      "Multicaixa e cartão",
      "Até 100 produtos",
      "Suporte por e-mail",
    ],
  },
  {
    tag: "mais popular",
    name: "Crescimento",
    desc: "Para escalar as tuas vendas com tudo que precisas.",
    price: "Kz 14.900",
    per: "/mês",
    pop: true,
    color: "#1a4bf0",
    perks: [
      "Tudo do Início",
      "Vendas pelo WhatsApp",
      "Logística integrada",
      "Produtos ilimitados",
      "Analytics avançado",
    ],
  },
  {
    tag: "enterprise",
    name: "Enterprise",
    desc: "Para marcas com alto volume e integrações sob medida.",
    price: "Sob consulta",
    per: "",
    pop: false,
    color: "#f59e0b",
    perks: [
      "Tudo do Crescimento",
      "Gerente de conta dedicado",
      "API exclusiva",
      "SLA e taxas negociadas",
    ],
  },
];

function CountUpSection() {
  const reduce = useReducedMotion();
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const countedRef = useRef(false);

  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const el = document.getElementById("stats");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countedRef.current) {
          countedRef.current = true;
          const targets = [12, 3, 60, 99];
          const dur = 1500;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const e = 1 - Math.pow(1 - p, 3);
            setCounts(targets.map((t) => Math.round(t * e)));
            if (p < 1) requestAnimationFrame(tick);
            else {
              setCounts(targets);
              setFlash(true);
            }
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = [
    { val: `${counts[0]}k+`, label: "lojas ativas", color: "#1a4bf0" },
    {
      val: `Kz ${counts[1]} bi`,
      label: "vendidos na plataforma",
      color: "#8b5cf6",
    },
    { val: `${counts[2]}s`, label: "para criar uma loja", color: "#f59e0b" },
    { val: `${counts[3]}%`, label: "uptime", color: "#0d9488" },
  ];

  return (
    <div
      id="stats"
      className="grid grid-cols-2 md:grid-cols-4 border-b border-border"
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="stat-cell relative overflow-hidden border-r border-border last:border-r-0 p-10 md:p-16 text-center cursor-default"
        >
          <span
            className="absolute top-0 left-0 right-0 h-[3px] opacity-70"
            style={{ background: item.color }}
          />
          <div
            className={`font-heading text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-[-.035em] tabular-nums ${flash ? "count-flash" : ""}`}
            style={{ color: item.color }}
          >
            {item.val}
          </div>
          <div className="mt-3 font-mono text-xs text-ink-2">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function TourRailFill({
  index,
  n,
  progress,
}: {
  index: number;
  n: number;
  progress: MotionValue<number>;
}) {
  const width = useTransform(
    progress,
    [index / n, (index + 1) / n],
    ["0%", "100%"],
  );
  return (
    <motion.div className="h-full bg-primary rounded-[2px]" style={{ width }} />
  );
}

function TourFrame({
  panel,
  index,
  n,
  progress,
  reduce,
}: {
  panel: (typeof tourPanels)[number];
  index: number;
  n: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const segStart = index / n;
  const segEnd = (index + 1) / n;
  const ease = (segEnd - segStart) * 0.08;
  const opacity = useTransform(
    progress,
    [segStart, segStart + ease, segEnd - ease, segEnd],
    [index === 0 ? 1 : 0, 1, 1, index === n - 1 ? 1 : 0],
  );
  const y = useTransform(
    progress,
    [segStart, segStart + ease, segEnd - ease, segEnd],
    [index === 0 ? 0 : 16, 0, 0, index === n - 1 ? 0 : -16],
  );
  return (
    <motion.div
      style={reduce ? undefined : { opacity, y }}
      className="pointer-events-none absolute inset-0 bg-surface p-6"
    >
      <div className="mb-4 flex justify-between font-mono text-[11px] text-ink-2 uppercase tracking-[.06em]">
        <span>{panel.title.toLowerCase()}</span>
        <span>hoje</span>
      </div>
      {panel.content(reduce)}
    </motion.div>
  );
}

/** Click/autoplay tour used on mobile and under prefers-reduced-motion, where a pinned scroll-scrub hurts more than it helps. */
function InteractiveTourFallback({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [visible, setVisible] = useState(false);

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % tourPanels.length);
  }, []);

  useEffect(() => {
    if (!visible || reduce || !playing) return;
    intervalRef.current = setInterval(advance, 5200);
    return () => clearInterval(intervalRef.current);
  }, [advance, visible, reduce, playing]);

  useEffect(() => {
    const el = document.getElementById("plataforma");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const panel = tourPanels[active];

  return (
    <div
      className="grid md:grid-cols-[0.9fr_1.6fr] gap-7 md:gap-11 items-start"
      style={{ perspective: "1600px" }}
    >
      <div className="flex flex-col border-t border-border">
        {tourPanels.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setPlaying(false);
              setActive(i);
            }}
            className={`text-left bg-none border-0 border-b border-border py-5 px-1 cursor-pointer grid grid-cols-[auto_1fr] gap-4 items-start transition-all duration-300 ${
              i === active ? "pl-3" : "hover:pl-2"
            }`}
          >
            <span
              className={`font-mono text-xs mt-1 transition-colors ${i === active ? "text-primary" : "text-ink-2"}`}
            >
              {p.no}
            </span>
            <span>
              <h4
                className={`font-heading text-lg font-semibold tracking-[-.02em] transition-colors ${i === active ? "text-primary" : "text-ink"}`}
              >
                {p.title}
              </h4>
              <p
                className={`text-sm text-ink-2 transition-all duration-400 ${
                  i === active
                    ? "max-h-[60px] opacity-100 mt-1.5"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {p.desc}
              </p>
              <div
                className="h-[2px] bg-line-2 mt-3 overflow-hidden rounded-[2px]"
                style={{ display: i === active ? "block" : "none" }}
              >
                <div
                  className="h-full bg-primary rounded-[2px] transition-[width]"
                  style={{
                    width: i === active ? "100%" : "0%",
                    transitionDuration: i === active && playing ? "5s" : "0.3s",
                    transitionTimingFunction: "linear",
                  }}
                />
              </div>
            </span>
          </button>
        ))}
      </div>

      <div
        className="tour-stage"
        data-cursor="Explorar"
        style={{ perspective: "1600px" }}
      >
        <TiltCard
          className="tour-screen relative border border-border-2 bg-surface shadow-lg overflow-hidden"
          style={{ borderRadius: "20px", minHeight: "430px" }}
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
            </div>
            <div
              className="flex-1 text-center font-mono text-[11.5px] text-ink-2 bg-paper py-1.5 px-3"
              style={{ borderRadius: "999px" }}
            >
              {panel.url}
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold text-success tracking-[.04em]">
              <span
                className="w-[6px] h-[6px] rounded-full bg-success"
                style={{ animation: "pulse2 1.6s infinite" }}
              />
              AO VIVO
            </span>
          </div>
          <div className="relative min-h-[376px] p-6" key={panel.id}>
            <div className="mb-4 flex justify-between font-mono text-[11px] text-ink-2 uppercase tracking-[.06em]">
              <span>{panel.title.toLowerCase()}</span>
              <span>hoje</span>
            </div>
            {panel.content(reduce ?? false)}
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

/** Desktop, motion-enabled: pins the section and scrubs through the 5 platform frames as the user scrolls, like flipping through the app while it runs. */
function InteractiveTourPinned() {
  const n = tourPanels.length;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n))));
  });

  const goTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + (el.offsetHeight * (i + 0.5)) / n;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const panel = tourPanels[active];

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: `${n * 92}vh` }}
    >
      <div
        className="sticky top-[96px] grid md:grid-cols-[0.9fr_1.6fr] gap-7 md:gap-11 items-start"
        style={{ perspective: "1600px" }}
      >
        <div className="flex flex-col border-t border-border">
          {tourPanels.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i)}
              className={`text-left bg-none border-0 border-b border-border py-5 px-1 cursor-pointer grid grid-cols-[auto_1fr] gap-4 items-start transition-all duration-300 ${
                i === active ? "pl-3" : "hover:pl-2"
              }`}
            >
              <span
                className={`font-mono text-xs mt-1 transition-colors ${i === active ? "text-primary" : "text-ink-2"}`}
              >
                {p.no}
              </span>
              <span>
                <h4
                  className={`font-heading text-lg font-semibold tracking-[-.02em] transition-colors ${i === active ? "text-primary" : "text-ink"}`}
                >
                  {p.title}
                </h4>
                <p
                  className={`text-sm text-ink-2 transition-all duration-400 ${
                    i === active
                      ? "max-h-[60px] opacity-100 mt-1.5"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {p.desc}
                </p>
                <div
                  className="h-[2px] bg-line-2 mt-3 overflow-hidden rounded-[2px]"
                  style={{ display: i === active ? "block" : "none" }}
                >
                  <TourRailFill index={i} n={n} progress={scrollYProgress} />
                </div>
              </span>
            </button>
          ))}
        </div>

        <div
          className="tour-stage"
          data-cursor="Explorar"
          style={{ perspective: "1600px" }}
        >
          <TiltCard
            className="tour-screen relative border border-border-2 bg-surface shadow-lg overflow-hidden"
            style={{ borderRadius: "20px", minHeight: "430px" }}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
              </div>
              <div
                className="flex-1 text-center font-mono text-[11.5px] text-ink-2 bg-paper py-1.5 px-3"
                style={{ borderRadius: "999px" }}
              >
                {panel.url}
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold text-success tracking-[.04em]">
                <span
                  className="w-[6px] h-[6px] rounded-full bg-success"
                  style={{ animation: "pulse2 1.6s infinite" }}
                />
                AO VIVO
              </span>
            </div>
            <div className="relative min-h-[376px]">
              {tourPanels.map((p, i) => (
                <TourFrame
                  key={p.id}
                  panel={p}
                  index={i}
                  n={n}
                  progress={scrollYProgress}
                  reduce={false}
                />
              ))}
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}

function InteractiveTour() {
  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (isDesktop && !reduce) return <InteractiveTourPinned />;
  return <InteractiveTourFallback reduce={!!reduce} />;
}

function LiveDashboard() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [revenue, setRevenue] = useState(84700);
  const [pedidos, setPedidos] = useState(142);
  const [aiMsg, setAiMsg] = useState(
    "Fechei 3 pedidos enquanto dormias — Kz 84.700 hoje.",
  );
  const [toast, setToast] = useState<{ title: string; sub: string } | null>(
    null,
  );
  const idxRef = useRef(0);

  const orders = [
    { p: "Ténis UrbanFit", v: 18900, c: "Luanda" },
    { p: "Vestido Bella Casa", v: 12500, c: "Benguela" },
    { p: "Fone GadgetHub", v: 8900, c: "Lobito" },
    { p: "Kit Verde Vida", v: 6750, c: "Huambo" },
    { p: "Bolsa Lumina", v: 24000, c: "Lubango" },
    { p: "Relógio GadgetHub", v: 31500, c: "Namibe" },
    { p: "Perfume Doce Mel", v: 9800, c: "Luanda" },
    { p: "Sapatilha UrbanFit", v: 15300, c: "Benguela" },
  ];

  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  useEffect(() => {
    if (reduce) return;
    let timer1 = setTimeout(() => {
      newOrder();
      const interval = setInterval(newOrder, 3400);
      timer1 = setInterval(() => {}, 0); // placeholder
    }, 1800);
    function newOrder() {
      if (document.hidden) return;
      const o = orders[idxRef.current % orders.length];
      idxRef.current++;
      setRevenue((prev) => prev + o.v);
      setPedidos((prev) => prev + 1);
      setAiMsg(`Fechei o pedido — ${o.p} · Kz ${fmt(o.v)} · ${o.c}`);
      setToast({
        title: `${o.p} — Kz ${fmt(o.v)}`,
        sub: `fechado pela ia · ${o.c}`,
      });
    }
    return () => clearTimeout(timer1);
  }, []);

  const svgUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

  return (
    <div
      ref={stageRef}
      className="relative"
      style={{
        perspective: "1600px",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      data-rotate
    >
      <div
        className="browser bg-surface border border-border-2 shadow-lg overflow-hidden"
        style={{ borderRadius: "20px" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex gap-1.5">
            <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#E6E4DA]" />
          </div>
          <div
            className="flex-1 text-center font-mono text-[11.5px] text-ink-2 bg-paper py-1.5 px-3"
            style={{ borderRadius: "999px" }}
          >
            minhaloja.vendaexpress.ao
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold text-success tracking-[.04em]">
            <span
              className="w-[6px] h-[6px] rounded-full bg-success"
              style={{ animation: "pulse2 1.6s infinite" }}
            />
            AO VIVO
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] tracking-[.08em] uppercase text-ink-2">
              faturamento · hoje
            </span>
            <span
              className="font-mono text-[11.5px] font-bold text-success border border-success/30 bg-success/5 px-2 py-1"
              style={{ borderRadius: "999px" }}
            >
              +18%
            </span>
          </div>
          <div className="mt-1.5 mb-4">
            <span className="font-heading text-[34px] font-bold tracking-[-.02em] text-ink tabular-nums">
              Kz {fmt(revenue)}
            </span>
          </div>
          <div
            id="chart"
            className="flex items-end gap-2 h-[100px] pb-3.5 border-b border-border"
          >
            {[44, 60, 50, 74, 58, 86, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 origin-bottom chart-bar"
                style={{
                  height: `${h}%`,
                  borderRadius: "2px",
                  background: i >= 6 ? "#1a4bf0" : "rgba(26,75,240,0.08)",
                }}
              />
            ))}
          </div>
          <div className="flex gap-6 mt-4">
            {[
              { n: fmt(pedidos), l: "pedidos" },
              { n: "3.9k", l: "visitas" },
              { n: "27%", l: "conversão" },
            ].map((s, i) => (
              <div key={i}>
                <div
                  className="font-heading text-lg font-bold text-ink tabular-nums"
                  id={i === 0 ? "pedidos" : undefined}
                >
                  {s.n}
                </div>
                <div className="font-mono text-[10.5px] text-ink-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute left-[-30px] bottom-[34px] max-w-[244px] bg-surface border border-border-2 shadow-xl flex gap-2.5 p-3"
        style={{ borderRadius: "16px", transform: "translateZ(60px)" }}
      >
        <div
          className="w-[30px] h-[30px] bg-primary text-white flex items-center justify-center shrink-0"
          style={{ borderRadius: "10px" }}
        >
          <Bot size={16} />
        </div>
        <div>
          <div className="font-mono text-[11px] font-semibold text-ink flex items-center gap-1.5">
            assistente ia{" "}
            <span className="w-[6px] h-[6px] rounded-full bg-success" />
          </div>
          <div className="text-[11.5px] text-ink-2 leading-relaxed mt-1">
            {aiMsg}
          </div>
        </div>
      </div>

      <div
        className={`absolute top-[-16px] right-5 bg-ink text-paper font-mono flex items-center gap-2.5 px-3.5 py-2.5 transition-all duration-350 ${
          toast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
        style={{
          borderRadius: "999px",
          transform: toast
            ? "translateZ(80px)"
            : "translateZ(80px) translateY(-8px)",
        }}
      >
        <span className="text-[#8FE9B4] text-sm">↑</span>
        <div>
          <div className="text-[11.5px] font-semibold whitespace-nowrap">
            {toast?.title ?? ""}
          </div>
          <div className="text-[10.5px] text-paper/60 whitespace-nowrap">
            {toast?.sub ?? ""}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1.8, duration: 0.6 },
          y: { delay: 2.4, duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute right-1 top-14 sm:-right-6 sm:top-16 lg:-right-10 flex items-center gap-1.5 sm:gap-2 bg-surface border border-success/30 px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-[10px] sm:text-xs font-semibold text-success shadow-xl scale-90 sm:scale-100 origin-right"
        style={{ borderRadius: "999px" }}
      >
        <CheckCircle2 size={12} className="shrink-0" /> Pagamento aprovado
      </motion.div>
    </div>
  );
}

export function LandingPage({ navigate }: { navigate: (to: string) => void }) {
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [introDone, setIntroDone] = useState(false);
  const { user, store } = useAuth();

  // Opening curtain — a brief branded reveal instead of dropping straight into the hero.
  // Purely visual (the opaque overlay already covers everything): it must NOT touch
  // document.body.style.overflow, since that races with Lenis's own scroll setup below
  // and left the page's scroll broken once the curtain lifted.
  useEffect(() => {
    if (reduce) {
      setIntroDone(true);
      return;
    }
    const t = setTimeout(() => setIntroDone(true), 1900);
    return () => clearTimeout(t);
  }, [reduce]);

  // Smooth (inertia) scroll — landing page only, doesn't touch dashboard/admin.
  // Lenis keeps driving the real document scroll (just smoothed via rAF), so
  // window.scrollY, IntersectionObserver and motion's useScroll all keep working.
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduce]);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        }
      },
      { threshold: 0.15, rootMargin: "-80px 0px -20% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Hero scroll rotation
  useEffect(() => {
    if (reduce) return;
    const stage = document.querySelector("[data-rotate]") as HTMLElement;
    if (!stage) return;
    let ticking = false;
    const frame = () => {
      const r = stage.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, 1 - r.top / window.innerHeight));
      const rx = (1 - p) * 16;
      const ry = (1 - p) * -4;
      const ty = p * -24;
      stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(${ty}px)`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          frame();
          ticking = true;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    frame();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Chart grow on scroll
  useEffect(() => {
    if (reduce) return;
    const chart = document.getElementById("chart");
    if (!chart) return;
    const io = new IntersectionObserver(
      ([entry], observer) => {
        if (entry.isIntersecting) {
          chart.querySelectorAll(".chart-bar").forEach((el) => {
            (el as HTMLElement).style.transform = "scaleY(1)";
          });
          observer.unobserve(chart);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(chart);
    return () => io.disconnect();
  }, []);

  // Reveal animations
  useEffect(() => {
    if (reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const [annual, setAnnual] = useState(false);
  const [faqOpen, setFaqOpen] = useState(-1);
  const annualMap: Record<string, { price: string; saved: string }> = {
    "Início": { price: "Kz 3.900", saved: "20%" },
    "Crescimento": { price: "Kz 11.900", saved: "20%" },
  };

  return (
    <div className="min-h-screen bg-paper text-ink-2 selection:bg-primary selection:text-paper font-body">
      <AnimatePresence>
        {!introDone && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-ink"
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{
              duration: 0.7,
              delay: 1.15,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 20%, #8b5cf6, transparent 55%), radial-gradient(circle at 80% 85%, #1a4bf0, transparent 55%), radial-gradient(circle at 85% 15%, #f59e0b, transparent 50%)",
              }}
            />
            <div className="overflow-hidden relative z-[1]">
              <motion.span
                className="flex items-center gap-3 font-heading text-white text-[9vw] md:text-[3.6vw] font-bold tracking-[-.03em]"
                initial={{ y: "115%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="w-[10px] h-[10px] rounded-full bg-primary shrink-0" />
                Venda Express
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ScrollProgress />
      <CustomCursor />
      <Particles />

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.028] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes pulse2 { 0% { box-shadow: 0 0 0 0 rgba(31,157,87,.45); } 70% { box-shadow: 0 0 0 7px rgba(31,157,87,0); } 100% { box-shadow: 0 0 0 0 rgba(31,157,87,0); } }
        .btn-press { transition: transform .12s cubic-bezier(.2,.85,.4,1), box-shadow .25s ease; }
        .btn-press:active { transform: scale(.97); }
        .btn-press.bg-ink:hover { box-shadow: 0 0 0 5px rgba(26,75,240,0.12); }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
        .reveal.in { opacity: 1; transform: none; }
        .chart-bar { transform: scaleY(0); transition: transform .9s cubic-bezier(.2,.8,.2,1); }
        #chart .chart-bar { transform: scaleY(1); }
        .navlink-underline::after {
          content: ''; position: absolute; left: 0; right: 100%; bottom: -4px; height: 2px;
          background: linear-gradient(90deg, var(--theme-colors-primary, #1a4bf0), #8b5cf6);
          transition: right .3s cubic-bezier(.2,.7,.2,1);
        }
        .navlink-underline:hover::after, .navlink-underline.is-active::after { right: 0; }
        .stat-cell { transition: transform .3s cubic-bezier(.2,.7,.2,1); }
        .stat-cell:hover { transform: translateY(-4px); }
        .kicker-line { width: 0; transition: width 1s cubic-bezier(.2,.7,.2,1) .1s; }
        .reveal.in .kicker-line { width: 100%; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .reveal { opacity: 1; transform: none; transition: none; }
          .chart-bar { transform: scaleY(1); }
          .navlink-underline::after { transition: none; }
          .stat-cell { transition: none; }
          .kicker-line { transition: none; }
        }
      `}</style>

      {/* Nav */}
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          navScrolled
            ? "bg-paper/82 backdrop-blur-[12px] border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex items-center justify-between h-[72px] max-w-[1220px] px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="w-[9px] h-[9px] rounded-full bg-primary" />
            <span className="font-heading text-[19px] font-bold tracking-[-.02em] text-ink">
              Venda Express
            </span>
            <span
              className="font-mono text-[10px] font-semibold text-ink-2 border border-border-2 px-1.5 py-0.5 tracking-[.05em]"
              style={{ borderRadius: "999px" }}
            >
              AO
            </span>
          </a>

          <div className="hidden md:flex items-center gap-[26px]">
            {[
              { href: "#plataforma", label: "plataforma" },
              { href: "#recursos", label: "recursos" },
              { href: "#resultados", label: "resultados" },
              { href: "#precos", label: "preços" },
            ].map((link) => {
              const id = link.href.slice(1);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-body text-[14.5px] font-medium transition-colors hover:text-ink px-0.5 navlink-underline ${
                    activeSection === id ? "text-ink is-active" : "text-ink-2"
                  }`}
                  navigate={navigate}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-[18px]">
            {user ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-2.5 font-heading font-semibold text-[14px] text-white px-4 py-2.5 bg-gradient-to-r from-primary to-violet-600 shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 btn-press"
                style={{ borderRadius: "999px" }}
                navigate={navigate}
              >
                {store?.logo_url ? (
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5">
                    <img
                      src={resolveMediaUrl(store.logo_url) ?? ""}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[12px] font-bold uppercase">
                    {user.email[0]}
                  </span>
                )}
                Ir para loja
              </Link>

            ) : (
              <>
                <Link
                  href="/login"
                  className="font-body text-[14.5px] font-medium text-ink transition hover:text-primary"
                  navigate={navigate}
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 font-heading font-semibold text-[14.5px] text-white px-5 py-3 bg-gradient-to-r from-primary to-violet-600 shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 btn-press"
                  style={{ borderRadius: "999px" }}
                  navigate={navigate}
                >
                  Testar grátis{" "}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden bg-none border-0 cursor-pointer relative w-[34px] h-[34px]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            <motion.span
              className="block absolute left-1/2 w-[20px] h-[2px] bg-ink"
              style={{ x: "-50%" }}
              animate={mobileOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span
              className="block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[20px] h-[2px] bg-ink"
              animate={
                mobileOpen
                  ? { opacity: 0, scale: 0.6 }
                  : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block absolute left-1/2 w-[20px] h-[2px] bg-ink"
              style={{ x: "-50%" }}
              animate={mobileOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-4 top-20 border border-border bg-paper/95 px-5 py-6 shadow-xl backdrop-blur-2xl"
            style={{ borderRadius: "18px" }}
          >
            <div className="flex flex-col gap-1">
              {[
                { href: "#plataforma", label: "plataforma", icon: TrendingUp },
                { href: "#recursos", label: "recursos", icon: Zap },
                { href: "#resultados", label: "resultados", icon: BarChart3 },
                { href: "#precos", label: "preços", icon: ShoppingCart },
              ].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05 * i,
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 font-body text-[14.5px] font-semibold text-ink-2 transition hover:bg-ink/[0.04] hover:text-ink"
                    navigate={navigate}
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center bg-ink/[0.06] text-ink"
                      style={{ borderRadius: "10px" }}
                    >
                      <link.icon size={15} />
                    </span>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 border-t border-border pt-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col gap-2"
              >
                {user ? (
                  <Link
                    href="/app"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary to-violet-600 px-5 py-3.5 font-heading font-semibold text-white shadow-lg shadow-primary/25 btn-press"
                    style={{ borderRadius: "999px" }}
                    navigate={navigate}
                  >
                    {store?.logo_url ? (
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5">
                        <img
                          src={resolveMediaUrl(store.logo_url) ?? ""}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[12px] font-bold uppercase">
                        {user.email[0]}
                      </span>
                    )}
                    Ir para loja
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center justify-center px-4 py-3.5 font-body text-[14.5px] font-semibold text-ink-2 border border-border btn-press transition hover:text-ink hover:bg-ink/[0.04]"
                      style={{ borderRadius: "999px" }}
                      navigate={navigate}
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-violet-600 px-5 py-3.5 font-heading font-semibold text-white shadow-lg shadow-primary/25 btn-press"
                      style={{ borderRadius: "999px" }}
                      navigate={navigate}
                    >
                      Testar grátis <ArrowRight size={18} />
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero */}
      <header className="relative z-[2] pt-[72px] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Hero background image */}
          <div className="absolute inset-0 opacity-[0.06]">
            <img
              src="/images/landing/hero-bg.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {/* Perspective grid — linhas convergentes */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  transparent 58px,
                  rgba(26,75,240,0.05) 58px,
                  rgba(26,75,240,0.05) 60px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 58px,
                  rgba(26,75,240,0.04) 58px,
                  rgba(26,75,240,0.04) 60px
                )`,
              maskImage:
                "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 65%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 65%)",
            }}
          />
          {/* Linhas diagonais de acento */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.03]"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="0"
              x2="1200"
              y2="800"
              stroke="rgba(26,75,240,0.5)"
              strokeWidth="1"
            />
            <line
              x1="400"
              y1="0"
              x2="1200"
              y2="533"
              stroke="rgba(26,75,240,0.5)"
              strokeWidth="1"
            />
            <line
              x1="800"
              y1="0"
              x2="1200"
              y2="267"
              stroke="rgba(26,75,240,0.5)"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="267"
              x2="1200"
              y2="267"
              stroke="rgba(26,75,240,0.4)"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="533"
              x2="1200"
              y2="533"
              stroke="rgba(26,75,240,0.4)"
              strokeWidth="0.5"
            />
          </svg>
          {/* Soft gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-violet-500/[0.06]" />
          {/* Vibrant gradient accents */}
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/[0.16] via-violet-500/[0.11] to-transparent blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-amber-400/[0.16] via-rose-500/[0.09] to-transparent blur-[90px]" />
          <div className="absolute top-[32%] left-[8%] w-[32%] h-[32%] rounded-full bg-gradient-to-br from-emerald-400/[0.11] via-teal-400/[0.07] to-transparent blur-[90px]" />
          {/* Noise grain */}
          <div
            className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "256px 256px",
            }}
          />
        </div>
        <div className="mx-auto max-w-[1220px] px-5 md:px-8">
          <div className="flex max-sm:flex-col max-sm:gap-2.5 justify-between items-start sm:items-center pb-6 mb-8 md:mb-11 pt-8 md:pt-14">
            <span className="inline-flex items-center gap-2 font-body text-[13px] font-semibold text-ink bg-success/10 border border-success/25 rounded-full px-4 py-1.5">
              <span
                className="w-[7px] h-[7px] rounded-full bg-success"
                style={{ animation: "pulse2 2s infinite" }}
              />
              Lojas a vender agora em todo o país
            </span>
          </div>

          <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-10 md:gap-14 items-center">
            <div>
              <h1 className="font-heading text-[clamp(36px,5.2vw,68px)] font-bold tracking-[-.035em] leading-[.96] text-ink">
                <span className="block overflow-hidden pb-[.04em]">
                  <span
                    className="inline-block"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    Monta
                  </span>{" "}
                  <span
                    className="inline-block"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .07s forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    a
                  </span>{" "}
                  <span
                    className="inline-block"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .14s forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    tua
                  </span>{" "}
                  <span
                    className="inline-block"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .21s forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    loja
                  </span>
                </span>
                <span className="block overflow-hidden pb-[.04em]">
                  <span
                    className="inline-block"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .28s forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    hoje.
                  </span>
                </span>
                <span className="block overflow-hidden pb-[.04em]">
                  <span
                    className="inline-block text-primary"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .35s forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    Começa
                  </span>{" "}
                  <span
                    className="inline-block text-primary"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .42s forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    a
                  </span>{" "}
                  <span
                    className="inline-block text-primary"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .49s forwards",
                      transform: "translateY(112%)",
                    }}
                  >
                    vender
                  </span>{" "}
                  <span
                    className="inline-block text-primary"
                    style={{
                      animation:
                        "wordUp 1s cubic-bezier(.2,.85,.25,1) .56s forwards, glowPulse 2.4s ease-in-out .8s infinite",
                      transform: "translateY(112%)",
                      filter: "brightness(1.1)",
                      fontFamily: "'Instrument Serif', serif",
                      fontStyle: "italic",
                      fontWeight: 400,
                    }}
                  >
                    agora.
                  </span>
                </span>
              </h1>

              <style>{`
                @keyframes wordUp { to { transform: translateY(0); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
                @keyframes glowPulse {
                  0%, 100% { filter: brightness(1) drop-shadow(0 0 0px rgba(26,75,240,0)); }
                  50% { filter: brightness(1.25) drop-shadow(0 0 12px rgba(26,75,240,0.4)); }
                }
                @keyframes countFlash {
                  0% { color: var(--primary); transform: scale(1.06); }
                  50% { color: var(--primary); transform: scale(1.02); }
                  100% { color: inherit; transform: scale(1); }
                }
                .count-flash { animation: countFlash .7s ease; }
                .cta-glow {
                  animation: ctaPulse 2.4s ease-in-out infinite;
                }
                .cta-glow:hover {
                  animation: ctaPulse 0.6s ease-in-out infinite;
                }
                @keyframes ctaPulse {
                  0%, 100% { box-shadow: 0 0 0px rgba(26,75,240,0); }
                  50% { box-shadow: 0 0 22px -4px rgba(26,75,240,0.45), 0 0 50px -10px rgba(26,75,240,0.15); }
                }
              `}</style>

              <p
                className="mt-6 max-w-[440px] text-[17px] text-ink-2 leading-relaxed"
                style={{
                  opacity: 0,
                  animation: "fadeUp .8s ease .5s forwards",
                }}
              >
                Cria a tua loja online em minutos. Sem código, sem designer, sem
                burocracia.{" "}
                <b className="text-ink font-semibold">Do clique à venda.</b>
              </p>

              <div
                className="flex gap-3.5 flex-wrap mt-7"
                style={{
                  opacity: 0,
                  animation: "fadeUp .8s ease .65s forwards",
                }}
              >
                <MagneticWrap strength={0.25}>
                  <Link
                    href="/signup"
                    data-magnetic
                    className="inline-flex items-center gap-2.5 font-heading font-semibold text-[15px] text-white bg-gradient-to-r from-primary to-violet-600 px-6 py-3.5 btn-press relative overflow-hidden cta-glow"
                    style={{ borderRadius: "999px" }}
                    navigate={navigate}
                  >
                    <span className="relative z-[1]">Testar grátis</span>{" "}
                    <ArrowRight
                      size={15}
                      className="relative z-[1] transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </MagneticWrap>
                <MagneticWrap strength={0.25}>
                  <Link
                    href="#plataforma"
                    data-magnetic
                    className="inline-flex items-center gap-2.5 font-heading font-semibold text-[15px] bg-transparent text-ink px-6 py-3.5 border-2 border-ink btn-press hover:bg-ink hover:text-paper"
                    style={{ borderRadius: "999px" }}
                    navigate={navigate}
                  >
                    Ver a plataforma
                  </Link>
                </MagneticWrap>
              </div>

              <div
                className="flex gap-5 mt-5 font-body text-[13px] font-medium text-ink-2"
                style={{
                  opacity: 0,
                  animation: "fadeUp .8s ease .8s forwards",
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-success" />
                  sem cartão de crédito
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-success" />
                  14 dias grátis
                </span>
              </div>
            </div>

            <div className="relative" style={{ perspective: "1600px" }}>
              <div className="absolute -inset-4 rounded-[24px] overflow-hidden pointer-events-none z-0 opacity-[0.12] mix-blend-multiply">
                <img
                  src="/images/landing/loja.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating product images */}
              <div className="absolute -left-4 top-6 w-12 h-12 sm:-left-8 sm:top-8 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white shadow-xl z-[2]">
                <img
                  src="/images/landing/tenis.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -right-3 top-12 w-10 h-10 sm:-right-6 sm:top-16 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white shadow-xl z-[2]">
                <img
                  src="/images/landing/gadget.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -left-2 bottom-8 w-9 h-9 sm:-left-4 sm:bottom-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-xl z-[2]">
                <img
                  src="/images/landing/bolsa.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute right-1 bottom-1 w-8 h-8 sm:right-3 sm:bottom-2 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amber-300 shadow-xl z-[2]">
                <img
                  src="/images/landing/pagamentos.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute left-1/2 -top-5 w-8 h-8 sm:-top-7 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-emerald-300 shadow-xl z-[2]">
                <img
                  src="/images/landing/whatsapp.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-2 top-1/3 z-[2] scale-75 sm:scale-90 lg:scale-100 origin-right"
              >
                <div
                  className="bg-white/90 backdrop-blur-md border border-border px-3 py-2 shadow-lg flex items-center gap-2"
                  style={{ borderRadius: "999px" }}
                >
                  <span className="w-7 h-7 rounded-full overflow-hidden">
                    <img
                      src="/images/landing/avatar-cliente.jpg"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="font-mono text-[11px] text-ink font-semibold">
                    +Kz 18.900
                  </span>
                </div>
              </motion.div>
              <div className="relative z-[1]">
                <LiveDashboard />
              </div>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="border-t border-border border-b border-border py-5 mt-12 overflow-hidden">
          <p className="text-center font-body text-[12px] font-semibold text-ink-2 tracking-[.08em] uppercase mb-4">
            +12.000 empreendedores já montaram a sua loja e começaram a vender
          </p>
          <div
            className="overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
            }}
          >
            <div className="flex w-max gap-14 animate-marquee">
              {[...logos, ...logos].map((name, i) => (
                <span
                  key={i}
                  className="font-heading text-[22px] font-semibold tracking-[-.02em] text-ink-2 whitespace-nowrap transition-colors hover:text-ink"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Trust bar */}
      <div className="relative z-[2] overflow-hidden border-b border-border bg-surface/60">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(59,130,246,0.09), rgba(139,92,246,0.07), rgba(245,158,11,0.08))",
            maskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="relative z-[1] mx-auto max-w-[1220px] px-5 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: ShieldCheck,
              label: "pagamento 100% seguro",
              color: "from-blue-500 to-indigo-600",
            },
            {
              icon: CreditCard,
              label: "multicaixa express + cartão",
              color: "from-violet-500 to-purple-600",
            },
            {
              icon: Clock,
              label: "suporte em português · resposta <2h",
              color: "from-amber-400 to-orange-500",
            },
            {
              icon: Undo2,
              label: "14 dias de garantia, sem perguntas",
              color: "from-emerald-400 to-teal-600",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`w-9 h-9 shrink-0 flex items-center justify-center text-white bg-gradient-to-br ${item.color}`}
                style={{ borderRadius: "10px" }}
              >
                <item.icon size={16} />
              </span>
              <span className="font-mono text-[12px] text-ink-2 leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <section className="relative overflow-hidden">
        <ParallaxLayer
          speed={0.08}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.05] via-violet-500/[0.03] to-amber-400/[0.05]" />
        </ParallaxLayer>
        <CountUpSection />
      </section>

      {/* Interactive Tour */}
      <section
        id="plataforma"
        className="border-b border-border py-[60px] md:py-[100px] relative z-[2]"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 12% 10%, rgba(59,130,246,0.12), transparent 70%), radial-gradient(55% 50% at 92% 85%, rgba(79,70,229,0.10), transparent 65%)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="mx-auto max-w-[1220px] px-5 md:px-8 relative z-[1]">
          <div className="mb-10 md:mb-14 reveal">
            <div className="inline-block mb-4">
              <span
                className="block text-[20px] md:text-[22px] italic leading-none"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  backgroundImage: "linear-gradient(90deg, #3b82f6, #4f46e5)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                plataforma
              </span>
              <span
                className="kicker-line block mt-2 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, #3b82f6, #4f46e5)`,
                }}
              />
            </div>
            <h2 className="font-heading text-[clamp(32px,4.6vw,52px)] font-bold tracking-[-.03em] text-ink max-w-[16ch]">
              Vê como é fácil montar a tua loja.
            </h2>
            <p className="text-[16.5px] text-ink-2 mt-4 max-w-[44ch]">
              Do registo à primeira venda em poucos cliques. Cada módulo mostra
              como a plataforma trabalha por ti.
            </p>
          </div>
          <div className="reveal">
            <InteractiveTour />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="recursos"
        className="border-b border-border py-[60px] md:py-[100px] relative z-[2] overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 88% 8%, rgba(139,92,246,0.12), transparent 70%), radial-gradient(55% 50% at 8% 90%, rgba(147,51,234,0.09), transparent 65%)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="mx-auto max-w-[1220px] px-5 md:px-8 relative z-[1]">
          <div className="mb-10 md:mb-14 reveal">
            <div className="inline-block mb-4">
              <span
                className="block text-[20px] md:text-[22px] italic leading-none"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  backgroundImage: "linear-gradient(90deg, #8b5cf6, #9333ea)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                recursos
              </span>
              <span
                className="kicker-line block mt-2 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, #8b5cf6, #9333ea)`,
                }}
              />
            </div>
            <h2 className="font-heading text-[clamp(32px,4.6vw,52px)] font-bold tracking-[-.03em] text-ink max-w-[16ch]">
              Tudo o que precisas para vender online, num só lugar.
            </h2>
            <p className="text-[16.5px] text-ink-2 mt-4 max-w-[44ch]">
              Da loja ao pagamento, da logística ao suporte — a plataforma
              completa para começar a vender já.
            </p>
          </div>

          <div className="grid md:grid-cols-3 border-t border-border border-l border-border">
            {/* Feature 1 — wide */}
            <Reveal className="md:col-span-2">
              <TiltCard
                glare
                className="h-full border-r border-border border-b border-border transition-colors hover:bg-surface relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
                  <img
                    src="/images/landing/loja.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="relative z-[1] p-8 md:p-9">
                  <div className="font-mono text-xs text-ink-2 mb-6">01</div>
                  <div
                    className="bg-gradient-to-br from-amber-400 to-amber-600 text-white w-10 h-10 flex items-center justify-center mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
                    style={{ borderRadius: "12px" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9h18M3 9l1.5-4.5A2 2 0 0 1 6.4 3h11.2a2 2 0 0 1 1.9 1.5L21 9M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M9 13h6" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-semibold tracking-[-.02em] text-ink mb-2.5">
                    Monta a tua loja em minutos
                  </h3>
                  <p className="text-[14.5px] text-ink-2">
                    Temas prontos, domínio próprio e checkout ativo. Publicas
                    hoje e começas a vender no mesmo dia.
                  </p>
                  <div className="mt-5 relative h-32 md:h-40 rounded-2xl overflow-hidden border border-border">
                    <img
                      src="/images/landing/dashboard.jpg"
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundColor: "#f59e0b",
                        opacity: 0.18,
                        mixBlendMode: "color",
                      }}
                    />
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2.5">
                    {[
                      "temas responsivos",
                      "domínio grátis",
                      "checkout p/ telemóvel",
                    ].map((tag) => (
                      <li
                        key={tag}
                        className="font-body text-[12.5px] font-medium text-ink bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 transition-colors group-hover:border-amber-500/40"
                        style={{ borderRadius: "999px" }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </Reveal>

            {/* Feature 2 — WhatsApp, destaque */}
            <Reveal delay={0.06}>
              <TiltCard
                glare
                className="h-full border-r border-border border-b border-border transition-colors hover:bg-surface relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none">
                  <img
                    src="/images/landing/whatsapp.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.06]"
                  style={{
                    background:
                      "radial-gradient(120% 120% at 80% 20%, #25D366, transparent 70%)",
                  }}
                />
                <div className="relative z-[1] p-8 md:p-9">
                  <div className="font-mono text-xs text-ink-2 mb-6">02</div>
                  <div
                    className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white w-10 h-10 flex items-center justify-center mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
                    style={{ borderRadius: "12px" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3a9 9 0 0 0-9 9 8.9 8.9 0 0 0 1.3 4.7L3 21l4.5-1.2A9 9 0 1 0 12 3Z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-semibold tracking-[-.02em] text-ink mb-2.5">
                    Vendas pelo WhatsApp
                  </h3>
                  <p className="text-[14.5px] text-ink-2">
                    Recebe e gere pedidos diretamente pelo chat. Simples, rápido
                    e sem complicação.
                  </p>
                  <div className="mt-5 relative h-28 rounded-2xl overflow-hidden border border-border">
                    <img
                      src="/images/landing/whatsapp.jpg"
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundColor: "#34d399",
                        opacity: 0.18,
                        mixBlendMode: "color",
                      }}
                    />
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-success">
                    <span
                      className="w-[5px] h-[5px] rounded-full bg-success"
                      style={{ animation: "pulse2 1.6s infinite" }}
                    />
                    conetado
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Feature 3 */}
            <Reveal delay={0.12}>
              <TiltCard
                glare
                className="h-full border-r border-border border-b border-border transition-colors hover:bg-surface relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
                  <img
                    src="/images/landing/pagamentos.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="relative z-[1] p-8 md:p-9">
                  <div className="font-mono text-xs text-ink-2 mb-6">03</div>
                  <div
                    className="bg-gradient-to-br from-sky-400 to-blue-600 text-white w-10 h-10 flex items-center justify-center mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
                    style={{ borderRadius: "12px" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <rect x="2.5" y="5" width="19" height="14" rx="2" />
                      <path d="M2.5 9.5h19" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-semibold tracking-[-.02em] text-ink mb-2.5">
                    Pagamentos integrados
                  </h3>
                  <p className="text-[14.5px] text-ink-2">
                    Multicaixa, cartão ou transferência. Configuras uma vez e
                    recebes sem stress.
                  </p>
                </div>
              </TiltCard>
            </Reveal>

            {/* Feature 4 */}
            <Reveal delay={0.18}>
              <TiltCard
                glare
                className="h-full border-r border-border border-b border-border transition-colors hover:bg-surface relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
                  <img
                    src="/images/landing/logistica.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="relative z-[1] p-8 md:p-9">
                  <div className="font-mono text-xs text-ink-2 mb-6">04</div>
                  <div
                    className="bg-gradient-to-br from-teal-400 to-teal-600 text-white w-10 h-10 flex items-center justify-center mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
                    style={{ borderRadius: "12px" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7" />
                      <circle cx="7" cy="17" r="1.6" />
                      <circle cx="17" cy="17" r="1.6" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-semibold tracking-[-.02em] text-ink mb-2.5">
                    Logística integrada
                  </h3>
                  <p className="text-[14.5px] text-ink-2">
                    Frete, etiquetas e rastreio calculados automaticamente para
                    não perderes tempo.
                  </p>
                </div>
              </TiltCard>
            </Reveal>

            {/* Feature 5 */}
            <Reveal delay={0.24}>
              <TiltCard
                glare
                className="h-full border-r border-border border-b border-border transition-colors hover:bg-surface relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
                  <img
                    src="/images/landing/analytics.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="relative z-[1] p-8 md:p-9">
                  <div className="font-mono text-xs text-ink-2 mb-6">05</div>
                  <div
                    className="bg-gradient-to-br from-violet-400 to-violet-600 text-white w-10 h-10 flex items-center justify-center mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
                    style={{ borderRadius: "12px" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-semibold tracking-[-.02em] text-ink mb-2.5">
                    Analytics em tempo real
                  </h3>
                  <p className="text-[14.5px] text-ink-2">
                    Acompanha as tuas vendas, produtos mais vendidos e de onde
                    vêm os teus clientes.
                  </p>
                </div>
              </TiltCard>
            </Reveal>

            {/* Feature 6 — banner full-width */}
            <Reveal delay={0.3} className="md:col-span-3">
              <TiltCard
                glare
                className="h-full border-r border-border border-b border-border transition-colors hover:bg-surface relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none">
                  <img
                    src="/images/landing/produtos.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="relative z-[1] p-8 md:p-9 bg-gradient-to-br from-rose/[0.03] via-transparent to-amber/[0.02]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-start gap-5">
                      <div className="font-mono text-xs text-ink-2 shrink-0 mt-0.5">
                        06
                      </div>
                      <div>
                        <div
                          className="bg-gradient-to-br from-rose-400 to-rose-600 text-white w-10 h-10 flex items-center justify-center shrink-0 mb-3 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6"
                          style={{ borderRadius: "12px" }}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          >
                            <path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6M17 4v3h-3M7 20v-3h3" />
                          </svg>
                        </div>
                        <h3 className="font-heading text-xl font-semibold tracking-[-.02em] text-ink mb-1">
                          Migração simples
                        </h3>
                        <p className="text-[14.5px] text-ink-2 max-w-[52ch]">
                          Importa produtos e clientes de outras plataformas em
                          um clique. Mudar para a Venda Express é rápido e
                          indolor.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 font-mono text-[12.5px] font-semibold text-primary whitespace-nowrap shrink-0">
                      muda-te hoje <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Showcase Gallery */}
      <section
        id="galeria"
        className="border-b border-border py-[60px] md:py-[100px] relative z-[2] overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 15% 5%, rgba(245,158,11,0.13), transparent 70%), radial-gradient(55% 50% at 95% 95%, rgba(249,115,22,0.10), transparent 65%)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="mx-auto max-w-[1220px] px-5 md:px-8 relative z-[1]">
          <div className="mb-10 md:mb-14 reveal">
            <div className="inline-block mb-4">
              <span
                className="block text-[20px] md:text-[22px] italic leading-none"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  backgroundImage: "linear-gradient(90deg, #f59e0b, #f97316)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                galeria
              </span>
              <span
                className="kicker-line block mt-2 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, #f59e0b, #f97316)`,
                }}
              />
            </div>
            <h2 className="font-heading text-[clamp(32px,4.6vw,52px)] font-bold tracking-[-.03em] text-ink max-w-[18ch]">
              Vê como a tua loja pode ficar.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 reveal">
            {[
              {
                img: "/images/landing/loja.jpg",
                alt: "Loja online",
                label: "loja virtual",
                dot: "bg-blue-500",
                tint: "#3b82f6",
                big: true,
              },
              {
                img: "/images/landing/dashboard.jpg",
                alt: "Dashboard",
                label: "dashboard",
                dot: "bg-violet-500",
                tint: "#8b5cf6",
              },
              {
                img: "/images/landing/analytics.jpg",
                alt: "Analytics",
                label: "analytics",
                dot: "bg-amber-400",
                tint: "#fbbf24",
              },
              {
                img: "/images/landing/gadget.jpg",
                alt: "Mobile",
                label: "mobile",
                dot: "bg-teal-400",
                tint: "#2dd4bf",
              },
              {
                img: "/images/landing/whatsapp.jpg",
                alt: "Chat",
                label: "whatsapp",
                dot: "bg-[#25D366]",
                tint: "#25D366",
              },
              {
                img: "/images/landing/pagamentos.jpg",
                alt: "Pagamentos",
                label: "pagamentos",
                dot: "bg-sky-400",
                tint: "#38bdf8",
              },
              {
                img: "/images/landing/logistica.jpg",
                alt: "Logística",
                label: "logística",
                dot: "bg-emerald-400",
                tint: "#34d399",
              },
              {
                img: "/images/landing/produtos.jpg",
                alt: "Produtos",
                label: "produtos",
                dot: "bg-rose-400",
                tint: "#fb7185",
              },
            ].map((tile, i) => (
              <div
                key={i}
                data-cursor="Ver"
                className={`relative overflow-hidden group ${tile.big ? "col-span-2 md:row-span-2" : ""}`}
                style={{ borderRadius: "14px" }}
              >
                <img
                  src={tile.img}
                  alt={tile.alt}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${tile.big ? "min-h-[280px]" : "min-h-[140px] md:min-h-[160px]"}`}
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: tile.tint,
                    opacity: 0.22,
                    mixBlendMode: "color",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                <span
                  className={`absolute ${tile.big ? "bottom-4 left-4" : "bottom-3 left-3"} inline-flex items-center gap-1.5 font-body text-[12px] font-medium text-white`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${tile.dot}`} />
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section
        id="resultados"
        className="relative z-[2] overflow-hidden py-[60px] md:py-[100px] border-b border-border"
      >
        {/* Plain dark bg — mobile only (desktop uses the mask div below) */}
        <div className="absolute inset-0 z-0 bg-[#0a0a0f] md:hidden" />

        {/* Desktop mask + decorations */}
        <div
          className="absolute inset-0 z-0 hidden md:block"
          style={{
            WebkitMaskImage: "url(/svg/divider.svg)",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
            maskImage: "url(/svg/divider.svg)",
            maskRepeat: "no-repeat",
            maskSize: "100% 100%",
            backgroundColor: "#0a0a0f",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-rose-400/[0.04] via-transparent to-violet-500/[0.05]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 13 10"
            >
              <defs>
                <pattern
                  id="result-pattern"
                  x="0"
                  y="0"
                  width="13"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 0 0 L 9 0 M 9 0 L 10 1 L 13 1 L 13 10 L 4 10 L 3 9 L 0 9 L 0 0"
                    fill="#fff"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#result-pattern)" />
            </svg>
          </div>
        </div>

        {/* Mobile accent strips */}
        <div
          className="absolute top-0 left-0 right-0 z-10 h-[3px] md:hidden"
          style={{
            background: "linear-gradient(135deg, #ec4899, #a855f7)",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 z-10 h-[3px] md:hidden"
          style={{
            background: "linear-gradient(135deg, #ec4899, #a855f7)",
            clipPath: "polygon(0% 50%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />

        <div className="relative z-[11] mx-auto max-w-[1220px] px-5 md:px-8">
           <div className="mb-10 md:mb-14 reveal">
            <div className="inline-block mb-4">
              <span
                className="block text-[20px] md:text-[22px] italic leading-none text-[#ec4899]"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                }}
              >
                resultados
              </span>
              <span className="kicker-line block mt-2 h-[2px] rounded-full bg-[#ec4899]" />
            </div>
            <h2 className="font-heading text-[clamp(32px,4.6vw,52px)] font-bold tracking-[-.03em] text-[#f5f5f5] max-w-[16ch]">
              Lojas angolanas a crescer no piloto automático.
            </h2>
          </div>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Steps */}
      <section
        id="como"
        className="border-b border-border py-[60px] md:py-[100px] relative z-[2] overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 85% 10%, rgba(52,211,153,0.11), transparent 70%), radial-gradient(55% 50% at 10% 90%, rgba(13,148,136,0.09), transparent 65%)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="pointer-events-none absolute bottom-0 right-0 z-0 w-[300px] md:w-[500px] h-full opacity-[0.03]">
          <img
            src="/images/landing/loja.jpg"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="mx-auto max-w-[1220px] px-5 md:px-8 relative z-[1]">
          <div className="mb-10 md:mb-14 reveal">
            <div className="inline-block mb-4">
              <span
                className="block text-[20px] md:text-[22px] italic leading-none"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  backgroundImage: "linear-gradient(90deg, #34d399, #0d9488)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                como funciona
              </span>
              <span
                className="kicker-line block mt-2 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, #34d399, #0d9488)`,
                }}
              />
            </div>
            <h2 className="font-heading text-[clamp(32px,4.6vw,52px)] font-bold tracking-[-.03em] text-ink max-w-[16ch]">
              Da ideia à primeira venda em 3 passos simples.
            </h2>
          </div>

          <style>{`
            .step-card {
              --r: 18px;
              --s: 26px;
              --x: 0px;
              --y: 0px;
              border-radius: var(--r);
              transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease;
            }
            .step-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 32px -8px rgba(0,0,0,0.08);
            }
            .step-mask {
              --_m: / calc(2 * var(--r)) calc(2 * var(--r)) radial-gradient(#000 70%, #0000 72%);
              --_g: conic-gradient(from 180deg at var(--r) calc(100% - var(--r)), #0000 25%, #000 0);
              --_d: calc(var(--s) + var(--r));
              mask:
                calc(var(--_d) + var(--x)) 100% var(--_m),
                0 calc(100% - var(--_d) - var(--y)) var(--_m),
                radial-gradient(var(--s) at 0 100%, #0000 99%, #000 calc(100% + 1px))
                  calc(var(--r) + var(--x)) calc(-1 * var(--r) - var(--y)),
                var(--_g) calc(var(--_d) + var(--x)) 0,
                var(--_g) 0 calc(-1 * var(--_d) - var(--y));
              mask-repeat: no-repeat;
            }
          `}</style>

          <div className="space-y-5 reveal">
            {[
              {
                sn: "01",
                title: "Cria a tua loja",
                desc: "Escolhe um tema, publica os teus produtos e fica online no mesmo dia. Sem complicação.",
                bg: "rgba(52,211,153,0.08)",
                fg: "#34d399",
                img: "/images/landing/dashboard.jpg",
              },
              {
                sn: "02",
                title: "Ativa os pagamentos",
                desc: "Multicaixa, cartão ou transferência. Configuras uma vez e recebes sem stress.",
                bg: "rgba(20,184,166,0.10)",
                fg: "#14b8a6",
                img: "/images/landing/pagamentos.jpg",
              },
              {
                sn: "03",
                title: "Começa a vender",
                desc: "Partilha o link da tua loja e vê os pedidos a entrar. Simples, rápido, direto.",
                bg: "rgba(13,148,136,0.12)",
                fg: "#0d9488",
                img: "/images/landing/loja.jpg",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="step-card step-mask relative overflow-hidden border border-border/60"
                style={{ background: step.bg }}
              >
                <div className="grid grid-cols-[36px_52px_1fr_20px] md:grid-cols-[64px_72px_1fr_auto] max-md:gap-3 gap-5 items-center py-5 md:py-7 px-5 md:px-8">
                  <span
                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-body text-xs font-bold text-white"
                    style={{
                      borderRadius: "999px",
                      background: `linear-gradient(135deg, ${step.fg}, ${step.fg}dd)`,
                      boxShadow: `0 2px 8px ${step.fg}33`,
                    }}
                  >
                    {step.sn}
                  </span>
                  <div
                    className="relative w-[52px] h-[40px] md:w-[72px] md:h-[52px] overflow-hidden"
                    style={{ borderRadius: "10px" }}
                  >
                    <img
                      src={step.img}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundColor: step.fg,
                        opacity: 0.28,
                        mixBlendMode: "color",
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink">
                      {step.title}
                    </h3>
                    <p className="text-sm text-ink-2 mt-1.5 max-w-[52ch]">
                      {step.desc}
                    </p>
                  </div>
                  <span
                    className="font-mono text-lg"
                    style={{ color: step.fg }}
                  >
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="precos"
        className="border-b border-border py-[60px] md:py-[100px] relative z-[2] overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 10% 8%, rgba(56,189,248,0.12), transparent 70%), radial-gradient(55% 50% at 90% 92%, rgba(37,99,235,0.09), transparent 65%)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="mx-auto max-w-[1220px] px-5 md:px-8 relative z-[1]">
          {/* Header */}
          <div className="mb-10 md:mb-12 reveal">
            <div className="inline-block mb-4">
              <span
                className="block text-[20px] md:text-[22px] italic leading-none"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  backgroundImage: "linear-gradient(90deg, #38bdf8, #2563eb)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                preços
              </span>
              <span
                className="kicker-line block mt-2 h-[2px] rounded-full"
                style={{
                  background: `linear-gradient(90deg, #38bdf8, #2563eb)`,
                }}
              />
            </div>
            <h2 className="font-heading text-[clamp(32px,4.6vw,52px)] font-bold tracking-[-.03em] text-ink max-w-[16ch]">
              Planos que crescem contigo.
            </h2>
            <p className="text-[16.5px] text-ink-2 mt-4 max-w-[44ch]">
              14 dias grátis em qualquer plano. Sem cartão.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10 reveal">
            <div className="inline-flex items-center bg-surface rounded-full p-1 border border-border">
              <button
                onClick={() => setAnnual(false)}
                className={`relative px-5 py-2 font-heading text-[14px] font-semibold rounded-full transition-colors ${
                  !annual ? "text-white" : "text-ink-2 hover:text-ink"
                }`}
              >
                {!annual && (
                  <motion.span
                    layoutId="bill-bg"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-[1]">Mensal</span>
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`relative px-5 py-2 font-heading text-[14px] font-semibold rounded-full transition-colors ${
                  annual ? "text-white" : "text-ink-2 hover:text-ink"
                }`}
              >
                {annual && (
                  <motion.span
                    layoutId="bill-bg"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-[1]">Anual</span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => {
              const isPopular = plan.pop;
              const annualInfo = annualMap[plan.name];
              const displayPrice = annual && annualInfo ? annualInfo.price : plan.price;
              const displayPer = annual && annualInfo ? "/mês (fact. anual)" : plan.per;

              return (
                <Reveal key={plan.name} delay={i * 0.08}>
                  <TiltCard
                    glare
                    className={`h-full relative rounded-2xl border p-8 md:p-9 ${
                      isPopular
                        ? "bg-gradient-to-b from-[#0f1929] to-[#0a0e1a] border-primary/30 shadow-xl shadow-primary/10 scale-100 md:scale-[1.05]"
                        : "bg-surface border-border"
                    }`}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute -top-[13px] left-1/2 -translate-x-1/2">
                        <span
                          className="inline-flex items-center gap-1.5 text-white font-body text-[11px] font-semibold px-4 py-1.5 tracking-wide"
                          style={{
                            background: "linear-gradient(90deg, #1a4bf0, #8b5cf6)",
                            borderRadius: "999px",
                            boxShadow: "0 4px 20px rgba(26,75,240,0.35)",
                          }}
                        >
                        </span>
                      </div>
                    )}

                    {/* Tag */}
                    <span
                      className="inline-flex font-body text-[11px] font-semibold mb-3 px-2.5 py-0.5 uppercase tracking-[.06em]"
                      style={{
                        color: plan.color,
                        backgroundColor: `${plan.color}14`,
                        borderRadius: "999px",
                      }}
                    >
                      {plan.tag}
                    </span>

                    {/* Name + desc */}
                    <h3 className={`font-heading text-[22px] font-semibold tracking-[-.02em] ${isPopular ? "text-white" : "text-ink"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-[13.5px] mt-1 mb-4 min-h-[36px] ${isPopular ? "text-white/60" : "text-ink-2"}`}>
                      {plan.desc}
                    </p>

                    {/* Price */}
                    <div className={`font-heading font-bold tracking-[-.03em] ${isPopular ? "text-white" : "text-ink"}`}>
                      <span className="text-[30px] md:text-[38px]">{displayPrice}</span>
                      <small className={`font-body text-sm font-normal ${isPopular ? "text-white/50" : "text-ink-2"}`}>
                        {" "}{displayPer}
                      </small>
                    </div>

                    {/* Annual hint */}
                    {annual && annualInfo && (
                      <span className="block text-[12px] font-medium mt-1" style={{ color: "#22c55e" }}>
                        Poupa {annualInfo.saved} ao ano
                      </span>
                    )}
                    {!annual && annualInfo && (
                      <span className="block text-[12px] font-medium mt-1 text-ink-3">
                        ~{annualInfo.price}/mês no plano anual
                      </span>
                    )}
                    {plan.name === "Enterprise" && (
                      <span className="block text-[12px] font-medium mt-1 text-ink-3">
                        Sob medida para o teu negócio
                      </span>
                    )}

                    {/* CTA */}
                    <MagneticWrap strength={0.2}>
                      <Link
                        href={plan.name === "Enterprise" ? "mailto:suporte@vendaexpress.com" : "/signup"}
                        data-magnetic
                        className={`w-full inline-flex items-center justify-center gap-2.5 font-heading font-semibold text-[14px] mt-6 mb-6 px-5 py-3 transition-all btn-press ${
                          isPopular
                            ? "text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35"
                            : plan.name === "Enterprise"
                            ? "bg-transparent text-ink border-2 border-border hover:border-ink hover:bg-ink hover:text-paper"
                            : "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper"
                        }`}
                        style={{
                          borderRadius: "999px",
                          background: isPopular
                            ? "linear-gradient(90deg, #1a4bf0, #8b5cf6)"
                            : undefined,
                        }}
                        navigate={navigate}
                      >
                        {isPopular ? "Começar agora →" : plan.name === "Enterprise" ? "Falar connosco" : "Testar grátis"}
                      </Link>
                    </MagneticWrap>

                    {/* Divider */}
                    <div className={`h-px mb-6 ${isPopular ? "bg-white/10" : "bg-border"}`} />

                    {/* Perks */}
                    <ul className="space-y-3.5">
                      {plan.perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-start gap-2.5 text-sm"
                          style={{ color: isPopular ? "rgba(255,255,255,0.7)" : undefined }}
                        >
                          <CheckCircle2
                            size={16}
                            className="shrink-0 mt-0.5"
                            style={{ color: plan.color }}
                          />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zigzag divider */}
      <div
        className="relative z-[2] h-[70px] bg-[#0b0a18]"
        style={{
          clipPath:
            "polygon(0 0,100% 0,100% 100%,calc(50% + 64.97px) 100%,50% calc(100% - 64.97px),calc(50% - 64.97px) 100%,0 100%)",
        }}
      />

      {/* Manifesto / CTA */}
      <section className="py-[60px] md:py-[120px] text-center border-b border-border relative z-[2] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]">
          <img
            src="/images/landing/loja.jpg"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-paper/80 via-transparent to-paper/80" />
        <ParallaxLayer
          speed={0.1}
          className="pointer-events-none absolute inset-0 z-0"
        >
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] rounded-full bg-gradient-to-b from-primary/[0.08] via-violet-500/[0.06] to-transparent blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-amber-400/[0.07] via-rose-500/[0.04] to-transparent blur-[100px]" />
        </ParallaxLayer>
        <div className="mx-auto max-w-[1220px] px-5 md:px-8 relative z-[1]">
          <div className="inline-block mb-4 reveal">
            <span
              className="block text-[22px] md:text-[26px] italic leading-none"
              style={{
                fontFamily: "'Instrument Serif', serif",
                backgroundImage: "linear-gradient(90deg, #1a4bf0, #8b5cf6)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              pronto para começar?
            </span>
            <span
              className="kicker-line block mt-2 h-[2px] rounded-full"
              style={{ background: `linear-gradient(90deg, #1a4bf0, #8b5cf6)` }}
            />
          </div>
          <h2 className="font-heading text-[clamp(36px,6vw,74px)] font-bold tracking-[-.04em] leading-[1.02] max-w-[16ch] mx-auto text-ink reveal">
            Cria a tua loja agora e<br />
            <span className="text-primary">
              começa a vender{" "}
              <em
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                hoje.
              </em>
            </span>
          </h2>
          <div className="mt-11 flex gap-4 justify-center flex-wrap reveal">
            <MagneticWrap strength={0.25}>
              <Link
                href="/signup"
                data-magnetic
                className="inline-flex items-center gap-2.5 font-heading font-semibold text-[15px] text-white bg-gradient-to-r from-primary to-violet-600 px-6 py-3.5 shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 btn-press"
                style={{ borderRadius: "999px" }}
                navigate={navigate}
              >
                Testar grátis <ArrowRight size={15} />
              </Link>
            </MagneticWrap>
            <MagneticWrap strength={0.25}>
              <Link
                href="mailto:suporte@vendaexpress.com"
                data-magnetic
                className="inline-flex items-center gap-2.5 font-heading font-semibold text-[15px] bg-transparent text-ink px-6 py-3.5 border-2 border-ink transition hover:bg-ink hover:text-paper btn-press"
                style={{ borderRadius: "999px" }}
                navigate={navigate}
              >
                Falar connosco
              </Link>
            </MagneticWrap>
          </div>
        </div>
        <div
          className="mt-10 md:mt-[70px] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)",
          }}
        >
          <div className="flex w-max gap-10 animate-marquee">
            {[0, 1].flatMap((_) => [
              <span
                key="a"
                className="font-heading text-[clamp(48px,9vw,120px)] font-bold tracking-[-.04em] whitespace-nowrap"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1.2px var(--theme-colors-border-2)",
                }}
              >
                montar uma loja
              </span>,
              <span
                key="b"
                className="text-[clamp(48px,9vw,120px)] tracking-[-.02em] text-ink whitespace-nowrap"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                }}
              >
                nunca foi tão fácil.
              </span>,
            ])}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border py-[60px] md:py-[100px] relative z-[2]">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(50% 45% at 50% 40%, rgba(52,211,153,0.06), transparent 70%), radial-gradient(45% 40% at 80% 80%, rgba(56,189,248,0.06), transparent 65%)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <div className="mx-auto max-w-[720px] px-5 md:px-8 relative z-[1]">
          <div className="mb-10 md:mb-12 text-center reveal">
            <div className="inline-block mb-4">
              <span
                className="block text-[20px] md:text-[22px] italic leading-none"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  backgroundImage: "linear-gradient(90deg, #34d399, #14b8a6)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                dúvidas
              </span>
              <span
                className="kicker-line block mt-2 h-[2px] rounded-full mx-auto"
                style={{
                  background: "linear-gradient(90deg, #34d399, #14b8a6)",
                  width: "40px",
                }}
              />
            </div>
            <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-bold tracking-[-.03em] text-ink">
              Perguntas frequentes
            </h2>
            <p className="text-[16.5px] text-ink-2 mt-4 max-w-[48ch] mx-auto">
              Tudo o que precisas de saber antes de criar a tua loja.
            </p>
          </div>

          <div className="flex flex-col gap-3 reveal">
            {[
              {
                q: "Preciso de conhecimentos técnicos para criar a minha loja?",
                a: "Não. A VendaExpress foi feita para qualquer pessoa — não precisas de saber programar, desenhar ou configurar nada. Escolhes um tema, adicionas os teus produtos e a loja fica online no mesmo dia.",
              },
              {
                q: "Que métodos de pagamento são aceites?",
                a: "Os teus clientes podem pagar com Multicaixa (ATM e online), cartões de crédito/débito (Visa, Mastercard) e transferência bancária. Nós tratamos de toda a integração — tu só precisas de ativar nos settings.",
              },
              {
                q: "Quanto custa?",
                a: "Tens 14 dias grátis em qualquer plano para testar sem compromisso. Depois disso, podes escolher entre os planos Basic, Pro ou Unlimited conforme o volume de vendas. Sem taxas escondidas e sem surpresas.",
              },
              {
                q: "Posso usar o meu próprio domínio?",
                a: "Sim. Em qualquer plano podes conectar o teu domínio personalizado (ex: a tuacompanhia.co.ao). Nós damos-te um subdomínio grátis para começares, e a configuração do domínio próprio é feita em poucos passos.",
              },
              {
                q: "Como funciona o suporte?",
                a: "O suporte é feito por email (suporte@vendaexpress.com) e WhatsApp. Respondemos em menos de 24 horas em dias úteis, e estamos a trabalhar para ter chat ao vivo em breve.",
              },
              {
                q: "Posso cancelar quando quiser?",
                a: "Sim. Não tens fidelização. Podes cancelar a qualquer momento diretamente no painel, e continuas com acesso até ao final do período já pago. Sem burocracia.",
              },
            ].map((faq, i) => {
              const open = faqOpen === i;
              return (
                <div
                  key={i}
                  className="overflow-hidden border border-border/60 transition hover:border-border"
                  style={{ borderRadius: "14px" }}
                >
                  <button
                    onClick={() => setFaqOpen(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 bg-surface/50 px-5 py-4 md:px-6 md:py-5 text-left transition hover:bg-surface/80"
                  >
                    <span className="font-heading text-[15px] md:text-[16.5px] font-semibold text-ink leading-snug">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-border text-ink-2"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M6 1v10M1 6h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-4 md:pb-5">
                          <p className="font-body text-[15px] md:text-[15.5px] text-ink-2 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-[2] overflow-hidden bg-[#0b0a18]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/30 via-violet-500/20 to-transparent blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-tl from-amber-400/20 via-rose-500/15 to-transparent blur-[110px]" />
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "256px 256px",
            }}
          />
        </div>

        <div className="mx-auto max-w-[1220px] px-5 md:px-8 py-[70px] pb-10 relative z-[1]">
          {/* Mini CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-12 mb-12 border-b border-white/10 reveal">
            <div>
              <div className="inline-block mb-4 ">
                <span
                  className="block text-[20px] md:text-[22px] italic leading-none"
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    backgroundImage: "linear-gradient(90deg, #a78bfa, #60a5fa)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  ainda sem loja?
                </span>
                <span
                  className="kicker-line block mt-2 h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #a78bfa, #60a5fa)`,
                  }}
                />
              </div>
              <h3 className="font-heading text-[clamp(24px,3.2vw,38px)] font-bold tracking-[-.03em] text-white max-w-[20ch]">
                Cria a tua agora e começa a vender hoje.
              </h3>
            </div>
            <MagneticWrap strength={0.25}>
              <Link
                href="/signup"
                data-magnetic
                className="inline-flex items-center gap-2.5 font-heading font-semibold text-[15px] text-white bg-gradient-to-r from-primary to-violet-600 px-6 py-3.5 shadow-lg shadow-primary/30 transition hover:shadow-xl hover:-translate-y-0.5 btn-press shrink-0"
                style={{ borderRadius: "999px" }}
                navigate={navigate}
              >
                Testar grátis <ArrowRight size={15} />
              </Link>
            </MagneticWrap>
          </div>

          <div className="flex justify-between items-start flex-wrap gap-10 pb-12 border-b border-white/10">
            <div className="max-w-[280px]">
              <div className="font-heading text-[22px] font-bold text-white flex items-center gap-2.5">
                <span className="w-[9px] h-[9px] rounded-full bg-gradient-to-br from-primary to-violet-500" />
                Venda Express
              </div>
              <p className="text-sm text-white/50 mt-3.5 leading-relaxed">
                A plataforma de e-commerce angolana mais simples para montares a
                tua loja e começares a vender online.
              </p>
            </div>
            <div className="flex gap-[60px] flex-wrap">
              <div>
                <h4 className="font-body text-[11.5px] font-semibold tracking-[.06em] uppercase text-white/40 mb-4">
                  produto
                </h4>
                {["plataforma", "recursos", "resultados", "preços"].map(
                  (label, i) => (
                    <Link
                      key={i}
                      href={`#${["plataforma", "recursos", "resultados", "precos"][i]}`}
                      className="block font-body text-sm text-white/75 mb-3 transition-colors hover:text-blue-300"
                      navigate={navigate}
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>
              <div>
                <h4 className="font-body text-[11.5px] font-semibold tracking-[.06em] uppercase text-white/40 mb-4">
                  conta
                </h4>
                <Link
                  href="/login"
                  className="block font-body text-sm text-white/75 mb-3 transition-colors hover:text-blue-300"
                  navigate={navigate}
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="block font-body text-sm text-white/75 mb-3 transition-colors hover:text-blue-300"
                  navigate={navigate}
                >
                  Criar loja
                </Link>
              </div>
              <div>
                <h4 className="font-body text-[11.5px] font-semibold tracking-[.06em] uppercase text-white/40 mb-4">
                  contacto
                </h4>
                <a
                  href="mailto:suporte@vendaexpress.com"
                  className="block font-body text-sm text-white/75 mb-3 transition-colors hover:text-blue-300"
                >
                  Email
                </a>
                <a
                  href="https://wa.me/244900000000"
                  target="_blank"
                  rel="noopener"
                  className="block font-body text-sm text-white/75 mb-3 transition-colors hover:text-blue-300"
                >
                  WhatsApp
                </a>
                <span className="block font-body text-sm text-white/75 mb-3">
                  Instagram
                </span>
              </div>
            </div>
          </div>

          <ParallaxLayer
            speed={-0.08}
            className="font-heading text-[clamp(60px,17vw,240px)] font-bold tracking-[-.05em] leading-[.85] my-8 md:my-12 overflow-hidden whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-400 to-amber-300"
          >
            Venda Express
          </ParallaxLayer>

          <div className="flex justify-between items-center flex-wrap gap-3 font-body text-xs text-white/40">
            <span>© 2026 — feito em Benguela, Angola</span>
            <span>
              <a href="#" className="transition-colors hover:text-white">
                termos
              </a>{" "}
              &nbsp;{" "}
              <a href="#" className="transition-colors hover:text-white">
                privacidade
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
