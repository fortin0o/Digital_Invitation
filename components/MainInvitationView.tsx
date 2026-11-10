"use client";

import React, { useState } from "react";
import CoverSection from "./CoverSection";
import HeroSection from "./HeroSection";
import QuoteSection from "./QuoteSection";
import CoupleSection from "./CoupleSection";
import EventSection from "./EventSection";
import GallerySection from "./GallerySection";
import RsvpSection from "./RsvpSection";
import DigitalGiftSection from "./DigitalGiftSection";
import GuestbookSection from "./GuestbookSection";
import FooterSection from "./FooterSection";
import AudioPlayer from "./AudioPlayer";
import ScrollFadeProvider from "./ScrollFadeProvider";
import NeoSticker from "./NeoSticker";

interface TamuData {
  id_tamu: string;
  id_undangan: string;
  nama_tamu: string;
  kode: string;
  kuota: number;
}

interface UndanganData {
  id_undangan: string;
  slug: string;
  nama_pria: string;
  nama_wanita: string;
  tgl_acara: string;
  tempat: string;
  alamat: string;
  link_maps?: string | null;
}

interface MainInvitationViewProps {
  tamu: TamuData | null;
  guestCode: string;
  undangan: UndanganData | null;
}

export default function MainInvitationView({
  tamu,
  guestCode,
  undangan,
}: MainInvitationViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const guestName = tamu ? tamu.nama_tamu : "Sahabat & Keluarga Tercinta";

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ScrollFadeProvider>
      {/* Cover / Opening Screen */}
      <CoverSection
        isOpen={isOpen}
        onOpen={handleOpenInvitation}
        guestName={guestName}
      />

      {/* Main Invitation Layout */}
      <div className="w-full min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-start relative">
        {/* Background Dots */}
        <div className="absolute inset-0 neo-bg-pattern opacity-10 pointer-events-none fixed" />

        {/* Desktop Ambient Decorative Backdrop */}
        <div className="hidden lg:block fixed top-12 left-12 pointer-events-none select-none z-10">
          <div className="mb-2">
            <NeoSticker
              icon="💒"
              label="WEDDING CELEBRATION"
              color="yellow"
              rotate="-rotate-3"
            />
          </div>
          <h2 className="font-display font-extrabold text-4xl text-[#18181B] tracking-tight mt-1">
            Arya <span className="text-[#FF5D8F]">&amp;</span> Sekar
          </h2>
          <p className="font-mono text-xs font-bold tracking-widest text-[#71717A] uppercase mt-2">
            14 November 2026 • Surakarta
          </p>
        </div>

        <div className="hidden lg:block fixed bottom-12 left-12 pointer-events-none select-none z-10">
          <NeoSticker
            icon="🎉"
            label="JOIN THE PARTY!"
            color="green"
            rotate="rotate-3"
          />
        </div>

        {/* Central Mobile/Card Invitation Container */}
        <main className="w-full max-w-md md:max-w-lg bg-[#FFFDF5] min-h-screen md:my-8 md:rounded-[40px] md:border-[3px] md:border-[#18181B] md:shadow-[10px_10px_0px_#18181B] relative overflow-hidden flex flex-col">
          <HeroSection />
          <QuoteSection />
          <div id="mempelai">
            <CoupleSection />
          </div>
          <div id="acara">
            <EventSection />
          </div>
          <div id="galeri">
            <GallerySection />
          </div>
          <div id="rsvp">
            <RsvpSection
              initialTamu={tamu}
              guestCode={guestCode}
              idUndangan={undangan?.id_undangan}
            />
          </div>
          <div id="kado">
            <DigitalGiftSection />
          </div>
          <div id="buku-tamu">
            <GuestbookSection
              idUndangan={undangan?.id_undangan}
              initialGuestName={tamu?.nama_tamu || ""}
            />
          </div>
          <FooterSection />

          {/* Bottom Floating Navigation Bar when invitation is open */}
          {isOpen && (
            <div className="sticky bottom-4 z-30 mx-auto px-2 max-w-sm mb-4 animate-in fade-in slide-in-from-bottom-2">
              <nav className="flex items-center justify-between gap-1 px-3 py-2 rounded-full bg-white/95 backdrop-blur-md border-[2.5px] border-[#18181B] shadow-[4px_4px_0px_#18181B] text-[#18181B]">
                <button
                  type="button"
                  onClick={() => scrollTo("mempelai")}
                  className="px-2 py-1 rounded-full text-[11px] font-bold hover:bg-[#FFE600] transition-colors cursor-pointer"
                >
                  Mempelai
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("acara")}
                  className="px-2 py-1 rounded-full text-[11px] font-bold hover:bg-[#FFE600] transition-colors cursor-pointer"
                >
                  Acara
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("galeri")}
                  className="px-2 py-1 rounded-full text-[11px] font-bold hover:bg-[#FFE600] transition-colors cursor-pointer"
                >
                  Galeri
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("rsvp")}
                  className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#FF5D8F] text-[#18181B] border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] transition-transform active:scale-95 cursor-pointer"
                >
                  RSVP
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("kado")}
                  className="px-2 py-1 rounded-full text-[11px] font-bold hover:bg-[#FFE600] transition-colors cursor-pointer"
                >
                  Kado
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("buku-tamu")}
                  className="px-2 py-1 rounded-full text-[11px] font-bold hover:bg-[#FFE600] transition-colors cursor-pointer"
                >
                  Ucapan
                </button>
              </nav>
            </div>
          )}
        </main>

        {/* Ambient Romantic Music Player */}
        <AudioPlayer autoPlayTrigger={isOpen} />
      </div>
    </ScrollFadeProvider>
  );
}
