import React from "react";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

export default function QuoteSection() {
  return (
    <section className="relative w-full py-8 px-4 text-center fade-up-element">
      <div className="max-w-md mx-auto relative z-10 px-6 py-7 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B]">
        {/* Top Sticker */}
        <div className="mb-3">
          <NeoSticker
            label="OUR LOVE STORY"
            color="purple"
            rotate="-rotate-1"
            size="sm"
          />
        </div>

        <p className="font-display font-bold text-sm sm:text-base text-[#FF5D8F] mb-3 leading-snug">
          &ldquo;Dua hati, satu janji suci, melangkah bersama menuju masa depan yang penuh cinta, tawa, dan keberkahan.&rdquo;
        </p>

        <p className="font-sans text-xs sm:text-sm text-[#52525B] leading-relaxed mb-4 font-normal">
          &ldquo;Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
        </p>

        <NeoDivider className="!my-2" />

        <div className="inline-flex mt-1">
          <NeoSticker
            label="QS. Ar-Rum : 21"
            color="yellow"
            rotate="rotate-2"
            size="sm"
          />
        </div>
      </div>
    </section>
  );
}
