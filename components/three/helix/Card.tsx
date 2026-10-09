"use client";

import { Text } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { HelixCard } from "@/data/helixCards";
import type { HelixQuality, HelixRig } from "./rig";

const FONT_DISPLAY = "/fonts/BricolageGrotesque-ExtraBold.ttf";
const FONT_LABEL = "/fonts/Manrope-Bold.ttf";
const FONT_TAMIL = "/fonts/Catamaran-ExtraBold.ttf";
const TURMERIC = new THREE.Color("#EA971F");
const WHITE = new THREE.Color("#FFFFFF");
const MAX_TILT = THREE.MathUtils.degToRad(8);

// Photo / face shader: rounded corners, desaturation for inactive cards, a legibility gradient
// at the bottom, and a shimmer band that sweeps across the active card. Fog-aware.
const vertex = /* glsl */ `
  #include <fog_pars_vertex>
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const fragment = /* glsl */ `
  #include <fog_pars_fragment>
  uniform sampler2D map;
  uniform float uSat, uDim, uShimmer, uTime, uFade, uAspect, uRadius;
  varying vec2 vUv;
  float roundedBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main() {
    vec4 tex = texture2D(map, vUv);
    vec3 col = tex.rgb;
    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(luma), col, uSat) * uDim;
    // legibility gradient toward deep leaf green at the bottom third
    float g = smoothstep(0.62, 0.12, vUv.y);
    col = mix(col, vec3(0.03, 0.09, 0.05), g * 0.92);
    // shimmer: a soft diagonal band sweeping across
    float band = fract(uTime * 0.18) * 2.6 - 0.8;
    float d = abs((vUv.x + (1.0 - vUv.y) * 0.6) - band);
    col += vec3(1.0, 0.97, 0.9) * smoothstep(0.12, 0.0, d) * 0.22 * uShimmer;
    // rounded-rect alpha in aspect-correct space
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float sd = roundedBox(p, vec2(uAspect * 0.5, 0.5), uRadius);
    float alpha = smoothstep(0.004, -0.004, sd) * uFade;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

type Props = {
  card: HelixCard;
  index: number;
  texture: THREE.Texture;
  frameGeo: THREE.BufferGeometry;
  faceGeo: THREE.BufferGeometry;
  frameMat: THREE.Material & { emissive?: THREE.Color; emissiveIntensity?: number };
  quality: HelixQuality;
  rig: RefObject<HelixRig>;
  onSelect: (i: number) => void;
};

