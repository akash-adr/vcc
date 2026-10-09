import type { CSSProperties, ReactNode } from "react";

// Torn white paper sticker. The shadow lives on the wrapper because clip-path would cut it off.

function tornPolygon(seed: number) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts: string[] = [];
  const edge = (from: [number, number], to: [number, number], n: number) => {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      const jx = from[0] === to[0] ? (r() - 0.5) * 3 : 0;
      const jy = from[1] === to[1] ? (r() - 0.5) * 7 : 0;
      pts.push(`${(x + jx).toFixed(1)}% ${(y + jy).toFixed(1)}%`);
    }
  };
  edge([1.5, 3.5], [98.5, 3.5], 14);
  edge([98.5, 3.5], [98.5, 96.5], 5);
  edge([98.5, 96.5], [1.5, 96.5], 14);
  edge([1.5, 96.5], [1.5, 3.5], 5);
  return `polygon(${pts.join(", ")})`;
}

type Props = {
  children: ReactNode;
  seed?: number;
  tone?: "turmeric" | "leaf";
  className?: string;
  style?: CSSProperties;
};

export function Sticker({ children, seed = 3, tone = "leaf", className = "", style }: Props) {
  return (
    <div className={`drop-shadow-[0_10px_14px_rgba(15,46,23,0.28)] ${className}`} style={style}>
      <div
        className={`bg-white px-4 py-2.5 font-serif text-[clamp(1.1rem,0.7rem+1.15vw,2.1rem)] italic leading-none whitespace-nowrap ${
          tone === "turmeric" ? "text-clay" : "text-leaf-700"
        }`}
        style={{ clipPath: tornPolygon(seed) }}
      >
        {children}
      </div>
    </div>
  );
}
