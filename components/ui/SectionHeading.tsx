import { BananaLeaf } from "./BananaLeaf";

type Part = { text: string; style: "display" | "serif" | "accent" };

// Eyebrow + mixed Bricolage / Instrument Serif heading, wired for the shared reveal.
export function SectionHeading({
  eyebrow,
  parts,
  sub,
  align = "left",
  id,
  className = "",
}: {
  eyebrow?: string;
  parts: Part[];
  sub?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p data-reveal="body" className={`eyebrow flex items-center gap-3 text-leaf-700 ${centered ? "justify-center" : ""}`}>
          <BananaLeaf veins={false} className="h-5 w-2.5 rotate-[24deg] text-leaf-500" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} data-reveal="heading" className="mt-5 text-[length:var(--text-h2)] leading-[0.92]">
        {parts.map((p, i) => (
          <span
            key={i}
            className={
              p.style === "display"
                ? "font-display font-extrabold uppercase tracking-tightest"
                : p.style === "accent"
                  ? "font-serif italic text-turmeric-ink"
                  : "font-serif italic"
            }
          >
            {p.text}
            {i < parts.length - 1 ? " " : ""}
          </span>
        ))}
      </h2>
      {sub && (
        <p data-reveal="body" className={`mt-5 max-w-md text-leaf-900/70 ${centered ? "mx-auto" : ""}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
