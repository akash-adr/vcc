// Film grain as a pre-rendered noise tile. Deliberately no SVG filter and no mix-blend-mode: a full-screen
// blended layer forces the browser to re-blend the whole page on every scroll frame.
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] bg-[url(/images/grain.png)] bg-[length:256px_256px] opacity-[0.06]"
    />
  );
}
