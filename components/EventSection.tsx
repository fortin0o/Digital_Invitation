"use client";

import React, { useState, useEffect } from "react";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";
import GununganOrnament from "./GununganOrnament";

export default function EventSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-11-14T08:00:00+07:00").getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pawiwahan+Ageng+Arya+%26+Sekar&dates=20261114T010000Z/20261114T070000Z&details=Pahargyan+Pawiwahan+Arya+Suryo+Wicaksono+%26+Sekar+Arum+Kinanti.+Sasana+Kridha+Pendopo+Ageng,+Surakarta.&location=Sasana+Kridha+Pendopo+Ageng,+Surakarta`;

  return (
    <section className="relative w-full py-14 sm:py-16 px-4 overflow-hidden">
      <BotanicalCorner position="top-right" size={110} opacity={0.5} />
      <BotanicalCorner position="bottom-left" size={110} opacity={0.5} />

      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-8 sm:mb-10">
          <p className="font-serif italic text-xs sm:text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
            Wekdal &amp; Papan Pahargyan
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3D261C] font-normal tracking-wide">
            Reroncening Acara
          </h2>
          <BotanicalDivider width={130} className="!my-3" />
        </div>

        {/* Countdown Timer with Gold & Sogan Styling */}
        <div className="fade-up-element mb-8 sm:mb-10 p-4 sm:p-5 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)]">
          <p className="font-serif italic text-xs tracking-wider text-[#8A6B53] uppercase mb-3 flex items-center justify-center gap-1.5">
            <span className="text-[#C5A059]">❖</span>
            <span>Ngetang Dinten Menuju Pahargyan</span>
            <span className="text-[#C5A059]">❖</span>
          </p>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { label: "Dinten", value: timeLeft.days },
              { label: "Tabuh", value: timeLeft.hours },
              { label: "Menit", value: timeLeft.minutes },
              { label: "Detik", value: timeLeft.seconds },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#C5A059]/25 shadow-sm"
              >
                <span className="font-serif text-xl sm:text-3xl font-medium text-[#3D261C]">
                  {item.value}
                </span>
                <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-[#8A6B53] mt-0.5">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ijab Qabul / Akad Nikah Card */}
        <div className="fade-up-element mb-6 p-5 sm:p-6 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)] relative overflow-hidden">
          <BotanicalCorner position="top-right" size={80} opacity={0.3} />

          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#C5A059] border border-[#C5A059]/40">
            <GununganOrnament size={24} variant="gold" />
          </div>

          <h3 className="font-serif text-2xl text-[#3D261C] font-medium tracking-wide mb-0.5">
            Akad Nikah / Ijab Qabul
          </h3>
          <p className="font-serif italic text-xs text-[#C5A059] mb-4 font-medium">
            Upacara Sakral &amp; Khidmat
          </p>

          <div className="space-y-2 text-xs text-[#8A6B53] font-sans font-light">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Setu Legi, 14 November 2026</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tabuh 08.00 - 10.00 WIB</span>
            </div>
            <div className="pt-2 text-[#3D261C] font-medium font-serif text-sm">
              Pendopo Sasana Ageng Kridha
            </div>
          </div>
        </div>

        {/* Resepsi / Panggih Card */}
        <div className="fade-up-element mb-6 sm:mb-8 p-5 sm:p-6 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)] relative overflow-hidden">
          <BotanicalCorner position="top-right" size={80} opacity={0.3} />

          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#C5A059] border border-[#C5A059]/40">
            <span className="font-serif italic text-lg text-[#C5A059] font-bold">ꦥ</span>
          </div>

          <h3 className="font-serif text-2xl text-[#3D261C] font-medium tracking-wide mb-0.5">
            Upacara Panggih &amp; Resepsi
          </h3>
          <p className="font-serif italic text-xs text-[#C5A059] mb-4 font-medium">
            Pahargyan Adat Jawa &amp; Ramah Tamah
          </p>

          <div className="space-y-2 text-xs text-[#8A6B53] font-sans font-light">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Setu Legi, 14 November 2026</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tabuh 11.00 - 14.00 WIB</span>
            </div>
            <div className="pt-2 text-[#3D261C] font-medium font-serif text-sm">
              Sasana Pahargyan Utama
            </div>
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="fade-up-element p-5 sm:p-6 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)]">
          <div className="w-9 h-9 mx-auto mb-3 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#C5A059] border border-[#C5A059]/30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h4 className="font-serif text-xl text-[#3D261C] font-medium mb-1">
            Sasana Pendopo Ageng
          </h4>
          <p className="font-sans text-xs text-[#8A6B53] leading-relaxed mb-6 font-light max-w-xs mx-auto">
            Jl. Keraton Surakarta No. 12, Baluwarti, Pasar Kliwon, Surakarta, Jawa Tengah
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://maps.google.com/?q=Surakarta"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#C5A059] text-[#3D261C] bg-[#FFFDF9] hover:bg-[#C5A059] hover:text-[#FFFDF9] shadow-sm active:scale-95 transition-all text-xs font-sans tracking-wider"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Pitedah Margi (Maps)</span>
            </a>

            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF6F0] border border-[#C5A059]/40 text-[#3D261C] hover:bg-[#C5A059]/15 active:scale-95 transition-all text-xs font-sans tracking-wider"
            >
              <svg className="w-3.5 h-3.5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Simpen Tanggal</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
