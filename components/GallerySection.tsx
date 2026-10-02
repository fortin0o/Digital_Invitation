"use client";

import React, { useState } from "react";
import Image from "next/image";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

const galleryImages = [
  {
    src: "/images/couple.jpg",
    alt: "Momen Pawiwahan Ageng",
    aspect: "aspect-[3/4]",
    caption: "Langkah Awal Bersama Menuju Langgeng",
  },
  {
    src: "/images/bride.jpg",
    alt: "Potret Mempelai Putri",
    aspect: "aspect-square",
    caption: "Elegansi Busana Paes Ageng Mempelai Putri",
  },
  {
    src: "/images/groom.jpg",
    alt: "Potret Mempelai Kakung",
    aspect: "aspect-square",
    caption: "Wibawa Busana Beskap Mempelai Kakung",
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    alt: "Dekorasi Melati & Roncean Jawa",
    aspect: "aspect-[3/4]",
    caption: "Aroma Melati Roncean & Ukiran Sogan",
  },
  {
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    alt: "Cincin Kawin",
    aspect: "aspect-[4/3]",
    caption: "Tanda Ikatan Suci Abadi",
  },
  {
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    alt: "Janji Suci",
    aspect: "aspect-[3/4]",
    caption: "Lir Handayani, Guyub Rukun Salawase",
  },
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="relative w-full py-16 px-4 overflow-hidden">
      <BotanicalCorner position="top-left" size={110} opacity={0.5} />
      <BotanicalCorner position="bottom-right" size={110} opacity={0.5} />

      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-10">
          <p className="font-serif italic text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
            Endahing Katresnan
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3D261C] font-normal tracking-wide">
            Galeri Pawiwahan
          </h2>
          <BotanicalDivider width={130} className="!my-3" />
          <p className="font-sans text-xs text-[#8A6B53] max-w-xs mx-auto leading-relaxed font-light">
            Candra lumaksana, rerengganing katresnan ingkang kaimpun wonten ing potret kabagyan.
          </p>
        </div>

        {/* 2-Column Grid with Javanese Gold Border */}
        <div className="grid grid-cols-2 gap-4">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img.src)}
              className={`fade-up-element group relative cursor-pointer overflow-hidden rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-[0_4px_16px_rgba(61,38,28,0.06)] hover:shadow-[0_8px_24px_rgba(197,160,89,0.25)] transition-all duration-300 ${img.aspect}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 45vw, 240px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gold hover overlay */}
              <div className="absolute inset-0 bg-[#3D261C]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 rounded-full bg-[#FFFDF9]/90 backdrop-blur-sm text-[#C5A059] border border-[#C5A059]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-[#3D261C]/85 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full max-h-[85vh] rounded-3xl overflow-hidden bg-[#FFFDF9] border-2 border-[#C5A059]/40 p-2 shadow-2xl"
          >
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden">
              <Image
                src={selectedImage}
                alt="Galeri Foto Pilihan"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 90vw, 500px"
              />
            </div>

            <button
              onClick={() => setSelectedImage(null)}
              type="button"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFFDF9]/90 text-[#3D261C] flex items-center justify-center shadow-md hover:bg-[#C5A059] hover:text-[#FFFDF9] transition-colors cursor-pointer"
              aria-label="Tutup foto"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
