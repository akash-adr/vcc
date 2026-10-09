// Mutable state shared between the HTML overlay (ScrollTrigger, UI) and the R3F scene.
// Written by GSAP / handlers, read every frame in useFrame: no React re-renders in the hot path.

export type HelixRig = {
  /** target card position along the helix, 0 … N-1 (fractional while scrolling) */
  t: number;
  /** 0 → 1 over the last stretch of scroll: the camera passes the last card and lands at the base */
  outro: number;
  /** 0 → 1 swoop from the crown down to the first card */
  intro: number;
  /** 0 → 1 dolly in on the active card (detail panel open) */
  zoom: number;
  /** normalised pointer, -1 … 1 */
  pointer: { x: number; y: number };
  /** index of the hovered card, or -1 */
  hovered: number;
};

export const createRig = (): HelixRig => ({ t: 0, outro: 0, intro: 0, zoom: 0, pointer: { x: 0, y: 0 }, hovered: -1 });

export type HelixQuality = {
  lowEnd: boolean;
  radius: number;
  cameraZ: number;
  cardW: number;
  cardH: number;
};
