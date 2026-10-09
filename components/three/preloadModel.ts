"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import { preloadFont } from "troika-three-text";
import { BANANA_TREE_URL } from "@/lib/constants";
import { helixCards, helixImages } from "@/data/helixCards";

// Every glyph the 3D cards draw, so the text library can build its glyph atlases ahead of time.
const GLYPHS = Array.from(
  new Set(
    helixCards
      .flatMap((c) => (c.kind === "member" ? [c.member.name, c.member.role] : [c.numeral, c.label]))
      .join("")
      .toUpperCase() + "0123456789·+",
  ),
).join("");
const HELIX_FONTS = ["/fonts/BricolageGrotesque-ExtraBold.ttf", "/fonts/Manrope-Bold.ttf", "/fonts/Catamaran-ExtraBold.ttf"];

let warmed = false;

/** Warms everything the helix gallery needs (GLB, card photos, 3D-text glyphs) so it appears instantly. Idempotent. */
export function preloadBananaTree() {
  if (warmed) return;
  warmed = true;
  useGLTF.preload(BANANA_TREE_URL, false, true);
  useTexture.preload(helixImages);
  HELIX_FONTS.forEach((font) => preloadFont({ font, characters: GLYPHS }, () => undefined));
}
