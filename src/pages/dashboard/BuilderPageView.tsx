import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import {
  BuilderProvider,
  useBuilderEngine,
  BuilderEditor,
  registerAllBlocks,

} from "../../builder";
import type { Page, PageStatus } from "../../builder";

registerAllBlocks();

function BuilderInner({
  pageId,
  onClose,
}: {
  pageId: string | null;
  onClose: () => void;
}) {
  const builder = useBuilderEngine();
  const { state, dispatch } = builder;
  const { store } = useAuth();
  const [loading, setLoading] = useState(pageId !== "new");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pageId && pageId !== "new") {
      api.pages
        .get(pageId)
        .then((page: Page) => {
          dispatch({ type: "SET_PAGE", page });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else if (pageId === "new" && store) {
      dispatch({
        type: "SET_PAGE",
        page: {
          id: "",
          storeId: store.id,
          title: "Nova página",
          slug: "nova-pagina",
          template: "blank",
          status: "draft",
          sections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      setLoading(false);
    }
  }, [pageId, store]);

  const handleSave = useCallback(
    async (status?: PageStatus) => {
      if (!store || !state.page) return;
      setSaving(true);
      setError(null);
      try {
        const payload = {
          storeId: store.id,
          title: state.page.title,
          slug: state.page.slug,
          template: state.page.template,
          status: status ?? state.page.status,
          sections: state.sections,
          meta: state.page.meta,
        };

        if (state.page.id) {
          const updated = await api.pages.update(state.page.id, payload as any);
          dispatch({ type: "SET_PAGE", page: updated });
        } else {
          const created = await api.pages.create(payload as any);
          dispatch({ type: "SET_PAGE", page: created });
        }
        dispatch({ type: "MARK_CLEAN" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao guardar");
      } finally {
        setSaving(false);
      }
    },
    [store, state.page, state.sections, dispatch],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">A carregar página...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="text-sm text-red-600">{error}</div>
        <button
          onClick={onClose}
          className="text-sm text-blue-700 hover:underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <BuilderEditor builder={builder} onBack={onClose} onSave={handleSave} />
  );
}

export function BuilderPageView({
  pageId,
  onClose,
}: {
  pageId: string | null;
  onClose: () => void;
}) {
  return (
    <BuilderProvider value={useBuilderEngine()}>
      <BuilderInner pageId={pageId} onClose={onClose} />
    </BuilderProvider>
  );
}
