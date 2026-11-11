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

/**
 * Resolve an authenticated user's admin role from `public.admin_users`.
 * Falls back to email heuristic only when the `admin_users` table does not exist yet.
 */
export async function resolveAdminRole(email: string): Promise<AdminRole> {
  const normalized = email.trim().toLowerCase();
  const isDevPattern = normalized.includes("dev") || normalized.includes("superadmin");

  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("email", normalized)
      .maybeSingle();

    if (data?.role === "super_admin" || data?.role === "admin") {
      return data.role;
    }

    // Table exists and responded without error, but email is not listed as super_admin
    if (!error) {
      return "admin";
    }

    // Fallback only while public.admin_users has not been provisioned
    return isMissingTableError(error) && isDevPattern ? "super_admin" : "admin";
  } catch {
    return isDevPattern ? "super_admin" : "admin";
  }
}

