"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AdminHeaderProps {
  userLabel: string;
  userRole?: "super_admin" | "admin";
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  coupleTitle?: string;
}

export default function AdminHeader({
  userLabel,
  userRole = "admin",
  onLogout,
  activeTab,
  setActiveTab,
  coupleTitle = "",
}: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "overview", label: "Ringkasan RSVP" },
    { id: "cms", label: "Edit Undangan" },
    { id: "tamu", label: "Kelola Tamu Undangan" },
    { id: "ucapan", label: "Buku Tamu & Doa" },
    ...(userRole === "super_admin"
      ? [{ id: "admin-users", label: "Kelola Admin" }]
      : []),
  ];

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#18181B] shadow-[0_2px_0px_#18181B] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2">
        {/* Top Bar: Brand, Identity, Quick Actions & Hamburger */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#FFE600] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-[#18181B] text-xs sm:text-sm font-black tracking-wide">
              WM
            </span>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-sm sm:text-lg text-[#18181B] font-extrabold leading-tight">
                  WeddingMu
                </h1>
                {/* Unified Role Pill (Always visible, never clipped) */}
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-[#18181B] shadow-[1px_1px_0px_#18181B] shrink-0 ${
                    userRole === "super_admin"
                      ? "bg-[#FFE600] text-[#18181B]"
                      : "bg-[#38BDF8] text-[#18181B]"
                  }`}
                >
                  {userRole === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#71717A] font-bold truncate mt-0.5">
                {coupleTitle ? coupleTitle : "weddingmu.web.id"}
              </p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User email badge for tablet & desktop */}
            <span className="hidden lg:inline-block text-xs font-semibold text-[#52525B] truncate max-w-[160px]">
              {userLabel}
            </span>

            {/* Desktop: Buka Undangan Button */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFDF5] hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
              title="Buka Undangan Digital"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Lihat Web</span>
            </Link>

            {/* Desktop: Keluar Button */}
            <button
              onClick={onLogout}
              type="button"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-[#18181B] text-rose-900 text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
              title="Keluar dari Panel Admin"
            >
              <span>Keluar</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-9 h-9 rounded-xl bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
              aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            >
              {mobileMenuOpen ? (
                <svg className="w-4 h-4 text-[#18181B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#18181B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation Row (Hidden on mobile) */}
        <nav className="hidden sm:flex items-center gap-2 overflow-x-auto py-1 px-1 -mx-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold tracking-tight whitespace-nowrap transition-all border-2 border-[#18181B] cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "bg-[#FFE600] text-[#18181B] shadow-[2px_2px_0px_#18181B] -translate-x-0.5 -translate-y-0.5"
                  : "bg-[#FFFDF5] text-[#52525B] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="sm:hidden fixed inset-0 top-[52px] bg-[#18181B]/40 backdrop-blur-xs z-30 animate-in fade-in overscroll-contain"
            />

            {/* Dropdown Menu Content */}
            <div className="sm:hidden relative z-40 bg-white border-t-2 border-[#18181B] -mx-4 -mb-3 px-4 py-4 space-y-3 shadow-[0_4px_0px_#18181B] animate-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-64px)] overflow-y-auto overscroll-contain">
              <div className="p-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-[#71717A]">Masuk Sebagai</p>
                  <p className="text-xs font-extrabold text-[#18181B] truncate">{userLabel}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border border-[#18181B] shrink-0 ${
                    userRole === "super_admin" ? "bg-[#FFE600] text-[#18181B]" : "bg-[#38BDF8] text-[#18181B]"
                  }`}
                >
                  {userRole === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>

              {/* Vertical Tab Navigation List */}
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      type="button"
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 border-[#18181B] cursor-pointer ${
                        isActive
                          ? "bg-[#FFE600] text-[#18181B] shadow-[2px_2px_0px_#18181B] -translate-x-0.5 -translate-y-0.5"
                          : "bg-[#FFFDF5] text-[#18181B] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Tab Icons */}
                        {tab.id === "overview" && (
                          <svg className="w-4 h-4 text-[#18181B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        )}
                        {tab.id === "cms" && (
                          <svg className="w-4 h-4 text-[#18181B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                        {tab.id === "tamu" && (
                          <svg className="w-4 h-4 text-[#18181B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {tab.id === "ucapan" && (
                          <svg className="w-4 h-4 text-[#18181B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        )}
                        {tab.id === "admin-users" && (
                          <svg className="w-4 h-4 text-[#18181B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                        <span>{tab.label}</span>
                      </div>

                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#18181B]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Quick Action Buttons: Lihat Web & Logout */}
              <div className="pt-2 border-t border-[#18181B]/15 grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] text-center"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Lihat Web</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-[#18181B] text-rose-900 text-xs font-bold shadow-[2px_2px_0px_#18181B] cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
