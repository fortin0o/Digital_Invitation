"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BotanicalCorner from "../BotanicalCorner";
import BotanicalDivider from "../BotanicalDivider";

interface AdminLoginFormProps {
  onLoginSuccess: (email?: string) => void;
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

  // Fast passcode fallback login for practical school usage
  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Default universal passcode for school practice
    if (passcode.trim() === "admin123" || passcode.trim() === "nikah2026") {
      localStorage.setItem("admin_auth_user", "Admin Praktik");
      onLoginSuccess("Admin Praktik");
    } else {
      setErrorMsg("Kode sandi salah. Gunakan sandi: 'admin123' atau 'nikah2026'.");
    }
  };

  // Supabase Auth Login
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
          onLoginSuccess(data.user?.email);
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
          onLoginSuccess(data.user?.email);
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
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      <BotanicalCorner position="top-left" size={130} opacity={0.5} />
      <BotanicalCorner position="bottom-right" size={130} opacity={0.5} />

      <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#C5A059]/35 shadow-[0_12px_40px_rgba(61,38,28,0.08)] p-6 sm:p-8 relative z-10">
        <BotanicalCorner position="top-right" size={80} opacity={0.3} />

        <div className="text-center mb-6">
          <p className="text-xs tracking-widest text-[#8A6B53] uppercase mb-1 font-semibold">
            Pawiwahan Ageng Arya &amp; Sekar
          </p>
          <h1 className="text-2xl sm:text-3xl text-[#3D261C] font-bold tracking-wide">
            Panel Administrator
          </h1>
          <BotanicalDivider width={120} className="!my-2" />
          <p className="text-xs text-[#8A6B53] font-normal">
            Akses kelola data tamu angkatan, rekap RSVP, dan moderasi doa restu.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-full bg-[#FAF6F0] p-1 border border-[#C5A059]/30 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode("passcode");
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
              authMode === "passcode"
                ? "bg-[#5C3A21] text-[#FFFDF9] font-semibold shadow-xs"
                : "text-[#8A6B53] hover:text-[#3D261C]"
            }`}
          >
            Akses Sandi Cepat
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("auth");
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
              authMode === "auth"
                ? "bg-[#5C3A21] text-[#FFFDF9] font-semibold shadow-xs"
                : "text-[#8A6B53] hover:text-[#3D261C]"
            }`}
          >
            Supabase Auth
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FAF6F0] border border-[#C5A059]/40 text-xs text-[#3D261C] animate-in fade-in">
            {infoMsg}
          </div>
        )}

        {/* Passcode Mode */}
        {authMode === "passcode" && (
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8A6B53] mb-1 font-semibold">
                Kode Sandi Admin
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masukkan sandi: admin123"
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 focus:border-[#5C3A21] text-xs text-[#3D261C] outline-none"
              />
              <p className="text-[11px] text-[#8A6B53] mt-1.5 font-light">
                Gunakan sandi default: <strong className="font-semibold text-[#5C3A21]">admin123</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#5C3A21] hover:bg-[#3D261C] border border-[#C5A059] text-[#FFFDF9] text-xs font-semibold tracking-wider transition-all shadow-xs cursor-pointer"
            >
              Masuk Panel Admin
            </button>
          </form>
        )}

        {/* Supabase Auth Mode */}
        {authMode === "auth" && (
          <form onSubmit={handleSupabaseAuth} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8A6B53] mb-1 font-semibold">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sekolah.sch.id"
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 focus:border-[#5C3A21] text-xs text-[#3D261C] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8A6B53] mb-1 font-semibold">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 focus:border-[#5C3A21] text-xs text-[#3D261C] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#5C3A21] hover:bg-[#3D261C] border border-[#C5A059] text-[#FFFDF9] text-xs font-semibold tracking-wider transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? "Memproses..."
                : isRegistering
                ? "Daftar Akun Baru"
                : "Masuk dengan Supabase"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="text-xs text-[#8A6B53] hover:text-[#3D261C] underline transition-colors cursor-pointer"
              >
                {isRegistering
                  ? "Sudah punya akun? Masuk di sini"
                  : "Belum punya akun Supabase? Klik untuk mendaftar"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-[#C5A059]/20 text-center">
          <Link
            href="/"
            className="text-xs text-[#8A6B53] hover:text-[#3D261C] transition-colors"
          >
            &larr; Kembali ke Undangan Tamu
          </Link>
        </div>
      </div>
    </div>
  );
}
