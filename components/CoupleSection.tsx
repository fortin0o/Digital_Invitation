import React from "react";
import Image from "next/image";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

export default function CoupleSection() {
  return (
    <section className="relative w-full py-12 px-4 text-center overflow-hidden">
      <div className="max-w-md mx-auto relative z-10">
        {/* Section title */}
        <div className="fade-up-element mb-10">
          <div className="mb-2">
            <NeoSticker
              icon="💍"
              label="MEET THE COUPLE"
              color="pink"
              rotate="-rotate-2"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            Mempelai Bahagia
          </h2>
          <NeoDivider className="!my-2" />
          <p className="font-sans text-xs text-[#52525B] max-w-xs mx-auto leading-relaxed font-medium">
            Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami mempertemukan dua insan dalam ikatan suci pernikahan:
          </p>
        </div>

        {/* Bride Card (Sekar) */}
        <div className="fade-up-element mb-6 p-6 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] flex flex-col items-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_#18181B]">
          {/* Top accent badge */}
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF5D8F] text-[#18181B] font-bold text-[10px] border-2 border-[#18181B]">
              👰 THE BRIDE
            </span>
          </div>

          <div className="relative w-32 h-32 mb-4 rounded-full p-1 bg-white border-[3px] border-[#18181B] shadow-[3px_3px_0px_#18181B]">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/bride.jpg"
                alt="Sekar Arum Kinanti"
                fill
                className="object-cover object-center"
                sizes="128px"
              />
            </div>
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#18181B]">
            Sekar Arum Kinanti, S.Pd.
          </h3>
          <p className="font-sans text-xs text-[#71717A] mt-1 font-medium max-w-xs leading-relaxed">
            Putri tercinta dari keluarga <br />
            <strong className="text-[#18181B]">Bpk. Joko Purnomo</strong> &amp; <strong className="text-[#18181B]">Ibu Endang Sulastri</strong>
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] hover:bg-[#FFE600] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-bold"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>@sekar.kinanti</span>
          </a>
        </div>

        {/* Playful Match Center Badge */}
        <div className="fade-up-element my-4 flex items-center justify-center">
          <NeoSticker
            icon="💖"
            label="IT'S A MATCH!"
            color="yellow"
            rotate="rotate-3"
            size="md"
          />
        </div>

        {/* Groom Card (Arya) */}
        <div className="fade-up-element mt-4 p-6 rounded-[28px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] flex flex-col items-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_#18181B]">
          {/* Top accent badge */}
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-0.5 rounded-full bg-[#38BDF8] text-[#18181B] font-bold text-[10px] border-2 border-[#18181B]">
              🤵 THE GROOM
            </span>
          </div>

          <div className="relative w-32 h-32 mb-4 rounded-full p-1 bg-white border-[3px] border-[#18181B] shadow-[3px_3px_0px_#18181B]">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/groom.jpg"
                alt="Arya Suryo Wicaksono"
                fill
                className="object-cover object-center"
                sizes="128px"
              />
            </div>
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#18181B]">
            Arya Suryo Wicaksono, S.T.
          </h3>
          <p className="font-sans text-xs text-[#71717A] mt-1 font-medium max-w-xs leading-relaxed">
            Putra tercinta dari keluarga <br />
            <strong className="text-[#18181B]">Bpk. Bambang Wicaksono</strong> &amp; <strong className="text-[#18181B]">Ibu Sri Wahyuni</strong>
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] hover:bg-[#38BDF8] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-bold"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>@arya.suryo</span>
          </a>
        </div>
      </div>
    </section>
  );
}
