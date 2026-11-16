"use client";

import React, { useEffect } from "react";
import { forceUnlockScroll } from "@/lib/scrollLock";

/**
 * SmoothScrollProvider ensures smooth scrolling natively across all browsers
 * without virtual scroll hijacking or RAF-loop freezing after tab inactivity.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Failsafe: on mount, ensure no lingering scroll locks from previous sessions
    forceUnlockScroll();
  }, []);

  return <>{children}</>;
}

