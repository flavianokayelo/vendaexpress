# Requisição Backend — Configurações da loja (Perfil, Endereço, Horários)

**Data:** 2026-08-08
**Destinatário:** Equipa/plataforma que mantém o backend consumido pelo Venda Express
**API base:** `http://192.168.100.196:4000/api` (definida em `src/lib/api.ts`)
**Prioridade:** Alta

---

## 1. Contexto

A página **Configurações** do dashboard tem quatro secções:

| Secção | Campos | Hoje | Falta |
|---|---|---|---|
| Meu Perfil | nome, e-mail, telefone | só `localStorage` (`ve_profile_<slug>`) | guardar no servidor |
| Endereço | província, município, rua/bairro, referência, ponto de retirada | só `localStorage` (`ve_address_<slug>`) | guardar no servidor |
| Horários | abertura/fecho por dia (Seg.–Dom.) | só `localStorage` (`ve_hours_<slug>`) | guardar no servidor |
| Informações da Loja | nome, WhatsApp, moeda, descrição | ✅ `api.stores.update` | nada (já funciona) |

O frontend está pronto e mantém uma cópia local apenas como cache/falback a funcionar em modo offline.
**Falta ao backend** o necessário para estes dados serem persistidos na base de dados e expostos ao
público (endereço/horários no storefront), para que deixem de depender do browser do lojista.

Quando o backend implementar o que está abaixo, o frontend passa a chamar o servidor
(não é necessária nova entrega de frontend para receber esta requisição).

---

## 2. Perfil do dono (tabela `users`)

### 2.1 Migração

```sql
ALTER TABLE users
  ADD COLUMN name     VARCHAR(255) NULL AFTER email,
  ADD COLUMN whatsapp VARCHAR(50)  NULL AFTER name;
```

> O campo do perfil é `whatsapp` (igual ao nome que a frontend já usa em `ProfileSettings`), não `phone`.

### 2.2 `GET /api/auth/me` (autenticado)

Hoje devolve `{ user: { id, email } }`. Passa a devolver também os campos novos:

```json
{
  "user": {
    "id": "…",
    "email": "maria@email.com",
    "name": "Maria dos Santos",
    "whatsapp": "+244 923 000 000"
  }
}
```

### 2.3 `PUT /api/auth/me` (novo, autenticado)

Actualiza o perfil do dono autenticado.

**Pedido:**
```json
{
  "name": "Maria dos Santos",
  "whatsapp": "+244 923 000 000"
}
```

**Regras:**
- Ambos os campos são opcionais; só actualiza o que for enviado.
- **O `email` NÃO é alterável por este endpoint** — é a credencial de login. Se vier no corpo,
  ignora-se ou devolve-se `400` (recomendado: `400` com `code: 'EMAIL_LOCKED'`, para a front não
  mostrar que "guardou" algo que não segue).
- `name` ≤ 255; `whatsapp` ≤ 50; `null`/`""` limpa o valor.
- Resposta: o objecto `user` actualizado (mesmo shape do `GET`).

---

## 3. Endereço e Horários da loja (tabela `stores`)

### 3.1 Migração

```sql
ALTER TABLE stores
  ADD COLUMN province     VARCHAR(60)  NULL AFTER currency,
  ADD COLUMN municipality VARCHAR(100) NULL AFTER province,
  ADD COLUMN street       VARCHAR(255) NULL AFTER municipality,
  ADD COLUMN reference    VARCHAR(255) NULL AFTER street,
  ADD COLUMN pickup_point VARCHAR(255) NULL AFTER reference,
  ADD COLUMN hours        JSON         NULL AFTER pickup_point;
```

> `hours` guarda o horário semanal. Formato (igual ao da frontend `HoursSettings`):

```json
{
  "Segunda": { "open": true,  "from": "08:00", "to": "18:00" },
  "Terça":   { "open": true,  "from": "08:00", "to": "18:00" },
  "Sábado":  { "open": true,  "from": "09:00", "to": "13:00" },
  "Domingo": { "open": false, "from": "09:00", "to": "13:00" }
}
```

- Chaves obrigatórias: `Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo`.
- Na escrita o pedido pode vir parcial (só os dias que o lojista tocou); o backend carrega o `hours`
  actual (ou o valor por defeito se ainda não existir), aplica os dias enviados e guarda sempre o
  objecto completo com os 7 dias (ver validação em §3.2).
- `from`/`to` no formato `HH:mm` (24h).
- `open: false` ignora `from`/`to` (fica aberto só o dia); o backend deve normalizar para
  `{ open: false, from: "", to: "" }` ao guardar.

### 3.2 `PUT /api/stores/mine` (autenticado) — campos novos

Aceita, além do que já aceita hoje (`name`, `whatsapp`, `currency`, `description`, etc.):

```json
{
  "address": {
    "province": "Luanda",
    "municipality": "Talatona",
    "street": "Rua das Flores, Bairro Palanca",
    "reference": "Ao lado do mercado",
    "pickup_point": "Loja física"
  },
  "hours": {
    "Segunda": { "open": true,  "from": "08:00", "to": "18:00" },
    "Domingo": { "open": false, "from": "09:00", "to": "13:00" }
  }
}
```

