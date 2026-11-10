"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import NeoDivider from "../NeoDivider";

export interface AdminUserItem {
  id: string;
  email: string;
  nama: string;
  role: "super_admin" | "admin";
  created_at?: string;
  is_local?: boolean;
}

const DEFAULT_ADMINS: AdminUserItem[] = [
  {
    id: "dev-master-1",
    email: "developer@smk-ukk.sch.id",
    nama: "Developer Tim (Super Admin)",
    role: "super_admin",
    created_at: new Date().toISOString(),
    is_local: true,
  },
  {
    id: "admin-acara-1",
    email: "mempelai@wedding.id",
    nama: "Panitia Arya & Sekar",
    role: "admin",
    created_at: new Date().toISOString(),
    is_local: true,
  },
];

interface AdminManagementProps {
  currentUserEmail: string;
  currentUserRole: "super_admin" | "admin";
}

export default function AdminManagement({
  currentUserEmail,
  currentUserRole,
}: AdminManagementProps) {
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"super_admin" | "admin">("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setAdmins(data as AdminUserItem[]);
      } else {
        const saved = localStorage.getItem("app_admin_list");
        if (saved) {
          try {
            setAdmins(JSON.parse(saved));
          } catch {
            setAdmins(DEFAULT_ADMINS);
          }
        } else {
          setAdmins(DEFAULT_ADMINS);
          localStorage.setItem("app_admin_list", JSON.stringify(DEFAULT_ADMINS));
        }
      }
    } catch {
      const saved = localStorage.getItem("app_admin_list");
      if (saved) {
        try {
          setAdmins(JSON.parse(saved));
        } catch {
          setAdmins(DEFAULT_ADMINS);
        }
      } else {
        setAdmins(DEFAULT_ADMINS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newEmail.trim()) return;

    setIsSubmitting(true);
    const newAdminObj: AdminUserItem = {
      id: "adm-" + Date.now(),
      email: newEmail.trim().toLowerCase(),
      nama: newNama.trim(),
      role: newRole,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("admin_users").insert({
        email: newAdminObj.email,
        nama: newAdminObj.nama,
        role: newAdminObj.role,
      });

      if (error) {
        const updatedList = [newAdminObj, ...admins];
        setAdmins(updatedList);
        localStorage.setItem("app_admin_list", JSON.stringify(updatedList));
        showToast("Admin baru berhasil ditambahkan (Tersimpan Lokal)");
      } else {
        await fetchAdmins();
        showToast("Admin baru berhasil ditambahkan!");
      }

      setNewNama("");
      setNewEmail("");
      setNewRole("admin");
      setShowAddModal(false);
    } catch {
      const updatedList = [newAdminObj, ...admins];
      setAdmins(updatedList);
      localStorage.setItem("app_admin_list", JSON.stringify(updatedList));
      showToast("Admin baru berhasil ditambahkan!");
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminUserItem) => {
    if (admin.email === currentUserEmail) {
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

    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("email", admin.email);

      if (error) {
        const updatedList = admins.filter((a) => a.id !== admin.id && a.email !== admin.email);
        setAdmins(updatedList);
        localStorage.setItem("app_admin_list", JSON.stringify(updatedList));
      } else {
        await fetchAdmins();
      }
      showToast("Admin berhasil dihapus.");
    } catch {
      const updatedList = admins.filter((a) => a.id !== admin.id);
      setAdmins(updatedList);
      localStorage.setItem("app_admin_list", JSON.stringify(updatedList));
      showToast("Admin berhasil dihapus.");
    }
  };

  const handleCopyCredentials = (admin: AdminUserItem) => {
    const creds = `AKSES ADMIN UNDANGAN DIGITAL\nNama: ${admin.nama}\nEmail: ${admin.email}\nPeran: ${
      admin.role === "super_admin" ? "Super Admin (Developer)" : "Admin Acara"
    }\nSandi Akses Cepat: ${admin.role === "super_admin" ? "dev2026" : "admin123"}`;
    navigator.clipboard.writeText(creds);
    setCopiedId(admin.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl shadow-[4px_4px_0px_#FFE600] text-xs font-bold border-2 border-white animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-[28px] bg-white border-2 border-[#18181B] shadow-[5px_5px_0px_#18181B] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-[11px] font-extrabold mb-2 shadow-[2px_2px_0px_#18181B]">
              <span className="w-2 h-2 rounded-full bg-[#18181B]" />
              Role Anda: {currentUserRole === "super_admin" ? "👑 Super Admin" : "👤 Admin Acara"}
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
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] text-[#18181B] text-xs font-black tracking-wide border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>+</span>
            <span>Tambah Admin Baru</span>
          </button>
        </div>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-[20px] bg-[#FFE600]/25 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] flex items-center justify-center text-sm font-bold shadow-[2px_2px_0px_#18181B]">
              👑
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

        <div className="p-4 rounded-[20px] bg-[#38BDF8]/20 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-[#38BDF8] border-2 border-[#18181B] text-[#18181B] flex items-center justify-center text-sm font-bold shadow-[2px_2px_0px_#18181B]">
              👤
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
      <div className="bg-white rounded-[24px] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] overflow-hidden">
        <div className="p-4 sm:p-5 border-b-2 border-[#18181B] flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-[#18181B]">
              Daftar Administrator ({admins.length})
            </h3>
            <p className="text-[11px] text-[#71717A] font-bold">
              Pengguna yang memiliki hak masuk ke dashboard panel admin
            </p>
          </div>
          <button
            onClick={fetchAdmins}
            type="button"
            className="p-2 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-xs font-bold cursor-pointer"
            title="Muat Ulang"
          >
            🔄
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#71717A]">
            <div className="inline-block w-6 h-6 border-3 border-[#18181B] border-t-[#FFE600] rounded-full animate-spin mb-2" />
            <p className="font-bold">Memuat daftar admin...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF5] text-[#18181B] uppercase text-[10px] tracking-wider font-extrabold border-b-2 border-[#18181B]">
                <tr>
                  <th className="px-4 py-3.5">Nama &amp; Identitas</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Peran (Role)</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B]/15">
                {admins.map((adm) => {
                  const isCurrent = adm.email === currentUserEmail;
                  const isSuper = adm.role === "super_admin";

                  return (
                    <tr key={adm.id} className="hover:bg-[#FFFDF5] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border-2 border-[#18181B] ${
                              isSuper ? "bg-[#FFE600]" : "bg-[#38BDF8]"
                            }`}
                          >
                            {isSuper ? "👑" : "👤"}
                          </span>
                          <div>
                            <div className="font-extrabold text-[#18181B] flex items-center gap-1.5">
                              <span>{adm.nama}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded bg-[#18181B] text-white text-[9px] font-bold">
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

                      <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-[#18181B]">
                        {adm.email}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border-2 border-[#18181B] ${
                            isSuper ? "bg-[#FFE600] text-[#18181B]" : "bg-[#38BDF8] text-[#18181B]"
                          }`}
                        >
                          {isSuper ? "👑 Super Admin" : "👤 Admin Acara"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleCopyCredentials(adm)}
                          type="button"
                          className="px-2.5 py-1 rounded-xl border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-[11px] font-bold transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_#18181B]"
                        >
                          {copiedId === adm.id ? "Tersalin! ✓" : "Salin Info"}
                        </button>

                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteAdmin(adm)}
                            type="button"
                            className="px-2.5 py-1 rounded-xl border-2 border-[#18181B] bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-bold transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_#18181B]"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[32px] border-[3px] border-[#18181B] shadow-[8px_8px_0px_#FFE600] p-6 relative">
            <div className="text-center mb-5">
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
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
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
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-bold">
                  Tingkat Hak Akses (Role)
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <label
                    className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col gap-1 transition-all ${
                      newRole === "admin"
                        ? "bg-[#38BDF8]/20 border-[#18181B] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                        : "border-[#18181B]/40 text-[#71717A] hover:bg-[#FFFDF5]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs">
                      <input
                        type="radio"
                        name="roleSelect"
                        value="admin"
                        checked={newRole === "admin"}
                        onChange={() => setNewRole("admin")}
                      />
                      <span>👤 Admin Acara</span>
                    </div>
                    <span className="text-[10px] text-[#52525B]">
                      Hanya kelola tamu, RSVP, dan buku ucapan.
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border-2 cursor-pointer flex flex-col gap-1 transition-all ${
                      newRole === "super_admin"
                        ? "bg-[#FFE600]/30 border-[#18181B] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                        : "border-[#18181B]/40 text-[#71717A] hover:bg-[#FFFDF5]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-xs">
                      <input
                        type="radio"
                        name="roleSelect"
                        value="super_admin"
                        checked={newRole === "super_admin"}
                        onChange={() => setNewRole("super_admin")}
                      />
                      <span>👑 Super Admin</span>
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
                  className="px-4 py-2.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-[#18181B] hover:bg-[#FFFDF5] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-xs font-black text-[#18181B] shadow-[2px_2px_0px_#18181B] cursor-pointer disabled:opacity-50"
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
