"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import { BANANA_TREE_URL, DRACO_PATH } from "@/lib/constants";
import { helixImages } from "@/data/helixCards";

const HELIX_FONTS = ["/fonts/BricolageGrotesque-ExtraBold.ttf", "/fonts/Manrope-Bold.ttf", "/fonts/Catamaran-ExtraBold.ttf"];

/** Warms the caches the helix gallery needs (GLB, card photos, 3D-text fonts) so it mounts instantly. */
export function preloadBananaTree() {
  useGLTF.preload(BANANA_TREE_URL, DRACO_PATH);
  useTexture.preload(helixImages);
  HELIX_FONTS.forEach((f) => fetch(f).catch(() => undefined));
}
