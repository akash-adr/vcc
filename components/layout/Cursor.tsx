"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const canUseCursor = () => window.matchMedia(QUERY).matches;
const subscribeMedia = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// 10px dot → 64px labelled ring over [data-cursor="View|Play|Drag"].
// Drawn in paper colour with mix-blend difference, so it reads as deep green on paper and inverts over video.
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const enabled = useSyncExternalStore(subscribeMedia, canUseCursor, () => false);

  useEffect(() => {
    if (!enabled || !el.current) return;
    const node = el.current;
    document.documentElement.classList.add("has-cursor");
    gsap.set(node, { xPercent: -50, yPercent: -50, scale: 10 / 64, autoAlpha: 0 });
    const xTo = gsap.quickTo(node, "x", { duration: 0.45, ease: "expo.out" });
    const yTo = gsap.quickTo(node, "y", { duration: 0.45, ease: "expo.out" });
    let current = "";
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.set(node, { x: e.clientX, y: e.clientY });
        gsap.to(node, { autoAlpha: 1, duration: 0.3 });
        shown = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const target = t?.closest?.("[data-cursor]");
      const next = target?.getAttribute("data-cursor") ?? (t?.closest?.("a,button,[role=button]") ? "·" : "");
      if (next === current) return;
      current = next;
      setLabel(next === "·" ? "" : next);
      gsap.to(node, { scale: next === "" ? 10 / 64 : next === "·" ? 0.5 : 1, duration: 0.5, ease: "expo.out" });
    };

    const leaveWindow = () => {
      gsap.to(node, { autoAlpha: 0, duration: 0.3 });
      shown = false;
    };
    const down = () => gsap.to(node, { scale: "*=0.8", duration: 0.2 });
    const up = () => gsap.to(node, { scale: current === "" ? 10 / 64 : current === "·" ? 0.5 : 1, duration: 0.4 });

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leaveWindow);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leaveWindow);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={el}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[110] flex h-16 w-16 items-center justify-center rounded-full bg-paper mix-blend-difference"
    >
      <span className="eyebrow text-[10px] tracking-[0.2em] text-black">{label}</span>
    </div>
  );
}
