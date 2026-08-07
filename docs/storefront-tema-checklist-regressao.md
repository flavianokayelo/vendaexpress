# Checklist de regressão — novo tema de Storefront

Usa esta checklist sempre que criares ou editares um tema em `src/storefront/themes/`.
Serve para garantir que o novo tema não quebra o fluxo de compra nem o engine v2.

## Pré-condições por tema

- [ ] O tema importa **só** `lib/` (core), `components/ui`, `components/theme`, `components/storefront` e `src/storefront/contract` — NUNCA outro tema (`../standard/...`, `../luxury/...`, etc.).
- [ ] O tema **não faz fetch nem chama a API** — recebe tudo via `StorefrontApi` (props). Nenhum `fetch(`, `axios`.
- [ ] Assina o contrato: `engineVersion === ENGINE_VERSION` e `contractVersion === CONTRACT_VERSION` no manifest.
- [ ] Implementa `Header`, `Footer`, `ProductCard`, `ProductGrid`, `Cart` e a página `Home`.
- [ ] Não reimplementa carrinho/checkout — usa o hook core `useCheckout` além de `useCart`/`useWishlist`.

## Fluxo de venda (testar numa loja com o tema aplicado)

- [ ] Criar loja com o tema -> abrir a Home sem erros de runtime.
- [ ] Ver categorias (navegação/filtro) funcionando.
- [ ] Abrir detalhe do produto (imagem, preço, condição/estoque).
- [ ] Adicionar ao carrinho (badge/conta `cartCount` atualiza) e alterar quantidade.
- [ ] Aplicar cupom válido e cupom inválido (feedback de erro).
- [ ] Checkout -> confirma pedido -> abre WhatsApp com a mensagem formatada.
- [ ] Sem WhatsApp configurado, o botão "fazer pedido" mostra o aviso `whatsappMissing`.
- [ ] Drawers de carrinho e wishlist abrem/fecham.

## Troca de tema

- [ ] Trocar para o tema novo a partir de outro tema; nada quebrou (fallback não foi acionado).
- [ ] Voltar ao tema anterior; renderização intacta.
- [ ] `AppearancePage`/builder mostram DNA do tema (tokens) sem quebrar.

## Regressão do contrato (se mexeste no engine/registry)

- [ ] `registerThemes()` povoa o registry sem avisos de bloqueio (bus "Nenhum tema registado").
- [ ] `ThemesValidator` não acusa ERROR que leve o tema a fallback standard por engano.
- [ ] Fallback componente-a-componente e página-a-página (standard) continua a renderizar se uma peça faltar.

## Qualidade de código

- [ ] `npx tsc --noEmit -p tsconfig.app.json` sem erros.
- [ ] `npx eslint src/storefront/themes` sem erros (avisos de fast-refresh são aceitáveis).
- [ ] `npm run build` passa; confirma que o tema entrou num chunk próprio (não inchou o chunk de outro).
- [ ] Sem lógica duplicada que deva viver num hook core (`useCheckout`, `useHorizontalRail`, `useAdded...`).