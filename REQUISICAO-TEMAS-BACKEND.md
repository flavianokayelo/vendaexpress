# Requisicao Backend - Temas do Dashboard (engine v2)

## Objetivo

Permitir que o dashboard liste e aplique os 10 temas do frontend (5 antigos + 5 novos), sem quebras. O frontend implementou a "engine v2": cada tema e um pacote `theme.json` (metadados) + `config.ts` (DNA de tokens/layout) + `index.tsx` (contrato). Este documento descreve o que o backend precisa de devolver para o dashboard funcionar bem.

## Temas (10)

Antigos (já aceites hoje):
- `standard` - Standard
- `luxury` - Luxury
- `minimal` - Minimal
- `fashion` - Fashion
- `electronics` - Electronics

Novos (adicionados no frontend):
- `modern` - Modern Store (candidato a tema padrao para novas lojas)
- `fashion-luxe` - Fashion Luxe
- `fresh-market` - Fresh Market
- `auto-pro` - Auto Pro
- `food-express` - Food Express

## Requisitos

1. `GET /themes` deve retornar os 10 temas (antigos + novos). O dashboard funde estes dados com o catalogo local (o frontend ja tem todos os metadados; os campos que chegarem da API ganham).
2. `PUT /stores/:id` (atualizar loja) deve aceitar os 10 `theme_id`. **Hoje a whitelist em `stores.controller.js` (perto da linha 198) so aceita os 5 antigos** — os novos sao rejeitados silenciosamente (o `theme_id` nao muda). O dashboard ja mostra um aviso gracioso quando o servidor ignora a alteracao.
3. A criacao de loja pode usar `modern` como tema padrao, se essa for a regra final do produto.
4. Mantenha compatibilidade com os temas antigos.

## Formato do manifest (alinear com o `theme.json` do frontend)

O frontend usa este shape em `src/storefront/themes/<id>/theme.json`:

```json
{
  "id": "modern",
  "name": "modern",
  "label": "Modern",
  "description": "Design contemporâneo e versátil",
  "version": "1.0.0",
  "engineVersion": "1.0",
  "contractVersion": 1,
  "preview": "/previews/modern.png",
  "author": { "name": "Venda Express", "url": "https://vendaexpress.com" },
  "tags": ["moderno", "versatil", "contemporaneo"],
  "supports": {
    "multiLanguage": false,
    "multiCurrency": false,
    "wishlist": true,
    "quickView": true,
    "liveSearch": true
  }
}
```

Campos que o dashboard consome: `id`, `name`, `label`, `description`, `version`, `author.name`, `tags`. O `supports` substituiu o antigo `capabilities` (as tags do catalogo agora vem de `tags`; a cor `accent` vem do `config.ts` local).

## Observacao para integracao

O frontend ja tem presets visuais (tokens/layout) para estes 10 IDs. Basta a API devolver os temas e aceitar o `theme_id` na loja para o dashboard conseguir aplicar o visual correspondente.
