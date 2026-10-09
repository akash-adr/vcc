import type { Metadata } from "next";
import { PillButton } from "@/components/ui/PillButton";
import { Steam } from "@/components/ui/Steam";
import { TornEdge } from "@/components/ui/TornEdge";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

function ClayPot() {
  return (
    <svg viewBox="0 0 220 170" className="h-auto w-[min(60vw,260px)]" aria-hidden="true">
      <ellipse cx="110" cy="160" rx="86" ry="9" fill="#0F2E17" opacity="0.12" />
      <path d="M30 62 C26 120 60 156 110 156 C160 156 194 120 190 62 Z" fill="#A85D38" />
      <path d="M30 62 C26 120 60 156 110 156 C88 140 70 110 72 62 Z" fill="#8E4B2B" opacity="0.55" />
      <ellipse cx="110" cy="62" rx="84" ry="16" fill="#C9774A" />
      <ellipse cx="110" cy="62" rx="70" ry="10" fill="#2B1A12" />
      <path d="M50 92 C80 100 140 100 170 92" fill="none" stroke="#EA971F" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <section className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden bg-paper-2 px-4 pb-24 pt-32 text-center">
      <div className="relative">
        <Steam className="absolute -top-[85%] left-1/2 h-[110%] w-auto -translate-x-1/2 [&_path]:!stroke-[rgba(15,46,23,.35)]" />
        <ClayPot />
      </div>
      <p className="eyebrow mt-10 text-leaf-700">Error 404</p>
      <h1 className="mt-4 font-display text-[clamp(3rem,1rem+9vw,9rem)] font-extrabold uppercase leading-[0.85] tracking-tightest">
        This pot is <span className="font-serif font-normal normal-case italic tracking-normal text-turmeric-ink">empty.</span>
      </h1>
      <p className="mt-5 max-w-md text-leaf-900/75">The page you were looking for isn&apos;t on the menu. The fire&apos;s still going back home.</p>
      <div className="mt-8">
        <PillButton href="/">
          Back to the feast <span aria-hidden="true">→</span>
        </PillButton>
      </div>
      <TornEdge position="bottom" color="var(--paper-2)" seed={71} />
    </section>
  );
}
