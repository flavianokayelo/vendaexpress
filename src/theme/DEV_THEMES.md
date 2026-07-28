# Guia para Criar Temas — Venda Express

## Estrutura de um Tema

```
src/themes/meu-tema/
├── theme.json          # Manifesto — obrigatório
├── index.ts            # Entry point — obrigatório, export default Theme
├── tokens.ts           # Tokens de cores, tipografia, spacing, motion
├── preview.png         # Imagem de preview (opcional, 1200×630 recomendado)
└── componentes/        # Componentes React opcionais
    ├── Header.tsx
    ├── Footer.tsx
    ├── Hero.tsx
    └── ...
```

## 1. Criar o Manifesto (`theme.json`)

```json
{
  "id": "meu-tema",
  "name": "meu-tema",
  "label": "Meu Tema",
  "description": "Descrição do meu tema",
  "author": {
    "name": "O Meu Nome",
    "url": "https://meusite.com",
    "email": "dev@meusite.com"
  },
  "version": "1.0.0",
  "minimumStorefrontVersion": "1.0.0",
  "tags": ["moderno", "rápido", "clean"],
  "supportsDarkMode": false,
  "supportsRTL": false,
  "premium": false,
  "preview": "/previews/meu-tema.png",
  "capabilities": {
    "multiLanguage": false,
    "multiCurrency": false,
    "wishlist": true,
    "quickView": true,
    "compareProducts": false,
    "liveSearch": true,
    "infiniteScroll": false
  }
}
```

## 2. Criar o Entry Point (`index.ts`)

```ts
import type { Theme } from '../../theme/types';
import { tokens, components } from './tokens';

const config = {
  name: 'meu-tema',
  label: 'Meu Tema',
  description: 'Descrição',
  author: { name: 'O Meu Nome' },
  version: '1.0.0',
};

const theme: Theme = {
  id: 'meu-tema',
  config,
  tokens,
  components,
  ThemeComponents: {
    Header: () => null,
    Footer: () => null,
    // ... (null = usa fallback global)
  },
  registry: {
    id: 'meu-tema',
    name: 'meu-tema',
    label: 'Meu Tema',
    description: 'Descrição',
    version: '1.0.0',
    tags: ['moderno'],
  },
};

export default theme;
```

## 3. Descoberta Automática

Não precisas de registar o tema manualmente. O sistema usa `import.meta.glob` para
detetar automaticamente todas as pastas em `src/themes/` que tenham `theme.json` e
`index.ts`. Basta criar a pasta e o tema aparece na galeria.

## 4. Validação Automática

Sempre que um tema é carregado, o `ThemeValidator` verifica:
- Campos obrigatórios do `theme.json`
- Estrutura dos tokens (cores, radius, typography, etc.)
- Component tokens obrigatórios
- Ficheiro `index.ts` presente
- ID segue o padrão `[a-z0-9-]`
- Version segue semver

Se a validação falhar, o sistema faz fallback automático para o tema **Standard**.

## 5. Preview Image

Coloca `preview.png` em `src/themes/meu-tema/`. Dimensão recomendada: 1200×630px.
Se não existir, a galeria mostra um gradiente baseado no tema.

Para o backend, adiciona o manifesto em `venda-express-backend/themes/meu-tema.json`.

## 6. Boas Práticas

- O ID deve ser único, em minúsculas, sem espaços (usa hífen)
- Todos os grupos de tokens são obrigatórios
- Versão segue SemVer (`MAJOR.MINOR.PATCH`)
- Cada `theme.json` no frontend deve ter o seu equivalente no backend
- Componentes React podem ser `() => null` para usar o fallback global
- Não uses nomes genéricos para o ID (ex: "tema", "meu-tema" em vez de "loja-x")
- Testa o tema mudando o `theme_id` na base de dados ou na galeria
