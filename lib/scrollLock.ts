"use client";

import { useEffect } from "react";

let lockCount = 0;

/**
 * Increment the scroll lock counter and apply overflow lock to both html and body.
 */
export function lockScroll(): void {
  if (typeof document === "undefined") return;

  lockCount += 1;
  if (lockCount === 1) {
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const lenis = (window as unknown as { __lenis?: { stop: () => void } }).__lenis;
    if (lenis && typeof lenis.stop === "function") {
      try {
        lenis.stop();
      } catch {}
    }
  }
}

/**
 * Decrement the scroll lock counter.
 * When all locks are released (counter reaches 0), completely remove all inline
 * overflow and overscroll-behavior styles and remove any stray lenis-stopped classes.
 */
export function unlockScroll(): void {
  if (typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overscroll-behavior");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("overscroll-behavior");

    document.documentElement.classList.remove("lenis-stopped");
    document.body.classList.remove("lenis-stopped");

    const lenis = (window as unknown as { __lenis?: { start: () => void } }).__lenis;
    if (lenis && typeof lenis.start === "function") {
      try {
        lenis.start();
      } catch {}
    }
  }
}

/**
 * Force clear all scroll locks regardless of counter value.
 * Used during route transitions, tab switches, and visibility recovery.
 */
export function forceUnlockScroll(): void {
  if (typeof document === "undefined") return;

  lockCount = 0;
  document.documentElement.style.removeProperty("overflow");
  document.documentElement.style.removeProperty("overscroll-behavior");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("overscroll-behavior");

  document.documentElement.classList.remove("lenis-stopped");
  document.body.classList.remove("lenis-stopped");

  const lenis = (window as unknown as { __lenis?: { start: () => void } }).__lenis;
  if (lenis && typeof lenis.start === "function") {
    try {
      lenis.start();
    } catch {}
  }
}

/**
 * Custom React hook for robust, leak-free modal/drawer scroll locking.
 * Guarantees proper unlocking on component unmount and state transitions.
 */
export function useScrollLock(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [isActive]);
}

// Global failsafe: when tab regains visibility after being idle or backgrounded,
// if no modals are open (lockCount === 0), verify that html and body are not stuck.
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && lockCount === 0) {
      forceUnlockScroll();
    }
  });
}
