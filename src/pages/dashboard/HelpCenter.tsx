import { type ReactNode, useMemo, useState } from "react";
import {
  Search,
  Store,
  Package,
  MessageSquare,
  ChevronDown,
  LifeBuoy,
} from "lucide-react";
import { PageHeader } from "./Shell";
import { Surface } from "../../components/ui/Surface";
import { Button } from "../../components/ui/Button";

interface FAQItem {
  id: number;
  question: string;
  answer: ReactNode;
}

const CATEGORIES = [
  {
    icon: Store,
    title: "Configuração da Loja",
    desc: "Aprende a alterar o domínio, moeda, horário e dados gerais da tua conta.",
  },
  {
    icon: Package,
    title: "Produtos & Catálogo",
    desc: "Como adicionar produtos, gerir categorias e criar cupões de desconto.",
  },
  {
    icon: MessageSquare,
    title: "Vendas via WhatsApp",
    desc: "Configura o teu número para receberes pedidos diretamente no teu telemóvel.",
  },
];

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Como posso ligar o meu próprio domínio (ex: minhaloja.ao)?",
    answer: (
      <>
        Para ligar um domínio personalizado, precisas de ter o plano{" "}
        <strong className="text-ink">Premium</strong> ativo. Acessa as{" "}
        <strong className="text-ink">Configurações &gt; Domínio</strong> e segue o
        passo a passo para alterar os CNAME e DNS do teu fornecedor de domínio.
      </>
    ),
  },
  {
    id: 2,
    question: "Como recebo os pagamentos das vendas?",
    answer: (
      <>
        Os pedidos são direcionados para o WhatsApp que configurares nas{" "}
        <strong className="text-ink">Configurações da Loja</strong>. Combinas os
        métodos de pagamento (Transferência, Express, etc.) diretamente com o teu
        cliente.
      </>
    ),
  },
  {
    id: 3,
    question: "Posso alterar a moeda da loja depois de criada?",
    answer: (
      <>
        Sim! Vai a <strong className="text-ink">Configurações &gt; Informações da
        Loja</strong>, altera o campo <em>Moeda</em> (ex: Kwanza AOA) e clica em{" "}
        <strong className="text-ink">Guardar alterações</strong>.
      </>
    ),
  },
];

export function HelpCenter() {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const filteredFaq = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqData;
    return faqData.filter((item) => item.question.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <div className="-mt-1 mb-7">
        <PageHeader
          title="Central de ajuda"
          subtitle="Encontra respostas rápidas ou fala diretamente com o suporte"
        />
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Pesquisa */}
        <Surface className="p-6">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar artigos, dúvidas ou tutoriais..."
              className="w-full border border-border-2 bg-muted/30 py-3 pl-10 pr-4 font-mono text-[13px] text-ink placeholder:text-ink-2 outline-none transition-colors focus:border-ink"
              style={{ borderRadius: "2px" }}
            />
          </div>
        </Surface>

        {/* Categorias */}
        <div className="grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Surface key={cat.title} className="p-5">
              <span
                className="flex h-9 w-9 items-center justify-center border border-border-2 bg-accent-soft/40 text-ink"
                style={{ borderRadius: "2px" }}
              >
                <cat.icon size={16} />
              </span>
              <h3 className="mt-3 font-heading text-[14px] font-bold tracking-[-.01em] text-ink">
                {cat.title}
              </h3>
              <p className="mt-1 font-mono text-[12px] leading-relaxed text-ink-2">
                {cat.desc}
              </p>
            </Surface>
          ))}
        </div>

        {/* FAQ */}
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center bg-accent-soft text-accent" style={{ borderRadius: "2px" }}>
              <LifeBuoy size={13} />
            </span>
            <h2 className="font-heading text-[18px] font-bold tracking-[-.01em] text-ink">
              Perguntas frequentes
            </h2>
          </div>

          <Surface className="divide-y divide-border">
            {filteredFaq.length === 0 ? (
              <p className="p-6 font-mono text-[13px] text-ink-2">
                Nenhum resultado para "{query}".
              </p>
            ) : (
              filteredFaq.map((item) => {
                const isOpen = openFaq === item.id;
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleFaq(item.id)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30"
                    >
                      <span className="font-mono text-[13px] font-semibold text-ink">
                        {item.question}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-ink-2 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 font-mono text-[12px] leading-relaxed text-ink-2">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </Surface>
        </div>

        {/* Suporte via WhatsApp */}
        <Surface className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink text-paper"
              style={{ borderRadius: "2px" }}
            >
              <MessageSquare size={16} />
            </span>
            <div>
              <h3 className="font-heading text-[15px] font-bold tracking-[-.01em] text-ink">
                Ainda tens dúvidas?
              </h3>
              <p className="mt-0.5 font-mono text-[12px] text-ink-2">
                A nossa equipa de suporte responde-te em tempo real.
              </p>
            </div>
          </div>
          <a href="https://wa.me/244956519417" target="_blank" rel="noopener noreferrer">
            <Button variant="primary">
              <MessageSquare size={15} /> Falar no WhatsApp
            </Button>
          </a>
        </Surface>
      </div>
    </div>
  );
}

export default HelpCenter;
