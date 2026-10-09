"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { story, timeline } from "@/data/timeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BananaLeaf } from "@/components/ui/BananaLeaf";

export function Timeline() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rider = q(".tl-rider")[0];
        const line = q(".tl-draw")[0] as unknown as SVGLineElement;
        // the centre line draws itself with a leaf riding the tip (Lenis already smooths the scroll)
        const draw = (p: number) => {
          line.style.strokeDashoffset = String(1 - p); // plain style: GSAP doesn't apply this one to an SVG <line>
          gsap.set(rider, { y: p * (list.current?.offsetHeight ?? 0), rotation: 180 });
        };
        draw(0);
        ScrollTrigger.create({
          trigger: list.current,
          start: "top 60%",
          end: "bottom 60%",
          onUpdate: (self) => draw(self.progress),
          onRefresh: (self) => draw(self.progress),
        });

        // each card pops in with a stamped date
        q(".tl-item").forEach((item) => {
          gsap
            .timeline({ scrollTrigger: { trigger: item, start: "top 78%", once: true } })
            .from(item.querySelector(".tl-card"), { y: 40, autoAlpha: 0, duration: 0.9, ease: "expo.out" })
            .fromTo(item.querySelector(".tl-date"), { scale: 1.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.32, ease: "power4.in" }, 0.25)
            .from(item.querySelector(".tl-dot"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0.2);
        });
      });
      // card heights settle after fonts: keep the draw range honest
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="timeline-title" className="relative py-[clamp(5rem,10vw,8rem)]">
      <div className="container-x">
        <SectionHeading
          id="timeline-title"
          align="center"
          eyebrow="2018 → today"
          parts={[
            { text: story.timelineTitle.lead, style: "display" },
            { text: story.timelineTitle.accent, style: "accent" },
          ]}
        />

        <ol ref={list} className="relative mx-auto mt-[clamp(3rem,7vw,5rem)] max-w-5xl">
          {/* centre line (left edge on mobile) */}
          <svg
            aria-hidden="true"
            className="absolute bottom-0 left-[19px] top-0 h-full w-1 md:left-1/2 md:-translate-x-1/2"
            viewBox="0 0 4 100"
            preserveAspectRatio="none"
          >
            <line x1="2" y1="0" x2="2" y2="100" stroke="var(--line)" strokeWidth="2" />
            <line
              className="tl-draw"
              x1="2"
              y1="0"
              x2="2"
              y2="100"
              stroke="var(--leaf-500)"
              strokeWidth="3"
              pathLength={1}
              strokeDasharray="1"
            />
          </svg>
          <BananaLeaf
            veins={false}
            className="tl-rider pointer-events-none absolute left-[13px] top-0 z-10 h-6 w-3 text-leaf-500 motion-reduce:hidden md:left-1/2 md:-ml-1.5"
          />

          {timeline.map((m, i) => {
            const right = i % 2 === 1;
            return (
              <li key={m.date} className="tl-item relative grid grid-cols-[40px_1fr] pb-10 md:grid-cols-2 md:gap-16 md:pb-14">
                <span
                  aria-hidden="true"
                  className="tl-dot absolute left-[13px] top-6 h-3.5 w-3.5 rounded-full border-[3px] border-paper bg-leaf-700 md:left-1/2 md:-ml-[7px]"
                />
                <div className={`tl-card col-start-2 ${right ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}>
                  <div className={`flex flex-col gap-3 ${right ? "md:items-start" : "md:items-end"}`}>
                    <time
                      className="tl-date inline-block -rotate-3 rounded-md border-[2.5px] border-turmeric-ink px-3 py-1 font-display text-sm font-extrabold uppercase tracking-wider text-turmeric-ink"
                      style={{ filter: "url(#vcc-stamp-rough)" }}
                    >
                      {m.date}
                    </time>
                    <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-[0_20px_40px_-28px_rgba(15,46,23,.45)]">
                      <h3 className="font-display text-2xl font-extrabold leading-tight tracking-tightest">{m.title}</h3>
                      <p className="mt-2 text-leaf-900/75">{m.text}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
