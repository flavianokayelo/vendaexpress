import { useEffect, useRef, useState } from "react";
import { Palette, Check, Upload, X, ImagePlus, Store, Hash, Plus, Megaphone, Link2, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { api, resolveMediaUrl, uploadStoreLogo, uploadStoreBanner } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Input, Field, Textarea } from "../../components/ui/Field";
import { useToast } from "../../components/ui/Toast";
import { extractDominantColor } from "../../lib/colorExtract";
import type { BannerSlide } from "../../lib/types";
import type { SupportItem } from "../../storefrontTheme/types";

type AppearanceTab = "identity" | "banners" | "content" | "preview";

const TABS: { id: AppearanceTab; label: string; icon: typeof Palette }[] = [
  { id: "identity", label: "Identidade", icon: Palette },
  { id: "banners", label: "Banners", icon: ImagePlus },
  { id: "content", label: "Conteúdo", icon: Megaphone },
  { id: "preview", label: "Pré-visualização", icon: Store },
];

function SectionHeader({
  icon,
  label,
  iconBg = "bg-accent/10 text-accent",
  extra,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  iconBg?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-6 w-6 items-center justify-center ${iconBg}`} style={{ borderRadius: '2px' }}>
          {icon}
        </span>
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
          {label}
        </span>
      </div>
      {extra}
    </div>
  );
}

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border border-border bg-paper p-6 ${className}`}
      style={{ borderRadius: '2px' }}
    >
      {children}
    </section>
  );
}

const PRESET_COLORS = [
  "#1d4ed8", "#1e3a8a", "#0c4a6e", "#075985",
  "#0f766e", "#312e81", "#4338ca", "#6d28d9",
  "#be185d", "#be123c", "#ea580c", "#ca8a04",
  "#16a34a", "#1e293b", "#475569",
];

const MAX_BANNERS = 5;
const MAX_SUPPORT_ITEMS = 8;

const ALIGN_OPTIONS: { id: "left" | "center" | "right"; label: string; icon: typeof AlignLeft }[] = [
  { id: "left", label: "Esquerda", icon: AlignLeft },
  { id: "center", label: "Centro", icon: AlignCenter },
  { id: "right", label: "Direita", icon: AlignRight },
];

function readSupportItems(themeConfig: Record<string, unknown> | null | undefined): SupportItem[] {
  const footer = (themeConfig as { footer?: { supportItems?: SupportItem[] } } | null | undefined)?.footer;
  return Array.isArray(footer?.supportItems) ? footer!.supportItems! : [];
}

function readAnnouncement(themeConfig: Record<string, unknown> | null | undefined): { enabled: boolean; text: string } {
  const header = (themeConfig as { header?: { showAnnouncementBar?: boolean; announcementText?: string } } | null | undefined)?.header;
  return {
    enabled: header?.showAnnouncementBar ?? false,
    text: header?.announcementText ?? "",
  };
}

