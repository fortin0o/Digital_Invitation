"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TamuWithRsvp } from "@/lib/guestInvitation";
import { ExtraInvitationContent } from "@/lib/invitationContentConfig";
import NeoSticker from "@/components/ui/NeoSticker";
import NeoDivider from "@/components/ui/NeoDivider";

interface UcapanItem {
  id_ucapan: string;
  id_undangan?: string;
  nama: string;
  isi_ucapan: string;
  tgl_kirim: string;
}

interface GuestbookSectionProps {
  idUndangan?: string;
  tamu?: TamuWithRsvp | null;
  coupleName?: string;
  extraContent?: ExtraInvitationContent | null;
}

const cautionTapePattern =
  "repeating-linear-gradient(-45deg, #FFE600 0, #FFE600 12px, #18181B 12px, #18181B 24px)";

export default function GuestbookSection({
  idUndangan = "",
  tamu = null,
  coupleName = "kedua mempelai",
  extraContent,
}: GuestbookSectionProps) {
  // Guestbook is unlocked ONLY after the guest has confirmed their RSVP
  const isRsvpConfirmed = Boolean(tamu && tamu.rsvp_status);

  // Messages state
  const [messages, setMessages] = useState<UcapanItem[]>([]);
  const [fetching, setFetching] = useState(false);

  // Form input state
  const [isiUcapan, setIsiUcapan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  const isPrivateOnly = extraContent?.guestbookVisibility === "private_to_couple";

  // Generate seamless repeated list so vertical marquee loops endlessly
  const baseList: UcapanItem[] = React.useMemo(() => {
    if (!isRsvpConfirmed || isPrivateOnly || messages.length === 0) return [];
    let list = [...messages];
    while (list.length < 6) {
      list = [...list, ...messages];
    }
    return list;
  }, [isRsvpConfirmed, isPrivateOnly, messages]);

  const marqueeDuration = Math.max(20, baseList.length * 4);

  // Load messages from Supabase ONLY if guest has confirmed RSVP and not set to private-to-couple
  useEffect(() => {
    if (!isRsvpConfirmed || isPrivateOnly || !idUndangan) {
      return;
    }

    let active = true;

    async function fetchMessages() {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("ucapan")
          .select("*")
          .eq("id_undangan", idUndangan)
          .order("tgl_kirim", { ascending: false })
          .limit(30);

        if (active && !error && data) {
          setMessages(data as UcapanItem[]);
        }
      } catch {
        // ignore
      } finally {
        if (active) setFetching(false);
      }
    }

    void fetchMessages();

    return () => {
      active = false;
    };
  }, [idUndangan, isRsvpConfirmed, isPrivateOnly]);

  const handleScrollToRsvp = () => {
    const el = document.getElementById("konfirmasi-rsvp") || document.getElementById("rsvp");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tamu || !isiUcapan.trim()) return;
    if (!idUndangan) {
      setErrorMsg("Data acara undangan belum tersedia di database.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const newEntry = {
        id_undangan: idUndangan,
        nama: tamu.nama_tamu.trim(),
        isi_ucapan: isiUcapan.trim(),
        tgl_kirim: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("ucapan")
        .insert(newEntry)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data && !isPrivateOnly) {
        setMessages((prev) => [data as UcapanItem, ...prev]);
      }
      setIsiUcapan("");
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 4500);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal mengirim ucapan.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Baru saja";
    }
  };

  const avatarColors = [
    "bg-[#FFE600]",
    "bg-[#FF5D8F]",
    "bg-[#38BDF8]",
    "bg-[#2EE59D]",
    "bg-[#A78BFA]",
    "bg-[#FF9233]",
  ];

  return (
    <section className="relative w-full py-6 sm:py-8 px-4 overflow-hidden" id="buku-tamu-section">
      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-6">
          <div className="mb-2">
            <NeoSticker
              label="WISHES & PRAYERS"
              color="cyan"
              rotate="-rotate-2"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            Buku Tamu &amp; Ucapan Doa
          </h2>
          <NeoDivider className="!my-2" />
          <p className="font-sans text-xs text-[#52525B] max-w-xs mx-auto leading-relaxed font-medium">
            Tinggalkan pesan manis dan doa restu terbaik Anda untuk kedua mempelai:
          </p>
        </div>

        {/* =========================================================================
            STATE 1: GUESTBOOK LOCKED WITH POLICE LINE / CAUTION STRIPES
            (Shown when guest has not confirmed RSVP yet)
           ========================================================================= */}
        {!tamu || !tamu.rsvp_status ? (
          <div className="fade-up-element relative rounded-2xl sm:rounded-3xl bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] overflow-hidden mb-6">
            {/* Top Caution Tape Banner */}
            <div
              className="w-full h-4 sm:h-5 border-b-2 border-[#18181B]"
              style={{ background: cautionTapePattern }}
            />

            {/* Locked Content Container */}
            <div className="p-6 sm:p-8 relative">
              {/* Overlapping Crossing Diagonal Caution Tape Strips (Police-line style without text) */}
              <div
                className="absolute top-1/2 left-[-15%] right-[-15%] h-7 sm:h-8 -translate-y-1/2 -rotate-6 border-y-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] pointer-events-none opacity-85 z-10"
                style={{ background: cautionTapePattern }}
              />
              <div
                className="absolute top-1/2 left-[-15%] right-[-15%] h-7 sm:h-8 -translate-y-1/2 rotate-6 border-y-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] pointer-events-none opacity-85 z-10"
                style={{ background: cautionTapePattern }}
              />

              {/* Centered Informative Unlock Card (Positioned above tape) */}
              <div className="relative z-20 max-w-xs mx-auto p-5 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FFE600] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-[#18181B]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#18181B] mb-1.5">
                  Buku Tamu Terkunci
                </h3>

                <p className="font-sans text-xs text-[#52525B] leading-relaxed font-medium mb-4">
                  {tamu
                    ? `Halo ${tamu.nama_tamu}, silakan isi konfirmasi kehadiran (RSVP) terlebih dahulu di atas untuk membuka buku tamu dan mengirim ucapan.`
                    : "Silakan isi dan konfirmasi kehadiran Anda pada bagian RSVP di atas terlebih dahulu untuk membuka akses buku tamu & mengirim doa restu."}
                </p>

                <button
                  type="button"
                  onClick={handleScrollToRsvp}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-black shadow-[2px_2px_0px_#18181B] hover:shadow-[3px_3px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <span>Isi RSVP Terlebih Dahulu</span>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Caution Tape Banner */}
            <div
              className="w-full h-4 sm:h-5 border-t-2 border-[#18181B]"
              style={{ background: cautionTapePattern }}
            />
          </div>
        ) : (
          /* =========================================================================
              STATE 2: GUEST HAS CONFIRMED RSVP - UNLOCKED FULL ACCESS
             ========================================================================= */
          <>
            {/* Input Form Card */}
            <div className="fade-up-element p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] text-left mb-6 relative">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Guest Verified Identity Badge */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1.5 font-bold">
                    Nama Tamu Undangan
                  </label>
                  <div className="p-3.5 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-display font-extrabold text-sm text-[#18181B] block truncate">
                        {tamu.nama_tamu}
                      </span>
                      <span className="text-[10px] text-[#0F766E] font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2EE59D] border border-[#18181B]" />
                        RSVP Terkonfirmasi • Tamu Resmi (Kode: {tamu.kode})
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#2EE59D] text-[#18181B] text-[10px] font-black border border-[#18181B] shrink-0">
                      Terverifikasi
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                    Pesan Ucapan &amp; Doa Restu
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={isiUcapan}
                    onChange={(e) => setIsiUcapan(e.target.value)}
                    placeholder={`Tuliskan doa restu dan harapan terbaik Anda untuk ${coupleName}...`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-[#18181B] font-medium text-xs outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-[#18181B] text-xs text-rose-900 font-bold">
                    {errorMsg}
                  </div>
                )}

                {successNotice && (
                  <div className="p-3.5 rounded-xl bg-[#2EE59D]/40 border-2 border-[#18181B] text-xs text-[#18181B] font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                    <span>
                      {isPrivateOnly
                        ? "Terima kasih, doa dan ucapan Anda telah terkirim secara privat kepada kedua mempelai."
                        : "Terima kasih, pesan dan doa Anda telah berhasil terkirim."}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-full bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#18181B] font-display text-xs uppercase tracking-wider font-extrabold border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Mengirim Ucapan...</span>
                  ) : (
                    <span>Kirim Ucapan &amp; Doa Restu</span>
                  )}
                </button>
              </form>
            </div>

            {/* Message List */}
            {isPrivateOnly ? (
              <div className="fade-up-element p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] text-center text-xs text-[#52525B] font-medium">
                Pesan dan doa dari tamu undangan dikirimkan secara privat kepada kedua mempelai.
              </div>
            ) : (
              <div className="fade-up-element text-left px-2">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#18181B]">
                  <span className="font-display text-base font-extrabold text-[#18181B]">
                    Kumpulan Doa &amp; Ucapan ({messages.length})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFE600] text-[#18181B] font-bold text-[10px] border border-[#18181B]">
                    Khusus Tamu Terdaftar
                  </span>
                </div>

                {fetching ? (
                  <p className="text-center py-8 font-sans text-xs text-[#71717A] italic">
                    Memuat ucapan...
                  </p>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 p-6 rounded-2xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
                    <p className="font-bold text-sm text-[#18181B]">Belum ada ucapan</p>
                    <p className="font-sans text-xs text-[#71717A] mt-1">
                      Jadilah yang pertama mengirimkan ucapan doa restu!
                    </p>
                  </div>
                ) : (
                  <div className="relative h-[420px] overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFFDF5] p-4 border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] select-none">
                    {/* Soft Gradient Fade Overlays (Top & Bottom) */}
                    <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#FFFDF5] to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#FFFDF5] to-transparent z-10 pointer-events-none" />

                    {/* Running Track */}
                    <div
                      className="flex flex-col gap-4 animate-marquee-down"
                      style={{
                        animationDuration: `${marqueeDuration}s`,
                      }}
                    >
                      {/* Track Set 1 */}
                      <div className="flex flex-col gap-4">
                        {baseList.map((item, idx) => {
                          const initial = (item.nama || "?").trim().charAt(0).toUpperCase();
                          const color = avatarColors[idx % avatarColors.length];
                          return (
                            <div
                              key={`m1-${item.id_ucapan}-${idx}`}
                              className="p-4 rounded-2xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] text-left"
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`w-8 h-8 rounded-full ${color} border-2 border-[#18181B] flex items-center justify-center font-display text-xs text-[#18181B] font-black shrink-0`}>
                                    {initial}
                                  </span>
                                  <h4 className="font-display text-sm text-[#18181B] font-bold leading-tight truncate">
                                    {item.nama}
                                  </h4>
                                </div>
                                <span suppressHydrationWarning className="font-sans text-[10px] text-[#71717A] font-semibold bg-[#FFFDF5] px-2 py-0.5 rounded-full border border-[#18181B] shrink-0">
                                  {formatDate(item.tgl_kirim)}
                                </span>
                              </div>
                              <p className="font-sans text-xs text-[#27272A] leading-relaxed font-medium pl-10 break-words break-all">
                                {item.isi_ucapan}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Track Set 2 (Clone for loop) */}
                      <div className="flex flex-col gap-4" aria-hidden="true">
                        {baseList.map((item, idx) => {
                          const initial = (item.nama || "?").trim().charAt(0).toUpperCase();
                          const color = avatarColors[idx % avatarColors.length];
                          return (
                            <div
                              key={`m2-${item.id_ucapan}-${idx}`}
                              className="p-4 rounded-2xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] text-left"
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`w-8 h-8 rounded-full ${color} border-2 border-[#18181B] flex items-center justify-center font-display text-xs text-[#18181B] font-black shrink-0`}>
                                    {initial}
                                  </span>
                                  <h4 className="font-display text-sm text-[#18181B] font-bold leading-tight truncate">
                                    {item.nama}
                                  </h4>
                                </div>
                                <span suppressHydrationWarning className="font-sans text-[10px] text-[#71717A] font-semibold bg-[#FFFDF5] px-2 py-0.5 rounded-full border border-[#18181B] shrink-0">
                                  {formatDate(item.tgl_kirim)}
                                </span>
                              </div>
                              <p className="font-sans text-xs text-[#27272A] leading-relaxed font-medium pl-10 break-words break-all">
                                {item.isi_ucapan}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
