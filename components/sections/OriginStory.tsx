"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { origin } from "@/data/story";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stamp } from "@/components/ui/Stamp";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { TornEdge } from "@/components/ui/TornEdge";

const STAMP_ROT = [-12, 9, -7, 11];
const MRZ = ["P<VCC<<CHINNA<VEERAMANGALAM<<PUDUKKOTTAI<<<<", "2018<<TN<<FIVE<COUSINS<<ONE<IDEA<<<<<<<<<<<<"];

function Guilloche() {
  // Fine wavy security lines, like a passport page background.
  const lines = Array.from({ length: 14 }, (_, i) => {
    const y = 20 + i * 22;
    return `M0 ${y} C 80 ${y - 14}, 160 ${y + 14}, 240 ${y} S 400 ${y - 14}, 480 ${y} S 640 ${y + 14}, 720 ${y}`;
  });
  return (
    <svg viewBox="0 0 720 340" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <g fill="none" stroke="var(--leaf-500)" strokeWidth="0.6" opacity="0.18">
        {lines.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx="610" cy="250" r="120" fill="none" stroke="var(--leaf-500)" strokeWidth="0.6" opacity="0.14" strokeDasharray="2 5" />
      <circle cx="610" cy="250" r="90" fill="none" stroke="var(--leaf-500)" strokeWidth="0.6" opacity="0.14" strokeDasharray="1 4" />
    </svg>
  );
}

function PassportPage({ panel, index }: { panel: (typeof origin.panels)[number]; index: number }) {
  return (
    <article
      className="og-panel relative w-full shrink-0 md:w-[clamp(340px,52vw,760px)]"
      aria-label={`${panel.stamp}: ${panel.title}`}
    >
      <div className="og-card relative flex min-h-[440px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-leaf-100 p-[clamp(1.5rem,3.5vw,3rem)] shadow-leaf md:h-[min(52svh,470px)] md:min-h-0">
        <Guilloche />
        <div className="relative flex items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.25em] text-leaf-700">
          <span>
            Village of Chinna Veeramangalam · <span lang="ta" className="font-tamil normal-case tracking-normal">கடவுச்சீட்டு</span>
          </span>
          <span className="tabular-nums">Page {String(index + 1).padStart(2, "0")}</span>
        </div>

        <div className="relative mt-auto max-w-[30ch] pt-24 md:pt-0">
          <h3 className="font-display text-[clamp(2rem,1.2rem+2.6vw,3.6rem)] font-extrabold leading-[0.95] tracking-tightest text-leaf-900">
            {panel.title}
          </h3>
          <p className="mt-4 max-w-[38ch] text-leaf-900/75">{panel.text}</p>
        </div>

        <div className="relative mt-8 border-t border-dashed border-leaf-700/25 pt-4 font-mono text-[10px] leading-relaxed tracking-[0.18em] text-leaf-700/45 md:text-[11px]" aria-hidden="true">
          {MRZ.map((l) => (
            <p key={l} className="truncate">
              {l}
            </p>
          ))}
        </div>

        <div
          className="og-stamp pointer-events-none absolute right-[6%] top-[12%] w-[clamp(140px,17vw,230px)]"
          style={{ rotate: `${STAMP_ROT[index]}deg` }}
        >
          <Stamp label={panel.stamp} sub={panel.stampSub} tone={panel.tone} shape={index % 2 ? "rect" : "round"} className="h-auto w-full" />
        </div>
      </div>
    </article>
  );
}

export function OriginStory() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      const thump = (panel: Element) => {
        const stamp = panel.querySelector(".og-stamp");
        const card = panel.querySelector(".og-card");
        return gsap
          .timeline({ paused: true })
          .fromTo(stamp, { scale: 1.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.32, ease: "power4.in" })
          .to(card, { keyframes: { x: [0, -5, 4, -2, 0], y: [0, 2, -1, 1, 0] }, duration: 0.32, ease: "none" });
      };

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const track = q(".og-track")[0] as HTMLElement;
        const distance = () => track.scrollWidth - window.innerWidth;
        const fill = q(".og-fill")[0];
        const rider = q(".og-rider")[0];
        const line = q(".og-line")[0] as HTMLElement;

        const scroll = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: q(".og-pin")[0],
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set(fill, { scaleX: self.progress });
              gsap.set(rider, { x: self.progress * line.offsetWidth });
            },
          },
        });

        q(".og-panel").forEach((panel) => {
          const tl = thump(panel);
          ScrollTrigger.create({
            trigger: panel,
            containerAnimation: scroll,
            start: "center 70%",
            onEnter: () => tl.play(0),
            onLeaveBack: () => tl.reverse(),
          });
        });
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        q(".og-panel").forEach((panel) => {
          const tl = thump(panel);
          ScrollTrigger.create({ trigger: panel, start: "top 60%", onEnter: () => tl.play(0), onLeaveBack: () => tl.reverse() });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="origin-title" className="relative bg-paper-2">
      <TornEdge position="top" color="var(--paper-2)" seed={3} />
      <div className="og-pin relative flex flex-col justify-center gap-[clamp(2rem,5svh,4rem)] overflow-hidden py-[clamp(5rem,10vw,7rem)] md:h-svh md:pb-8 md:pt-24">
        <SectionHeading
          id="origin-title"
          className="container-x"
          eyebrow={origin.eyebrow}
          parts={[
            { text: origin.title.lead, style: "display" },
            { text: origin.title.accent, style: "accent" },
          ]}
        />

        <div className="og-track container-x flex flex-col gap-8 md:w-max md:max-w-none md:flex-row md:gap-[6vw] md:pr-[24vw]">
          {origin.panels.map((p, i) => (
            <PassportPage key={p.stamp} panel={p} index={i} />
          ))}
        </div>

        {/* progress line with a leaf riding on it */}
        <div className="container-x hidden md:block" aria-hidden="true">
          <div className="og-line relative h-px w-full bg-line">
            <div className="og-fill absolute inset-0 origin-left scale-x-0 bg-leaf-500" />
            <BananaLeaf veins={false} className="og-rider absolute -left-2 -top-[9px] h-[18px] w-[9px] rotate-90 text-leaf-500" />
          </div>
        </div>
      </div>
      <TornEdge position="bottom" color="var(--paper-2)" seed={8} />
    </section>
  );
}
