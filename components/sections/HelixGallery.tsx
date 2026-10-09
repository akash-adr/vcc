"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/components/layout/SmoothScroll";
import { TransitionLink } from "@/components/layout/PageTransition";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { TornEdge } from "@/components/ui/TornEdge";
import { HELIX, helixCards, helixMeta, type HelixCard } from "@/data/helixCards";
import { createRig, type HelixQuality } from "@/components/three/helix/rig";

const HelixScene = dynamic(() => import("@/components/three/helix/HelixScene"), { ssr: false });

const N = helixCards.length;
/** share of the pinned scroll spent on the cards; the rest is the outro down to the base */
const CARDS_END = 0.92;
/** scroll distance per card, in viewport heights (kept short so the pin never feels stuck) */
const PIN_PER_CARD = 0.6;
const pad = (n: number) => String(n).padStart(2, "0");

// ── device profile, read without effects ──
const MQ = "(max-width: 767px), (prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const profile = () => {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowHw = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return `${mobile || lowHw ? "low" : "high"}|${mobile ? "m" : "d"}|${reduced ? "r" : "m"}`;
};

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
const titleOf = (c: HelixCard) => (c.kind === "member" ? c.member.name : titleCase(c.label));
const factOf = (c: HelixCard) => (c.kind === "member" ? c.member.fact : c.fact);

