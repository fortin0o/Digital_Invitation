import React from "react";
import Image from "next/image";
import NeoSticker from "@/components/ui/NeoSticker";
import NeoDivider from "@/components/ui/NeoDivider";
import { UndanganData } from "@/lib/guestInvitation";
import { ExtraInvitationContent } from "@/lib/invitationContentConfig";

interface CoupleSectionProps {
  undangan?: UndanganData | null;
  extraContent?: ExtraInvitationContent | null;
}

function getInstagramHandle(fullName?: string | null, fallback: string = ""): string {
  if (!fullName?.trim()) return fallback;
  const parts = fullName
    .trim()
    .replace(/,[^,]*$/, "") // buang gelar seperti ", S.Pd." atau ", S.T."
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
  return parts.length > 0 ? `@${parts.join(".")}` : fallback;
}

export default function CoupleSection({ undangan, extraContent }: CoupleSectionProps) {
  const brideName = undangan?.nama_wanita?.trim() || "Sekar Arum Kinanti, S.Pd.";
  const groomName = undangan?.nama_pria?.trim() || "Arya Suryo Wicaksono, S.T.";

  const brideIg = extraContent?.brideInstagram?.trim() || getInstagramHandle(undangan?.nama_wanita, "@sekar.kinanti");
  const groomIg = extraContent?.groomInstagram?.trim() || getInstagramHandle(undangan?.nama_pria, "@arya.suryo");

  const brideParentsPrefix = extraContent?.brideParentsPrefix?.trim() || "Putri tercinta dari keluarga";
  const brideParents = extraContent?.brideParents?.trim() || "Bpk. Joko Purnomo & Ibu Endang Sulastri";

  const groomParentsPrefix = extraContent?.groomParentsPrefix?.trim() || "Putra tercinta dari keluarga";
  const groomParents = extraContent?.groomParents?.trim() || "Bpk. Bambang Wicaksono & Ibu Sri Wahyuni";

  return (
    <section className="relative w-full py-6 sm:py-8 px-4 text-center overflow-hidden">
      <div className="max-w-md mx-auto relative z-10">
        {/* Section title */}
        <div className="fade-up-element mb-6">
          <div className="mb-2">
            <NeoSticker
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

        {/* Bride Card */}
        <div className="fade-up-element mb-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] flex flex-col items-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_#18181B]">
          {/* Top accent badge */}
          <div className="absolute top-4 right-4">
            <span className="px-2 py-0.5 rounded-full bg-[#FF5D8F] text-[#18181B] font-bold text-[10px] border-2 border-[#18181B]">
              THE BRIDE
            </span>
          </div>

          <div className="relative w-32 h-32 mb-4 rounded-full p-1 bg-white border-[3px] border-[#18181B] shadow-[3px_3px_0px_#18181B]">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/bride.jpg"
                alt={brideName}
                fill
                className="object-cover object-center"
                sizes="128px"
              />
            </div>
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#18181B]">
            {brideName}
          </h3>
          <p suppressHydrationWarning className="font-sans text-xs text-[#71717A] mt-1 font-medium max-w-xs leading-relaxed">
            {brideParentsPrefix} <br />
            <strong className="text-[#18181B]">{brideParents}</strong>
          </p>

          <a
            href={`https://instagram.com/${brideIg.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] hover:bg-[#FFE600] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-bold"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span suppressHydrationWarning>{brideIg}</span>
          </a>
        </div>

        {/* Match Center Badge */}
        <div className="fade-up-element my-2 flex items-center justify-center">
          <NeoSticker
            label="THE PERFECT PAIR"
            color="yellow"
            rotate="rotate-3"
            size="md"
          />
        </div>

        {/* Groom Card */}
        <div className="fade-up-element mt-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] flex flex-col items-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_#18181B]">
          {/* Top accent badge */}
          <div className="absolute top-4 right-4">
            <span className="px-2 py-0.5 rounded-full bg-[#38BDF8] text-[#18181B] font-bold text-[10px] border-2 border-[#18181B]">
              THE GROOM
            </span>
          </div>

          <div className="relative w-32 h-32 mb-4 rounded-full p-1 bg-white border-[3px] border-[#18181B] shadow-[3px_3px_0px_#18181B]">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/groom.jpg"
                alt={groomName}
                fill
                className="object-cover object-center"
                sizes="128px"
              />
            </div>
          </div>

          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#18181B]">
            {groomName}
          </h3>
          <p suppressHydrationWarning className="font-sans text-xs text-[#71717A] mt-1 font-medium max-w-xs leading-relaxed">
            {groomParentsPrefix} <br />
            <strong className="text-[#18181B]">{groomParents}</strong>
          </p>

          <a
            href={`https://instagram.com/${groomIg.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDF5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] hover:bg-[#38BDF8] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs font-bold"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span suppressHydrationWarning>{groomIg}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
