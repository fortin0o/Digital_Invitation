import React from "react";
import BotanicalDivider from "./BotanicalDivider";
import GununganOrnament from "./GununganOrnament";

export default function QuoteSection() {
  return (
    <section className="relative w-full py-12 px-6 text-center fade-up-element">
      <div className="max-w-md mx-auto relative z-10 px-6 sm:px-8 py-8 rounded-3xl bg-[#FFFDF9]/85 backdrop-blur-sm border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)]">
        {/* Decorative Gunungan Top Icon */}
        <div className="mx-auto w-8 h-8 mb-3 flex items-center justify-center">
          <GununganOrnament size={28} variant="gold" />
        </div>

        {/* Javanese Filosofi Tresna */}
        <p className="font-serif italic text-sm text-[#C5A059] tracking-wider mb-3">
          &ldquo;Witing tresna jalaran saka kulina, tumangkar dadi tresna kang sejati lumantar janji suci.&rdquo;
        </p>

        {/* Verse */}
        <p className="font-serif text-sm sm:text-base text-[#3D261C] leading-relaxed mb-4 font-light">
          &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
        </p>

        <BotanicalDivider width={100} className="!my-2" />

        <p className="font-sans text-[11px] tracking-widest text-[#8A6B53] font-medium uppercase mt-2">
          QS. Ar-Rum : 21
        </p>
      </div>
    </section>
  );
}
