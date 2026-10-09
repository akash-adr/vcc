"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import { story } from "@/data/timeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TornEdge } from "@/components/ui/TornEdge";

export function Values() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <section ref={root} aria-labelledby="values-title" className="relative bg-paper-2 py-[clamp(5rem,10vw,8rem)]">
      <TornEdge position="top" color="var(--paper-2)" seed={61} />
      <div className="container-x">
        <SectionHeading
          id="values-title"
          eyebrow="What they stand for"
          parts={[
            { text: "Three things,", style: "display" },
            { text: "every video.", style: "accent" },
          ]}
        />
        <ul className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-4 md:grid-cols-3">
          {story.values.map((v, i) => (
            <li
              key={v.title}
              data-reveal="body"
              className={`relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-line p-7 md:min-h-[420px] ${
                i === 1 ? "bg-turmeric" : "bg-white"
              }`}
            >
              <span
                lang="ta"
                aria-hidden="true"
                className={`font-tamil pointer-events-none absolute -right-2 top-4 whitespace-nowrap text-[clamp(4rem,2rem+5vw,6.5rem)] font-extrabold leading-none ${
                  i === 1 ? "text-leaf-900/15" : "text-leaf-500/15"
                }`}
              >
                {v.ta}
              </span>
              <span className="font-display text-sm font-extrabold tabular-nums text-leaf-900/70">0{i + 1}</span>
              <h3 className="mt-2 font-display text-[clamp(2.25rem,1.5rem+2vw,3.25rem)] font-extrabold leading-none tracking-tightest">{v.title}</h3>
              <p className="mt-3 max-w-[28ch] font-medium text-leaf-900/80">{v.line}</p>
              <p lang="ta" className="font-tamil mt-4 text-lg font-bold text-leaf-900/70">
                {v.ta}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <TornEdge position="bottom" color="var(--paper-2)" seed={67} />
    </section>
  );
}
