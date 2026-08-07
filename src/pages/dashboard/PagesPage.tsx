import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Search,
} from "lucide-react";
import { api } from "../../lib/api";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Surface } from "../../components/ui/Surface";
import { EmptyState } from "../../components/ui/Feedback";
import { SkeletonTableRows } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import type { Page, PageTemplate } from "../../builder";
import { PAGE_TEMPLATES } from "../../builder";

const STATUS_MAP: Record<string, { label: string; badge: "ink" | "green" | "amber" }> = {
  draft: { label: "Rascunho", badge: "ink" },
  published: { label: "Publicado", badge: "green" },
  archived: { label: "Arquivado", badge: "amber" },
};

export function PagesPage({
  onEditPage,
}: {
  onEditPage: (pageId: string) => void;
}) {
  const toast = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.pages.list();
      setPages(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar páginas");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Tens a certeza que queres eliminar esta página?")) return;
      try {
        await api.pages.remove(id);
        setPages((prev) => prev.filter((p) => p.id !== id));
        toast.success("Página eliminada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao eliminar");
      }
    },
    [toast],
  );

  const handleDuplicate = useCallback(
    async (page: Page) => {
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
        toast.success("Página duplicada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao duplicar");
      }
    },
    [toast],
  );

  const handleCreateBlank = useCallback(() => {
    onEditPage("new");
  }, [onEditPage]);

  const filtered = search.trim()
    ? pages.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase()),
      )
    : pages;

  const groupedByTemplate = (template: PageTemplate) => {
    const tpl = PAGE_TEMPLATES[template];
    if (!tpl) return null;
    return (
      <Surface
        key={template}
        as="button"
        onClick={handleCreateBlank}
        className="flex flex-col items-center justify-center gap-2 border-dashed p-6 text-ink-2 transition-all hover:border-ink hover:text-ink"
      >
        <FileText size={24} />
        <span className="font-mono text-[13px] font-semibold text-ink">{tpl.label}</span>
        <span className="font-mono text-[11px] text-ink-2">{tpl.description}</span>
      </Surface>
    );
  };

  return (
    <div>
      <PageHeader
        title="Páginas"
        subtitle="Cria e gere as páginas da tua loja"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2/60"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Procurar páginas..."
                className="h-9 w-full border border-border bg-paper pl-9 pr-3 font-mono text-[13px] text-ink placeholder:text-ink-2/60 focus:border-ink focus:outline-none sm:w-52"
                style={{ borderRadius: "2px" }}
              />
            </div>
            <Button onClick={handleCreateBlank}>
              <Plus size={16} />
              Nova página
            </Button>
          </div>
        }
      />

      {!loading && pages.length === 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
            Criar primeira página
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.keys(PAGE_TEMPLATES).map((t) =>
              groupedByTemplate(t as PageTemplate),
            )}
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTableRows rows={5} cols={4} />
      ) : filtered.length === 0 && pages.length > 0 ? (
        <EmptyState
          type="search"
          title="Nenhuma página encontrada"
          description={`Nada corresponde a "${search}".`}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((page) => {
            const statusStyle = STATUS_MAP[page.status] ?? STATUS_MAP.draft;
            return (
              <Surface
                key={page.id}
                className="flex flex-col gap-3 p-4 transition-shadow hover:shadow-floating sm:flex-row sm:items-center sm:gap-4"
              >
                <div
                  className="hidden h-10 w-10 shrink-0 items-center justify-center bg-accent-soft text-primary sm:flex"
                  style={{ borderRadius: "2px" }}
                >
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-[13px] font-semibold text-ink">
                      {page.title}
                    </span>
                    <Badge color={statusStyle.badge}>{statusStyle.label}</Badge>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-2">
                    <span>/{page.slug}</span>
                    <span>·</span>
                    <span>
                      {PAGE_TEMPLATES[page.template]?.label ?? page.template}
                    </span>
                    <span>·</span>
                    <span>{page.sections?.length ?? 0} secções</span>
                    <span>·</span>
                    <span>
                      Atualizada{" "}
                      {new Date(page.updatedAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(page)}
                    className="p-2 text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                    style={{ borderRadius: "2px" }}
                    title="Duplicar"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-2 text-ink-2 transition-colors hover:bg-danger/5 hover:text-danger"
                    style={{ borderRadius: "2px" }}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="mx-1 h-5 w-px bg-border" />
                  <Button size="sm" onClick={() => onEditPage(page.id)}>
                    <Edit3 size={14} />
                    Editar
                  </Button>
                </div>
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
}
