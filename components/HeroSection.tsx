import React from "react";
import Image from "next/image";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";
import { UndanganData } from "@/lib/guestInvitation";

interface HeroSectionProps {
  undangan?: UndanganData | null;
}

export default function HeroSection({ undangan }: HeroSectionProps) {
  const coupleShortPria = undangan?.nama_pria ? undangan.nama_pria.trim().split(" ")[0] : "Arya";
  const coupleShortWanita = undangan?.nama_wanita ? undangan.nama_wanita.trim().split(" ")[0] : "Sekar";
  const coupleFull =
    undangan?.nama_pria && undangan?.nama_wanita
      ? `${undangan.nama_pria} & ${undangan.nama_wanita}`
      : "Arya Suryo Wicaksono & Sekar Arum Kinanti";

  const dateLabel = (() => {
    if (!undangan?.tgl_acara) return "14 November 2026 • Surakarta";
    try {
      const d = new Date(undangan.tgl_acara);
      if (isNaN(d.getTime())) return "14 November 2026 • Surakarta";
      const venueCity = undangan.tempat ? ` • ${undangan.tempat.split(",")[0]}` : "";
      return (
        new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d) + venueCity
      );
    } catch {
      return "14 November 2026 • Surakarta";
    }
  })();

  return (
    <header className="relative w-full overflow-hidden pt-8 pb-6 sm:pt-10 sm:pb-8 px-4 text-center">
      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center">
        {/* Top Playful Badge */}
        <div className="mb-4 animate-neo-wiggle">
          <NeoSticker
            label="THE WEDDING CELEBRATION"
            color="yellow"
            rotate="-rotate-2"
          />
        </div>

        {/* Couple Big Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#18181B] tracking-tight my-2 leading-none">
          {coupleShortPria} <span className="text-[#FF5D8F]">&amp;</span> {coupleShortWanita}
        </h1>

        <p className="font-sans text-xs sm:text-sm text-[#52525B] font-semibold">
          {coupleFull}
        </p>

        <div className="mt-2">
          <NeoSticker
            label={dateLabel}
            color="cyan"
            rotate="rotate-1"
            size="sm"
          />
        </div>

        <NeoDivider className="!my-2 sm:!my-4" />

        {/* Featured Arch Couple Image in Semi-Neobrutalist Frame */}
        <div className="relative mt-2 mb-4 w-64 sm:w-72 aspect-[3/4] p-4 rounded-[36px] bg-white border-[3px] border-[#18181B] shadow-[8px_8px_0px_#18181B] transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_#18181B]">
          <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#18181B]">
            <Image
              src="/images/couple.jpg"
              alt={`The Wedding of ${coupleShortPria} & ${coupleShortWanita}`}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 640px) 280px, 320px"
            />
          </div>

          {/* Fun Corner Stickers on Frame */}
          <div className="absolute -top-2 -right-2 z-20">
            <NeoSticker label="IN LOVE" color="pink" rotate="rotate-6" size="sm" />
          </div>

          <div className="absolute -bottom-2 -left-2 z-20">
            <NeoSticker label="FOREVER" color="green" rotate="-rotate-6" size="sm" />
          </div>
        </div>

        <p className="font-sans text-xs text-[#52525B] max-w-xs leading-relaxed mt-2 font-medium">
          Dengan penuh rasa syukur dan kebahagiaan, kami mengundang Anda untuk menjadi bagian dari perayaan awal perjalanan baru hidup kami.
        </p>
      </div>
    </header>
  );
}
