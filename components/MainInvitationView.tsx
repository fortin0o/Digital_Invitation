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
import NeoSticker from "./NeoSticker";
import { TamuWithRsvp, UndanganData } from "@/lib/guestInvitation";

interface MainInvitationViewProps {
  tamu: TamuWithRsvp | null;
  guestCode: string;
  undangan: UndanganData | null;
}

export default function MainInvitationView({
  tamu,
  guestCode,
  undangan,
}: MainInvitationViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGuest, setActiveGuest] = useState<TamuWithRsvp | null>(tamu);

  const guestName = activeGuest ? activeGuest.nama_tamu : "Sahabat & Keluarga Tercinta";

  const desktopCouplePria = undangan?.nama_pria ? undangan.nama_pria.trim().split(" ")[0] : "Arya";
  const desktopCoupleWanita = undangan?.nama_wanita ? undangan.nama_wanita.trim().split(" ")[0] : "Sekar";
  const desktopDateVenue = React.useMemo(() => {
    if (!undangan?.tgl_acara) return "14 November 2026 • Surakarta";
    try {
      const d = new Date(undangan.tgl_acara);
      if (isNaN(d.getTime())) return "14 November 2026 • Surakarta";
      const venue = undangan.tempat ? ` • ${undangan.tempat.split(",")[0]}` : "";
      return (
        new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d) + venue
      );
    } catch {
      return "14 November 2026 • Surakarta";
    }
  }, [undangan?.tgl_acara, undangan?.tempat]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setTimeout(() => {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number | string | HTMLElement, opts?: unknown) => void } }).__lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 60);
  };

  return (
    <ScrollFadeProvider>
      {/* Cover / Opening Screen */}
      <CoverSection
        isOpen={isOpen}
        onOpen={handleOpenInvitation}
        guestName={guestName}
        undangan={undangan}
      />

      {/* Main Invitation Layout */}
      <div className="w-full min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-start relative">
        {/* Background Dots */}
        <div className="absolute inset-0 neo-bg-pattern opacity-10 pointer-events-none fixed" />

        {/* Desktop Ambient Decorative Backdrop */}
        <div className="hidden lg:block fixed top-12 left-12 pointer-events-none select-none z-10">
          <div className="mb-2">
            <NeoSticker
              label="WEDDING CELEBRATION"
              color="yellow"
              rotate="-rotate-3"
            />
          </div>
          <h2 className="font-display font-extrabold text-4xl text-[#18181B] tracking-tight mt-1">
            {desktopCouplePria} <span className="text-[#FF5D8F]">&amp;</span> {desktopCoupleWanita}
          </h2>
          <p className="font-mono text-xs font-bold tracking-widest text-[#71717A] uppercase mt-2">
            {desktopDateVenue}
          </p>
        </div>

        <div className="hidden lg:block fixed bottom-12 left-12 pointer-events-none select-none z-10">
          <NeoSticker
            label="JOIN THE CELEBRATION"
            color="green"
            rotate="rotate-3"
          />
        </div>

        {/* Central Mobile/Card Invitation Container */}
        <main className="w-full max-w-md md:max-w-xl lg:max-w-lg bg-[#FFFDF5] min-h-screen md:my-8 md:rounded-[40px] md:border-[3px] md:border-[#18181B] md:shadow-[10px_10px_0px_#18181B] relative overflow-hidden flex flex-col">
          <HeroSection undangan={undangan} />
          <QuoteSection />
          <div id="mempelai">
            <CoupleSection />
          </div>
          <div id="acara">
            <EventSection undangan={undangan} />
          </div>
          <div id="galeri">
            <GallerySection />
          </div>
          <div id="rsvp">
            <RsvpSection
              initialTamu={tamu}
              guestCode={guestCode}
              idUndangan={undangan?.id_undangan}
              coupleName={
                undangan?.nama_pria && undangan?.nama_wanita
                  ? `${undangan.nama_pria} & ${undangan.nama_wanita}`
                  : "Arya & Sekar"
              }
              onGuestChange={setActiveGuest}
            />
          </div>
          <div id="kado">
            <DigitalGiftSection />
          </div>
          <div id="buku-tamu">
            <GuestbookSection
              idUndangan={undangan?.id_undangan}
              initialGuestName={activeGuest?.nama_tamu || ""}
              guestSyncKey={`${activeGuest?.kode || ""}:${activeGuest?.rsvp_tgl_konfirmasi || ""}`}
              isRsvpConfirmed={Boolean(activeGuest?.rsvp_status)}
              coupleName={
                undangan?.nama_pria && undangan?.nama_wanita
                  ? `${undangan.nama_pria} & ${undangan.nama_wanita}`
                  : "kedua mempelai"
              }
            />
          </div>
          <FooterSection />
        </main>
      </div>
    </ScrollFadeProvider>
  );
}
