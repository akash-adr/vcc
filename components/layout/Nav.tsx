"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { lockScroll, unlockScroll, useLenis } from "./SmoothScroll";
import { TransitionLink } from "./PageTransition";
import { BananaLeaf, LEAF_OUTLINE } from "@/components/ui/BananaLeaf";
import { PillButton } from "@/components/ui/PillButton";
import { nav, site } from "@/data/site";
import { prefersReducedMotion } from "@/lib/app-state";

function Logo() {
  return (
    <TransitionLink href="/" className="flex items-center gap-2 rounded-full pr-1" aria-label={`${site.short} home`}>
      <BananaLeaf className="h-7 w-3.5 rotate-[24deg] text-leaf-500" stroke="var(--paper)" />
      <span className="font-display text-lg font-extrabold leading-none tracking-tightest">{site.short}</span>
    </TransitionLink>
  );
}

function LeafUnderline() {
  return (
    <svg viewBox="0 0 40 8" className="absolute -bottom-1 left-1/2 h-2 w-8 -translate-x-1/2 text-leaf-500" aria-hidden="true">
      <path d="M2 4 C12 -1 28 -1 38 4 C28 9 12 9 2 4 Z" fill="currentColor" />
      <path d="M3 4 L37 4" stroke="var(--paper)" strokeWidth="0.8" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let hidden = false;
    const apply = (y: number, dir: number) => {
      const hide = y > 120 && dir === 1 && !open;
      if (hide === hidden) return;
      hidden = hide;
      gsap.to(bar.current, { yPercent: hide ? -160 : 0, duration: 0.7, ease: "expo.out" });
    };
    if (lenis) {
      const off = lenis.on("scroll", (l) => apply(l.scroll, l.direction));
      return () => off();
    }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      apply(y, y > last ? 1 : -1);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lenis, open]);

  // Mobile menu: a leaf unfurls from the toggle to fill the screen, links stagger up.
  useGSAP(
    () => {
      const q = gsap.utils.selector(menu);
      tl.current = gsap
        .timeline({ paused: true })
        .set(menu.current, { autoAlpha: 1 })
        .fromTo(q(".mm-leaf"), { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.9, ease: "power4.inOut" })
        .fromTo(q(".mm-link"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, "-=0.35")
        .fromTo(q(".mm-foot"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.6");
    },
    { scope: menu },
  );

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (open) {
      lockScroll("menu");
      if (prefersReducedMotion()) t.progress(1);
      else t.timeScale(1).play();
    } else {
      unlockScroll("menu");
      if (prefersReducedMotion()) t.progress(0);
      else t.timeScale(1.6).reverse();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-3 z-[70] flex justify-center px-3 md:top-5"
      >
        <nav
          aria-label="Primary"
          className="flex w-full max-w-[720px] items-center justify-between gap-4 rounded-full border border-line bg-white/80 py-2 pl-5 pr-2 text-leaf-900 shadow-[0_10px_40px_-18px_rgba(15,46,23,.35)] backdrop-blur-xl"
        >
          <Logo />
          <ul className="hidden items-center gap-1 md:flex">
            {nav.links.map((l) => (
              <li key={l.href}>
                <TransitionLink
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="relative block rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-leaf-500"
                >
                  {l.label}
                  {isActive(l.href) && <LeafUnderline />}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <PillButton href={nav.cta.href} variant="accent" className="!px-5 !py-2.5">
                {nav.cta.label}
              </PillButton>
            </span>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-leaf-900 text-paper md:hidden"
            >
              <span className={`absolute h-[2px] w-4 bg-current transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
              <span className={`absolute h-[2px] w-4 bg-current transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={menu}
        className="invisible fixed inset-0 z-[65] overflow-hidden md:hidden"
        aria-hidden={!open}
        inert={!open}
      >
        <svg
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          className="mm-leaf absolute -right-[60vmax] -top-[90vmax] h-[260vmax] w-[220vmax] origin-[70%_40%] text-leaf-700"
          aria-hidden="true"
        >
          <path d={LEAF_OUTLINE} fill="currentColor" />
        </svg>
        <div className="relative flex h-full flex-col justify-between px-6 pb-10 pt-28 text-paper">
          <ul className="space-y-1">
            {[...nav.links, nav.cta].map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <TransitionLink
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="mm-link font-display flex items-baseline gap-3 text-[clamp(3rem,15vw,5.5rem)] font-extrabold uppercase leading-[0.95] tracking-tightest"
                >
                  <span aria-hidden="true" className="font-sans text-sm font-bold text-turmeric">0{i + 1}</span>
                  {l.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <p className="mm-foot font-tamil text-2xl font-bold text-leaf-100">எல்லோரும் வாங்க</p>
        </div>
      </div>
    </>
  );
}
