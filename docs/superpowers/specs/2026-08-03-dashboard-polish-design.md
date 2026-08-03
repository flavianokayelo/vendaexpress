# Desenho — Polimento do Dashboard (Design & Performance)

Data: 2026-08-03 · Escopo: **apenas dashboard de gestão** (fase 1; montra/landing/builder ficam para fase seguinte).

## Objetivo

Aplicar o checklist de design e performance ao dashboard, evoluindo o sistema de design existente em vez de reinventá-lo. Preservar o DNA visual atual (mono, bordas afiadas, radius 2px, accent como ponto de cor) e amolecer com elevation sutil, transições mais suaves e componentes polidos. Toda a peça nova assenta numa camada de tokens e primitivas reutilizáveis, para que nenhum componente tenha aparência divergente entre páginas.

## Direção visual

- Manter o DNA: `font-mono`, bordas afiadas, `2px` radius, `accent` como cor de ponto.
- Amolecer: elevation sutil nos cards, transitions mais suaves, skeletons com o mesmo tipo de canto.
- Decisão: "refinar identidade atual" + "suavizar para estilo comercial" em conjunto.
- Feedback de ações: sistema de toasts global + botões com estados.

## Abordagem

**Opção A — Primitivas compartilhadas + camada de aplicação.** Construir a fundação (tokens + primitivas em `src/components/ui/`) e depois aplicar página a página. Fundamental para "componentes reutilizáveis" e "código limpo".

## Roadmap (fases)

### Fase 1 — Fundação (tokens + Surface)
### Fase 2 — Primitivas (Skeleton, Toast, Button, Feedback)
### Fase 3 — Aplicação em todas as páginas do dashboard
### Fase 4 — Lazy loading, code splitting, Suspense, performance
### Fase 5 — Polimento visual (micro-animações, hover, focus, keyboard)

Cada fase é um commit verificável (`bun run build` + lint + typecheck) antes de avançar.

---

## Fase 1 — Fundação

### 1.1 Tokens de Motion — `src/lib/motion.ts` (novo)
Fonte única de durations e springs; nenhuma animação usa durações hardcoded dispersas.

```ts
export const Motion = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  spring: { type: "spring", stiffness: 260, damping: 22 },
};
```

Todo uso:
```tsx
transition={Motion.spring}
transition={{ duration: Motion.normal }}
```

### 1.2 Tokens de Sombra — `tailwind.config.js`
Evitar `shadow-md/lg/xl` dispersos; tokens comerciais subtis:
- `shadow-card` → `0 2px 8px rgb(0 0 0 / .04)`
- `shadow-floating` → `0 8px 24px rgb(0 0 0 / .08)`
- `shadow-popover` → `0 12px 32px rgb(0 0 0 / .12)`

(Manter `soft`/`soft-lg`/`theme-*` já existentes; adicionar os novos ao `theme.boxShadow`.)

### 1.3 Presets de animação — `src/lib/animations.ts` (novo)
Variants prontos para `motion`:
`fade`, `slideUp`, `slideDown`, `scale`, `pop`, `toast`, `modal`, `dropdown`.

```ts
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: Motion.normal },
};
```

### 1.4 Wrappers declarativos — `src/components/ui/Animation.tsx` (novo)
Nunca usar `AnimatePresence` manualmente em páginas; wrappers encapsulam:

- `<Fade>…</Fade>` — fade simples.
- `<AnimatedCard>…</AnimatedCard>` — fade + slideUp para cards.
- `<AnimatedList>…</AnimatedList>` — stagger para listas/tabelas.
- `<PageTransition>…</PageTransition>` — transição de conteúdo ao trocar de página.

Trocar o comportamento futuro = editar o wrapper, não as páginas.

### 1.5 Surface — `src/components/ui/Surface.tsx` (novo)
Base única de cartão. Internamente: `rounded-[2px]`, `border`, `bg-card/paper`, `shadow-card`, `transition-all`, `duration` normal.

```tsx
<Surface>
  {/* StatCard, Table, EmptyState, Modal, Drawer usam a mesma base */}
</Surface>
```

---

## Fase 2 — Primitivas

