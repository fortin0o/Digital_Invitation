"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  AdminRole,
  verifyAdminAccess,
} from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import RsvpSummaryCards from "@/components/admin/RsvpSummaryCards";
import GuestManagement, { GuestItem } from "@/components/admin/GuestManagement";
import GreetingsManagement, { UcapanItem } from "@/components/admin/GreetingsManagement";
import AdminManagement from "@/components/admin/AdminManagement";
import InvitationCms from "@/components/admin/InvitationCms";
import PrintableGuestReport from "@/components/admin/PrintableGuestReport";
import { forceUnlockScroll } from "@/lib/scrollLock";

interface UndanganInfo {
  id_undangan: string;
  slug: string;
  nama_pria?: string | null;
  nama_wanita?: string | null;
  tgl_acara?: string | null;
  tempat?: string | null;
  alamat?: string | null;
  link_maps?: string | null;
}

async function queryDashboardData() {
  const undanganRes = await supabase
    .from("undangan")
    .select("id_undangan, slug, nama_pria, nama_wanita, tgl_acara, tempat, alamat, link_maps")
    .limit(1)
    .maybeSingle();

  const activeUndangan = (undanganRes.data as UndanganInfo | null) || null;

  if (!activeUndangan?.id_undangan) {
    return {
      undangan: null,
      guests: [] as GuestItem[],
      greetings: [] as UcapanItem[],
      errorMsg: undanganRes.error ? `Undangan: ${undanganRes.error.message}` : null,
    };
  }

  const [tamuRes, rsvpRes, ucapanRes] = await Promise.all([
    supabase
      .from("tamu")
      .select("*")
      .eq("id_undangan", activeUndangan.id_undangan)
      .order("nama_tamu", { ascending: true }),
    supabase.from("rsvp").select("*"),
    supabase
      .from("ucapan")
      .select("*")
      .eq("id_undangan", activeUndangan.id_undangan)
      .order("tgl_kirim", { ascending: false }),
  ]);

  const errors = [
    undanganRes.error && `Undangan: ${undanganRes.error.message}`,
    tamuRes.error && `Tamu: ${tamuRes.error.message}`,
    rsvpRes.error && `RSVP: ${rsvpRes.error.message}`,
    ucapanRes.error && `Ucapan: ${ucapanRes.error.message}`,
  ].filter(Boolean) as string[];

  const rsvpMap = new Map();
  if (rsvpRes.data) {
    rsvpRes.data.forEach((r) => {
      rsvpMap.set(r.id_tamu, r);
    });
  }

  const mergedGuests: GuestItem[] = (tamuRes.data || []).map((t) => ({
    ...t,
    rsvp: rsvpMap.get(t.id_tamu) || null,
  }));

  return {
    undangan: activeUndangan,
    guests: mergedGuests,
    greetings: (ucapanRes.data as UcapanItem[]) || [],
    errorMsg: errors.length > 0 ? errors.join(" | ") : null,
  };
}

