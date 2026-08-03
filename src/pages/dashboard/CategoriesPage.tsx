import { useEffect, useState } from "react";
import {
  Plus,
  FolderTree,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Tag,
} from "lucide-react";
import { api, uploadCategoryIcon, resolveMediaUrl } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Input, Field } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/Feedback";
import { SkeletonTableRows } from "../../components/ui/Skeleton";
import { Surface } from "../../components/ui/Surface";
import { useToast } from "../../components/ui/Toast";
import type { Category, Subcategory } from "../../lib/types";

export function CategoriesPage() {
  const { store } = useAuth();
  const toast = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [subcats, setSubcats] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Modal de categoria
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catIconFile, setCatIconFile] = useState<File | null>(null);
  const [catIconPreview, setCatIconPreview] = useState<string | null>(null);
  const [catExistingIconUrl, setCatExistingIconUrl] = useState<string | null>(
    null,
  );
  const [catError, setCatError] = useState<string | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catUploading, setCatUploading] = useState(false);

  // Modal de sub-categoria
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [subName, setSubName] = useState("");
  const [subError, setSubError] = useState<string | null>(null);
  const [subSaving, setSubSaving] = useState(false);

  const load = async () => {
    if (!store) return;
    try {
      const [catsData, subsData] = await Promise.all([
        api.categories.list(),
        api.subcategories.list(),
      ]);
      setCats(catsData);
      setSubcats(subsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [store]);

  // --- Categoria ---
  const openNewCat = () => {
    setEditingCat(null);
    setCatName("");
    setCatIconFile(null);
    setCatIconPreview(null);
    setCatExistingIconUrl(null);
    setCatError(null);
    setCatModalOpen(true);
  };

  const openEditCat = (c: Category) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatIconFile(null);
    setCatIconPreview(resolveMediaUrl(c.icon_url));
    setCatExistingIconUrl(c.icon_url ?? null);
    setCatError(null);
    setCatModalOpen(true);
  };

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCatIconFile(file);
    setCatIconPreview(URL.createObjectURL(file));
  };

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatSaving(true);
    setCatError(null);
    try {
      let iconUrl = catExistingIconUrl;

      if (catIconFile) {
        setCatUploading(true);
        const { url } = await uploadCategoryIcon(catIconFile);
        iconUrl = url;
        setCatUploading(false);
      }

      if (editingCat) {
        await api.categories.update(editingCat.id, catName, iconUrl);
        toast.success("Categoria atualizada");
      } else {
        await api.categories.create(catName, iconUrl);
        toast.success("Categoria criada");
      }
      setCatModalOpen(false);
      await load();
    } catch (err: any) {
      setCatError(err.message || "Erro ao guardar categoria");
    } finally {
      setCatSaving(false);
      setCatUploading(false);
    }
  };

  const removeCat = async (c: Category) => {
    if (
      !confirm(
        `Eliminar a categoria "${c.name}"? Isto também elimina as suas sub-categorias.`,
      )
    )
      return;
    try {
      await api.categories.remove(c.id);
      toast.success("Categoria eliminada");
      await load();
    } catch (err: any) {
      toast.error(err.message || "Erro ao eliminar categoria");
    }
  };

  // --- Sub-categoria ---
  const openNewSub = (categoryId: string) => {
    setEditingSub(null);
    setSubCategoryId(categoryId);
    setSubName("");
    setSubError(null);
    setSubModalOpen(true);
  };
  const openEditSub = (s: Subcategory) => {
    setEditingSub(s);
    setSubCategoryId(s.category_id);
    setSubName(s.name);
    setSubError(null);
    setSubModalOpen(true);
  };

  const saveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubSaving(true);
    setSubError(null);
    try {
      if (editingSub) {
        await api.subcategories.update(editingSub.id, subName);
        toast.success("Sub-categoria atualizada");
      } else {
        await api.subcategories.create(subCategoryId, subName);
        toast.success("Sub-categoria criada");
      }
      setSubModalOpen(false);
      await load();
    } catch (err: any) {
      setSubError(err.message || "Erro ao guardar sub-categoria");
    } finally {
      setSubSaving(false);
    }
  };

  const removeSub = async (s: Subcategory) => {
    if (!confirm(`Eliminar a sub-categoria "${s.name}"?`)) return;
    try {
      await api.subcategories.remove(s.id);
      toast.success("Sub-categoria eliminada");
      await load();
    } catch (err: any) {
      toast.error(err.message || "Erro ao eliminar sub-categoria");
    }
  };

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Organiza os teus produtos em categorias e sub-categorias"
        action={
          <Button onClick={openNewCat}>
            <Plus size={16} /> Nova categoria
          </Button>
        }
      />
      {loading ? (
        <SkeletonTableRows rows={5} cols={4} />
      ) : cats.length === 0 ? (
        <EmptyState
          icon={<FolderTree size={28} />}
          title="Sem categorias"
          description="Cria categorias para organizar os teus produtos."
          action={
            <Button onClick={openNewCat}>
              <Plus size={16} /> Nova categoria
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {cats.map((c) => {
            const subsOfCat = subcats.filter((s) => s.category_id === c.id);
            const isOpen = expanded === c.id;
            const iconSrc = resolveMediaUrl(c.icon_url);
            return (
              <Surface key={c.id}>
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown size={16} className="text-ink-2" />
                    ) : (
                      <ChevronRight size={16} className="text-ink-2" />
                    )}
                    {iconSrc ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={iconSrc}
                        alt=""
                        className="h-10 w-10 object-cover"
                        style={{ borderRadius: '2px' }}
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center bg-accent-soft text-accent"
                        style={{ borderRadius: '2px' }}
                      >
                        <FolderTree size={18} />
                      </div>
                    )}
                    <div>
                      <div className="font-mono text-[13px] font-semibold text-ink">{c.name}</div>
                      <div className="font-mono text-[11px] text-ink-2">
                        {subsOfCat.length} sub-categoria(s)
                      </div>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditCat(c)}
                      className="flex h-8 w-8 items-center justify-center text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                      style={{ borderRadius: '2px' }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => removeCat(c)}
                      className="flex h-8 w-8 items-center justify-center text-ink-2 transition-colors hover:bg-danger/5 hover:text-danger"
                      style={{ borderRadius: '2px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border bg-ink/[0.02] p-4">
                    {subsOfCat.length === 0 ? (
                      <p className="mb-3 font-mono text-[13px] text-ink-2">
                        Sem sub-categorias.
                      </p>
                    ) : (
                      <div className="mb-3 space-y-2">
                        {subsOfCat.map((s) => (
                          <Surface
                            key={s.id}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Tag size={14} className="text-ink-2" />
                              <span className="font-mono text-[13px] text-ink">{s.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditSub(s)}
                                className="flex h-7 w-7 items-center justify-center text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                                style={{ borderRadius: '2px' }}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => removeSub(s)}
                                className="flex h-7 w-7 items-center justify-center text-ink-2 transition-colors hover:bg-danger/5 hover:text-danger"
                                style={{ borderRadius: '2px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </Surface>
                        ))}
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openNewSub(c.id)}
                    >
                      <Plus size={14} /> Nova sub-categoria
                    </Button>
                  </div>
                )}
              </Surface>
            );
          })}
        </div>
      )}

      {/* Modal categoria */}
      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? "Editar categoria" : "Nova categoria"}
      >
        <form onSubmit={saveCat} className="space-y-4">
          {catError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {catError}
            </div>
          )}
          <Field label="Nome da categoria">
            <Input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field
            label="Ícone da categoria"
            hint="Opcional. PNG, JPG, WEBP, SVG ou GIF, até 5MB."
          >
            <div className="flex items-center gap-3">
              {catIconPreview && (
                <img
                  src={catIconPreview}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 border border-border object-cover"
                  style={{ borderRadius: '2px' }}
                />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={handleIconSelect}
                className="block w-full font-mono text-[13px] text-ink-2 file:mr-3 file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:font-mono file:text-[13px] file:font-semibold file:text-accent hover:file:bg-accent/20"
                style={{ borderRadius: '2px' }}
              />
            </div>
            {catUploading && (
              <p className="mt-1 font-mono text-[11px] text-accent">A enviar imagem...</p>
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCatModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={catSaving}>
              {catSaving ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal sub-categoria */}
      <Modal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title={editingSub ? "Editar sub-categoria" : "Nova sub-categoria"}
      >
        <form onSubmit={saveSub} className="space-y-4">
          {subError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {subError}
            </div>
          )}
          <Field label="Nome da sub-categoria">
            <Input
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={subSaving}>
              {subSaving ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
