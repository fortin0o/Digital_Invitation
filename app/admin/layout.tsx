import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Dashboard Manajemen Undangan & Buku Tamu Digital WeddingMu",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3D261C] font-inter antialiased">
      {children}
    </div>
  );
}
