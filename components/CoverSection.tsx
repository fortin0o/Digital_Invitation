"use client";

import React, { useState } from "react";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

interface CoverSectionProps {
  guestName?: string;
  onOpen: () => void;
  isOpen: boolean;
}

export default function CoverSection({
  guestName = "Sahabat & Keluarga Tercinta",
  onOpen,
  isOpen,
}: CoverSectionProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 800);
  };

  if (isOpen) return null;

  return (
    <section
      className={`fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-[#FFFDF5] transition-all duration-700 ${
        isOpening ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Polka Dots */}
      <div className="absolute inset-0 neo-bg-pattern opacity-15 pointer-events-none" />

      {/* Floating Playful Decorative Stickers (Ambient) */}
      <div className="hidden sm:block absolute top-10 left-12 animate-neo-float">
        <NeoSticker label="CELEBRATE WITH US" color="yellow" rotate="-rotate-6" />
      </div>
      <div className="hidden sm:block absolute top-14 right-12 animate-neo-float" style={{ animationDelay: "1s" }}>
        <NeoSticker label="14 NOV 2026" color="cyan" rotate="rotate-6" />
      </div>
      <div className="hidden sm:block absolute bottom-12 left-16 animate-neo-float" style={{ animationDelay: "0.5s" }}>
        <NeoSticker label="WEDDING CEREMONY" color="pink" rotate="rotate-3" />
      </div>
      <div className="hidden sm:block absolute bottom-14 right-16 animate-neo-float" style={{ animationDelay: "1.5s" }}>
        <NeoSticker label="RECEPTION" color="green" rotate="-rotate-3" />
      </div>

      {/* Main Semi-Neobrutalist Card */}
      <div className="relative z-30 w-[calc(100%-2rem)] max-w-sm sm:max-w-md mx-auto text-center px-5 sm:px-8 py-7 sm:py-10 bg-white rounded-[28px] sm:rounded-[32px] border-[3px] border-[#18181B] shadow-[6px_6px_0px_#18181B] sm:shadow-[8px_8px_0px_#18181B] flex flex-col items-center">
        {/* Top Tag */}
        <div className="mb-3 sm:mb-4">
          <NeoSticker
            label="SPECIAL WEDDING INVITATION"
            color="yellow"
            rotate="-rotate-1"
            size="sm"
          />
        </div>

        <p className="font-display uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold text-[#FF5D8F] mb-1">
          WE&apos;RE GETTING MARRIED!
        </p>

        {/* Big Bold Headline */}
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#18181B] tracking-tight my-1.5 sm:my-2 leading-none">
          Arya <span className="text-[#FF5D8F]">&amp;</span> Sekar
        </h1>

        <p className="font-sans text-xs sm:text-sm text-[#52525B] font-semibold mt-1">
          Arya Suryo Wicaksono &amp; Sekar Arum Kinanti
        </p>

        <NeoDivider className="!my-2.5 sm:!my-3" />

        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 rounded-full bg-[#38BDF8] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-[10px] sm:text-xs font-bold mb-4 sm:mb-5 max-w-full">
          <span className="truncate">Sabtu, 14 Nov 2026 • Surakarta</span>
        </div>

        {/* Guest Greeting Box */}
        <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF5] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] mb-5 sm:mb-6 text-center">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#71717A] font-bold mb-1">
            Kepada Yth. Tamu Spesial Kami:
          </p>
          <p className="font-display text-lg sm:text-2xl text-[#18181B] font-extrabold break-words">
            {guestName}
          </p>
          <p className="text-[10px] sm:text-[11px] text-[#71717A] mt-1 font-medium">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran Anda.
          </p>
        </div>

        {/* Open Button */}
        <button
          onClick={handleOpen}
          type="button"
          disabled={isOpening}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FF5D8F] hover:bg-[#FF4075] text-[#18181B] font-bold text-xs uppercase tracking-wider border-[2.5px] border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-[#18181B]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Buka Undangan</span>
        </button>
      </div>
    </section>
  );
}