export function HelixGallery() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const factRef = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const rig = useRef(createRig());
  const stRef = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const [outroShown, setOutroShown] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);

  const prof = useSyncExternalStore(subscribe, profile, () => "high|d|m");
  const [tier, size, motion] = prof.split("|");
  const reduced = motion === "r";
  const quality = useMemo<HelixQuality>(
    () =>
      size === "m"
        ? { lowEnd: true, radius: HELIX.radiusMobile, cameraZ: 8.5, cardW: 1.2, cardH: 1.6 }
        : { lowEnd: tier === "low", radius: HELIX.radius, cameraZ: tier === "low" ? 8.5 : 7.5, cardW: 1.5, cardH: 2 },
    [tier, size],
  );

  // mount the canvas within a viewport of the section; render frames only while it's on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: "100% 0px" });
    const vis = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, []);

  // ── scroll → camera ──
  useGSAP(
    () => {
      const r = rig.current;
      if (reduced) {
        r.intro = 1;
        r.t = 1.4;
        return;
      }
      const proxy = { p: 0 };
      const snapPoints = [...Array.from({ length: N }, (_, k) => (k / (N - 1)) * CARDS_END), 1];
      let lastActive = -1;
      let lastStarted = false;
      let lastOutro = false;

      const tween = gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: pin.current,
          start: "top top",
          end: () => `+=${window.innerHeight * N * PIN_PER_CARD}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = proxy.p;
          r.t = Math.min(p / CARDS_END, 1) * (N - 1);
          r.outro = p <= CARDS_END ? 0 : (p - CARDS_END) / (1 - CARDS_END);
          const a = Math.round(r.t);
          if (a !== lastActive) {
            lastActive = a;
            activeRef.current = a;
            setActive(a);
          }
          const s = p > 0.015;
          if (s !== lastStarted) {
            lastStarted = s;
            setStarted(s);
          }
          const o = r.outro > 0.55;
          if (o !== lastOutro) {
            lastOutro = o;
            setOutroShown(o);
          }
        },
      });
      stRef.current = tween.scrollTrigger ?? null;

      // Snap to whole cards once scrolling settles. Done through Lenis (not ScrollTrigger's snap,
      // which scrolls the window directly and fights Lenis' own smoothing).
      const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
      const snap = () => {
        const st = stRef.current;
        const lenis = getLenis();
        if (!st || !lenis || !st.isActive || lenis.isScrolling) return;
        const p = st.progress;
        const nearest = snapPoints.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));
        const y = st.start + nearest * (st.end - st.start);
        const dist = Math.abs(y - window.scrollY);
        if (dist < 4) return;
        lenis.scrollTo(y, { duration: gsap.utils.clamp(0.5, 0.9, dist / 900), easing: easeInOut });
      };
      ScrollTrigger.addEventListener("scrollEnd", snap);

      // intro: the camera swoops from the crown to the first card as the section arrives
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 70%",
        once: true,
        onEnter: () => gsap.to(r, { intro: 1, duration: 1.6, ease: "expo.out" }),
      });

      // pointer parallax
      const onMove = (e: PointerEvent) => {
        r.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        r.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      // the custom cursor reads data-cursor: flip it when a card is hovered in the canvas
      let hovering = false;
      const tick = () => {
        const h = r.hovered >= 0;
        if (h === hovering || !stage.current) return;
        hovering = h;
        if (h) stage.current.dataset.cursor = "View";
        else delete stage.current.dataset.cursor;
        stage.current.style.cursor = h ? "pointer" : "";
        stage.current.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
      };
      gsap.ticker.add(tick);

      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", snap);
        window.removeEventListener("pointermove", onMove);
        gsap.ticker.remove(tick);
        stRef.current = null;
      };
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  // fact line swaps with a line reveal
  useGSAP(
    () => {
      if (reduced || !factRef.current) return;
      const split = SplitText.create(factRef.current.querySelectorAll(".hx-swap"), { type: "lines", mask: "lines", aria: "none" });
      gsap.from(split.lines, { yPercent: 105, duration: 0.8, stagger: 0.05, ease: "expo.out" });
    },
    { scope: factRef, dependencies: [active], revertOnUpdate: true },
  );

  const goTo = useCallback((i: number) => {
    const st = stRef.current;
    const k = gsap.utils.clamp(0, N - 1, i);
    if (!st) return;
    const y = st.start + (k / (N - 1)) * CARDS_END * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // The detail panel never freezes the page: any scroll gesture simply closes it.
  const openDetail = useCallback((i: number) => {
    setDetail(i);
    gsap.to(rig.current, { zoom: 1, duration: 1.1, ease: "expo.out" });
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
    gsap.to(rig.current, { zoom: 0, duration: 1, ease: "power3.inOut" });
  }, []);

  useEffect(() => {
    if (detail === null) return;
    const close = () => closeDetail();
    window.addEventListener("wheel", close, { passive: true });
    window.addEventListener("touchmove", close, { passive: true });
    return () => {
      window.removeEventListener("wheel", close);
      window.removeEventListener("touchmove", close);
    };
  }, [detail, closeDetail]);

  const onSelect = useCallback((i: number) => (i === activeRef.current ? openDetail(i) : goTo(i)), [goTo, openDetail]);

  // keyboard: arrows step through the cards while the gallery is pinned; Esc closes the detail panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (detail !== null) {
        if (e.key === "Escape") closeDetail();
        return;
      }
      if (!stRef.current?.isActive) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goTo(activeRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(activeRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, goTo, closeDetail]);

  useEffect(() => {
    if (detail !== null) closeBtn.current?.focus();
  }, [detail]);

  const card = helixCards[active];
  const open = detail !== null ? helixCards[detail] : null;

  // ── reduced motion: a still render of the helix + a plain, accessible grid ──
  if (reduced) {
    return (
      <section ref={root} id="family" aria-labelledby="family-title" className="relative bg-paper-2 pb-20 pt-24">
        <TornEdge position="top" color="var(--paper-2)" seed={14} />
        <div className="container-x">
          <h2 id="family-title" className="text-[length:var(--text-h2)] leading-[0.92]">
            <span className="font-serif italic">{helixMeta.title.lead}</span> <span className="font-display font-extrabold tracking-tightest">{helixMeta.title.accent}</span>
          </h2>
        </div>
        <div className="relative mt-8 h-[60svh]" aria-hidden="true">
          {mounted && <HelixScene rig={rig} quality={quality} onSelect={() => undefined} active={false} still />}
        </div>
        <ul className="container-x mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {helixCards
            .filter((c) => c.kind === "member")
            .map((c) =>
              c.kind === "member" ? (
                <li key={c.id} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
                  <div className="relative aspect-[3/4]">
                    <Image src={c.member.image} alt={c.member.name} fill sizes="(min-width: 768px) 30vw, 50vw" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg font-extrabold leading-tight">{c.member.name}</p>
                    <p className="text-sm font-semibold text-turmeric-ink">{c.member.role}</p>
                    <p className="mt-1 text-sm text-leaf-900/75">{c.member.fact}</p>
                  </div>
                </li>
              ) : null,
            )}
        </ul>
        <TornEdge position="bottom" color="var(--paper-2)" seed={19} />
      </section>
    );
  }

  return (
    <section ref={root} id="family" aria-labelledby="family-title" aria-roledescription="3D gallery" className="relative bg-paper-2">
      <TornEdge position="top" color="var(--paper-2)" seed={14} />
      <div ref={pin} className="relative h-svh overflow-hidden bg-[linear-gradient(180deg,#FBFDF7,#E3F0D3)]">
        <div ref={stage} className="absolute inset-0">
          {mounted && <HelixScene rig={rig} quality={quality} onSelect={onSelect} active={inView} />}
        </div>

        {/* overlay UI (steps aside while the detail panel is open) */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${open ? "opacity-0 [&_*]:!pointer-events-none" : "opacity-100"}`}
          inert={open !== null}
        >
          {/* heading as the section arrives */}
          <h2
            id="family-title"
            className={`absolute inset-x-0 top-[12svh] text-center text-[length:var(--text-h2)] leading-[0.9] text-leaf-900 transition-all duration-700 ease-[var(--ease-expo)] ${
              started ? "-translate-y-6 opacity-0" : "opacity-100"
            }`}
          >
            <span className="font-serif italic">{helixMeta.title.lead}</span> <span className="font-display font-extrabold tracking-tightest">{helixMeta.title.accent}</span>
          </h2>

          {/* who do you want to meet? */}
          <nav aria-label="Family members" className="pointer-events-auto absolute left-[clamp(1rem,4vw,3.5rem)] top-1/2 hidden -translate-y-1/2 md:block">
            <p className="eyebrow text-leaf-900/70">{helixMeta.prompt}</p>
            <ul className="mt-4 space-y-1">
              {helixCards.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "true" : undefined}
                    className={`group flex items-center gap-2 py-0.5 font-display text-[clamp(0.95rem,0.8rem+0.4vw,1.2rem)] font-extrabold uppercase tracking-tightest transition-colors ${
                      i === active ? "text-turmeric-ink" : "text-leaf-900/70 hover:text-leaf-900"
                    }`}
                  >
                    {i === active ? (
                      <BananaLeaf veins={false} className="h-3.5 w-2 rotate-90 text-turmeric" />
                    ) : (
                      <span aria-hidden="true" className="w-2 text-[0.8em]">
                        →
                      </span>
                    )}
                    {c.short}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* say hi */}
          <TransitionLink
            href="/#join"
            className="pointer-events-auto absolute bottom-[clamp(1rem,4vh,2.5rem)] left-[clamp(1rem,4vw,3.5rem)] hidden rounded-full border sm:block border-leaf-900/30 bg-white/40 px-5 py-2.5 text-sm font-bold text-leaf-900 backdrop-blur transition-colors hover:bg-leaf-900 hover:text-paper"
          >
            {helixMeta.sayHi}
          </TransitionLink>

          {/* counter + fact */}
          <div
            ref={factRef}
            className="absolute bottom-[clamp(1rem,4vh,2.5rem)] right-[clamp(1rem,4vw,3.5rem)] max-w-[min(360px,50vw)] rounded-[20px] bg-paper/70 px-4 py-3 text-right shadow-[0_10px_30px_-18px_rgba(15,46,23,.4)] backdrop-blur-md"
          >
            <div className="flex items-center justify-end gap-3">
              <div className="pointer-events-auto flex gap-1.5 md:hidden">
                <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous card" className="h-10 w-10 rounded-full border border-line bg-white/70 text-leaf-900">
                  ↑
                </button>
                <button type="button" onClick={() => goTo(active + 1)} aria-label="Next card" className="h-10 w-10 rounded-full border border-line bg-white/70 text-leaf-900">
                  ↓
                </button>
              </div>
              <p className="whitespace-nowrap font-display text-[clamp(1.4rem,1.1rem+1.4vw,2.6rem)] font-extrabold tabular-nums tracking-tightest text-leaf-900">
                {pad(active + 1)} <span className="text-leaf-900/55">/ {pad(N)}</span>
              </p>
            </div>
            <div key={active} className="mt-1 hidden sm:block">
              <p className="hx-swap text-sm font-semibold text-leaf-900/80">{factOf(card)}</p>
            </div>
          </div>

          {/* outro headline over the base */}
          <p
            className={`absolute inset-x-0 top-[14svh] text-center font-display text-[clamp(3rem,1rem+8vw,8.5rem)] font-extrabold leading-[0.85] tracking-tightest text-leaf-900 transition-all duration-1000 ease-[var(--ease-expo)] ${
              outroShown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            aria-hidden={!outroShown}
          >
            {helixMeta.closing.lead} <span className="font-serif font-normal italic tracking-normal text-turmeric-ink">{helixMeta.closing.accent}</span>
          </p>

          <p className="sr-only" aria-live="polite">
            {`Card ${active + 1} of ${N}: ${titleOf(card)}`}
          </p>
        </div>

        {/* detail panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="helix-detail-title"
          aria-hidden={open === null}
          inert={open === null}
          className={`absolute inset-y-0 right-0 z-10 flex w-[min(440px,92vw)] flex-col justify-center gap-4 bg-paper/90 p-8 backdrop-blur-xl transition-[translate,box-shadow,visibility] duration-700 ease-[var(--ease-expo)] ${
            open ? "visible translate-x-0 shadow-leaf" : "invisible translate-x-full"
          }`}
        >
          {open && (
            <>
              <button ref={closeBtn} type="button" onClick={closeDetail} className="absolute right-6 top-24 flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-bold">
                Close <span aria-hidden="true">✕</span>
              </button>
              <p className="eyebrow text-leaf-700">
                {pad((detail ?? 0) + 1)} / {pad(N)}
              </p>
              <h3 id="helix-detail-title" className="font-display text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] font-extrabold leading-[0.92] tracking-tightest">
                {titleOf(open)}
              </h3>
              {open.kind === "member" && (
                <>
                  <p lang="ta" className="font-tamil text-xl font-bold text-leaf-700">
                    {open.member.ta}
                  </p>
                  <p className="text-sm font-bold uppercase tracking-wider text-turmeric-ink">{open.member.role}</p>
                  <p className="leading-relaxed text-leaf-900/80">
                    {open.story[0]} {open.story[1]}
                  </p>
                </>
              )}
              {open.kind === "stat" && <p className="leading-relaxed text-leaf-900/80">{open.fact}</p>}
              <a
                href={open.url}
                {...(open.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-2 inline-flex w-max items-center gap-2 rounded-full bg-turmeric px-6 py-3 text-sm font-bold text-leaf-900 transition-colors hover:bg-leaf-900 hover:text-paper"
              >
                {open.kind === "member" ? helixMeta.watch : open.url.startsWith("/") ? "Send us your recipe" : "Watch on YouTube"} <span aria-hidden="true">↗</span>
              </a>
            </>
          )}
        </div>
      </div>
      <TornEdge position="bottom" color="var(--paper-2)" seed={19} />
    </section>
  );
}
