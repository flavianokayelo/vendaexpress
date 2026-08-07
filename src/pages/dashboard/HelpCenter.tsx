import React, { useState } from "react";
import {
  Search,
  Store,
  Package,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Como posso ligar o meu próprio domínio (ex: minhaloja.ao)?",
    answer: (
      <>
        Para ligar um domínio personalizado, precisas de ter o plano{" "}
        <strong>Premium</strong> ativo. Acessa as{" "}
        <strong>Configurações &gt; Domínio</strong> e segue o passo a passo para
        alterar os CNAME e DNS do teu fornecedor de domínio.
      </>
    ),
  },
  {
    id: 2,
    question: "Como recebo os pagamentos das vendas?",
    answer: (
      <>
        Os pedidos são direcionados para o WhatsApp que configurares nas{" "}
        <strong>Configurações da Loja</strong>. Combinas os métodos de pagamento
        (Transferência, Express, etc.) diretamente com o teu cliente.
      </>
    ),
  },
  {
    id: 3,
    question: "Posso alterar a moeda da loja depois de criada?",
    answer: (
      <>
        Sim! Vai a <strong>Configurações &gt; Informações da Loja</strong>,
        altera o campo <em>Moeda</em> (ex: Kwanza AOA) e clica em{" "}
        <strong>Guardar alterações</strong>.
      </>
    ),
  },
];

export const HelpCenter: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen text-[#2d2b2a] font-sans flex flex-col antialiased">
      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        {/* Hero Section / Pesquisa */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-semibold mb-4 border border-[#7c3aed]/20">
            Suporte 24/7
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-3 tracking-tight">
            Como podemos ajudar-te hoje?
          </h1>
          <p className="text-[#716e69] max-w-lg mx-auto text-sm md:text-base mb-8">
            Encontra respostas rápidas para configurar a tua loja, gerir
            produtos e integrar pagamentos.
          </p>

          {/* Barra de Pesquisa */}
          <div className="relative max-w-2xl mx-auto group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#716e69] group-focus-within:text-[#7c3aed] transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar artigos, dúvidas ou tutoriais..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-[#e2dcd0] shadow-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all text-sm"
            />
          </div>
        </section>

        {/* Categorias Principais (Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-xl bg-[#f2eee5] border border-[#e2dcd0] hover:border-[#7c3aed] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-white border border-[#e2dcd0] flex items-center justify-center text-[#7c3aed] mb-4 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-[#111111] mb-1">
              Configuração da Loja
            </h3>
            <p className="text-xs text-[#716e69] leading-relaxed">
              Aprende a alterar o domínio, moeda, horário e dados gerais da tua
              conta.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#f2eee5] border border-[#e2dcd0] hover:border-[#7c3aed] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-white border border-[#e2dcd0] flex items-center justify-center text-[#7c3aed] mb-4 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-[#111111] mb-1">
              Produtos & Catálogo
            </h3>
            <p className="text-xs text-[#716e69] leading-relaxed">
              Como adicionar produtos, gerir categorias e criar cupões de
              desconto.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#f2eee5] border border-[#e2dcd0] hover:border-[#7c3aed] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-white border border-[#e2dcd0] flex items-center justify-center text-[#7c3aed] mb-4 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-[#111111] mb-1">
              Vendas via WhatsApp
            </h3>
            <p className="text-xs text-[#716e69] leading-relaxed">
              Configura o teu número para receberes pedidos diretamente no teu
              telemóvel.
            </p>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-[#7c3aed] rounded-full"></div>
            <h2 className="text-xl font-bold text-[#111111]">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((item) => {
              const isOpen = openFaq === item.id;
              return (
                <div
                  key={item.id}
                  className="border border-[#e2dcd0] rounded-xl bg-white overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(item.id)}
                    className="w-full p-5 text-left font-medium text-[#111111] flex justify-between items-center hover:bg-[#f8f6f0]/50 transition-colors"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#716e69] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#716e69] leading-relaxed animate-fadeIn">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Banner de Suporte no WhatsApp */}
        <section className="bg-[#111111] text-white rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#7c3aed]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left z-10">
            <h3 className="text-xl font-bold">Ainda tens dúvidas?</h3>
            <p className="text-xs text-gray-400 max-w-md">
              A nossa equipa de suporte está pronta para te ajudar a alavancar a
              tua loja em tempo real.
            </p>
          </div>

          <a
            href="https://wa.me/244956519417"
            target="_blank"
            rel="noopener noreferrer"
            className="z-10 bg-[#7c3aed] hover:bg-violet-600 text-white font-medium text-xs px-6 py-3.5 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-purple-900/40"
          >
            <MessageSquare className="w-4 h-4" /> Falar no WhatsApp
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2dcd0] py-6 text-center text-xs text-[#716e69]">
        © 2026 Venda Express. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default HelpCenter;
