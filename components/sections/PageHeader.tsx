"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onPageReady } from "@/lib/app-state";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { TornEdge } from "@/components/ui/TornEdge";

// Secondary-page header: serif kicker over a giant Bricolage word, chars rising like the hero.
export function PageHeader({ kicker, title, line, seed = 41 }: { kicker: string; title: string; line: string; seed?: number }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const q = gsap.utils.selector(root);
      const intro = contextSafe!(() => {
        gsap.set(q(".ph-i"), { autoAlpha: 1 });
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const split = SplitText.create(q(".ph-title")[0], { type: "chars", mask: "chars", charsClass: "split-mask", aria: "none" });
        gsap
          .timeline({ delay: 0.1 })
          .from(q(".ph-kicker"), { xPercent: -20, autoAlpha: 0, filter: "blur(8px)", duration: 1.2 })
          .from(split.chars, { yPercent: 110, duration: 1.2, stagger: 0.035 }, 0.05)
          .from(q(".ph-line"), { y: 20, autoAlpha: 0, duration: 0.9 }, 0.5);
      });
      return onPageReady(intro);
    },
    { scope: root },
  );

  return (
    <header ref={root} className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden bg-paper-2 pb-[clamp(3.5rem,8vw,6rem)] pt-32">
      <BananaLeaf
        className="pointer-events-none absolute right-[6%] top-[18%] h-[clamp(9rem,22vw,20rem)] w-auto rotate-[28deg] animate-[leaf-float_9s_ease-in-out_infinite] text-leaf-300/70"
        stroke="var(--paper-2)"
      />
      <div className="container-x relative">
        <p aria-hidden="true" className="ph-kicker ph-i font-serif text-[clamp(2.5rem,1.5rem+5vw,7rem)] italic leading-none text-leaf-700">{kicker}</p>
        <h1 className="font-display text-[clamp(4.5rem,1rem+17vw,19rem)] font-extrabold uppercase leading-[0.8] tracking-tightest text-leaf-900">
          <span className="sr-only">
            {kicker} {title}
          </span>
          <span aria-hidden="true" className="ph-title ph-i block">
            {title}
          </span>
        </h1>
        <p className="ph-line ph-i mt-6 max-w-xl text-[clamp(1.05rem,0.9rem+0.6vw,1.4rem)] font-semibold text-leaf-900/80">{line}</p>
      </div>
      <TornEdge position="bottom" color="var(--paper-2)" seed={seed} />
    </header>
  );
}
