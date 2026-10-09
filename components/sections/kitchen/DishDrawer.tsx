"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/components/layout/SmoothScroll";
import { prefersReducedMotion } from "@/lib/app-state";
import type { Dish } from "@/data/dishes";
import { searchUrl, videos } from "@/data/videos";
import { DishVisual, FireLevel } from "./DishVisual";

function watchUrl(dish: Dish) {
  const v = videos.find((x) => x.id === dish.video);
  if (v?.youtubeId) return `https://www.youtube.com/watch?v=${v.youtubeId}`;
  return searchUrl(v?.title ?? dish.title);
}

// Side drawer on desktop, bottom sheet on mobile. Modal: focus is trapped, Esc and backdrop close it.
export function DishDrawer({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (prefersReducedMotion()) return onClose();
    const sheet = window.matchMedia("(max-width: 767px)").matches;
    gsap
      .timeline({ onComplete: onClose })
      .to(panel.current, sheet ? { yPercent: 100, duration: 0.45, ease: "power3.in" } : { xPercent: 100, duration: 0.45, ease: "power3.in" })
      .to(root.current, { autoAlpha: 0, duration: 0.25 }, "-=0.2");
  };
  const onEscape = useEffectEvent(close);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    lockScroll("dish-drawer");
    closeBtn.current?.focus();

    if (!prefersReducedMotion()) {
      const sheet = window.matchMedia("(max-width: 767px)").matches;
      // opacity only: autoAlpha would hide the dialog (visibility) and block the initial focus
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(panel.current, sheet ? { yPercent: 100 } : { xPercent: 100 }, { yPercent: 0, xPercent: 0, duration: 0.7, ease: "expo.out" });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>("button, a[href]");
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll("dish-drawer");
      opener?.focus();
    };
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[95] bg-leaf-900/45 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-drawer-title"
        data-lenis-prevent
        className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[var(--radius-card)] bg-paper shadow-leaf md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(480px,92vw)] md:rounded-l-[var(--radius-card)] md:rounded-tr-none"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-leaf-900/15 md:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between px-6 pt-5 md:px-8 md:pt-8">
          <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-leaf-700">{dish.category}</span>
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-bold text-leaf-900 hover:bg-leaf-100"
          >
            Close <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="px-6 pb-8 pt-5 md:px-8">
          <DishVisual dish={dish} className="h-44 rounded-[22px]" />
          <h2 id="dish-drawer-title" className="mt-6 font-display text-[2.2rem] font-extrabold leading-[0.95] tracking-tightest">
            {dish.title}
          </h2>
          <p lang="ta" className="font-tamil mt-1 text-lg font-bold text-leaf-700">
            {dish.ta}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-leaf-900/70">
            <FireLevel level={dish.fire} /> <span>Fire level</span>
          </div>
          <p className="mt-5 leading-relaxed text-leaf-900/80">{dish.description}</p>

          <h3 className="eyebrow mt-8 text-leaf-700">How they cook it</h3>
          <ol className="mt-4 space-y-4">
            {dish.steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-900 text-sm font-extrabold text-paper">
                  {i + 1}
                </span>
                <p className="pt-1.5 leading-snug text-leaf-900/85">{s}</p>
              </li>
            ))}
          </ol>

          <a
            href={watchUrl(dish)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-turmeric px-6 py-3 text-sm font-bold text-leaf-900 transition-colors hover:bg-leaf-900 hover:text-paper"
          >
            Watch on YouTube <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
