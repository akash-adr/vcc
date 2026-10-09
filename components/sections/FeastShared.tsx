"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { feast } from "@/data/story";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillButton } from "@/components/ui/PillButton";
import { TornEdge } from "@/components/ui/TornEdge";

// A banana-leaf meal, top-down. Midrib runs along the top edge, like a leaf laid out for serving.
const LEAF = "M60 70 C420 34 1180 34 1555 64 C1590 150 1585 250 1548 318 C1180 352 420 352 52 322 C18 240 22 140 60 70 Z";
const VEINS = Array.from({ length: 34 }, (_, i) => {
  const x = 90 + i * 44;
  return `M${x} 72 C${x + 10} 160 ${x + 20} 250 ${x + 28} 330`;
});

type Portion = { x: number; y: number; r: number; kind: "rice" | "sambar" | "rasam" | "poriyal" | "kootu" | "appalam" | "payasam" | "pickle" | "banana" | "sweet" | "salt" };
const PORTIONS: Portion[] = [
  { x: 160, y: 130, r: 16, kind: "salt" },
  { x: 230, y: 125, r: 22, kind: "pickle" },
  { x: 320, y: 130, r: 30, kind: "sweet" },
  { x: 420, y: 200, r: 62, kind: "poriyal" },
  { x: 560, y: 150, r: 46, kind: "kootu" },
  { x: 760, y: 225, r: 96, kind: "rice" },
  { x: 930, y: 140, r: 48, kind: "sambar" },
  { x: 1060, y: 250, r: 44, kind: "rasam" },
  { x: 1180, y: 150, r: 70, kind: "appalam" },
  { x: 1330, y: 245, r: 52, kind: "payasam" },
  { x: 1450, y: 150, r: 40, kind: "banana" },
];

// Round generated geometry so server and client floats serialise identically (avoids hydration mismatches).
const f = (n: number) => Math.round(n * 10) / 10;

function PortionArt({ p }: { p: Portion }) {
  const { x, y, r } = p;
  switch (p.kind) {
    case "rice":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#FFFDF5" />
          {Array.from({ length: 40 }, (_, i) => {
            const a = i * 2.4;
            const d = (r - 12) * Math.sqrt((i + 1) / 41);
            const ex = f(x + Math.cos(a) * d);
            const ey = f(y + Math.sin(a) * d);
            return <ellipse key={i} cx={ex} cy={ey} rx={4} ry={1.6} transform={`rotate(${i * 37} ${ex} ${ey})`} fill="#ECE6D2" />;
          })}
          <circle cx={x + 18} cy={y - 10} r={r * 0.32} fill="#E9A43A" opacity={0.85} />
        </g>
      );
    case "sambar":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#D97B22" />
          <circle cx={x - 10} cy={y - 6} r={8} fill="#F2B544" />
          <circle cx={x + 14} cy={y + 10} r={6} fill="#4E9A3A" />
          <circle cx={x + 6} cy={y - 16} r={5} fill="#A85D38" />
        </g>
      );
    case "rasam":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#A8431F" />
          <circle cx={x - 8} cy={y + 6} r={4} fill="#4E9A3A" />
          <circle cx={x + 10} cy={y - 8} r={3} fill="#4E9A3A" />
        </g>
      );
    case "poriyal":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#6FAE48" />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={f(x + Math.cos(i * 1.9) * (r - 14) * ((i % 5) / 5 + 0.15))} cy={f(y + Math.sin(i * 1.9) * (r - 14) * ((i % 5) / 5 + 0.15))} r={3.4} fill={i % 3 ? "#A9D18E" : "#FBFDF7"} />
          ))}
        </g>
      );
    case "kootu":
      return <circle cx={x} cy={y} r={r} fill="#E8C14E" />;
    case "appalam":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#F4E3B5" />
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={f(x + Math.cos(i * 2.2) * r * 0.6 * ((i % 4) / 4 + 0.3))} cy={f(y + Math.sin(i * 2.2) * r * 0.6 * ((i % 4) / 4 + 0.3))} r={5 + (i % 3) * 2} fill="none" stroke="#E2C98A" strokeWidth={1.5} />
          ))}
        </g>
      );
    case "payasam":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#EBD9B4" />
          <circle cx={x - 12} cy={y - 8} r={5} fill="#C98A3C" />
          <circle cx={x + 10} cy={y + 6} r={4} fill="#C98A3C" />
        </g>
      );
    case "pickle":
      return <circle cx={x} cy={y} r={r} fill="#C2401F" />;
    case "banana":
      return <path d={`M${x - r} ${y + 10} C${x - r / 2} ${y + r} ${x + r / 2} ${y + r} ${x + r} ${y - 14} C${x + r / 2} ${y + r / 2} ${x - r / 2} ${y + r / 2} ${x - r} ${y + 10} Z`} fill="#F2C94C" stroke="#C99A2E" strokeWidth={2} />;
    case "sweet":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#EA971F" />
          <circle cx={x - 8} cy={y - 8} r={6} fill="#F4C46A" />
        </g>
      );
    case "salt":
      return <circle cx={x} cy={y} r={r} fill="#FFFFFF" stroke="#E3F0D3" strokeWidth={2} />;
  }
}

