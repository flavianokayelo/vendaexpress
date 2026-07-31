# Requisição — Novidades da loja (banners, apoio/FAQ, cupões públicos, definições)

**Data:** 2026-07-31
**Destinatário:** Equipa/plataforma que mantém o backend consumido pelo Venda Express
**API base:** `http://192.168.100.196:4000/api` (definida em `src/lib/api.ts`)
**Prioridade:** Alta

---

## 1. Contexto

O dashboard ganhou três funcionalidades novas e uma correção de um bug em produção:

1. **Legendas nos banners do Hero** — cada foto do banner pode agora ter título/subtítulo/botão.
2. **Conteúdo de Apoio/FAQ** — o lojista escreve texto real (entrega, trocas, garantia, etc.) que
   aparece no rodapé da loja.
3. **Cupões públicos** — um cupão pode ser marcado como "público" e aparece como faixa de vouchers
   na loja (código + desconto, sem inventar validade/limite de uso).
4. **Correção:** as páginas *Configurações* (nome/WhatsApp/moeda) e *Cupões* do dashboard estavam a
   escrever num mock local (`localStorage`) em vez do backend real — por isso pareciam guardar mas
   revertiam ao recarregar, e cupões criados nunca funcionavam no checkout. Já foram corrigidas para
   usar `api.stores.update` / `api.coupons.*`; esta requisição é o que falta **no backend** para que
   essas chamadas reais funcionem por completo.

O frontend já está completo e a apontar para os contratos abaixo. Falta ao backend implementar/expor
o que está descrito nesta requisição.

---

## 2. `banner_urls` passa a ser array de objectos

### 2.1 Formato antigo (antes de hoje)

```json
["https://.../banner1.jpg", "https://.../banner2.jpg"]
```

### 2.2 Formato novo (esperado a partir de agora)

```json
[
  { "url": "https://.../banner1.jpg", "title": "Black Friday", "subtitle": "Até 30% em toda a loja", "cta": "Ver ofertas" },
  { "url": "https://.../banner2.jpg" }
]
```

- Só `url` é obrigatório; `title`/`subtitle`/`cta` são opcionais.
- Limites recomendados (o frontend já corta nestes tamanhos, o backend deve validar/cortar também):
  `title` ≤ 80 caracteres, `subtitle` ≤ 160, `cta` ≤ 30.
- Máximo de **5 banners** por loja (mantém-se o limite atual).
- **Compatibilidade:** se a base de dados ainda tiver o formato antigo (array de strings) para lojas
  já existentes, o `GET` deve normalizar cada string `"url"` para `{ "url": "url" }` antes de devolver.

### 2.3 Endpoints afectados

- `PUT /api/stores/mine` — aceita `banner_urls` no formato novo (ou antigo, normalizando).
  Deve continuar a manter a coluna `banner_url` (singular) sincronizada com o `url` do primeiro
  banner, para compatibilidade com quem ainda lê só esse campo.
- `GET /api/stores/mine` — devolve `banner_urls` já normalizado (nunca strings soltas).
- `GET /api/storefront/:slug` — idem, no objecto `store` devolvido.

---

## 3. Conteúdo de Apoio/FAQ (`theme_config.footer.supportItems`)

Guardado dentro do campo já existente `stores.theme_config` (JSON), sob a chave `footer.supportItems`:

```json
{
  "footer": {
    "supportItems": [
      { "title": "Entregas e prazos", "content": "Entregamos em Luanda em 24-48h..." },
      { "title": "Trocas e devoluções", "content": "Tens até 7 dias para trocar..." }
    ]
  }
}
```

### 2.1 Regras

- `PUT /api/stores/mine` aceita `theme_config.footer.supportItems` (array de `{title, content}`).
- **Importante — não é um merge genérico de JSON arbitrário:** o backend deve tratar isto como uma
  whitelist — só escreve `footer.supportItems` dentro de `theme_config`, preservando o resto do
  `theme_config` que já lá estava (não apagar outras chaves futuras).
- Validar/cortar: `title` ≤ 60 caracteres, `content` ≤ 600 caracteres, máximo **8 itens**; descartar
  itens sem `title` ou sem `content`.
- `GET /api/stores/mine` e `GET /api/storefront/:slug` já devolvem `theme_config` tal e qual está
  guardado — não precisam de alteração além de garantir que o `supportItems` sobrevive ao round-trip.

---

## 4. Cupões públicos

### 4.1 Base de dados

```sql
ALTER TABLE coupons
  ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 0 AFTER active,
  ADD INDEX idx_coupons_store_public (store_id, is_public, active);
```

