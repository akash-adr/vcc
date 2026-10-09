"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { seeded } from "./textures";

// Pollen & spice dust: thin rings of glowing points orbiting the trunk, plus a few falling leaves.

const pointsVertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vFog;
  uniform float uPixelRatio;
  uniform float uMaxSize;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // size attenuation: rings nearer the camera read bigger and softer
    gl_PointSize = min(aSize * uPixelRatio * (110.0 / -mv.z), uMaxSize * uPixelRatio);
    vFog = smoothstep(6.0, 22.0, -mv.z);
  }
`;
const pointsFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vFog;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * a * 0.75, a * (1.0 - vFog * 0.8));
  }
`;

const PALETTE = ["#EA971F", "#A9D18E", "#FFFFFF", "#F2B04A"].map((c) => new THREE.Color(c));

type RingSpec = { y: number; r: number; speed: number };

export function ParticleRings({ top, bottom, lowEnd }: { top: number; bottom: number; lowEnd: boolean }) {
  const groups = useRef<(THREE.Object3D | null)[]>([]);
  const rings = useMemo<RingSpec[]>(() => {
    const n = 6;
    return Array.from({ length: n }, (_, i) => ({
      y: top - ((top - bottom) * (i + 0.5)) / n,
      r: 3.75 + (i % 3) * 0.45,
      speed: (0.04 + i * 0.012) * (i % 2 ? -1 : 1),
    }));
  }, [top, bottom]);

  const { geos, mat } = useMemo(() => {
    const count = lowEnd ? 750 : 1500;
    const rnd = seeded(7);
    const geos = rings.map((ring) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const size = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const a = rnd() * Math.PI * 2;
        const r = ring.r + (rnd() - 0.5) * 0.3;
        pos.set([Math.cos(a) * r, (rnd() - 0.5) * 0.35 + (rnd() < 0.06 ? (rnd() - 0.5) * 1.4 : 0), Math.sin(a) * r], i * 3);
        // HDR-ish colours so the bloom (high threshold) only catches the particles and rims
        const c = PALETTE[Math.floor(rnd() * PALETTE.length)];
        const boost = 1.4 + rnd() * 0.9;
        col.set([c.r * boost, c.g * boost, c.b * boost], i * 3);
        size[i] = 0.5 + rnd() * 1.1;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
      g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      return g;
    });
    const mat = new THREE.ShaderMaterial({
      vertexShader: pointsVertex,
      fragmentShader: pointsFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPixelRatio: { value: lowEnd ? 1 : Math.min(window.devicePixelRatio, 1.75) }, uMaxSize: { value: lowEnd ? 6 : 14 } },
    });
    return { geos, mat };
  }, [rings, lowEnd]);

  useEffect(
    () => () => {
      geos.forEach((g) => g.dispose());
      mat.dispose();
    },
    [geos, mat],
  );

  useFrame((_, dt) => {
    groups.current.forEach((p, i) => {
      if (p) p.rotation.y += rings[i].speed * dt;
    });
  });

  return (
    <>
      {rings.map((ring, i) => (
        <points
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
          geometry={geos[i]}
          material={mat}
          position-y={ring.y}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

export function FallingLeaves({ top, bottom, count = 14 }: { top: number; bottom: number; count?: number }) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { geo, mat, items } = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.06, 0.05, 0.07, 0.2, 0, 0.3);
    s.bezierCurveTo(-0.07, 0.2, -0.06, 0.05, 0, 0);
    const geo = new THREE.ShapeGeometry(s, 3);
    const mat = new THREE.MeshStandardMaterial({ color: "#7DB45A", side: THREE.DoubleSide, roughness: 0.6 });
    const rnd = seeded(31);
    const items = Array.from({ length: count }, () => ({
      x: (rnd() - 0.5) * 9,
      z: (rnd() - 0.5) * 6,
      y: bottom + rnd() * (top - bottom),
      speed: 0.25 + rnd() * 0.25,
      spin: (rnd() - 0.5) * 1.5,
      phase: rnd() * 10,
    }));
    return { geo, mat, items };
  }, [top, bottom, count]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    items.forEach((it, i) => {
      const m = meshes.current[i];
      if (!m) return;
      it.y -= it.speed * dt;
      if (it.y < bottom) it.y = top + 1;
      m.position.set(it.x + Math.sin(t * 0.7 + it.phase) * 0.4, it.y, it.z + Math.cos(t * 0.5 + it.phase) * 0.3);
      m.rotation.set(Math.sin(t + it.phase) * 0.8, t * it.spin, Math.cos(t * 0.8 + it.phase) * 0.6);
    });
  });

  return (
    <>
      {items.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geo}
          material={mat}
        />
      ))}
    </>
  );
}
