import { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, ExternalLink, Edit3, Trash2, Eye, Copy, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, type DashPage } from './Shell';
import { Button } from '../../components/ui/Button';
import type { Page, PageTemplate } from '../../builder';
import { PAGE_TEMPLATES } from '../../builder';

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  draft: { label: 'Rascunho', class: 'bg-slate-100 text-slate-600' },
  published: { label: 'Publicado', class: 'bg-green-100 text-green-700' },
  archived: { label: 'Arquivado', class: 'bg-amber-100 text-amber-700' },
};

export function PagesPage({ onEditPage }: { onEditPage: (pageId: string) => void }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.pages.list();
      setPages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar páginas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta página?')) return;
    try {
      await api.pages.remove(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao eliminar');
    }
  }, []);

  const handleDuplicate = useCallback(async (page: Page) => {
    try {
      const created = await api.pages.create({
        storeId: page.storeId,
        title: `${page.title} (cópia)`,
        slug: `${page.slug}-copia`,
        template: page.template,
        sections: page.sections,
        meta: page.meta,
      });
      setPages((prev) => [...prev, created]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao duplicar');
    }
  }, []);

  const handleCreateBlank = useCallback(() => {
    onEditPage('new');
  }, [onEditPage]);

  const filtered = search.trim()
    ? pages.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase())
      )
    : pages;

  const groupedByTemplate = (template: PageTemplate) => {
    const tpl = PAGE_TEMPLATES[template];
    if (!tpl) return null;
    return (
      <button
        key={template}
        onClick={handleCreateBlank}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 text-sm text-slate-500 transition-all hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30"
      >
        <FileText size={24} />
        <span className="font-medium">{tpl.label}</span>
        <span className="text-xs text-slate-400">{tpl.description}</span>
      </button>
    );
  };

  return (
    <div>
      <PageHeader
        title="Páginas"
        subtitle="Cria e gere as páginas da tua loja"
        action={
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Procurar páginas..."
                className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <Button onClick={handleCreateBlank}>
              <Plus size={16} />
              Nova página
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && pages.length === 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Criar primeira página</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.keys(PAGE_TEMPLATES).map((t) => groupedByTemplate(t as PageTemplate))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          A carregar páginas...
        </div>
      ) : filtered.length === 0 && pages.length > 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          Nenhuma página encontrada para &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((page) => {
            const statusStyle = STATUS_MAP[page.status] ?? STATUS_MAP.draft;
            return (
              <div
                key={page.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">{page.title}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyle.class}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                    <span>/{page.slug}</span>
                    <span>·</span>
                    <span>{PAGE_TEMPLATES[page.template]?.label ?? page.template}</span>
                    <span>·</span>
                    <span>{page.sections?.length ?? 0} secções</span>
                    <span>·</span>
                    <span>Atualizada {new Date(page.updatedAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(page)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="mx-1 h-5 w-px bg-slate-200" />
                  <button
                    onClick={() => onEditPage(page.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800"
                  >
                    <Edit3 size={14} />
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
