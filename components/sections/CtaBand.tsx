import { PillButton } from "@/components/ui/PillButton";
import { BananaLeaf } from "@/components/ui/BananaLeaf";

// Closing call-to-action shared by the secondary pages.
export function CtaBand({ title = "Got a recipe that tastes like home?", ta = "விருந்தில் சேருங்கள்" }: { title?: string; ta?: string }) {
  return (
    <section aria-label="Join the feast" className="container-x py-[clamp(4rem,9vw,7rem)]">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-leaf-700 px-[clamp(1.5rem,5vw,4rem)] py-[clamp(3rem,7vw,5rem)] text-paper">
        <BananaLeaf className="pointer-events-none absolute -right-10 -top-16 h-[22rem] w-auto rotate-[35deg] text-leaf-500/40" stroke="var(--leaf-700)" />
        <p lang="ta" className="font-tamil relative text-lg font-bold text-leaf-100">
          {ta}
        </p>
        <h2 className="relative mt-3 max-w-[16ch] font-display text-[clamp(2.2rem,1.2rem+3.5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tightest">{title}</h2>
        <div className="relative mt-8">
          <PillButton href="/#join" variant="accent">
            Send us your village recipe <span aria-hidden="true">→</span>
          </PillButton>
        </div>
      </div>
    </section>
  );
}
