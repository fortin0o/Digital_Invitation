import React from "react";
import Image from "next/image";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

export default function CoupleSection() {
  return (
    <section className="relative w-full py-16 px-4 text-center overflow-hidden">
      <BotanicalCorner position="top-left" size={110} opacity={0.5} />
      <BotanicalCorner position="bottom-right" size={110} opacity={0.5} />

      <div className="max-w-md mx-auto relative z-10">
        {/* Section title */}
        <div className="fade-up-element mb-12">
          <p className="font-serif italic text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
            Bismillaahirrohmaanirrohiim
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3D261C] font-normal tracking-wide">
            Penganten Kekalih
          </h2>
          <BotanicalDivider width={130} className="!my-3" />
          <p className="font-sans text-xs text-[#8A6B53] max-w-xs mx-auto leading-relaxed font-light">
            Kanthi nyenyuwun berkah saha karaharjan saking Gusti Kang Maha Welas Asih, keparenga kula ngaturi pirsa dhumateng pawiwahanipun putra-putri kula:
          </p>
        </div>

        {/* Bride Card (Mempelai Putri) */}
        <div className="fade-up-element mb-12 flex flex-col items-center">
          <div className="relative w-36 h-36 mb-5 rounded-full p-1.5 bg-[#FFFDF9] ring-2 ring-[#C5A059]/60 shadow-[0_8px_25px_rgba(61,38,28,0.1)]">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/bride.jpg"
                alt="Raden Ajeng Sekar Arum Kinanti"
                fill
                className="object-cover object-center"
                sizes="144px"
              />
            </div>
          </div>

          <h3 className="font-serif text-2xl text-[#3D261C] font-medium tracking-wide">
            R.Aj. Sekar Arum Kinanti, S.Pd.
          </h3>
          <p className="font-serif italic text-xs text-[#C5A059] mt-0.5 mb-2 font-medium">
            Mempelai Putri
          </p>
          <p className="font-sans text-xs text-[#8A6B53] leading-relaxed font-light max-w-xs">
            Putri kinasih saking panjenenganipun <br />
            <strong>Bpk. Joko Purnomo</strong> &amp; <strong>Ibu Endang Sulastri</strong>
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#C5A059]/40 text-[#3D261C] hover:bg-[#C5A059]/15 transition-colors text-[11px] font-sans"
          >
            <svg className="w-3 h-3 text-[#C5A059]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>@sekar.kinanti</span>
          </a>
        </div>

        {/* Ampersand separator with Javanese Gold Heart Symbol */}
        <div className="fade-up-element my-4 flex items-center justify-center">
          <span className="font-serif italic text-3xl sm:text-4xl text-[#C5A059]">&amp;</span>
        </div>

        {/* Groom Card (Mempelai Kakung) */}
        <div className="fade-up-element mt-6 flex flex-col items-center">
          <div className="relative w-36 h-36 mb-5 rounded-full p-1.5 bg-[#FFFDF9] ring-2 ring-[#C5A059]/60 shadow-[0_8px_25px_rgba(61,38,28,0.1)]">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/groom.jpg"
                alt="Raden Mas Arya Suryo Wicaksono"
                fill
                className="object-cover object-center"
                sizes="144px"
              />
            </div>
          </div>

          <h3 className="font-serif text-2xl text-[#3D261C] font-medium tracking-wide">
            R.M. Arya Suryo Wicaksono, S.T.
          </h3>
          <p className="font-serif italic text-xs text-[#C5A059] mt-0.5 mb-2 font-medium">
            Mempelai Kakung
          </p>
          <p className="font-sans text-xs text-[#8A6B53] leading-relaxed font-light max-w-xs">
            Putra kakung saking panjenenganipun <br />
            <strong>Bpk. Bambang Wicaksono</strong> &amp; <strong>Ibu Sri Wahyuni</strong>
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#C5A059]/40 text-[#3D261C] hover:bg-[#C5A059]/15 transition-colors text-[11px] font-sans"
          >
            <svg className="w-3 h-3 text-[#C5A059]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>@arya.suryo</span>
          </a>
        </div>
      </div>
    </section>
  );
}
