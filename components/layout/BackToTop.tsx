"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "./SmoothScroll";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { prefersReducedMotion } from "@/lib/app-state";

// The leaf takes off, then the page follows it up.
export function BackToTop({ label }: { label: string }) {
  const leaf = useRef<HTMLSpanElement>(null);

  const go = () => {
    const lenis = getLenis();
    const scroll = () => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" }));
    if (prefersReducedMotion()) return scroll();
    gsap
      .timeline()
      .to(leaf.current, { y: -70, x: 10, rotate: 60, autoAlpha: 0, duration: 0.55, ease: "power2.in" })
      .add(scroll, 0.2)
      .set(leaf.current, { y: 30, x: 0, rotate: 0 })
      .to(leaf.current, { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out" }, "+=0.6");
  };

  return (
    <button
      type="button"
      onClick={go}
      className="group inline-flex items-center gap-3 rounded-full border border-paper/20 py-2 pl-3 pr-5 text-sm font-bold text-paper transition-colors hover:border-turmeric hover:text-turmeric"
    >
      <span ref={leaf} className="inline-block">
        <BananaLeaf veins={false} className="h-6 w-3 text-leaf-500 transition-transform duration-500 group-hover:-translate-y-0.5" />
      </span>
      {label}
    </button>
  );
}
