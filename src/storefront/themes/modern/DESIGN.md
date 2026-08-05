# Modern Store

## Objetivo

Marketplace denso e promocional — cada centímetro de ecrã vende. Inspirado
nos grandes bazares online (Temu/AliExpress/Shopee): grelha compacta,
badges de promoção bem visíveis, cabeçalho de confiança.

## Ideal para

- Lojas com muitos produtos e catálogo variado
- Ofertas e promoções frequentes
- Compradores que comparam preço antes de tudo

## Direcao visual

- Grelha densa (5-6 colunas em desktop), cartões pequenos e informativos.
- Cabeçalho em duas camadas: barra utilitária escura + faixa "oliva" com
  pesquisa em destaque — pele fixa da identidade do tema (não muda com a
  cor da loja).
- Barra de confiança verde logo abaixo do cabeçalho (privacidade, pagamento,
  entrega) — reforça segurança antes do utilizador navegar.
- O accent (preços, CTAs, badges de promoção) usa a cor da loja
  (`--sf-primary`); o resto do "chrome" (oliva/verde/escuro) é fixo.
- Poucos cantos arredondados — sensação de catálogo denso, não boutique.

## Componentes

- `Header`: barra utilitária + cabeçalho oliva com pesquisa + pills de
  categoria + barra de confiança.
- `ProductCard`: denso, com badge de promoção, condição e aviso de stock
  baixo — só mostra o que existe realmente nos dados do produto (sem
  números de vendas ou avaliações fabricados).
- `ProductGrid`: grelha compacta (grid) ou calha horizontal (rail) para
  secções de destaque.
- `Cart`: drawer partilhado (`CartAdapter`), já 100% orientado a tokens.
- `Footer`: escuro, denso, com categorias e apoio ao cliente.

## Notas

Todas as páginas abertas (produto, categoria, pesquisa) herdam o mesmo
cabeçalho e grelha densos, para a loja sentir-se consistente do início ao
fim — não só na home.
