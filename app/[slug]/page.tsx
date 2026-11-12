import MainInvitationView from "@/components/MainInvitationView";
import { resolveInvitationAndGuest } from "@/lib/guestInvitation";
import { notFound } from "next/navigation";

interface SlugPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
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
