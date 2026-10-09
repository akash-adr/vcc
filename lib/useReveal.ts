"use client";

import type { RefObject } from "react";
import { gsap, SplitText, useGSAP } from "./gsap";

/**
 * The site-wide section reveal. Mark elements inside `scope` with:
 *  data-reveal="heading" → words rise from a mask (stagger 0.06)
 *  data-reveal="body"    → fades up 24px
 *  data-reveal="media"   → clip-path inset opens while [data-reveal-inner] scales 1.08 → 1
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll<HTMLElement>('[data-reveal="heading"]').forEach((el) => {
          SplitText.create(el, {
            type: "words",
            mask: "words",
            wordsClass: "split-mask",
            aria: "none", // words stay whole, so the text reads naturally without an aria-label
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.words, {
                yPercent: 110,
                duration: 1.1,
                stagger: 0.06,
                ease: "expo.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              }),
          });
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="body"]').forEach((el) => {
          gsap.from(el, { y: 24, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        });

        root.querySelectorAll<HTMLElement>('[data-reveal="media"]').forEach((el) => {
          const inner = el.querySelector("[data-reveal-inner]");
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
          tl.fromTo(
            el,
            { clipPath: "inset(12% 10% 12% 10% round 28px)" },
            { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.3, ease: "expo.out", clearProps: "clipPath" },
          );
          if (inner) tl.fromTo(inner, { scale: 1.08 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0);
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
