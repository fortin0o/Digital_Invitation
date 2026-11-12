import MainInvitationView from "@/components/MainInvitationView";
import { resolveInvitationAndGuest } from "@/lib/guestInvitation";
import { notFound } from "next/navigation";

interface CleanGuestPageProps {
  params: Promise<{ slug: string; kode: string }>;
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
