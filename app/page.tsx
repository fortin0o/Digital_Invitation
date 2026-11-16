import type { Metadata } from "next";
import MainInvitationView from "@/components/invitation/MainInvitationView";
import { resolveInvitationAndGuest, buildInvitationMetadata } from "@/lib/guestInvitation";

interface PageProps {
  searchParams: Promise<{ to?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const guestCode = resolvedParams?.to || "";
  const { undangan, tamu } = await resolveInvitationAndGuest({ guestCode });
  return buildInvitationMetadata({ undangan, tamu });
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