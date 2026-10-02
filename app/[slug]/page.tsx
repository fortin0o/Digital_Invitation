import { supabase } from "@/lib/supabase";
import MainInvitationView from "@/components/MainInvitationView";
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

  // 1. Fetch wedding invitation by slug
  const { data: undangan } = await supabase
    .from("undangan")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  let activeUndangan = undangan;

  // If slug doesn't match and isn't found, check if fallback exists
  if (!activeUndangan) {
    const { data: fallbackUndangan } = await supabase
      .from("undangan")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!fallbackUndangan) {
      notFound();
    }
    activeUndangan = fallbackUndangan;
  }

  // 2. Fetch guest data if guestCode is provided (by code or name fallback)
  let tamu = null;
  if (guestCode) {
    const { data } = await supabase
      .from("tamu")
      .select("*")
      .eq("kode", guestCode)
      .maybeSingle();
    tamu = data;

    if (!tamu) {
      const cleanSearch = decodeURIComponent(guestCode).replace(/-/g, " ").trim();
      const { data: matched } = await supabase
        .from("tamu")
        .select("*")
        .ilike("nama_tamu", `%${cleanSearch}%`)
        .limit(1)
        .maybeSingle();
      if (matched) tamu = matched;
    }
  }

  return (
    <MainInvitationView
      tamu={tamu}
      guestCode={guestCode}
      undangan={activeUndangan}
    />
  );
}
