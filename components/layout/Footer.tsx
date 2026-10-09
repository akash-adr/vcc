import { TornEdge } from "@/components/ui/TornEdge";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { TransitionLink } from "./PageTransition";
import { BackToTop } from "./BackToTop";
import { credits, footer, site } from "@/data/site";

const linkCls = "text-paper/80 transition-colors hover:text-turmeric";

export function Footer() {
  const { columns } = footer;
  return (
    <footer className="relative bg-leaf-900 text-paper">
      <TornEdge position="top" color="var(--leaf-900)" seed={23} />
      <div className="container-x pb-10 pt-[clamp(4rem,8vw,6rem)]">
        {/* closing line */}
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-paper/10 pb-[clamp(3rem,6vw,4.5rem)]">
          <p className="font-display text-[clamp(3.5rem,1rem+11vw,12rem)] font-extrabold leading-[0.82] tracking-tightest">
            {footer.closing.lead}{" "}
            <span className="font-serif font-normal italic tracking-normal text-turmeric">{footer.closing.accent}</span>
          </p>
          <p className="flex items-center gap-3 pb-3 text-sm font-semibold text-paper/75">
            <span className="relative flex h-3 w-3" aria-hidden="true">
              <span className="absolute inset-0 animate-[ember_2.8s_ease-in-out_infinite] rounded-full bg-ember blur-[6px]" />
              <span className="relative h-3 w-3 rounded-full bg-ember" />
            </span>
            {footer.fireNote}
          </p>
        </div>

        {/* columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3">
              <BananaLeaf className="h-10 w-5 rotate-[24deg] text-leaf-500" stroke="var(--leaf-900)" />
              <p className="font-display text-3xl font-extrabold tracking-tightest">{site.short}</p>
            </div>
            <p lang="ta" className="font-tamil mt-4 text-xl font-bold text-leaf-300">
              எல்லோரும் வாங்க
            </p>
          </div>
          <nav aria-labelledby="ft-explore">
            <h2 id="ft-explore" className="eyebrow text-leaf-300">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5 font-semibold">
              {columns.explore.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href} className={linkCls}>
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="ft-watch">
            <h2 id="ft-watch" className="eyebrow text-leaf-300">
              Watch
            </h2>
            <ul className="mt-4 space-y-2.5 font-semibold">
              {columns.watch.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {l.label} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="eyebrow text-leaf-300">Credits</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-paper/75">
              <li>
                3D model:{" "}
                <a href={credits.bananaTree.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-turmeric">
                  {credits.bananaTree.title}
                </a>{" "}
                by {credits.bananaTree.author}, {credits.bananaTree.license}
              </li>
              <li>{footer.visualsNote}</li>
            </ul>
          </div>
        </div>

        {/* disclaimer: required and clearly visible */}
        <div className="flex flex-col gap-6 rounded-[22px] border border-paper/15 bg-paper/[0.04] p-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-1.5">
            <p className="text-sm font-semibold leading-relaxed text-paper">{site.disclaimer}</p>
            <p className="text-sm text-paper/70">{site.builtBy}</p>
          </div>
          <BackToTop label={footer.backToTop} />
        </div>
      </div>
    </footer>
  );
}
