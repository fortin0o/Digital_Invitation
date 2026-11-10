"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

interface TamuData {
  id_tamu: string;
  id_undangan: string;
  nama_tamu: string;
  kode: string;
  kuota: number;
}

interface RsvpSectionProps {
  initialTamu?: TamuData | null;
  guestCode?: string;
  idUndangan?: string;
}

export default function RsvpSection({
  initialTamu,
  guestCode = "",
}: RsvpSectionProps) {
  const [tamu, setTamu] = useState<TamuData | null>(initialTamu || null);
  const [status, setStatus] = useState<"hadir" | "tidak_hadir" | "ragu">("hadir");
  const [jumlahHadir, setJumlahHadir] = useState<number>(1);
  const [manualName, setManualName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingRsvp, setExistingRsvp] = useState<boolean>(false);
  const [verifying, setVerifying] = useState(false);

  // If initialTamu wasn't loaded on SSR, look up guest via guestCode
  useEffect(() => {
    if (!tamu && guestCode) {
      supabase
        .from("tamu")
        .select("*")
        .eq("kode", guestCode)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setTamu(data);
            setJumlahHadir(Math.min(data.kuota || 1, 1));
          }
        });
    }
  }, [guestCode, tamu]);

  // Check if this guest already submitted RSVP
  useEffect(() => {
    if (tamu?.id_tamu) {
      supabase
        .from("rsvp")
        .select("*")
        .eq("id_tamu", tamu.id_tamu)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setStatus(data.status as "hadir" | "tidak_hadir" | "ragu");
            setJumlahHadir(data.jumlah_hadir || 1);
            setExistingRsvp(true);
          }
        });
    }
  }, [tamu]);

  const maxQuota = tamu?.kuota || 1;

  // Verifikasi apakah nama terdaftar di tabel tamu
  const verifyGuestByName = async (name: string): Promise<TamuData | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const { data: exactMatch } = await supabase
      .from("tamu")
      .select("*")
      .ilike("nama_tamu", trimmed)
      .limit(1)
      .maybeSingle();

    if (exactMatch) return exactMatch as TamuData;

    const { data: partialMatch } = await supabase
      .from("tamu")
      .select("*")
      .ilike("nama_tamu", `%${trimmed}%`)
      .limit(1)
      .maybeSingle();

    if (partialMatch) return partialMatch as TamuData;

    return null;
  };

  const handleManualCheck = async () => {
    if (!manualName.trim()) {
      setErrorMessage("Silakan tuliskan nama Anda terlebih dahulu.");
      return;
    }
    setVerifying(true);
    setErrorMessage(null);
    try {
      const found = await verifyGuestByName(manualName);
      if (found) {
        setTamu(found);
        setJumlahHadir(Math.min(found.kuota || 1, 1));
      } else {
        setErrorMessage(
          `Nama "${manualName.trim()}" tidak ditemukan dalam daftar undangan resmi. Silakan periksa kembali ejaan nama Anda.`
        );
      }
    } catch {
      setErrorMessage("Terjadi kendala saat memeriksa daftar tamu. Silakan coba lagi.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      let currentGuest = tamu;

      if (!currentGuest) {
        if (!manualName.trim()) {
          setErrorMessage("Silakan masukkan nama Anda.");
          setLoading(false);
          return;
        }

        const found = await verifyGuestByName(manualName);
        if (!found) {
          setErrorMessage(
            `Mohon maaf, nama "${manualName.trim()}" tidak terdaftar dalam daftar undangan resmi. RSVP hanya dapat diisi oleh tamu yang telah didaftarkan.`
          );
          setLoading(false);
          return;
        }

        currentGuest = found;
        setTamu(found);
        setJumlahHadir(Math.min(found.kuota || 1, 1));
      }

      const { error: rsvpErr } = await supabase.from("rsvp").upsert(
        {
          id_tamu: currentGuest.id_tamu,
          status: status,
          jumlah_hadir: status === "tidak_hadir" ? 0 : Math.min(jumlahHadir, currentGuest.kuota || 2),
          tgl_konfirmasi: new Date().toISOString(),
        },
        { onConflict: "id_tamu" }
      );

      if (rsvpErr) {
        if (rsvpErr.code === "42501") {
          if (typeof window !== "undefined") {
            localStorage.setItem(
              `rsvp_${currentGuest.id_tamu}`,
              JSON.stringify({ status, jumlah_hadir: status === "tidak_hadir" ? 0 : jumlahHadir })
            );
          }
        } else {
          throw rsvpErr;
        }
      }

      setSubmitted(true);
      setExistingRsvp(true);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Terjadi kendala saat mengirim RSVP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full py-12 px-4 overflow-hidden">
      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-8">
          <div className="mb-2">
            <NeoSticker
              label="RSVP ONLINE"
              color="green"
              rotate="-rotate-2"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            Konfirmasi Kehadiran
          </h2>
          <NeoDivider className="!my-2" />
          <p className="font-sans text-xs text-[#52525B] max-w-xs mx-auto leading-relaxed font-medium">
            Bantu kami mempersiapkan jamuan terbaik dengan mengonfirmasi kehadiranmu pada form berikut:
          </p>
        </div>

        {/* Form Card */}
        <div className="fade-up-element p-6 sm:p-8 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[6px_6px_0px_#18181B] text-left relative">
          {submitted ? (
            <div className="py-4 text-center animate-in fade-in duration-400">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#2EE59D] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex items-center justify-center text-lg font-black text-[#18181B]">
                ✓
              </div>
              <h3 className="font-display font-extrabold text-2xl text-[#18181B] mb-1">
                Terima Kasih Banyak
              </h3>
              <p className="font-sans text-xs text-[#52525B] leading-relaxed mb-4 font-medium">
                Konfirmasi kehadiran Anda telah berhasil kami simpan.
                {status === "hadir" && (
                  <span className="block mt-2 font-bold text-[#18181B] bg-[#2EE59D]/30 p-2 sm:p-4 rounded-xl border border-[#18181B]">
                    Sampai jumpa di hari perayaan kami ({jumlahHadir} orang).
                  </span>
                )}
              </p>

              {/* Digital Pass Ticket for Hadir */}
              {status === "hadir" && tamu && (
                <div className="my-6 p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] max-w-xs mx-auto text-center relative">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-[#18181B] mb-4">
                    <span className="font-display text-xs font-black uppercase tracking-wider text-[#18181B]">
                      TIKET MASUK RESEPSI
                    </span>
                    <span className="font-sans text-[10px] bg-[#FFE600] text-[#18181B] font-bold px-2 py-0.5 rounded-full border border-[#18181B]">
                      {jumlahHadir} Orang
                    </span>
                  </div>

                  {/* QR Code image */}
                  <div className="bg-white p-2 rounded-xl border-2 border-[#18181B] inline-block shadow-[2px_2px_0px_#18181B] mb-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `WEDDING-ARYA-SEKAR:${tamu.kode}:${tamu.nama_tamu}:${jumlahHadir}`
                      )}&color=18181B&bgcolor=FFFFFF`}
                      alt="QR Code Tiket Masuk Resepsi"
                      className="w-36 h-36 mx-auto rounded-lg"
                      loading="lazy"
                    />
                  </div>

                  <p className="font-mono text-xs font-extrabold text-[#18181B] tracking-widest mt-1">
                    {tamu.kode}
                  </p>
                  <p className="font-display text-sm font-bold text-[#FF5D8F] mt-1">
                    {tamu.nama_tamu}
                  </p>
                  <p className="font-sans text-[10px] text-[#71717A] mt-2 font-medium">
                    *Tunjukkan QR Code ini kepada penerima tamu di meja resepsi.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="inline-flex px-6 py-2 rounded-full border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-xs font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#18181B]"
                >
                  Ubah Konfirmasi Kehadiran
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {existingRsvp && (
                <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-xs text-[#18181B] space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <span>✓</span>
                    <span>
                      Anda sudah konfirmasi sebelumnya:{" "}
                      <span className="underline">
                        {status === "hadir" ? "Pasti Hadir" : status === "ragu" ? "Masih Ragu" : "Berhalangan"}
                      </span>
                    </span>
                  </div>
                  {status === "hadir" && (
                    <button
                      type="button"
                      onClick={() => setSubmitted(true)}
                      className="text-[11px] font-bold text-[#FF5D8F] underline hover:text-[#18181B] cursor-pointer block pl-6"
                    >
                      Buka Tiket Masuk QR Code &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Guest Name Field */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-2 font-bold">
                  Nama Tamu Undangan
                </label>
                {tamu ? (
                  <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-between">
                    <div>
                      <span className="font-display font-extrabold text-base text-[#18181B] block">
                        {tamu.nama_tamu}
                      </span>
                      <span className="text-[11px] text-[#2EE59D] font-bold flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-[#2EE59D]" />
                        Terdaftar di buku tamu resmi
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFE600] text-[#18181B] font-bold border border-[#18181B]">
                        Maks {tamu.kuota || 1} org
                      </span>
                      {!initialTamu && (
                        <button
                          type="button"
                          onClick={() => {
                            setTamu(null);
                            setExistingRsvp(false);
                          }}
                          className="text-[10px] text-[#71717A] hover:text-[#18181B] underline font-bold cursor-pointer"
                        >
                          Ganti
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={manualName}
                        onChange={(e) => {
                          setManualName(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Ketikkan nama lengkap Anda..."
                        className="w-full py-2.5 px-4 pr-24 bg-[#FFFDF5] rounded-xl border-2 border-[#18181B] focus:bg-white text-[#18181B] font-bold text-xs outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleManualCheck}
                        disabled={verifying || !manualName.trim()}
                        className="absolute right-2 px-3 py-1.5 rounded-lg bg-[#FFE600] hover:bg-[#FDD835] text-[#18181B] text-[11px] font-extrabold border border-[#18181B] transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        {verifying ? "Memeriksa..." : "Cek Nama"}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-2 font-medium">
                      Ketikkan nama sesuai daftar angkatan sekolah untuk verifikasi.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Pills */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-2 font-bold">
                  Status Kehadiran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "hadir", label: "Hadir", activeBg: "bg-[#2EE59D]" },
                    { id: "ragu", label: "Ragu", activeBg: "bg-[#FFE600]" },
                    { id: "tidak_hadir", label: "Absen", activeBg: "bg-[#FF5D8F]" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatus(opt.id as "hadir" | "tidak_hadir" | "ragu")}
                      className={`py-2 sm:py-3 px-2 rounded-2xl text-[11px] sm:text-xs font-bold tracking-tight transition-all border-2 border-[#18181B] cursor-pointer text-center ${
                        status === opt.id
                          ? `${opt.activeBg} text-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] sm:shadow-[3px_3px_0px_#18181B] -translate-x-0.5 -translate-y-0.5`
                          : "bg-[#FFFDF5] text-[#52525B] hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Count (if status != 'tidak_hadir') */}
              {status !== "tidak_hadir" && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider text-[#18181B] font-bold">
                      Jumlah Orang yang Hadir
                    </label>
                    <span className="text-xs font-extrabold text-[#FF5D8F]">
                      {jumlahHadir} Orang (Maks {maxQuota})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: maxQuota }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setJumlahHadir(num)}
                        className={`w-10 h-10 rounded-xl font-display font-extrabold text-sm transition-all border-2 border-[#18181B] cursor-pointer ${
                          jumlahHadir === num
                            ? "bg-[#FFE600] text-[#18181B] shadow-[3px_3px_0px_#18181B] -translate-y-0.5"
                            : "bg-[#FFFDF5] text-[#52525B] hover:bg-white"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-100 border-2 border-[#18181B] text-xs text-rose-900 font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full bg-[#FFE600] hover:bg-[#FFD700] border-[2.5px] border-[#18181B] text-[#18181B] font-display text-xs uppercase tracking-wider font-extrabold shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#18181B]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Menyimpan RSVP...</span>
                  </>
                ) : (
                  <span>Kirim Konfirmasi Kehadiran</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
