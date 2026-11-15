"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  AdminRole,
  formatWriteErrorMessage,
  isMissingTableError,
} from "@/lib/adminAuth";
import NeoDivider from "../NeoDivider";

export interface AdminUserItem {
  id: string;
  email: string;
  nama: string;
  role: AdminRole;
  created_at?: string;
  is_local?: boolean;
}

type AdminDbStatus = "connected" | "missing_table" | "error";

const DEFAULT_ADMINS: AdminUserItem[] = [
  {
    id: "dev-master-1",
    email: "developer@admin.id",
    nama: "Developer Tim (Super Admin)",
    role: "super_admin",
    created_at: new Date().toISOString(),
    is_local: true,
  },
  {
    id: "admin-acara-1",
    email: "mempelai@admin.id",
    nama: "Panitia Arya & Sekar",
    role: "admin",
    created_at: new Date().toISOString(),
    is_local: true,
  },
];

function getLocalFallbackAdmins(): AdminUserItem[] {
  if (typeof window === "undefined") return DEFAULT_ADMINS;
  const saved = localStorage.getItem("app_admin_list");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as AdminUserItem[];
      }
    } catch {
      // ignore invalid JSON and reset below
    }
  }
  localStorage.setItem("app_admin_list", JSON.stringify(DEFAULT_ADMINS));
  return DEFAULT_ADMINS;
}

async function queryAdminUsers(): Promise<{
  admins: AdminUserItem[];
  dbStatus: AdminDbStatus;
  dbMessage: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      return {
        admins: (data as AdminUserItem[]) || [],
        dbStatus: "connected",
        dbMessage: null,
      };
    }

    if (isMissingTableError(error)) {
      return {
        admins: getLocalFallbackAdmins(),
        dbStatus: "missing_table",
        dbMessage:
          "Tabel public.admin_users belum ada di Supabase (PGRST205). Jalankan skrip supabase_admin_roles.sql di SQL Editor Supabase agar daftar admin tersinkron ke database.",
      };
    }

    return {
      admins: getLocalFallbackAdmins(),
      dbStatus: "error",
      dbMessage: error.message || "Gagal membaca tabel admin_users.",
    };
  } catch (err) {
    return {
      admins: getLocalFallbackAdmins(),
      dbStatus: "error",
      dbMessage: err instanceof Error ? err.message : "Gagal menghubungi server.",
    };
  }
}

interface AdminManagementProps {
  currentUserEmail: string;
  currentUserRole: AdminRole;
}

