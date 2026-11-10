"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NeoSticker from "../NeoSticker";
import NeoDivider from "../NeoDivider";

interface AdminLoginFormProps {
  onLoginSuccess: (email?: string, role?: "super_admin" | "admin") => void;
}

export default function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [authMode, setAuthMode] = useState<"passcode" | "auth">("passcode");
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const code = passcode.trim();
    if (code === "dev2026" || code === "superadmin123" || code === "developer") {
      localStorage.setItem("admin_auth_user", "Developer (Super Admin)");
      localStorage.setItem("admin_auth_role", "super_admin");
      onLoginSuccess("Developer (Super Admin)", "super_admin");
    } else if (code === "admin123" || code === "nikah2026") {
      localStorage.setItem("admin_auth_user", "Admin Acara");
      localStorage.setItem("admin_auth_role", "admin");
      onLoginSuccess("Admin Acara", "admin");
    } else {
      setErrorMsg("Kode sandi salah. Gunakan sandi 'dev2026' (Super Admin) atau 'admin123' (Admin Acara).");
    }
  };

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (data.session) {
          const userEmailClean = data.user?.email || email.trim();
          const role: "super_admin" | "admin" =
            userEmailClean.toLowerCase().includes("dev") || userEmailClean.toLowerCase().includes("superadmin")
              ? "super_admin"
              : "admin";

          localStorage.setItem("admin_auth_user", userEmailClean);
          localStorage.setItem("admin_auth_role", role);
          onLoginSuccess(userEmailClean, role);
        } else {
          setInfoMsg("Akun berhasil didaftarkan! Cek email untuk verifikasi atau gunakan Akses Sandi Cepat di tab samping.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (data.session) {
          const userEmailClean = data.user?.email || email.trim();
          let role: "super_admin" | "admin" = "admin";

          try {
            const { data: adminRecord } = await supabase
              .from("admin_users")
              .select("role")
              .eq("email", userEmailClean.toLowerCase())
              .maybeSingle();

            if (adminRecord?.role === "super_admin") {
              role = "super_admin";
            } else if (!adminRecord && (userEmailClean.toLowerCase().includes("dev") || userEmailClean.toLowerCase().includes("superadmin"))) {
              role = "super_admin";
            }
          } catch {
            if (userEmailClean.toLowerCase().includes("dev") || userEmailClean.toLowerCase().includes("superadmin")) {
              role = "super_admin";
            }
          }

          localStorage.setItem("admin_auth_user", userEmailClean);
          localStorage.setItem("admin_auth_role", role);
          onLoginSuccess(userEmailClean, role);
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
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 neo-bg-pattern opacity-15 pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-[28px] sm:rounded-[32px] border-[3px] border-[#18181B] shadow-[6px_6px_0px_#FFE600] sm:shadow-[8px_8px_0px_#FFE600] p-5 sm:p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="mb-2">
            <NeoSticker
              icon="🔐"
              label="ADMIN DASHBOARD"
              color="yellow"
              rotate="-rotate-2"
              size="sm"
            />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#18181B] tracking-tight">
            Panel Administrator
          </h1>
          <NeoDivider className="!my-2" />
          <p className="text-xs text-[#52525B] font-semibold">
            Akses kelola daftar tamu, rekap RSVP, dan moderasi buku tamu.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-2xl bg-[#FFFDF5] p-1 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode("passcode");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              authMode === "passcode"
                ? "bg-[#FFE600] text-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] border border-[#18181B]"
                : "text-[#71717A] hover:text-[#18181B]"
            }`}
          >
            Akses Sandi Cepat ⚡
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("auth");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              authMode === "auth"
                ? "bg-[#FFE600] text-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] border border-[#18181B]"
                : "text-[#71717A] hover:text-[#18181B]"
            }`}
          >
            Supabase Auth
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 border-2 border-[#18181B] text-xs text-rose-900 font-bold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#2EE59D]/30 border-2 border-[#18181B] text-xs text-[#18181B] font-bold animate-in fade-in">
            {infoMsg}
          </div>
        )}

        {/* Passcode Mode */}
        {authMode === "passcode" && (
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Kode Sandi Akses
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masukkan sandi akses..."
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
              />
              <div className="mt-3 p-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-[11px] text-[#18181B] space-y-1.5 font-bold">
                <div className="flex items-center justify-between">
                  <span>👑 Super Admin (Dev):</span>
                  <code className="px-2 py-0.5 rounded-md bg-[#FFE600] border border-[#18181B]">dev2026</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>👤 Admin Acara:</span>
                  <code className="px-2 py-0.5 rounded-md bg-white border border-[#18181B]">admin123</code>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold tracking-wider transition-all shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              Masuk Panel Admin 🚀
            </button>
          </form>
        )}

        {/* Supabase Auth Mode */}
        {authMode === "auth" && (
          <form onSubmit={handleSupabaseAuth} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold tracking-wider transition-all shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? "Memproses..."
                : isRegistering
                ? "Daftar Akun Baru"
                : "Masuk dengan Supabase"}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="text-xs text-[#52525B] hover:text-[#18181B] underline font-bold cursor-pointer"
              >
                {isRegistering
                  ? "Sudah punya akun? Masuk di sini"
                  : "Belum punya akun Supabase? Klik untuk mendaftar"}
              </button>
            </div>
          </form>
        )}

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
