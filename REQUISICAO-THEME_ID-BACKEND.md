# Requisição — Suporte a `theme_id` no backend (API externa do Venda Express)

**Data:** 2026-07-31
**Destinatário:** Equipa/plataforma que mantém o backend consumido pelo Venda Express
**API base:** `http://192.168.100.196:4000/api` (definida em `src/lib/api.ts`)
**Prioridade:** Alta

---

## 1. Contexto

O dashboard tem uma página **Temas** (`ThemesPage`) que permite escolher o visual da loja.
Ao selecionar um tema, o frontend faz `PUT /stores/mine` com `theme_id` e, ao carregar a loja
pública, aplica esse tema com base no `theme_id` devolvido pelos endpoints públicos.

O frontend já está completo e funcional (presets em `src/storefrontTheme/themePresets.ts`).
Esta requisição é o que falta **no backend** para fechar a cadeia: guardar e devolver `theme_id`.

---

## 2. Contrato esperado (o que o frontend usa hoje)

### 2.1 `GET /api/themes`

Lista de temas com metadados + contagem de uso. Resposta esperada (array):

```json
[
  {
    "id": "standard",
    "name": "Standard",
    "label": "Standard",
    "description": "Tema clássico",
    "tags": ["classic"],
    "version": "1.0.0",
    "author": "Venda Express",
    "in_use": 3
  }
]
```

- **`id` obrigatório** para os 5 temas (são as chaves dos presets no frontend):
  `standard`, `luxury`, `minimal`, `fashion`, `electronics`.
- `in_use` = nº de lojas com esse `theme_id` (o frontend mostra "· N loja(s)").

### 2.2 `PUT /api/stores/mine`

Guardar o tema escolhido.

```json
{ "theme_id": "luxury" }
```

- Deve **persistir** `theme_id` na loja autenticada.
- `theme_id` inválido (fora da lista) → **ignorado, mantendo o valor anterior** (ou `400` com mensagem).
- Deve devolver a loja atualizada (incluindo `theme_id`).
- Não pode quebrar clientes antigos que **não** enviam `theme_id`.

### 2.3 `GET /api/stores/mine`

Devolver a loja autenticada **incluindo `theme_id`** (usado pela página Temas e pelo `mergeTheme`).
Se o backend também suportar `theme_config` e/ou `theme_primary`, devem vir incluídos.

### 2.4 `GET /api/storefront/:slug` e `GET /api/storefront/:slug/products/:id`

O objeto `store` devolvido **deve incluir `theme_id`** — é aqui que o storefront público lê o tema
para o aplicar (via `mergeTheme(store)`).

---

## 3. Base de dados

Adicionar a coluna à tabela `stores`:

```sql
ALTER TABLE stores
  ADD COLUMN theme_id VARCHAR(60) NOT NULL DEFAULT 'standard' AFTER currency,
  ADD INDEX idx_stores_theme_id (theme_id);
```

- **Default `'standard'`** → lojas novas nascem com o tema standard sem precisar de backfill.
- **Nota (instalações novas):** incluir a coluna também no schema de criação de raiz, para que uma
  base criada do zero não falhe no `INSERT` da loja.

---

## 4. Comportamento esperado

| Cenário | Resultado |
|---|---|
| Loja nova (registada) | `theme_id = 'standard'` por omissão |
| `PUT /stores/mine { "theme_id": "luxury" }` | Guarda `luxury`; resposta devolve `theme_id: "luxury"` |
| `PUT /stores/mine { "theme_id": "desconhecido" }` | Ignorado (mantém anterior) ou `400` |
| `GET /stores/mine` | Devolve `theme_id` |
| `GET /storefront/:slug` | `store.theme_id` presente |
| `GET /themes` | Devolve os 5 temas com `in_use` |

---

## 5. Testes sugeridos (backend)

```bash
# 1. Listar temas
curl http://192.168.100.196:4000/api/themes

# 2. Trocar tema
curl -X PUT http://192.168.100.196:4000/api/stores/mine \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"theme_id":"luxury"}'

# 3. Confirmar persistência
curl http://192.168.100.196:4000/api/stores/mine -H "Authorization: Bearer <TOKEN>"

# 4. Storefront público devolve o tema
curl http://192.168.100.196:4000/api/storefront/<slug>
```

---

## 6. Critérios de aceitação

- [ ] `PUT /stores/mine` aceita e persiste `theme_id`; inválido é ignorado (ou `400`) sem quebrar.
- [ ] `GET /stores/mine` devolve `theme_id`.
- [ ] `GET /storefront/:slug` (e produto) devolvem `theme_id` no objeto `store`.
- [ ] `GET /themes` devolve os 5 temas (`standard`, `luxury`, `minimal`, `fashion`, `electronics`) com `in_use`.
- [ ] Lojas novas têm `theme_id = 'standard'` por omissão.
- [ ] Backwards-compatible: pedidos sem `theme_id` não são afetados.
