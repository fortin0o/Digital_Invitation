import { supabase } from "./supabase";

export type AdminRole = "super_admin" | "admin";

interface SupabaseErrorLike {
  code?: string;
  message?: string;
}

/** Check if a PostgREST/Postgres error indicates a missing table (e.g. schema cache PGRST205). */
export function isMissingTableError(err: SupabaseErrorLike | null | undefined): boolean {
  if (!err) return false;
  return (
    err.code === "PGRST205" ||
    err.code === "42P01" ||
    Boolean(err.message?.includes("Could not find the table"))
  );
}

/** Check if a Supabase error is a Row Level Security (42501) authorization error. */
export function isRlsPermissionError(err: SupabaseErrorLike | null | undefined): boolean {
  if (!err) return false;
  return (
    err.code === "42501" ||
    Boolean(err.message?.toLowerCase().includes("row-level security"))
  );
}

/** Format an explicit, actionable error message for failed Supabase admin write/delete actions. */
export function formatWriteErrorMessage(
  actionLabel: string,
  err: SupabaseErrorLike | null | undefined
): string {
  if (isRlsPermissionError(err)) {
    const detail = err?.message ? ` (${err.message})` : "";
    return `Gagal ${actionLabel}: ditolak oleh keamanan Row Level Security (RLS)${detail}. Pastikan akun Anda terdaftar di admin_users dan sesi Supabase Auth masih aktif.`;
  }
  return `Gagal ${actionLabel}: ${err?.message || "terjadi kesalahan pada server."}`;
}

export interface AdminAccessResult {
  authorized: boolean;
  role: AdminRole | null;
  reason?: string;
}

/**
 * Verify whether an email is authorized in `public.admin_users` and return its role.
 * Uses the `check_admin_allowlist` RPC so unauthenticated pre-checks never require
 * exposing the full `admin_users` table to `anon`. Falls back to case-insensitive table
 * lookup when the RPC is not provisioned yet, or dev heuristic only if `admin_users` is missing.
 */
export async function verifyAdminAccess(email: string): Promise<AdminAccessResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return {
      authorized: false,
      role: null,
      reason: "Email tidak boleh kosong.",
    };
  }

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "check_admin_allowlist",
      { p_email: normalized }
    );

    if (!rpcError) {
      const row = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as {
        authorized?: boolean;
        role?: string | null;
      } | null;

      if (row?.authorized && (row.role === "super_admin" || row.role === "admin")) {
        return { authorized: true, role: row.role };
      }
      return {
        authorized: false,
        role: null,
        reason: `Email "${normalized}" belum terdaftar di daftar administrator (admin_users). Hubungi Super Admin untuk mendaftarkan email Anda.`,
      };
    }

    if (isMissingTableError(rpcError)) {
      const isDevPattern = normalized.includes("dev") || normalized.includes("superadmin");
      return {
        authorized: true,
        role: isDevPattern ? "super_admin" : "admin",
      };
    }

    const isMissingRpc =
      rpcError.code === "PGRST202" ||
      rpcError.code === "42883" ||
      Boolean(rpcError.message?.includes("Could not find the function"));

    if (isMissingRpc) {
      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .ilike("email", normalized)
        .limit(1)
        .maybeSingle();

      if (!error) {
        if (data?.role === "super_admin" || data?.role === "admin") {
          return { authorized: true, role: data.role };
        }
        return {
          authorized: false,
          role: null,
          reason: `Email "${normalized}" belum terdaftar di daftar administrator (admin_users). Hubungi Super Admin untuk mendaftarkan email Anda.`,
        };
      }

      if (isMissingTableError(error)) {
        const isDevPattern = normalized.includes("dev") || normalized.includes("superadmin");
        return {
          authorized: true,
          role: isDevPattern ? "super_admin" : "admin",
        };
      }

      return {
        authorized: false,
        role: null,
        reason: `Gagal memverifikasi hak akses admin: ${error.message}`,
      };
    }

    return {
      authorized: false,
      role: null,
      reason: `Gagal memverifikasi hak akses admin: ${rpcError.message}`,
    };
  } catch (err) {
    return {
      authorized: false,
      role: null,
      reason:
        err instanceof Error
          ? `Gagal memverifikasi hak akses admin: ${err.message}`
          : "Gagal memverifikasi hak akses admin.",
    };
  }
}

