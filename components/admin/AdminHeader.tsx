"use client";

import React from "react";
import Link from "next/link";

interface AdminHeaderProps {
  userLabel: string;
  userRole?: "super_admin" | "admin";
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminHeader({
  userLabel,
  userRole = "admin",
  onLogout,
  activeTab,
  setActiveTab,
}: AdminHeaderProps) {
  const tabs = [
    { id: "overview", label: "Ringkasan RSVP" },
    { id: "tamu", label: "Kelola Tamu Undangan" },
    { id: "ucapan", label: "Buku Tamu & Doa" },
    ...(userRole === "super_admin"
      ? [{ id: "admin-users", label: "Kelola Admin" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-[2.5px] border-[#18181B] shadow-[0_2px_0px_#18181B] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2">
        {/* Top Bar: Brand, User Identity & Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#FFE600] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-[#18181B] text-xs font-black">
              A&amp;S
            </span>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-sm sm:text-lg text-[#18181B] font-extrabold leading-none truncate">
                  Admin Dashboard
                </h1>
                <span
                  className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-[#18181B] shadow-[1px_1px_0px_#18181B] shrink-0 ${
                    userRole === "super_admin"
                      ? "bg-[#FFE600] text-[#18181B]"
                      : "bg-[#38BDF8] text-[#18181B]"
                  }`}
                >
                  {userRole === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#71717A] mt-1 font-bold truncate">
                The Wedding of Arya &amp; Sekar
              </p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile role pill */}
            <span
              className={`sm:hidden px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-[#18181B] ${
                userRole === "super_admin"
                  ? "bg-[#FFE600] text-[#18181B]"
                  : "bg-[#38BDF8] text-[#18181B]"
              }`}
            >
              {userRole === "super_admin" ? "Super" : "Admin"}
            </span>

            {/* User email badge for tablet & desktop */}
            <span className="hidden lg:inline-block text-xs font-semibold text-[#52525B] truncate max-w-[150px]">
              {userLabel}
            </span>

            {/* Buka Undangan Button */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#FFFDF5] hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
              title="Buka Undangan Digital"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Lihat Web</span>
            </Link>

            {/* Keluar Button */}
            <button
              onClick={onLogout}
              type="button"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-[#18181B] text-rose-900 text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
              title="Keluar dari Panel Admin"
            >
              <svg className="w-3.5 h-3.5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row: Seamless horizontal scroll on Mobile & Tablet */}
        <nav className="flex items-center gap-2 overflow-x-auto py-1 px-1 -mx-1 scrollbar-none">
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
      </div>
    </header>
  );
}
