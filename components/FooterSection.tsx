import React from "react";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

export default function FooterSection() {
  return (
    <footer className="relative w-full pt-6 pb-8 sm:pt-8 sm:pb-10 px-4 text-center overflow-hidden">
      <div className="max-w-md mx-auto relative z-10">
        <div className="fade-up-element px-6 py-6 sm:py-8 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] mb-4">
          <div className="mb-2">
            <NeoSticker
              label="THANK YOU"
              color="pink"
              rotate="-rotate-2"
              size="sm"
            />
          </div>

          <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight my-2">
            Arya <span className="text-[#FF5D8F]">&amp;</span> Sekar
          </h3>

          <p className="font-sans text-xs text-[#52525B] leading-relaxed font-medium mb-4">
            Merupakan suatu kebahagiaan dan kehormatan yang teramat besar bagi kami atas kehadiran dan untaian doa restu dari Bapak/Ibu/Saudara/i sekalian.
          </p>

          <NeoDivider className="!my-4" />

          <p className="font-sans text-xs text-[#71717A] font-semibold mt-4">
            Sampai jumpa di hari perayaan kami.
          </p>
        </div>

        <p className="font-sans text-[11px] font-bold text-[#71717A]">
          &copy; 2026 The Wedding of Arya &amp; Sekar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
