import React from "react";
import NeoSticker from "@/components/ui/NeoSticker";
import NeoDivider from "@/components/ui/NeoDivider";
import { ExtraInvitationContent } from "@/lib/invitationContentConfig";

interface QuoteSectionProps {
  extraContent?: ExtraInvitationContent | null;
}

export default function QuoteSection({ extraContent }: QuoteSectionProps) {
  const romanticQuote =
    extraContent?.quoteRomantic?.trim() ||
    "Dua hati, satu janji suci, melangkah bersama menuju masa depan yang penuh cinta, tawa, dan keberkahan.";

  const verseQuote =
    extraContent?.quoteVerse?.trim() ||
    "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.";

  const quoteSource = extraContent?.quoteSource?.trim() || "QS. Ar-Rum : 21";

  return (
    <section className="relative w-full py-6 sm:py-8 px-4 text-center fade-up-element">
      <div className="max-w-md mx-auto relative z-10 px-4 sm:px-8 py-6 sm:py-8 rounded-2xl sm:rounded-3xl bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B]">
        {/* Top Sticker */}
        <div className="mb-4">
          <NeoSticker
            label="OUR LOVE STORY"
            color="purple"
            rotate="-rotate-1"
            size="sm"
          />
        </div>

        <p className="font-display font-bold text-sm sm:text-base text-[#FF5D8F] mb-2 leading-snug">
          &ldquo;{romanticQuote}&rdquo;
        </p>

        <p className="font-sans text-xs sm:text-sm text-[#52525B] leading-relaxed mb-4 font-normal">
          &ldquo;{verseQuote}&rdquo;
        </p>

        <NeoDivider className="!my-2" />

        <div className="inline-flex mt-2">
          <NeoSticker
            label={quoteSource}
            color="yellow"
            rotate="rotate-2"
            size="sm"
          />
        </div>
      </div>
    </section>
  );
}
