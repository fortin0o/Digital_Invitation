import { supabase } from "@/lib/supabase";
import MainInvitationView from "@/components/MainInvitationView";
import { notFound } from "next/navigation";

interface CleanGuestPageProps {
  params: Promise<{ slug: string; kode: string }>;
}

export default async function CleanGuestInvitationPage({
  params,
}: CleanGuestPageProps) {
  const { slug, kode } = await params;

  // 1. Fetch wedding invitation by slug
  const { data: undangan } = await supabase
    .from("undangan")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  // If slug is not found, fallback to first active invitation
  let activeUndangan = undangan;
  if (!activeUndangan) {
    const { data: fallbackUndangan } = await supabase
      .from("undangan")
      .select("*")
      .limit(1)
      .maybeSingle();
    activeUndangan = fallbackUndangan;
  }

  if (!activeUndangan) {
    notFound();
  }

  // 2. Fetch guest by personal unique code or guest name fallback
  let { data: tamu } = await supabase
    .from("tamu")
    .select("*")
    .eq("kode", kode)
    .maybeSingle();

  if (!tamu) {
    // Fallback: match by guest name slug (e.g. "sinta-dewi" -> "Sinta Dewi")
    const cleanSearchName = decodeURIComponent(kode).replace(/-/g, " ").trim();
    const { data: matchedByName } = await supabase
      .from("tamu")
      .select("*")
      .ilike("nama_tamu", `%${cleanSearchName}%`)
      .limit(1)
      .maybeSingle();

    if (matchedByName) {
      tamu = matchedByName;
    }
  }

  return (
    <MainInvitationView
      tamu={tamu || null}
      guestCode={kode}
      undangan={activeUndangan}
    />
  );
}
