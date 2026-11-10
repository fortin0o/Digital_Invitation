"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

interface UcapanItem {
  id_ucapan: string;
  id_undangan?: string;
  nama: string;
  isi_ucapan: string;
  tgl_kirim: string;
}

interface GuestbookSectionProps {
  idUndangan?: string;
  initialGuestName?: string;
}

export default function GuestbookSection({
  idUndangan = "f71db70a-a73f-43f2-9189-9b0fe97fec5b",
  initialGuestName = "",
}: GuestbookSectionProps) {
  const [messages, setMessages] = useState<UcapanItem[]>([]);
  const [nama, setNama] = useState(initialGuestName);
  const [isiUcapan, setIsiUcapan] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Generate seamless repeated list so vertical marquee loops endlessly
  const baseList: UcapanItem[] = React.useMemo(() => {
    if (messages.length === 0) return [];
    let list = [...messages];
    while (list.length < 6) {
      list = [...list, ...messages];
    }
    return list;
  }, [messages]);

  const marqueeDuration = Math.max(20, baseList.length * 4);

  // Load messages from Supabase
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("ucapan")
        .select("*")
        .order("tgl_kirim", { ascending: false })
        .limit(30);

      if (!error && data) {
        setMessages(data as UcapanItem[]);
      }
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !isiUcapan.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const newEntry = {
        id_undangan: idUndangan,
        nama: nama.trim(),
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

      if (data) {
        setMessages((prev) => [data as UcapanItem, ...prev]);
      }
      setIsiUcapan("");
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 4000);
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

  const avatarColors = ["bg-[#FFE600]", "bg-[#FF5D8F]", "bg-[#38BDF8]", "bg-[#2EE59D]", "bg-[#A78BFA]", "bg-[#FF9233]"];

  return (
    <section className="relative w-full py-12 px-4 overflow-hidden">
      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-8">
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

        {/* Input Form Card */}
        <div className="fade-up-element p-6 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] text-left mb-8 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Tuliskan nama Anda..."
                className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-[#18181B] font-bold text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                Pesan Ucapan &amp; Doa
              </label>
              <textarea
                required
                rows={3}
                value={isiUcapan}
                onChange={(e) => setIsiUcapan(e.target.value)}
                placeholder="Berikan ucapan selamat & doa untuk Arya & Sekar..."
                className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-[#18181B] font-medium text-xs outline-none transition-colors resize-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-100 border-2 border-[#18181B] text-xs text-rose-900 font-bold">
                {errorMsg}
              </div>
            )}

            {successNotice && (
              <div className="p-3 rounded-xl bg-[#2EE59D]/40 border-2 border-[#18181B] text-xs text-[#18181B] font-bold">
                Terima kasih, pesan dan doa Anda telah berhasil terkirim.
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

        {/* Message List: Endless Vertical Running Marquee */}
        <div className="fade-up-element text-left px-1">
          <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#18181B]">
            <span className="font-display text-base font-extrabold text-[#18181B]">
              Kumpulan Doa &amp; Ucapan ({messages.length})
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFE600] text-[#18181B] font-bold text-[10px] border border-[#18181B]">
              Realtime
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
            <div className="relative h-[420px] overflow-hidden rounded-[28px] bg-[#FFFDF5] p-3 border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] select-none">
              {/* Soft Gradient Fade Overlays (Top & Bottom) */}
              <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#FFFDF5] to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#FFFDF5] to-transparent z-10 pointer-events-none" />

              {/* Running Track */}
              <div
                className="flex flex-col gap-3 animate-marquee-down"
                style={{
                  animationDuration: `${marqueeDuration}s`,
                }}
              >
                {/* Track Set 1 */}
                <div className="flex flex-col gap-3">
                  {baseList.map((item, idx) => {
                    const initial = (item.nama || "?").trim().charAt(0).toUpperCase();
                    const color = avatarColors[idx % avatarColors.length];
                    return (
                      <div
                        key={`m1-${item.id_ucapan}-${idx}`}
                        className="p-3.5 rounded-2xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] text-left"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full ${color} border-2 border-[#18181B] flex items-center justify-center font-display text-xs text-[#18181B] font-black`}>
                              {initial}
                            </span>
                            <h4 className="font-display text-sm text-[#18181B] font-bold leading-tight">
                              {item.nama}
                            </h4>
                          </div>
                          <span className="font-sans text-[10px] text-[#71717A] font-semibold bg-[#FFFDF5] px-2 py-0.5 rounded-full border border-[#18181B]">
                            {formatDate(item.tgl_kirim)}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#27272A] leading-relaxed font-medium pl-9">
                          {item.isi_ucapan}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Track Set 2 (Clone for loop) */}
                <div className="flex flex-col gap-3" aria-hidden="true">
                  {baseList.map((item, idx) => {
                    const initial = (item.nama || "?").trim().charAt(0).toUpperCase();
                    const color = avatarColors[idx % avatarColors.length];
                    return (
                      <div
                        key={`m2-${item.id_ucapan}-${idx}`}
                        className="p-3.5 rounded-2xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] text-left"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full ${color} border-2 border-[#18181B] flex items-center justify-center font-display text-xs text-[#18181B] font-black`}>
                              {initial}
                            </span>
                            <h4 className="font-display text-sm text-[#18181B] font-bold leading-tight">
                              {item.nama}
                            </h4>
                          </div>
                          <span className="font-sans text-[10px] text-[#71717A] font-semibold bg-[#FFFDF5] px-2 py-0.5 rounded-full border border-[#18181B]">
                            {formatDate(item.tgl_kirim)}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#27272A] leading-relaxed font-medium pl-9">
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
      </div>
    </section>
  );
}