### 2.1 `Skeleton.tsx` (novo)
Componentes de esqueleto que **copiam o layout real** (o cérebro percebe a página como carregada mais rápido):
- `Skeleton` — bloco base `animate-pulse bg-ink/[0.06]`, mesmo radius.
- `SkeletonText`, `SkeletonCircle`, `SkeletonImage`.
- `SkeletonCard` — placeholder de cartão (ícone + título + valor + gráfico).
- `SkeletonStatCard` — placeholder de `StatCard`.
- `SkeletonTableRows({ rows, cols })` — corpo de tabela placeholder.

### 2.2 `Toast.tsx` (novo)
- `ToastProvider` + hook `useToast()`.
- API: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`.
- **Fila de toasts**: máximo **3 visíveis**, os restantes aguardam (evita poluição).
- Stack no canto inferior direito; entrada/saída com `motion` (variants `toast`).
- Auto-dismiss ~4s, botão de fechar, ícone por tipo, estilo mono/afiado.

### 2.3 `Button.tsx` (melhorado)
Estados de feedback: `default` → `loading` → `success` → `error` → volta.
- `loading` → `Spinner` + `disabled` + `cursor-wait`.
- `success` → `Check` por ~1.5s.
- `error` → `AlertCircle`/tinta danger por ~1.5s.
- Transições de estado suaves (ícone crossfade).

### 2.4 `Feedback.tsx` (melhorado)
- `Spinner` ganha prop `label`.
- `PageLoader` elegante: logo da loja + nome + spinner animado (não só spinner).
- `EmptyState` com **variantes por tipo** (ícone correto embutido):
  `products`, `orders`, `customers`, `coupons`, `analytics`, `search`, `filter`, `notFound` (404).
  Ícone em quadrado com ring (consistente com `StatCard`), variantes de tamanho.

### 2.5 `Modal.tsx` (melhorado)
- Entrada/saída com `motion` (variants `modal`: fade + scale) via `AnimatePresence` encapsulado no wrapper.

### 2.6 Hook global — `useFeedback()` (novo, `src/lib/useFeedback.ts`)
Orquestra feedback em toda a app:
```ts
const feedback = useFeedback();
feedback.success("Guardado");
feedback.error("Falhou");
feedback.loading();
```
Internamente comunica com Toast, Button, Spinner — tudo centralizado.

---

## Fase 3 — Aplicação nas páginas

- **Overview**: skeletons dos 4 `StatCard` + card de receita + atalhos; substituir `A carregar...`.
- **Products / Orders / Customers / Categories / Coupons / Pages**: `SkeletonTableRows` no lugar de `A carregar...`; EmptyStates com variantes por tipo.
- **Feedback em ações**: trocar `console.error`/inline por `toast.success/error` em criar/editar/eliminar (produto, categoria, cupão, pedido, página, settings, aparência); submits com `Button loading/success/error`.
- **`Surface`** passa a ser a base de StatCard, tabelas, EmptyState e cards.

---

## Fase 4 — Performance

- **`React.lazy`** no carregamento das páginas dentro de `DashboardPage` (code-splitting).
- Cada página com **`<Suspense fallback={<PageSkeleton/>}>`** usando o skeleton real da própria página (não spinner).
- **`<img>`** do dashboard com `loading="lazy"` + `decoding="async"` + `width/height` ou ratio fixo (evita CLS).

---

## Fase 5 — Polimento visual

- **Micro-animações**: hovers com `Motion.fast`, foco visível, transitions consistentes.
- **Page transition**: só o conteúdo anima (`PageTransition` no content), nunca Sidebar nem Header.
- **Dashboard responsivo preparado** (desktop-first, pronto a ativar no futuro): Sidebar → Icon Sidebar → Drawer → Bottom Sheet. Sem implementar layouts novos agora; só garantir que a estrutura não impede a evolução.

---

## Verificação (todas as fases)

- `bun run build` OK.
- Lint e typecheck dos ficheiros alterados sem novos erros.
- Sem regressões nos contratos backend (sem alterações de negócio em `api.ts`/`types.ts`).
- Fase seguinte (fora de escopo): montra, landing page, builder.

## Áreas do checklist cobertas

- Loading e skeletons ✓ (Skeleton kit que espelha layout, PageLoader elegante, Suspense por página)
- Micro-animações ✓ (tokens Motion, presets, wrappers declarativos, page transition só no content)
- Performance ✓ (lazy loading de `img`, `React.lazy`, Suspense, tokens de sombra)
- Feedback visual ✓ (toasts com fila, botões com 4 estados, useFeedback)
- Estados vazios custom ✓ (EmptyState com variantes por tipo)