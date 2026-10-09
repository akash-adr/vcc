"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { join } from "@/data/join";
import { RecipeForm, type SubmitResult } from "./join/RecipeForm";
import { FlightOverlay, type Flight } from "./join/FlightOverlay";
import { Stamp } from "@/components/ui/Stamp";
import { TornEdge } from "@/components/ui/TornEdge";
import { Steam } from "@/components/ui/Steam";

// form.png is 2752×1536. Everything on the desktop "board" is placed in % of that image,
// so the pages stay glued to the notebook at any size.
const RATIO = 2752 / 1536; // keep in sync with the 1.7917 in the section's --w
const CARD = "#F6EEDC";

function Arrow() {
  // hand-drawn arrow pointing across the spine to the form
  return (
    <svg viewBox="0 0 160 70" className="h-auto w-[38%] text-leaf-900/70" aria-hidden="true">
      <path d="M6 18 C40 60 96 64 146 34" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 0" />
      <path d="M128 26 L148 33 L136 50" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function JoinFeast() {
  const root = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const rightPage = useRef<HTMLDivElement>(null);
  const formWrap = useRef<HTMLDivElement>(null);
  const counterEl = useRef<HTMLSpanElement>(null);
  const leaf = useRef<HTMLDivElement>(null);

  const [nearView, setNearView] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [mode, setMode] = useState<"form" | "thanks">("form");
  const [formKey, setFormKey] = useState(0);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const shownCount = useRef(0);

  // Preload the plane video and fetch the live count once the section is close.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNearView(true);
        io.disconnect();
        fetch("/api/submissions/count")
          .then((r) => r.json())
          .then((d) => typeof d.count === "number" && setCount(d.count))
          .catch(() => undefined);
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Counter ticks up to whatever the latest count is.
  useEffect(() => {
    const el = counterEl.current;
    if (!el || count === null) return;
    const obj = { v: shownCount.current };
    const tween = gsap.to(obj, {
      v: count,
      duration: shownCount.current ? 1.2 : 0.01,
      ease: "power2.out",
      onUpdate: () => (el.textContent = join.counter(Math.round(obj.v))),
    });
    shownCount.current = count;
    return () => {
      tween.kill();
    };
  }, [count]);

  // Entrance + curry-leaf sway.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = SplitText.create(q(".jf-write"), { type: "lines", mask: "lines", aria: "none" });
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
        tl.from(board.current, { y: 90, rotateX: 8, transformPerspective: 1400, transformOrigin: "50% 100%", autoAlpha: 0, duration: 1.4, ease: "expo.out" })
          .from(lines.lines, { yPercent: 100, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0.45)
          .from(q(".jf-right .rf-row"), { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: "expo.out" }, 0.6);
      });
      mm.add("(min-width: 900px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const rot = gsap.quickTo(leaf.current, "rotate", { duration: 1.6, ease: "power3.out" });
        const move = (e: PointerEvent) => rot((e.clientX / window.innerWidth - 0.5) * 3); // ±1.5deg
        root.current?.addEventListener("pointermove", move);
        return () => root.current?.removeEventListener("pointermove", move);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Thank-you stamp thump.
  useGSAP(
    () => {
      if (mode !== "thanks" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline()
        .fromTo(q(".jf-stamp"), { scale: 1.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power4.in" }, 0.15)
        .fromTo(q(".jf-thanks-line"), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08 }, 0.45);
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  );

  const onSuccess = useCallback((r: SubmitResult) => {
    setResult(r);
    setFlight({
      firstName: r.firstName,
      count: r.count,
      origin: r.origin,
      page: rightPage.current!.getBoundingClientRect(),
      form: formWrap.current,
    });
  }, []);

  const onClose = useCallback(
    (again: boolean) => {
      setFlight(null);
      if (result?.count != null) setCount(result.count);
      if (again) {
        setFormKey((k) => k + 1);
        setMode("form");
      } else {
        setMode("thanks");
      }
    },
    [result],
  );

  const sendAnother = () => {
    setFormKey((k) => k + 1);
    setMode("form");
  };

  return (
    <section
      ref={root}
      id="join"
      aria-labelledby="join-title"
      className="relative overflow-hidden bg-[#2b221c] [--h:max(105svh,660px)] [--w:max(100vw,calc(var(--h)*1.7917))]"
    >

      {/* Mobile: the props band on top */}
      <div className="relative h-[56vw] max-h-[360px] min-[900px]:hidden">
        <Image src="/images/form-props.webp" alt="" fill sizes="100vw" className="object-cover" />
        <Steam className="absolute left-[56%] top-[38%] h-[48%] w-auto" />
      </div>

      <div className="relative min-[900px]:h-[var(--h)]">
        <div
          ref={board}
          className="relative min-[900px]:absolute min-[900px]:left-[max(calc(100vw-var(--w)),calc(var(--w)*-0.065))] min-[900px]:top-[calc((var(--h)-var(--w)/1.7917)/2)] min-[900px]:w-[var(--w)]"
        >
          {/* Desktop: the table photo with a little life */}
          <div className="relative hidden min-[900px]:block" style={{ aspectRatio: String(RATIO) }}>
            <Image src="/images/form.webp" alt="An open, blank notebook on a wooden table beside curry leaves, red chillies and a cup of tea" fill sizes="(min-width: 900px) 120vw, 100vw" className="object-cover" />
            <div ref={leaf} className="absolute left-[73.4%] top-[1.3%] h-[56%] w-[26.16%] origin-[91%_92%]" aria-hidden="true">
              <Image src="/images/curry-leaf.webp" alt="" fill sizes="30vw" />
            </div>
            <Steam className="absolute left-[81.6%] top-[36%] h-[24%] w-auto" />
          </div>

          {/* The two pages: positioned on the notebook (desktop) or stacked on a paper card (mobile) */}
          <div className="relative px-5 pb-16 pt-10 min-[900px]:contents" style={{ backgroundColor: CARD }}>
            <div className="min-[900px]:hidden">
              <TornEdge position="top" color={CARD} seed={52} />
            </div>

            {/* LEFT PAGE: intro, in ink */}
            <div className="@container min-[900px]:absolute min-[900px]:left-[9.5%] min-[900px]:top-[10%] min-[900px]:h-[79%] min-[900px]:w-[28.5%]">
              <div className="flex h-full flex-col text-[clamp(15px,3.1cqw,18px)] text-leaf-900/85 mix-blend-multiply min-[900px]:p-[9%]">
                <p className="jf-write text-[0.7em] font-bold uppercase tracking-[0.2em]">
                  {join.eyebrow.en} · <span lang="ta" className="font-tamil normal-case tracking-normal">{join.eyebrow.ta}</span>
                </p>
                <h2 id="join-title" className="jf-write mt-[0.6em] font-display text-[3em] font-extrabold leading-[0.92] tracking-tightest">
                  {join.title.lead} <span className="font-serif font-normal italic tracking-normal">{join.title.accent}</span>
                </h2>
                <p className="jf-write mt-[1em] max-w-[30ch] leading-relaxed">{join.intro}</p>
                {count !== null && (
                  <p className="mt-[1.2em] flex items-center gap-2 text-[0.92em] font-bold text-leaf-700" aria-live="polite">
                    <span aria-hidden="true">🍃</span>
                    <span ref={counterEl}>{join.counter(count)}</span>
                  </p>
                )}
                <div className="mt-auto hidden justify-end min-[900px]:flex">
                  <Arrow />
                </div>
              </div>
            </div>

            {/* RIGHT PAGE: the form, or the thank-you note */}
            <div
              ref={rightPage}
              className="jf-right @container mt-10 min-[900px]:absolute min-[900px]:left-[38%] min-[900px]:top-[10%] min-[900px]:mt-0 min-[900px]:h-[79%] min-[900px]:w-[30.5%]"
            >
              <div ref={formWrap} className="relative h-full text-[clamp(15px,3.1cqw,17px)] min-[900px]:px-[8%] min-[900px]:py-[7%]">
                {mode === "form" ? (
                  <RecipeForm key={formKey} onSuccess={onSuccess} />
                ) : (
                  <div className="flex h-full flex-col items-start justify-center gap-[1em] text-leaf-900/85 mix-blend-multiply" aria-live="polite">
                    <div className="jf-stamp w-[62%] max-w-[260px] -rotate-6">
                      <Stamp label={join.thanks.stamp} sub="WITH THANKS ✓" tone="ember" shape="rect" className="h-auto w-full" />
                    </div>
                    <p className="jf-thanks-line font-serif text-[2em] italic leading-[1.05]">{join.thanks.title(result?.dish ?? "recipe")}</p>
                    <button
                      type="button"
                      onClick={sendAnother}
                      className="jf-thanks-line text-[0.9em] font-bold underline decoration-leaf-500 decoration-2 underline-offset-4 hover:text-leaf-700"
                    >
                      {join.thanks.again} →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FlightOverlay flight={flight} preload={nearView} onClose={onClose} />
    </section>
  );
}
