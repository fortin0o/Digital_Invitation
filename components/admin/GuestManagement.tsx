"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatWriteErrorMessage } from "@/lib/adminAuth";
import {
  WaShareConfig,
  getStoredWaConfig,
  saveStoredWaConfig,
  buildInvitationUrl,
  buildWaMessage,
  DEFAULT_WA_TEMPLATE,
  DEFAULT_PRODUCTION_DOMAIN,
} from "@/lib/invitationShareConfig";

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
  coupleName?: string;
  previewLimit?: number;
  onViewAll?: () => void;
}

export default function GuestManagement({
  guests,
  onRefresh,
  idUndangan,
  slug = "",
  coupleName = "Arya & Sekar",
  previewLimit,
  onViewAll,
}: GuestManagementProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newKuota, setNewKuota] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrModalGuest, setQrModalGuest] = useState<GuestItem | null>(null);
  const [waConfig, setWaConfig] = useState<WaShareConfig>(getStoredWaConfig);
  const [showWaConfigModal, setShowWaConfigModal] = useState(false);
  const [tempWaConfig, setTempWaConfig] = useState<WaShareConfig>(getStoredWaConfig);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenWaConfig = () => {
    setTempWaConfig(waConfig);
    setShowWaConfigModal(true);
  };

  const handleSaveWaConfig = () => {
    saveStoredWaConfig(tempWaConfig);
    setWaConfig(tempWaConfig);
    setShowWaConfigModal(false);
    showToast("Pengaturan pesan WhatsApp & domain berhasil disimpan!");
  };

  const handleResetWaConfig = () => {
    const defaultConfig: WaShareConfig = {
      domainMode: "production",
      customDomain: DEFAULT_PRODUCTION_DOMAIN,
      template: DEFAULT_WA_TEMPLATE,
    };
    setTempWaConfig(defaultConfig);
  };

  // Prevent background scroll when any modal is open on mobile/desktop
  useEffect(() => {
    const isModalOpen = Boolean(showAddModal || qrModalGuest || showWaConfigModal);
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [showAddModal, qrModalGuest, showWaConfigModal]);

  const generateUniqueCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) return;
    if (!idUndangan) {
      alert("Data acara pada tabel undangan belum tersedia di database.");
      return;
    }

    setIsSubmitting(true);
    try {
      const code = generateUniqueCode();
      const { data: insertedRows, error } = await supabase
        .from("tamu")
        .insert({
          id_undangan: idUndangan,
          nama_tamu: newNama.trim(),
          kode: code,
          kuota: Number(newKuota) || 1,
        })
        .select("id_tamu");

      if (error) {
        alert(formatWriteErrorMessage("menambahkan tamu", error));
      } else if (!insertedRows || insertedRows.length === 0) {
        alert("Gagal menambahkan tamu: database tidak mengembalikan baris baru.");
      } else {
        showToast(`Tamu "${newNama.trim()}" berhasil ditambahkan!`);
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

    setDeletingId(idTamu);
    try {
      const { error: rsvpError } = await supabase.from("rsvp").delete().eq("id_tamu", idTamu);
      if (rsvpError) {
        alert(formatWriteErrorMessage("menghapus RSVP tamu", rsvpError));
        return;
      }

      const { data: deletedRows, error } = await supabase
        .from("tamu")
        .delete()
        .eq("id_tamu", idTamu)
        .select("id_tamu");

      if (error) {
        alert(formatWriteErrorMessage("menghapus tamu", error));
      } else if (!deletedRows || deletedRows.length === 0) {
        alert(
          `Gagal menghapus tamu "${nama}": tidak ada baris yang terhapus di database. Data mungkin sudah terhapus atau diblokir oleh kebijakan RLS.`
        );
      } else {
        showToast(`Tamu "${nama}" berhasil dihapus.`);
        onRefresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getInvitationUrl = (kode: string) => {
    return buildInvitationUrl(kode, slug, waConfig);
  };

  const copyInvitationLink = (kode: string, nama: string) => {
    const url = getInvitationUrl(kode);
    navigator.clipboard.writeText(url);
    showToast(`Link untuk ${nama} berhasil disalin!`);
  };

  const openInvitationLink = (kode: string) => {
    const url = getInvitationUrl(kode);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openWhatsApp = (tamu: GuestItem) => {
    const message = buildWaMessage(tamu.nama_tamu, tamu.kode, slug, coupleName, waConfig);
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

  const statusCounts = React.useMemo(() => {
    const counts = { hadir: 0, ragu: 0, tidak_hadir: 0, belum: 0 };
    for (const g of guests) {
      const status = g.rsvp?.status;
      if (status === "hadir") counts.hadir += 1;
      else if (status === "ragu") counts.ragu += 1;
      else if (status === "tidak_hadir") counts.tidak_hadir += 1;
      else counts.belum += 1;
    }
    return counts;
  }, [guests]);

  const filteredGuests = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      const matchSearch =
        !q ||
        g.nama_tamu.toLowerCase().includes(q) ||
        g.kode.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "belum") return !g.rsvp?.status;
      return g.rsvp?.status === statusFilter;
    });
  }, [guests, search, statusFilter]);

  const isFiltering = Boolean(search.trim()) || statusFilter !== "all";
  const isPreviewMode = Boolean(previewLimit && previewLimit > 0 && !isFiltering);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedGuests = React.useMemo(
    () => filteredGuests.slice(startIdx, startIdx + pageSize),
    [filteredGuests, startIdx, pageSize]
  );

  const displayedGuests = React.useMemo(
    () => (isPreviewMode && previewLimit ? filteredGuests.slice(0, previewLimit) : paginatedGuests),
    [isPreviewMode, previewLimit, filteredGuests, paginatedGuests]
  );

  const visiblePages = React.useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
    const windowStart = Math.max(2, safePage - 1);
    const windowEnd = Math.min(totalPages - 1, safePage + 1);
    if (windowStart > 2) pages.push("ellipsis-left");
    for (let p = windowStart; p <= windowEnd; p += 1) pages.push(p);
    if (windowEnd < totalPages - 1) pages.push("ellipsis-right");
    pages.push(totalPages);
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2 rounded-2xl bg-[#18181B] text-white text-xs font-bold shadow-[4px_4px_0px_#FFE600] animate-in fade-in flex items-center gap-2 border-2 border-white">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B]">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama tamu atau kode..."
              className="w-full px-4 py-2 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-xs font-bold text-[#18181B] outline-none focus:bg-white"
            />
          </div>

          {/* Clean Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-xs text-[#18181B] font-bold outline-none cursor-pointer"
          >
            <option value="all">Semua Tamu ({guests.length})</option>
            <option value="hadir">Konfirmasi Hadir ({statusCounts.hadir})</option>
            <option value="ragu">Masih Ragu ({statusCounts.ragu})</option>
            <option value="tidak_hadir">Tidak Hadir ({statusCounts.tidak_hadir})</option>
            <option value="belum">Belum Konfirmasi ({statusCounts.belum})</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Add Guest Button - Prominent full-width on mobile */}
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!idUndangan}
            type="button"
            title={!idUndangan ? "Tambahkan data undangan di database terlebih dahulu" : undefined}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-black shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>+ Tambah Tamu</span>
          </button>

          {/* Quick Tools Row: Format WA, Excel, Cetak/PDF (3-column on mobile, fits perfectly without overflow) */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2">
            {/* Format WA & Domain Button */}
            <button
              onClick={handleOpenWaConfig}
              type="button"
              className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-xl bg-[#2EE59D] hover:bg-[#28D08D] border-2 border-[#18181B] text-[#18181B] text-[11px] sm:text-xs font-black shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
              title="Atur format kata-kata WhatsApp & domain link undangan"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-1.925-.448-1.543-.637-2.531-2.203-2.607-2.305-.077-.102-.622-.828-.622-1.58 0-.751.393-1.121.533-1.27.14-.15.305-.188.406-.188.102 0 .204.002.292.006.094.004.22-.036.344.262.128.307.437 1.066.475 1.144.038.077.064.168.013.269-.051.102-.077.165-.153.254-.077.09-.161.2-.23.269-.077.077-.157.161-.068.314.09.153.399.658.857 1.066.589.524 1.085.687 1.238.763.153.076.242.064.331-.038.09-.102.383-.448.485-.601.102-.153.204-.128.344-.077.14.051.89.419 1.043.495.153.076.255.114.293.178.039.064.039.37-.105.775z"/>
              </svg>
              <span className="truncate">Format WA</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleExportCSV}
              type="button"
              className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-xl bg-[#FFFDF5] hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-[11px] sm:text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
              title="Unduh Laporan Excel (CSV)"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">Excel</span>
            </button>

            {/* Print / PDF Report Button */}
            <button
              onClick={() => window.print()}
              type="button"
              className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-2 rounded-xl bg-[#FFFDF5] hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-[11px] sm:text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
              title="Cetak Laporan Tamu atau Simpan sebagai PDF"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="truncate">Cetak/PDF</span>
            </button>
          </div>
        </div>
      </div>
          >
            <span>+ Tambah Tamu</span>
          </button>
        </div>
      </div>

      {/* Guest List Table */}
      <div className="bg-white rounded-[24px] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8 px-4">
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
                  {displayedGuests.map((tamu) => {
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#2EE59D] text-[#18181B] border border-[#18181B]">
                              Hadir
                            </span>
                          )}
                          {status === "ragu" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFE600] text-[#18181B] border border-[#18181B]">
                              Masih Ragu
                            </span>
                          )}
                          {status === "tidak_hadir" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FF5D8F] text-[#18181B] border border-[#18181B]">
                              Tidak Hadir
                            </span>
                          )}
                          {!status && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F4F5] text-[#71717A] border border-[#18181B]">
                              Belum Konfirmasi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {status === "hadir" ? `${tamu.rsvp?.jumlah_hadir || 1} orang` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setQrModalGuest(tamu)}
                              type="button"
                              className="px-2 py-1 rounded-lg border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#38BDF8] text-[#18181B] text-[11px] font-bold shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer"
                              title="Lihat QR Code Tiket"
                            >
                              QR
                            </button>
                            <button
                              onClick={() => openInvitationLink(tamu.kode)}
                              type="button"
                              className="px-3 py-1 rounded-lg border-2 border-[#18181B] bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#18181B] text-[11px] font-extrabold shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer whitespace-nowrap"
                              title="Buka Undangan Pribadi di Tab Baru"
                            >
                              Buka Link
                            </button>
                            <button
                              onClick={() => copyInvitationLink(tamu.kode, tamu.nama_tamu)}
                              type="button"
                              className="px-3 py-1 rounded-lg border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-[11px] font-bold shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer whitespace-nowrap"
                            >
                              Salin Link
                            </button>
                            <button
                              onClick={() => openWhatsApp(tamu)}
                              type="button"
                              className="px-3 py-1 rounded-lg border-2 border-[#18181B] bg-[#2EE59D] hover:bg-[#28D08D] text-[#18181B] text-[11px] font-extrabold shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(tamu.id_tamu, tamu.nama_tamu)}
                              disabled={deletingId === tamu.id_tamu}
                              type="button"
                              className="p-1 rounded-lg border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 cursor-pointer shadow-[1.5px_1.5px_0px_#18181B] disabled:opacity-50 disabled:cursor-not-allowed"
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
              {displayedGuests.map((tamu) => {
                const status = tamu.rsvp?.status;
                return (
                  <div key={tamu.id_tamu} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-[#18181B] truncate">
                          {tamu.nama_tamu}
                        </h4>
                        <p className="font-mono text-xs text-[#71717A] mt-1 font-bold">
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

                    {/* Touch-optimized action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#18181B]/10">
                      <button
                        onClick={() => openInvitationLink(tamu.kode)}
                        type="button"
                        className="col-span-2 py-2 px-3 rounded-xl border-2 border-[#18181B] bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#18181B] text-xs font-extrabold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center cursor-pointer"
                      >
                        <span>Buka Link Undangan</span>
                      </button>
                      <button
                        onClick={() => copyInvitationLink(tamu.kode, tamu.nama_tamu)}
                        type="button"
                        className="py-2 px-2 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-[11px] font-bold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center cursor-pointer"
                      >
                        <span>Salin Link</span>
                      </button>
                      <button
                        onClick={() => openWhatsApp(tamu)}
                        type="button"
                        className="py-2 px-2 rounded-xl border-2 border-[#18181B] bg-[#2EE59D] hover:bg-[#28D08D] text-[#18181B] text-[11px] font-extrabold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center cursor-pointer"
                      >
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => setQrModalGuest(tamu)}
                        type="button"
                        className="py-2 px-2 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#38BDF8] text-[#18181B] text-[11px] font-bold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center cursor-pointer"
                      >
                        <span>Tiket QR</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(tamu.id_tamu, tamu.nama_tamu)}
                        disabled={deletingId === tamu.id_tamu}
                        type="button"
                        className="py-2 px-2 rounded-xl border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-bold shadow-[2px_2px_0px_#18181B] text-center flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{deletingId === tamu.id_tamu ? "Menghapus..." : "Hapus"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {isPreviewMode && filteredGuests.length > displayedGuests.length && (
              <div className="border-t-2 border-[#18181B] bg-[#FFFDF5] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-[#18181B] text-center sm:text-left">
                  Menampilkan {displayedGuests.length} dari {filteredGuests.length} tamu. Gunakan pencarian atau filter untuk mencari semua tamu.
                </p>
                {onViewAll && (
                  <button
                    type="button"
                    onClick={onViewAll}
                    className="h-8 px-4 rounded-xl border-2 border-[#18181B] bg-[#FFE600] hover:bg-[#FFD700] text-[#18181B] text-xs font-extrabold shadow-[2px_2px_0px_#18181B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                  >
                    Lihat Semua Tamu ({filteredGuests.length}) &rarr;
                  </button>
                )}
              </div>
            )}

            {!isPreviewMode && (guests.length > 10 || totalPages > 1) && (
              <div className="border-t-2 border-[#18181B] bg-[#FFFDF5] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#18181B]">
                  <span>
                    Menampilkan {startIdx + 1}&ndash;{Math.min(startIdx + pageSize, filteredGuests.length)} dari {filteredGuests.length} tamu
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    aria-label="Jumlah baris per halaman"
                    className="h-8 px-2 rounded-lg bg-white border-2 border-[#18181B] text-xs font-extrabold text-[#18181B] outline-none cursor-pointer"
                  >
                    <option value={20}>20 / hal</option>
                    <option value={50}>50 / hal</option>
                    <option value={100}>100 / hal</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                    className={`h-8 px-4 rounded-xl border-2 border-[#18181B] text-xs font-extrabold transition-all ${
                      safePage <= 1
                        ? "bg-white/60 text-[#18181B]/40 cursor-not-allowed"
                        : "bg-white text-[#18181B] hover:bg-[#FFE600] shadow-[2px_2px_0px_#18181B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    }`}
                  >
                    Sebelumnya
                  </button>

                  {visiblePages.map((item) =>
                    typeof item === "string" ? (
                      <span key={item} className="px-1 text-xs font-extrabold text-[#18181B]/60">
                        &hellip;
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`min-w-8 h-8 px-2 rounded-xl border-2 border-[#18181B] text-xs font-extrabold transition-all cursor-pointer ${
                          item === safePage
                            ? "bg-[#FFE600] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                            : "bg-white text-[#18181B] hover:bg-[#FFFDF5]"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                    className={`h-8 px-4 rounded-xl border-2 border-[#18181B] text-xs font-extrabold transition-all ${
                      safePage >= totalPages
                        ? "bg-white/60 text-[#18181B]/40 cursor-not-allowed"
                        : "bg-white text-[#18181B] hover:bg-[#FFE600] shadow-[2px_2px_0px_#18181B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    }`}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[28px] bg-white border-[3px] border-[#18181B] p-6 shadow-[8px_8px_0px_#FFE600] relative max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <h3 className="font-display text-xl font-extrabold text-[#18181B] mb-1">
              Tambah Tamu Undangan
            </h3>
            <p className="text-xs text-[#71717A] mb-6 font-semibold">
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
                  className="w-full py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
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
                  className="w-full py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] text-[#18181B] text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-black shadow-[2px_2px_0px_#18181B] cursor-pointer disabled:opacity-50"
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
        <div
          onClick={() => setQrModalGuest(null)}
          className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-[28px] bg-white border-[3px] border-[#18181B] p-6 shadow-[8px_8px_0px_#38BDF8] relative text-center max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <button
              onClick={() => setQrModalGuest(null)}
              type="button"
              className="absolute top-4 right-4 text-[#18181B] hover:scale-110 p-1 font-black cursor-pointer"
            >
              ✕
            </button>

            <span className="text-[10px] uppercase tracking-wider text-[#18181B] font-extrabold bg-[#FFE600] px-2 py-0.5 rounded-full border border-[#18181B]">
              TIKET MASUK DIGITAL
            </span>
            <h3 className="font-display text-lg font-extrabold text-[#18181B] mt-2 mb-4">
              {qrModalGuest.nama_tamu}
            </h3>

            <div className="bg-[#FFFDF5] p-4 rounded-2xl border-2 border-[#18181B] inline-block shadow-[3px_3px_0px_#18181B] mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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

            <div className="mt-4 pt-4 border-t-2 border-[#18181B] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openInvitationLink(qrModalGuest.kode)}
                className="py-2 rounded-xl border-2 border-[#18181B] bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#18181B] text-xs font-extrabold cursor-pointer"
              >
                Buka Link
              </button>
              <button
                type="button"
                onClick={() => copyInvitationLink(qrModalGuest.kode, qrModalGuest.nama_tamu)}
                className="py-2 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-xs font-bold cursor-pointer"
              >
                Salin Link
              </button>
              <button
                type="button"
                onClick={() => setQrModalGuest(null)}
                className="col-span-2 py-2 rounded-xl bg-[#18181B] text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message & Domain Configuration Modal */}
      {showWaConfigModal && (
        <div
          onClick={() => setShowWaConfigModal(false)}
          className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-white border-[3px] border-[#18181B] p-6 shadow-[8px_8px_0px_#2EE59D] relative max-h-[85vh] overflow-y-auto overscroll-contain space-y-4"
          >
            <button
              onClick={() => setShowWaConfigModal(false)}
              type="button"
              className="absolute top-4 right-4 text-[#18181B] hover:scale-110 p-1 font-black cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#18181B] font-extrabold bg-[#2EE59D] px-2.5 py-0.5 rounded-full border border-[#18181B]">
                PENGATURAN SHARE
              </span>
              <h3 className="font-display text-lg font-extrabold text-[#18181B] mt-1">
                Format Pesan WhatsApp &amp; Domain Link
              </h3>
              <p className="text-xs text-[#71717A] font-medium mt-0.5">
                Sesuaikan kata-kata undangan WhatsApp dan pastikan link mengarah ke domain publik agar bisa dibuka di HP penerima.
              </p>
            </div>

            {/* Section 1: Domain Selection */}
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[#18181B] font-black">
                1. Domain Tautan Undangan
              </label>

              <div className="space-y-1.5 text-xs font-bold text-[#18181B]">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#18181B]/20">
                  <input
                    type="radio"
                    name="domainMode"
                    value="production"
                    checked={tempWaConfig.domainMode === "production"}
                    onChange={() =>
                      setTempWaConfig((prev) => ({ ...prev, domainMode: "production" }))
                    }
                    className="accent-[#18181B]"
                  />
                  <div>
                    <span className="font-black text-[#18181B]">{DEFAULT_PRODUCTION_DOMAIN}</span>
                    <span className="ml-2 text-[10px] bg-[#FFE600] text-[#18181B] px-1.5 py-0.5 rounded font-black border border-[#18181B]">
                      Rekomendasi (Online HP)
                    </span>
                    <p className="text-[10px] text-[#71717A] font-medium mt-0.5">
                      Bisa dibuka oleh penguji &amp; tamu langsung di smartphone mereka.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#18181B]/20">
                  <input
                    type="radio"
                    name="domainMode"
                    value="auto"
                    checked={tempWaConfig.domainMode === "auto"}
                    onChange={() =>
                      setTempWaConfig((prev) => ({ ...prev, domainMode: "auto" }))
                    }
                    className="accent-[#18181B]"
                  />
                  <div>
                    <span>Otomatis (Sesuai Browser Saat Ini)</span>
                    <p className="text-[10px] text-[#71717A] font-medium mt-0.5">
                      Mengikuti domain yang sedang dibuka (misal: localhost jika sedang dibuka di laptop).
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#18181B]/20">
                  <input
                    type="radio"
                    name="domainMode"
                    value="custom"
                    checked={tempWaConfig.domainMode === "custom"}
                    onChange={() =>
                      setTempWaConfig((prev) => ({ ...prev, domainMode: "custom" }))
                    }
                    className="accent-[#18181B] mt-0.5"
                  />
                  <div className="flex-1">
                    <span>Domain Kustom Sendiri</span>
                    {tempWaConfig.domainMode === "custom" && (
                      <input
                        type="url"
                        value={tempWaConfig.customDomain}
                        onChange={(e) =>
                          setTempWaConfig((prev) => ({
                            ...prev,
                            customDomain: e.target.value,
                          }))
                        }
                        placeholder="https://weddingmu.web.id"
                        className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-white border-2 border-[#18181B] text-xs font-mono font-bold text-[#18181B] outline-none"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Message Template */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-[#18181B] font-black">
                  2. Template Teks Undangan WhatsApp
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setTempWaConfig((prev) => ({
                        ...prev,
                        template: prev.template + " {nama}",
                      }))
                    }
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F4F4F5] hover:bg-[#FFE600] border border-[#18181B] cursor-pointer"
                  >
                    +{"{nama}"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTempWaConfig((prev) => ({
                        ...prev,
                        template: prev.template + " {link}",
                      }))
                    }
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F4F4F5] hover:bg-[#FFE600] border border-[#18181B] cursor-pointer"
                  >
                    +{"{link}"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTempWaConfig((prev) => ({
                        ...prev,
                        template: prev.template + " {mempelai}",
                      }))
                    }
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F4F4F5] hover:bg-[#FFE600] border border-[#18181B] cursor-pointer"
                  >
                    +{"{mempelai}"}
                  </button>
                </div>
              </div>

              <textarea
                rows={6}
                value={tempWaConfig.template}
                onChange={(e) =>
                  setTempWaConfig((prev) => ({ ...prev, template: e.target.value }))
                }
                className="w-full p-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-sans font-medium text-[#18181B] outline-none resize-none leading-relaxed"
              />
              <p className="text-[10px] text-[#71717A] font-medium">
                Gunakan tag <code>&#123;nama&#125;</code>, <code>&#123;link&#125;</code>, dan <code>&#123;mempelai&#125;</code> agar pesan otomatis menyesuaikan nama tamu dan link uniknya.
              </p>
            </div>

            {/* Section 3: Live Preview Bubble */}
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-[#71717A] font-bold">
                Pratinjau Pesan yang Diterima Tamu:
              </label>
              <div className="p-3.5 rounded-2xl bg-[#DCF8C6] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-xs font-sans text-[#18181B] whitespace-pre-wrap leading-relaxed">
                {buildWaMessage(
                  "Bapak Ahmad Subagyo",
                  "88231920",
                  slug,
                  coupleName,
                  tempWaConfig
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t-2 border-[#18181B]/15">
              <button
                type="button"
                onClick={handleResetWaConfig}
                className="w-full sm:w-auto text-xs font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer py-1"
              >
                Reset ke Format Standar
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowWaConfigModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border-2 border-[#18181B] bg-white text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveWaConfig}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#2EE59D] hover:bg-[#28D08D] border-2 border-[#18181B] text-xs font-black shadow-[2px_2px_0px_#18181B] cursor-pointer"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
