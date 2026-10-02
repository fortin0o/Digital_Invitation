"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="w-full min-h-screen bg-[#FAF6F0] flex items-center justify-center">
      <p className="font-sans text-xs text-[#8C7B6B] animate-pulse">
        Membuka halaman admin...
      </p>
    </div>
  );
}
