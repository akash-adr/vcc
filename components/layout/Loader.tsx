"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "./SmoothScroll";
import { LEAF_MIDRIB, LEAF_OUTLINE, LEAF_VEINS } from "@/components/ui/BananaLeaf";
import { SEEN_KEY, markLoaderDone, prefersReducedMotion, safeSession } from "@/lib/app-state";
import { loaderLines } from "@/data/site";
import { BANANA_TREE_URL } from "@/lib/constants";

const MIN_TIME = 1600;
const MAX_TIME = 6000;

// Weighted real-asset progress, gated only on what the first screen needs.
// The GLB and the notebook photo are still preloaded, but in the background so they never hold up LCP.
const WEIGHTS = { video: 0.45, cutout: 0.25, fonts: 0.3 } as const;
type Key = keyof typeof WEIGHTS;

function decodeImage(src: string) {
  const img = new Image();
  img.src = src;
  return img.decode().catch(() => undefined);
}

async function fetchWithProgress(url: string, onProgress: (p: number) => void) {
  const res = await fetch(url);
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !total) {
    await res.arrayBuffer();
    return;
  }
  const reader = res.body.getReader();
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    onProgress(loaded / total);
  }
}

// Torn seam shared by both halves of the exit panel, so they fit together exactly.
function makeRng(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}
function seam(seed: number) {
  const r = makeRng(seed);
  const pts: [number, number][] = [];
  let x = 0;
  for (let y = 0; y < 100; y += 0.8 + r() * 1.8) {
    // slow wander + fine teeth + the occasional deep bite
    x += (r() - 0.5) * 6;
    x *= 0.92;
    pts.push([x + (r() - 0.5) * 7 + (r() < 0.06 ? (r() - 0.5) * 34 : 0), y]);
  }
  pts.push([x, 100]);
  return pts;
}
const SEAM = seam(11);
const fibreRng = makeRng(29);
const FIBRE_L = SEAM.map(([x, y]) => [x + 3 + fibreRng() * 9, y] as [number, number]);
const FIBRE_R = SEAM.map(([x, y]) => [x - 3 - fibreRng() * 9, y] as [number, number]);
const leftPoly = (pts: [number, number][]) =>
  `polygon(0 0, ${pts.map(([x, y]) => `calc(50% + ${x.toFixed(1)}px) ${y.toFixed(1)}%`).join(", ")}, 0 100%)`;
const rightPoly = (pts: [number, number][]) =>
  `polygon(100% 0, 100% 100%, ${[...pts].reverse().map(([x, y]) => `calc(50% + ${x.toFixed(1)}px) ${y.toFixed(1)}%`).join(", ")})`;