export default function AdminManagement({
  currentUserEmail,
  currentUserRole,
}: AdminManagementProps) {
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<AdminDbStatus>("connected");
  const [dbMessage, setDbMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshAdmins = useCallback(async () => {
    setLoading(true);
    const result = await queryAdminUsers();
    setAdmins(result.admins);
    setDbStatus(result.dbStatus);
    setDbMessage(result.dbMessage);
    setLoading(false);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!showAddModal) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [showAddModal]);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await queryAdminUsers();
      if (!active) return;
      setAdmins(result.admins);
      setDbStatus(result.dbStatus);
      setDbMessage(result.dbMessage);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newEmail.trim()) return;

    setIsSubmitting(true);
    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanNama = newNama.trim();

    try {
      const { error } = await supabase
        .from("admin_users")
        .insert({
          email: cleanEmail,
          nama: cleanNama,
          role: newRole,
        })
        .select("id");

      if (!error) {
        await refreshAdmins();
        showToast("Admin baru tersimpan! Klik 'Salin Info' untuk kirim panduan aktivasi password.");
        setNewNama("");
        setNewEmail("");
        setNewRole("admin");
        setShowAddModal(false);
        return;
      }

      if (isMissingTableError(error)) {
        const newAdminObj: AdminUserItem = {
          id: "adm-" + Date.now(),
          email: cleanEmail,
          nama: cleanNama,
          role: newRole,
          created_at: new Date().toISOString(),
          is_local: true,
        };
        const updatedList = [newAdminObj, ...admins];
        setAdmins(updatedList);
        localStorage.setItem("app_admin_list", JSON.stringify(updatedList));
        setDbStatus("missing_table");
        showToast("Tabel admin_users belum ada — tersimpan di pratinjau lokal browser.");
        setNewNama("");
        setNewEmail("");
        setNewRole("admin");
        setShowAddModal(false);
        return;
      }

      alert(formatWriteErrorMessage("menambah admin", error));
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Gagal menyimpan admin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminUserItem) => {
    if (admin.email.toLowerCase() === currentUserEmail.toLowerCase()) {
      alert("Anda tidak dapat menghapus akun Anda sendiri!");
      return;
    }

    if (admin.role === "super_admin" && admins.filter((a) => a.role === "super_admin").length <= 1) {
      alert("Sistem harus menyisakan setidaknya 1 Super Admin!");
      return;
    }

    if (!confirm(`Hapus hak akses admin untuk "${admin.nama}" (${admin.email})?`)) {
      return;
    }

    if (dbStatus !== "connected" || admin.is_local) {
      const updatedList = admins.filter((a) => a.id !== admin.id && a.email !== admin.email);
      setAdmins(updatedList);
      localStorage.setItem("app_admin_list", JSON.stringify(updatedList));
      showToast("Admin dihapus dari daftar lokal.");
      return;
    }

    setDeletingId(admin.id);
    try {
      const { data: deletedRows, error } = await supabase
        .from("admin_users")
        .delete()
        .eq("email", admin.email)
        .select("id, email");

      if (error) {
        alert(formatWriteErrorMessage("menghapus admin", error));
      } else if (!deletedRows || deletedRows.length === 0) {
        alert(
          `Gagal menghapus admin "${admin.email}": tidak ada baris yang terhapus di database. Data mungkin sudah terhapus atau diblokir oleh kebijakan RLS.`
        );
      } else {
        await refreshAdmins();
        showToast("Admin berhasil dihapus dari database.");
      }
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Gagal menghapus admin."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyCredentials = (admin: AdminUserItem) => {
    const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/admin` : "/admin";
    const creds = `AKSES ADMIN UNDANGAN DIGITAL\nNama: ${admin.nama}\nEmail: ${admin.email}\nPeran: ${
      admin.role === "super_admin" ? "Super Admin" : "Admin Acara"
    }\nLink Login: ${loginUrl}\n\nCara Aktivasi Pertama Kali:\n1. Buka link login di atas.\n2. Klik "Buat password & aktivasi di sini" di bawah tombol Masuk.\n3. Masukkan email di atas lalu buat password pribadi Anda sendiri (min. 6 karakter).`;
    navigator.clipboard.writeText(creds);
    setCopiedId(admin.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2 rounded-2xl shadow-[4px_4px_0px_#FFE600] text-xs font-bold border-2 border-white animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Database Provisioning Status Banner */}
      {dbStatus !== "connected" && dbMessage && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-100 border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-display text-sm font-extrabold text-[#18181B]">
              Mode Fallback Lokal (admin_users belum aktif di Supabase)
            </p>
            <p className="text-xs text-[#52525B] font-bold leading-relaxed">
              {dbMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshAdmins()}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FFE600] border-2 border-[#18181B] text-xs font-extrabold text-[#18181B] shadow-[2px_2px_0px_#18181B] cursor-pointer whitespace-nowrap"
          >
            Cek Ulang DB
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-[11px] font-extrabold mb-2 shadow-[2px_2px_0px_#18181B]">
              <span className="w-2 h-2 rounded-full bg-[#18181B]" />
              Role Anda: {currentUserRole === "super_admin" ? "Super Admin" : "Admin Acara"}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#18181B]">
              Manajemen Administrator &amp; Peran
            </h2>
            <p className="text-xs text-[#52525B] mt-1 max-w-xl leading-relaxed font-medium">
              Sebagai <strong className="text-[#18181B]">Super Admin</strong>, Anda memiliki wewenang penuh untuk menambah panitia atau penyelenggara sebagai Admin Acara, maupun mendelegasikan rekan tim sebagai Super Admin.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] text-[#18181B] text-xs font-black tracking-wide border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[4px_4px_0px_#18181B] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>+</span>
            <span>Tambah Admin Baru</span>
          </button>
        </div>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFE600]/25 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-xl bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_#18181B]">
              SA
            </span>
            <div>
              <h4 className="text-xs font-black text-[#18181B]">Super Admin (Developer / Master)</h4>
              <p className="text-[10px] text-[#71717A] font-bold">Akses Tingkat Tertinggi</p>
            </div>
          </div>
          <ul className="text-xs text-[#18181B] space-y-1 list-disc list-inside font-medium">
            <li>Menambah dan mengelola semua akun admin</li>
            <li>Akses penuh ke semua daftar tamu, RSVP, dan buku ucapan</li>
            <li>Mengatur konfigurasi teknis &amp; database</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-[#38BDF8]/20 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-xl bg-[#38BDF8] border-2 border-[#18181B] text-[#18181B] flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_#18181B]">
              AA
            </span>
            <div>
              <h4 className="text-xs font-black text-[#18181B]">Admin Acara (Panitia)</h4>
              <p className="text-[10px] text-[#71717A] font-bold">Akses Operasional</p>
            </div>
          </div>
          <ul className="text-xs text-[#18181B] space-y-1 list-disc list-inside font-medium">
            <li>Menambah dan membagikan undangan ke tamu</li>
            <li>Melihat rekap kehadiran dan status RSVP</li>
            <li>Memoderasi ucapan doa restu tamu</li>
          </ul>
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] overflow-hidden">
        <div className="p-4 sm:p-6 border-b-2 border-[#18181B] flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-[#18181B]">
              Daftar Administrator ({admins.length})
            </h3>
            <p className="text-[11px] text-[#71717A] font-bold">
              Pengguna yang memiliki hak masuk ke dashboard panel admin
            </p>
          </div>
          <button
            onClick={() => void refreshAdmins()}
            type="button"
            className="px-4 py-2 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-xs font-bold cursor-pointer"
            title="Muat Ulang"
          >
            Muat Ulang
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#71717A]">
            <div className="inline-block w-6 h-6 border-3 border-[#18181B] border-t-[#FFE600] rounded-full animate-spin mb-2" />
            <p className="font-bold">Memuat daftar admin...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <p className="font-display text-base font-extrabold text-[#18181B]">
              Belum ada administrator terdaftar
            </p>
            <p className="text-xs text-[#71717A] mt-1 font-medium">
              Tambahkan admin baru agar panitia dapat mengakses panel ini.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead className="bg-[#FFFDF5] text-[#18181B] uppercase text-[10px] tracking-wider font-extrabold border-b-2 border-[#18181B]">
                  <tr>
                    <th className="px-4 py-3">Nama &amp; Identitas</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Peran (Role)</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181B]/15">
                  {admins.map((adm) => {
                    const isCurrent = adm.email.toLowerCase() === currentUserEmail.toLowerCase();
                    const isSuper = adm.role === "super_admin";

                    return (
                      <tr key={adm.id} className="hover:bg-[#FFFDF5] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black border-2 border-[#18181B] ${
                                isSuper ? "bg-[#FFE600]" : "bg-[#38BDF8]"
                              }`}
                            >
                              {isSuper ? "SA" : "AA"}
                            </span>
                            <div>
                              <div className="font-extrabold text-[#18181B] flex items-center gap-2">
                                <span>{adm.nama}</span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded bg-[#18181B] text-white text-[9px] font-bold">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#71717A] font-medium">
                                {adm.created_at ? new Date(adm.created_at).toLocaleDateString("id-ID") : "Aktif"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#18181B]">
                          {adm.email}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold border-2 border-[#18181B] ${
                              isSuper ? "bg-[#FFE600] text-[#18181B]" : "bg-[#38BDF8] text-[#18181B]"
                            }`}
                          >
                            {isSuper ? "Super Admin" : "Admin Acara"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleCopyCredentials(adm)}
                            type="button"
                            className="px-3 py-1 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-[11px] font-bold transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_#18181B]"
                          >
                            {copiedId === adm.id ? "Tersalin" : "Salin Info"}
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteAdmin(adm)}
                              disabled={deletingId === adm.id}
                              type="button"
                              className="px-3 py-1 rounded-xl border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-bold transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_#18181B] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === adm.id ? "Menghapus..." : "Hapus"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-[#18181B]/15">
              {admins.map((adm) => {
                const isCurrent = adm.email.toLowerCase() === currentUserEmail.toLowerCase();
                const isSuper = adm.role === "super_admin";

                return (
                  <div key={adm.id} className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-black border-2 border-[#18181B] ${
                            isSuper ? "bg-[#FFE600]" : "bg-[#38BDF8]"
                          }`}
                        >
                          {isSuper ? "SA" : "AA"}
                        </span>
                        <div className="truncate">
                          <div className="font-extrabold text-sm text-[#18181B] flex items-center gap-2 truncate">
                            <span className="truncate">{adm.nama}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded bg-[#18181B] text-white text-[9px] font-bold shrink-0">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-[#52525B] font-bold truncate mt-1">
                            {adm.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-[#18181B] ${
                          isSuper ? "bg-[#FFE600] text-[#18181B]" : "bg-[#38BDF8] text-[#18181B]"
                        }`}
                      >
                        {isSuper ? "Super Admin" : "Admin Acara"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#18181B]/10">
                      <button
                        onClick={() => handleCopyCredentials(adm)}
                        type="button"
                        className="flex-1 py-2 px-4 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] text-center cursor-pointer"
                      >
                        {copiedId === adm.id ? "Info Tersalin" : "Salin Info"}
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => handleDeleteAdmin(adm)}
                          disabled={deletingId === adm.id}
                          type="button"
                          className="py-2 px-4 rounded-xl border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold shadow-[2px_2px_0px_#18181B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === adm.id ? "Menghapus..." : "Hapus"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border-[3px] border-[#18181B] shadow-[8px_8px_0px_#FFE600] p-6 relative max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <div className="text-center mb-6">
              <h3 className="font-display text-xl font-extrabold text-[#18181B]">
                Tambah Administrator Baru
              </h3>
              <NeoDivider className="!my-2" />
              <p className="text-xs text-[#52525B] font-bold">
                Daftarkan panitia untuk mengelola undangan.
              </p>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                  Nama Lengkap / Instansi
                </label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin.panitia@email.com"
                  className="w-full py-2 px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
                />
                <p className="text-[10px] text-[#71717A] font-medium mt-1">
                  Gunakan email yang valid. Setelah disimpan, admin baru membuat password sendiri lewat link aktivasi di halaman login.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                  Tingkat Hak Akses (Role)
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <label
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-1 transition-all ${
                      newRole === "admin"
                        ? "bg-[#38BDF8]/20 border-[#18181B] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                        : "border-[#18181B]/40 text-[#71717A] hover:bg-[#FFFDF5]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-extrabold text-xs">
                      <input
                        type="radio"
                        name="roleSelect"
                        value="admin"
                        checked={newRole === "admin"}
                        onChange={() => setNewRole("admin")}
                      />
                      <span>Admin Acara</span>
                    </div>
                    <span className="text-[10px] text-[#52525B]">
                      Hanya kelola tamu, RSVP, dan buku ucapan.
                    </span>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col gap-1 transition-all ${
                      newRole === "super_admin"
                        ? "bg-[#FFE600]/30 border-[#18181B] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                        : "border-[#18181B]/40 text-[#71717A] hover:bg-[#FFFDF5]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-extrabold text-xs">
                      <input
                        type="radio"
                        name="roleSelect"
                        value="super_admin"
                        checked={newRole === "super_admin"}
                        onChange={() => setNewRole("super_admin")}
                      />
                      <span>Super Admin</span>
                    </div>
                    <span className="text-[10px] text-[#52525B]">
                      Developer. Kendali penuh &amp; kelola admin.
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] hover:bg-[#FFFDF5] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-xs font-black text-[#18181B] shadow-[2px_2px_0px_#18181B] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
