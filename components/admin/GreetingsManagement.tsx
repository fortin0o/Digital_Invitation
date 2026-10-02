"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface UcapanItem {
  id_ucapan: string;
  id_undangan?: string;
  nama: string;
  isi_ucapan: string;
  tgl_kirim: string;
}

interface GreetingsManagementProps {
  greetings: UcapanItem[];
  onRefresh: () => void;
}

export default function GreetingsManagement({
  greetings,
  onRefresh,
}: GreetingsManagementProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredGreetings = greetings.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.isi_ucapan.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (idUcapan: string) => {
    if (!confirm("Hapus serat donga ini dari buku tamu?")) return;

    setDeletingId(idUcapan);
    try {
      const { error } = await supabase.from("ucapan").delete().eq("id_ucapan", idUcapan);
      if (error) {
        alert("Gagal menghapus ucapan: " + error.message);
      } else {
        onRefresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setDeletingId(null);
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
      return "Waktu tidak diketahui";
    }
  };

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-[#C5A059]/30 shadow-xs p-5 sm:p-6 space-y-4 font-inter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#C5A059]/20 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#3D261C]">
            Daftar Serat Donga Pangestu ({greetings.length})
          </h2>
          <p className="text-xs text-[#8A6B53] mt-0.5">
            Semua ucapan dan doa dari siswa/tamu yang masuk secara realtime.
          </p>
        </div>

        {greetings.length > 0 && (
          <div className="relative max-w-xs w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A6B53]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengirim atau ucapan..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 text-xs text-[#3D261C] outline-none focus:border-[#5C3A21] transition-colors"
            />
          </div>
        )}
      </div>

      {greetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base font-semibold text-[#3D261C]">Belum ada ucapan</p>
          <p className="text-xs text-[#8A6B53] mt-1">
            Ucapan dari para tamu undangan akan otomatis tampil di sini.
          </p>
        </div>
      ) : filteredGreetings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm font-semibold text-[#3D261C]">Tidak ada ucapan yang cocok</p>
          <p className="text-xs text-[#8A6B53] mt-1">
            Coba gunakan kata kunci pencarian yang lain.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGreetings.map((item) => (
            <div
              key={item.id_ucapan}
              className="p-4 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/25 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-[#C5A059]/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold text-[#3D261C]">
                    {item.nama}
                  </h3>
                  <span className="text-[10px] text-[#8A6B53]">
                    • {formatDate(item.tgl_kirim)}
                  </span>
                </div>
                <p className="text-xs text-[#5C3A21] leading-relaxed font-light">
                  {item.isi_ucapan}
                </p>
              </div>

              <button
                onClick={() => handleDelete(item.id_ucapan)}
                disabled={deletingId === item.id_ucapan}
                type="button"
                className="self-end sm:self-start px-2.5 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deletingId === item.id_ucapan ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
