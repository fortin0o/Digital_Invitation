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
    { id: "overview", label: "📊 Ringkasan RSVP" },
    { id: "tamu", label: "👥 Kelola Tamu Undangan" },
    { id: "ucapan", label: "💬 Buku Tamu & Doa" },
    ...(userRole === "super_admin"
      ? [{ id: "admin-users", label: "👑 Kelola Admin" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-[2.5px] border-[#18181B] shadow-[0_2px_0px_#18181B] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#FFE600] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-[#18181B] text-xs font-black">
              A&amp;S
            </span>
            <div>
              <h1 className="font-display text-base sm:text-lg text-[#18181B] font-extrabold leading-none">
                Admin Dashboard
              </h1>
              <p className="text-[11px] text-[#71717A] mt-0.5 font-bold">
                The Wedding of Arya &amp; Sekar
              </p>
            </div>
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/"
              target="_blank"
              className="p-1.5 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-[#18181B] text-xs shadow-[2px_2px_0px_#18181B]"
              title="Buka Undangan"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button
              onClick={onLogout}
              type="button"
              className="p-1.5 rounded-xl bg-rose-100 border-2 border-[#18181B] text-rose-700 text-xs shadow-[2px_2px_0px_#18181B] cursor-pointer"
              title="Keluar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-tight whitespace-nowrap transition-all border-2 border-[#18181B] cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FFE600] text-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] -translate-x-0.5 -translate-y-0.5"
                  : "bg-[#FFFDF5] text-[#52525B] hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Info & Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] ${
                userRole === "super_admin"
                  ? "bg-[#FFE600] text-[#18181B]"
                  : "bg-[#38BDF8] text-[#18181B]"
              }`}
            >
              {userRole === "super_admin" ? "👑 Super Admin" : "👤 Admin Acara"}
            </span>
            <span className="text-xs font-semibold text-[#52525B] truncate max-w-[140px]">
              {userLabel}
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FFE600] border-2 border-[#18181B] text-[#18181B] text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Buka Undangan</span>
          </Link>

          <button
            onClick={onLogout}
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-[#18181B] text-rose-900 text-xs font-bold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer"
          >
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
