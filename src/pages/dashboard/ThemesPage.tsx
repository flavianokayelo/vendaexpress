import { useEffect, useState } from "react";
import {
  Check,
  AlertCircle,
  RefreshCw,
  Star,
  Moon,
  PaletteIcon,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { getAvailableThemes } from "../../theme/ThemeRegistry";
import { themeLogger } from "../../theme/ThemeLogger";
import type { ThemeRegistryEntry } from "../../theme/types";

type ApiThemeInfo = {
  id: string;
  name: string;
  label: string;
  description: string;
  tags: string[];
  version: string;
  author: string;
  in_use: number;
};

const PREVIEW_GRADIENTS: Record<string, string> = {
  standard: "from-indigo-600 to-blue-500",
  luxury: "from-yellow-900 via-amber-700 to-amber-500",
  minimal: "from-slate-900 to-slate-600",
  fashion: "from-pink-700 via-rose-600 to-rose-400",
  electronics: "from-cyan-900 via-blue-800 to-indigo-900",
};

export function ThemesPage() {
  const { store, refreshStore } = useAuth();
  const [backendThemes, setBackendThemes] = useState<ApiThemeInfo[]>([]);
  const [registryThemes, setRegistryThemes] = useState<ThemeRegistryEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewErrors, setPreviewErrors] = useState<Record<string, boolean>>(
    {},
  );
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const [apiThemes, localThemes] = await Promise.all([
          api.themes.list() as Promise<ApiThemeInfo[]>,
          new Promise<ThemeRegistryEntry[]>((resolve) => {
            const themes = getAvailableThemes();
            if (themes.length > 0) {
              resolve(themes);
            } else {
              const check = () => {
                const t = getAvailableThemes();
                if (t.length > 0) resolve(t);
                else setTimeout(check, 100);
              };
              check();
            }
          }),
        ]);
        setBackendThemes(apiThemes);
        setRegistryThemes(localThemes);
        setSelectedId(store?.theme_id ?? "standard");
      } catch (err) {
        setError("Erro ao carregar temas");
        themeLogger.error("ThemesPage", "Erro ao carregar lista de temas", {
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (store?.theme_id) setSelectedId(store.theme_id);
  }, [store?.theme_id]);

  const currentId = store?.theme_id ?? "standard";

  const mergedThemes = backendThemes.map((apiTheme) => {
    const reg = registryThemes.find((r) => r.id === apiTheme.id);
    return { ...apiTheme, ...reg };
  });

  const hasLivePreviews = registryThemes.length > 0;

  const select = async (id: string) => {
    if (id === currentId) return;
    setSaving(true);
    setError(null);
    try {
      await api.stores.update({ theme_id: id });
      await refreshStore();
      setSelectedId(id);
      setSaved(true);
      themeLogger.info("ThemesPage", `Tema alterado para "${id}"`);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar tema";
      setError(msg);
      themeLogger.error("ThemesPage", msg, { themeId: id });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewError = (id: string) => {
    setPreviewErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handlePreviewLoad = (id: string) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div>
      <PageHeader title="Temas" subtitle="Escolhe o visual da tua loja" />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <RefreshCw size={20} className="mr-2 animate-spin" />A carregar
          temas...
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mergedThemes.map((theme) => {
            const gradient =
              PREVIEW_GRADIENTS[theme.id] ?? "from-slate-400 to-slate-300";
            const isActive = theme.id === currentId;
            const isSelected = theme.id === selectedId;
            const previewPath = (theme as ThemeRegistryEntry).preview;
            const hasPreviewImage = previewPath && !previewErrors[theme.id];
            const imgLoaded = imageLoaded[theme.id];
            const premium = (theme as ThemeRegistryEntry).premium;
            const supportsDark = (theme as ThemeRegistryEntry).supportsDarkMode;

            return (
              <div
                key={theme.id}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 bg-white transition-all duration-200 ${
                  isActive
                    ? "border-indigo-600 shadow-lg shadow-indigo-100"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
                onClick={() => select(theme.id)}
              >
                {/* Preview */}
                <div
                  className={`relative flex h-28 items-end justify-start bg-gradient-to-br ${gradient} overflow-hidden`}
                >
                  {hasPreviewImage && (
                    <>
                      {!imgLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw
                            size={16}
                            className="animate-spin text-white/60"
                          />
                        </div>
                      )}
                      <img
                        src={previewPath}
                        alt={theme.label}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                        onError={() => handlePreviewError(theme.id)}
                        onLoad={() => handlePreviewLoad(theme.id)}
                      />
                    </>
                  )}
                  <span className="relative z-10 p-4 text-3xl drop-shadow-lg">
                    <PaletteIcon size={28} className="text-white/80" />
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-1.5 font-bold text-slate-900">
                      {theme.label}
                      {premium && (
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                      )}
                    </h3>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                        <Check size={12} /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {theme.description}
                  </p>

                  {/* Tags + badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {theme.tags?.slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                    {supportsDark && (
                      <span className="flex items-center gap-0.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                        <Moon size={10} /> Dark
                      </span>
                    )}
                    {premium && (
                      <span className="flex items-center gap-0.5 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                        <Star size={10} /> Premium
                      </span>
                    )}
                  </div>

                  {/* Stats + action */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>v{theme.version}</span>
                      {(theme as ApiThemeInfo).in_use > 0 && (
                        <span>· {(theme as ApiThemeInfo).in_use} loja(s)</span>
                      )}
                    </div>
                    {!isActive && (
                      <Button
                        size="sm"
                        variant={isSelected ? "primary" : "outline"}
                        disabled={saving}
                        onClick={(e) => {
                          e.stopPropagation();
                          select(theme.id);
                        }}
                      >
                        {saving && isSelected
                          ? "A aplicar..."
                          : isSelected && saved
                            ? "Aplicado"
                            : "Aplicar"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {saved && !error && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check size={16} /> Tema alterado com sucesso!
        </div>
      )}
    </div>
  );
}
