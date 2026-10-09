"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Flip, gsap } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { channel, searchUrl, thumbnailUrl, videos, type Video } from "@/data/videos";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillButton } from "@/components/ui/PillButton";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { VideoLightbox } from "./VideoLightbox";

function Thumbnail({ video, big }: { video: Video; big: boolean }) {
  const [src, setSrc] = useState(video.youtubeId ? thumbnailUrl(video.youtubeId) : "");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail with a runtime quality fallback
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setSrc(thumbnailUrl(video.youtubeId, "hqdefault"))}
        className="mw-zoom absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  // Designed placeholder in a bold, high-contrast thumbnail style.
  const [bg, accent] = video.palette;
  return (
    <div className="mw-zoom absolute inset-0 overflow-hidden" style={{ background: bg }} aria-hidden="true">
      <div
        className="absolute inset-0 opacity-25"
        style={{ backgroundImage: `repeating-linear-gradient(-35deg, transparent 0 18px, ${accent} 18px 20px)` }}
      />
      <BananaLeaf veins className="absolute -right-[6%] -top-[30%] h-[160%] w-auto rotate-[30deg] opacity-30" fill={accent} stroke={bg} />
      {big && (
        <span className="font-display absolute bottom-[6%] right-[5%] text-[clamp(4rem,9vw,9rem)] font-extrabold leading-none tracking-tightest text-transparent [-webkit-text-stroke:2px_rgba(251,253,247,.75)]">
          {video.views}
        </span>
      )}
      <p
        className={`font-display absolute left-[6%] top-[10%] max-w-[70%] font-extrabold uppercase leading-[0.88] tracking-tightest text-paper [text-shadow:0_4px_0_rgba(15,46,23,.55)] ${
          big ? "text-[clamp(2.25rem,1rem+4vw,5rem)]" : "text-[15px]"
        }`}
      >
        {video.title}
      </p>
    </div>
  );
}

function PlayMark({ big }: { big: boolean }) {
  // circle → leaf on hover
  return (
    <span
      aria-hidden="true"
      className={`absolute flex items-center justify-center rounded-[50%] bg-paper text-leaf-900 shadow-leaf transition-[border-radius,transform,background-color] duration-700 ease-[var(--ease-expo)] group-hover:rotate-45 group-hover:rounded-[0_100%_0_100%] group-hover:bg-turmeric ${
        big ? "left-[calc(50%-2.5rem)] top-[calc(50%-2.5rem)] h-20 w-20" : "bottom-2 right-2 h-8 w-8"
      }`}
    >
      <span className={`block transition-transform duration-700 group-hover:-rotate-45 ${big ? "text-2xl" : "text-[10px]"}`}>▶</span>
    </span>
  );
}

export function MostWatched() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [order, setOrder] = useState(videos.map((v) => v.id));
  const [playing, setPlaying] = useState<Video | null>(null);
  const closePlayer = useCallback(() => setPlaying(null), []);
  useReveal(root);

  const byId = (id: string) => videos.find((v) => v.id === id)!;

  const feature = (id: string) => {
    if (order[0] === id) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flipState.current = Flip.getState(grid.current!.querySelectorAll(".mw-item, .mw-thumb"));
    }
    // the selected video swaps places with the current feature
    setOrder((o) => {
      const next = [...o];
      const i = next.indexOf(id);
      [next[0], next[i]] = [next[i], next[0]];
      return next;
    });
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, { duration: 0.9, ease: "power4.inOut", nested: true, absolute: true, zIndex: 5 });
    // the item's layout changes between list and feature, so its text fades in once it has landed
    gsap.fromTo(grid.current!.querySelectorAll(".mw-text"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.55, stagger: 0.04 });
  }, [order]);

  return (
    <section ref={root} aria-labelledby="watched-title" className="relative py-[clamp(6rem,12vw,10rem)]">
      <div className="container-x">
        <SectionHeading
          id="watched-title"
          eyebrow={channel.eyebrow}
          parts={[
            { text: channel.title.lead, style: "display" },
            { text: channel.title.accent, style: "accent" },
          ]}
        />

        {/* Channel preview, in our own design language */}
        <div data-reveal="media" className="mt-[clamp(2.5rem,5vw,4rem)] overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
          <div className="relative h-28 overflow-hidden md:h-44">
            <div data-reveal-inner className="absolute inset-0">
              <Image src={channel.banner} alt="" fill sizes="(min-width: 1440px) 1340px, 100vw" className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-6 md:p-7">
            <div className="relative -mt-14 h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-leaf-100 shadow-leaf md:-mt-16 md:h-28 md:w-28">
              <Image src={channel.avatar} alt="Thatha, M. Periyathambi" fill sizes="112px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-extrabold tracking-tightest md:text-3xl">{channel.name}</p>
              <p className="mt-1 text-sm text-leaf-900/65">
                {channel.handle} · {channel.subscribers} · {channel.videoCount}
              </p>
            </div>
            <PillButton href={channel.subscribeUrl} external variant="accent">
              Subscribe on YouTube <span aria-hidden="true">↗</span>
            </PillButton>
          </div>
        </div>

        {/* Featured player + up next */}
        <ul ref={grid} className="mt-6 grid gap-4 lg:grid-cols-3 lg:grid-rows-4" aria-label="Most watched videos">
          {order.map((id, i) => {
            const v = byId(id);
            const big = i === 0;
            return (
              <li
                key={id}
                data-flip-id={id}
                className={`mw-item ${big ? "lg:col-span-2 lg:row-span-4" : "lg:col-start-3"}`}
              >
                {big ? (
                  <div className="flex h-full flex-col gap-4">
                    <div data-flip-id={`t-${id}`} className="mw-thumb group relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-leaf-900">
                      <Thumbnail video={v} big />
                      {v.youtubeId ? (
                        <button type="button" onClick={() => setPlaying(v)} className="absolute inset-0" aria-label={`Play ${v.title}`} data-cursor="Play">
                          <PlayMark big />
                        </button>
                      ) : (
                        <a href={searchUrl(v.title)} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label={`Find ${v.title} on YouTube (opens in a new tab)`} data-cursor="Play">
                          <PlayMark big />
                        </a>
                      )}
                    </div>
                    <div className="mw-text flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tightest md:text-3xl">{v.title}</h3>
                      <span className="shrink-0 rounded-full bg-leaf-100 px-3 py-1 text-sm font-bold tabular-nums text-leaf-700">{v.views} views</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => feature(id)}
                    className="group flex h-full w-full items-center gap-4 rounded-[22px] border border-line bg-white p-2.5 pr-4 text-left transition-colors hover:border-leaf-300"
                  >
                    <div data-flip-id={`t-${id}`} className="mw-thumb relative aspect-video w-[44%] shrink-0 overflow-hidden rounded-2xl bg-leaf-900">
                      <Thumbnail video={v} big={false} />
                      <PlayMark big={false} />
                    </div>
                    <div className="mw-text min-w-0 overflow-hidden">
                      <p className="eyebrow text-[10px] text-leaf-700">Up next</p>
                      <p className="mt-1 translate-y-1 font-display text-lg font-extrabold uppercase leading-[0.95] tracking-tightest transition-transform duration-500 group-hover:translate-y-0">
                        {v.title}
                      </p>
                      <p className="mt-1 text-sm text-leaf-900/70 tabular-nums">{v.views} views</p>
                    </div>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {playing && <VideoLightbox video={playing} onClose={closePlayer} />}

      <style>{`.group:hover .mw-zoom{transform:scale(1.06)} .mw-zoom{transition:transform 1.4s var(--ease-expo)}`}</style>
    </section>
  );
}
