/** Barra de separadores tipo "shop page" da Shopee (Início/Produtos/Categorias)
 * — navegação por scroll para as secções da própria página, sem rotas novas. */
export function ShopTabs({
  tabs,
}: {
  tabs: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-2 sm:px-4">
      <div className="flex gap-4 border-b border-[var(--sf-line)]">
        {tabs.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            className="px-1 py-2.5 text-[13px] font-semibold text-[var(--sf-ink)]/65 transition-colors hover:text-[var(--sf-primary)]"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
