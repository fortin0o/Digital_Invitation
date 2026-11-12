import { supabase } from "./supabase";

export type AdminRole = "super_admin" | "admin";

export const PASSCODE_USER_KEY = "admin_auth_user";
export const PASSCODE_ROLE_KEY = "admin_auth_role";

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
  err: SupabaseErrorLike | null | undefined,
  hasSupabaseSession = true
): string {
  if (!hasSupabaseSession || isRlsPermissionError(err)) {
    const detail = err?.message ? ` (${err.message})` : "";
    return `Gagal ${actionLabel}: ditolak oleh keamanan Row Level Security (RLS)${detail}. Pastikan Anda masuk melalui tab Supabase Auth, bukan hanya Sandi Cepat (Pratinjau).`;
  }
  return `Gagal ${actionLabel}: ${err?.message || "terjadi kesalahan pada server."}`;
}

/** Clear local passcode preview credentials from browser storage. */
export function clearLocalPasscodeSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PASSCODE_USER_KEY);
  localStorage.removeItem(PASSCODE_ROLE_KEY);
}

export interface AdminAccessResult {
  authorized: boolean;
  role: AdminRole | null;
  reason?: string;
}

/**
 * Verify whether an email is authorized in `public.admin_users` and return its role.
 * Rejects unlisted emails whenever `admin_users` is provisioned; falls back to dev heuristic
 * only when the `admin_users` table itself does not exist yet.
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
    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("email", normalized)
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

