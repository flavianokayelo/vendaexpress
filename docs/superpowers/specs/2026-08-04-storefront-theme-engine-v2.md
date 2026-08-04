# Design — Storefront Theme Engine v2

**Data:** 2026-08-04
**Estado:** Implementado (backend NÃO tocado; apenas documentado)

## Contexto

A engine v1 construía cada tema com `createStorefrontTheme(manifest)` — todos partilhavam os mesmos componentes e presets duplicados em `themePresets.ts`. O tema não tinha identidade própria (era só metadados + cor) e o merge `defaultTheme + theme_config` deixava o lojista alterar layout, quebrando a identidade visual.

A engine v2 transforma cada tema num **pacote completo** e autossuficiente:

```
src/storefront/themes/<id>/
├── theme.json    # metadados (author, tags, supports, contractVersion)
├── config.ts     # DNA tripartido: tokens | layout | capabilities (só dados)
└── index.tsx     # contrato registado no ThemeRegistry (componentes + pages)
```

## Decisões

### 1. Pacote tripartido (`config.ts`)
- **tokens**: cores, tipografia, raio, espaçamento, sombra, botões, card.
- **layout**: header/footer/hero/banners/home.sections + variants (productCard/productGrid). Locked pelo tema.
- **capabilities**: flags de runtime (wishlist, quickView, liveSearch...).

Só dados, sem lógica. `themePresets.ts` eliminado; os presets migraram para os `config.ts` (10 temas).

### 2. Resolução final (`resolveConfig.ts`)
Precedência (fonte de verdade):
1. `defaultTheme` (Aurora, base);
2. `config.ts` do tema escolhido (tokens + layout);
3. `theme_config` da loja — **SÓ `tokens.*` e `capabilities.*`** (layout LOCKED);
4. `theme_primary` — atalho de cor, só se `theme_config` não definir `colors.primary`.

Regras de merge: objectos fundem-se profundamente; **arrays são substituídos inteiros** (footer.columns, hero.slides, home.sections). `mergeTheme(store)` agora delega em `resolveConfig(store?.theme_id, store)`.

### 3. ThemeRegistry + Validator
- `registerTheme()` veta temas quebrados (issues de nível ERROR) e ids duplicados (mantém o primeiro, avisa).
- `resolveTheme(id)` / `resolveThemeId(id)`: fallback previsível para `standard`.
- `getThemeComponents(id)`: fallback componente-a-componente para o standard.
- `getThemePages(id)`: Home obrigatória; páginas opcionais (`OPTIONAL_PAGES`) com fallback partilhado.
- Validator em 3 níveis (`error`/`warning`/`info`) com códigos; `hasBlockingIssues()` decide a entrada no registry.

### 4. Contrato versionado
- `ENGINE_VERSION = "1.0"` (engine) e novo `CONTRACT_VERSION = 1` (shape do contrato).
- `ThemeContract` ganhou `config: ThemeConfigData`.
- `ThemePages` abriu: Home obrigatória; Product, Category, Search, Cart, Collection, Brand, Blog, Article, Wishlist, Checkout, Account opcionais.

### 5. CartAdapter partilhado
O antigo CartAdapter de cada tema e o da factory eram idênticos. Moveu-se para `src/storefront/themes/shared/CartAdapter.tsx`; `createStorefrontTheme.tsx` foi eliminado.

### 6. Catálogo e dashboard
- `catalog.ts` deriva tags/author de `theme.json` e `accent` (cor primária) de `config.ts`.
- `ThemesPage.tsx`: gradiente de preview usa a cor `accent` do tema (sem `PREVIEW_GRADIENTS` hardcoded); após aplicar, valida que o `theme_id` do store refletiu — se o backend rejeitar (whitelist), mostra aviso gracioso.
- `StorefrontPage.tsx`: usa `resolveConfig(id, store)` em vez de `mergeTheme(store)`; default passa a `standard` (não `modern`).

## Ficheiros-chave
- `src/storefrontTheme/types.ts` — tipos tripartidos (`ThemeTokens`/`ThemeLayout`/`ThemeCapabilities`/`ThemeConfigData`).
- `src/storefrontTheme/resolveConfig.ts` — resolução final (default → tema → loja → theme_primary).
- `src/storefrontTheme/mergeTheme.ts` — delega em `resolveConfig`.
- `src/storefront/contract.ts` — `CONTRACT_VERSION`, `OPTIONAL_PAGES`, `ThemeContract.config`.
- `src/storefront/engine/ThemeValidator.ts` — validação 3 níveis.
- `src/storefront/engine/ThemeRegistry.ts` — registo com veto + fallbacks.
- `src/storefront/themes/shared/CartAdapter.tsx` — Cart partilhado.
- `src/storefront/themes/<id>/{theme.json,config.ts,index.tsx}` — os 10 pacotes.

## Fora de âmbito (backend)
- `venda-express-backend/src/controllers/stores.controller.js` (~linha 198) só aceita os 5 temas antigos; documentado em `REQUISICAO-TEMAS-BACKEND.md` (não editado).
- `GET /themes` deve passar a devolver os 10; requisição anexa.
