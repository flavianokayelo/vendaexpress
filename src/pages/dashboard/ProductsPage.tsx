import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Package,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  X,
  ImagePlus,
  Check,
  Video,
  Film,
} from "lucide-react";
import {
  api,
  uploadProductImages,
  uploadProductVideo,
  aiAssistImage,
  resolveMediaUrl,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, placeholderImage } from "../../lib/format";
import { findColorByName } from "../../lib/colors";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Input, Field, Select, Textarea } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/Feedback";
import { ColorPicker } from "../../components/ui/ColorPicker";
import type { Product, Category, ProductCondition } from "../../lib/types";

const MAX_PHOTOS = 5;
const MAX_VIDEO_MB = 20;
const SIZE_PRESETS = ["Único", "S", "M", "L", "XL", "XXL"];

const DEFAULT_RETURN_POLICY =
  "Aceitamos devoluções em até 7 dias após a entrega, desde que o produto esteja no estado original e com a embalagem intacta.";

const CONDITION_LABEL: Record<ProductCondition, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
};

const empty = {
  name: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: "",
  color: "",
  color_hex: "",
  size: "",
  item_condition: "novo" as ProductCondition,
  category_id: "",
  return_policy: DEFAULT_RETURN_POLICY,
  active: true,
};

type ImageSlot = { url: string; hash: string; isNew: boolean; file?: File };
type VideoSlot = {
  url: string;
  thumbnailUrl: string | null;
  isNew: boolean;
  file?: File;
  thumbnailBlob?: Blob | null;
} | null;

function captureVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        resolve(null);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          resolve(blob);
        },
        "image/jpeg",
        0.8,
      );
    };
    video.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

function SizePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const isPreset = SIZE_PRESETS.includes(value);
  const [customMode, setCustomMode] = useState(value !== "" && !isPreset);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SIZE_PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange(s);
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              value === s && !customMode
                ? "border-blue-700 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomMode(true)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            customMode
              ? "border-blue-700 bg-blue-50 text-blue-700"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          Outro
        </button>
      </div>
      {customMode && (
        <Input
          className="mt-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: 42 (calçado), 1kg, 500ml..."
        />
      )}
    </div>
  );
}

