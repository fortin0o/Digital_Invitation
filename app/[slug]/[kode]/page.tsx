import type { Metadata } from "next";
import MainInvitationView from "@/components/invitation/MainInvitationView";
import { resolveInvitationAndGuest, buildInvitationMetadata } from "@/lib/guestInvitation";
import { notFound } from "next/navigation";

interface CleanGuestPageProps {
  params: Promise<{ slug: string; kode: string }>;
}

export async function generateMetadata({
  params,
}: CleanGuestPageProps): Promise<Metadata> {
  const { slug, kode } = await params;
  const guestCode = decodeURIComponent(kode);

  const { undangan, tamu } = await resolveInvitationAndGuest({ slug, guestCode });
  if (!undangan) {
    return { title: "Undangan Tidak Ditemukan" };
  }
  return buildInvitationMetadata({ undangan, tamu });
}

export default async function CleanGuestInvitationPage({
  params,
}: CleanGuestPageProps) {
  const { slug, kode } = await params;
  const guestCode = decodeURIComponent(kode);

  const { undangan, tamu } = await resolveInvitationAndGuest({ slug, guestCode });
  if (!undangan) {
    notFound();
  }

  return (
    <MainInvitationView
      tamu={tamu}
      guestCode={guestCode}
      undangan={undangan}
    />
  );
}
