"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * LenisProvider — wraps the app in Lenis smooth scroll.
 *
 * Lenis is initialized once on mount with a warm, weighted feel (lerp 0.08).
 * The RAF loop is managed manually so we can sync with Framer Motion if needed.
 * On unmount, the instance is destroyed to avoid memory leaks.
 */
export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,          // scroll duration (higher = slower/weightier)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Intercept all in-page anchor clicks so Lenis handles the scroll
    // instead of the browser jumping instantly.
    function handleAnchorClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { duration: 1.4 });
    }

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
