"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/components/layout/SmoothScroll";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { prefersReducedMotion } from "@/lib/app-state";
import { join } from "@/data/join";

export type Flight = {
  firstName: string;
  count: number | null;
  /** submit button centre (viewport px): the circle wipe starts here */
  origin: { x: number; y: number };
  /** the notebook's right page (viewport px): it morphs into the leaf, and the circle closes back into it */
  page: DOMRect;
  /** form element whose rows collapse before take-off */
  form: HTMLElement | null;
};

const PARTICLES = 12;
const MESSAGE_AT = 3.9; // seconds into the clip, as the plane leaves top-right
const VIDEO_MASK = "radial-gradient(ellipse at center, #000 60%, transparent 85%)";
const PAGE_TONE = "#EADDBF"; // the notebook page colour in form.png

export function FlightOverlay({
  flight,
  preload,
  onClose,
}: {
  flight: Flight | null;
  preload: boolean;
  onClose: (again: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const backBtn = useRef<HTMLButtonElement>(null);
  const [messageShown, setMessageShown] = useState(false);
  const closing = useRef(false);

  // ── take-off ──
  useEffect(() => {
    if (!flight || !root.current) return;
    closing.current = false;
    const q = gsap.utils.selector(root);
    const v = video.current;
    const reduced = prefersReducedMotion();
    lockScroll("flight");

    const ctx = gsap.context(() => {
      gsap.set(root.current, { autoAlpha: 1 });
      gsap.set([q(".fo-msg"), q(".fo-video"), q(".fo-snap"), q(".fo-leaf")], { autoAlpha: 0 });

      const showMessage = () => {
        if (closing.current) return;
        const box = q(".fo-video")[0].getBoundingClientRect();
        // a trail of little leaves drifting from where the plane left
        q(".fo-leaf").forEach((leaf, i) => {
          const sx = box.right - box.width * (0.08 + Math.random() * 0.12);
          const sy = box.top + box.height * (0.06 + Math.random() * 0.14);
          gsap.fromTo(
            leaf,
            { x: sx, y: sy, rotate: Math.random() * 360, scale: 0.5 + Math.random() * 0.7, autoAlpha: 0 },
            {
              keyframes: { autoAlpha: [0, 1, 1, 0] },
              x: sx - 120 - Math.random() * 380,
              y: sy + 60 + Math.random() * 260,
              rotate: `+=${(Math.random() - 0.5) * 540}`,
              duration: 2.4 + Math.random() * 1.4,
              delay: i * 0.06,
              ease: "power1.out",
            },
          );
        });
        gsap.fromTo(q(".fo-msg-line"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1, ease: "expo.out" });
        gsap.set(q(".fo-msg"), { autoAlpha: 1 });
        setMessageShown(true);
      };

      if (reduced || !v) {
        gsap.fromTo(q(".fo-bg"), { clipPath: "circle(150% at 50% 50%)", autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, onComplete: showMessage });
        return;
      }

      const { origin, page } = flight;
      const radius = Math.hypot(window.innerWidth, window.innerHeight);
      const target = q(".fo-video")[0].getBoundingClientRect();
      const rows = flight.form ? flight.form.querySelectorAll(".rf-row") : [];

      v.currentTime = 0;
      let fired = false;
      const onTime = () => {
        if (!fired && v.currentTime >= MESSAGE_AT) {
          fired = true;
          showMessage();
        }
      };
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("ended", onTime);
      v.addEventListener("error", () => !fired && ((fired = true), showMessage()), { once: true });

      gsap
        .timeline()
        // 1 · the form rows lift away, line by line
        .to([...rows].reverse(), { y: -14, autoAlpha: 0, filter: "blur(4px)", duration: 0.4, stagger: 0.04, ease: "power2.in" }, 0)
        // 2 · PowerPoint-style circle opens from the button
        .fromTo(
          q(".fo-bg"),
          { autoAlpha: 1, clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
          { clipPath: `circle(${radius}px at ${origin.x}px ${origin.y}px)`, duration: 0.6, ease: "power3.inOut" },
          0.3,
        )
        // 3 · the right page becomes the flat leaf (first frame), then the video takes over on the same frame
        .fromTo(
          q(".fo-snap"),
          { autoAlpha: 1, left: page.left, top: page.top, width: page.width, height: page.height, backgroundColor: PAGE_TONE, borderRadius: 4 },
          { left: target.left, top: target.top, width: target.width, height: target.height, backgroundColor: "rgba(251,253,247,0)", borderRadius: 0, duration: 0.5, ease: "power3.inOut" },
          0.55,
        )
        .fromTo(q(".fo-snap img"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.75)
        .add(() => {
          gsap.set(q(".fo-video"), { autoAlpha: 1 });
          gsap.set(q(".fo-snap"), { autoAlpha: 0 });
          v.play().catch(() => {
            if (!fired) {
              fired = true;
              showMessage();
            }
          });
        }, 1.05);

      return () => {
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("ended", onTime);
      };
    }, root);

    return () => ctx.revert();
  }, [flight]);

  // focus the first action once the message is up
  useEffect(() => {
    if (!messageShown) return;
    // the button line is still visibility:hidden for a beat while it fades in, so focus once it's visible
    const call = gsap.delayedCall(0.4, () => backBtn.current?.focus());
    return () => {
      call.kill();
    };
  }, [messageShown]);

  const close = useCallback(
    (again: boolean) => {
      if (!flight || closing.current) return;
      closing.current = true;
      const q = gsap.utils.selector(root);
      const v = video.current;
      const done = () => {
        v?.pause();
        gsap.set(root.current, { autoAlpha: 0 });
        setMessageShown(false);
        unlockScroll("flight");
        onClose(again);
      };
      if (prefersReducedMotion()) {
        gsap.to(root.current, { autoAlpha: 0, duration: 0.3, onComplete: done });
        return;
      }
      const p = flight.page;
      const cx = p.left + p.width / 2;
      const cy = p.top + p.height / 2;
      const radius = Math.hypot(window.innerWidth, window.innerHeight);
      gsap
        .timeline({ onComplete: done })
        .to([q(".fo-msg"), q(".fo-video"), q(".fo-leaf")], { autoAlpha: 0, duration: 0.3 })
        .fromTo(q(".fo-bg"), { clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }, { clipPath: `circle(0px at ${cx}px ${cy}px)`, duration: 0.75, ease: "power3.inOut" }, 0.15);
    },
    [flight, onClose],
  );

  // Esc closes once the message is visible; Tab stays inside the dialog.
  useEffect(() => {
    if (!messageShown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Tab") {
        const btns = root.current?.querySelectorAll<HTMLButtonElement>(".fo-msg button");
        if (!btns?.length) return;
        const first = btns[0];
        const last = btns[btns.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [messageShown, close]);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fo-title"
      aria-hidden={!flight}
      className="invisible fixed inset-0 z-[96] opacity-0"
    >
      <div className="fo-bg absolute inset-0 bg-paper" />

      <div className="fo-snap pointer-events-none fixed overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- must be the exact first frame of the clip for a seamless hand-off */}
        <img
          src="/images/leaf-plane-first.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
          style={{ maskImage: VIDEO_MASK, WebkitMaskImage: VIDEO_MASK }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {preload && (
          <video
            ref={video}
            className="fo-video aspect-video w-[min(90vw,1100px)] mix-blend-multiply"
            style={{ maskImage: VIDEO_MASK, WebkitMaskImage: VIDEO_MASK }}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src="/videos/leaf-plane.webm" type="video/webm" />
            <source src="/videos/leaf-plane.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {Array.from({ length: PARTICLES }, (_, i) => (
        <BananaLeaf key={i} veins={false} className="fo-leaf pointer-events-none fixed left-0 top-0 h-5 w-2.5 text-leaf-500" />
      ))}

      <div className="fo-msg absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h2 id="fo-title" className="fo-msg-line font-serif text-[clamp(2.75rem,1.5rem+5vw,6rem)] italic leading-none text-leaf-900">
          {flight ? join.success.hello(flight.firstName) : ""}
        </h2>
        <p className="fo-msg-line mt-5 max-w-[22ch] font-display text-[clamp(1.5rem,1rem+2vw,2.75rem)] font-extrabold leading-[1.02] tracking-tightest text-leaf-900">
          {join.success.line}
        </p>
        <p className="fo-msg-line mt-4 text-sm font-semibold text-leaf-700">{flight ? join.success.count(flight.count) : ""}</p>
        <div className="fo-msg-line mt-8 flex flex-wrap justify-center gap-3">
          <button ref={backBtn} type="button" onClick={() => close(false)} className="rounded-full bg-leaf-900 px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-leaf-700">
            {join.success.back}
          </button>
          <button type="button" onClick={() => close(true)} className="rounded-full border border-line px-6 py-3 text-sm font-bold text-leaf-900 transition-colors hover:bg-leaf-100">
            {join.success.again}
          </button>
        </div>
      </div>
    </div>
  );
}
