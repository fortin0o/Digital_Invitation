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

export function getStoredExtraContent(): ExtraInvitationContent {
  if (typeof window === "undefined") {
    return DEFAULT_EXTRA_CONTENT;
  }

  try {
    const raw = localStorage.getItem(EXTRA_CONTENT_STORAGE_KEY);
    if (!raw) return DEFAULT_EXTRA_CONTENT;
    const parsed = JSON.parse(raw);
    return {
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
  } catch {
    return DEFAULT_EXTRA_CONTENT;
  }
}

export function saveStoredExtraContent(content: ExtraInvitationContent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXTRA_CONTENT_STORAGE_KEY, JSON.stringify(content));
  } catch (e) {
    console.error("Gagal menyimpan konfigurasi konten tambahan ke localStorage:", e);
  }
}
