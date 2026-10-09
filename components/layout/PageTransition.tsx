"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { prefersReducedMotion, setTransitioning } from "@/lib/app-state";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

// The wipe is one path: a top edge (T, bulging to Tc) and a bottom edge (B, bulging to Bc).
type Shape = { t: number; tc: number; b: number; bc: number };
const toD = ({ t, tc, b, bc }: Shape) => `M0 ${t} Q50 ${tc} 100 ${t} L100 ${b} Q50 ${bc} 0 ${b} Z`;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const overlay = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pendingHash = useRef<string | null>(null);
  const awaitingRoute = useRef(false);
  const lastPath = useRef(pathname);

  const scrollToHash = useCallback(
    (hash: string, immediate = false) => {
      const el = document.getElementById(hash.replace("#", ""));
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -24, immediate, duration: 1.6, force: true });
      else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    },
    [lenis],
  );

  const reveal = useCallback(() => {
    const shape: Shape = { t: 0, tc: 0, b: 100, bc: 100 };
    gsap
      .timeline({
        onComplete: () => {
          busy.current = false;
          gsap.set(overlay.current, { autoAlpha: 0 });
        },
      })
      .to(mark.current, { autoAlpha: 0, y: -30, duration: 0.35, ease: "power2.in" })
      .add(() => setTransitioning(false), 0.3)
      .to(
        shape,
        {
          b: 0,
          duration: 0.9,
          ease: "power4.inOut",
          onUpdate() {
            const p = this.progress();
            shape.bc = shape.b + 28 * Math.sin(Math.PI * p);
            path.current?.setAttribute("d", toD(shape));
          },
        },
        0.1,
      );
  }, []);

  // Route actually changed: reset scroll, refresh triggers, then lift the wipe off.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);

    const hash = pendingHash.current;
    pendingHash.current = null;
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (hash) scrollToHash(hash, true);
    });

    if (awaitingRoute.current) {
      awaitingRoute.current = false;
      reveal();
    }
  }, [pathname, lenis, reveal, scrollToHash]);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }
      if (url.pathname === window.location.pathname) {
        // next frame: let effects from the click (e.g. closing the menu → lenis.start(), which resets scroll) settle first
        if (url.hash) requestAnimationFrame(() => scrollToHash(url.hash));
        else if (lenis) lenis.scrollTo(0, { duration: 1.4, force: true });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (busy.current) return;
      pendingHash.current = url.hash || null;

      if (prefersReducedMotion()) {
        router.push(url.pathname);
        return;
      }

      busy.current = true;
      setTransitioning(true);
      const shape: Shape = { t: 100, tc: 100, b: 100, bc: 100 };
      gsap.set(overlay.current, { autoAlpha: 1 });
      gsap.set(mark.current, { autoAlpha: 0, y: 30 });
      gsap
        .timeline({
          onComplete: () => {
            awaitingRoute.current = true;
            router.push(url.pathname);
            // Safety net: never leave the wipe covering the page.
            window.setTimeout(() => {
              if (awaitingRoute.current) {
                awaitingRoute.current = false;
                reveal();
              }
            }, 4000);
          },
        })
        .to(shape, {
          t: 0,
          duration: 0.85,
          ease: "power4.inOut",
          onUpdate() {
            const p = this.progress();
            shape.tc = shape.t - 26 * Math.sin(Math.PI * p);
            path.current?.setAttribute("d", toD(shape));
          },
        })
        .to(mark.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, "-=0.35");
    },
    [lenis, reveal, router, scrollToHash],
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={overlay} aria-hidden="true" className="pointer-events-auto invisible fixed inset-0 z-[80] opacity-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path ref={path} d={toD({ t: 100, tc: 100, b: 100, bc: 100 })} fill="var(--leaf-700)" />
        </svg>
        <div ref={mark} className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-paper">
          <BananaLeaf className="h-20 w-10 rotate-12 text-leaf-500" stroke="var(--leaf-100)" />
          <span className="font-display text-3xl font-extrabold tracking-tightest">VCC</span>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

type LinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** A Next <Link> that plays the leaf wipe before navigating. Modifier-clicks behave normally. */
export function TransitionLink({ href, onClick, children, ...rest }: LinkProps) {
  const { navigate } = usePageTransition();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <Link href={href} onClick={handle} scroll={false} {...rest}>
      {children}
    </Link>
  );
}
