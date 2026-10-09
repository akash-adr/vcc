"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { onPageReady } from "@/lib/app-state";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { Sticker } from "@/components/ui/Sticker";
import { hero } from "@/data/site";

const CUTOUT = "/images/hero-ppl-cutout";
// Member boundaries across the cut-out's width (left → right), used for the staggered rise.
const SLICES = [0, 21.7, 38.3, 50.2, 62.1, 77.8, 100];
// The pre-blurred shadow is padded by 160px around a 2230×1215 image.
const SHADOW_BOX = { left: "-7.175%", top: "-13.17%", width: "114.35%", height: "126.34%" };

function Cutout({ className = "", alt = "" }: { className?: string; alt?: string }) {
  return (
    <picture>
      <source srcSet={`${CUTOUT}.webp`} type="image/webp" />
      <img src={`${CUTOUT}.png`} alt={alt} width={2230} height={1215} decoding="async" draggable={false} className={className} />
    </picture>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // ───────── Intro: plays once the loader has split open ─────────
      const intro = contextSafe!((reduced: boolean) => {
        gsap.set(q(".hero-i"), { autoAlpha: 1 });
        const v = video.current;
        if (v && !reduced) v.play().catch(() => undefined); // keep the poster if autoplay is refused

        if (reduced) {
          gsap.from(q(".hero-i"), { autoAlpha: 0, duration: 0.6, stagger: 0.05 });
          return;
        }
        const split = SplitText.create(q(".hero-cooking")[0], { type: "chars", mask: "chars", charsClass: "split-mask", aria: "none" });
        gsap
          .timeline({ delay: 0.15 })
          .from(q(".hero-eyebrow-i"), { y: 24, autoAlpha: 0, duration: 1 })
          .from(split.chars, { yPercent: 110, duration: 1.2, stagger: 0.03 }, 0.1)
          .from(q(".hero-village-i"), { xPercent: -40, autoAlpha: 0, filter: "blur(10px)", duration: 1.3 }, 0.3)
          .from(q(".hero-channel-i"), { xPercent: 40, autoAlpha: 0, filter: "blur(10px)", duration: 1.3 }, 0.3)
          .from(q(".hero-meta-i"), { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.8)
          .from(q(".hero-cue-i"), { autoAlpha: 0, duration: 0.9 }, 1.1);
      });

      // ───────── Scroll story (pinned) ─────────
      const build = (isDesktop: boolean) => {
        const people = isDesktop ? q(".hero-slice") : q(".hero-ppl-full");
        gsap.set(people, { yPercent: 115 });
        gsap.set(q(".hero-ppl"), { rotate: 3, scale: 0.9, transformOrigin: "50% 100%" });
        gsap.set(q(".hero-ppl-shadow"), { autoAlpha: 0, scale: 0.94, transformOrigin: "50% 100%" });
        gsap.set(q(".hero-sticker"), { scale: 0, rotate: (i) => [-14, 10, -8][i % 3] });
        gsap.set(q(".hero-back"), { autoAlpha: 0 });
        gsap.set(q(".hero-ppl-par"), { visibility: "visible" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=180%",
            pin: q(".hero-pin")[0],
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tl
          // 0 → 0.35: title lifts and blurs away (eyebrow first), drone dives deeper
          .to(q(".hero-cue"), { autoAlpha: 0, y: 20, duration: 0.08 }, 0)
          .to(q(".hero-eyebrow"), { y: -120, filter: "blur(12px)", autoAlpha: 0, duration: 0.24, ease: "power1.in" }, 0)
          .to(q(".hero-title-out"), { y: -120, filter: "blur(12px)", autoAlpha: 0, duration: 0.3, ease: "power1.in", stagger: 0.02 }, 0.04)
          .to(q(".hero-video"), { scale: 1.15, duration: 0.35 }, 0)
          .to(q(".hero-dim"), { autoAlpha: 0.2, duration: 0.35 }, 0)
          // 0.15 → 0.7: giant outlined words drift behind the family
          .to(q(".hero-back"), { autoAlpha: 1, duration: 0.08 }, 0.12)
          .fromTo(q(".hero-back-en"), { xPercent: 10 }, { xPercent: -30, duration: 0.55 }, 0.15)
          .fromTo(q(".hero-back-ta"), { xPercent: -30 }, { xPercent: 5, duration: 0.55 }, 0.15)
          // 0.25 → 0.75: the family is slapped onto the screen like a torn magazine cut-out
          .to(people, { yPercent: 0, duration: isDesktop ? 0.3 : 0.5, ease: "power3.out", stagger: { each: 0.04, from: "center" } }, 0.25)
          .to(q(".hero-ppl"), { rotate: 0, scale: 1.02, duration: 0.5, ease: "power2.out" }, 0.25)
          .to(q(".hero-ppl"), { scale: 1, duration: 0.06, ease: "back.out(3)" }, 0.75)
          .to(q(".hero-ppl-shadow"), { autoAlpha: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 0.72);

        if (isDesktop) {
          // Slices only exist for the motion; once landed, swap to the single image so no seams can ever show.
          tl.set(q(".hero-ppl-full"), { autoAlpha: 1 }, 0.75).set(q(".hero-slices"), { autoAlpha: 0 }, 0.75);
        }

        tl
          // 0.6 → 0.9: sticker labels pop on
          .to(q(".hero-sticker"), { scale: 1, duration: 0.12, ease: "back.out(2.4)", stagger: 0.07 }, 0.6)
          // 0.85 → 1: paper rises to hand off to the page
          .fromTo(q(".hero-wash"), { yPercent: 100 }, { yPercent: 0, duration: 0.15 }, 0.85);

        return tl;
      };

      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduced } = ctx.conditions as Record<string, boolean>;
          if (reduced) {
            gsap.set(q(".hero-ppl-full"), { autoAlpha: 1 });
            gsap.set(q(".hero-slices"), { autoAlpha: 0 });
            video.current?.pause();
            return;
          }
          build(desktop);

          if (desktop && window.matchMedia("(pointer: fine)").matches) {
            const movers = [
              { el: q(".hero-video-par")[0], amt: -6 },
              { el: q(".hero-back-par")[0], amt: 25 },
              { el: q(".hero-ppl-par")[0], amt: 10 },
            ].map(({ el, amt }) => ({
              amt,
              x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
            }));
            const onMove = (e: PointerEvent) => {
              const nx = e.clientX / window.innerWidth - 0.5;
              const ny = e.clientY / window.innerHeight - 0.5;
              movers.forEach((m) => {
                m.x(nx * 2 * m.amt);
                m.y(ny * 2 * m.amt);
              });
            };
            window.addEventListener("pointermove", onMove, { passive: true });
            return () => window.removeEventListener("pointermove", onMove);
          }
        },
      );

      const off = onPageReady(() => intro(window.matchMedia("(prefers-reduced-motion: reduce)").matches));

      // Fonts settle metrics → recompute pin distances.
      document.fonts.ready.then(() => ScrollTrigger.refresh());

      // Pause the drone flight while the hero is off-screen.
      const io = new IntersectionObserver(([e]) => {
        const v = video.current;
        if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (e.isIntersecting) v.play().catch(() => undefined);
        else v.pause();
      });
      if (root.current) io.observe(root.current);

      return () => {
        off();
        io.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative">
      <div className="hero-pin relative h-svh min-h-[560px] w-full overflow-hidden bg-leaf-900">
        {/* 1 · Drone flight (seamless forward loop) */}
        <div className="hero-video-par absolute -inset-3">
          <div className="hero-video absolute inset-0 will-change-transform">
            <Image src="/images/hero-poster.jpg" alt="" fill preload sizes="100vw" className="object-cover" />
            <video
              ref={video}
              data-hero-video
              muted
              loop
              playsInline
              preload="auto"
              poster="/images/hero-poster.jpg"
              aria-hidden="true"
              tabIndex={-1}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src="/videos/hero-loop.webm" type="video/webm" />
              <source src="/videos/hero-loop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="hero-dim pointer-events-none absolute inset-0 bg-leaf-900 opacity-0" />

        {/* 2 · Legibility + melt into paper */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,46,23,.45) 0%, rgba(15,46,23,0) 40%, rgba(251,253,247,0) 55%, var(--paper) 100%)",
          }}
        />

        {/* 3 · Giant outlined words, behind the family */}
        <div className="hero-back-par pointer-events-none absolute inset-x-0 top-[40%] md:top-[7%]" aria-hidden="true">
          <div className="hero-back font-display text-outline select-none leading-[0.82] whitespace-nowrap">
            <p className="hero-back-en w-max pl-[4vw] text-[28vw] font-extrabold md:text-[22vw] uppercase tracking-tightest">{hero.backText.en}</p>
            <p className="hero-back-ta font-tamil w-max pl-[4vw] text-[19vw] font-extrabold md:text-[15vw] leading-[1.15]">{hero.backText.ta}</p>
          </div>
        </div>

        {/* 4 · Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-[10svh] text-center text-white [text-shadow:0_4px_40px_rgba(15,46,23,.45)] motion-reduce:justify-start motion-reduce:pt-28">
          <p className="hero-eyebrow will-change-[transform,filter,opacity]">
            <span className="hero-eyebrow-i hero-i eyebrow block text-white/90">{hero.eyebrow}</span>
          </p>
          <h1 id="hero-title" className="mt-5 flex flex-col items-center leading-none">
            <span className="hero-title-out will-change-[transform,filter,opacity] block self-start pl-[6vw] md:pl-[2vw]">
              <span className="hero-village-i hero-i block font-serif text-[clamp(2.75rem,8vw,8.5rem)] italic leading-[0.9]">
                {hero.title.top}
              </span>
            </span>
            <span className="hero-title-out will-change-[transform,filter,opacity] block">
              <span className="sr-only">{hero.title.main}</span>
              <span aria-hidden="true" className="hero-cooking hero-i font-display block text-[20vw] md:text-[clamp(4.25rem,17vw,17rem)] font-extrabold uppercase leading-[0.8] tracking-tightest">
                {hero.title.main}
              </span>
            </span>
            <span className="hero-title-out will-change-[transform,filter,opacity] block self-end pr-[4vw] md:pr-[1vw]">
              <span className="hero-channel-i hero-i block font-serif text-[clamp(2.75rem,8vw,8.5rem)] italic leading-[0.95]">
                {hero.title.bottom}
              </span>
            </span>
          </h1>
          <div className="hero-title-out will-change-[transform,filter,opacity] mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <span className="hero-meta-i hero-i inline-flex items-center gap-2 rounded-full bg-turmeric px-4 py-2 text-sm font-bold text-leaf-900 [text-shadow:none]">
              <span aria-hidden="true">▶</span> {hero.pill}
            </span>
            <span lang="ta" className="hero-meta-i hero-i font-tamil text-xl font-bold md:text-2xl">
              {hero.tamil}
            </span>
          </div>
        </div>

        {/* 5 · The family */}
        <div className="hero-ppl-par absolute bottom-0 left-0 ml-[-4.28vw] w-[118vw] md:inset-x-0 md:mx-auto md:w-[min(92vw,1300px,150svh)] motion-reduce:md:w-[min(80vw,1100px,105svh)]">
          <div className="hero-ppl relative aspect-[2230/1215] will-change-transform">
            <div className="hero-ppl-shadow pointer-events-none absolute" style={SHADOW_BOX} aria-hidden="true">
              <Image src="/images/hero-ppl-shadow.webp" alt="" fill sizes="(min-width: 768px) 1300px, 118vw" className="translate-y-[3%] object-cover opacity-40" unoptimized />
            </div>

            <div className="hero-slices absolute inset-0 hidden md:block" aria-hidden="true">
              {SLICES.slice(0, -1).map((l, i) => (
                <div key={l} className="absolute inset-0" style={{ clipPath: `inset(-20% ${100 - SLICES[i + 1]}% -20% ${l}%)` }}>
                  <div className="hero-slice absolute inset-0">
                    <Cutout className="h-full w-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-ppl-full absolute inset-0 md:invisible md:opacity-0 motion-reduce:visible motion-reduce:opacity-100">
              <Cutout className="h-full w-full" alt={hero.cutoutAlt} />
            </div>

            {/* sticker labels */}
            <div className="absolute left-[43%] top-[6%] -translate-x-1/2 md:top-[7%]">
              <div className="hero-sticker origin-bottom">
                <Sticker seed={5} tone="turmeric">{hero.stickers.elder}</Sticker>
                <svg viewBox="0 0 30 40" className="ml-[58%] mt-1 h-11 w-8 text-white drop-shadow" aria-hidden="true">
                  <path d="M6 2 C18 10 22 22 16 36 M10 30 L16 37 L22 29" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="hero-sticker absolute left-[-2%] top-[34%] hidden md:block">
              <Sticker seed={9}>{hero.stickers.left}</Sticker>
            </div>
            <div className="hero-sticker absolute right-[-2%] top-[26%] hidden md:block">
              <Sticker seed={13} tone="turmeric">{hero.stickers.right}</Sticker>
            </div>
          </div>
        </div>

        {/* paper hand-off */}
        <div
          className="hero-wash pointer-events-none absolute inset-x-0 bottom-0 h-[38%] translate-y-full"
          style={{ background: "linear-gradient(to bottom, rgba(251,253,247,0), var(--paper) 85%)" }}
        />

        {/* scroll cue */}
        <div className="hero-cue pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-leaf-900 motion-reduce:hidden">
          <div className="hero-cue-i hero-i flex flex-col items-center gap-2">
            <div className="relative h-[60px] w-px bg-leaf-900/25">
              <BananaLeaf veins={false} className="absolute -left-[5px] top-0 h-4 w-[11px] animate-[cue-drift_2.2s_var(--ease-inout)_infinite] text-turmeric" />
            </div>
            <span className="eyebrow text-[10px] text-leaf-900/75">{hero.scrollCue}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
