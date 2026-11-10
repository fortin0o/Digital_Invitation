import React from "react";
import Image from "next/image";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

export default function HeroSection() {
  return (
    <header className="relative w-full overflow-hidden pt-10 pb-12 px-4 text-center">
      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center">
        {/* Top Playful Badge */}
        <div className="mb-3 animate-neo-wiggle">
          <NeoSticker
            label="THE WEDDING CELEBRATION"
            color="yellow"
            rotate="-rotate-2"
          />
        </div>

        {/* Couple Big Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#18181B] tracking-tight my-1.5 leading-none">
          Arya <span className="text-[#FF5D8F]">&amp;</span> Sekar
        </h1>

        <p className="font-sans text-xs sm:text-sm text-[#52525B] font-semibold">
          Arya Suryo Wicaksono &amp; Sekar Arum Kinanti
        </p>

        <div className="mt-3">
          <NeoSticker
            label="14 November 2026 • Surakarta"
            color="cyan"
            rotate="rotate-1"
            size="sm"
          />
        </div>

        <NeoDivider className="!my-3" />

        {/* Featured Arch Couple Image in Semi-Neobrutalist Frame */}
        <div className="relative mt-4 mb-6 w-64 sm:w-72 aspect-[3/4] p-3 rounded-[36px] bg-white border-[3px] border-[#18181B] shadow-[8px_8px_0px_#18181B] transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_#18181B]">
          <div className="relative w-full h-full rounded-[26px] overflow-hidden border-2 border-[#18181B]">
            <Image
              src="/images/couple.jpg"
              alt="The Wedding of Arya & Sekar"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 640px) 280px, 320px"
            />
          </div>

          {/* Fun Corner Stickers on Frame */}
          <div className="absolute -top-3 -right-3 z-20">
            <NeoSticker label="IN LOVE" color="pink" rotate="rotate-6" size="sm" />
          </div>

          <div className="absolute -bottom-3 -left-3 z-20">
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
