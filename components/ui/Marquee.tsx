"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/layout/SmoothScroll";
import { prefersReducedMotion } from "@/lib/app-state";
import { marquee as defaultItems } from "@/data/site";

type Props = { items?: string[]; className?: string; speed?: number };

export function Marquee({ items = defaultItems, className = "", speed = 60 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;

      let x = 0;
      let dir = -1;
      let boost = 0;
      let visible = true;
      const setX = gsap.quickSetter(el, "x", "px");

      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(root.current!);

      const tick = (_t: number, dt: number) => {
        if (!visible) return;
        const v = lenis?.velocity ?? 0;
        if (lenis && Math.abs(v) > 0.1) dir = lenis.direction === 1 ? -1 : 1;
        // ease the scroll-velocity boost in and out so speed changes feel elastic
        boost += (Math.min(Math.abs(v), 60) * 0.12 - boost) * 0.08;
        const half = el.scrollWidth / 2;
        x += dir * speed * (1 + boost) * (dt / 1000);
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        setX(x);
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
      };
    },
    { scope: root, dependencies: [lenis, speed] },
  );

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {[...items, ...items].map((item, i) => (
        <span key={i} className="flex items-center">
          <span className={/[஀-௿]/.test(item) ? "font-tamil font-extrabold" : ""}>{item}</span>
          <span className="mx-[0.6em] text-[0.6em] text-leaf-900/80">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={root}
      className={`relative z-20 -rotate-2 overflow-hidden bg-turmeric py-4 text-leaf-900 shadow-leaf md:py-6 ${className}`}
      role="marquee"
      aria-label={items.join(", ")}
    >
      <div
        ref={track}
        className="font-display flex w-max whitespace-nowrap text-[clamp(1.75rem,1rem+3.5vw,4.5rem)] font-extrabold leading-none tracking-tightest uppercase will-change-transform"
      >
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}
