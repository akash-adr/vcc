"use client";

import Lenis from "lenis";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/app-state";

// Lenis lives in a tiny external store so any component can read it without prop drilling.
let current: Lenis | null = null;
const subs = new Set<() => void>();
const setLenis = (l: Lenis | null) => {
  current = l;
  subs.forEach((s) => s());
};
const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

export const getLenis = () => current;
export const useLenis = () => useSyncExternalStore(subscribe, getLenis, () => null);

// ── Scroll lock ──
// One owner for "stop scrolling": each overlay takes a named lock and releases it. Scrolling resumes only
// when every lock is gone, so overlapping overlays (menu, drawer, lightbox, loader…) can't leave the page frozen.
const locks = new Set<string>();
function applyLocks() {
  const locked = locks.size > 0;
  if (current) {
    if (locked) current.stop();
    else current.start();
  }
  // native fallback when Lenis is off (reduced motion)
  document.documentElement.style.overflow = locked && !current ? "hidden" : "";
}
export function lockScroll(key: string) {
  locks.add(key);
  applyLocks();
}
export function unlockScroll(key: string) {
  locks.delete(key);
  applyLocks();
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // lerp (not a fixed duration) keeps the page glued to the wheel/trackpad: smooth, but no long glide after input stops
    const instance = new Lenis({ lerp: 0.14, wheelMultiplier: 1, smoothWheel: true, autoRaf: false });
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);
    applyLocks(); // honour any lock taken before Lenis existed (e.g. the loader)
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
