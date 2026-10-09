// Torn-paper edge that echoes the white border around the hero cut-out.
// Placed inside a `relative` section: "top" tears the section's top edge, "bottom" its bottom edge.
// `color` is the section's own paper colour; the white fibre layer peeks out past the tear.

type Props = {
  position?: "top" | "bottom";
  color?: string;
  seed?: number;
  height?: number;
  className?: string;
};

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function tornPath(seed: number, base: number, amp: number, W = 1440, H = 80) {
  const r = rng(seed);
  let x = 0;
  let d = `M0 ${H} L0 ${base}`;
  while (x < W) {
    x = Math.min(W, x + 10 + r() * 26);
    // occasional deep bite, otherwise small jagged teeth
    const bite = r() < 0.12 ? amp * (0.7 + r() * 0.6) : amp * r() * 0.55;
    d += ` L${x.toFixed(1)} ${(base - bite).toFixed(1)}`;
  }
  return `${d} L${W} ${H} Z`;
}

export function TornEdge({ position = "bottom", color = "var(--paper)", seed = 7, height = 56, className = "" }: Props) {
  const fibre = tornPath(seed * 31 + 3, 40, 34);
  const paper = tornPath(seed, 48, 30);
  const isTop = position === "top";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 ${isTop ? "bottom-full" : "top-full rotate-180"} ${className}`}
      style={{ height, filter: "drop-shadow(0 -10px 14px rgba(15,46,23,0.10))", marginBottom: isTop ? -1 : 0, marginTop: isTop ? 0 : -1 }}
    >
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-full w-full">
        <path d={fibre} fill="#ffffff" />
        <path d={paper} fill={color} />
      </svg>
    </div>
  );
}
