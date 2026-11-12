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