function ProductCard({
  p,
  currency,
  onEdit,
  onRemove,
}: {
  p: Product;
  currency?: string;
  onEdit: (p: Product) => void;
  onRemove: (p: Product) => void;
}) {
  const thumb =
    resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) ||
    placeholderImage(p.name);
  const videoUrl = p.video ? resolveMediaUrl(p.video.url) : null;
  const [hovering, setHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => {
    if (!videoUrl) return;
    setHovering(true);
    videoRef.current?.play().catch(() => {});
  };
  const handleLeave = () => {
    if (!videoUrl) return;
    setHovering(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        className="relative h-40 overflow-hidden bg-slate-100"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <img src={thumb} alt={p.name} className="h-full w-full object-cover" />
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              hovering ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {!p.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60">
            <Badge color="slate">Inativo</Badge>
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {p.compare_at_price && p.compare_at_price > p.price && (
            <Badge color="red">Promoção</Badge>
          )}
          {videoUrl && (
            <span
              className={`flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium text-white transition-opacity duration-200 ${
                hovering ? "opacity-0" : "opacity-100"
              }`}
            >
              <Film size={11} /> Vídeo
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">{p.name}</h3>
          <div className="text-right">
            <div className="font-bold text-blue-800">
              {formatCurrency(Number(p.price), currency)}
            </div>
            {p.compare_at_price && p.compare_at_price > p.price && (
              <div className="text-xs text-slate-400 line-through">
                {formatCurrency(Number(p.compare_at_price), currency)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Stock: {p.stock}</span>
          {p.color && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600">
              <span
                className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                style={{
                  backgroundColor: p.color_hex || "#ccc",
                  boxShadow: "0 0 0 1.5px #fff",
                }}
              />
              {p.color}
            </span>
          )}
          {p.size && <span>• {p.size}</span>}
          <Badge color={p.item_condition === "novo" ? "green" : "amber"}>
            {CONDITION_LABEL[p.item_condition]}
          </Badge>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(p)}>
            <Pencil size={14} /> Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(p)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const { store } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [video, setVideo] = useState<VideoSlot>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiKeywords, setAiKeywords] = useState("");
  const [aiTextBusy, setAiTextBusy] = useState(false);
  const [aiTextError, setAiTextError] = useState<string | null>(null);

  const [aiImageBusy, setAiImageBusy] = useState(false);
  const [aiImageError, setAiImageError] = useState<string | null>(null);
  const [aiImageFromCache, setAiImageFromCache] = useState<boolean | null>(
    null,
  );

  const load = async () => {
    if (!store) return;
    try {
      const [p, c] = await Promise.all([
        api.products.list(),
        api.categories.list(),
      ]);
      setProducts(p);
      setCategories(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [store]);

  const resetAiState = () => {
    setAiKeywords("");
    setAiTextError(null);
    setAiImageError(null);
    setAiImageFromCache(null);
  };

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setImages([]);
    setVideo(null);
    setVideoError(null);
    resetAiState();
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      stock: String(p.stock),
      color: p.color ?? "",
      color_hex: p.color_hex ?? "",
      size: p.size ?? "",
      item_condition: p.item_condition ?? "novo",
      category_id: p.category_id ?? "",
      return_policy: p.return_policy ?? DEFAULT_RETURN_POLICY,
      active: p.active,
    });
    setImages(
      (p.images ?? []).map((photo) => ({
        url: photo.url,
        hash: photo.hash,
        isNew: false,
      })),
    );
    setVideo(
      p.video
        ? {
            url: p.video.url,
            thumbnailUrl: p.video.thumbnail_url,
            isNew: false,
          }
        : null,
    );
    setVideoError(null);
    resetAiState();
    setError(null);
    setModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = MAX_PHOTOS - images.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      url: URL.createObjectURL(file),
      hash: "",
      isNew: true,
      file,
    }));
    setImages((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setVideoError(null);

    if (!file.type.startsWith("video/")) {
      setVideoError("Escolhe um ficheiro de vídeo válido (mp4, webm, mov).");
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_MB) {
      setVideoError(
        `O vídeo tem ${sizeMB.toFixed(1)}MB — o limite é ${MAX_VIDEO_MB}MB.`,
      );
      return;
    }

    setVideoProcessing(true);
    const thumbnailBlob = await captureVideoThumbnail(file);
    setVideoProcessing(false);

    setVideo({
      url: URL.createObjectURL(file),
      thumbnailUrl: thumbnailBlob ? URL.createObjectURL(thumbnailBlob) : null,
      isNew: true,
      file,
      thumbnailBlob,
    });
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoError(null);
  };

  const runAiTextAssist = async () => {
    if (!aiKeywords.trim()) {
      setAiTextError("Escreve algumas palavras-chave do produto primeiro.");
      return;
    }
    setAiTextBusy(true);
    setAiTextError(null);
    try {
      const categoryName = categories.find(
        (c) => c.id === form.category_id,
      )?.name;
      const { name, description } = await api.products.aiAssist(
        aiKeywords,
        categoryName,
      );
      setForm((f) => ({
        ...f,
        name: name || f.name,
        description: description || f.description,
      }));
    } catch (err: any) {
      setAiTextError(err.message || "Erro ao gerar com IA");
    } finally {
      setAiTextBusy(false);
    }
  };

  const runAiImageAssist = async () => {
    const firstNew = images.find((img) => img.isNew && img.file);
    if (!firstNew?.file) {
      setAiImageError("Seleciona uma foto nova para analisar com IA.");
      return;
    }
    setAiImageBusy(true);
    setAiImageError(null);
    setAiImageFromCache(null);
    try {
      const { name, description, color, category, from_cache } =
        await aiAssistImage(firstNew.file);
      const matchedCategory = categories.find(
        (c) =>
          c.name.toLowerCase().trim() === (category || "").toLowerCase().trim(),
      );
      const matchedColor = color ? findColorByName(color) : undefined;
      setForm((f) => ({
        ...f,
        name: name || f.name,
        description: description || f.description,
        color: color || f.color,
        color_hex: matchedColor ? matchedColor.hex : f.color_hex,
        category_id: matchedCategory ? matchedCategory.id : f.category_id,
      }));
      setAiImageFromCache(from_cache);
    } catch (err: any) {
      setAiImageError(err.message || "Erro ao analisar imagem com IA");
    } finally {
      setAiImageBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setError(null);
    try {
      const newFiles = images
        .filter((img) => img.isNew && img.file)
        .map((img) => img.file!) as File[];
      let uploadedPhotos: { url: string; hash: string }[] = [];
      if (newFiles.length > 0) {
        setUploading(true);
        const res = await uploadProductImages(newFiles);
        uploadedPhotos = res.photos;
      }
      let uploadIdx = 0;
      const finalImages = images.map((img) =>
        img.isNew
          ? uploadedPhotos[uploadIdx++]
          : { url: img.url, hash: img.hash },
      );

      let finalVideo: { url: string; thumbnail_url: string | null } | null =
        null;
      if (video?.isNew && video.file) {
        const res = await uploadProductVideo(
          video.file,
          video.thumbnailBlob ?? null,
        );
        finalVideo = res;
      } else if (video && !video.isNew) {
        finalVideo = { url: video.url, thumbnail_url: video.thumbnailUrl };
      }
      setUploading(false);

      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        price: Number(form.price) || 0,
        compare_at_price: form.compare_at_price
          ? Number(form.compare_at_price)
          : null,
        stock: Number(form.stock) || 0,
        color: form.color || null,
        color_hex: form.color_hex || null,
        size: form.size || null,
        item_condition: form.item_condition,
        category_id: form.category_id || null,
        images: finalImages,
        video: finalVideo,
        active: form.active,
        return_policy: form.return_policy || null,
      };

      if (editing) {
        await api.products.update(editing.id, payload);
      } else {
        await api.products.create(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message || "Erro ao guardar produto");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Eliminar "${p.name}"?`)) return;
    try {
      await api.products.remove(p.id);
      await load();
    } catch (err: any) {
      alert(err.message || "Erro ao eliminar produto");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} produtos na tua loja`}
        action={
          <Button onClick={openNew}>
            <Plus size={16} /> Adicionar produto
          </Button>
        }
      />

      <div className="mb-4 relative max-w-xs">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <Input
          className="pl-9"
          placeholder="Procurar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-slate-400">A carregar...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="Nenhum produto"
          description="Adiciona o teu primeiro produto para começar a vender."
          action={
            <Button onClick={openNew}>
              <Plus size={16} /> Adicionar produto
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              currency={store?.currency}
              onEdit={openEdit}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar produto" : "Novo produto"}
        size="lg"
      >
        <form onSubmit={save} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Field
            label="Fotos do produto"
            hint={`Até ${MAX_PHOTOS} imagens. ${images.length}/${MAX_PHOTOS} selecionadas.`}
          >
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative h-20 w-20">
                  <img
                    src={img.isNew ? img.url : (resolveMediaUrl(img.url) ?? "")}
                    alt=""
                    className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.length < MAX_PHOTOS && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:border-blue-400 hover:text-blue-600">
                  <Plus size={18} />
                  Adicionar
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {uploading && (
              <p className="mt-1 text-xs text-blue-600">A enviar imagens...</p>
            )}
          </Field>

          <Field
            label="Vídeo do produto"
            hint={`Opcional. Até ${MAX_VIDEO_MB}MB (mp4, webm ou mov).`}
          >
            {video ? (
              <div className="flex items-start gap-3">
                <div className="relative aspect-video w-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <video
                    src={
                      video.isNew
                        ? video.url
                        : (resolveMediaUrl(video.url) ?? "")
                    }
                    poster={
                      video.isNew
                        ? (video.thumbnailUrl ?? undefined)
                        : (resolveMediaUrl(video.thumbnailUrl) ?? undefined)
                    }
                    controls
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeVideo}
                >
                  <X size={14} /> Remover vídeo
                </Button>
              </div>
            ) : (
              <label className="flex h-24 w-48 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:border-blue-400 hover:text-blue-600">
                <Video size={20} />
                {videoProcessing ? "A processar..." : "Adicionar vídeo"}
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoSelect}
                  className="hidden"
                  disabled={videoProcessing}
                />
              </label>
            )}
            {videoError && (
              <p className="mt-1 text-xs text-red-600">{videoError}</p>
            )}
          </Field>

          <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
              <Sparkles size={16} /> Preencher com IA
            </div>

            <div>
              <div className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                <ImagePlus size={13} /> A partir da foto
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={runAiImageAssist}
                disabled={aiImageBusy || !images.some((i) => i.isNew)}
                className="w-full"
              >
                {aiImageBusy ? "A analisar..." : "Analisar primeira foto nova"}
              </Button>
              {aiImageError && (
                <p className="mt-1 text-xs text-red-600">{aiImageError}</p>
              )}
              {aiImageFromCache !== null && !aiImageError && (
                <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <Check size={12} />
                  {aiImageFromCache
                    ? "Resultado veio da cache (0 créditos gastos)"
                    : "Analisado agora com IA"}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-slate-600">
                Ou por palavras-chave
              </div>
              <div className="flex gap-2">
                <Input
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  placeholder="Ex: auscultadores bluetooth, cancelamento de ruído, 20h bateria"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={runAiTextAssist}
                  disabled={aiTextBusy}
                >
                  {aiTextBusy ? "A gerar..." : "Gerar"}
                </Button>
              </div>
              {aiTextError && (
                <p className="mt-1 text-xs text-red-600">{aiTextError}</p>
              )}
            </div>
          </div>

          <Field label="Nome do produto">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Descrição">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Preço (Kz)">
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </Field>
            <Field label="Preço antigo (promoção)" hint="Opcional">
              <Input
                type="number"
                step="0.01"
                value={form.compare_at_price}
                onChange={(e) =>
                  setForm({ ...form, compare_at_price: e.target.value })
                }
              />
            </Field>
            <Field label="Stock">
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria">
              <Select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Estado">
              <Select
                value={form.item_condition}
                onChange={(e) =>
                  setForm({
                    ...form,
                    item_condition: e.target.value as ProductCondition,
                  })
                }
              >
                <option value="novo">Novo</option>
                <option value="usado">Usado</option>
                <option value="recondicionado">Recondicionado</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cor" hint="Opcional">
              <ColorPicker
                value={form.color}
                valueHex={form.color_hex}
                onChange={(name, hex) =>
                  setForm({ ...form, color: name, color_hex: hex })
                }
              />
            </Field>
            <Field label="Tamanho" hint="Opcional">
              <SizePicker
                value={form.size}
                onChange={(size) => setForm({ ...form, size })}
              />
            </Field>
          </div>

          <Field label="Política de devolução">
            <Textarea
              rows={2}
              value={form.return_policy}
              onChange={(e) =>
                setForm({ ...form, return_policy: e.target.value })
              }
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded"
            />
            Produto ativo (visível na loja)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
