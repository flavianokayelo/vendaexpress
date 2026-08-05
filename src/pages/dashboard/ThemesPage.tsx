import { useEffect, useState } from "react";
import { Check, PaletteIcon } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { frontendThemeCatalog } from "../../storefront/themes/catalog";

type ApiThemeInfo = {
  id: string;
  name: string;
  label: string;
  description: string;
  tags: string[];
  version: string;
  author: string;
  accent: string;
  in_use: number;
};

export function ThemesPage() {
  const { store, refreshStore } = useAuth();
  const toast = useToast();
  const [backendThemes, setBackendThemes] = useState<ApiThemeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const apiThemes = (await api.themes.list()) as ApiThemeInfo[];
        const byId = new Map(frontendThemeCatalog.map((theme) => [theme.id, theme]));
        for (const theme of apiThemes) {
          byId.set(theme.id, { ...byId.get(theme.id), ...theme });
        }
        setBackendThemes(Array.from(byId.values()));
      } catch {
        toast.error("Erro ao carregar temas");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  useEffect(() => {
    if (store?.theme_id) setSelectedId(store.theme_id);
  }, [store?.theme_id]);

  const currentId = store?.theme_id ?? "modern";

  const select = async (id: string) => {
    if (id === currentId) return;
    setSaving(true);
    try {
      await api.stores.update({ theme_id: id });
      const fresh = await refreshStore();
      if (fresh?.theme_id !== id) {
        toast.error(
          "O servidor ainda não reconhece este tema (pode ser preciso atualizar o backend). A loja continua com o tema anterior.",
        );
      } else {
        setSelectedId(id);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        toast.success("Tema aplicado");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar tema";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Temas" subtitle="Escolhe o visual da tua loja" />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[2px] border border-border bg-paper shadow-card"
            >
              <Skeleton className="h-28 w-full rounded-none" />
              <div className="p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-2/3" />
                <div className="mt-3 flex gap-1.5">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {backendThemes.map((theme) => {
            const accent = theme.accent ?? "#111827";
            const gradient = `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`;
            const isActive = theme.id === currentId;
            const isSelected = theme.id === selectedId;

            return (
              <div
                key={theme.id}
                className={`group relative cursor-pointer overflow-hidden rounded-[2px] border bg-paper transition-all duration-200 ${
                  isActive
                    ? "border-accent shadow-floating"
                    : "border-border hover:border-ink/20 hover:shadow-card"
                }`}
                onClick={() => select(theme.id)}
              >
                {/* Preview */}
                <div
                  className="relative flex h-28 items-end justify-start overflow-hidden"
                  style={{ background: gradient }}
                >
                  <span className="relative z-10 p-4 text-3xl drop-shadow-lg">
                    <PaletteIcon size={28} className="text-white/80" />
                  </span>
                  {isActive && (
                    <span className="absolute right-2 top-2 z-10">
                      <Badge color="green">
                        <Check size={11} /> Ativo
                      </Badge>
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-heading text-[16px] font-bold text-ink">
                    {theme.label}
                  </h3>
                  <p className="mt-1 line-clamp-2 font-mono text-[12px] text-ink-2">
                    {theme.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {theme.tags?.slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-[2px] bg-ink/5 px-2 py-0.5 font-mono text-[10px] font-medium text-ink-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats + action */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-ink-2">
                      <span>v{theme.version}</span>
                      {theme.in_use > 0 && (
                        <span>· {theme.in_use} loja(s)</span>
                      )}
                    </div>
                    {!isActive && (
                      <Button
                        size="sm"
                        variant={isSelected ? "primary" : "outline"}
                        loading={saving && isSelected}
                        success={isSelected && saved}
                        onClick={(e) => {
                          e.stopPropagation();
                          select(theme.id);
                        }}
                      >
                        {isSelected && saved ? "Aplicado" : "Aplicar"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
