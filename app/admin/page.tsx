"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import RsvpSummaryCards from "@/components/admin/RsvpSummaryCards";
import GuestManagement, { GuestItem } from "@/components/admin/GuestManagement";
import GreetingsManagement, { UcapanItem } from "@/components/admin/GreetingsManagement";
import AdminManagement from "@/components/admin/AdminManagement";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("Admin");
  const [userRole, setUserRole] = useState<"super_admin" | "admin">("admin");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const [loading, setLoading] = useState(true);
  const [idUndangan, setIdUndangan] = useState<string>("f71db70a-a73f-43f2-9189-9b0fe97fec5b");
  const [undanganSlug, setUndanganSlug] = useState<string>("rina-dan-budi");
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [greetings, setGreetings] = useState<UcapanItem[]>([]);
  const [reportCopied, setReportCopied] = useState(false);

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check local passcode session
      const passcodeUser = localStorage.getItem("admin_auth_user");
      const passcodeRole = (localStorage.getItem("admin_auth_role") as "super_admin" | "admin") || "admin";
      if (passcodeUser) {
        setIsAuthenticated(true);
        setUserEmail(passcodeUser);
        setUserRole(passcodeRole);
        return;
      }

      // 2. Check Supabase auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        const email = session.user.email || "Admin";
        setUserEmail(email);

        let role: "super_admin" | "admin" = "admin";
        try {
          const { data: adminRecord } = await supabase
            .from("admin_users")
            .select("role")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (adminRecord?.role === "super_admin") {
            role = "super_admin";
          } else if (!adminRecord && (email.toLowerCase().includes("dev") || email.toLowerCase().includes("superadmin"))) {
            role = "super_admin";
          }
        } catch {
          if (email.toLowerCase().includes("dev") || email.toLowerCase().includes("superadmin")) {
            role = "super_admin";
          }
        }
        setUserRole(role);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("admin_auth_user");
    localStorage.removeItem("admin_auth_role");
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserRole("admin");
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch undangan info
      const { data: uData } = await supabase.from("undangan").select("*").limit(1).maybeSingle();
      if (uData) {
        setIdUndangan(uData.id_undangan);
        if (uData.slug) setUndanganSlug(uData.slug);
      }

      // Fetch guests
      const { data: tamuList } = await supabase.from("tamu").select("*").order("nama_tamu", { ascending: true });

      // Fetch RSVP
      const { data: rsvpList } = await supabase.from("rsvp").select("*");

      // Fetch greetings
      const { data: ucapanList } = await supabase
        .from("ucapan")
        .select("*")
        .order("tgl_kirim", { ascending: false });

      // Merge guests with their RSVP
      const rsvpMap = new Map();
      if (rsvpList) {
        rsvpList.forEach((r) => {
          rsvpMap.set(r.id_tamu, r);
        });
      }

      const mergedGuests: GuestItem[] = (tamuList || []).map((t) => ({
        ...t,
        rsvp: rsvpMap.get(t.id_tamu) || null,
      }));

      setGuests(mergedGuests);
      setGreetings((ucapanList as UcapanItem[]) || []);
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Restrict admin-users tab to Super Admin only
  useEffect(() => {
    if (userRole !== "super_admin" && activeTab === "admin-users") {
      setActiveTab("overview");
    }
  }, [userRole, activeTab]);

  // Compute RSVP statistics
  const stats = {
    totalTamu: guests.length,
    totalHadirTamu: guests.filter((g) => g.rsvp?.status === "hadir").length,
    totalHadirOrang: guests
      .filter((g) => g.rsvp?.status === "hadir")
      .reduce((sum, g) => sum + (g.rsvp?.jumlah_hadir || 1), 0),
    totalRagu: guests.filter((g) => g.rsvp?.status === "ragu").length,
    totalTidakHadir: guests.filter((g) => g.rsvp?.status === "tidak_hadir").length,
    totalBelumKonfirmasi: guests.filter((g) => !g.rsvp?.status).length,
  };

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        onLoginSuccess={(email, role) => {
          setIsAuthenticated(true);
          if (email) setUserEmail(email);
          if (role) setUserRole(role);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#18181B] flex flex-col font-sans">
      <AdminHeader
        userLabel={userEmail}
        userRole={userRole}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#18181B] border-t-[#FFE600] rounded-full animate-spin mb-2" />
            <p className="text-xs font-bold text-[#71717A]">Memuat data admin...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in">
                <RsvpSummaryCards stats={stats} />

                {/* Quick actions & recap */}
                <div className="p-6 rounded-[24px] bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#18181B]">
                      Rekap Kehadiran Tamu Undangan
                    </h3>
                    <p className="text-xs text-[#52525B] mt-1 font-medium">
                      Estimasi kehadiran saat ini: <strong className="text-[#18181B] font-extrabold">{stats.totalHadirOrang} orang</strong> dari {stats.totalHadirTamu} undangan terkonfirmasi.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const text = `REKAP RSVP WEDDING ARYA & SEKAR\n-----------------------------\nTotal Undangan: ${stats.totalTamu}\nKonfirmasi Hadir: ${stats.totalHadirOrang} Orang (${stats.totalHadirTamu} Tamu)\nMasih Ragu: ${stats.totalRagu} Tamu\nTidak Hadir: ${stats.totalTidakHadir} Tamu\nBelum Merespon: ${stats.totalBelumKonfirmasi} Tamu`;
                      navigator.clipboard.writeText(text);
                      setReportCopied(true);
                      setTimeout(() => setReportCopied(false), 2500);
                    }}
                    type="button"
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#18181B] text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-[2px_2px_0px_#18181B] ${
                      reportCopied
                        ? "bg-[#2EE59D] text-[#18181B]"
                        : "bg-[#FFE600] text-[#18181B] hover:bg-[#FFD700]"
                    }`}
                  >
                    {reportCopied ? (
                      <span>Laporan Berhasil Tersalin</span>
                    ) : (
                      <span>Salin Format Laporan</span>
                    )}
                  </button>
                </div>

                {/* Recent guests preview table */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-extrabold text-lg text-[#18181B]">
                      Daftar Tamu Terbaru
                    </h3>
                    <button
                      onClick={() => setActiveTab("tamu")}
                      type="button"
                      className="text-xs text-[#FF5D8F] hover:text-[#18181B] font-extrabold cursor-pointer"
                    >
                      Lihat Semua Tamu &rarr;
                    </button>
                  </div>
                  <GuestManagement
                    guests={guests.slice(0, 5)}
                    onRefresh={fetchData}
                    idUndangan={idUndangan}
                    slug={undanganSlug}
                  />
                </div>
              </div>
            )}

            {activeTab === "tamu" && (
              <div className="animate-in fade-in">
                <GuestManagement
                  guests={guests}
                  onRefresh={fetchData}
                  idUndangan={idUndangan}
                  slug={undanganSlug}
                />
              </div>
            )}

            {activeTab === "ucapan" && (
              <div className="animate-in fade-in">
                <GreetingsManagement
                  greetings={greetings}
                  onRefresh={fetchData}
                />
              </div>
            )}

            {activeTab === "admin-users" && userRole === "super_admin" && (
              <div className="animate-in fade-in">
                <AdminManagement
                  currentUserEmail={userEmail}
                  currentUserRole={userRole}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