export function AppearancePage() {
  const { store, refreshStore } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<AppearanceTab>("identity");
  const [color, setColor] = useState(store?.theme_primary ?? "#1d4ed8");
  const [description, setDescription] = useState(store?.description ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(store?.logo_url ?? null);
  const [banners, setBanners] = useState<BannerSlide[]>(
    store?.banner_urls ?? (store?.banner_url ? [{ url: store.banner_url }] : []),
  );
  const [supportItems, setSupportItems] = useState<SupportItem[]>(readSupportItems(store?.theme_config));
  const [announcementEnabled, setAnnouncementEnabled] = useState(readAnnouncement(store?.theme_config).enabled);
  const [announcementText, setAnnouncementText] = useState(readAnnouncement(store?.theme_config).text);

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
      setBanners(
        store.banner_urls ?? (store.banner_url ? [{ url: store.banner_url }] : []),
      );
      setSupportItems(readSupportItems(store.theme_config));
      const announcement = readAnnouncement(store.theme_config);
      setAnnouncementEnabled(announcement.enabled);
      setAnnouncementText(announcement.text);
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
      try {
        const suggested = await extractDominantColor(file);
        if (suggested) {
          setColor(suggested);
          toast.info("Cor principal sugerida a partir da tua logo");
        }
      } catch {
        // extração de cor é um extra — falhar aqui não deve impedir o upload da logo
      }
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

    const remaining = MAX_BANNERS - banners.length;
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
      setBanners((prev) => [...prev, ...urls.map((url) => ({ url }))].slice(0, MAX_BANNERS));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erro ao enviar as fotos do banner",
      );
    } finally {
      setUploadingBanner(false);
    }
  };

  const removeBanner = (url: string) => {
    setBanners((prev) => prev.filter((b) => b.url !== url));
  };

  const updateBanner = (url: string, patch: Partial<BannerSlide>) => {
    setBanners((prev) => prev.map((b) => (b.url === url ? { ...b, ...patch } : b)));
  };

  const addSupportItem = () => {
    if (supportItems.length >= MAX_SUPPORT_ITEMS) return;
    setSupportItems((prev) => [...prev, { title: "", content: "" }]);
  };
  const updateSupportItem = (index: number, patch: Partial<SupportItem>) => {
    setSupportItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };
  const removeSupportItem = (index: number) => {
    setSupportItems((prev) => prev.filter((_, i) => i !== index));
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
        banner_urls: banners,
        theme_config: {
          footer: {
            supportItems: supportItems.filter((it) => it.title.trim() && it.content.trim()),
          },
          header: {
            showAnnouncementBar: announcementEnabled && !!announcementText.trim(),
            announcementText: announcementText.trim() || undefined,
          },
        },
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

      {/* Tabs internas */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative -mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 font-mono text-[12px] font-semibold transition-colors ${
                active
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-2 hover:text-ink"
              }`}
            >
              <t.icon size={14} className={active ? "text-accent" : ""} />
              {t.label}
            </button>
          );
        })}
      </div>

      {uploadError && (
        <div className="mb-6 border border-red/20 bg-red-50 px-4 py-3 font-mono text-[13px] text-red" style={{ borderRadius: '2px' }}>
          {uploadError}
        </div>
      )}

      <form onSubmit={save} className="max-w-2xl space-y-8">
        {/* TAB: Identidade & Cor */}
        {tab === "identity" && (
          <>
            <Section>
              <SectionHeader icon={<Palette size={14} />} label="Cor principal" />

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
            </Section>

            <Section>
              <SectionHeader icon={<Upload size={14} />} label="Logótipo" iconBg="bg-amber-50 text-warning" />

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
                    <img src={resolveMediaUrl(logoUrl) ?? ""} alt="Logótipo" className="h-full w-full object-contain" />
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
            </Section>

            <Section>
              <SectionHeader icon={<Store size={14} />} label="Informação" iconBg="bg-primary/10 text-primary" />

              <Field label="Descrição da loja">
                <Textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Uma breve descrição da tua loja"
                />
              </Field>
            </Section>
          </>
        )}

        {/* Tab: Banners */}
        {tab === "banners" && (
          <>
            <Section>
              <SectionHeader
                icon={<Megaphone size={14} />}
                label="Barra de anúncio"
                extra={
                  <button
                    type="button"
                    role="switch"
                    aria-checked={announcementEnabled}
                    onClick={() => setAnnouncementEnabled((v) => !v)}
                    className={`relative h-5 w-9 flex-shrink-0 transition-colors ${announcementEnabled ? "bg-accent" : "bg-ink/15"}`}
                    style={{ borderRadius: '2px' }}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 bg-white transition-transform ${announcementEnabled ? "translate-x-4" : "translate-x-0.5"}`}
                      style={{ borderRadius: '1px' }}
                    />
                  </button>
                }
              />
              <p className="mb-3 font-mono text-[11px] text-ink-2/70">
                Uma faixa fina no topo da loja, acima do cabeçalho — ideal pra frete grátis, prazo de entrega ou uma promoção ativa.
              </p>

              <Field label="Texto da barra" hint="Aparece só se estiver ativada e tiver texto.">
                <Input
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Ex: Frete grátis para encomendas acima de 10.000 Kz"
                  maxLength={120}
                />
              </Field>
            </Section>

            <Section>
              <SectionHeader
                icon={<ImagePlus size={14} />}
                label={
                  <>Fotos do banner <span className="font-normal text-ink-2/60">({banners.length}/{MAX_BANNERS})</span></>
                }
                iconBg="bg-teal-50 text-teal"
              />
              <p className="mb-4 font-mono text-[11px] text-ink-2/70">
                Cada foto pode ter um título, subtítulo e botão — aparece por cima da imagem na loja.
              </p>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onBannersSelected}
              />

              <div className="space-y-3">
                {banners.map((b) => (
                  <div
                    key={b.url}
                    className="group relative flex flex-col gap-3 border border-border p-3 sm:flex-row"
                    style={{ borderRadius: '2px' }}
                  >
                    <div className="relative h-24 w-full flex-shrink-0 overflow-hidden bg-ink/[0.02] sm:w-40" style={{ borderRadius: '2px' }}>
                      <img src={resolveMediaUrl(b.url) ?? ""} alt="Banner" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeBanner(b.url)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-ink/50 text-white opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
                        style={{ borderRadius: '2px' }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <Input
                        value={b.title ?? ""}
                        onChange={(e) => updateBanner(b.url, { title: e.target.value })}
                        placeholder="Título (opcional)"
                        maxLength={80}
                      />
                      <Input
                        value={b.cta ?? ""}
                        onChange={(e) => updateBanner(b.url, { cta: e.target.value })}
                        placeholder="Texto do botão (opcional)"
                        maxLength={30}
                      />
                      <Input
                        value={b.subtitle ?? ""}
                        onChange={(e) => updateBanner(b.url, { subtitle: e.target.value })}
                        placeholder="Subtítulo (opcional)"
                        maxLength={160}
                        className="sm:col-span-2"
                      />
                      <div className="relative sm:col-span-2">
                        <Link2 size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2" />
                        <Input
                          value={b.link ?? ""}
                          onChange={(e) => updateBanner(b.url, { link: e.target.value })}
                          placeholder="Link do botão (opcional, ex: https://...)"
                          maxLength={300}
                          className="pl-7"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <span className="font-mono text-[11px] text-ink-2/70">Alinhamento</span>
                        <div className="flex gap-1">
                          {ALIGN_OPTIONS.map((opt) => {
                            const active = (b.align ?? "left") === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                title={opt.label}
                                aria-label={opt.label}
                                onClick={() => updateBanner(b.url, { align: opt.id })}
                                className={`flex h-7 w-7 items-center justify-center border transition-colors ${
                                  active
                                    ? "border-accent bg-accent/10 text-accent"
                                    : "border-border text-ink-2/60 hover:text-ink-2"
                                }`}
                                style={{ borderRadius: '2px' }}
                              >
                                <opt.icon size={13} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {banners.length < MAX_BANNERS && (
                  <button
                    type="button"
                    onClick={pickBanners}
                    disabled={uploadingBanner}
                    className="flex h-16 w-full flex-row items-center justify-center gap-1.5 border border-dashed border-border-2 text-ink-2/60 transition-colors hover:border-ink/30 hover:text-ink-2"
                    style={{ borderRadius: '2px' }}
                  >
                    <ImagePlus size={18} />
                    <span className="font-mono text-[11px]">
                      {uploadingBanner ? "A enviar..." : "Adicionar foto"}
                    </span>
                  </button>
                )}
              </div>
            </Section>
          </>
        )}

        {/* Tab: Conteúdo */}
        {tab === "content" && (
          <Section>
            <SectionHeader
              icon={<Megaphone size={14} />}
              label={<>Apoio ao cliente <span className="font-normal text-ink-2/60">({supportItems.length}/{MAX_SUPPORT_ITEMS})</span></>}
              iconBg="bg-teal-50 text-teal"
            />
            <p className="mb-4 font-mono text-[11px] text-ink-2/70">
              Aparece no rodapé da loja (entrega, trocas, garantia, perguntas frequentes). Fica escondido até teres pelo menos um item preenchido.
            </p>

            <div className="space-y-3">
              {supportItems.map((item, i) => (
                <div key={i} className="group relative space-y-2 border border-border p-3" style={{ borderRadius: '2px' }}>
                  <button
                    type="button"
                    onClick={() => removeSupportItem(i)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center text-ink-2/50 opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                    style={{ borderRadius: '2px' }}
                  >
                    <X size={13} />
                  </button>
                  <Input
                    value={item.title}
                    onChange={(e) => updateSupportItem(i, { title: e.target.value })}
                    placeholder="Título (ex: Entregas e prazos)"
                    maxLength={60}
                    className="pr-8"
                  />
                  <Textarea
                    rows={2}
                    value={item.content}
                    onChange={(e) => updateSupportItem(i, { content: e.target.value })}
                    placeholder="Texto que o cliente vê ao abrir este tópico"
                    maxLength={600}
                  />
                </div>
              ))}
              {supportItems.length < MAX_SUPPORT_ITEMS && (
                <Button type="button" variant="outline" size="sm" onClick={addSupportItem}>
                  <Plus size={14} /> Adicionar tópico
                </Button>
              )}
            </div>
          </Section>
        )}

        {/* Tab: Pré-visualização */}
        {tab === "preview" && (
          <Section>
            <SectionHeader icon={<Store size={14} />} label="Pré-visualização" />

            <div className="mx-auto max-w-[280px] overflow-hidden border border-border" style={{ borderRadius: '2px' }}>
              {banners[0] ? (
                <img src={resolveMediaUrl(banners[0].url) ?? ""} alt="Banner" loading="lazy" decoding="async" className="h-28 w-full object-cover" />
              ) : (
                <div className="h-28 w-full" style={{ backgroundColor: color }} />
              )}
              <div className="flex items-center gap-3 bg-white px-4 py-3">
                {logoUrl ? (
                  <img src={resolveMediaUrl(logoUrl) ?? ""} alt={store?.name} className="h-10 w-10 border border-border bg-white object-contain p-0.5" style={{ borderRadius: '2px' }} />
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

            <p className="mt-4 font-mono text-[11px] text-ink-2/70">
              Pré-visualização simples. Para uma ideia completa, abre a tua loja noutra aba.
            </p>
          </Section>
        )}

        {/* Barra de guardar (oculta na pré-visualização) */}
        {tab !== "preview" && (
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
        )}
      </form>
    </div>
  );
}
