# Desenho — Polimento do Dashboard (Design & Performance)

Data: 2026-08-03 · Escopo: **apenas dashboard de gestão** (fase 1; montra/landing/builder ficam para fase seguinte).

## Objetivo

Aplicar o checklist de design e performance ao dashboard, preservando a identidade visual atual (DNA mono, bordas afiadas, radius 2px, accent como cor de ponto), mas amolecendo com elevation sutil, transições mais suaves e componentes polidos. Priorizar consistência e reutilização.

## Direção visual

- Manter o DNA atual: `font-mono`, bordas afiadas, `2px` de radius, `accent` como ponto de cor.
- Amolecer: elevation sutil nos cards, transitions mais suaves, skeletons com o mesmo tipo de canto.
- Direção decidida: "refinar identidade atual" + "suavizar para estilo comercial" em conjunto.

## Abordagem

**Opção A — Primitivas compartilhadas + camada de aplicação.** Construir kit de primitivas reutilizáveis (`src/components/ui/`) e depois aplicar página a página. Fundamental para "componentes reutilizáveis" e "código limpo" do checklist.

## Secção 1 — Primitivas base (`src/components/ui/`)

### `Skeleton.tsx` (novo)
- `Skeleton` — bloco base com `animate-pulse bg-ink/[0.06]`, mesmo `2px` radius.
- `SkeletonText` — linha de texto placeholder.
- `SkeletonCircle` — círculo placeholder (avatares/ícones).
- `SkeletonImage` — figura placeholder.
- `SkeletonCard` — cartão placeholder.
- `SkeletonTableRows({ rows, cols })` — corpo de tabela placeholder.

### `Toast.tsx` (novo)
- `ToastProvider` + hook `useToast()`.
- API: `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg)`.
- Stack no canto inferior direito; entrada/saída com `motion` (AnimatePresence).
- Auto-dismiss ~4s, botão de fechar, ícone por tipo, estilo mono/afiado consistente.

### `Button.tsx` (melhorado)
- Novas props `loading?: boolean` e `success?: boolean`.
- `loading` → `Spinner` + `disabled` + `cursor-wait`.
- `success` → `Check` por ~1.5s (feedback de conclusão).

### `Feedback.tsx` (melhorado)
- `Spinner` ganha prop opcional `label`.
- `PageLoader` deixa de ser só um spinner: logo da loja + nome + spinner animado.
- `EmptyState` melhorado: ícone em quadrado com ring (consistente com `StatCard`), variantes de tamanho.

### `Modal.tsx` (melhorado)
- Entrada/saída com `motion` (fade + scale) via `AnimatePresence`.

## Secção 2 — Aplicação às páginas

- **Overview**: skeletons dos 4 `StatCard` + card de receita + atalhos; substituir `A carregar...`.
- **Products / Orders / Customers / Categories / Coupons / Pages**: `SkeletonTableRows` no lugar de `A carregar...`; manter EmptyStates uniformizando ícones em quadrado com ring.
- **Feedback em ações**: trocar `console.error`/inline por `toast.success/error` em criar/editar/eliminar (produto, categoria, cupão, pedido, página, settings, aparência); submits com `Button loading/success`.
- **Micro-animações**: fade-in do conteúdo ao trocar de página (`motion` keyed por `page` no `DashboardPage`).
- **Performance**: `<img>` do dashboard com `loading="lazy"` + `decoding="async"`; `React.lazy` no carregamento das páginas dentro de `DashboardPage` (code-splitting).

## Secção 3 — Verificação

- `bun run build` OK.
- Lint e typecheck dos ficheiros alterados sem novos erros.
- Sem regressões nos contratos backend (sem alterações de negócio em `api.ts`/`types.ts`).
- Fase seguinte (fora de escopo): montra, landing page, builder.

## Áreas do checklist cobertas

- Loading e skeletons ✓ (Skeleton kit, PageLoader elegante)
- Micro-animações ✓ (motion em modais, toasts, fade-in)
- Performance/design ✓ (lazy loading de `img`, `React.lazy`)
- Feedback visual ✓ (toasts + botões com estado)
- Estados vazios custom ✓ (EmptyState melhorado, consistente)