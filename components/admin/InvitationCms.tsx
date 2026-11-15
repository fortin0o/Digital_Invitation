"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatWriteErrorMessage } from "@/lib/adminAuth";
import {
  WaShareConfig,
  getStoredWaConfig,
  saveStoredWaConfig,
  buildWaMessage,
  DEFAULT_WA_TEMPLATE,
  DEFAULT_PRODUCTION_DOMAIN,
} from "@/lib/invitationShareConfig";

export interface UndanganCmsData {
  id_undangan: string;
  slug: string;
  nama_pria?: string | null;
  nama_wanita?: string | null;
  tgl_acara?: string | null;
  tempat?: string | null;
  alamat?: string | null;
  link_maps?: string | null;
}

interface InvitationCmsProps {
  undangan: UndanganCmsData | null;
  onSaved: () => void;
}

// Helper format ISO string to input datetime-local format (YYYY-MM-DDTHH:mm)
function toInputDateTime(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export default function InvitationCms({ undangan, onSaved }: InvitationCmsProps) {
  const [namaPria, setNamaPria] = useState(undangan?.nama_pria || "");
  const [namaWanita, setNamaWanita] = useState(undangan?.nama_wanita || "");
  const [slug, setSlug] = useState(undangan?.slug || "");
  const [tglAcara, setTglAcara] = useState(() => toInputDateTime(undangan?.tgl_acara));
  const [tempat, setTempat] = useState(undangan?.tempat || "");
  const [alamat, setAlamat] = useState(undangan?.alamat || "");
  const [linkMaps, setLinkMaps] = useState(undangan?.link_maps || "");
  const [waConfig, setWaConfig] = useState<WaShareConfig>(getStoredWaConfig);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate clean slug from groom & bride names
  const handleGenerateSlug = () => {
    const groomShort = namaPria.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const brideShort = namaWanita.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (groomShort && brideShort) {
      setSlug(`${groomShort}-dan-${brideShort}`);
    } else {
      setSlug("wedding-celebration");
    }
  };

  // Format date preview in Indonesian
  const formattedDatePreview = (() => {
    if (!tglAcara) return "Belum diatur";
    try {
      const d = new Date(tglAcara);
      if (isNaN(d.getTime())) return "Format tanggal tidak valid";
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(d);
    } catch {
      return tglAcara;
    }
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!undangan?.id_undangan) {
      alert("ID Undangan tidak ditemukan di database.");
      return;
    }

    if (!slug.trim()) {
      alert("Slug URL undangan tidak boleh kosong!");
      return;
    }

    setSaving(true);
    try {
      // Format datetime to ISO
      let isoDate: string | null = null;
      if (tglAcara) {
        const d = new Date(tglAcara);
        if (!isNaN(d.getTime())) {
          isoDate = d.toISOString();
        }
      }

      const updatePayload = {
        slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
        nama_pria: namaPria.trim(),
        nama_wanita: namaWanita.trim(),
        tgl_acara: isoDate,
        tempat: tempat.trim(),
        alamat: alamat.trim(),
        link_maps: linkMaps.trim() || null,
      };

      const { data, error } = await supabase
        .from("undangan")
        .update(updatePayload)
        .eq("id_undangan", undangan.id_undangan)
        .select();

      if (error) {
        alert(formatWriteErrorMessage("menyimpan data undangan", error));
      } else if (!data || data.length === 0) {
        alert(
          "Pembaruan tidak tersimpan: pastikan akun Anda memiliki izin admin atau data acara masih ada di database."
        );
      } else {
        saveStoredWaConfig(waConfig);
        showToast("Perubahan isi undangan berhasil disimpan & langsung aktif!");
        onSaved();
      }
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Gagal menyimpan perubahan."));
    } finally {
      setSaving(false);
    }
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = slug ? `${currentOrigin}/${slug}` : `${currentOrigin}/`;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-[#18181B] text-white text-xs font-bold shadow-[4px_4px_0px_#FFE600] animate-in fade-in border-2 border-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2EE59D] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFE600] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full bg-white border border-[#18181B] text-[10px] font-black uppercase tracking-wider text-[#18181B] mb-1">
            CMS Management
          </span>
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#18181B]">
            Edit Konten &amp; Informasi Acara
          </h2>
          <p className="text-xs text-[#18181B]/80 font-medium mt-1">
            Ubah nama pengantin, waktu acara, gedung, dan peta lokasi secara realtime tanpa perlu edit kode sumber.
          </p>
        </div>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFFDF5] border-2 border-[#18181B] text-[#18181B] text-xs font-extrabold shadow-[2px_2px_0px_#18181B] transition-all cursor-pointer whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>Buka Undangan Web &rarr;</span>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Mempelai & URL Slug */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181B]/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#FF5D8F] text-[#18181B] font-black text-xs flex items-center justify-center border-2 border-[#18181B]">
                1
              </span>
              <h3 className="font-display text-base font-extrabold text-[#18181B]">
                Data Pasangan Pengantin
              </h3>
            </div>
            <span className="text-[11px] text-[#71717A] font-bold">Mempelai Pria &amp; Wanita</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Nama Pengantin Pria
              </label>
              <input
                type="text"
                required
                value={namaPria}
                onChange={(e) => setNamaPria(e.target.value)}
                placeholder="Contoh: Arya Suryo Wicaksono"
                className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
              />
              <p className="text-[10px] text-[#71717A] mt-1 font-medium">
                Digunakan pada judul cover, ucapan selamat, dan kartu mempelai.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Nama Pengantin Wanita
              </label>
              <input
                type="text"
                required
                value={namaWanita}
                onChange={(e) => setNamaWanita(e.target.value)}
                placeholder="Contoh: Sekar Arum Kinanti"
                className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
              />
              <p className="text-[10px] text-[#71717A] mt-1 font-medium">
                Digunakan pada judul cover, ucapan selamat, dan kartu mempelai.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs uppercase tracking-wider text-[#18181B] font-extrabold">
                Slug URL Undangan
              </label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="text-[10px] font-black text-[#FF5D8F] hover:underline cursor-pointer"
              >
                + Buat Otomatis dari Nama
              </button>
            </div>
            <div className="flex items-center">
              <span className="hidden sm:inline-flex px-3 py-2.5 rounded-l-xl bg-[#F4F4F5] border-2 border-r-0 border-[#18181B] text-xs font-mono font-bold text-[#71717A] select-none shrink-0">
                {currentOrigin}/
              </span>
              <span className="sm:hidden px-3 py-2.5 rounded-l-xl bg-[#F4F4F5] border-2 border-r-0 border-[#18181B] text-xs font-mono font-bold text-[#71717A] select-none shrink-0">
                /
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="arya-dan-sekar"
                className="flex-1 min-w-0 py-2.5 px-3 sm:px-4 rounded-r-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-mono font-bold text-[#18181B] outline-none"
              />
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-medium">
              Format tautan unik website pernikahan Anda (contoh: <code>{slug ? `${currentOrigin}/${slug}` : "nama-pria-dan-wanita"}</code>).
            </p>
          </div>
        </div>

        {/* Card 2: Jadwal & Countdown */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181B]/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#38BDF8] text-[#18181B] font-black text-xs flex items-center justify-center border-2 border-[#18181B]">
                2
              </span>
              <h3 className="font-display text-base font-extrabold text-[#18181B]">
                Jadwal &amp; Waktu Acara
              </h3>
            </div>
            <span className="text-[11px] text-[#71717A] font-bold">Countdown Timer &amp; Kalender</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Tanggal &amp; Waktu Acara
              </label>
              <input
                type="datetime-local"
                required
                value={tglAcara}
                onChange={(e) => setTglAcara(e.target.value)}
                className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Pratinjau Format Tanggal
              </label>
              <div className="py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] text-xs font-bold text-[#18181B] min-h-[42px] flex items-center">
                <span>{formattedDatePreview}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#71717A] font-medium">
            Waktu ini otomatis mengontrol <strong>Countdown Timer</strong> (Hari, Jam, Menit, Detik) di web undangan.
          </p>
        </div>

        {/* Card 3: Lokasi & Maps */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181B]/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#2EE59D] text-[#18181B] font-black text-xs flex items-center justify-center border-2 border-[#18181B]">
                3
              </span>
              <h3 className="font-display text-base font-extrabold text-[#18181B]">
                Lokasi &amp; Peta Navigasi
              </h3>
            </div>
            <span className="text-[11px] text-[#71717A] font-bold">Venue &amp; Google Maps</span>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
              Nama Gedung / Tempat
            </label>
            <input
              type="text"
              required
              value={tempat}
              onChange={(e) => setTempat(e.target.value)}
              placeholder="Contoh: Sasana Pendopo Ageng / Gedung Serbaguna Wijaya"
              className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
              Alamat Lengkap
            </label>
            <textarea
              rows={2}
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Contoh: Jl. Slamet Riyadi No. 45, Kampung Baru, Kec. Pasar Kliwon, Kota Surakarta"
              className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-bold text-[#18181B] outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs uppercase tracking-wider text-[#18181B] font-extrabold">
                Tautan Google Maps
              </label>
              {linkMaps && (
                <a
                  href={linkMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-[#38BDF8] hover:underline"
                >
                  Uji Tautan Maps &rarr;
                </a>
              )}
            </div>
            <input
              type="url"
              value={linkMaps}
              onChange={(e) => setLinkMaps(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-mono font-bold text-[#18181B] outline-none"
            />
            <p className="text-[10px] text-[#71717A] mt-1 font-medium">
              Link ini dibuka saat tamu menekan tombol <strong>&ldquo;Buka Google Maps&rdquo;</strong> di undangan.
            </p>
          </div>
        </div>

        {/* Card 4: WhatsApp Message & Base Domain Share Settings */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#18181B]/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#2EE59D] text-[#18181B] font-black text-xs flex items-center justify-center border-2 border-[#18181B]">
                4
              </span>
              <h3 className="font-display text-base font-extrabold text-[#18181B]">
                Format Pesan WhatsApp &amp; Domain Tautan
              </h3>
            </div>
            <span className="text-[11px] text-[#71717A] font-bold">Kirim Undangan ke HP</span>
          </div>

          <div className="space-y-4">
            {/* Domain Selection */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#18181B] mb-1 font-extrabold">
                Domain Tautan untuk Share Undangan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#18181B]">
                <label className="flex items-start gap-2 p-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] cursor-pointer">
                  <input
                    type="radio"
                    name="domainMode"
                    value="production"
                    checked={waConfig.domainMode === "production"}
                    onChange={() =>
                      setWaConfig((prev) => ({ ...prev, domainMode: "production" }))
                    }
                    className="accent-[#18181B] mt-0.5"
                  />
                  <div>
                    <span className="font-black text-[#18181B]">{DEFAULT_PRODUCTION_DOMAIN}</span>
                    <span className="ml-2 text-[9px] bg-[#FFE600] text-[#18181B] px-1.5 py-0.5 rounded font-black border border-[#18181B]">
                      Rekomendasi
                    </span>
                    <p className="text-[10px] text-[#71717A] font-medium mt-1">
                      Link bisa dibuka di HP penguji &amp; tamu meskipun admin sedang membuka via laptop.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-3 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] cursor-pointer">
                  <input
                    type="radio"
                    name="domainMode"
                    value="auto"
                    checked={waConfig.domainMode === "auto"}
                    onChange={() =>
                      setWaConfig((prev) => ({ ...prev, domainMode: "auto" }))
                    }
                    className="accent-[#18181B] mt-0.5"
                  />
                  <div>
                    <span className="font-black text-[#18181B]">Otomatis Sesuai Browser</span>
                    <p className="text-[10px] text-[#71717A] font-medium mt-1">
                      Mengikuti domain/port yang sedang aktif di tab browser Anda saat ini.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Template Message */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs uppercase tracking-wider text-[#18181B] font-extrabold">
                  Template Teks Pesan WhatsApp
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setWaConfig((prev) => ({
                      ...prev,
                      template: DEFAULT_WA_TEMPLATE,
                    }))
                  }
                  className="text-[10px] font-black text-rose-700 hover:underline cursor-pointer"
                >
                  Reset ke Teks Standar
                </button>
              </div>

              <textarea
                rows={5}
                value={waConfig.template}
                onChange={(e) =>
                  setWaConfig((prev) => ({ ...prev, template: e.target.value }))
                }
                className="w-full py-2.5 px-3 sm:px-4 rounded-xl bg-[#FFFDF5] border-2 border-[#18181B] focus:bg-white text-xs font-sans font-medium text-[#18181B] outline-none resize-none leading-relaxed"
              />
              <p className="text-[10px] text-[#71717A] mt-1 font-medium">
                Gunakan tag <code>&#123;nama&#125;</code> (nama tamu), <code>&#123;link&#125;</code> (link undangan), dan <code>&#123;mempelai&#125;</code> (nama mempelai).
              </p>
            </div>

            {/* Live Preview */}
            <div className="p-4 rounded-2xl bg-[#DCF8C6] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-xs font-sans text-[#18181B] whitespace-pre-wrap break-words break-all leading-relaxed">
              <span className="block text-[10px] uppercase font-black text-[#71717A] mb-1">
                Pratinjau Pesan:
              </span>
              {buildWaMessage(
                "Bapak Ahmad Subagyo",
                "88231920",
                slug,
                namaPria && namaWanita ? `${namaPria.split(" ")[0]} & ${namaWanita.split(" ")[0]}` : "Arya & Sekar",
                waConfig
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-extrabold text-[#18181B]">
              Simpan dan Publikasikan Perubahan
            </p>
            <p className="text-[11px] text-[#71717A] font-medium">
              Perubahan akan langsung terpasang pada tampilan publik undangan.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-[#FFE600] hover:bg-[#FFD700] border-2 border-[#18181B] text-[#18181B] text-xs font-black shadow-[3px_3px_0px_#18181B] hover:shadow-[4px_4px_0px_#18181B] transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Simpan Perubahan Acara</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

