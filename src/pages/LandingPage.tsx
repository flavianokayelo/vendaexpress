import { useEffect, useState } from 'react';
import {
  ShoppingBag, Store, Zap, Globe, Palette, BarChart3, MessageCircle,
  Sparkles, Check, ArrowRight, Smartphone, CreditCard, Truck, Shield,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import type { Plan } from '../lib/types';
import { formatCurrency } from '../lib/format';

export function LandingPage({ navigate }: { navigate: (to: string) => void }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('plans').select('*').order('sort_order').then(({ data }) => {
      setPlans((data as Plan[]) ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
              <Store size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Venda Express</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Recursos</a>
            <a href="#plans" className="text-sm font-medium text-slate-600 hover:text-slate-900">Planos</a>
            <a href="#how" className="text-sm font-medium text-slate-600 hover:text-slate-900">Como funciona</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>Criar minha loja</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-100" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                <Sparkles size={14} /> Plataforma SaaS de e-commerce multi-tenant
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
                Crie a sua loja online em minutos. Venda como nunca antes.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-slate-600">
                A Venda Express é o shopping digital de Angola. Escolhe um plano, crias a tua conta e recebes
                automaticamente a tua loja com subdomínio próprio — pronta para vender.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate('/signup')}>
                  Começar agora <ArrowRight size={18} />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>Ver demonstração</Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Check size={16} className="text-blue-700" /> Sem cartão</span>
                <span className="flex items-center gap-1.5"><Check size={16} className="text-blue-700" /> Subdomínio grátis</span>
                <span className="flex items-center gap-1.5"><Check size={16} className="text-blue-700" /> Suporte em português</span>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-slate-400">joaoshop.vendaexpress.ao</span>
                </div>
                <div className="overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">João Shop</div>
                      <div className="text-xs text-slate-500">12 produtos • 48 pedidos</div>
                    </div>
                    <div className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 px-3 py-1 text-xs font-medium text-white">Ao vivo</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-lg bg-white p-3 shadow-sm">
                        <div className="mb-2 h-16 rounded bg-gradient-to-br from-slate-100 to-slate-200" />
                        <div className="h-2 w-3/4 rounded bg-slate-200" />
                        <div className="mt-1.5 h-2 w-1/2 rounded bg-blue-300" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                    <span className="text-xs text-slate-500">Vendas hoje</span>
                    <span className="text-sm font-bold text-blue-800">Kz 248.500</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <Zap size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Novo pedido</div>
                    <div className="text-xs text-slate-500">há 2 minutos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {[
            { label: 'Lojas criadas', value: '1.200+' },
            { label: 'Pedidos processados', value: '85 mil' },
            { label: 'Produtos cadastrados', value: '320 mil' },
            { label: 'Uptime garantido', value: '99,9%' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-slate-900">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tudo o que precisas para vender online</h2>
          <p className="mt-3 text-slate-600">Uma plataforma completa com todas as ferramentas num só lugar.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: ShoppingBag, title: 'Gestão de produtos', desc: 'Adiciona produtos, categorias, preços, estoque e fotos em segundos.' },
            { icon: CreditCard, title: 'Pagamentos', desc: 'Recebe pagamentos por transferência, multicaixa express e dinheiro.' },
            { icon: Truck, title: 'Entregas', desc: 'Configura zonas de entrega e taxas de envio personalizadas.' },
            { icon: Palette, title: 'Temas personalizáveis', desc: 'Escolhe as cores e o visual da tua loja com um clique.' },
            { icon: BarChart3, title: 'Relatórios', desc: 'Acompanha vendas, pedidos e desempenho em tempo real.' },
            { icon: MessageCircle, title: 'WhatsApp integrado', desc: 'Recebe notificações de pedidos diretamente no teu WhatsApp.' },
            { icon: Globe, title: 'Domínio próprio', desc: 'Conecta o teu domínio personalizado e fica com identidade própria.' },
            { icon: Smartphone, title: 'Responsivo', desc: 'A tua loja funciona perfeitamente no telemóvel, tablet e desktop.' },
            { icon: Shield, title: 'Seguro e isolado', desc: 'Cada loja tem os seus dados isolados e protegidos.' },
          ].map((f) => (
            <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-gradient-to-br group-hover:from-blue-700 group-hover:to-blue-900 group-hover:text-white">
                <f.icon size={22} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Como funciona</h2>
            <p className="mt-3 text-slate-400">Do registo à primeira venda em 4 passos.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { step: '01', title: 'Escolhe um plano', desc: 'Starter, Business ou Premium — o que se adequa ao teu negócio.' },
              { step: '02', title: 'Cria a tua conta', desc: 'Regista-te e o sistema cria automaticamente a tua loja e subdomínio.' },
              { step: '03', title: 'Configura a loja', desc: 'Adiciona produtos, escolhe o tema e define os pagamentos e entregas.' },
              { step: '04', title: 'Começa a vender', desc: 'Divulga o teu link e recebe pedidos. A Venda Express fica invisível.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="mb-3 text-4xl font-bold text-blue-500">{s.step}</div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Planos simples e transparentes</h2>
          <p className="mt-3 text-slate-600">Preços em Kwanzas. Sem taxas escondidas. Cancela quando quiseres.</p>
        </div>
        {loading ? (
          <div className="mt-12 text-center text-slate-400">A carregar planos...</div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan, idx) => {
              const isPopular = idx === 1;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-8 transition-all ${
                    isPopular ? 'border-blue-700 bg-white shadow-2xl md:-translate-y-2' : 'border-slate-200 bg-white hover:shadow-lg'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-700 to-blue-900 px-3 py-1 text-xs font-medium text-white">
                      Mais popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">{formatCurrency(plan.price)}</span>
                    <span className="text-sm text-slate-500">/mês</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {plan.product_limit ? `Até ${plan.product_limit} produtos` : 'Produtos ilimitados'}
                  </p>
                  <Button
                    className="mt-6 w-full"
                    variant={isPopular ? 'primary' : 'outline'}
                    onClick={() => navigate(`/signup?plan=${plan.id}`)}
                  >
                    Escolher {plan.name}
                  </Button>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check size={18} className="mt-0.5 shrink-0 text-blue-700" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Pronto para começar a vender?</h2>
          <p className="mt-3 text-blue-100">Junta-te a centenas de lojistas que já estão a vender online com a Venda Express.</p>
          <Button size="lg" className="mt-8 bg-white text-blue-800 hover:bg-blue-50" onClick={() => navigate('/signup')}>
            Criar minha loja grátis <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-white">
              <Store size={16} />
            </div>
            <span className="font-bold text-slate-900">Venda Express</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 Venda Express. A plataforma de e-commerce de Angola.</p>
        </div>
      </footer>
    </div>
  );
}
