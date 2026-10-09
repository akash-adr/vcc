"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { TransitionLink } from "@/components/layout/PageTransition";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
  external?: boolean;
  magnetic?: boolean;
  onClick?: () => void;
};

const variants = {
  primary: "bg-leaf-900 text-paper",
  accent: "bg-turmeric text-leaf-900",
  secondary: "border border-line bg-transparent text-leaf-900",
};

const wipe = {
  primary: "bg-turmeric",
  accent: "bg-leaf-900",
  secondary: "bg-leaf-900",
};

const hoverText = {
  primary: "group-hover:text-leaf-900",
  accent: "group-hover:text-paper",
  secondary: "group-hover:text-paper",
};

export function PillButton({ href, children, variant = "primary", className = "", external, magnetic = true, onClick }: Props) {
  const wrap = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = wrap.current;
      if (!el || !magnetic || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "expo.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: wrap },
  );

  const cls = `group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-colors duration-500 ${variants[variant]} ${className}`;
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-left scale-x-0 rounded-full transition-transform duration-[650ms] ease-[var(--ease-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${wipe[variant]}`}
      />
      <span className={`relative z-10 flex items-center gap-2 transition-colors duration-500 ${hoverText[variant]}`}>{children}</span>
    </>
  );

  return (
    <span ref={wrap} className="inline-block will-change-transform">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
          {inner}
        </a>
      ) : (
        <TransitionLink href={href} className={cls} onClick={onClick}>
          {inner}
        </TransitionLink>
      )}
    </span>
  );
}
