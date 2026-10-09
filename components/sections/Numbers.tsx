"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { stats, statsMeta, type Stat } from "@/data/stats";
import { SectionHeading } from "@/components/ui/SectionHeading";

const layout: Record<Stat["size"], string> = {
  hero: "col-span-2 md:row-span-2 min-h-[300px] md:min-h-[440px] bg-turmeric border-transparent",
  wide: "col-span-2 min-h-[200px] bg-leaf-100",
  small: "col-span-1 min-h-[200px] bg-leaf-100",
  text: "col-span-1 md:col-span-3 min-h-[200px] bg-leaf-100",
};

function Diamond() {
  // Faceted gem with a slow 3D spin.
  return (
    <div className="[perspective:400px]" aria-hidden="true">
      <svg viewBox="0 0 64 56" className="h-14 w-16 animate-[gem-spin_6s_linear_infinite] [transform-style:preserve-3d]">
        <defs>
          <linearGradient id="gem-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E3F0D3" />
            <stop offset="1" stopColor="#4E9A3A" />
          </linearGradient>
          <linearGradient id="gem-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#A9D18E" />
          </linearGradient>
        </defs>
        <path d="M14 4 H50 L62 18 L32 54 L2 18 Z" fill="url(#gem-a)" />
        <path d="M14 4 L22 18 H42 L50 4 Z" fill="url(#gem-b)" />
        <path d="M2 18 H62 M22 18 L32 54 L42 18 M14 4 L22 18 M50 4 L42 18" fill="none" stroke="#0F2E17" strokeWidth="1.2" strokeLinejoin="round" opacity="0.55" />
        <path d="M14 4 H50 L62 18 L32 54 L2 18 Z" fill="none" stroke="#0F2E17" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StatCell({ stat }: { stat: Stat }) {
  const isHero = stat.size === "hero";
  return (
    <li
      className={`nb-cell group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-line p-6 transition-shadow duration-500 will-change-transform hover:shadow-leaf md:p-8 ${layout[stat.size]}`}
    >
      {stat.value !== undefined ? (
        <>
          <span className={`eyebrow ${isHero ? "text-leaf-900/70" : "text-leaf-700"}`}>{stat.id === "subs" ? "The family" : " "}</span>
          <div>
            <p
              className={`font-display font-extrabold leading-[0.82] tracking-tightest tabular-nums transition-colors duration-500 ${
                isHero
                  ? "text-[clamp(6rem,4rem+10vw,15rem)] text-leaf-900 group-hover:text-paper"
                  : "text-[clamp(3.25rem,2rem+3.5vw,5.5rem)] text-leaf-900 group-hover:text-leaf-500"
              }`}
              aria-label={`${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""}`}
            >
              <span aria-hidden="true">
                {stat.prefix}
                <span className="nb-num" data-value={stat.value}>
                  {stat.value}
                </span>
                {stat.suffix}
              </span>
            </p>
            <p className={`mt-3 max-w-[22ch] font-semibold ${isHero ? "text-lg text-leaf-900" : "text-sm text-leaf-900/70"}`}>{stat.label}</p>
          </div>
        </>
      ) : (
        <>
          <Diamond />
          <p className="font-display text-[clamp(1.4rem,1rem+1vw,1.9rem)] font-extrabold leading-[1.05] tracking-tightest text-leaf-900 transition-colors duration-500 group-hover:text-leaf-500">
            {stat.label}
          </p>
        </>
      )}
    </li>
  );
}

export function Numbers() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Count up once in view.
        q(".nb-num").forEach((el) => {
          const target = Number(el.dataset.value);
          const obj = { v: 0 };
          el.textContent = "0";
          gsap.to(obj, {
            v: target,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString("en-IN")),
          });
        });

        gsap.from(q(".nb-cell"), {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          stagger: 0.08,
          scrollTrigger: { trigger: q(".nb-grid")[0], start: "top 85%", once: true },
        });
      });

      // Gentle 3D tilt on fine pointers (max 6deg).
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const offs = (q(".nb-cell") as HTMLElement[]).map((cell) => {
          const rx = gsap.quickTo(cell, "rotationX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(cell, "rotationY", { duration: 0.6, ease: "power3.out" });
          gsap.set(cell, { transformPerspective: 900 });
          const move = (e: PointerEvent) => {
            const r = cell.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 12);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          cell.addEventListener("pointermove", move);
          cell.addEventListener("pointerleave", leave);
          return () => {
            cell.removeEventListener("pointermove", move);
            cell.removeEventListener("pointerleave", leave);
          };
        });
        return () => offs.forEach((off) => off());
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="numbers-title" className="relative py-[clamp(6rem,12vw,10rem)]">
      <div className="container-x">
        <SectionHeading
          id="numbers-title"
          eyebrow={statsMeta.eyebrow}
          parts={[
            { text: statsMeta.title.lead, style: "display" },
            { text: statsMeta.title.accent, style: "accent" },
          ]}
        />
        <ul className="nb-grid mt-[clamp(2.5rem,5vw,4rem)] grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map((s) => (
            <StatCell key={s.id} stat={s} />
          ))}
        </ul>
        <p data-reveal="body" className="mt-5 text-xs text-leaf-900/70">
          {statsMeta.asOf}
        </p>
      </div>
    </section>
  );
}
