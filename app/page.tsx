import { supabase } from "@/lib/supabase";
import MainInvitationView from "@/components/MainInvitationView";

interface PageProps {
  searchParams: Promise<{ to?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const guestCode = resolvedParams?.to || "";

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

  const { data: undangan } = await supabase
    .from("undangan")
    .select("*")
    .limit(1)
    .maybeSingle();

  return (
    <MainInvitationView
      tamu={tamu}
      guestCode={guestCode}
      undangan={undangan}
    />
  );
}