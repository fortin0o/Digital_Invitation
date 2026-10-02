"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import RsvpSummaryCards from "@/components/admin/RsvpSummaryCards";
import GuestManagement, { GuestItem } from "@/components/admin/GuestManagement";
import GreetingsManagement, { UcapanItem } from "@/components/admin/GreetingsManagement";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("Admin");
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
      if (passcodeUser) {
        setIsAuthenticated(true);
        setUserEmail(passcodeUser);
        return;
      }

      // 2. Check Supabase auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || "Admin");
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("admin_auth_user");
    await supabase.auth.signOut();
    setIsAuthenticated(false);
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
        onLoginSuccess={(email) => {
          setIsAuthenticated(true);
          if (email) setUserEmail(email);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3D261C] flex flex-col font-inter">
      <AdminHeader
        userLabel={userEmail}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-[#8A6B53]">Memuat data admin...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in">
                <RsvpSummaryCards stats={stats} />

                {/* Quick actions & recap */}
                <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-[#3D261C]">
                      Rekap Kehadiran Praktik Pawiwahan
                    </h3>
                    <p className="text-xs text-[#8A6B53] mt-0.5">
                      Estimasi kehadiran saat ini: <strong className="text-[#5C3A21] font-semibold">{stats.totalHadirOrang} orang</strong> dari {stats.totalHadirTamu} undangan terkonfirmasi.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const text = `REKAP RSVP PAWIWAHAN ARYA & SEKAR\n-----------------------------\nTotal Undangan: ${stats.totalTamu}\nKonfirmasi Hadir: ${stats.totalHadirOrang} Orang (${stats.totalHadirTamu} Siswa/Tamu)\nMasih Ragu: ${stats.totalRagu} Tamu\nTidak Hadir: ${stats.totalTidakHadir} Tamu\nBelum Merespon: ${stats.totalBelumKonfirmasi} Tamu`;
                      navigator.clipboard.writeText(text);
                      setReportCopied(true);
                      setTimeout(() => setReportCopied(false), 2500);
                    }}
                    type="button"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all whitespace-nowrap cursor-pointer shadow-xs ${
                      reportCopied
                        ? "bg-emerald-700 text-white border-emerald-600"
                        : "border-[#C5A059] text-[#3D261C] hover:bg-[#5C3A21] hover:text-[#FFFDF9]"
                    }`}
                  >
                    {reportCopied ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Laporan Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Salin Format Laporan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Recent guests preview table */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-[#3D261C]">
                      Daftar Tamu Angkatan Terbaru
                    </h3>
                    <button
                      onClick={() => setActiveTab("tamu")}
                      type="button"
                      className="text-xs text-[#5C3A21] hover:underline font-medium cursor-pointer"
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
          </>
        )}
      </main>
    </div>
  );
}
