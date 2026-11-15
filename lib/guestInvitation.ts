import { supabase } from "./supabase";

export type RsvpStatus = "hadir" | "tidak_hadir" | "ragu";

export interface TamuWithRsvp {
  id_tamu: string;
  id_undangan: string;
  nama_tamu: string;
  kode: string;
  kuota: number;
  rsvp_status?: RsvpStatus | null;
  rsvp_jumlah_hadir?: number | null;
  rsvp_tgl_konfirmasi?: string | null;
}

export interface UndanganData {
  id_undangan: string;
  slug: string;
  nama_pria: string;
  nama_wanita: string;
  tgl_acara: string;
  tempat: string;
  alamat: string;
  link_maps?: string | null;
}

function isValidRsvpStatus(value: unknown): value is RsvpStatus {
  return value === "hadir" || value === "tidak_hadir" || value === "ragu";
}

/**
 * Fetch a single guest and their RSVP status strictly by invitation code via
 * the SECURITY DEFINER `get_guest_by_code` RPC (never matches partial names).
 */
export async function getGuestByCode(
  kode: string,
  idUndangan?: string | null
): Promise<TamuWithRsvp | null> {
  const cleanCode = kode.trim();
  if (!cleanCode) return null;

  const { data, error } = await supabase.rpc("get_guest_by_code", {
    p_kode: cleanCode,
    p_id_undangan: idUndangan || null,
  });

  if (error || !data) return null;

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
  if (!row || typeof row.id_tamu !== "string") return null;

  return {
    id_tamu: row.id_tamu,
    id_undangan: String(row.id_undangan || ""),
    nama_tamu: String(row.nama_tamu || ""),
    kode: String(row.kode || cleanCode),
    kuota: Number(row.kuota) || 1,
    rsvp_status: isValidRsvpStatus(row.rsvp_status) ? row.rsvp_status : null,
    rsvp_jumlah_hadir:
      typeof row.rsvp_jumlah_hadir === "number" ? row.rsvp_jumlah_hadir : null,
    rsvp_tgl_konfirmasi:
      typeof row.rsvp_tgl_konfirmasi === "string" ? row.rsvp_tgl_konfirmasi : null,
  };
}

/**
 * Resolve the active invitation row (by slug when provided, falling back to the
 * primary active row) along with the matched guest record if a code was given.
 */
export async function resolveInvitationAndGuest({
  slug,
  guestCode = "",
}: {
  slug?: string;
  guestCode?: string;
}): Promise<{
  undangan: UndanganData | null;
  tamu: TamuWithRsvp | null;
}> {
  let undangan: UndanganData | null = null;

  if (slug) {
    const { data } = await supabase
      .from("undangan")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    undangan = (data as UndanganData | null) || null;
  }

  if (!undangan) {
    const { data: fallbackUndangan } = await supabase
      .from("undangan")
      .select("*")
      .limit(1)
      .maybeSingle();
    undangan = (fallbackUndangan as UndanganData | null) || null;
  }

  const tamu =
    guestCode && undangan?.id_undangan
      ? await getGuestByCode(guestCode, undangan.id_undangan)
      : null;

  return { undangan, tamu };
}

/**
 * Build dynamic Next.js Metadata based on the resolved invitation & guest record.
 */
export function buildInvitationMetadata({
  undangan,
  tamu,
}: {
  undangan?: UndanganData | null;
  tamu?: TamuWithRsvp | null;
}) {
  const groom = undangan?.nama_pria ? undangan.nama_pria.trim().split(" ")[0] : "";
  const bride = undangan?.nama_wanita ? undangan.nama_wanita.trim().split(" ")[0] : "";
  const couple = groom && bride ? `${groom} & ${bride}` : null;

  const baseTitle = couple ? `The Wedding of ${couple}` : "Undangan Pernikahan Digital";

  const title = tamu?.nama_tamu
    ? `Undangan: ${tamu.nama_tamu} — ${baseTitle}`
    : baseTitle;

  const description = tamu?.nama_tamu
    ? `Kepada Yth. ${tamu.nama_tamu}, Anda diundang untuk merayakan momen bahagia pernikahan ${couple || "kami"} bersama WeddingMu.`
    : `Rayakan momen bahagia pernikahan ${couple || ""} bersama WeddingMu.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website" as const,
    },
  };
}