> Mapeamento para a coluna: `pickup_point` no JSON ↔ `pickup_point` na coluna. A frontend usa
> `pickupPoint` (camelCase) localmente — se preferires, o endpoint aceita também `pickupPoint`,
> normalizando para `pickup_point` na hora de guardar. Escolhe um e documenta.

**Regras (`address`):**
- Sub-objecto opcional. Cada campo é opcional dentro do sub-objecto.
- `province` ≤ 60, `municipality` ≤ 100, `street` ≤ 255, `reference` ≤ 255, `pickup_point` ≤ 255.
- `null`/`""` limpa o campo.
- O backend aceita a string que vier (a lista de províncias é frontend), só valida tamanho.

**Regras (`hours`):**
- Sub-objecto opcional.
- Guardar cumulativamente: frações de dias → na base preenche-se com o valor por defeito
  `{ open: true, from: "08:00", to: "18:00" }` (exceção Domingo → `{ open: false }`).
- Validar `from`/`to` com `HH:mm` (regex `^([01]\d|2[0-3]):[0-5]\d$`); inválido → `400`.
- Para dias `open: true`, se `from >= to` (string compare do HH:mm) → `400` (aproxima a validação
  que a frontend já faz).
- `open: false` → guardar `{ open: false, from: "", to: "" }` (limpar horários).
- Máx. 7 entradas (os 7 dias). Extra descarta-se.

### 3.3 `GET /api/stores/mine` (autenticado)

Devolve os campos novos dentro de `store` (objecto plano, tal como sai da query `SELECT *`), com
`hours` já `JSON.parse`-ado e as chaves dos 7 dias preenchidas (nunca `null`/parcial).
Se a loja nunca defínio horários, devolve os valores por defeito (tudo aberto 08:00-18:00, Domingo
fechado).

**Compatibilidade:** `parseStore` já normaliza JSON (`banner_urls`, `theme_config`) e já devolve o
`row` do `SELECT *` — basta estender a normalização para `hours`, sem quebrar o que já existe.

---

## 4. Exposição pública (`GET /api/storefront/:slug`)

Para o cliente ver na loja (→ "Em breve o cliente verá este endereço / estes horários"...), o objecto
`store` devolvido por `GET /storefront/:slug` deve passar a incluir:

```json
{
  "store": {
    "id": "…",
    "name": "…",
    "whatsapp": "…",
    "currency": "AOA",
    "province": "Luanda",
    "municipality": "Talatona",
    "street": "…",
    "reference": "…",
    "pickup_point": "…",
    "hours": {
      "Segunda": { "open": true,  "from": "08:00", "to": "18:00" },
      "Domingo": { "open": false, "from": "09:00", "to": "13:00" }
    }
  }
}
```

- Não expor dados sensíveis do dono — só o que já é público da loja + endereço/horários.
- `hours` normalizado (7 dias, nunca `null`).

---

## 5. Resumo do contrato

| Entidade | Endpoint | Pedido | Persistência |
|---|---|---|---|
| Perfil | `GET /auth/me` | — | devolve `{user:{id,email,name,whatsapp}}` |
| Perfil | `PUT /auth/me` | `{name?, whatsapp?}` | `users.name`, `users.whatsapp` |
| Endereço | `PUT /stores/mine` | `{address: {province?, municipality?, street?, reference?, pickup_point?}}` | colunas em `stores` |
| Horários | `PUT /stores/mine` | `{hours: {<dia>: {open, from, to}}}` | `stores.hours` (JSON) |
| Loja pública | `GET /storefront/:slug` | — | devolve `address` + `hours` no `store` |

---

## 6. Testes sugeridos

```bash
# Perfil
curl -X PUT http://192.168.100.196:4000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Maria dos Santos","whatsapp":"+244 923 000 000"}'

# Endereço
curl -X PUT http://192.168.100.196:4000/api/stores/mine \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"address":{"province":"Luanda","municipality":"Talatona","street":"Rua das Flores","pickup_point":"Portaria"}}'

# Horários
curl -X PUT http://192.168.100.196:4000/api/stores/mine \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"hours":{"Segunda":{"open":true,"from":"08:00","to":"18:00"},"Domingo":{"open":false,"from":"09:00","to":"13:00"}}}'

# Confirmar leitura (público)
curl http://192.168.100.196:4000/api/storefront/<slug>
```

---

## 7. Critérios de aceitação

- [ ] Migração aplicada em todos os ambientes (não só dev local): `users.name`, `users.whatsapp`,
      `stores.province|municipality|street|reference|pickup_point`, `stores.hours`.
- [ ] `GET /auth/me` devolve `name` e `whatsapp`.
- [ ] `PUT /auth/me` actualiza apenas `name`/`whatsapp`; tentar alterar `email` devolve `400`.
- [ ] `PUT /stores/mine` aceita `address` (5 campos) e `hours` (7 dias) com as validações de §3.
- [ ] `hours` guardado com os 7 dias preenchidos; `open: false` limpa `from`/`to`.
- [ ] `GET /stores/mine` devolve `address` + `hours` normalizados.
- [ ] `GET /storefront/:slug` devolve `address` + `hours` na loja, sem alterar o resto da resposta.
- [ ] Nenhum pedido antigo (sem estes campos) deixa de funcionar.