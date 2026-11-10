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
    <div className="space-y-5 sm:space-y-6 font-sans">
      {/* Stat Cards Grid (Mobile 2-col, Tablet & Desktop 4-col) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Total Tamu */}
        <div className="p-3.5 sm:p-5 rounded-[22px] bg-[#FFE600] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] sm:shadow-[4px_4px_0px_#18181B] flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#18181B] font-extrabold truncate">
            Total Undangan
          </p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18181B] leading-none">
              {stats.totalTamu}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#18181B]">tamu</span>
          </div>
        </div>

        {/* Konfirmasi Hadir */}
        <div className="p-3.5 sm:p-5 rounded-[22px] bg-[#2EE59D] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] sm:shadow-[4px_4px_0px_#18181B] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#18181B] font-extrabold truncate">
              Konfirmasi Hadir
            </p>
            <span className="w-2 h-2 rounded-full bg-[#18181B] shrink-0" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18181B] leading-none">
                {stats.totalHadirOrang}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#18181B]">orang</span>
            </div>
            <p className="text-[10px] text-[#18181B]/80 font-bold mt-0.5 truncate">
              ({stats.totalHadirTamu} undangan)
            </p>
          </div>
        </div>

        {/* Belum Konfirmasi */}
        <div className="p-3.5 sm:p-5 rounded-[22px] bg-[#38BDF8] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] sm:shadow-[4px_4px_0px_#18181B] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#18181B] font-extrabold truncate">
              Belum Respon
            </p>
            <span className="w-2 h-2 rounded-full bg-[#18181B] shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18181B] leading-none">
              {stats.totalBelumKonfirmasi}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#18181B]">tamu</span>
          </div>
        </div>

        {/* Tidak Hadir & Ragu */}
        <div className="p-3.5 sm:p-5 rounded-[22px] bg-[#FF5D8F] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] sm:shadow-[4px_4px_0px_#18181B] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#18181B] font-extrabold truncate">
              Ragu / Absen
            </p>
            <span className="w-2 h-2 rounded-full bg-[#18181B] shrink-0" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18181B] leading-none">
                {stats.totalTidakHadir + stats.totalRagu}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#18181B]">tamu</span>
            </div>
            <p className="text-[10px] text-[#18181B]/80 font-bold mt-0.5 truncate">
              ({stats.totalRagu} ragu, {stats.totalTidakHadir} absen)
            </p>
          </div>
        </div>
      </div>

      {/* Response Progress Card */}
      <div className="p-4 sm:p-5 rounded-[24px] bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] sm:shadow-[4px_4px_0px_#18181B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <span className="font-display text-xs sm:text-sm font-extrabold text-[#18181B]">
            Tingkat Respon Konfirmasi RSVP ({responseRate}%)
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-[#52525B]">
            {responded} dari {stats.totalTamu} tamu telah merespon
          </span>
        </div>
        <div className="w-full h-3 sm:h-3.5 rounded-full bg-[#FFFDF5] overflow-hidden flex border-2 border-[#18181B]">
          <div
            style={{ width: `${stats.totalTamu > 0 ? (stats.totalHadirTamu / stats.totalTamu) * 100 : 0}%` }}
            className="h-full bg-[#2EE59D] transition-all duration-500 border-r border-[#18181B]"
            title="Hadir"
          />
          <div
            style={{ width: `${stats.totalTamu > 0 ? (stats.totalRagu / stats.totalTamu) * 100 : 0}%` }}
            className="h-full bg-[#FFE600] transition-all duration-500 border-r border-[#18181B]"
            title="Ragu"
          />
          <div
            style={{ width: `${stats.totalTamu > 0 ? (stats.totalTidakHadir / stats.totalTamu) * 100 : 0}%` }}
            className="h-full bg-[#FF5D8F] transition-all duration-500"
            title="Tidak Hadir"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-3 text-[11px] sm:text-xs font-bold text-[#18181B]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-[#2EE59D] border border-[#18181B]" /> Hadir ({stats.totalHadirTamu})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-[#FFE600] border border-[#18181B]" /> Ragu ({stats.totalRagu})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-[#FF5D8F] border border-[#18181B]" /> Tidak Hadir ({stats.totalTidakHadir})
          </span>
        </div>
      </div>
    </div>
  );
}
