"use client";

import * as THREE from "three";

// Small procedural textures (canvas → CanvasTexture). Callers own them and dispose on unmount.

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** paper (top) → leaf-100 (bottom) */
export const skyTexture = () =>
  canvasTexture(4, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#FBFDF7");
    g.addColorStop(0.55, "#EEF5E4");
    g.addColorStop(1, "#E3F0D3");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 512);
  });

/** banana pseudostem: layered sheaths as soft vertical stripes */
export const sheathTexture = () => {
  const t = canvasTexture(256, 64, (ctx) => {
    const base = ctx.createLinearGradient(0, 0, 256, 0);
    base.addColorStop(0, "#5E9B45");
    base.addColorStop(0.5, "#7DB45A");
    base.addColorStop(1, "#4E8A3A");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 64);
    for (let x = 0; x < 256; x += 3 + Math.random() * 5) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "227,240,211" : "34,97,44"},${0.12 + Math.random() * 0.2})`;
      ctx.fillRect(x, 0, 1 + Math.random() * 2, 64);
    }
    // a couple of browned sheath edges
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "rgba(168,93,56,0.35)";
      ctx.fillRect(Math.random() * 256, 0, 2, 64);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** rounded-rect alpha for the glass frame (white inside) */
export const frameAlpha = () =>
  canvasTexture(
    192,
    256,
    (ctx) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 192, 256);
      ctx.fillStyle = "#fff";
      roundRect(ctx, 2, 2, 188, 252, 22);
      ctx.fill();
    },
    false,
  );

/** thin bright rim along the frame edge, used as emissiveMap */
export const frameRim = () =>
  canvasTexture(
    192,
    256,
    (ctx) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 192, 256);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      roundRect(ctx, 4, 4, 184, 248, 20);
      ctx.stroke();
    },
    false,
  );

/** face for channel cards: leaf or turmeric gradient with a faint leaf-vein pattern (3:4) */
export const statFace = (tone: "leaf" | "turmeric") =>
  canvasTexture(384, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 384, 512);
    if (tone === "leaf") {
      g.addColorStop(0, "#4E9A3A");
      g.addColorStop(1, "#173F20");
    } else {
      g.addColorStop(0, "#F2B04A");
      g.addColorStop(1, "#C9701A");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 384, 512);
    ctx.strokeStyle = "rgba(255,255,255,0.09)";
    ctx.lineWidth = 2;
    for (let i = -6; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(192, i * 40);
      ctx.quadraticCurveTo(260, i * 40 + 30, 420, i * 40 + 90);
      ctx.moveTo(192, i * 40);
      ctx.quadraticCurveTo(124, i * 40 + 30, -36, i * 40 + 90);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(192, 0);
    ctx.lineTo(192, 512);
    ctx.stroke();
  });

/** soft radial glow (additive ground light under the fire) */
export const glowTexture = () =>
  canvasTexture(256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(234,151,31,0.9)");
    g.addColorStop(0.35, "rgba(234,151,31,0.35)");
    g.addColorStop(1, "rgba(234,151,31,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });

/**
 * Plane bent around the helix axis so a card hugs the cylinder.
 * The centre stays at z = 0; edges curve back toward the axis (which sits at z = -radius).
 */
export function bentPlane(w: number, h: number, radius: number, segments = 24) {
  const g = new THREE.PlaneGeometry(w, h, segments, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const a = x / radius;
    p.setX(i, Math.sin(a) * radius);
    p.setZ(i, Math.cos(a) * radius - radius);
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

/** Deterministic PRNG (mulberry32): stable scatter across renders, pure for React. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
