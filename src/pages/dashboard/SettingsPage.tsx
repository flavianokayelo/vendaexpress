import { useEffect, useState, type ReactNode } from "react";
import {
  User,
  MapPin,
  Store,
  Clock,
  Check,
  Globe,
  AlertCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { PageHeader } from "./Shell";
import { Button } from "../../components/ui/Button";
import { Input, Field, Select, Textarea } from "../../components/ui/Field";
import { Surface } from "../../components/ui/Surface";
import { useToast } from "../../components/ui/Toast";
import { veStorage } from "../../lib/client-storage";
import type { HoursSettings } from "../../lib/client-storage";
import { STORE_DAYS } from "../../lib/client-storage";

type SettingsTab = "profile" | "address" | "store" | "hours";

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Meu Perfil", icon: User },
  { id: "address", label: "Endereço", icon: MapPin },
  { id: "store", label: "Informações da Loja", icon: Store },
  { id: "hours", label: "Horários", icon: Clock },
];

const CURRENCIES = [
  { value: "AOA", label: "Kwanza (AOA)" },
  { value: "USD", label: "Dólar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "BRL", label: "Real (BRL)" },
];

const PROVINCES = [
  "Luanda",
  "Benguela",
  "Huambo",
  "Lobito",
  "Huíla",
  "Cabinda",
  "Malanje",
  "Uíge",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{8,}$/;

function validatePhone(value: string): string | null {
  if (!value.trim()) return null;
  if (!PHONE_RE.test(value.trim()))
    return "Indica um número válido, ex: +244 923 000 000";
  return null;
}

function SectionHeader({
  icon,
  label,
  iconBg = "bg-accent/10 text-accent",
}: {
  icon: ReactNode;
  label: string;
  iconBg?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span
        className={`flex h-6 w-6 items-center justify-center ${iconBg}`}
        style={{ borderRadius: "2px" }}
      >
        {icon}
      </span>
      <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-2">
        {label}
      </span>
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return (
    <section
      className="border border-border bg-paper p-6"
      style={{ borderRadius: "2px" }}
    >
      {children}
    </section>
  );
}

function SaveBar({
  saving,
  saved,
  disabled,
  error,
}: {
  saving: boolean;
  saved: boolean;
  disabled?: boolean;
  error?: string | null;
}) {
  return (
    <div className="mt-6 border-t border-border pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving || disabled}>
          {saving ? "A guardar..." : "Guardar alterações"}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[13px] font-semibold text-success">
            <Check size={15} /> Guardado
          </span>
        )}
      </div>
      {error && (
        <p className="mt-3 flex items-center gap-1.5 font-mono text-[12px] font-semibold text-danger">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <span className="mt-1 block font-mono text-[11px] font-semibold text-danger">
      {message}
    </span>
  );
}

export function SettingsPage() {
  const { store, refreshStore, user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<SettingsTab>("store");
  const slug = store?.slug ?? "";

  // Informações da loja (persistidas no servidor)
  const [name, setName] = useState(store?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp ?? "");
  const [currency, setCurrency] = useState(store?.currency ?? "AOA");
  const [description, setDescription] = useState(store?.description ?? "");

  // Perfil / Endereço / Horários — persistidos localmente (veStorage)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  const [province, setProvince] = useState("Luanda");
  const [municipality, setMunicipality] = useState("");
  const [street, setStreet] = useState("");
  const [reference, setReference] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");

  const [hours, setHours] = useState<HoursSettings>(() =>
    STORE_DAYS.reduce<HoursSettings>((acc, day) => {
      acc[day] = { open: day !== "Domingo", from: "08:00", to: "18:00" };
      if (day === "Sábado") acc[day] = { open: true, from: "09:00", to: "13:00" };
      if (day === "Domingo") acc[day] = { open: false, from: "09:00", to: "13:00" };
      return acc;
    }, {} as HoursSettings)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Hidrata a partir do servidor quando a loja muda
  useEffect(() => {
    if (store) {
      setName(store.name);
      setWhatsapp(store.whatsapp ?? "");
      setCurrency(store.currency ?? "AOA");
      setDescription(store.description ?? "");
    }
  }, [store]);

  // Hidrata Perfil / Endereço / Horários a partir do storage local
  useEffect(() => {
    if (slug) {
      const profile = veStorage.profile.getProfile(slug);
      setFullName((prev) => profile.name || prev);
      setEmail(profile.email || user?.email || "");
      setProfilePhone(profile.whatsapp || "");
      setPhoneError(validatePhone(profile.whatsapp));

      const addr = veStorage.address.getAddress(slug);
      setProvince(addr.province || "Luanda");
      setMunicipality(addr.municipality);
      setStreet(addr.street);
      setReference(addr.reference);
      setPickupPoint(addr.pickupPoint);

      setHours(veStorage.hours.getHours(slug));
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [slug, user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setFormError(null);
    try {
      await api.stores.update({
        name,
        whatsapp: whatsapp || null,
        currency,
        description: description || null,
      });
      await refreshStore();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao guardar alterações",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    const phoneProblem = validatePhone(profilePhone);
    setPhoneError(phoneProblem);
    if (phoneProblem) return;

    const emailClean = email.trim();
    if (!emailClean) {
      toast.error("Indica o teu e-mail");
      return;
    }
    if (!EMAIL_RE.test(emailClean)) {
      toast.error("Indica um e-mail válido");
      return;
    }

    veStorage.profile.setProfile(slug, {
      name: fullName.trim(),
      email: emailClean,
      whatsapp: profilePhone.trim(),
    });
    flashLocalSaved();
  };

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    if (!province.trim() || !municipality.trim() || !street.trim()) {
      toast.error("Preenche província, município e rua/bairro");
      return;
    }
    veStorage.address.setAddress(slug, {
      province: province.trim(),
      municipality: municipality.trim(),
      street: street.trim(),
      reference: reference.trim(),
      pickupPoint: pickupPoint.trim(),
    });
    flashLocalSaved();
  };

  const saveHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    for (const day of STORE_DAYS) {
      const slot = hours[day];
      if (slot.open && (!slot.from || !slot.to)) {
        toast.error(`Define o horário de ${day}`);
        return;
      }
      if (slot.open && slot.from >= slot.to) {
        toast.error(`Horário de ${day} inválido (abertura antes do fecho)`);
        return;
      }
    }
    veStorage.hours.setHours(slug, hours);
    flashLocalSaved();
  };

  const flashLocalSaved = () => {
    setLocalSaved(true);
    setTimeout(() => setLocalSaved(false), 2000);
  };

  const localSaveBar = <SaveBar saving={false} saved={localSaved} disabled={!slug} />;

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Dados da conta e da tua loja" />

      {/* Tabs */}
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

      <div className="max-w-2xl space-y-6">
        {/* ─── MEU PERFIL ─── */}
        {tab === "profile" && (
          <form onSubmit={saveProfile}>
            <Section>
              <SectionHeader icon={<User size={14} />} label="Dados pessoais" />
              <div className="space-y-4">
                <Field label="Nome completo">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Maria dos Santos"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="E-mail" hint="Usado para contacto e para entrares na conta">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: maria@email.com"
                    />
                  </Field>
                  <Field label="Telefone">
                    <Input
                      value={profilePhone}
                      onChange={(e) => {
                        setProfilePhone(e.target.value);
                        setPhoneError(null);
                      }}
                      placeholder="+244 9XX XXX XXX"
                    />
                    <FieldError message={phoneError} />
                  </Field>
                </div>
              </div>
              <p className="mt-4 font-mono text-[11px] text-ink-2">
                Guardado neste dispositivo. Estes dados serão usados para
                contacto e suporte da tua conta.
              </p>
              {localSaveBar}
            </Section>
          </form>
        )}

        {/* ─── ENDEREÇO ─── */}
        {tab === "address" && (
          <form onSubmit={saveAddress}>
            <Section>
              <SectionHeader icon={<MapPin size={14} />} label="Ponto de origem" />
              <p className="-mt-3 mb-5 font-mono text-[12px] text-ink-2">
                O endereço de partida para entregas e ponto de retirada para os
                teus clientes.
              </p>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Província">
                    <Select value={province} onChange={(e) => setProvince(e.target.value)}>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Município">
                    <Input
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      placeholder="Ex: Talatona"
                    />
                  </Field>
                </div>
                <Field label="Rua / Bairro">
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Rua das Flores, Bairro Palanca"
                  />
                </Field>
                <Field label="Ponto de referência" hint="Opcional — ajuda os clientes a encontrar-te.">
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Ao lado do mercado"
                  />
                </Field>
                <Field label="Ponto de retirada">
                  <Input
                    value={pickupPoint}
                    onChange={(e) => setPickupPoint(e.target.value)}
                    placeholder="Ex: Loja física / Portaria do prédio"
                  />
                </Field>
              </div>
              <p className="mt-4 font-mono text-[11px] text-ink-2">
                Guardado neste dispositivo. Em breve, o cliente verá este
                endereço ao finalizar a compra.
              </p>
              {localSaveBar}
            </Section>
          </form>
        )}

        {/* ─── INFORMAÇÕES DA LOJA ─── */}
        {tab === "store" && (
          <>
            <form onSubmit={save}>
              <Section>
                <SectionHeader icon={<Store size={14} />} label="Dados gerais" />
                <div className="space-y-4">
                  <Field label="Nome da loja">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Moeda">
                      <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {CURRENCIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="WhatsApp" hint="Para receberes pedidos">
                      <Input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+244 9XX XXX XXX"
                      />
                    </Field>
                  </div>
                  <Field label="Descrição da loja">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Uma loja angolana com o melhor da eletrónica e moda."
                    />
                  </Field>
                </div>
                <SaveBar saving={saving} saved={saved} error={formError} />
              </Section>
            </form>

            <Surface className="p-6">
              <SectionHeader icon={<Globe size={14} />} label="Domínio" />
              <div className="flex items-center gap-3 rounded-[2px] border border-border-2 bg-accent-soft/30 px-4 py-3">
                <Globe size={17} className="text-ink-2" />
                <span className="font-mono text-[14px] font-semibold text-ink">
                  {store?.slug}.vendaexpress.ao
                </span>
              </div>
              <p className="mt-3 font-mono text-[12px] text-ink-2">
                No plano Premium podes ligar um domínio próprio.
              </p>
            </Surface>
          </>
        )}

        {/* ─── HORÁRIOS ─── */}
        {tab === "hours" && (
          <form onSubmit={saveHours}>
            <Section>
              <SectionHeader icon={<Clock size={14} />} label="Horários de funcionamento" />
              <p className="-mt-3 mb-5 font-mono text-[12px] text-ink-2">
                Define os dias e horários em que a tua loja está a operar.
              </p>
              <div className="space-y-3">
                {STORE_DAYS.map((day) => {
                  const slot = hours[day];
                  return (
                    <div
                      key={day}
                      className="flex flex-wrap items-center gap-3 rounded-[2px] border border-border px-4 py-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={slot.open}
                          onClick={() =>
                            setHours((prev) => ({ ...prev, [day]: { ...prev[day], open: !prev[day].open } }))
                          }
                          className={`relative h-5 w-9 flex-shrink-0 transition-colors ${slot.open ? "bg-accent" : "bg-ink/15"}`}
                          style={{ borderRadius: "2px" }}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 bg-white transition-transform ${slot.open ? "translate-x-4" : "translate-x-0.5"}`}
                            style={{ borderRadius: "1px" }}
                          />
                        </button>
                        <span className={`font-mono text-[13px] font-semibold ${slot.open ? "text-ink" : "text-ink-2"}`}>
                          {day}
                        </span>
                        {!slot.open && (
                          <span className="font-mono text-[11px] text-ink-2">Fechado</span>
                        )}
                      </div>
                      {slot.open && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot.from}
                            onChange={(e) =>
                              setHours((prev) => ({ ...prev, [day]: { ...prev[day], from: e.target.value } }))
                            }
                            className="w-[110px] py-1.5 text-[13px]"
                          />
                          <span className="font-mono text-[12px] text-ink-2">até</span>
                          <Input
                            type="time"
                            value={slot.to}
                            onChange={(e) =>
                              setHours((prev) => ({ ...prev, [day]: { ...prev[day], to: e.target.value } }))
                            }
                            className="w-[110px] py-1.5 text-[13px]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 font-mono text-[11px] text-ink-2">
                Guardado neste dispositivo. Em breve, estes horários aparecerão
                na tua loja para informar os clientes.
              </p>
              {localSaveBar}
            </Section>
          </form>
        )}
      </div>
    </div>
  );
}