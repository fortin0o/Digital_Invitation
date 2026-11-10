"use client";

import React, { useState, useEffect } from "react";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

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

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+Celebration+Arya+%26+Sekar&dates=20261114T010000Z/20261114T070000Z&details=The+Wedding+Celebration+of+Arya+Suryo+Wicaksono+%26+Sekar+Arum+Kinanti.+Sasana+Pendopo+Ageng,+Surakarta.&location=Sasana+Pendopo+Ageng,+Surakarta`;

  return (
    <section className="relative w-full py-12 px-4 overflow-hidden">
      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-8">
          <div className="mb-2">
            <NeoSticker
              icon="📅"
              label="SAVE THE DATE"
              color="yellow"
              rotate="-rotate-2"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            Jadwal &amp; Lokasi Acara
          </h2>
          <NeoDivider className="!my-2" />
          <p className="font-sans text-xs text-[#52525B] max-w-xs mx-auto leading-relaxed font-medium">
            Hari bahagia yang sangat kami nantikan untuk dirayakan bersama keluarga dan teman tercinta.
          </p>
        </div>

        {/* Colorful Neobrutalist Countdown Timer */}
        <div className="fade-up-element mb-8 p-5 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B]">
          <p className="font-display font-bold text-xs uppercase tracking-wider text-[#18181B] mb-3 flex items-center justify-center gap-1.5">
            <span>⚡</span>
            <span>COUNTING DOWN TO THE BIG DAY!</span>
            <span>⚡</span>
          </p>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { label: "Hari", value: timeLeft.days, color: "bg-[#FFE600]" },
              { label: "Jam", value: timeLeft.hours, color: "bg-[#FF5D8F]" },
              { label: "Menit", value: timeLeft.minutes, color: "bg-[#38BDF8]" },
              { label: "Detik", value: timeLeft.seconds, color: "bg-[#2EE59D]" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl ${item.color} border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] sm:shadow-[2.5px_2.5px_0px_#18181B]`}
              >
                <span className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-[#18181B] leading-none">
                  {item.value}
                </span>
                <span className="font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#18181B] mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Akad Nikah Card */}
        <div className="fade-up-element mb-6 p-6 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] text-center relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="mb-3">
            <span className="px-3 py-1 rounded-full bg-[#FFE600] text-[#18181B] font-extrabold text-xs border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
              💍 AKAD NIKAH
            </span>
          </div>

          <h3 className="font-display text-2xl text-[#18181B] font-extrabold mb-1">
            Akad Nikah
          </h3>
          <p className="font-sans text-xs text-[#71717A] mb-4 font-semibold">
            Upacara Sakral &amp; Khidmat
          </p>

          <div className="space-y-2 text-xs text-[#52525B] font-sans font-medium">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF5] border border-[#18181B]">
              <span>📅</span>
              <span>Sabtu, 14 November 2026</span>
            </div>
            <br />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF5] border border-[#18181B]">
              <span>⏰</span>
              <span>Pukul 08.00 - 10.00 WIB</span>
            </div>
            <div className="pt-3 text-[#18181B] font-bold font-display text-base">
              Pendopo Sasana Ageng Kridha
            </div>
          </div>
        </div>

        {/* Resepsi Card */}
        <div className="fade-up-element mb-6 p-6 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] text-center relative overflow-hidden transition-transform hover:-translate-y-1">
          <div className="mb-3">
            <span className="px-3 py-1 rounded-full bg-[#FF5D8F] text-[#18181B] font-extrabold text-xs border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
              🎉 RESEPSI PERNIKAHAN
            </span>
          </div>

          <h3 className="font-display text-2xl text-[#18181B] font-extrabold mb-1">
            Resepsi &amp; Ramah Tamah
          </h3>
          <p className="font-sans text-xs text-[#71717A] mb-4 font-semibold">
            Perayaan Bersama Sahabat &amp; Kerabat
          </p>

          <div className="space-y-2 text-xs text-[#52525B] font-sans font-medium">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF5] border border-[#18181B]">
              <span>📅</span>
              <span>Sabtu, 14 November 2026</span>
            </div>
            <br />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF5] border border-[#18181B]">
              <span>⏰</span>
              <span>Pukul 11.00 - 14.00 WIB</span>
            </div>
            <div className="pt-3 text-[#18181B] font-bold font-display text-base">
              Grand Ballroom Sasana Utama
            </div>
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="fade-up-element p-6 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] text-center">
          <div className="mb-3">
            <span className="px-3 py-1 rounded-full bg-[#38BDF8] text-[#18181B] font-extrabold text-xs border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
              📍 LOKASI VENUE
            </span>
          </div>

          <h4 className="font-display text-xl text-[#18181B] font-extrabold mb-1">
            Sasana Pendopo Ageng
          </h4>
          <p className="font-sans text-xs text-[#71717A] leading-relaxed mb-6 font-medium max-w-xs mx-auto">
            Jl. Keraton Surakarta No. 12, Baluwarti, Pasar Kliwon, Surakarta, Jawa Tengah
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://maps.google.com/?q=Surakarta"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFE600] hover:bg-[#FDD835] text-[#18181B] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 text-xs font-bold transition-all"
            >
              <span>🗺️</span>
              <span>Buka Google Maps</span>
            </a>

            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFFDF5] hover:bg-[#38BDF8] text-[#18181B] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] active:translate-x-0.5 active:translate-y-0.5 text-xs font-bold transition-all"
            >
              <span>📅</span>
              <span>Simpan ke Kalender</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
