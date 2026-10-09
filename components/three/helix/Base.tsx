"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { glowTexture } from "./textures";

// The end of the descent: a round stone platform, a clay pot over a small fire, warm light pooling on the ground.
export function Base({ y }: { y: number }) {
  const light = useRef<THREE.PointLight>(null);
  const flames = useRef<(THREE.Mesh | null)[]>([]);

  const res = useMemo(() => {
    const potProfile = [
      [0.0, 0.0],
      [0.32, 0.02],
      [0.5, 0.18],
      [0.56, 0.4],
      [0.5, 0.62],
      [0.38, 0.74],
      [0.4, 0.8],
      [0.44, 0.84],
    ].map(([x, yy]) => new THREE.Vector2(x, yy));
    return {
      glow: glowTexture(),
      pot: new THREE.LatheGeometry(potProfile, 40),
      potMat: new THREE.MeshStandardMaterial({ color: "#A85D38", roughness: 0.85, side: THREE.DoubleSide }),
      stone: new THREE.MeshStandardMaterial({ color: "#D8D0BE", roughness: 0.95 }),
      stoneDark: new THREE.MeshStandardMaterial({ color: "#BDB39F", roughness: 0.95 }),
      flameMat: new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB347").multiplyScalar(2.2), toneMapped: false }),
      emberMat: new THREE.MeshBasicMaterial({ color: new THREE.Color("#D9532B").multiplyScalar(1.6), toneMapped: false }),
      flame: new THREE.ConeGeometry(0.09, 0.34, 8),
      log: new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8),
      logMat: new THREE.MeshStandardMaterial({ color: "#5A3A22", roughness: 1 }),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(res).forEach((r) => (r as { dispose?: () => void }).dispose?.());
    },
    [res],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (light.current) light.current.intensity = 6 + Math.sin(t * 7) * 0.8 + Math.sin(t * 13.3) * 0.5;
    flames.current.forEach((f, i) => {
      if (!f) return;
      const k = 1 + Math.sin(t * (8 + i * 2.3) + i) * 0.18;
      f.scale.set(1, k, 1);
    });
  });

  return (
    <group position-y={y}>
      {/* stepped stone platform */}
      <mesh material={res.stoneDark} position-y={-0.18}>
        <cylinderGeometry args={[2.7, 2.85, 0.3, 64]} />
      </mesh>
      <mesh material={res.stone} position-y={0.08}>
        <cylinderGeometry args={[2.2, 2.3, 0.26, 64]} />
      </mesh>
      {/* warm pool of light */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.22}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial map={res.glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* fire under the pot */}
      <group position={[0, 0.22, 1.1]}>
        <mesh geometry={res.log} material={res.logMat} rotation={[0, 0.6, Math.PI / 2]} position-y={0.05} />
        <mesh geometry={res.log} material={res.logMat} rotation={[0, -0.6, Math.PI / 2]} position-y={0.05} />
        {[-0.08, 0.06, 0.0].map((x, i) => (
          <mesh
            key={i}
            ref={(el) => {
              flames.current[i] = el;
            }}
            geometry={res.flame}
            material={i === 2 ? res.emberMat : res.flameMat}
            position={[x, 0.22, i === 2 ? 0.04 : 0]}
          />
        ))}
        <mesh geometry={res.pot} material={res.potMat} position-y={0.3} scale={0.7} />
        <pointLight ref={light} color="#EA971F" intensity={6} distance={7} decay={1.6} position-y={0.4} />
      </group>
    </group>
  );
}
