"use client";

import React from "react";
import { GuestItem } from "./GuestManagement";

interface PrintableGuestReportProps {
  guests: GuestItem[];
  coupleName?: string;
  weddingDate?: string;
  venue?: string;
  printedBy?: string;
  className?: string;
  isModalPreview?: boolean;
}

function formatPrintDate(isoString?: string | null): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

export default function PrintableGuestReport({
  guests,
  coupleName = "Arya Suryo Wicaksono & Sekar Arum Kinanti",
  weddingDate = "2026-11-14T08:00:00+07:00",
  venue = "Sasana Pendopo Ageng, Surakarta",
  printedBy = "Administrator",
  className = "",
  isModalPreview = false,
}: PrintableGuestReportProps) {
  const totalTamu = guests.length;
  const hadirList = guests.filter((g) => g.rsvp?.status === "hadir");
  const totalHadirTamu = hadirList.length;
  const totalHadirOrang = hadirList.reduce(
    (sum, g) => sum + (g.rsvp?.jumlah_hadir || 1),
    0
  );
  const raguList = guests.filter((g) => g.rsvp?.status === "ragu");
  const totalRagu = raguList.length;
  const tidakHadirList = guests.filter((g) => g.rsvp?.status === "tidak_hadir");
  const totalTidakHadir = tidakHadirList.length;
  const belumList = guests.filter((g) => !g.rsvp?.status);
  const totalBelum = belumList.length;
  const responded = totalTamu - totalBelum;
  const responseRate = totalTamu > 0 ? Math.round((responded / totalTamu) * 100) : 0;

  const now = new Date();
  const printDateTime = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(now);

  const printDateOnly = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const formattedWeddingDate = (() => {
    try {
      const d = new Date(weddingDate);
      if (isNaN(d.getTime())) return weddingDate;
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return weddingDate;
    }
  })();

  return (
    <div
      id={isModalPreview ? "printable-preview-report" : "printable-guest-report"}
      className={`bg-white text-[#18181B] font-sans ${isModalPreview ? "" : "print-only"} ${className}`}
      style={{ width: "100%", margin: 0, padding: 0 }}
    >
      {/* KOP SURAT LAPORAN RESMI */}
      <div className="border-b-[3px] border-[#18181B] pb-3 mb-4 text-center">
        <div className="flex items-center justify-between border-b border-[#18181B] pb-2 mb-2 text-left">
          <div>
            <p className="text-[8.5pt] font-mono font-bold tracking-widest uppercase text-neutral-600">
              SISTEM INFORMASI UNDANGAN PERNIKAHAN DIGITAL
            </p>
            <h2 className="text-[11.5pt] font-black uppercase tracking-wider text-[#18181B]">
              WEDDINGMU — PANEL ADMINISTRASI ACARA
            </h2>
          </div>
          <div className="text-right text-[8pt] text-neutral-600">
            <p className="font-bold uppercase text-[#18181B]">DOKUMEN RESMI REKAPITULASI</p>
            <p>Dicetak: {printDateTime}</p>
          </div>
        </div>

        <h1 className="text-[14pt] font-black uppercase tracking-wide text-[#18181B] mt-2">
          LAPORAN DATA TAMU UNDANGAN &amp; REKAPITULASI RSVP
        </h1>
        <p className="text-[10.5pt] font-bold text-neutral-800 mt-1">
          Perayaan Pernikahan: {coupleName}
        </p>
        <p className="text-[8.5pt] text-neutral-600 mt-0.5 font-medium">
          Waktu: {formattedWeddingDate} • Tempat: {venue}
        </p>
      </div>

      {/* KOTAK RINGKASAN EKSEKUTIF METRIK KEHADIRAN */}
      <div className="border border-[#18181B] bg-neutral-50 p-2.5 mb-4 print-avoid-break">
        <div className="flex items-center justify-between border-b border-neutral-300 pb-1 mb-2">
          <span className="text-[8.5pt] font-extrabold uppercase tracking-wider text-[#18181B]">
            Ringkasan Statistik Kehadiran
          </span>
          <span className="text-[8pt] font-bold text-neutral-700">
            Tingkat Respon: {responseRate}% ({responded} dari {totalTamu} Undangan)
          </span>
        </div>

        <table className="w-full text-center text-[8pt] border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="border border-neutral-400 p-1.5 font-bold uppercase text-neutral-700">
                Total Undangan
              </th>
              <th className="border border-neutral-400 p-1.5 font-bold uppercase text-emerald-800">
                Konfirmasi Hadir
              </th>
              <th className="border border-neutral-400 p-1.5 font-bold uppercase text-amber-800">
                Masih Ragu
              </th>
              <th className="border border-neutral-400 p-1.5 font-bold uppercase text-rose-800">
                Tidak Hadir
              </th>
              <th className="border border-neutral-400 p-1.5 font-bold uppercase text-neutral-700">
                Belum Respon
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white font-mono font-bold text-[9.5pt]">
              <td className="border border-neutral-400 p-1.5 text-[#18181B]">
                {totalTamu} <span className="text-[7.5pt] font-sans font-normal">Tamu</span>
              </td>
              <td className="border border-neutral-400 p-1.5 text-emerald-950 font-black">
                {totalHadirOrang} <span className="text-[7.5pt] font-sans font-normal">Orang ({totalHadirTamu} Tamu)</span>
              </td>
              <td className="border border-neutral-400 p-1.5 text-[#18181B]">
                {totalRagu} <span className="text-[7.5pt] font-sans font-normal">Tamu</span>
              </td>
              <td className="border border-neutral-400 p-1.5 text-[#18181B]">
                {totalTidakHadir} <span className="text-[7.5pt] font-sans font-normal">Tamu</span>
              </td>
              <td className="border border-neutral-400 p-1.5 text-[#18181B]">
                {totalBelum} <span className="text-[7.5pt] font-sans font-normal">Tamu</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TABEL DATA LENGKAP TAMU */}
      <table className="print-report-table w-full text-left text-[8pt] border-collapse border border-[#18181B] mb-4">
        <thead>
          <tr className="bg-neutral-100 text-[#18181B] border-b border-[#18181B]">
            <th className="border border-[#18181B] p-1.5 text-center w-8">No</th>
            <th className="border border-[#18181B] p-1.5">Nama Tamu Undangan</th>
            <th className="border border-[#18181B] p-1.5 text-center font-mono w-24">Kode Undangan</th>
            <th className="border border-[#18181B] p-1.5 text-center w-14">Batas Kuota</th>
            <th className="border border-[#18181B] p-1.5 text-center w-28">Status RSVP</th>
            <th className="border border-[#18181B] p-1.5 text-center w-20">Jml Hadir</th>
            <th className="border border-[#18181B] p-1.5 text-center w-28">Tgl Konfirmasi</th>
            <th className="border border-[#18181B] p-1.5 text-center w-24">Paraf Meja Tamu</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((tamu, idx) => {
            const rsvp = tamu.rsvp;
            const status = rsvp?.status;
            let statusLabel = "Belum Respon";
            let statusBg = "bg-neutral-100 text-neutral-700";

            if (status === "hadir") {
              statusLabel = "HADIR";
              statusBg = "bg-emerald-100 text-emerald-900";
            } else if (status === "ragu") {
              statusLabel = "RAGU";
              statusBg = "bg-amber-100 text-amber-900";
            } else if (status === "tidak_hadir") {
              statusLabel = "TIDAK HADIR";
              statusBg = "bg-rose-100 text-rose-900";
            }

            return (
              <tr
                key={tamu.id_tamu || idx}
                className={idx % 2 === 1 ? "bg-neutral-50/70" : "bg-white"}
              >
                <td className="border border-[#18181B] p-1.5 text-center font-mono">{idx + 1}</td>
                <td className="border border-[#18181B] p-1.5 font-bold text-[#18181B] break-words">
                  {tamu.nama_tamu}
                </td>
                <td className="border border-[#18181B] p-1.5 text-center font-mono font-bold tracking-wider">
                  {tamu.kode}
                </td>
                <td className="border border-[#18181B] p-1.5 text-center font-mono">
                  {tamu.kuota || 1} org
                </td>
                <td className="border border-[#18181B] p-1.5 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[7.5pt] font-black uppercase ${statusBg}`}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="border border-[#18181B] p-1.5 text-center font-mono font-bold">
                  {status === "hadir" ? `${rsvp?.jumlah_hadir || 1} org` : "-"}
                </td>
                <td className="border border-[#18181B] p-1.5 text-center text-[7.5pt]">
                  {formatPrintDate(rsvp?.tgl_konfirmasi)}
                </td>
                <td className="border border-[#18181B] p-1.5 text-center">
                  <span className="inline-block w-12 border-b border-dotted border-[#18181B] h-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* KOLOM TANDA TANGAN & PENGESAHAN */}
      <div className="pt-3 border-t border-[#18181B] flex items-start justify-between text-[8pt] print-avoid-break">
        <div className="max-w-xs text-[7.5pt] text-neutral-600 space-y-1">
          <p className="font-bold uppercase text-[#18181B]">Catatan Dokumen:</p>
          <p>
            1. Dokumen ini digenerate secara otomatis oleh modul pelaporan sistem WeddingMu sebagai dokumen resmi.
          </p>
          <p>
            2. Kolom Paraf Meja Tamu digunakan oleh petugas penerima tamu untuk verifikasi fisik di lokasi perayaan.
          </p>
          {printedBy && (
            <p>
              3. Dicetak oleh Administrator: <span className="font-mono font-bold text-[#18181B]">{printedBy}</span>
            </p>
          )}
        </div>

        <div className="text-center min-w-[200px]">
          <p className="text-neutral-700">Surakarta, {printDateOnly}</p>
          <p className="font-bold text-[#18181B] mt-0.5">Koordinator Penerima Tamu,</p>
          <div className="h-14" />
          <p className="font-bold text-[#18181B] border-t border-[#18181B] pt-1">
            ( ............................................................ )
          </p>
          <p className="text-[7.5pt] text-neutral-500">Panitia Pelaksana Acara</p>
        </div>
      </div>
    </div>
  );
}
