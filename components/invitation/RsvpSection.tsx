"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getGuestByCode, RsvpStatus, TamuWithRsvp } from "@/lib/guestInvitation";
import { downloadQrTicketAsPhoto } from "@/lib/qrTicketImage";
import NeoSticker from "@/components/ui/NeoSticker";
import NeoDivider from "@/components/ui/NeoDivider";

interface RsvpSectionProps {
  initialTamu?: TamuWithRsvp | null;
  guestCode?: string;
  idUndangan?: string;
  coupleName?: string;
  onGuestChange?: (guest: TamuWithRsvp | null) => void;
}

function formatConfirmationTime(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

export default function RsvpSection({
  initialTamu,
  guestCode = "",
  idUndangan = "",
  coupleName = "Arya & Sekar",
  onGuestChange,
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
  const [isEditing, setIsEditing] = useState(false);
  const [justUpdatedNotice, setJustUpdatedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const applyGuestRecord = useCallback(
    (guest: TamuWithRsvp) => {
      const quota = Math.max(guest.kuota || 1, 1);
      const nextStatus: RsvpStatus = guest.rsvp_status || "hadir";
      const nextCount =
        nextStatus === "tidak_hadir"
          ? 1
          : Math.min(Math.max(guest.rsvp_jumlah_hadir || 1, 1), quota);

      setTamu(guest);
      setStatus(nextStatus);
      setJumlahHadir(nextCount);
      onGuestChange?.(guest);
    },
    [onGuestChange]
  );

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
  const hasConfirmed = Boolean(tamu?.rsvp_status);

  // Nilai resmi yang sudah tersimpan di database
  const savedRsvpStatus: RsvpStatus = tamu?.rsvp_status || "hadir";
  const savedGuestCount =
    savedRsvpStatus === "tidak_hadir"
      ? 0
      : Math.min(Math.max(tamu?.rsvp_jumlah_hadir || 1, 1), maxQuota);

  // Masuk ke mode edit dengan data prefilled dari database
  const handleStartEdit = () => {
    if (tamu) {
      const currentSavedStatus: RsvpStatus = tamu.rsvp_status || "hadir";
      const currentCount =
        currentSavedStatus === "tidak_hadir"
          ? 1
          : Math.min(Math.max(tamu.rsvp_jumlah_hadir || 1, 1), maxQuota);
      setStatus(currentSavedStatus);
      setJumlahHadir(currentCount);
    }
    setIsEditing(true);
    setErrorMessage(null);
    setPhotoFeedback(null);
  };

  // Batalkan pengubahan dan kembalikan state form ke data tersimpan tanpa submit ke database
  const handleCancelEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (tamu) {
      const currentSavedStatus: RsvpStatus = tamu.rsvp_status || "hadir";
      const currentCount =
        currentSavedStatus === "tidak_hadir"
          ? 1
          : Math.min(Math.max(tamu.rsvp_jumlah_hadir || 1, 1), maxQuota);
      setStatus(currentSavedStatus);
      setJumlahHadir(currentCount);
    }
    setIsEditing(false);
    setErrorMessage(null);
  };

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

      const updatedGuest: TamuWithRsvp = {
        ...currentGuest,
        rsvp_status: savedStatus,
        rsvp_jumlah_hadir: savedCount,
        rsvp_tgl_konfirmasi: savedRow?.tgl_konfirmasi || new Date().toISOString(),
      };

      setTamu(updatedGuest);
      onGuestChange?.(updatedGuest);
      setStatus(savedStatus);
      if (savedStatus !== "tidak_hadir") {
        setJumlahHadir(Math.min(Math.max(savedCount || 1, 1), guestQuota));
      } else {
        setJumlahHadir(1);
      }
      setPhotoFeedback(null);
      setIsEditing(false);
      setJustUpdatedNotice(true);
      setTimeout(() => setJustUpdatedNotice(false), 4500);
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
        qrData: `WEDDING-ARYA-SEKAR:${tamu.kode}:${tamu.nama_tamu}:${savedGuestCount}`,
        guestCode: tamu.kode,
        guestName: tamu.nama_tamu,
        guestCount: savedGuestCount,
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
    <section className="relative w-full py-6 sm:py-8 px-4 overflow-hidden" id="konfirmasi-rsvp">
      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-6">
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

        {/* Card Container */}
        <div className="fade-up-element p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] sm:shadow-[6px_6px_0px_#18181B] text-left relative">
          {/* =========================================================================
              STATE 2: KARTU STATUS TERKONFIRMASI & TIKET MASUK (JIKA SUDAH KONFIRMASI)
             ========================================================================= */}
          {hasConfirmed && !isEditing ? (
            <div className="py-2 text-center animate-in fade-in duration-300">
              {/* Notifikasi jika baru saja selesai mengupdate */}
              {justUpdatedNotice && (
                <div className="mb-4 p-3 rounded-2xl bg-[#2EE59D]/30 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-xs font-extrabold text-[#18181B] animate-in fade-in">
                  ✓ Konfirmasi kehadiran Anda berhasil diperbarui!
                </div>
              )}

              {/* Status Header Icon */}
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex items-center justify-center text-lg font-black text-[#18181B] ${
                  savedRsvpStatus === "hadir"
                    ? "bg-[#2EE59D]"
                    : savedRsvpStatus === "ragu"
                    ? "bg-[#FFE600]"
                    : "bg-[#FF5D8F]"
                }`}
              >
                {savedRsvpStatus === "hadir" ? "✓" : savedRsvpStatus === "ragu" ? "?" : "✕"}
              </div>

              {/* Status Title */}
              <h3 className="font-display font-extrabold text-2xl text-[#18181B] mb-1">
                {savedRsvpStatus === "hadir"
                  ? "Konfirmasi Kehadiran Tersimpan"
                  : savedRsvpStatus === "ragu"
                  ? "Status: Masih Ragu"
                  : "Konfirmasi: Berhalangan Hadir"}
              </h3>

              {/* Status Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-xs font-black my-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full border border-[#18181B] ${
                    savedRsvpStatus === "hadir"
                      ? "bg-[#2EE59D]"
                      : savedRsvpStatus === "ragu"
                      ? "bg-[#FFE600]"
                      : "bg-[#FF5D8F]"
                  }`}
                />
                <span>
                  {savedRsvpStatus === "hadir"
                    ? `Pasti Hadir (${savedGuestCount} Orang)`
                    : savedRsvpStatus === "ragu"
                    ? "Masih Ragu"
                    : "Berhalangan Hadir"}
                </span>
              </div>

              {/* Dynamic Friendly Message based on status */}
              <div className="font-sans text-xs text-[#52525B] leading-relaxed mb-4 font-medium max-w-sm mx-auto">
                {savedRsvpStatus === "hadir" && (
                  <p>
                    Terima kasih atas konfirmasinya. Kami sangat menantikan kehadiran Anda di hari bahagia kami.
                  </p>
                )}
                {savedRsvpStatus === "ragu" && (
                  <p>
                    Jawaban Anda telah kami simpan. Kuota undangan ({maxQuota} orang) tetap kami alokasikan sementara. Anda dapat memastikan kehadiran sewaktu-waktu.
                  </p>
                )}
                {savedRsvpStatus === "tidak_hadir" && (
                  <p>
                    Terima kasih telah memberi kabar. Kami sangat memahami jika Anda belum dapat hadir secara langsung. Doa restu Anda tetap menjadi kado terindah bagi kami.
                  </p>
                )}

                {tamu?.rsvp_tgl_konfirmasi && (
                  <p className="text-[11px] text-[#71717A] mt-2 font-semibold">
                    Tercatat pada: {formatConfirmationTime(tamu.rsvp_tgl_konfirmasi)}
                  </p>
                )}
              </div>

              {/* DIGITAL PASS TIKET RESEPSI (KHUSUS STATUS HADIR) */}
              {savedRsvpStatus === "hadir" && tamu && (
                <div className="my-4 p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] max-w-xs mx-auto text-center relative">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-[#18181B] mb-4">
                    <span className="font-display text-xs font-black uppercase tracking-wider text-[#18181B]">
                      TIKET MASUK RESEPSI
                    </span>
                    <span className="font-sans text-[10px] bg-[#FFE600] text-[#18181B] font-bold px-2 py-0.5 rounded-full border border-[#18181B]">
                      {savedGuestCount} Orang
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-2 rounded-xl border-2 border-[#18181B] inline-block shadow-[2px_2px_0px_#18181B] mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `WEDDING-ARYA-SEKAR:${tamu.kode}:${tamu.nama_tamu}:${savedGuestCount}`
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
                  <p className="font-display text-sm font-bold text-[#FF5D8F] mt-1 break-words">
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
                      className="w-full py-2 px-4 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold shadow-[2.5px_2.5px_0px_#18181B] hover:shadow-[4px_4px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
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

              {/* ACTION: UBAH KONFIRMASI KEHADIRAN */}
              <div className="mt-6 pt-4 border-t-2 border-dashed border-[#18181B]/20 text-center">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#18181B] hover:shadow-[3px_3px_0px_#18181B]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span>
                    {savedRsvpStatus === "hadir"
                      ? "Ubah Konfirmasi Kehadiran"
                      : "Perbarui Konfirmasi Kehadiran"}
                  </span>
                </button>
                <p className="text-[10px] text-[#71717A] mt-1.5 font-medium">
                  *Rencana Anda berubah? Anda dapat memperbarui pilihan kehadiran kapan saja.
                </p>
              </div>
            </div>
          ) : (
            /* =========================================================================
                STATE 1 / STATE 3: FORMULIR RSVP (BARU ATAU MODE PENGUBAHAN)
               ========================================================================= */
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
              {/* EDIT MODE CONTEXT BANNER */}
              {hasConfirmed && isEditing && (
                <div className="p-3.5 rounded-2xl bg-[#FFE600]/30 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-xs text-[#18181B] block">
                      Mode Pengubahan Kehadiran
                    </span>
                    <span className="text-[11px] text-[#52525B] font-medium block">
                      Pilihan sebelumnya:{" "}
                      <strong>
                        {savedRsvpStatus === "hadir"
                          ? `Pasti Hadir (${savedGuestCount} orang)`
                          : savedRsvpStatus === "ragu"
                          ? "Masih Ragu"
                          : "Berhalangan Hadir"}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-[11px] font-extrabold text-[#18181B] underline hover:text-[#FF5D8F] cursor-pointer shrink-0"
                  >
                    Batal Ubah
                  </button>
                </div>
              )}

              {/* Guest Verification Field */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-2 font-bold">
                  {tamu ? "Nama Tamu Undangan" : "Verifikasi Kode Undangan"}
                </label>
                {tamu ? (
                  <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-display font-extrabold text-base text-[#18181B] block break-words">
                        {tamu.nama_tamu}
                      </span>
                      <span className="text-[11px] text-[#2EE59D] font-bold flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-[#2EE59D]" />
                        Terdaftar di buku tamu resmi
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFE600] text-[#18181B] font-bold border border-[#18181B]">
                        Maks {tamu.kuota || 1} org
                      </span>
                      {!initialTamu && (
                        <button
                          type="button"
                          onClick={() => {
                            setTamu(null);
                            onGuestChange?.(null);
                            setManualCode("");
                            setIsEditing(false);
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
                        className="absolute right-2 px-3 py-1 rounded-lg bg-[#FFE600] hover:bg-[#FDD835] text-[#18181B] text-[11px] font-extrabold border border-[#18181B] transition-colors disabled:opacity-40 cursor-pointer"
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
                      className={`py-2 px-2 rounded-2xl text-[11px] sm:text-xs font-bold tracking-tight transition-all border-2 border-[#18181B] cursor-pointer text-center ${
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
                  <div className="flex items-center gap-2 flex-wrap">
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

              {/* Submit Buttons Row */}
              {hasConfirmed && isEditing ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-neutral-100 text-xs font-bold text-[#18181B] cursor-pointer shadow-[2px_2px_0px_#18181B]"
                  >
                    Batal Ubah
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-6 rounded-full bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] font-display text-xs uppercase tracking-wider font-extrabold shadow-[4px_4px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#18181B]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Menyimpan Perubahan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan Kehadiran</span>
                    )}
                  </button>
                </div>
              ) : (
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
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
