"use client";

import React from "react";
import Link from "next/link";

interface AdminHeaderProps {
  userLabel: string;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminHeader({
  userLabel,
  onLogout,
  activeTab,
  setActiveTab,
}: AdminHeaderProps) {
  const tabs = [
    { id: "overview", label: "Ringkasan RSVP" },
    { id: "tamu", label: "Kelola Tamu Angkatan" },
    { id: "ucapan", label: "Buku Tamu / Serat" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#C5A059]/25 shadow-xs font-inter">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#C5A059]/50 flex items-center justify-center text-[#5C3A21] text-xs font-bold">
              A&amp;S
            </span>
            <div>
              <h1 className="text-base sm:text-lg text-[#3D261C] font-semibold leading-none">
                Admin Pawiwahan
              </h1>
              <p className="text-[11px] text-[#8A6B53] mt-0.5 font-normal">
                Arya &amp; Sekar • Praktik Pawiwahan
              </p>
            </div>
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-full border border-[#C5A059]/30 text-[#3D261C] text-xs hover:bg-[#FAF6F0]"
              title="Buka Undangan"
            >
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button
              onClick={onLogout}
              type="button"
              className="p-2 rounded-full border border-rose-200 text-rose-600 text-xs hover:bg-rose-50 cursor-pointer"
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
              className={`px-3.5 py-1.5 rounded-full text-xs tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#5C3A21] text-[#FFFDF9] font-medium shadow-xs border border-[#C5A059]"
                  : "bg-[#FAF6F0] text-[#3D261C] hover:bg-[#C5A059]/15 border border-[#C5A059]/25"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Info & Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs text-[#8A6B53] truncate max-w-[180px]">
            {userLabel}
          </span>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C5A059]/50 text-[#3D261C] hover:bg-[#5C3A21] hover:text-[#FFFDF9] text-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Buka Undangan</span>
          </Link>
          <button
            onClick={onLogout}
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
          >
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
