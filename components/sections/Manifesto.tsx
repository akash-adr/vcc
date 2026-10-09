"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { manifesto } from "@/data/story";

// "*word*" → serif italic turmeric accent
const words = manifesto.statement.split(" ").map((w) => ({ text: w.replace(/\*/g, ""), accent: w.startsWith("*") }));

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        // Scroll-linked ink fill, word by word.
        // GSAP interpolates real colours, not var() strings, so read the tokens once.
        const css = getComputedStyle(document.documentElement);
        const token = (n: string) => css.getPropertyValue(n).trim();
        gsap.fromTo(
          q(".mf-word"),
          // unfilled ink at 55% still clears 3:1 for this large text
          { color: "rgba(15, 46, 23, 0.55)" },
          {
            color: (_i: number, el: Element) => token(el.classList.contains("mf-accent") ? "--turmeric-ink" : "--leaf-900"),
            stagger: 0.1,
            duration: 0.3,
            ease: "none",
            scrollTrigger: { trigger: q(".mf-statement")[0], start: "top 80%", end: "bottom 45%", scrub: 0.6 },
          },
        );

        gsap.fromTo(
          q(".mf-backdrop"),
          { xPercent: 8 },
          { xPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Manifesto" className="relative overflow-hidden pb-[clamp(4rem,9vw,8rem)] pt-[clamp(6rem,14vw,12rem)]">
      <p
        aria-hidden="true"
        lang="ta"
        className="mf-backdrop font-tamil pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[34vw] font-extrabold leading-none text-leaf-900 opacity-[0.04]"
      >
        {manifesto.backdrop}
      </p>
      <p className="mf-statement container-x relative mx-auto max-w-[17ch] text-center font-display text-[clamp(2.4rem,6vw,6.25rem)] font-extrabold leading-[1.02] tracking-tightest text-leaf-900 md:max-w-[19ch]">
        {words.map((w, i) => (
          <span key={i}>
            <span className={w.accent ? "mf-word mf-accent font-serif font-normal italic tracking-normal" : "mf-word"}>{w.text}</span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}
