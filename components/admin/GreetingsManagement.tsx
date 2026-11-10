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
    if (!confirm("Hapus ucapan ini dari buku tamu?")) return;

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
    <div className="bg-white rounded-[24px] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-6 space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#18181B] gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#18181B]">
            Daftar Ucapan &amp; Doa Restu ({greetings.length})
          </h2>
          <p className="text-xs text-[#71717A] mt-1 font-bold">
            Semua ucapan dan doa dari para tamu undangan yang masuk secara realtime.
          </p>
        </div>

        {greetings.length > 0 && (
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengirim atau pesan..."
              className="w-full px-4 py-2 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-xs font-bold text-[#18181B] outline-none focus:bg-white"
            />
          </div>
        )}
      </div>

      {greetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-display text-base font-extrabold text-[#18181B]">Belum ada ucapan</p>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Ucapan dari para tamu undangan akan otomatis tampil di sini.
          </p>
        </div>
      ) : filteredGreetings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm font-bold text-[#18181B]">Tidak ada ucapan yang cocok</p>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Coba gunakan kata kunci pencarian yang lain.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGreetings.map((item) => (
            <div
              key={item.id_ucapan}
              className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-white transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display text-sm font-extrabold text-[#18181B]">
                    {item.nama}
                  </h3>
                  <span className="text-[10px] text-[#71717A] font-bold">
                    • {formatDate(item.tgl_kirim)}
                  </span>
                </div>
                <p className="text-xs text-[#27272A] leading-relaxed font-medium">
                  {item.isi_ucapan}
                </p>
              </div>

              <button
                onClick={() => handleDelete(item.id_ucapan)}
                disabled={deletingId === item.id_ucapan}
                type="button"
                className="self-end sm:self-start px-3 py-1 rounded-lg border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-[1.5px_1.5px_0px_#18181B]"
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
