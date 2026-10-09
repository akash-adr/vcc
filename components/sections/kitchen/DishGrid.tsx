"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Flip, gsap } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { dishCategories, dishes, kitchen, type Dish } from "@/data/dishes";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DishVisual, FireLevel } from "./DishVisual";
import { DishDrawer } from "./DishDrawer";

type Filter = (typeof dishCategories)[number];

export function DishGrid() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<Dish | null>(null);
  useReveal(root);

  const choose = (f: Filter) => {
    if (f === filter) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flipState.current = Flip.getState(grid.current!.querySelectorAll(".dg-card"));
    }
    setFilter(f);
  };

  // Every card stays in the DOM (hidden when filtered out) so Flip can animate leavers as well as movers.
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.7,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.6, delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4 }),
    });
  }, [filter]);

  const shown = (d: Dish) => filter === "All" || d.category === filter;
  const count = dishes.filter(shown).length;

  return (
    <section ref={root} aria-labelledby="dishes-title" className="relative py-[clamp(5rem,10vw,8rem)]">
      <div className="container-x">
        <SectionHeading
          id="dishes-title"
          eyebrow={kitchen.dishesEyebrow}
          parts={[
            { text: kitchen.dishesTitle.lead, style: "display" },
            { text: kitchen.dishesTitle.accent, style: "accent" },
          ]}
        />

        <div data-reveal="body" className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter dishes">
          {dishCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => choose(c)}
              aria-pressed={filter === c}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                filter === c ? "bg-leaf-900 text-paper" : "border border-line bg-white text-leaf-900 hover:bg-leaf-100"
              }`}
            >
              {c}
            </button>
          ))}
          <p className="sr-only" aria-live="polite">
            Showing {count} {count === 1 ? "dish" : "dishes"}
          </p>
        </div>
      </div>

      {/* the long banana leaf the dishes are served on */}
      <div className="relative mt-10">
        <div
          aria-hidden="true"
          className="absolute inset-x-[2vw] bottom-[-2rem] top-[3rem] rounded-[48px] bg-[linear-gradient(180deg,#5DAA45,#3E8A2F)] shadow-leaf"
        >
          <div className="absolute inset-0 rounded-[48px] opacity-30 [background:repeating-linear-gradient(100deg,transparent_0_38px,rgba(227,240,211,.55)_38px_39.5px)]" />
          <div className="absolute inset-x-6 top-5 h-1.5 rounded-full bg-leaf-100/80" />
        </div>

        <ul ref={grid} className="container-x relative grid grid-cols-1 gap-5 pb-4 pt-20 sm:grid-cols-2 lg:grid-cols-3" aria-label="Signature dishes">
          {dishes.map((d) => (
            <li key={d.id} data-flip-id={d.id} className={`dg-card ${shown(d) ? "" : "hidden"}`}>
              <button
                type="button"
                onClick={() => setOpen(d)}
                aria-haspopup="dialog"
                className="group flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white text-left shadow-[0_20px_40px_-24px_rgba(15,46,23,.5)] transition-transform duration-500 hover:-translate-y-1"
                data-cursor="View"
              >
                <DishVisual dish={d} className="h-40 transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-leaf-700">{d.category}</span>
                    <FireLevel level={d.fire} />
                  </div>
                  <h3 className="font-display text-2xl font-extrabold leading-none tracking-tightest">{d.title}</h3>
                  <p lang="ta" className="font-tamil text-sm font-bold text-leaf-700">
                    {d.ta}
                  </p>
                  <p className="text-sm leading-snug text-leaf-900/75">{d.line}</p>
                  <span className="mt-auto pt-3 text-sm font-bold text-leaf-900 underline decoration-leaf-300 decoration-2 underline-offset-4 group-hover:decoration-leaf-700">
                    How they cook it →
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open && <DishDrawer dish={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