const ICONS: Record<string, React.ReactNode> = {
  pot: <path d="M6 12h20v8a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6v-8Zm-2 0h24M10 8c0-2 2-2 2-4m4 4c0-2 2-2 2-4m4 4c0-2 2-2 2-4" />,
  hands: <path d="M4 18c4 0 6 2 8 4h8a2 2 0 0 0 0-4h-5m-11 0v8h4m7-8 7-3a2 2 0 0 1 2 3l-7 5M16 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />,
  heart: <path d="M16 27S4 20 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 15-12 15Z" />,
};

export function FeastShared() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: q(".fs-leaf")[0], start: "top 80%", end: "bottom 35%", scrub: 0.8 },
        });
        tl.fromTo(q(".fs-leaf")[0], { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 });
        // each portion lands just after the unrolling edge passes it
        q(".fs-portion").forEach((el) => {
          const at = Number(el.dataset.x) / 1600;
          tl.fromTo(
            el,
            { scale: 0, rotate: -40, svgOrigin: `${el.dataset.x} ${el.dataset.y}` },
            { scale: 1, rotate: 0, duration: 0.18, ease: "back.out(2.2)" },
            at * 0.95 + 0.05,
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="feast-title" className="relative bg-paper-2 pb-[clamp(6rem,12vw,10rem)] pt-[clamp(6rem,12vw,9rem)]">
      <TornEdge position="top" color="var(--paper-2)" seed={27} />
      <div className="container-x">
        <SectionHeading
          id="feast-title"
          align="center"
          eyebrow="Chapter 05 · The feast"
          parts={[
            { text: feast.title.lead, style: "display" },
            { text: feast.title.accent, style: "accent" },
          ]}
        />
      </div>

      <div className="relative mt-[clamp(2.5rem,6vw,5rem)] overflow-hidden px-[clamp(0.5rem,2vw,2rem)]">
        <svg
          viewBox="0 0 1600 380"
          className="fs-leaf mx-auto block h-auto w-[min(150vw,1600px)] max-w-none -translate-x-[16%] drop-shadow-[0_30px_40px_rgba(15,46,23,.22)] md:w-full md:max-w-[1600px] md:translate-x-0"
          role="img"
          aria-label="A banana leaf laid out with rice, sambar, rasam, vegetables, appalam, payasam and sweets"
        >
          <defs>
            <linearGradient id="fs-leaf-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5DAA45" />
              <stop offset="1" stopColor="#3E8A2F" />
            </linearGradient>
          </defs>
          <path d={LEAF} fill="url(#fs-leaf-fill)" />
          <g fill="none" stroke="#A9D18E" strokeWidth="1.2" opacity="0.45">
            {VEINS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <path d="M58 72 C420 40 1180 40 1556 68" fill="none" stroke="#E3F0D3" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
          {PORTIONS.map((p) => (
            <g key={p.kind} className="fs-portion" data-x={p.x} data-y={p.y}>
              <circle cx={p.x} cy={p.y + 4} r={p.r} fill="#0F2E17" opacity="0.18" />
              <PortionArt p={p} />
            </g>
          ))}
        </svg>
      </div>

      <div className="container-x mt-[clamp(3rem,6vw,5rem)]">
        <ul className="grid gap-4 md:grid-cols-3">
          {feast.facts.map((f) => (
            <li key={f.icon} data-reveal="body" className="flex items-start gap-4 rounded-[var(--radius-card)] border border-line bg-white p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-700">
                <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[f.icon]}
                </svg>
              </span>
              <p className="font-semibold leading-snug text-leaf-900">{f.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-col items-center gap-8 text-center">
          <p data-reveal="body" className="max-w-4xl">
            <span lang="ta" className="font-tamil block text-[clamp(1.6rem,1rem+2.4vw,3rem)] font-extrabold leading-tight text-leaf-700">
              {feast.closing.ta}
            </span>
            <span className="mt-2 block font-serif text-[clamp(1.4rem,1rem+1.4vw,2.2rem)] italic text-leaf-900">{feast.closing.en}</span>
          </p>
          <div data-reveal="body">
            <PillButton href={feast.cta.href}>
              {feast.cta.label} <span aria-hidden="true">→</span>
            </PillButton>
          </div>
        </div>
      </div>
      <TornEdge position="bottom" color="var(--paper-2)" seed={33} />
    </section>
  );
}
