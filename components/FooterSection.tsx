import React from "react";
import Link from "next/link";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

export default function FooterSection() {
  return (
    <footer className="relative w-full pt-16 pb-24 px-4 text-center overflow-hidden">
      <BotanicalCorner position="bottom-left" size={120} opacity={0.5} />
      <BotanicalCorner position="bottom-right" size={120} opacity={0.5} />

      <div className="max-w-md mx-auto relative z-10">
        <div className="fade-up-element px-6 py-8 rounded-3xl bg-[#FFFDF9]/80 backdrop-blur-sm border border-[#C5A059]/35 mb-8 shadow-sm">
          <p className="font-serif italic text-sm text-[#8A6B53] mb-2">
            Atur Panuwun (Ungkapan Terima Kasih)
          </p>
          <p className="font-sans text-xs text-[#3D261C] leading-relaxed font-light mb-6">
            Mboten wonten ingkang saged kula aturaken kajawi raos panuwun ingkang tanpa pepindhan awit saking rawuh saha donga pangestu panjenengan sedaya.
          </p>

          <p className="font-serif italic text-xs text-[#8A6B53] mb-4">
            Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh
          </p>

          <BotanicalDivider width={120} className="!my-3" />

          <p className="font-sans text-xs uppercase tracking-widest text-[#8A6B53] mt-4 mb-1">
            Kulawarga Ageng
          </p>
          <h3 className="font-serif text-3xl text-[#3D261C] font-normal tracking-wide">
            Arya <span className="italic text-[#C5A059]">&amp;</span> Sekar
          </h3>
        </div>

        <p className="font-sans text-[10px] tracking-wider text-[#8A6B53]/70 uppercase">
          &copy; 2026 Pawiwahan Ageng Arya &amp; Sekar. All rights reserved.
        </p>

        <div className="mt-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9]/90 border border-[#C5A059]/30 text-[11px] text-[#8A6B53] hover:text-[#3D261C] hover:border-[#5C3A21] hover:bg-[#FAF6F0] transition-all shadow-2xs"
          >
            <svg className="w-3 h-3 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Login Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
