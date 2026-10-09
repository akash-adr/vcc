"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import { story } from "@/data/timeline";

export function Quote() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const { quote } = story;
  return (
    <section ref={root} aria-label="Ellarum vaanga" className="container-x py-[clamp(6rem,12vw,10rem)] text-center">
      <figure className="mx-auto max-w-4xl">
        <p lang="ta" aria-hidden="true" data-reveal="body" className="font-tamil text-[clamp(1.4rem,1rem+1.5vw,2.25rem)] font-extrabold text-leaf-700">
          {quote.ta}
        </p>
        <blockquote data-reveal="heading" className="mt-4 font-serif text-[clamp(2.75rem,1.5rem+5vw,6.5rem)] italic leading-[0.98] text-leaf-900">
          “{quote.text}”
        </blockquote>
        <figcaption data-reveal="body" className="mx-auto mt-8 max-w-xl text-leaf-900/75">
          {quote.note}
        </figcaption>
      </figure>
    </section>
  );
}
