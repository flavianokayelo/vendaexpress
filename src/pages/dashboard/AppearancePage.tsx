import { useEffect, useRef, useState } from 'react';
import { Palette, Check, Upload, X, ImagePlus } from 'lucide-react';
import { api, resolveMediaUrl, uploadStoreLogo, uploadStoreBanner } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { PageHeader } from './Shell';
import { Button } from '../../components/ui/Button';
import { Input, Field, Textarea } from '../../components/ui/Field';

const PRESET_COLORS = [
  '#1d4ed8', '#1e3a8a', '#0c4a6e', '#0f766e', '#075985',
  '#312e81', '#4338ca', '#6d28d9', '#be185d', '#be123c',
  '#ea580c', '#ca8a04', '#16a34a', '#1e293b', '#475569',
];

const MAX_BANNERS = 5;

export function AppearancePage() {
  const { store, refreshStore } = useAuth();
  const [color, setColor] = useState(store?.theme_primary ?? '#1d4ed8');
  const [description, setDescription] = useState(store?.description ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(store?.logo_url ?? null);
  const [bannerUrls, setBannerUrls] = useState<string[]>(store?.banner_urls ?? (store?.banner_url ? [store.banner_url] : []));

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
      setDescription(store.description ?? '');
      setLogoUrl(store.logo_url ?? null);
      setBannerUrls(store.banner_urls ?? (store.banner_url ? [store.banner_url] : []));
    }
  }, [store]);

  const pickLogo = () => logoInputRef.current?.click();

  const onLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploadingLogo(true);
    try {
      const { url } = await uploadStoreLogo(file);
      setLogoUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao enviar o logótipo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const pickBanners = () => bannerInputRef.current?.click();

  const onBannersSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    const remaining = MAX_BANNERS - bannerUrls.length;
    if (remaining <= 0) {
      setUploadError(`Só podes ter até ${MAX_BANNERS} fotos no banner. Remove alguma antes de adicionar mais.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setUploadError(`Só podes ter até ${MAX_BANNERS} fotos no banner — foram enviadas apenas ${toUpload.length}.`);
    } else {
      setUploadError(null);
    }

    setUploadingBanner(true);
    try {
      const { urls } = await uploadStoreBanner(toUpload);
      setBannerUrls((prev) => [...prev, ...urls].slice(0, MAX_BANNERS));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao enviar as fotos do banner');
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
      setUploadError(err instanceof Error ? err.message : 'Erro ao guardar alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Aparência" subtitle="Personaliza o visual da tua loja" />
      <form onSubmit={save} className="max-w-2xl space-y-6">
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">Cor principal</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-10 w-10 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check size={16} className="mx-auto text-white" />}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 rounded cursor-pointer border border-slate-200" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="max-w-[140px]" />
          </div>
        </div>

        <Field label="Descrição da loja">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Uma breve descrição da tua loja" />
        </Field>

        {uploadError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{uploadError}</div>}

        {/* Logótipo */}
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">Logótipo</span>
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoSelected} />
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {logoUrl ? (
                <img src={resolveMediaUrl(logoUrl) ?? ''} alt="Logótipo" className="h-full w-full object-cover" />
              ) : (
                <Palette size={22} className="text-slate-300" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={pickLogo} disabled={uploadingLogo}>
                <Upload size={14} className="mr-1.5" />
                {uploadingLogo ? 'A enviar...' : logoUrl ? 'Trocar logótipo' : 'Carregar logótipo'}
              </Button>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Banner (até 5 fotos) */}
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Fotos do banner <span className="font-normal text-slate-400">({bannerUrls.length}/{MAX_BANNERS})</span>
          </span>
          <input ref={bannerInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onBannersSelected} />
          <div className="flex flex-wrap gap-3">
            {bannerUrls.map((url) => (
              <div key={url} className="group relative h-24 w-40 overflow-hidden rounded-xl border border-slate-200">
                <img src={resolveMediaUrl(url) ?? ''} alt="Banner" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeBanner(url)}
                  className="absolute right-1 top-1 rounded-full bg-slate-900/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {bannerUrls.length < MAX_BANNERS && (
              <button
                type="button"
                onClick={pickBanners}
                disabled={uploadingBanner}
                className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600"
              >
                <ImagePlus size={20} />
                <span className="text-xs">{uploadingBanner ? 'A enviar...' : 'Adicionar foto'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          {bannerUrls[0] ? (
            <img src={resolveMediaUrl(bannerUrls[0]) ?? ''} alt="Banner preview" className="h-24 w-full object-cover" />
          ) : (
            <div className="h-24" style={{ backgroundColor: color }} />
          )}
          <div className="flex items-center gap-3 bg-white p-4">
            {logoUrl ? (
              <img src={resolveMediaUrl(logoUrl) ?? ''} alt={store?.name} className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold" style={{ backgroundColor: color }}>
                {(store?.name ?? 'L')[0]}
              </div>
            )}
            <div>
              <div className="font-bold text-slate-900">{store?.name ?? 'Minha Loja'}</div>
              <div className="text-xs text-slate-500">{description || 'Sem descrição'}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving || uploadingLogo || uploadingBanner}>{saving ? 'A guardar...' : 'Guardar alterações'}</Button>
          {saved && <span className="inline-flex items-center gap-1 text-sm text-green-600"><Check size={16} /> Guardado</span>}
        </div>
      </form>
    </div>
  );
}