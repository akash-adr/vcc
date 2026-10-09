"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/components/layout/SmoothScroll";
import type { Video } from "@/data/videos";

// youtube-nocookie player, mounted only when opened. Esc / backdrop closes; focus is trapped and restored.
export function VideoLightbox({ video, onClose }: { video: Video; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    lockScroll("lightbox");
    closeBtn.current?.focus();
    // opacity only: autoAlpha would hide the dialog (visibility) and block the initial focus
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.fromTo(root.current!.querySelector(".lb-frame"), { scale: 0.92, y: 30 }, { scale: 1, y: 0, duration: 0.8, ease: "expo.out" });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !root.current) return;
      const focusables = root.current.querySelectorAll<HTMLElement>("button, iframe, a[href]");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll("lightbox");
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${video.title}: video player`}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-leaf-900/85 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="lb-frame relative w-full max-w-[1100px]">
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          className="absolute -top-14 right-0 flex h-11 items-center gap-2 rounded-full bg-paper px-4 text-sm font-bold text-leaf-900"
        >
          Close <span aria-hidden="true">✕</span>
        </button>
        <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] bg-black shadow-leaf">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
