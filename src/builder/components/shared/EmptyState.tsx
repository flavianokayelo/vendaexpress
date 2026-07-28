import { LayoutTemplate } from 'lucide-react';

export function EmptyState({ onAddBlock }: { onAddBlock?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <LayoutTemplate size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Página vazia</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Arrasta blocos da barra lateral para começar a construir a tua página
      </p>
      {onAddBlock && (
        <button
          onClick={onAddBlock}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
        >
          Adicionar primeira secção
        </button>
      )}
    </div>
  );
}
