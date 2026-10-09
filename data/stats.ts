// Channel numbers. Update `asOf` whenever these change.

export type Stat = {
  id: string;
  /** numeric part that counts up; omit for text-only cells */
  value?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** grid placement on desktop */
  size: "hero" | "wide" | "small" | "text";
};

export const stats: Stat[] = [
  { id: "subs", value: 31, suffix: "M+", label: "subscribers on YouTube", size: "hero" },
  { id: "views", value: 10, suffix: "B+", label: "total views", size: "wide" },
  { id: "watermelon", value: 340, suffix: "M", label: "views on one video (Watermelon Juice)", size: "small" },
  { id: "fed", value: 100, suffix: "+", label: "people fed after every shoot", size: "small" },
  { id: "thatha", value: 50, suffix: "+", label: "years of Thatha's cooking", size: "small" },
  { id: "diamond", label: "1st Tamil channel with a Diamond Play Button", size: "text" },
];

export const statsMeta = {
  eyebrow: "Chapter 02 · By the numbers",
  title: { lead: "Big pots,", accent: "bigger numbers." },
  asOf: "Stats as of Oct 2026",
};
