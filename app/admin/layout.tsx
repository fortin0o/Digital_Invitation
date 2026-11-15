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
    <div className="min-h-screen w-full bg-[#FFFDF5] text-[#18181B] font-sans antialiased overflow-x-hidden">
      {children}
    </div>
  );
}
