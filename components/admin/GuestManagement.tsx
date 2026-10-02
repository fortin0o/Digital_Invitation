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
  const [newKuota, setNewKuota] = useState(1); // Default kuota 1 orang untuk angkatan sekolah
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrModalGuest, setQrModalGuest] = useState<GuestItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate unique numeric or alphanumeric 8-digit code
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
      // First remove RSVP if exists
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
    const message = `Katur dhumateng Panjenenganipun ${tamu.nama_tamu},\n\nTanpa ngirangi raos kurmat, keparenga kula ngaturi serat sedhahan pawiwahan: Arya & Sekar.\n\nMenika tautan serat sedhahan panjenengan:\n${url}\n\nMatur nuwun sanget.\n- Arya & Sekar`;
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
    link.setAttribute("download", `Laporan_Tamu_RSVP_Pawiwahan_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Data tamu & RSVP berhasil diekspor ke Excel!");
  };

  // Filter guests
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
    <div className="space-y-6 font-inter">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#3D261C] text-[#FFFDF9] text-xs shadow-lg animate-in fade-in slide-in-from-top-4 flex items-center gap-2 border border-[#C5A059]">
          <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar: Search, Filters, Add Guest */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFDF9] p-4 rounded-2xl border border-[#C5A059]/30 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
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
              placeholder="Cari nama tamu atau kode..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 text-xs text-[#3D261C] outline-none focus:border-[#5C3A21] transition-colors"
            />
          </div>

          {/* Clean Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 text-xs text-[#3D261C] font-medium outline-none focus:border-[#5C3A21] cursor-pointer"
          >
            <option value="all">Semua Tamu ({guests.length})</option>
            <option value="hadir">Konfirmasi Hadir ({guests.filter((g) => g.rsvp?.status === "hadir").length})</option>
            <option value="ragu">Masih Ragu ({guests.filter((g) => g.rsvp?.status === "ragu").length})</option>
            <option value="tidak_hadir">Tidak Hadir ({guests.filter((g) => g.rsvp?.status === "tidak_hadir").length})</option>
            <option value="belum">Belum Konfirmasi ({guests.filter((g) => !g.rsvp?.status).length})</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Excel / CSV Button */}
          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border border-[#C5A059] text-[#3D261C] hover:bg-[#FAF6F0] text-xs font-medium tracking-wide shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            title="Unduh Laporan Format Excel (CSV)"
          >
            <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ekspor Excel</span>
          </button>

          {/* Add Guest Button */}
          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#5C3A21] hover:bg-[#3D261C] border border-[#C5A059] text-[#FFFDF9] text-xs font-medium tracking-wide shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <svg className="w-4 h-4 text-[#EAD7A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Tamu Siswa</span>
          </button>
        </div>
      </div>

      {/* Guest List Table */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#C5A059]/30 shadow-xs overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-base font-semibold text-[#3D261C]">Tidak ada tamu ditemukan</p>
            <p className="text-xs text-[#8A6B53] mt-1">
              Coba sesuaikan kata kunci pencarian atau tambah tamu baru.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] text-[#8A6B53] uppercase tracking-wider text-[10px] border-b border-[#C5A059]/20 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Tamu Siswa</th>
                    <th className="py-3 px-4">Kode Unik</th>
                    <th className="py-3 px-4 text-center">Kuota</th>
                    <th className="py-3 px-4">Status RSVP</th>
                    <th className="py-3 px-4 text-center">Jumlah Hadir</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/15 text-[#3D261C]">
                  {filteredGuests.map((tamu) => {
                    const status = tamu.rsvp?.status;
                    return (
                      <tr key={tamu.id_tamu} className="hover:bg-[#FAF6F0]/60 transition-colors">
                        <td className="py-3 px-4 font-medium text-sm">
                          {tamu.nama_tamu}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#8A6B53]">
                          {tamu.kode}
                        </td>
                        <td className="py-3 px-4 text-center text-xs">
                          {tamu.kuota} orang
                        </td>
                        <td className="py-3 px-4">
                          {status === "hadir" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#5C3A21]/15 text-[#5C3A21] border border-[#5C3A21]/30">
                              Rawuh (Hadir)
                            </span>
                          )}
                          {status === "ragu" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                              Taksih Rangu
                            </span>
                          )}
                          {status === "tidak_hadir" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800">
                              Berhalangan
                            </span>
                          )}
                          {!status && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF6F0] text-[#8A6B53] border border-[#C5A059]/30">
                              Dereng Konfirmasi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {status === "hadir" ? `${tamu.rsvp?.jumlah_hadir || 1} orang` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setQrModalGuest(tamu)}
                              type="button"
                              className="p-1 rounded-full border border-[#C5A059]/40 text-[#5C3A21] hover:bg-[#5C3A21] hover:text-white transition-all cursor-pointer"
                              title="Lihat QR Code Tiket"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => copyInvitationLink(tamu.kode, tamu.nama_tamu)}
                              type="button"
                              className="px-2.5 py-1 rounded-full border border-[#C5A059]/50 text-[#3D261C] hover:bg-[#5C3A21] hover:text-[#FFFDF9] transition-all text-[11px] cursor-pointer"
                              title="Salin Link Personal"
                            >
                              Salin Link
                            </button>
                            <button
                              onClick={() => openWhatsApp(tamu)}
                              type="button"
                              className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-[11px] cursor-pointer"
                              title="Kirim ke WhatsApp"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(tamu.id_tamu, tamu.nama_tamu)}
                              type="button"
                              className="p-1 rounded-full text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-[#C5A059]/15">
              {filteredGuests.map((tamu) => {
                const status = tamu.rsvp?.status;
                return (
                  <div key={tamu.id_tamu} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#3D261C]">
                          {tamu.nama_tamu}
                        </h4>
                        <p className="font-mono text-xs text-[#8A6B53] mt-0.5">
                          Kode: {tamu.kode} • Kuota: {tamu.kuota} org
                        </p>
                      </div>

                      <div>
                        {status === "hadir" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#5C3A21]/15 text-[#5C3A21] border border-[#5C3A21]/30">
                            Hadir ({tamu.rsvp?.jumlah_hadir || 1})
                          </span>
                        )}
                        {status === "ragu" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                            Ragu
                          </span>
                        )}
                        {status === "tidak_hadir" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800">
                            Absen
                          </span>
                        )}
                        {!status && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF6F0] text-[#8A6B53] border border-[#C5A059]/30">
                            Belum respon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions for Mobile */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setQrModalGuest(tamu)}
                        type="button"
                        className="py-1.5 px-2.5 rounded-full border border-[#C5A059]/40 text-[#5C3A21] text-xs hover:bg-[#FAF6F0] transition-all cursor-pointer"
                        title="QR Tiket"
                      >
                        QR
                      </button>
                      <button
                        onClick={() => copyInvitationLink(tamu.kode, tamu.nama_tamu)}
                        type="button"
                        className="flex-1 py-1.5 px-3 rounded-full border border-[#C5A059]/40 text-[#3D261C] text-xs text-center hover:bg-[#5C3A21] hover:text-[#FFFDF9] transition-all cursor-pointer"
                      >
                        Salin Link
                      </button>
                      <button
                        onClick={() => openWhatsApp(tamu)}
                        type="button"
                        className="flex-1 py-1.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs text-center transition-all cursor-pointer"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(tamu.id_tamu, tamu.nama_tamu)}
                        type="button"
                        className="p-1.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
        <div className="fixed inset-0 z-50 bg-[#3D261C]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/40 p-6 shadow-xl relative">
            <h3 className="text-xl font-bold text-[#3D261C] mb-1">Tambah Tamu Siswa</h3>
            <p className="text-xs text-[#8A6B53] mb-5 font-normal">
              Kode personal unik akan digenerate otomatis untuk link undangan.
            </p>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8A6B53] mb-1 font-semibold">
                  Nama Tamu Siswa
                </label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 focus:border-[#5C3A21] text-xs text-[#3D261C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8A6B53] mb-1 font-semibold">
                  Maksimal Kuota Kehadiran (Orang)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={newKuota}
                  onChange={(e) => setNewKuota(Number(e.target.value))}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6F0] border border-[#C5A059]/30 focus:border-[#5C3A21] text-xs text-[#3D261C] outline-none"
                />
                <p className="text-[11px] text-[#8A6B53] mt-1">
                  Default: 1 orang (sesuai ketentuan 1 siswa 1 kuota).
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#C5A059]/40 text-[#3D261C] text-xs hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-full bg-[#5C3A21] hover:bg-[#3D261C] border border-[#C5A059] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-[#3D261C]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/40 p-6 shadow-xl relative text-center">
            <button
              onClick={() => setQrModalGuest(null)}
              type="button"
              className="absolute top-4 right-4 text-[#8A6B53] hover:text-[#3D261C] p-1 rounded-full cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="text-[10px] font-sans uppercase tracking-widest text-[#8A6B53] font-semibold">
              Tiket Resepsi Digital
            </span>
            <h3 className="font-serif text-lg font-bold text-[#3D261C] mt-1 mb-3">
              {qrModalGuest.nama_tamu}
            </h3>

            <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#C5A059]/30 inline-block shadow-inner mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `PAWIWAHAN-ARYA-SEKAR:${qrModalGuest.kode}:${qrModalGuest.nama_tamu}:${qrModalGuest.rsvp?.jumlah_hadir || qrModalGuest.kuota || 1}`
                )}&color=5C3A21&bgcolor=FAF6F0`}
                alt="QR Code Tamu"
                className="w-40 h-40 mx-auto rounded-lg"
              />
            </div>

            <p className="font-mono text-xs font-bold text-[#5C3A21] tracking-widest">
              KODE: {qrModalGuest.kode}
            </p>
            <p className="text-xs text-[#8A6B53] mt-1">
              Kuota: {qrModalGuest.rsvp?.jumlah_hadir || qrModalGuest.kuota || 1} Orang • Status: {qrModalGuest.rsvp?.status === "hadir" ? "Hadir" : "Belum / Ragu"}
            </p>

            <div className="mt-4 pt-3 border-t border-[#C5A059]/20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyInvitationLink(qrModalGuest.kode, qrModalGuest.nama_tamu)}
                className="flex-1 py-2 rounded-full border border-[#C5A059]/40 text-xs text-[#3D261C] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              >
                Salin Link
              </button>
              <button
                type="button"
                onClick={() => setQrModalGuest(null)}
                className="flex-1 py-2 rounded-full bg-[#5C3A21] text-white text-xs font-medium hover:bg-[#3D261C] transition-colors cursor-pointer"
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
