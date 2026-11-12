import MainInvitationView from "@/components/MainInvitationView";
import { resolveInvitationAndGuest } from "@/lib/guestInvitation";

interface PageProps {
  searchParams: Promise<{ to?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const guestCode = resolvedParams?.to || "";
  const { undangan, tamu } = await resolveInvitationAndGuest({ guestCode });

  return (
    <MainInvitationView
      tamu={tamu}
      guestCode={guestCode}
      undangan={undangan}
    />
  );
}