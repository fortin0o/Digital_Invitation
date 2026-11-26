import { useSyncExternalStore } from "react";

export interface ExtraInvitationContent {
  // Orang Tua Mempelai Wanita
  brideParents: string;
  brideParentsPrefix: string;

  // Orang Tua Mempelai Pria
  groomParents: string;
  groomParentsPrefix: string;

  // Akun Instagram
  brideInstagram: string;
  groomInstagram: string;

  // Kutipan & Ayat Suci
  quoteRomantic: string;
  quoteVerse: string;
  quoteSource: string;

  // Rekening Bank Amplop Digital
  bank1Name: string;
  bank1Number: string;
  bank1Holder: string;

  bank2Name: string;
  bank2Number: string;
  bank2Holder: string;
}

export const DEFAULT_EXTRA_CONTENT: ExtraInvitationContent = {
  brideParents: "Bpk. Joko Purnomo & Ibu Endang Sulastri",
  brideParentsPrefix: "Putri tercinta dari keluarga",

  groomParents: "Bpk. Bambang Wicaksono & Ibu Sri Wahyuni",
  groomParentsPrefix: "Putra tercinta dari keluarga",

  brideInstagram: "@sekar.kinanti",
  groomInstagram: "@arya.suryo",

  quoteRomantic:
    "Dua hati, satu janji suci, melangkah bersama menuju masa depan yang penuh cinta, tawa, dan keberkahan.",
  quoteVerse:
    "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
  quoteSource: "QS. Ar-Rum : 21",

  bank1Name: "Bank BCA",
  bank1Number: "8120938471",
  bank1Holder: "Arya Suryo Wicaksono",

  bank2Name: "Bank Mandiri",
  bank2Number: "1380029384712",
  bank2Holder: "Sekar Arum Kinanti",
};

const EXTRA_CONTENT_STORAGE_KEY = "wedding_extra_invitation_content";

let cachedSnapshot: ExtraInvitationContent = DEFAULT_EXTRA_CONTENT;
let lastRaw: string | null = null;

export function getStoredExtraContent(): ExtraInvitationContent {
  if (typeof window === "undefined") {
    return DEFAULT_EXTRA_CONTENT;
  }

  try {
    const raw = localStorage.getItem(EXTRA_CONTENT_STORAGE_KEY);
    if (raw === lastRaw) {
      return cachedSnapshot;
    }
    lastRaw = raw;
    if (!raw) {
      cachedSnapshot = DEFAULT_EXTRA_CONTENT;
      return cachedSnapshot;
    }
    const parsed = JSON.parse(raw);
    cachedSnapshot = {
      brideParents: parsed.brideParents || DEFAULT_EXTRA_CONTENT.brideParents,
      brideParentsPrefix: parsed.brideParentsPrefix || DEFAULT_EXTRA_CONTENT.brideParentsPrefix,
      groomParents: parsed.groomParents || DEFAULT_EXTRA_CONTENT.groomParents,
      groomParentsPrefix: parsed.groomParentsPrefix || DEFAULT_EXTRA_CONTENT.groomParentsPrefix,

      brideInstagram: parsed.brideInstagram || DEFAULT_EXTRA_CONTENT.brideInstagram,
      groomInstagram: parsed.groomInstagram || DEFAULT_EXTRA_CONTENT.groomInstagram,

      quoteRomantic: parsed.quoteRomantic || DEFAULT_EXTRA_CONTENT.quoteRomantic,
      quoteVerse: parsed.quoteVerse || DEFAULT_EXTRA_CONTENT.quoteVerse,
      quoteSource: parsed.quoteSource || DEFAULT_EXTRA_CONTENT.quoteSource,

      bank1Name: parsed.bank1Name || DEFAULT_EXTRA_CONTENT.bank1Name,
      bank1Number: parsed.bank1Number || DEFAULT_EXTRA_CONTENT.bank1Number,
      bank1Holder: parsed.bank1Holder || DEFAULT_EXTRA_CONTENT.bank1Holder,

      bank2Name: parsed.bank2Name || DEFAULT_EXTRA_CONTENT.bank2Name,
      bank2Number: parsed.bank2Number || DEFAULT_EXTRA_CONTENT.bank2Number,
      bank2Holder: parsed.bank2Holder || DEFAULT_EXTRA_CONTENT.bank2Holder,
    };
    return cachedSnapshot;
  } catch {
    cachedSnapshot = DEFAULT_EXTRA_CONTENT;
    return cachedSnapshot;
  }
}

function getServerSnapshot(): ExtraInvitationContent {
  return DEFAULT_EXTRA_CONTENT;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === EXTRA_CONTENT_STORAGE_KEY || e.key === null) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function saveStoredExtraContent(content: ExtraInvitationContent): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(content);
    localStorage.setItem(EXTRA_CONTENT_STORAGE_KEY, raw);
    cachedSnapshot = content;
    lastRaw = raw;
    listeners.forEach((l) => l());
  } catch (e) {
    console.error("Gagal menyimpan konfigurasi konten tambahan ke localStorage:", e);
  }
}

/**
 * React hook to safely subscribe to extra content without SSR hydration mismatch.
 * Uses getServerSnapshot during SSR/hydration, and automatically updates with getSnapshot.
 */
export function useExtraInvitationContent(): ExtraInvitationContent {
  return useSyncExternalStore(subscribe, getStoredExtraContent, getServerSnapshot);
}
