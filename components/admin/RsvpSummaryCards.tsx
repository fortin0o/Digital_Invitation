"use client";

import React from "react";

interface RsvpStats {
  totalTamu: number;
  totalHadirTamu: number;
  totalHadirOrang: number;
  totalRagu: number;
  totalTidakHadir: number;
  totalBelumKonfirmasi: number;
}

interface RsvpSummaryCardsProps {
  stats: RsvpStats;
}

export default function RsvpSummaryCards({ stats }: RsvpSummaryCardsProps) {
  const responded = stats.totalTamu - stats.totalBelumKonfirmasi;
  const responseRate = stats.totalTamu > 0 ? Math.round((responded / stats.totalTamu) * 100) : 0;

  return (
    <div className="space-y-6 font-inter">
      {/* Stat Cards Grid (Mobile 2-col, Desktop 4-col) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tamu */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-xs">
          <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#8A6B53] font-medium">
            Total Tamu Angkatan
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#3D261C]">
              {stats.totalTamu}
            </span>
            <span className="text-xs text-[#8A6B53]">siswa/tamu</span>
          </div>
        </div>

        {/* Konfirmasi Hadir */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/50 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#5C3A21] font-semibold">
              Konfirmasi Rawuh
            </p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#5C3A21]">
              {stats.totalHadirOrang}
            </span>
            <span className="text-xs text-[#8A6B53]">
              orang ({stats.totalHadirTamu} tamu)
            </span>
          </div>
        </div>

        {/* Belum Konfirmasi */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#8A6B53] font-medium">
              Dereng Merespon
            </p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#B39B88]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#3D261C]">
              {stats.totalBelumKonfirmasi}
            </span>
            <span className="text-xs text-[#8A6B53]">tamu</span>
          </div>
        </div>

        {/* Tidak Hadir & Ragu */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#8A6B53] font-medium">
              Rangu / Berhalangan
            </p>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#3D261C]">
              {stats.totalTidakHadir + stats.totalRagu}
            </span>
            <span className="text-xs text-[#8A6B53]">
              ({stats.totalRagu} ragu, {stats.totalTidakHadir} absen)
            </span>
          </div>
        </div>
      </div>

      {/* Response Progress Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#3D261C]">
            Tingkat Respon Konfirmasi RSVP ({responseRate}%)
          </span>
          <span className="text-xs text-[#8A6B53]">
            {responded} dari {stats.totalTamu} tamu telah merespon
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-[#FAF6F0] overflow-hidden flex border border-[#C5A059]/20">
          <div
            style={{ width: `${stats.totalTamu > 0 ? (stats.totalHadirTamu / stats.totalTamu) * 100 : 0}%` }}
            className="h-full bg-[#5C3A21] transition-all duration-500"
            title="Hadir"
          />
          <div
            style={{ width: `${stats.totalTamu > 0 ? (stats.totalRagu / stats.totalTamu) * 100 : 0}%` }}
            className="h-full bg-amber-400 transition-all duration-500"
            title="Ragu"
          />
          <div
            style={{ width: `${stats.totalTamu > 0 ? (stats.totalTidakHadir / stats.totalTamu) * 100 : 0}%` }}
            className="h-full bg-rose-400 transition-all duration-500"
            title="Tidak Hadir"
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px] text-[#8A6B53]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#5C3A21]" /> Hadir ({stats.totalHadirTamu})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Ragu ({stats.totalRagu})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Tidak Hadir ({stats.totalTidakHadir})
          </span>
        </div>
      </div>
    </div>
  );
}
