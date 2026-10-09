"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { BANANA_TREE_URL } from "@/lib/constants";
import { seeded, sheathTexture } from "./textures";
import type { HelixRig } from "./rig";

const CROWN_HEIGHT = 4.4;

type Props = { top: number; bottom: number; rig: RefObject<HelixRig>; stepRad: number; lowEnd: boolean };

/** The GLB crown sits at the top of the helix; a twisted, sheathed pseudostem carries it down to the base. */
export function TreeColumn({ top, bottom, rig, stepRad, lowEnd }: Props) {
  const { scene } = useGLTF(BANANA_TREE_URL, false, true); // meshopt, no Draco
  const spin = useRef<THREE.Group>(null);
  const crownSway = useRef<THREE.Group>(null);

  const crown = useMemo(() => {
    const m = scene.clone(true);
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const s = CROWN_HEIGHT / size.y;
    m.scale.setScalar(s);
    m.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) (mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    });
    return m;
  }, [scene]);

  // trunk: stacked, slightly twisted sheath segments
  const trunk = useMemo(() => {
    const tex = sheathTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0 });
    const len = top - bottom;
    const n = Math.ceil(len / 1.5);
    const segH = len / n;
    const geos: THREE.CylinderGeometry[] = [];
    const segments = Array.from({ length: n }, (_, i) => {
      const r0 = 0.36 + 0.05 * Math.sin(i * 1.7) + (i / n) * 0.1;
      const r1 = 0.38 + 0.05 * Math.sin(i * 1.7 + 1) + ((i + 1) / n) * 0.1;
      const g = new THREE.CylinderGeometry(r0, r1, segH * 1.06, 24, 1, true);
      geos.push(g);
      return { g, y: top - segH * (i + 0.5), rot: i * 0.42 };
    });
    return { mat, tex, geos, segments };
  }, [top, bottom]);

  // blossom clusters wrapping the trunk (banana leaves, curry leaves, marigold / jasmine)
  const clusters = useMemo(() => {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.09, 0.08, 0.1, 0.32, 0, 0.48);
    leafShape.bezierCurveTo(-0.1, 0.32, -0.09, 0.08, 0, 0);
    const curryShape = new THREE.Shape();
    curryShape.moveTo(0, 0);
    curryShape.bezierCurveTo(0.045, 0.03, 0.05, 0.11, 0, 0.16);
    curryShape.bezierCurveTo(-0.05, 0.11, -0.045, 0.03, 0, 0);
    const geos = {
      leaf: new THREE.ShapeGeometry(leafShape, 4),
      curry: new THREE.ShapeGeometry(curryShape, 3),
      flower: new THREE.CircleGeometry(0.055, 5),
    };
    const mats = {
      leaf: new THREE.MeshStandardMaterial({ color: "#5DAA45", side: THREE.DoubleSide, roughness: 0.6 }),
      curry: new THREE.MeshStandardMaterial({ color: "#2F7A34", side: THREE.DoubleSide, roughness: 0.5 }),
      flower: new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7, emissive: "#3a2600", emissiveIntensity: 0.25 }),
    };
    const rnd = seeded(13);
    const scale = lowEnd ? 0.5 : 1;
    const counts = { leaf: Math.round(200 * scale), curry: Math.round(260 * scale), flower: Math.round(260 * scale) };
    const clumpYs: number[] = [];
    for (let y = top - 0.6; y > bottom + 1; y -= 1.25 + rnd() * 0.6) clumpYs.push(y);
    const place = (kind: keyof typeof counts) =>
      Array.from({ length: counts[kind] }, () => {
        const cy = clumpYs[Math.floor(rnd() * clumpYs.length)];
        const ca = rnd() * Math.PI * 2;
        const a = ca + (rnd() - 0.5) * 1.4;
        const r = 0.42 + rnd() * (kind === "leaf" ? 0.55 : 0.4);
        const pos = new THREE.Vector3(Math.cos(a) * r, cy + (rnd() - 0.5) * 0.7, Math.sin(a) * r);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - 0.5) * 1.6, -a + Math.PI / 2, (rnd() - 0.5) * 1.2));
        return { pos, q, s: 0.7 + rnd() * 0.7, phase: rnd() * 10 };
      });
    return { geos, mats, items: { leaf: place("leaf"), curry: place("curry"), flower: place("flower") }, counts };
  }, [top, bottom, lowEnd]);

  const refs = { leaf: useRef<THREE.InstancedMesh>(null), curry: useRef<THREE.InstancedMesh>(null), flower: useRef<THREE.InstancedMesh>(null) };

  // flower colours: marigold or jasmine
  useEffect(() => {
    const fm = refs.flower.current;
    if (!fm) return;
    const rnd = seeded(5);
    const marigold = new THREE.Color("#F2A51E");
    const jasmine = new THREE.Color("#FFFDF2");
    clusters.items.flower.forEach((_, i) => fm.setColorAt(i, rnd() > 0.45 ? marigold : jasmine));
    if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
  }, [clusters, refs.flower]);

  useEffect(
    () => () => {
      trunk.tex.dispose();
      trunk.mat.dispose();
      trunk.geos.forEach((g) => g.dispose());
      Object.values(clusters.geos).forEach((g) => g.dispose());
      Object.values(clusters.mats).forEach((m) => m.dispose());
    },
    [trunk, clusters],
  );

  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const sway = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const q2 = useMemo(() => new THREE.Quaternion(), []);
  const sv = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const r = rig.current!;
    // parallax: the tree turns at 0.3× the helix
    if (spin.current) spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, -r.t * stepRad * 0.3, 4, dt);
    if (crownSway.current) {
      crownSway.current.rotation.z = Math.sin(t * 0.8) * 0.02;
      crownSway.current.rotation.x = Math.sin(t * 0.6 + 1) * 0.015;
    }
    // wind through the clusters
    (Object.keys(refs) as (keyof typeof refs)[]).forEach((k) => {
      const mesh = refs[k].current;
      if (!mesh) return;
      clusters.items[k].forEach((it, i) => {
        e.set(Math.sin(t * 1.4 + it.phase) * 0.18, 0, Math.sin(t * 1.1 + it.phase * 1.3) * 0.12);
        sway.setFromEuler(e);
        q2.copy(it.q).multiply(sway);
        m4.compose(it.pos, q2, sv.setScalar(it.s));
        mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={spin}>
      <group ref={crownSway} position-y={top - 0.25}>
        <primitive object={crown} />
      </group>
      {trunk.segments.map((s, i) => (
        <mesh key={i} geometry={s.g} material={trunk.mat} position-y={s.y} rotation-y={s.rot} />
      ))}
      <instancedMesh ref={refs.leaf} args={[clusters.geos.leaf, clusters.mats.leaf, clusters.counts.leaf]} frustumCulled={false} />
      <instancedMesh ref={refs.curry} args={[clusters.geos.curry, clusters.mats.curry, clusters.counts.curry]} frustumCulled={false} />
      <instancedMesh ref={refs.flower} args={[clusters.geos.flower, clusters.mats.flower, clusters.counts.flower]} frustumCulled={false} />
    </group>
  );
}
