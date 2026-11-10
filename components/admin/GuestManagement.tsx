"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface GuestItem {
  id_tamu: string;
  id_undangan: string;
  nama_tamu: string;
  kode: string;
  kuota: number;
  rsvp?: {
    id_rsvp?: string;
    status: string;
    jumlah_hadir: number;
    tgl_konfirmasi: string;
  } | null;
}

interface GuestManagementProps {
  guests: GuestItem[];
  onRefresh: () => void;
  idUndangan: string;
  slug?: string;
}

export default function GuestManagement({
  guests,
  onRefresh,
  idUndangan,
  slug = "rina-dan-budi",
}: GuestManagementProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newKuota, setNewKuota] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrModalGuest, setQrModalGuest] = useState<GuestItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateUniqueCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) return;

    setIsSubmitting(true);
    try {
      const code = generateUniqueCode();
      const { error } = await supabase.from("tamu").insert({
        id_undangan: idUndangan,
        nama_tamu: newNama.trim(),
        kode: code,
        kuota: Number(newKuota) || 1,
      });

      if (error) {
        alert("Gagal menambahkan tamu: " + error.message);
      } else {
        showToast(`Tamu "${newNama}" berhasil ditambahkan!`);
        setNewNama("");
        setNewKuota(1);
        setShowAddModal(false);
        onRefresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGuest = async (idTamu: string, nama: string) => {
    if (!confirm(`Hapus tamu "${nama}" dari daftar undangan?`)) return;

    try {
      await supabase.from("rsvp").delete().eq("id_tamu", idTamu);
      const { error } = await supabase.from("tamu").delete().eq("id_tamu", idTamu);

      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        showToast(`Tamu "${nama}" berhasil dihapus.`);
        onRefresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    }
  };

  const getInvitationUrl = (kode: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const activeSlug = slug || "rina-dan-budi";
    return `${origin}/${activeSlug}/${kode}`;
  };

  const copyInvitationLink = (kode: string, nama: string) => {
    const url = getInvitationUrl(kode);
    navigator.clipboard.writeText(url);
    showToast(`Link untuk ${nama} berhasil disalin!`);
  };

  const openWhatsApp = (tamu: GuestItem) => {
    const url = getInvitationUrl(tamu.kode);
    const message = `Halo ${tamu.nama_tamu}! 🎉\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundangmu untuk hadir dan merayakan hari bahagia kami: The Wedding of Arya & Sekar.\n\nBerikut tautan undangan spesial untukmu:\n${url}\n\nMerupakan suatu kebahagiaan bagi kami apabila kamu dapat hadir. Terima kasih banyak!\n- Arya & Sekar 💕`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleExportCSV = () => {
    if (guests.length === 0) {
      alert("Tidak ada data tamu untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nama Tamu",
      "Kode Unik",
      "Maks Kuota",
      "Status Konfirmasi",
      "Jumlah Hadir",
      "Waktu Konfirmasi",
      "Link Undangan",
    ];

    const rows = guests.map((g, idx) => {
      const statusLabel =
        g.rsvp?.status === "hadir"
          ? "Hadir"
          : g.rsvp?.status === "ragu"
          ? "Ragu-ragu"
          : g.rsvp?.status === "tidak_hadir"
          ? "Tidak Hadir"
          : "Belum Konfirmasi";

      const tgl = g.rsvp?.tgl_konfirmasi
        ? new Date(g.rsvp.tgl_konfirmasi).toLocaleString("id-ID")
        : "-";

      const link = getInvitationUrl(g.kode);

      return [
        idx + 1,
        `"${g.nama_tamu.replace(/"/g, '""')}"`,
        `'${g.kode}`,
        g.kuota || 1,
        `"${statusLabel}"`,
        g.rsvp?.status === "hadir" ? g.rsvp.jumlah_hadir || 1 : 0,
        `"${tgl}"`,
        `"${link}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Tamu_RSVP_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Data tamu & RSVP berhasil diekspor ke Excel!");
  };

  const filteredGuests = guests.filter((g) => {
    const matchSearch =
      g.nama_tamu.toLowerCase().includes(search.toLowerCase()) ||
      g.kode.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "hadir") return g.rsvp?.status === "hadir";
    if (statusFilter === "ragu") return g.rsvp?.status === "ragu";
    if (statusFilter === "tidak_hadir") return g.rsvp?.status === "tidak_hadir";
    if (statusFilter === "belum") return !g.rsvp?.status;

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#18181B] text-white text-xs font-bold shadow-[4px_4px_0px_#FFE600] animate-in fade-in flex items-center gap-2 border-2 border-white">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-[24px] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B]">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Cari nama tamu atau kode..."
              className="w-full px-3 py-2 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-xs font-bold text-[#18181B] outline-none focus:bg-white"
            />
          </div>

          {/* Clean Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-xs text-[#18181B] font-bold outline-none cursor-pointer"
          >
            <option value="all">Semua Tamu ({guests.length})</option>
            <option value="hadir">Konfirmasi Hadir ({guests.filter((g) => g.rsvp?.status === "hadir").length})</option>
            <option value="ragu">Masih Ragu ({guests.filter((g) => g.rsvp?.status === "ragu").length})</option>
            <option value="tidak_hadir">Tidak Hadir ({guests.filter((g) => g.rsvp?.status === "tidak_hadir").length})</option>
            <option value="belum">Belum Konfirmasi ({guests.filter((g) => !g.rsvp?.status).length})</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Export Excel Button */}
          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFDF5] hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer whitespace-nowrap"
            title="Unduh Laporan Excel (CSV)"
          >
            <span>📊</span>
            <span>Ekspor Excel</span>
          </button>

          {/* Add Guest Button */}
          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>+</span>
            <span>Tambah Tamu</span>
          </button>
        </div>
      </div>

      {/* Guest List Table */}
      <div className="bg-white rounded-[24px] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="font-display font-extrabold text-base text-[#18181B]">Tidak ada tamu ditemukan</p>
            <p className="text-xs text-[#71717A] mt-1 font-medium">
              Coba sesuaikan kata kunci pencarian atau tambah tamu baru.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-[#FFFDF5] text-[#18181B] uppercase tracking-wider text-[11px] border-b-2 border-[#18181B] font-extrabold">
                  <tr>
                    <th className="py-3 px-4">Nama Tamu</th>
                    <th className="py-3 px-4">Kode Unik</th>
                    <th className="py-3 px-4 text-center">Kuota</th>
                    <th className="py-3 px-4">Status RSVP</th>
                    <th className="py-3 px-4 text-center">Jumlah Hadir</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[#18181B]/15 text-[#18181B]">
                  {filteredGuests.map((tamu) => {
                    const status = tamu.rsvp?.status;
                    return (
                      <tr key={tamu.id_tamu} className="hover:bg-[#FFFDF5] transition-colors">
                        <td className="py-3 px-4 font-bold text-sm">
                          {tamu.nama_tamu}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-[#71717A]">
                          {tamu.kode}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {tamu.kuota} org
                        </td>
                        <td className="py-3 px-4">
                          {status === "hadir" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#2EE59D] text-[#18181B] border border-[#18181B]">
                              Hadir
                            </span>
                          )}
                          {status === "ragu" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFE600] text-[#18181B] border border-[#18181B]">
                              Masih Ragu
                            </span>
                          )}
                          {status === "tidak_hadir" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FF5D8F] text-[#18181B] border border-[#18181B]">
                              Tidak Hadir
                            </span>
                          )}
                          {!status && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F4F5] text-[#71717A] border border-[#18181B]">
                              Belum Konfirmasi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {status === "hadir" ? `${tamu.rsvp?.jumlah_hadir || 1} orang` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setQrModalGuest(tamu)}
                              type="button"
                              className="px-2 py-1 rounded-lg border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#38BDF8] text-[#18181B] text-[11px] font-bold shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer"
                              title="Lihat QR Code Tiket"
                            >
                              QR
                            </button>
                            <button
                              onClick={() => copyInvitationLink(tamu.kode, tamu.nama_tamu)}
                              type="button"
                              className="px-2.5 py-1 rounded-lg border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-[11px] font-bold shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer"
                            >
                              Salin Link
                            </button>
                            <button
                              onClick={() => openWhatsApp(tamu)}
                              type="button"
                              className="px-2.5 py-1 rounded-lg border-2 border-[#18181B] bg-[#2EE59D] hover:bg-[#28D08D] text-[#18181B] text-[11px] font-extrabold shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(tamu.id_tamu, tamu.nama_tamu)}
                              type="button"
                              className="p-1 rounded-lg border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 cursor-pointer shadow-[1.5px_1.5px_0px_#18181B]"
                              title="Hapus Tamu"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View: Touch-friendly 2x2 action buttons */}
            <div className="block md:hidden divide-y divide-[#18181B]/15">
              {filteredGuests.map((tamu) => {
                const status = tamu.rsvp?.status;
                return (
                  <div key={tamu.id_tamu} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-[#18181B] truncate">
                          {tamu.nama_tamu}
                        </h4>
                        <p className="font-mono text-xs text-[#71717A] mt-0.5 font-bold">
                          Kode: {tamu.kode} • Kuota: {tamu.kuota} org
                        </p>
                      </div>

                      <div className="shrink-0">
                        {status === "hadir" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2EE59D] text-[#18181B] border border-[#18181B]">
                            Hadir ({tamu.rsvp?.jumlah_hadir || 1})
                          </span>
                        )}
                        {status === "ragu" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFE600] text-[#18181B] border border-[#18181B]">
                            Ragu
                          </span>
                        )}
                        {status === "tidak_hadir" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF5D8F] text-[#18181B] border border-[#18181B]">
                            Absen
                          </span>
                        )}
                        {!status && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F4F5] text-[#71717A] border border-[#18181B]">
                            Belum respon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Touch-optimized 2x2 action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#18181B]/10">
                      <button
                        onClick={() => copyInvitationLink(tamu.kode, tamu.nama_tamu)}
                        type="button"
                        className="py-2 px-2.5 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>📋</span>
                        <span>Salin Link</span>
                      </button>
                      <button
                        onClick={() => openWhatsApp(tamu)}
                        type="button"
                        className="py-2 px-2.5 rounded-xl border-2 border-[#18181B] bg-[#2EE59D] hover:bg-[#28D08D] text-[#18181B] text-xs font-extrabold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>💬</span>
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => setQrModalGuest(tamu)}
                        type="button"
                        className="py-2 px-2.5 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#38BDF8] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>🎟️</span>
                        <span>Tiket QR</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(tamu.id_tamu, tamu.nama_tamu)}
                        type="button"
                        className="py-2 px-2.5 rounded-xl border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>🗑️</span>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-sm rounded-[28px] bg-white border-[3px] border-[#18181B] p-5 sm:p-6 shadow-[8px_8px_0px_#FFE600] relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-xl font-extrabold text-[#18181B] mb-1">
              Tambah Tamu Undangan
            </h3>
            <p className="text-xs text-[#71717A] mb-5 font-semibold">
              Kode personal unik otomatis digenerate untuk link undangan personal.
            </p>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                  Nama Tamu
                </label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                  Maksimal Kuota (Orang)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={newKuota}
                  onChange={(e) => setNewKuota(Number(e.target.value))}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] text-[#18181B] text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-black shadow-[2px_2px_0px_#18181B] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Tamu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest QR Code Pass Modal */}
      {qrModalGuest && (
        <div className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xs rounded-[28px] bg-white border-[3px] border-[#18181B] p-5 sm:p-6 shadow-[8px_8px_0px_#38BDF8] relative text-center max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQrModalGuest(null)}
              type="button"
              className="absolute top-4 right-4 text-[#18181B] hover:scale-110 p-1 font-black cursor-pointer"
            >
              ✕
            </button>

            <span className="text-[10px] uppercase tracking-wider text-[#18181B] font-extrabold bg-[#FFE600] px-2.5 py-0.5 rounded-full border border-[#18181B]">
              TIKET MASUK DIGITAL
            </span>
            <h3 className="font-display text-lg font-extrabold text-[#18181B] mt-2 mb-3">
              {qrModalGuest.nama_tamu}
            </h3>

            <div className="bg-[#FFFDF5] p-3 rounded-2xl border-2 border-[#18181B] inline-block shadow-[3px_3px_0px_#18181B] mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `WEDDING-ARYA-SEKAR:${qrModalGuest.kode}:${qrModalGuest.nama_tamu}:${qrModalGuest.rsvp?.jumlah_hadir || qrModalGuest.kuota || 1}`
                )}&color=18181B&bgcolor=FFFDF5`}
                alt="QR Code Tamu"
                className="w-40 h-40 mx-auto rounded-lg"
              />
            </div>

            <p className="font-mono text-xs font-black text-[#18181B] tracking-widest">
              KODE: {qrModalGuest.kode}
            </p>
            <p className="text-xs text-[#52525B] mt-1 font-bold">
              Kuota: {qrModalGuest.rsvp?.jumlah_hadir || qrModalGuest.kuota || 1} Orang
            </p>

            <div className="mt-4 pt-3 border-t-2 border-[#18181B] flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyInvitationLink(qrModalGuest.kode, qrModalGuest.nama_tamu)}
                className="flex-1 py-2 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-xs font-bold cursor-pointer"
              >
                Salin Link
              </button>
              <button
                type="button"
                onClick={() => setQrModalGuest(null)}
                className="flex-1 py-2 rounded-xl bg-[#18181B] text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