export default function AdminPage() {
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("Admin");
  const [userRole, setUserRole] = useState<AdminRole>("admin");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [undangan, setUndangan] = useState<UndanganInfo | null>(null);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [greetings, setGreetings] = useState<UcapanItem[]>([]);
  const [reportCopied, setReportCopied] = useState(false);

  // Guarantee all scroll locks are cleared when switching dashboard tabs
  useEffect(() => {
    forceUnlockScroll();
  }, [activeTab]);

  // Verify active Supabase Auth session and admin allowlist
  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active || !session) return;

        const email = session.user.email || "";
        const access = await verifyAdminAccess(email);
        if (!active) return;

        if (!access.authorized || !access.role) {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setAuthError(
            access.reason || "Akses ditolak: akun Anda tidak terdaftar di daftar administrator."
          );
          return;
        }

        setAuthError(null);
        setIsAuthenticated(true);
        setUserEmail(email || "Admin");
        setUserRole(access.role);
      } catch (err) {
        console.error("Gagal memeriksa sesi admin:", err);
      } finally {
        if (active) {
          setAuthChecking(false);
        }
      }
    };

    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setUserRole("admin");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthError(null);
    setIsAuthenticated(false);
    setUserRole("admin");
    setActiveTab("overview");
    setLoading(true);
    setFetchError(null);
    setUndangan(null);
    setGuests([]);
    setGreetings([]);
  };

  const applyDashboardResult = useCallback(
    (result: Awaited<ReturnType<typeof queryDashboardData>>) => {
      setUndangan(result.undangan);
      setGuests(result.guests);
      setGreetings(result.greetings);
      setFetchError(result.errorMsg);
    },
    []
  );

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      setFetchError(null);
      try {
        const result = await queryDashboardData();
        applyDashboardResult(result);
      } catch (err) {
        console.error("Gagal memuat data admin:", err);
        setFetchError(
          err instanceof Error ? err.message : "Terjadi kesalahan saat menghubungi server."
        );
      } finally {
        setLoading(false);
      }
    },
    [applyDashboardResult]
  );

  const handleSilentRefresh = useCallback(() => {
    void fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;

    (async () => {
      try {
        const result = await queryDashboardData();
        if (active) {
          applyDashboardResult(result);
        }
      } catch (err) {
        console.error("Gagal memuat data admin:", err);
        if (active) {
          setFetchError(
            err instanceof Error ? err.message : "Terjadi kesalahan saat menghubungi server."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, applyDashboardResult]);

  // Restrict admin-users tab to Super Admin only during render
  const currentTab =
    userRole !== "super_admin" && activeTab === "admin-users" ? "overview" : activeTab;

  const idUndangan = undangan?.id_undangan || "";
  const undanganSlug = undangan?.slug || "";
  const coupleTitle =
    undangan?.nama_pria && undangan?.nama_wanita
      ? `${undangan.nama_pria} & ${undangan.nama_wanita}`
      : "Arya & Sekar";

  // Compute RSVP statistics in a single pass
  const stats = useMemo(() => {
    let totalHadirTamu = 0;
    let totalHadirOrang = 0;
    let totalRagu = 0;
    let totalTidakHadir = 0;
    let totalBelumKonfirmasi = 0;

    for (const g of guests) {
      const status = g.rsvp?.status;
      if (status === "hadir") {
        totalHadirTamu += 1;
        totalHadirOrang += g.rsvp?.jumlah_hadir || 1;
      } else if (status === "ragu") {
        totalRagu += 1;
      } else if (status === "tidak_hadir") {
        totalTidakHadir += 1;
      } else {
        totalBelumKonfirmasi += 1;
      }
    }

    return {
      totalTamu: guests.length,
      totalHadirTamu,
      totalHadirOrang,
      totalRagu,
      totalTidakHadir,
      totalBelumKonfirmasi,
    };
  }, [guests]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center p-4 font-sans">
        <div className="inline-block w-8 h-8 border-3 border-[#18181B] border-t-[#FFE600] rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-[#71717A]">Memeriksa sesi admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        key={authError ?? "login"}
        initialError={authError}
        onLoginSuccess={(email, role) => {
          setLoading(true);
          setFetchError(null);
          setAuthError(null);
          setIsAuthenticated(true);
          if (email) setUserEmail(email);
          if (role) setUserRole(role);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#18181B] flex flex-col font-sans">
      <div className="screen-only min-h-screen flex flex-col">
        <AdminHeader
          userLabel={userEmail}
          userRole={userRole}
          onLogout={handleLogout}
          activeTab={currentTab}
          setActiveTab={setActiveTab}
          coupleTitle={coupleTitle}
        />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {fetchError && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-rose-100 border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-display text-sm sm:text-base font-extrabold text-rose-950">
                Sebagian atau seluruh data gagal dimuat
              </p>
              <p className="text-xs text-rose-900 font-medium break-words">
                {fetchError}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchData(false)}
              className="w-full sm:w-auto px-6 py-2 rounded-full bg-white hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold shadow-[2px_2px_0px_#18181B] cursor-pointer whitespace-nowrap"
            >
              Muat Ulang Data
            </button>
          </div>
        )}

        {!loading && !fetchError && !idUndangan && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-100 border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-display text-sm sm:text-base font-extrabold text-[#18181B]">
                Data acara (undangan) belum tersedia di database
              </p>
              <p className="text-xs text-[#52525B] font-medium leading-relaxed">
                Tambahkan minimal 1 baris data acara di tabel <code>public.undangan</code> Supabase agar fitur tambah tamu dan tautan undangan dapat digunakan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchData(false)}
              className="w-full sm:w-auto px-6 py-2 rounded-full bg-white hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold shadow-[2px_2px_0px_#18181B] cursor-pointer whitespace-nowrap"
            >
              Cek Ulang DB
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#18181B] border-t-[#FFE600] rounded-full animate-spin mb-2" />
            <p className="text-xs font-bold text-[#71717A]">Memuat data admin...</p>
          </div>
        ) : (
          <>
            {currentTab === "overview" && (
              <div className="space-y-6 animate-in fade-in">
                <RsvpSummaryCards stats={stats} />

                {/* Quick actions & recap */}
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#18181B]">
                      Rekap Kehadiran Tamu Undangan
                    </h3>
                    <p className="text-xs text-[#52525B] mt-1 font-medium">
                      Estimasi kehadiran saat ini: <strong className="text-[#18181B] font-extrabold">{stats.totalHadirOrang} orang</strong> dari {stats.totalHadirTamu} undangan terkonfirmasi.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => window.print()}
                      type="button"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full border-2 border-[#18181B] bg-[#FFFDF5] hover:bg-[#FFE600] text-[#18181B] text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-[2px_2px_0px_#18181B]"
                      title="Cetak Laporan Resmi Tamu & RSVP ke PDF / Printer"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Cetak Laporan PDF</span>
                    </button>

                    <button
                      onClick={() => {
                        const text = `REKAP RSVP WEDDING ${coupleTitle.toUpperCase()}\n-----------------------------\nTotal Undangan: ${stats.totalTamu}\nKonfirmasi Hadir: ${stats.totalHadirOrang} Orang (${stats.totalHadirTamu} Tamu)\nMasih Ragu: ${stats.totalRagu} Tamu\nTidak Hadir: ${stats.totalTidakHadir} Tamu\nBelum Merespon: ${stats.totalBelumKonfirmasi} Tamu`;
                        navigator.clipboard.writeText(text);
                        setReportCopied(true);
                        setTimeout(() => setReportCopied(false), 2500);
                      }}
                      type="button"
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full border-2 border-[#18181B] text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-[2px_2px_0px_#18181B] ${
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
                    guests={guests}
                    onRefresh={handleSilentRefresh}
                    idUndangan={idUndangan}
                    slug={undanganSlug}
                    coupleName={coupleTitle}
                    previewLimit={5}
                    onViewAll={() => setActiveTab("tamu")}
                  />
                </div>
              </div>
            )}

            {currentTab === "cms" && (
              <div className="animate-in fade-in">
                <InvitationCms
                  key={undangan?.id_undangan || "cms"}
                  undangan={undangan}
                  onSaved={handleSilentRefresh}
                />
              </div>
            )}

            {currentTab === "tamu" && (
              <div className="animate-in fade-in">
                <GuestManagement
                  guests={guests}
                  onRefresh={handleSilentRefresh}
                  idUndangan={idUndangan}
                  slug={undanganSlug}
                  coupleName={coupleTitle}
                />
              </div>
            )}

            {currentTab === "ucapan" && (
              <div className="animate-in fade-in">
                <GreetingsManagement
                  greetings={greetings}
                  onRefresh={handleSilentRefresh}
                />
              </div>
            )}

            {currentTab === "admin-users" && userRole === "super_admin" && (
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

    {/* Official PDF Document Report (Rendered ONLY in print/PDF output) */}
    <PrintableGuestReport
      guests={guests}
      coupleName={coupleTitle}
      weddingDate={undangan?.tgl_acara || undefined}
      venue={
        undangan?.tempat
          ? `${undangan.tempat}${undangan.alamat ? `, ${undangan.alamat}` : ""}`
          : undefined
      }
      printedBy={userEmail}
    />
  </div>
  );
}

