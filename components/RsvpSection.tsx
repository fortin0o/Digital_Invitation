"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getGuestByCode, RsvpStatus, TamuWithRsvp } from "@/lib/guestInvitation";
import { downloadQrTicketAsPhoto } from "@/lib/qrTicketImage";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

interface RsvpSectionProps {
  initialTamu?: TamuWithRsvp | null;
  guestCode?: string;
  idUndangan?: string;
  coupleName?: string;
}

export default function RsvpSection({
  initialTamu,
  guestCode = "",
  idUndangan = "",
  coupleName = "Arya & Sekar",
}: RsvpSectionProps) {
  const initialQuota = Math.max(initialTamu?.kuota || 1, 1);
  const initialStatus: RsvpStatus = initialTamu?.rsvp_status || "hadir";
  const initialCount =
    initialStatus === "tidak_hadir"
      ? 1
      : Math.min(Math.max(initialTamu?.rsvp_jumlah_hadir || 1, 1), initialQuota);

  const [tamu, setTamu] = useState<TamuWithRsvp | null>(initialTamu || null);
  const [status, setStatus] = useState<RsvpStatus>(initialStatus);
  const [jumlahHadir, setJumlahHadir] = useState<number>(initialCount);
  const [manualCode, setManualCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingRsvp, setExistingRsvp] = useState<boolean>(Boolean(initialTamu?.rsvp_status));
  const [verifying, setVerifying] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const applyGuestRecord = useCallback((guest: TamuWithRsvp) => {
    const quota = Math.max(guest.kuota || 1, 1);
    const nextStatus: RsvpStatus = guest.rsvp_status || "hadir";
    const nextCount =
      nextStatus === "tidak_hadir"
        ? 1
        : Math.min(Math.max(guest.rsvp_jumlah_hadir || 1, 1), quota);

    setTamu(guest);
    setStatus(nextStatus);
    setJumlahHadir(nextCount);
    setExistingRsvp(Boolean(guest.rsvp_status));
  }, []);

  // Fallback client lookup if initialTamu wasn't preloaded on SSR
  useEffect(() => {
    if (tamu || !guestCode) return;
    let active = true;

    void (async () => {
      const found = await getGuestByCode(guestCode, idUndangan);
      if (active && found) {
        applyGuestRecord(found);
      }
    })();

    return () => {
      active = false;
    };
  }, [guestCode, idUndangan, tamu, applyGuestRecord]);

  const maxQuota = Math.max(tamu?.kuota || 1, 1);

  const handleManualCheck = async () => {
    const trimmedCode = manualCode.trim();
    if (!trimmedCode) {
      setErrorMessage("Silakan masukkan kode undangan Anda terlebih dahulu.");
      return;
    }
    setVerifying(true);
    setErrorMessage(null);
    try {
      const found = await getGuestByCode(trimmedCode, idUndangan);
      if (found) {
        applyGuestRecord(found);
      } else {
        setErrorMessage(
          `Kode undangan "${trimmedCode}" tidak ditemukan dalam daftar resmi. Pastikan kode sesuai pesan undangan pribadi Anda.`
        );
      }
    } catch {
      setErrorMessage("Terjadi kendala saat memeriksa kode undangan. Silakan coba lagi.");
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
        const trimmedCode = manualCode.trim();
        if (!trimmedCode) {
          setErrorMessage("Silakan masukkan kode undangan Anda.");
          setLoading(false);
          return;
        }

        const found = await getGuestByCode(trimmedCode, idUndangan);
        if (!found) {
          setErrorMessage(
            `Mohon maaf, kode undangan "${trimmedCode}" tidak terdaftar dalam daftar undangan resmi.`
          );
          setLoading(false);
          return;
        }

        currentGuest = found;
      }

      const guestQuota = Math.max(currentGuest.kuota || 1, 1);
      const targetCount =
        status === "tidak_hadir" ? 0 : Math.min(Math.max(jumlahHadir, 1), guestQuota);

      const { data: rpcData, error: rsvpErr } = await supabase.rpc("submit_guest_rsvp", {
        p_kode: currentGuest.kode,
        p_status: status,
        p_jumlah_hadir: targetCount,
        p_id_undangan: idUndangan || currentGuest.id_undangan || null,
      });

      if (rsvpErr) {
        throw rsvpErr;
      }

      const savedRow = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as
        | { status?: RsvpStatus; jumlah_hadir?: number; tgl_konfirmasi?: string }
        | undefined;
      const savedStatus: RsvpStatus = savedRow?.status || status;
      const savedCount =
        typeof savedRow?.jumlah_hadir === "number" ? savedRow.jumlah_hadir : targetCount;

      setTamu({
        ...currentGuest,
        rsvp_status: savedStatus,
        rsvp_jumlah_hadir: savedCount,
        rsvp_tgl_konfirmasi: savedRow?.tgl_konfirmasi || new Date().toISOString(),
      });
      if (savedStatus !== "tidak_hadir") {
        setJumlahHadir(Math.min(Math.max(savedCount || 1, 1), guestQuota));
      }
      setPhotoFeedback(null);
      setSubmitted(true);
      setExistingRsvp(true);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Terjadi kendala saat mengirim RSVP ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQrPhoto = async () => {
    if (!tamu || savingPhoto) return;
    setSavingPhoto(true);
    setPhotoFeedback(null);
    try {
      await downloadQrTicketAsPhoto({
        qrData: `WEDDING-ARYA-SEKAR:${tamu.kode}:${tamu.nama_tamu}:${jumlahHadir}`,
        guestCode: tamu.kode,
        guestName: tamu.nama_tamu,
        guestCount: jumlahHadir,
        coupleName,
      });
      setPhotoFeedback({
        type: "success",
        text: "Foto tiket QR Code berhasil disimpan!",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan foto QR Code. Silakan coba lagi atau screenshot layar ini.";
      setPhotoFeedback({ type: "error", text: message });
    } finally {
      setSavingPhoto(false);
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
                      crossOrigin="anonymous"
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

                  <div className="mt-4 pt-3 border-t-2 border-dashed border-[#18181B]/30">
                    <button
                      type="button"
                      onClick={handleDownloadQrPhoto}
                      disabled={savingPhoto}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold shadow-[2.5px_2.5px_0px_#18181B] hover:shadow-[4px_4px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      <span>{savingPhoto ? "Menyiapkan Foto..." : "Simpan QR sebagai Foto"}</span>
                    </button>

                    {photoFeedback && (
                      <p
                        className={`mt-2 text-[11px] font-bold ${
                          photoFeedback.type === "success" ? "text-[#0F766E]" : "text-rose-700"
                        }`}
                      >
                        {photoFeedback.text}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setPhotoFeedback(null);
                  }}
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
                      onClick={() => {
                        setPhotoFeedback(null);
                        setSubmitted(true);
                      }}
                      className="text-[11px] font-bold text-[#FF5D8F] underline hover:text-[#18181B] cursor-pointer block pl-6"
                    >
                      Buka Tiket Masuk QR Code &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Guest Verification Field */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-2 font-bold">
                  {tamu ? "Nama Tamu Undangan" : "Verifikasi Kode Undangan"}
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
                            setManualCode("");
                            setExistingRsvp(false);
                            setErrorMessage(null);
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
                        value={manualCode}
                        onChange={(e) => {
                          setManualCode(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Masukkan kode undangan (8 digit)..."
                        className="w-full py-2 px-4 pr-24 bg-[#FFFDF5] rounded-xl border-2 border-[#18181B] focus:bg-white text-[#18181B] font-bold text-xs outline-none transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleManualCheck}
                        disabled={verifying || !manualCode.trim()}
                        className="absolute right-2 px-3 py-1.5 rounded-lg bg-[#FFE600] hover:bg-[#FDD835] text-[#18181B] text-[11px] font-extrabold border border-[#18181B] transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        {verifying ? "Memeriksa..." : "Cek Kode"}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-2 font-medium">
                      Masukkan kode unik yang tertera pada tautan atau pesan undangan pribadi Anda.
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
