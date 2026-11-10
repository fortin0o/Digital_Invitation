"use client";

import React, { useState } from "react";
import Image from "next/image";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

const galleryImages = [
  {
    src: "/images/couple.jpg",
    alt: "Momen Bahagia Arya & Sekar",
    aspect: "aspect-[3/4]",
    caption: "Langkah Awal Bersama Menuju Selamanya",
  },
  {
    src: "/images/bride.jpg",
    alt: "Potret Mempelai Wanita",
    aspect: "aspect-square",
    caption: "Senyuman Anggun Mempelai Wanita",
  },
  {
    src: "/images/groom.jpg",
    alt: "Potret Mempelai Pria",
    aspect: "aspect-square",
    caption: "Kebahagiaan Mempelai Pria",
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    alt: "Dekorasi Bunga & Pesta",
    aspect: "aspect-[3/4]",
    caption: "Dekorasi Cantik & Penuh Kehangatan",
  },
  {
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    alt: "Cincin Kawin",
    aspect: "aspect-[4/3]",
    caption: "Simbol Ikatan Cinta Abadi",
  },
  {
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    alt: "Janji Suci",
    aspect: "aspect-[3/4]",
    caption: "Hari Paling Berharga Bersama",
  },
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="relative w-full py-12 px-4 overflow-hidden">
      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section title */}
        <div className="fade-up-element mb-8">
          <div className="mb-2">
            <NeoSticker
              icon="📸"
              label="OUR MEMORIES"
              color="purple"
              rotate="-rotate-2"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            Galeri Foto Bahagia
          </h2>
          <NeoDivider className="!my-2" />
          <p className="font-sans text-xs text-[#52525B] max-w-xs mx-auto leading-relaxed font-medium">
            Kumpulan senyuman, tawa, dan cerita manis dalam perjalanan kami berdua.
          </p>
        </div>

        {/* 2-Column Grid with Semi-Neobrutalist Frames */}
        <div className="grid grid-cols-2 gap-3.5">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img.src)}
              className={`fade-up-element group relative cursor-pointer overflow-hidden rounded-2xl bg-white border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#FFE600] hover:-translate-y-1 transition-all duration-200 ${img.aspect}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 45vw, 240px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              {/* Playful hover zoom pill */}
              <div className="absolute inset-0 bg-[#18181B]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 rounded-full bg-[#FFE600] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-xs font-bold">
                  🔍 Lihat
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
          className="fixed inset-0 z-50 bg-[#18181B]/80 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full max-h-[85vh] rounded-[32px] overflow-hidden bg-white border-[3px] border-[#18181B] p-3 shadow-[8px_8px_0px_#FFE600]"
          >
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden border-2 border-[#18181B]">
              <Image
                src={selectedImage}
                alt="Galeri Foto Pilihan"
                fill
                className="object-contain bg-[#18181B]/5"
                sizes="(max-width: 768px) 90vw, 500px"
              />
            </div>

            <button
              onClick={() => setSelectedImage(null)}
              type="button"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FF5D8F] text-[#18181B] font-extrabold flex items-center justify-center border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
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
