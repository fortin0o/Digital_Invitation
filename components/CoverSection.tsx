"use client";

import React, { useState } from "react";
import GununganOrnament from "./GununganOrnament";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

interface CoverSectionProps {
  guestName?: string;
  onOpen: () => void;
  isOpen: boolean;
}

export default function CoverSection({
  guestName = "Tamu Undangan",
  onOpen,
  isOpen,
}: CoverSectionProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 1100);
  };

  if (isOpen) return null;

  return (
    <section
      className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-[#FAF6F0] transition-opacity duration-1000 ${
        isOpening ? "pointer-events-none" : ""
      }`}
    >
      {/* Background Subtle Batik Watermark */}
      <div className="absolute inset-0 javanese-bg-pattern opacity-40 pointer-events-none" />

      {/* ========================================================
          PARALLAX CURTAINS / GATES (KAYON KEMBAR GUNUNGAN KERATON)
          Saat dibuka, sayap kiri bergeser ke kiri dan sayap kanan ke kanan
          dengan kedalaman parallax dramatis
          ======================================================== */}
      {/* Left Parallax Gate */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1/2 z-20 pointer-events-none flex items-center justify-end overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpening
            ? "-translate-x-full opacity-0 -rotate-3 scale-95"
            : "translate-x-0 opacity-100 rotate-0 scale-100"
        }`}
      >
        <div className="relative pr-2 sm:pr-8 translate-x-12 sm:translate-x-16">
          <GununganOrnament size={260} variant="gold" className="opacity-40 sm:opacity-55 drop-shadow-2xl" />
        </div>
      </div>

      {/* Right Parallax Gate */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-1/2 z-20 pointer-events-none flex items-center justify-start overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpening
            ? "translate-x-full opacity-0 rotate-3 scale-95"
            : "translate-x-0 opacity-100 rotate-0 scale-100"
        }`}
      >
        <div className="relative pl-2 sm:pl-8 -translate-x-12 sm:-translate-x-16">
          <GununganOrnament size={260} variant="gold" flipped className="opacity-40 sm:opacity-55 drop-shadow-2xl" />
        </div>
      </div>

      {/* Javanese Ukiran Corner Accents */}
      <BotanicalCorner position="top-left" size={130} opacity={0.65} className="w-24 h-24 sm:w-36 sm:h-36 z-10" />
      <BotanicalCorner position="bottom-right" size={130} opacity={0.65} className="w-24 h-24 sm:w-36 sm:h-36 z-10" />
      <BotanicalCorner position="top-right" size={110} opacity={0.4} className="hidden sm:block z-10" />
      <BotanicalCorner position="bottom-left" size={110} opacity={0.4} className="hidden sm:block z-10" />

      {/* Center Serat Sedhahan (Royal Invitation Card) */}
      <div
        className={`relative z-30 w-full max-w-sm sm:max-w-md mx-4 text-center px-6 sm:px-9 py-8 sm:py-10 bg-[#FFFDF9]/95 backdrop-blur-md rounded-3xl border-2 border-[#C5A059]/40 shadow-[0_16px_50px_rgba(61,38,28,0.12)] flex flex-col items-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpening
            ? "scale-105 -translate-y-12 opacity-0"
            : "scale-100 translate-y-0 opacity-100"
        }`}
      >
        {/* Gunungan Crown Top Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mb-2 rounded-full bg-[#FAF6F0] border border-[#C5A059]/50 flex items-center justify-center p-2 shadow-inner">
          <GununganOrnament size={36} variant="gold" />
        </div>

        {/* Javanese Salutation */}
        <p className="font-serif italic text-xs sm:text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
          Serat Sedhahan Pawiwahan
        </p>

        <h2 className="font-serif text-xs tracking-[0.25em] text-[#C5A059] uppercase font-semibold">
          Pawiwahan Ageng
        </h2>

        <BotanicalDivider width={120} className="!my-2" />

        {/* Royal Couple Names */}
        <h1 className="font-serif text-3xl sm:text-5xl text-[#3D261C] font-normal tracking-wide my-2 leading-tight">
          Arya <span className="font-serif italic text-2xl sm:text-4xl text-[#C5A059]">&amp;</span> Sekar
        </h1>

        <p className="font-serif text-xs sm:text-sm text-[#8A6B53] italic">
          Raden Mas Arya Suryo Wicaksono <br />
          &amp; Raden Ajeng Sekar Arum Kinanti
        </p>

        <p className="font-sans text-[10px] sm:text-xs tracking-widest text-[#C5A059] font-medium uppercase mt-2 mb-5">
          Setu Legi, 14 November 2026
        </p>

        {/* Guest Greeting Box (Katur Dhumateng) */}
        <div className="w-full max-w-xs p-3.5 sm:p-4 rounded-2xl bg-[#FAF6F0] border border-[#C5A059]/30 mb-5 relative shadow-sm">
          <p className="font-sans text-[10px] uppercase tracking-wider text-[#8A6B53] mb-1">
            Katur Dhumateng Panjenenganipun:
          </p>
          <p className="font-serif text-lg sm:text-xl text-[#3D261C] font-medium tracking-wide">
            {guestName}
          </p>
          <p className="font-sans text-[9px] text-[#8A6B53]/80 mt-1 italic">
            *Nyuwun pangapunten menawi wonten kalepatan nyerat asma/gelar
          </p>
        </div>

        {/* Open Invitation Pill Button */}
        <button
          onClick={handleOpen}
          type="button"
          disabled={isOpening}
          className="group relative inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full border-2 border-[#C5A059] text-[#FFFDF9] bg-[#5C3A21] hover:bg-[#3D261C] shadow-[0_4px_20px_rgba(92,58,33,0.3)] active:scale-95 transition-all duration-300 font-sans text-xs uppercase tracking-widest font-medium cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-[#EAD7A8] group-hover:scale-110 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Buka Serat Sedhahan</span>
        </button>
      </div>
    </section>
  );
}
