import { useEffect, useState } from 'react';
import { Plus, FolderTree, Trash2, Pencil, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { api, uploadCategoryIcon, resolveMediaUrl } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { PageHeader } from './Shell';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/Feedback';
import type { Category, Subcategory } from '../../lib/types';

export function CategoriesPage() {
  const { store } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [subcats, setSubcats] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Modal de categoria
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIconFile, setCatIconFile] = useState<File | null>(null);
  const [catIconPreview, setCatIconPreview] = useState<string | null>(null);
  const [catExistingIconUrl, setCatExistingIconUrl] = useState<string | null>(null);
  const [catError, setCatError] = useState<string | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catUploading, setCatUploading] = useState(false);

  // Modal de sub-categoria
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [subName, setSubName] = useState('');
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [store]);

  // --- Categoria ---
  const openNewCat = () => {
    setEditingCat(null);
    setCatName('');
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
      } else {
        await api.categories.create(catName, iconUrl);
      }
      setCatModalOpen(false);
      await load();
    } catch (err: any) {
      setCatError(err.message || 'Erro ao guardar categoria');
    } finally {
      setCatSaving(false);
      setCatUploading(false);
    }
  };

  const removeCat = async (c: Category) => {
    if (!confirm(`Eliminar a categoria "${c.name}"? Isto também elimina as suas sub-categorias.`)) return;
    try {
      await api.categories.remove(c.id);
      await load();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar categoria');
    }
  };

  // --- Sub-categoria ---
  const openNewSub = (categoryId: string) => {
    setEditingSub(null);
    setSubCategoryId(categoryId);
    setSubName('');
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
      } else {
        await api.subcategories.create(subCategoryId, subName);
      }
      setSubModalOpen(false);
      await load();
    } catch (err: any) {
      setSubError(err.message || 'Erro ao guardar sub-categoria');
    } finally {
      setSubSaving(false);
    }
  };

  const removeSub = async (s: Subcategory) => {
    if (!confirm(`Eliminar a sub-categoria "${s.name}"?`)) return;
    try {
      await api.subcategories.remove(s.id);
      await load();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar sub-categoria');
    }
  };

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Organiza os teus produtos em categorias e sub-categorias"
        action={<Button onClick={openNewCat}><Plus size={16} /> Nova categoria</Button>}
      />
      {loading ? (
        <div className="text-slate-400">A carregar...</div>
      ) : cats.length === 0 ? (
        <EmptyState icon={<FolderTree size={28} />} title="Sem categorias" description="Cria categorias para organizar os teus produtos." action={<Button onClick={openNewCat}><Plus size={16} /> Nova categoria</Button>} />
      ) : (
        <div className="space-y-3">
          {cats.map((c) => {
            const subsOfCat = subcats.filter((s) => s.category_id === c.id);
            const isOpen = expanded === c.id;
            const iconSrc = resolveMediaUrl(c.icon_url);
            return (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                    {iconSrc ? (
                      <img src={iconSrc} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FolderTree size={18} /></div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-400">{subsOfCat.length} sub-categoria(s)</div>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => openEditCat(c)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button>
                    <button onClick={() => removeCat(c)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    {subsOfCat.length === 0 ? (
                      <p className="mb-3 text-sm text-slate-400">Sem sub-categorias.</p>
                    ) : (
                      <div className="mb-3 space-y-2">
                        {subsOfCat.map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Tag size={14} className="text-slate-400" />
                              <span className="text-slate-700">{s.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openEditSub(s)} className="rounded p-1 text-slate-400 hover:bg-slate-100"><Pencil size={14} /></button>
                              <button onClick={() => removeSub(s)} className="rounded p-1 text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openNewSub(c.id)}>
                      <Plus size={14} /> Nova sub-categoria
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal categoria */}
      <Modal open={catModalOpen} onClose={() => setCatModalOpen(false)} title={editingCat ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={saveCat} className="space-y-4">
          {catError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{catError}</div>}
          <Field label="Nome da categoria">
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} required autoFocus />
          </Field>
          <Field label="Ícone da categoria" hint="Opcional. PNG, JPG, WEBP, SVG ou GIF, até 5MB.">
            <div className="flex items-center gap-3">
              {catIconPreview && (
                <img src={catIconPreview} alt="" className="h-14 w-14 rounded-lg border border-slate-200 object-cover" />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={handleIconSelect}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {catUploading && <p className="mt-1 text-xs text-blue-600">A enviar imagem...</p>}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCatModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={catSaving}>{catSaving ? 'A guardar...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal sub-categoria */}
      <Modal open={subModalOpen} onClose={() => setSubModalOpen(false)} title={editingSub ? 'Editar sub-categoria' : 'Nova sub-categoria'}>
        <form onSubmit={saveSub} className="space-y-4">
          {subError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{subError}</div>}
          <Field label="Nome da sub-categoria">
            <Input value={subName} onChange={(e) => setSubName(e.target.value)} required autoFocus />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSubModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={subSaving}>{subSaving ? 'A guardar...' : 'Guardar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}