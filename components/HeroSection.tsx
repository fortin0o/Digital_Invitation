import React from "react";
import Image from "next/image";
import GununganOrnament from "./GununganOrnament";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

export default function HeroSection() {
  return (
    <header className="relative w-full overflow-hidden pt-12 pb-16 px-4 text-center">
      {/* Javanese Ukiran Corner Accents */}
      <BotanicalCorner position="top-left" size={120} opacity={0.55} />
      <BotanicalCorner position="top-right" size={120} opacity={0.55} />

      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center">
        {/* Subtle Top Gunungan Icon */}
        <div className="mb-2">
          <GununganOrnament size={38} variant="gold" />
        </div>

        {/* Javanese subheader */}
        <p className="font-serif italic text-xs sm:text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
          Pawiwahan Ageng
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl text-[#3D261C] font-normal tracking-wide my-1.5 leading-tight">
          Arya <span className="font-serif italic text-3xl sm:text-4xl text-[#C5A059]">&amp;</span> Sekar
        </h1>

        <p className="font-serif italic text-xs text-[#8A6B53] mb-1">
          Raden Mas Arya Suryo Wicaksono &amp; Raden Ajeng Sekar Arum Kinanti
        </p>

        <p className="font-sans text-[11px] sm:text-xs tracking-widest text-[#C5A059] font-medium uppercase mb-4">
          Setu Legi, 14 November 2026 • Surakarta Hadiningrat
        </p>

        <BotanicalDivider width={140} className="!my-1" />

        {/* Featured Arch Royal Couple Image with Sogan & Gold Frame */}
        <div className="relative mt-6 mb-8 w-64 sm:w-72 aspect-[3/4] p-2.5 rounded-t-[140px] rounded-b-3xl bg-[#FFFDF9] border-2 border-[#C5A059]/40 shadow-[0_12px_36px_rgba(61,38,28,0.12)]">
          <div className="relative w-full h-full rounded-t-[132px] rounded-b-2xl overflow-hidden">
            <Image
              src="/images/couple.jpg"
              alt="Pawiwahan Ageng Arya & Sekar"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 640px) 280px, 320px"
            />
          </div>
          {/* Gold seal overlay at bottom center */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#C5A059] shadow-md text-[#3D261C] text-[11px] font-serif tracking-widest whitespace-nowrap flex items-center gap-1.5">
            <span className="text-[#C5A059]">✦</span>
            <span>14 November 2026</span>
            <span className="text-[#C5A059]">✦</span>
          </div>
        </div>

        <p className="font-sans text-xs text-[#8A6B53] max-w-xs leading-relaxed mt-2 font-light">
          Nyuwun donga pangestu dhumateng Bapak/Ibu/Sedherek sedaya, mugi tansah pinaringan karaharjan lan katentreman lahir batos.
        </p>
      </div>
    </header>
  );
}