> Já aplicada na base de dados local de desenvolvimento (`venda_express`). **Falta aplicar em
> qualquer outro ambiente** (staging/produção) que exista fora desta máquina.

### 4.2 Endpoints afectados

- `POST /api/coupons` e `PUT /api/coupons/:id` — aceitam `is_public` (boolean) no corpo.
- `GET /api/coupons` — devolve `is_public` em cada cupão (já é `SELECT *`, só precisa da coluna existir).
- `GET /api/storefront/:slug` — **novo campo na resposta**, `coupons`, com os cupões públicos e activos
  da loja, só com os dados estritamente necessários para mostrar ao cliente:

```json
{
  "store": { ... },
  "categories": [ ... ],
  "products": [ ... ],
  "coupons": [
    { "code": "PROMO10", "discount_percent": 10 }
  ]
}
```

  Query sugerida:
  ```sql
  SELECT code, discount_percent FROM coupons
  WHERE store_id = ? AND active = 1 AND is_public = 1
  ORDER BY discount_percent DESC;
  ```

  Não incluir `id`, `store_id`, nem cupões inactivos/privados nesta resposta pública.

---

## 5. `PUT /api/stores/mine` — campos em falta

A página *Configurações* do dashboard edita **nome**, **WhatsApp** e **moeda** da loja, mas o
endpoint actual só tratava `whatsapp`. Faltam:

- `name` (string, obrigatório se enviado, não vazio, máx. 255 caracteres) → actualiza `stores.name`.
- `currency` (string, um de `AOA`, `USD`, `EUR`, `BRL`) → actualiza `stores.currency`; valor fora
  desta lista deve devolver `400`.

(`whatsapp` já funcionava e mantém-se sem alterações.)

---

## 6. Comportamento esperado (resumo)

| Cenário | Resultado |
|---|---|
| `PUT /stores/mine { "banner_urls": [{"url":"...","title":"Promo"}] }` | Guarda e devolve com `title` |
| Loja antiga com `banner_urls` só com strings | `GET` devolve normalizado como `{url: "..."}` |
| `PUT /stores/mine { "theme_config": { "footer": { "supportItems": [...] } } }` | Guarda só essa chave, preserva o resto do `theme_config` |
| `PUT /coupons { "code":"X10","discount_percent":10,"is_public":true }` | Cupão criado com `is_public = 1` |
| `GET /storefront/:slug` numa loja com cupões públicos activos | `coupons` no corpo da resposta, sem cupões privados/inactivos |
| `PUT /stores/mine { "name": "Nova Loja", "currency": "USD" }` | Persistido; `GET /stores/mine` reflecte de imediato |
| `PUT /stores/mine { "currency": "XXX" }` | `400`, não altera a moeda actual |

---

## 7. Testes sugeridos

```bash
# Banners com legenda
curl -X PUT http://192.168.100.196:4000/api/stores/mine \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"banner_urls":[{"url":"https://exemplo.com/b1.jpg","title":"Black Friday","cta":"Ver ofertas"}]}'

# Apoio/FAQ
curl -X PUT http://192.168.100.196:4000/api/stores/mine \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"theme_config":{"footer":{"supportItems":[{"title":"Entregas","content":"24-48h em Luanda"}]}}}'

# Cupão público
curl -X POST http://192.168.100.196:4000/api/coupons \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"code":"PROMO10","discount_percent":10,"is_public":true}'

# Confirmar que aparece na loja pública
curl http://192.168.100.196:4000/api/storefront/<slug>

# Nome e moeda
curl -X PUT http://192.168.100.196:4000/api/stores/mine \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Nova Loja","currency":"USD"}'
```

---

## 8. Critérios de aceitação

- [ ] `banner_urls` aceita e persiste `{url,title?,subtitle?,cta?}[]`; formato antigo (strings) é
      normalizado à leitura em `GET /stores/mine` e `GET /storefront/:slug`.
- [ ] `theme_config.footer.supportItems` é guardado por whitelist (não apaga outras chaves de
      `theme_config`); validado (tamanhos + máx. 8 itens).
- [ ] Migração `is_public` em `coupons` aplicada em todos os ambientes (não só dev local).
- [ ] `POST/PUT /coupons` aceitam `is_public`; `GET /coupons` devolve-o.
- [ ] `GET /storefront/:slug` devolve `coupons: [{code, discount_percent}]` só com públicos+activos.
- [ ] `PUT /stores/mine` aceita e persiste `name` e `currency` (com validação de moeda).
- [ ] Nenhuma alteração quebra pedidos antigos que não enviam estes campos novos.
