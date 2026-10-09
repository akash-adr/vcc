// Rising steam wisps (pure SVG + CSS keyframes `steam`).
export function Steam({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={`pointer-events-none ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={["M30 118 C18 96 42 82 30 60 C18 38 40 26 32 4", "M24 118 C12 98 34 84 24 62 C14 42 30 30 24 10", "M36 118 C48 98 26 82 38 62 C48 44 32 30 40 12"][i]}
          fill="none"
          stroke="rgba(255,255,255,.5)"
          strokeWidth="9"
          strokeLinecap="round"
          className="animate-[steam_4.2s_ease-in-out_infinite] opacity-0 [filter:blur(6px)]"
          style={{ animationDelay: `${i * 1.35}s`, transformOrigin: "50% 100%", transformBox: "fill-box" }}
        />
      ))}
    </svg>
  );
}
