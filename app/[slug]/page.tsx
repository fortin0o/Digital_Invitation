import type { Metadata } from "next";
import MainInvitationView from "@/components/invitation/MainInvitationView";
import { resolveInvitationAndGuest, buildInvitationMetadata } from "@/lib/guestInvitation";
import { notFound } from "next/navigation";

interface SlugPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const guestCode = resolvedSearchParams?.to || "";

  const { undangan, tamu } = await resolveInvitationAndGuest({ slug, guestCode });
  if (!undangan) {
    return { title: "Undangan Tidak Ditemukan" };
  }
  return buildInvitationMetadata({ undangan, tamu });
}

export default async function SlugInvitationPage({
  params,
  searchParams,
}: SlugPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const guestCode = resolvedSearchParams?.to || "";

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
