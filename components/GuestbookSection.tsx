"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

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

  // Duration scales with count for steady pleasant reading speed
  const marqueeDuration = Math.max(22, baseList.length * 4.5);

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
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Baru saja";
    }
  };

  return (
    <section className="relative w-full py-16 px-4 overflow-hidden">
      <BotanicalCorner position="top-left" size={110} opacity={0.5} />
      <BotanicalCorner position="bottom-right" size={110} opacity={0.5} />

      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-10">
          <p className="font-serif italic text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
            Donga Pangestu
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3D261C] font-normal tracking-wide">
            Serat Pangestu
          </h2>
          <BotanicalDivider width={130} className="!my-3" />
          <p className="font-sans text-xs text-[#8A6B53] max-w-xs mx-auto leading-relaxed font-light">
            Kintunaken donga saha berkah pangestu kagem penganten kekalih lumantar serat buku tamu menika.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="fade-up-element p-6 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)] text-left mb-10 relative">
          <BotanicalCorner position="top-right" size={70} opacity={0.3} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-[#8A6B53] mb-1 font-medium">
                Asma Jangkep (Nama Lengkap)
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Asma panjenengan..."
                className="w-full py-2 bg-transparent border-b border-[#C5A059]/40 focus:border-[#3D261C] text-[#3D261C] font-sans text-sm placeholder-[#8A6B53]/50 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-[#8A6B53] mb-1 font-medium">
                Serat Donga Pangestu
              </label>
              <textarea
                required
                rows={3}
                value={isiUcapan}
                onChange={(e) => setIsiUcapan(e.target.value)}
                placeholder="Tuliskan donga pangestu kagem Arya & Sekar..."
                className="w-full py-2 bg-transparent border-b border-[#C5A059]/40 focus:border-[#3D261C] text-[#3D261C] font-sans text-sm placeholder-[#8A6B53]/50 outline-none transition-colors resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            {successNotice && (
              <p className="text-xs text-[#3D261C] bg-[#FAF6F0] p-2.5 rounded-xl border border-[#C5A059]/40 animate-in fade-in flex items-center gap-2">
                <span className="text-[#C5A059]">✦</span>
                <span>Matur nuwun sanget, donga pangestu panjenengan sampun kakintun.</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-full bg-[#5C3A21] hover:bg-[#3D261C] border border-[#C5A059] text-[#FFFDF9] font-sans text-xs uppercase tracking-widest font-medium shadow-sm active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Ngintunaken Ucapan...</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-[#EAD7A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Kintun Donga Pangestu</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Message List: Endless Vertical Running Marquee (Atas ke Bawah) */}
        <div className="fade-up-element text-left px-1 sm:px-2">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#C5A059]/25">
            <span className="font-serif text-lg text-[#3D261C] font-medium">
              Untaian Donga ({messages.length})
            </span>
            <span className="font-sans text-[11px] text-[#8A6B53]">
              Terbaru
            </span>
          </div>

          {fetching ? (
            <p className="text-center py-8 font-sans text-xs text-[#8A6B53] italic animate-pulse">
              Memuat ucapan...
            </p>
          ) : messages.length === 0 ? (
            <p className="text-center py-8 font-sans text-xs text-[#8A6B53] italic">
              Dereng wonten serat donga. Dados tiyang sepisanan ingkang maringi donga pangestu!
            </p>
          ) : (
            <div className="relative h-[440px] overflow-hidden rounded-3xl bg-[#FAF6F0]/60 p-2 sm:p-3 border border-[#C5A059]/25 select-none">
              {/* Soft Gradient Fade Overlays (Top & Bottom) */}
              <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#FAF6F0] to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#FAF6F0] to-transparent z-10 pointer-events-none" />

              {/* Seamless Infinite Running Track (Top to Bottom) */}
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
                    return (
                      <div
                        key={`m1-${item.id_ucapan}-${idx}`}
                        className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-[0_2px_10px_rgba(61,38,28,0.03)] hover:border-[#C5A059] transition-all text-left"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#FAF6F0] border border-[#C5A059]/40 flex items-center justify-center font-serif text-[11px] text-[#5C3A21] font-bold">
                              {initial}
                            </span>
                            <h4 className="font-serif text-sm sm:text-base text-[#3D261C] font-semibold leading-tight">
                              {item.nama}
                            </h4>
                          </div>
                          <span className="font-sans text-[10px] text-[#8A6B53]/80 whitespace-nowrap bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#C5A059]/20">
                            {formatDate(item.tgl_kirim)}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#5C3A21] leading-relaxed font-normal pl-8">
                          {item.isi_ucapan}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Track Set 2 (Seamless loop clone) */}
                <div className="flex flex-col gap-3" aria-hidden="true">
                  {baseList.map((item, idx) => {
                    const initial = (item.nama || "?").trim().charAt(0).toUpperCase();
                    return (
                      <div
                        key={`m2-${item.id_ucapan}-${idx}`}
                        className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-[0_2px_10px_rgba(61,38,28,0.03)] hover:border-[#C5A059] transition-all text-left"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#FAF6F0] border border-[#C5A059]/40 flex items-center justify-center font-serif text-[11px] text-[#5C3A21] font-bold">
                              {initial}
                            </span>
                            <h4 className="font-serif text-sm sm:text-base text-[#3D261C] font-semibold leading-tight">
                              {item.nama}
                            </h4>
                          </div>
                          <span className="font-sans text-[10px] text-[#8A6B53]/80 whitespace-nowrap bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#C5A059]/20">
                            {formatDate(item.tgl_kirim)}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#5C3A21] leading-relaxed font-normal pl-8">
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
