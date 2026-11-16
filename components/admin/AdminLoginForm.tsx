"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  AdminRole,
  verifyAdminAccess,
} from "@/lib/adminAuth";
import NeoSticker from "@/components/ui/NeoSticker";
import NeoDivider from "@/components/ui/NeoDivider";

interface AdminLoginFormProps {
  onLoginSuccess: (email?: string, role?: AdminRole) => void;
  initialError?: string | null;
}

export default function AdminLoginForm({
  onLoginSuccess,
  initialError = null,
}: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const emailClean = email.trim().toLowerCase();

    try {
      if (isRegistering) {
        if (password.length < 6) {
          setErrorMsg("Password baru minimal harus terdiri dari 6 karakter.");
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg("Konfirmasi password tidak cocok. Pastikan kedua kolom password sama.");
          return;
        }

        const preCheck = await verifyAdminAccess(emailClean);
        if (!preCheck.authorized || !preCheck.role) {
          setErrorMsg(
            preCheck.reason ||
              "Pendaftaran ditolak: email ini belum terdaftar sebagai administrator."
          );
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: emailClean,
          password: password,
        });

        if (error) {
          const lowerMsg = error.message.toLowerCase();
          if (lowerMsg.includes("already registered")) {
            setErrorMsg(
              "Email ini sudah pernah diaktifkan sebelumnya. Silakan kembali ke mode Masuk dan login dengan password Anda."
            );
            return;
          }
          if (lowerMsg.includes("rate limit")) {
            setErrorMsg(
              "Batas pengiriman email verifikasi Supabase sedang penuh (email rate limit exceeded). Matikan opsi 'Confirm email' di Supabase Dashboard (Authentication → Providers → Email) lalu coba lagi."
            );
            return;
          }
          throw error;
        }

        if (data.session) {
          const userEmailClean = data.user?.email || emailClean;
          const postCheck = await verifyAdminAccess(userEmailClean);
          if (!postCheck.authorized || !postCheck.role) {
            await supabase.auth.signOut();
            setErrorMsg(
              postCheck.reason || "Akun ini tidak terdaftar sebagai administrator."
            );
            return;
          }
          onLoginSuccess(userEmailClean, postCheck.role);
        } else {
          setInfoMsg(
            "Password berhasil dibuat! Silakan cek inbox email Anda untuk klik link verifikasi, lalu masuk kembali."
          );
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailClean,
          password: password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            setErrorMsg(
              "Email atau password salah. Jika baru pertama kali masuk, klik tombol aktivasi password di bawah untuk membuat password Anda."
            );
            return;
          }
          throw error;
        }

        if (data.session) {
          const userEmailClean = data.user?.email || emailClean;
          const access = await verifyAdminAccess(userEmailClean);
          if (!access.authorized || !access.role) {
            await supabase.auth.signOut();
            setErrorMsg(
              access.reason || "Akses ditolak: email ini tidak terdaftar sebagai administrator."
            );
            return;
          }
          onLoginSuccess(userEmailClean, access.role);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal masuk. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans w-full">
      <div className="absolute inset-0 neo-bg-pattern opacity-15 pointer-events-none" />

      <div className="w-full max-w-[340px] sm:max-w-md bg-white rounded-2xl sm:rounded-3xl border-[3px] border-[#18181B] shadow-[4px_4px_0px_#FFE600] sm:shadow-[8px_8px_0px_#FFE600] p-4 sm:p-8 relative z-10 min-w-0">
        <div className="text-center mb-6">
          <div className="mb-2">
            <NeoSticker
              label={isRegistering ? "AKTIVASI ADMIN BARU" : "ADMIN DASHBOARD"}
              color={isRegistering ? "cyan" : "yellow"}
              rotate="-rotate-2"
              size="sm"
            />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#18181B] tracking-tight">
            {isRegistering ? "Aktivasi Akun Admin" : "Panel Administrator"}
          </h1>
          <NeoDivider className="!my-2" />
          <p className="text-xs text-[#52525B] font-semibold leading-relaxed">
            {isRegistering
              ? "Masukkan email yang sudah didaftarkan Super Admin, lalu buat password pribadi Anda sendiri untuk pertama kali."
              : "Masuk dengan akun administrator terdaftar untuk mengelola tamu, RSVP, dan buku tamu."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-rose-100 border-2 border-[#18181B] text-xs text-rose-900 font-bold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-4 rounded-xl bg-[#2EE59D]/30 border-2 border-[#18181B] text-xs text-[#18181B] font-bold animate-in fade-in">
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleSupabaseAuth} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
              {isRegistering ? "Email Terdaftar (dari Super Admin)" : "Email"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className="w-full py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
              {isRegistering ? "Buat Password Baru" : "Password"}
            </label>
            <input
              type="password"
              required
              minLength={isRegistering ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegistering ? "Minimal 6 karakter..." : "••••••••"}
              className="w-full py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
            />
            {isRegistering && (
              <p className="text-[11px] text-[#71717A] font-medium mt-1">
                Anda bebas menentukan password sendiri (minimal 6 karakter).
              </p>
            )}
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru..."
                className="w-full py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold tracking-wider transition-all shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] disabled:opacity-60 cursor-pointer"
          >
            {loading
              ? "Memproses..."
              : isRegistering
              ? "Simpan Password & Aktifkan Akun"
              : "Masuk"}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setPassword("");
                setConfirmPassword("");
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className="text-xs text-[#52525B] hover:text-[#18181B] underline font-bold cursor-pointer"
            >
              {isRegistering
                ? "Sudah punya password aktif? Masuk di sini"
                : "Email sudah didaftarkan Super Admin? Buat password & aktivasi di sini"}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-[#18181B] text-center">
          <Link
            href="/"
            className="text-xs text-[#52525B] hover:text-[#18181B] font-bold transition-colors"
          >
            &larr; Kembali ke Undangan Tamu
          </Link>
        </div>
      </div>
    </div>
  );
}