export function Card({ card, index, texture, frameGeo, faceGeo, frameMat, quality, rig, onSelect }: Props) {
  const tilt = useRef<THREE.Group>(null);
  const appear = useRef<THREE.Group>(null);
  const texts = useRef<(THREE.Object3D & { fillOpacity?: number; outlineOpacity?: number })[]>([]);
  const hoverUv = useRef<THREE.Vector2 | null>(null);
  // each card owns its frame material clone so rim colour/intensity can differ
  const frame = useMemo(() => frameMat.clone() as typeof frameMat, [frameMat]);
  const face = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        { map: { value: null }, uSat: { value: 0.5 }, uDim: { value: 0.75 }, uShimmer: { value: 0 }, uTime: { value: 0 }, uFade: { value: 0 }, uAspect: { value: 0.75 }, uRadius: { value: 0.06 } },
      ]),
    });
    // assigned after merge(): merge() would clone the texture and upload it again per card
    mat.uniforms.map.value = texture;
    return mat;
  }, [texture]);
  useEffect(
    () => () => {
      face.dispose();
      frame.dispose();
    },
    [face, frame],
  );

  useFrame((state, dt) => {
    const r = rig.current!;
    const activeIndex = Math.round(r.t);
    const isActive = activeIndex === index && r.outro < 0.5;
    const k = 1 - Math.exp(-5 * dt);
    const u = face.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uSat.value += ((isActive ? 1 : 0.45) - u.uSat.value) * k;
    u.uDim.value += ((isActive ? 1 : 0.72) - u.uDim.value) * k;
    u.uShimmer.value += ((isActive ? 1 : 0) - u.uShimmer.value) * k;

    // intro: cards appear one by one down the spiral
    // …and all of them step aside during the outro so the base and headline stand alone
    const fade =
      THREE.MathUtils.smoothstep(r.intro, index * 0.06, index * 0.06 + 0.35) * (1 - THREE.MathUtils.smoothstep(r.outro, 0.15, 0.6));
    u.uFade.value = fade;
    if (appear.current) {
      appear.current.visible = fade > 0.01;
      appear.current.scale.setScalar(0.85 + 0.15 * fade);
    }
    texts.current.forEach((t) => {
      if (t) t.fillOpacity = fade;
      if (t && t.outlineOpacity !== undefined) t.outlineOpacity = 0.55 * fade;
    });

    // rim: turmeric and bright (blooms) on the active card, soft white elsewhere
    if (frame.emissive) {
      frame.emissive.lerp(isActive ? TURMERIC : WHITE, k);
      frame.emissiveIntensity = THREE.MathUtils.lerp(frame.emissiveIntensity ?? 0.5, isActive ? 2.6 : 0.3, k);
    }

    // hover tilt toward the cursor (max 8°)
    if (tilt.current) {
      const hv = r.hovered === index ? hoverUv.current : null;
      const tx = hv ? -(hv.y - 0.5) * 2 * MAX_TILT : 0;
      const ty = hv ? (hv.x - 0.5) * 2 * MAX_TILT : 0;
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, tx, 6, dt);
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, ty, 6, dt);
    }
  });

  const { cardW: w, cardH: h } = quality;
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    rig.current!.hovered = index;
    hoverUv.current = e.uv ?? null;
  };
  const onOut = () => {
    if (rig.current!.hovered === index) rig.current!.hovered = -1;
  };
  const bind = (i: number) => (el: THREE.Object3D | null) => {
    texts.current[i] = el as (typeof texts.current)[number];
  };

  return (
    <group ref={appear}>
      <group ref={tilt}>
        <mesh geometry={frameGeo} material={frame} position-z={-0.035} />
        <mesh
          geometry={faceGeo}
          material={face}
          onPointerMove={onMove}
          onPointerOut={onOut}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(index);
          }}
        />
        {card.kind === "member" ? (
          <>
            <Text
              ref={bind(0)}
              font={FONT_LABEL}
              fontSize={w * 0.052}
              letterSpacing={0.16}
              color="#F2B04A"
              outlineWidth={w * 0.002}
              outlineBlur={w * 0.012}
              outlineColor="#0F2E17"
              outlineOpacity={0.55}
              anchorX="center"
              anchorY="middle"
              position={[0, -h * 0.25, 0.02]}
            >
              {card.member.role.toUpperCase()}
            </Text>
            <Text
              ref={bind(1)}
              font={FONT_DISPLAY}
              fontSize={w * 0.12}
              letterSpacing={-0.02}
              maxWidth={w * 0.9}
              textAlign="center"
              color="#FFFFFF"
              outlineWidth={w * 0.004}
              outlineBlur={w * 0.02}
              outlineColor="#0F2E17"
              outlineOpacity={0.55}
              anchorX="center"
              anchorY="middle"
              position={[0, -h * 0.36, 0.02]}
            >
              {card.member.name.toUpperCase()}
            </Text>
          </>
        ) : (
          <>
            <Text
              ref={bind(0)}
              font={card.numeralFont === "tamil" ? FONT_TAMIL : FONT_DISPLAY}
              fontSize={card.numeralFont === "tamil" ? w * 0.26 : w * 0.34}
              letterSpacing={-0.04}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              position={[0, h * 0.08, 0.02]}
            >
              {card.numeral}
            </Text>
            <Text
              ref={bind(1)}
              font={FONT_LABEL}
              fontSize={w * 0.058}
              letterSpacing={0.14}
              maxWidth={w * 0.8}
              textAlign="center"
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              position={[0, -h * 0.33, 0.02]}
            >
              {card.label}
            </Text>
          </>
        )}
      </group>
    </group>
  );
}
