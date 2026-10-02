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
import ScrollFadeProvider from "./ScrollFadeProvider";

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

  const guestName = tamu ? tamu.nama_tamu : "Bapak/Ibu/Saudara/i";

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
      <div className="w-full min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-start relative">
        {/* Desktop Ambient Decorative Backdrop */}
        <div className="hidden lg:block fixed top-12 left-12 pointer-events-none select-none opacity-40">
          <p className="font-serif italic text-2xl text-[#8A6B53]">Pawiwahan Ageng</p>
          <h2 className="font-serif text-4xl text-[#3D261C] font-light mt-1">Arya &amp; Sekar</h2>
          <p className="font-sans text-xs tracking-widest text-[#C5A059] uppercase mt-2">14 November 2026</p>
        </div>

        {/* Central Mobile/Card Invitation Container */}
        <main className="w-full max-w-md md:max-w-lg bg-[#FAF6F0] min-h-screen md:my-6 md:rounded-[40px] md:border md:border-[#C5A059]/30 md:shadow-[0_20px_60px_rgba(61,38,28,0.12)] relative overflow-hidden flex flex-col">
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
            <div className="sticky bottom-4 z-30 mx-auto px-2 max-w-xs sm:max-w-sm mb-4">
              <nav className="flex items-center justify-between gap-1 px-3 py-2 rounded-full bg-[#FFFDF9]/95 backdrop-blur-md border border-[#C5A059]/40 shadow-[0_6px_24px_rgba(61,38,28,0.15)] text-[#3D261C]">
                <button
                  type="button"
                  onClick={() => scrollTo("mempelai")}
                  className="px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-sans hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Mempelai
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("acara")}
                  className="px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-sans hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Acara
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("galeri")}
                  className="px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-sans hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Galeri
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("rsvp")}
                  className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-sans bg-[#5C3A21] text-[#FFFDF9] border border-[#C5A059] font-medium transition-colors cursor-pointer"
                >
                  RSVP
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("kado")}
                  className="px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-sans hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Kado
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("buku-tamu")}
                  className="px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-sans hover:text-[#C5A059] transition-colors cursor-pointer"
                >
                  Serat
                </button>
              </nav>
            </div>
          )}
        </main>
      </div>
    </ScrollFadeProvider>
  );
}