export function Loader() {
  const [mounted, setMounted] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<SVGRectElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const halves = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    const seen = html.dataset.seen === "true" || safeSession((s) => s.getItem(SEEN_KEY)) === "1";
    if (seen) {
      html.dataset.loading = "false";
      markLoaderDone(); // the loader stays display:none via html[data-seen]
      return;
    }
    html.dataset.loading = "true";
    lockScroll("loader");

    const reduced = prefersReducedMotion();
    const progress: Record<Key, number> = { video: 0, cutout: 0, fonts: 0 };
    const set = (k: Key, v: number) => (progress[k] = Math.max(progress[k], Math.min(1, v)));
    const start = performance.now();
    let shown = 0;
    let exiting = false;
    let raf = 0;

    // ── critical trackers (first screen only) ──
    const video = document.querySelector<HTMLVideoElement>("video[data-hero-video]");
    const isHome = Boolean(video);
    document.fonts.ready.then(() => set("fonts", 1));
    if (isHome) decodeImage("/images/hero-ppl-cutout.webp").then(() => set("cutout", 1));
    else set("cutout", 1);

    const onVideoProgress = () => {
      if (!video) return;
      if (video.readyState >= 3) return set("video", 1); // enough to start playing; no need for the whole file
      if (video.duration && video.buffered.length) set("video", (video.buffered.end(video.buffered.length - 1) / video.duration) * 3);
    };
    const onVideoReady = () => set("video", 1);
    if (!video) set("video", 1);
    else {
      onVideoProgress();
      video.addEventListener("progress", onVideoProgress);
      video.addEventListener("canplay", onVideoReady);
      video.addEventListener("error", onVideoReady);
    }

    // ── background preloads (home only, never gating) ──
    if (isHome) {
      fetchWithProgress(BANANA_TREE_URL, () => undefined).catch(() => undefined);
      decodeImage("/images/form.webp");
    }

    // ── intro: draw the leaf ──
    const q = gsap.utils.selector(root);
    const introCtx = gsap.context(() => {
      if (reduced) return;
      gsap.fromTo(q(".ld-draw"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.04 });
      gsap.fromTo(q(".ld-in"), { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.1 });
    });

    const lineTimer = window.setInterval(() => setLine((l) => (l + 1) % loaderLines.length), 1150);

    const finish = () => {
      exiting = true;
      window.clearInterval(lineTimer);
      const done = () => {
        safeSession((s) => s.setItem(SEEN_KEY, "1"));
        html.dataset.loading = "false";
        unlockScroll("loader");
        setMounted(false);
        // fonts and the first-screen images are in: recompute every pin and trigger
        requestAnimationFrame(() => ScrollTrigger.refresh());
        // warm drei's GLTF cache once the browser is idle, so three.js never competes with first paint
        if (isHome) {
          const warm = () => import("@/components/three/preloadModel").then((m) => m.preloadBananaTree()).catch(() => undefined);
          if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 4000 });
          else setTimeout(warm, 2000);
        }
      };

      if (reduced) {
        gsap.to(root.current, { autoAlpha: 0, duration: 0.4, onStart: markLoaderDone, onComplete: done });
        return;
      }

      const [left, right] = [q(".ld-left"), q(".ld-right")];
      gsap
        .timeline({ onComplete: done })
        .to(content.current, { autoAlpha: 0, y: -24, duration: 0.5, ease: "power2.in" })
        .fromTo(halves.current, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power4.inOut" }, 0.15)
        .set(root.current, { backgroundColor: "transparent" })
        .add(markLoaderDone, "+=0.05")
        .to(left, { xPercent: -62, duration: 1.25, ease: "power4.inOut" }, "<")
        .to(right, { xPercent: 62, duration: 1.25, ease: "power4.inOut" }, "<");
    };

    const loop = () => {
      const elapsed = performance.now() - start;
      let target = (Object.keys(WEIGHTS) as Key[]).reduce((sum, k) => sum + WEIGHTS[k] * progress[k], 0);
      if (elapsed > MAX_TIME) target = 1;
      // never run ahead of the minimum show time, and ease toward the real value
      const cap = Math.min(1, elapsed / MIN_TIME);
      shown += (Math.min(target, cap) - shown) * 0.09;
      if (Math.min(target, cap) >= 1 && shown > 0.995) shown = 1;

      if (counter.current) counter.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      fill.current?.setAttribute("y", String(200 - 200 * shown));

      if (shown >= 1 && !exiting) finish();
      else if (!exiting) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      introCtx.revert();
      cancelAnimationFrame(raf);
      window.clearInterval(lineTimer);
      video?.removeEventListener("progress", onVideoProgress);
      video?.removeEventListener("canplay", onVideoReady);
      video?.removeEventListener("error", onVideoReady);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={root}
      className="vcc-loader fixed inset-0 z-[100] overflow-hidden bg-paper text-leaf-900"
      role="progressbar"
      aria-label="Loading the village"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div ref={content} className="absolute inset-0">
        {/* Leaf: midrib + outline draw in, then fills bottom → top with real progress */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg viewBox="0 0 100 200" className="h-[min(42vh,340px)] w-auto -rotate-12" aria-hidden="true">
            <defs>
              <clipPath id="ld-leaf-clip">
                <path d={LEAF_OUTLINE} />
              </clipPath>
            </defs>
            <rect x="0" y="0" width="100" height="200" fill="var(--leaf-100)" clipPath="url(#ld-leaf-clip)" />
            <rect ref={fill} x="0" y="200" width="100" height="200" fill="var(--leaf-500)" clipPath="url(#ld-leaf-clip)" />
            <g fill="none" stroke="var(--leaf-900)" strokeLinecap="round" strokeLinejoin="round">
              <path className="ld-draw" d={LEAF_OUTLINE} strokeWidth={1.4} pathLength={1} strokeDasharray={1} />
              <path className="ld-draw" d={LEAF_MIDRIB} strokeWidth={2} pathLength={1} strokeDasharray={1} />
              {LEAF_VEINS.map((d) => (
                <path key={d} className="ld-draw" d={d} strokeWidth={0.8} pathLength={1} strokeDasharray={1} opacity={0.5} />
              ))}
            </g>
          </svg>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-[clamp(1rem,4vw,3rem)]">
          <div className="overflow-hidden">
            <span
              ref={counter}
              className="ld-in font-display block text-[clamp(5rem,16vw,15rem)] font-extrabold leading-[0.8] tracking-tightest tabular-nums"
            >
              000
            </span>
          </div>
          <div className="overflow-hidden pb-2 text-right">
            <div className="ld-in" aria-live="polite">
              <p key={`ta-${line}`} className="font-tamil animate-[ld-swap_0.6s_var(--ease-expo)] text-lg font-bold text-leaf-700 md:text-2xl">
                {loaderLines[line].ta}
              </p>
              <p key={`en-${line}`} className="eyebrow animate-[ld-swap_0.6s_var(--ease-expo)] mt-1 text-leaf-900/70">
                {loaderLines[line].en}
              </p>
            </div>
          </div>
        </div>

        <p className="eyebrow absolute left-[clamp(1rem,4vw,3rem)] top-[clamp(1rem,4vw,3rem)] text-leaf-900/70">
          VCC · Fan tribute
        </p>
      </div>

      {/* Exit panel: two leaf-green halves with a shared torn seam and white paper fibres */}
      <div ref={halves} className="absolute inset-0 translate-y-full" aria-hidden="true">
        {/* fibres sit under both greens so the seam is invisible until the halves part */}
        <div className="ld-left absolute inset-0 bg-white" style={{ clipPath: leftPoly(FIBRE_L) }} />
        <div className="ld-right absolute inset-0 bg-white" style={{ clipPath: rightPoly(FIBRE_R) }} />
        <div className="ld-left absolute inset-0 bg-leaf-700" style={{ clipPath: leftPoly(SEAM) }} />
        <div className="ld-right absolute inset-0 bg-leaf-700" style={{ clipPath: rightPoly(SEAM) }} />
      </div>

      <style>{`@keyframes ld-swap{from{opacity:0;transform:translateY(60%)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
