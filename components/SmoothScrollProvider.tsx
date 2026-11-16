"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Disable Lenis completely on admin dashboard routes to allow native modal and table scrolling
    if (pathname?.startsWith("/admin")) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
      return;
    }

    // Initialize Lenis for public invitation pages
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      prevent: (node) => {
        return (
          node.hasAttribute("data-lenis-prevent") ||
          Boolean(node.closest?.("[data-lenis-prevent]"))
        );
      },
    });

    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [pathname]);

  return <>{children}</>;
}

