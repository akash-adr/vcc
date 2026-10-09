import Image from "next/image";
import type { Dish } from "@/data/dishes";

const TONES: Record<Dish["category"], { bg: string; ink: string; mark: string }> = {
  Veg: { bg: "bg-leaf-100", ink: "text-leaf-700", mark: "text-leaf-500/15" },
  "Non-veg": { bg: "bg-[#F6E6D6]", ink: "text-clay", mark: "text-clay/12" },
  Sweets: { bg: "bg-[#FBEBC9]", ink: "text-turmeric-ink", mark: "text-turmeric/20" },
};

/** Photo if one exists in /public/images/dishes, otherwise a typographic plate: big initial + Tamil watermark. */
export function DishVisual({ dish, className = "" }: { dish: Dish; className?: string }) {
  const tone = TONES[dish.category];
  if (dish.image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={dish.image} alt={dish.title} fill sizes="(min-width: 1024px) 400px, 90vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${tone.bg} ${className}`} aria-hidden="true">
      {/* decorative watermark rendered as pseudo-content so it isn't treated as text */}
      <span
        data-mark={dish.ta}
        className={`font-tamil absolute -bottom-[0.18em] -left-[0.04em] whitespace-nowrap text-[5.5rem] font-extrabold leading-none before:content-[attr(data-mark)] ${tone.mark}`}
      />
      <span className={`font-display absolute right-[8%] top-[4%] text-[9rem] font-extrabold leading-none tracking-tightest ${tone.ink} opacity-90`}>
        {dish.initial}
      </span>
    </div>
  );
}

export function FireLevel({ level, className = "" }: { level: 1 | 2 | 3; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Fire level ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 16 24" className={`h-4 w-3 ${n <= level ? "text-ember" : "text-leaf-900/15"}`} aria-hidden="true">
          {/* dried red chilli */}
          <path d="M8 6 C13 8 13 16 6 22 C5 23 3 22 4 20 C7 15 7 10 5 7 C5 6 6 5 8 6 Z" fill="currentColor" />
          <path d="M7 6 C7 3 9 2 11 1" fill="none" stroke="#4E9A3A" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ))}
    </span>
  );
}
