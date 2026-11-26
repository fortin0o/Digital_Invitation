export interface WaShareConfig {
  domainMode: "production" | "auto" | "custom";
  customDomain: string;
  template: string;
}

export const DEFAULT_PRODUCTION_DOMAIN = "https://weddingmu.web.id";

export const DEFAULT_WA_TEMPLATE = `Halo {nama}!

Tanpa mengurangi rasa hormat, kami bermaksud mengundang Anda untuk hadir dan merayakan hari bahagia kami: The Wedding of {mempelai}.

Berikut tautan undangan spesial Anda:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Anda berkenan hadir. Terima kasih banyak.
- {mempelai}`;

export interface WaTemplatePreset {
  id: string;
  name: string;
  template: string;
}

export const WA_TEMPLATE_PRESETS: WaTemplatePreset[] = [
  {
    id: "formal",
    name: "Formal",
    template: `Kepada Yth. {nama},

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di acara pernikahan kami: The Wedding of {mempelai}.

Buka tautan undangan resmi Anda di sini:
{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu. Terima kasih banyak.
- {mempelai}`,
  },
  {
    id: "santai",
    name: "Santai / Sahabat",
    template: `Halo {nama}!

Kabar bahagia untuk kita semua! Kami mengundang kamu untuk hadir dan merayakan hari pernikahan kami: The Wedding of {mempelai}.

Buka tautan undangan spesialmu di sini ya:
{link}

Kehadiran dan doa restumu sangat berharga bagi kami. Sampai jumpa di hari bahagia kami!
- {mempelai}`,
  },
  {
    id: "islami",
    name: "Islami",
    template: `Assalamu'alaikum Warahmatullahi Wabarakatuh,
Yth. {nama},

Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Anda untuk hadir pada acara pernikahan kami: The Wedding of {mempelai}.

Tautan undangan resmi:
{link}

Jazakumullah khairan katsiran atas doa restu dan kehadiran Anda.
Wassalamu'alaikum Wr. Wb.
- {mempelai}`,
  },
  {
    id: "singkat",
    name: "Singkat",
    template: `Undangan Pernikahan {mempelai}
Spesial untuk: {nama}

Buka undangan personal di tautan berikut:
{link}

Mohon doa restu dan konfirmasi kehadirannya ya. Terima kasih!
- {mempelai}`,
  },
];

const STORAGE_KEY = "wedding_wa_share_config";

export function getStoredWaConfig(): WaShareConfig {
  const defaultConfig: WaShareConfig = {
    domainMode: "production",
    customDomain: DEFAULT_PRODUCTION_DOMAIN,
    template: DEFAULT_WA_TEMPLATE,
  };

  if (typeof window === "undefined") {
    return defaultConfig;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw);
    return {
      domainMode: parsed.domainMode || "production",
      customDomain: parsed.customDomain || DEFAULT_PRODUCTION_DOMAIN,
      template: typeof parsed.template === "string" ? parsed.template : DEFAULT_WA_TEMPLATE,
    };
  } catch {
    return defaultConfig;
  }
}

export function saveStoredWaConfig(config: WaShareConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Gagal menyimpan konfigurasi WA ke localStorage:", e);
  }
}

export function getEffectiveBaseDomain(config: WaShareConfig): string {
  if (config.domainMode === "production") {
    return DEFAULT_PRODUCTION_DOMAIN.replace(/\/+$/, "");
  }
  if (config.domainMode === "custom" && config.customDomain.trim()) {
    return config.customDomain.trim().replace(/\/+$/, "");
  }
  // Auto / current origin
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return DEFAULT_PRODUCTION_DOMAIN;
}

export function buildInvitationUrl(
  code: string,
  slug?: string,
  config?: WaShareConfig
): string {
  const currentConfig = config || getStoredWaConfig();
  const baseDomain = getEffectiveBaseDomain(currentConfig);
  const cleanCode = encodeURIComponent(code.trim());

  if (slug && slug.trim()) {
    return `${baseDomain}/${slug.trim()}/${cleanCode}`;
  }
  return `${baseDomain}/?to=${cleanCode}`;
}

export function buildWaMessage(
  nama: string,
  code: string,
  slug?: string,
  coupleName: string = "Arya & Sekar",
  config?: WaShareConfig
): string {
  const currentConfig = config || getStoredWaConfig();
  const invitationUrl = buildInvitationUrl(code, slug, currentConfig);

  let message = currentConfig.template || DEFAULT_WA_TEMPLATE;
  message = message.replace(/\{nama\}/gi, nama.trim());
  message = message.replace(/\{link\}/gi, invitationUrl);
  message = message.replace(/\{mempelai\}/gi, coupleName.trim());

  return message;
}

