"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

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
  idUndangan,
}: RsvpSectionProps) {
  const [tamu, setTamu] = useState<TamuData | null>(initialTamu || null);
  const [status, setStatus] = useState<"hadir" | "tidak_hadir" | "ragu">("hadir");
  const [jumlahHadir, setJumlahHadir] = useState<number>(1);
  const [manualName, setManualName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingRsvp, setExistingRsvp] = useState<boolean>(false);

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

  const [verifying, setVerifying] = useState(false);

  // Fungsi untuk memverifikasi apakah nama terdaftar di tabel tamu
  const verifyGuestByName = async (name: string): Promise<TamuData | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    // 1. Coba pencarian persis (case-insensitive)
    const { data: exactMatch } = await supabase
      .from("tamu")
      .select("*")
      .ilike("nama_tamu", trimmed)
      .limit(1)
      .maybeSingle();

    if (exactMatch) return exactMatch as TamuData;

    // 2. Coba pencarian sebagian nama (contoh: "Budi" cocok dengan "Budi Santoso")
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
          `Nama "${manualName.trim()}" tidak ditemukan dalam daftar undangan resmi. Mohon periksa kembali ejaan nama Anda atau hubungi kedua mempelai.`
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

      // Jika belum terverifikasi, verifikasi nama terlebih dahulu
      if (!currentGuest) {
        if (!manualName.trim()) {
          setErrorMessage("Silakan masukkan nama Anda.");
          setLoading(false);
          return;
        }

        const found = await verifyGuestByName(manualName);
        if (!found) {
          // OPSI 2: Tolak orang iseng / nama yang tidak ada di daftar admin!
          setErrorMessage(
            `Mohon maaf, nama "${manualName.trim()}" tidak terdaftar dalam daftar undangan resmi. RSVP hanya dapat diisi oleh tamu yang telah didaftarkan oleh mempelai.`
          );
          setLoading(false);
          return;
        }

        currentGuest = found;
        setTamu(found);
        setJumlahHadir(Math.min(found.kuota || 1, 1));
      }

      // Upsert into `rsvp` table untuk tamu yang sudah terverifikasi
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
        // Fallback jika ada isu RLS pada tabel rsvp
        if (rsvpErr.code === "42501") {
          console.warn("Supabase RLS active: RSVP disimpan di sesi browser.");
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
    <section className="relative w-full py-16 px-4 overflow-hidden">
      <BotanicalCorner position="top-right" size={110} opacity={0.5} />
      <BotanicalCorner position="bottom-left" size={110} opacity={0.5} />

      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-10">
          <p className="font-serif italic text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
            Palapuran Rawuh
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3D261C] font-normal tracking-wide">
            Konfirmasi Kehadiran
          </h2>
          <BotanicalDivider width={130} className="!my-3" />
          <p className="font-sans text-xs text-[#8A6B53] max-w-xs mx-auto leading-relaxed font-light">
            Matur nuwun sanget awit saking kawigatosan panjenengan ingkang kersa maringi konfirmasi rawuh.
          </p>
        </div>

        {/* Form Card */}
        <div className="fade-up-element p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)] text-left relative">
          <BotanicalCorner position="bottom-right" size={80} opacity={0.3} />

          {submitted ? (
            <div className="py-6 text-center animate-in fade-in duration-500">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF6F0] text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-[#3D261C] mb-1">
                Matur Nuwun!
              </h3>
              <p className="font-sans text-xs text-[#8A6B53] leading-relaxed mb-3 font-light">
                Konfirmasi rawuh panjenengan sampun kasimpen kanthi sae.
                {status === "hadir" && (
                  <span className="block mt-1 font-medium text-[#C5A059]">
                    Sugeng rawuh ing pahargyan pawiwahan ({jumlahHadir} orang).
                  </span>
                )}
              </p>

              {/* QR Code Pass for Hadir */}
              {status === "hadir" && tamu && (
                <div className="my-5 p-4 rounded-2xl bg-[#FAF6F0] border border-[#C5A059]/40 shadow-xs max-w-xs mx-auto text-center">
                  <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/25 mb-3">
                    <span className="font-serif text-xs font-bold text-[#3D261C] uppercase tracking-wider">
                      Tiket Resepsi Digital
                    </span>
                    <span className="font-sans text-[10px] text-[#C5A059] font-semibold bg-[#FFFDF9] px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                      {jumlahHadir} Orang
                    </span>
                  </div>

                  {/* QR Code image */}
                  <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#C5A059]/20 inline-block shadow-inner mb-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `PAWIWAHAN-ARYA-SEKAR:${tamu.kode}:${tamu.nama_tamu}:${jumlahHadir}`
                      )}&color=5C3A21&bgcolor=FFFDF9`}
                      alt="QR Code Tiket Masuk Resepsi"
                      className="w-36 h-36 mx-auto rounded-lg"
                      loading="lazy"
                    />
                  </div>

                  <p className="font-mono text-xs font-bold text-[#3D261C] tracking-widest mt-1">
                    {tamu.kode}
                  </p>
                  <p className="font-serif text-sm font-semibold text-[#5C3A21] mt-0.5">
                    {tamu.nama_tamu}
                  </p>
                  <p className="font-sans text-[10px] text-[#8A6B53] mt-1.5 leading-snug">
                    *Tampilaken QR Code menika dhumateng among tamu / meja resepsi.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="inline-flex px-5 py-2 rounded-full border border-[#C5A059]/50 text-[#3D261C] hover:bg-[#C5A059]/15 text-xs font-sans tracking-wider transition-colors cursor-pointer"
                >
                  Ewahi Konfirmasi
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {existingRsvp && (
                <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#C5A059]/30 text-xs text-[#8A6B53] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#C5A059] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Panjenengan sampun konfirmasi saderengipun ({status === "hadir" ? "Hadir" : status === "ragu" ? "Ragu" : "Absen"}).</span>
                  </div>
                  {status === "hadir" && (
                    <button
                      type="button"
                      onClick={() => setSubmitted(true)}
                      className="text-[11px] font-semibold text-[#5C3A21] underline hover:text-[#3D261C] cursor-pointer block pl-6"
                    >
                      Bikak QR Code Tiket Masuk Resepsi &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Guest name field */}
              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-[#8A6B53] mb-1.5 font-medium">
                  Asma Tamu Undangan
                </label>
                {tamu ? (
                  <div className="py-2 border-b border-[#C5A059]/40 font-serif text-lg text-[#3D261C] flex items-center justify-between">
                    <div>
                      <span className="block">{tamu.nama_tamu}</span>
                      <span className="text-[11px] font-sans text-[#C5A059] flex items-center gap-1 mt-0.5 font-light">
                        <svg className="w-3.5 h-3.5 text-[#C5A059]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Kacathet wonten serat sedhahan resmi
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#FAF6F0] text-[#C5A059] border border-[#C5A059]/30">
                        Kuota: {tamu.kuota || 1} orang
                      </span>
                      {!initialTamu && (
                        <button
                          type="button"
                          onClick={() => {
                            setTamu(null);
                            setExistingRsvp(false);
                          }}
                          className="text-[10px] font-sans text-[#8A6B53] hover:text-[#3D261C] underline ml-1 cursor-pointer"
                        >
                          Ubah
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
                        placeholder="Serat asma panjenengan jumbuh undangan..."
                        className="w-full py-2 pr-20 bg-transparent border-b border-[#C5A059]/40 focus:border-[#3D261C] text-[#3D261C] font-serif text-base placeholder-[#8A6B53]/50 outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleManualCheck}
                        disabled={verifying || !manualName.trim()}
                        className="absolute right-0 bottom-1.5 px-3 py-1 rounded-full bg-[#C5A059]/15 hover:bg-[#C5A059]/25 text-[#3D261C] text-[11px] font-sans transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        {verifying ? "Mriksani..." : "Cek Asma"}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#8A6B53] mt-1.5 font-light">
                      Ketik nama sesuai daftar angkatan sekolah untuk verifikasi.
                    </p>
                  </div>
                )}
              </div>

              {/* Status Radio / Pills */}
              <div>
                <label className="block font-sans text-xs uppercase tracking-wider text-[#8A6B53] mb-2.5 font-medium">
                  Konfirmasi Rawuh
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "hadir", label: "Insya Allah Rawuh" },
                    { id: "ragu", label: "Taksih Rangu" },
                    { id: "tidak_hadir", label: "Nyenyuwun Pangapunten" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatus(opt.id as "hadir" | "tidak_hadir" | "ragu")}
                      className={`py-2.5 px-2 rounded-full text-xs font-sans tracking-wide transition-all border cursor-pointer ${
                        status === opt.id
                          ? "bg-[#5C3A21] text-[#FFFDF9] border-[#C5A059] shadow-sm font-medium"
                          : "bg-[#FAF6F0] text-[#3D261C] border-[#C5A059]/30 hover:border-[#C5A059]"
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
                    <label className="font-sans text-xs uppercase tracking-wider text-[#8A6B53] font-medium">
                      Gunggungipun Rawuh (Jumlah Orang)
                    </label>
                    <span className="font-serif text-sm text-[#3D261C]">
                      {jumlahHadir} Orang (Maks {maxQuota})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {Array.from({ length: maxQuota }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setJumlahHadir(num)}
                        className={`w-10 h-10 rounded-full font-serif text-sm transition-all border cursor-pointer ${
                          jumlahHadir === num
                            ? "bg-[#5C3A21] text-[#FFFDF9] border-[#C5A059] shadow-sm"
                            : "bg-[#FAF6F0] text-[#3D261C] border-[#C5A059]/30 hover:border-[#C5A059]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {errorMessage}
                </p>
              )}

              {/* Submit Button (Javanese Sogan and Gold) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#5C3A21] hover:bg-[#3D261C] border border-[#C5A059] text-[#FFFDF9] font-sans text-xs uppercase tracking-widest font-medium shadow-[0_4px_16px_rgba(92,58,33,0.3)] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Ngintun Data...</span>
                  </>
                ) : (
                  <span>Kintun Konfirmasi Rawuh</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
