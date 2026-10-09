"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import { kitchen } from "@/data/dishes";
import { BananaLeaf } from "@/components/ui/BananaLeaf";

const ICONS: Record<string, React.ReactNode> = {
  fire: (
    <>
      <path d="M24 6c2 7 9 10 9 19a9 9 0 0 1-18 0c0-5 3-7 4-11 2 3 3 5 5 5 0-5-2-8 0-13Z" />
      <path d="M8 40 L40 34 M8 34 L40 40" />
    </>
  ),
  pot: (
    <>
      <path d="M8 20h32v8a12 12 0 0 1-12 12h-8A12 12 0 0 1 8 28v-8Z" />
      <path d="M5 20h38M17 14c0-3 3-3 3-6m4 6c0-3 3-3 3-6m4 6c0-3 3-3 3-6" />
    </>
  ),
  ammi: (
    <>
      <rect x="6" y="28" width="36" height="10" rx="3" />
      <rect x="14" y="20" width="22" height="7" rx="3.5" transform="rotate(-8 25 23)" />
      <circle cx="12" cy="33" r="1.4" />
      <circle cx="36" cy="33" r="1.4" />
    </>
  ),
};

export function VccWay() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} aria-labelledby="way-title" className="container-x pb-[clamp(2rem,5vw,4rem)] pt-[clamp(5rem,10vw,8rem)]">
      <h2 id="way-title" data-reveal="body" className="eyebrow flex items-center gap-3 text-leaf-700">
        <BananaLeaf veins={false} className="h-5 w-2.5 rotate-[24deg] text-leaf-500" />
        {kitchen.way.eyebrow}
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
        {kitchen.way.items.map((it) => (
          <li key={it.label} data-reveal="body" className="flex flex-col gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-700">
              {it.icon === "leaf" ? (
                <BananaLeaf className="h-9 w-4.5 rotate-[30deg] text-leaf-500" stroke="var(--leaf-100)" />
              ) : (
                <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[it.icon]}
                </svg>
              )}
            </span>
            <div>
              <p className="font-display text-xl font-extrabold leading-tight tracking-tightest">{it.label}</p>
              <p lang="ta" className="font-tamil mt-1 text-sm font-bold text-leaf-700">
                {it.ta}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
