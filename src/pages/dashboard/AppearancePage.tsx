import { useEffect, useRef, useState } from "react";
import { Palette, Check, Upload, X, ImagePlus, Store, Hash } from "lucide-react";
import { api, resolveMediaUrl, uploadStoreLogo, uploadStoreBanner } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Input, Field, Textarea } from "../../components/ui/Field";

const PRESET_COLORS = [
  "#1d4ed8", "#1e3a8a", "#0c4a6e", "#075985",
  "#0f766e", "#312e81", "#4338ca", "#6d28d9",
  "#be185d", "#be123c", "#ea580c", "#ca8a04",
  "#16a34a", "#1e293b", "#475569",
];

const MAX_BANNERS = 5;

export function AppearancePage() {
  const { store, refreshStore } = useAuth();
  const [color, setColor] = useState(store?.theme_primary ?? "#1d4ed8");
  const [description, setDescription] = useState(store?.description ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(store?.logo_url ?? null);
  const [bannerUrls, setBannerUrls] = useState<string[]>(
    store?.banner_urls ?? (store?.banner_url ? [store.banner_url] : []),
  );

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (store) {
      setColor(store.theme_primary);
      setDescription(store.description ?? "");
      setLogoUrl(store.logo_url ?? null);
      setBannerUrls(
        store.banner_urls ?? (store.banner_url ? [store.banner_url] : []),
      );
    }
  }, [store]);

  const pickLogo = () => logoInputRef.current?.click();

  const onLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploadingLogo(true);
    try {
      const { url } = await uploadStoreLogo(file);
      setLogoUrl(url);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erro ao enviar o logótipo",
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const pickBanners = () => bannerInputRef.current?.click();

  const onBannersSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const remaining = MAX_BANNERS - bannerUrls.length;
    if (remaining <= 0) {
      setUploadError(
        `Só podes ter até ${MAX_BANNERS} fotos no banner. Remove alguma antes de adicionar mais.`,
      );
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setUploadError(
        `Só podes ter até ${MAX_BANNERS} fotos no banner — foram enviadas apenas ${toUpload.length}.`,
      );
    } else {
      setUploadError(null);
    }

    setUploadingBanner(true);
    try {
      const { urls } = await uploadStoreBanner(toUpload);
      setBannerUrls((prev) => [...prev, ...urls].slice(0, MAX_BANNERS));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erro ao enviar as fotos do banner",
      );
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeBanner = (url: string) => {
    setBannerUrls((prev) => prev.filter((u) => u !== url));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      await api.stores.update({
        theme_primary: color,
        description: description || null,
        logo_url: logoUrl,
        banner_urls: bannerUrls,
      });
      await refreshStore();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erro ao guardar alterações",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Aparência"
        subtitle="Personaliza o visual da tua loja"
      />

      <form onSubmit={save} className="max-w-2xl space-y-8">
        {/* Cor principal */}
        <section className="border border-border bg-paper p-6" style={{ borderRadius: '2px' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex h-6 w-6 items-center justify-center bg-accent/10 text-accent" style={{ borderRadius: '2px' }}>
              <Palette size={14} />
            </span>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">Cor principal</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="relative h-9 w-9 transition-all duration-150 hover:scale-110 hover:shadow-md"
                style={{ borderRadius: '2px', backgroundColor: c }}
              >
                {color === c && (
                  <Check size={15} className="absolute inset-0 m-auto text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-16 cursor-pointer border border-border bg-transparent p-0.5"
              style={{ borderRadius: '2px' }}
            />
            <div className="relative">
              <Hash size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
              <Input
                value={color.replace("#", "")}
                onChange={(e) => setColor(`#${e.target.value.replace("#", "")}`)}
                className="max-w-[120px] pl-7 font-mono text-[13px]"
              />
            </div>
          </div>
        </section>

        {/* Informação */}
        <section className="border border-border bg-paper p-6" style={{ borderRadius: '2px' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex h-6 w-6 items-center justify-center bg-primary/10 text-primary" style={{ borderRadius: '2px' }}>
              <Store size={14} />
            </span>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">Informação</span>
          </div>

          <Field label="Descrição da loja">
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição da tua loja"
            />
          </Field>
        </section>

        {uploadError && (
          <div className="border border-red/20 bg-red-50 px-4 py-3 font-mono text-[13px] text-red" style={{ borderRadius: '2px' }}>
            {uploadError}
          </div>
        )}

        {/* Logótipo */}
        <section className="border border-border bg-paper p-6" style={{ borderRadius: '2px' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex h-6 w-6 items-center justify-center bg-amber-50 text-warning" style={{ borderRadius: '2px' }}>
              <Upload size={14} />
            </span>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">Logótipo</span>
          </div>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onLogoSelected}
          />

          <div className="flex items-center gap-5">
            <div
              className="flex h-20 w-20 items-center justify-center overflow-hidden border border-border bg-ink/[0.02]"
              style={{ borderRadius: '2px' }}
            >
              {logoUrl ? (
                <img src={resolveMediaUrl(logoUrl) ?? ""} alt="Logótipo" className="h-full w-full object-cover" />
              ) : (
                <Palette size={24} className="text-ink-2/30" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button type="button" variant="outline" size="sm" onClick={pickLogo} disabled={uploadingLogo}>
                <Upload size={14} />
                {uploadingLogo ? "A enviar..." : logoUrl ? "Trocar" : "Carregar logótipo"}
              </Button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl(null)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-ink-2 transition-colors hover:text-danger hover:bg-danger/5"
                  style={{ borderRadius: '2px' }}
                >
                  <X size={13} /> Remover
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="border border-border bg-paper p-6" style={{ borderRadius: '2px' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex h-6 w-6 items-center justify-center bg-teal-50 text-teal" style={{ borderRadius: '2px' }}>
              <ImagePlus size={14} />
            </span>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
              Fotos do banner <span className="font-normal text-ink-2/60">({bannerUrls.length}/{MAX_BANNERS})</span>
            </span>
          </div>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onBannersSelected}
          />

          <div className="flex flex-wrap gap-3">
            {bannerUrls.map((url) => (
              <div
                key={url}
                className="group relative h-24 w-40 overflow-hidden border border-border bg-ink/[0.02]"
                style={{ borderRadius: '2px' }}
              >
                <img src={resolveMediaUrl(url) ?? ""} alt="Banner" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeBanner(url)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-ink/50 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
                  style={{ borderRadius: '2px' }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            {bannerUrls.length < MAX_BANNERS && (
              <button
                type="button"
                onClick={pickBanners}
                disabled={uploadingBanner}
                className="flex h-24 w-40 flex-col items-center justify-center gap-1.5 border border-dashed border-border-2 text-ink-2/60 transition-colors hover:border-ink/30 hover:text-ink-2"
                style={{ borderRadius: '2px' }}
              >
                <ImagePlus size={20} />
                <span className="font-mono text-[11px]">
                  {uploadingBanner ? "A enviar..." : "Adicionar foto"}
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Preview — mockup mobile */}
        <section className="border border-border bg-paper p-6" style={{ borderRadius: '2px' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="flex h-6 w-6 items-center justify-center bg-accent/10 text-accent" style={{ borderRadius: '2px' }}>
              <Store size={14} />
            </span>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">Pré-visualização</span>
          </div>

          <div className="mx-auto max-w-[280px] overflow-hidden border border-border" style={{ borderRadius: '2px' }}>
            {bannerUrls[0] ? (
              <img src={resolveMediaUrl(bannerUrls[0]) ?? ""} alt="Banner" className="h-28 w-full object-cover" />
            ) : (
              <div className="h-28 w-full" style={{ backgroundColor: color }} />
            )}
            <div className="flex items-center gap-3 bg-white px-4 py-3">
              {logoUrl ? (
                <img src={resolveMediaUrl(logoUrl) ?? ""} alt={store?.name} className="h-10 w-10 border border-border object-cover" style={{ borderRadius: '2px' }} />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center border border-border text-sm font-bold text-white" style={{ borderRadius: '2px', backgroundColor: color }}>
                  {(store?.name ?? "L")[0]}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-mono text-[14px] font-bold text-ink">
                  {store?.name ?? "Minha Loja"}
                </div>
                <div className="truncate font-mono text-[11px] text-ink-2">
                  {description || "Sem descrição"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving || uploadingLogo || uploadingBanner}>
            {saving ? "A guardar..." : "Guardar alterações"}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[13px] font-semibold text-success">
              <Check size={15} /> Guardado
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
