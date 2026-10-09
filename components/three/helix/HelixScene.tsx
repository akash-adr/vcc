"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { HELIX, helixCards } from "@/data/helixCards";
import { Card } from "./Card";
import { TreeColumn } from "./TreeColumn";
import { FallingLeaves, ParticleRings } from "./Atmosphere";
import { Base } from "./Base";
import { bentPlane, frameAlpha, frameRim, skyTexture, statFace } from "./textures";
import type { HelixQuality, HelixRig } from "./rig";

const N = helixCards.length;
const STEP = THREE.MathUtils.degToRad(HELIX.stepDeg);
const TOP = 1.6; // crown base, just above the first card
export const HELIX_BASE_Y = -(N - 1) * HELIX.stepY - 2.6;

type SceneProps = { rig: RefObject<HelixRig>; quality: HelixQuality; onSelect: (i: number) => void };

function Rig({ rig, quality, helix }: { rig: RefObject<HelixRig>; quality: HelixQuality; helix: RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const ts = useRef(0);
  const out = useRef(0);
  const look = useMemo(() => new THREE.Vector3(0, TOP + 2, 0), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const r = rig.current!;
    ts.current = THREE.MathUtils.damp(ts.current, r.t, 4, dt);
    out.current = THREE.MathUtils.damp(out.current, r.outro, 4, dt);
    const t = ts.current;
    const o = out.current;

    // the active card swings round to face the camera
    if (helix.current) helix.current.rotation.y = -t * STEP;

    // descend with the spiral, slightly off-centre so the next card peeks out on the right
    const cardY = -t * HELIX.stepY + 0.4;
    // dolly-in (detail panel open): ~2.7 units in front of the card, view shifted so it sits left of the panel
    const shift = quality.lowEnd && quality.radius < HELIX.radius ? 0 : 0.75 * r.zoom;
    // off-centre so the next card peeks out on the right (less so on narrow screens)
    const offX = quality.radius < HELIX.radius ? 0.45 : 1.2;
    let x = THREE.MathUtils.lerp(offX, 1.15, r.zoom);
    let y = cardY;
    let z = THREE.MathUtils.lerp(quality.cameraZ, quality.radius + 2.7, r.zoom);
    let ly = cardY - 0.2;

    // outro: past the last card, down to the base
    const baseCamY = HELIX_BASE_Y + 1.6;
    x = THREE.MathUtils.lerp(x, 0.3, o);
    y = THREE.MathUtils.lerp(y, baseCamY, o);
    z = THREE.MathUtils.lerp(z, quality.cameraZ - 1, o);
    ly = THREE.MathUtils.lerp(ly, HELIX_BASE_Y + 0.35, o);

    // intro: start high by the crown and swoop down
    const i = r.intro;
    x = THREE.MathUtils.lerp(0.4, x, i);
    y = THREE.MathUtils.lerp(TOP + 4.8, y, i);
    z = THREE.MathUtils.lerp(quality.cameraZ + 3.5, z, i);
    ly = THREE.MathUtils.lerp(TOP + 2.2, ly, i);

    // gentle pointer parallax (desktop)
    if (!quality.lowEnd) {
      x += r.pointer.x * 0.25;
      y += r.pointer.y * 0.25;
    }

    pos.set(x, y, z);
    camera.position.lerp(pos, 1 - Math.exp(-7 * dt));
    lookTarget.set(shift, ly, 0);
    look.lerp(lookTarget, 1 - Math.exp(-7 * dt));
    camera.lookAt(look);
  });
  return null;
}

function Helix({ rig, quality, onSelect }: SceneProps) {
  const helix = useRef<THREE.Group>(null);
  const photos = useTexture(helixCards.filter((c) => c.kind === "member").map((c) => (c.kind === "member" ? c.member.image : "")));

  const shared = useMemo(() => {
    photos.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });
    const alpha = frameAlpha();
    const rim = frameRim();
    const pad = 0.14;
    const frameGeo = bentPlane(quality.cardW + pad, quality.cardH + pad, quality.radius - 0.035);
    const faceGeo = bentPlane(quality.cardW, quality.cardH, quality.radius);
    // Frosted glass without transmission: transmission re-renders the whole scene into an extra target
    // every frame and halved the frame rate under the composer (measured ~34 → 60 fps without it).
    const frameMat = quality.lowEnd
      ? new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.35, alphaMap: alpha, emissive: "#ffffff", emissiveMap: rim, emissiveIntensity: 0.55 })
      : new THREE.MeshPhysicalMaterial({
          color: "#F1F6EA",
          roughness: 0.15,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
          sheen: 0.4,
          sheenColor: new THREE.Color("#E3F0D3"),
          transparent: true,
          opacity: 0.55,
          alphaMap: alpha,
          depthWrite: false,
          emissive: "#ffffff",
          emissiveMap: rim,
          emissiveIntensity: 0.55,
        });
    const faces = { leaf: statFace("leaf"), turmeric: statFace("turmeric") };
    return { alpha, rim, frameGeo, faceGeo, frameMat, faces };
  }, [photos, quality]);

  useEffect(
    () => () => {
      shared.alpha.dispose();
      shared.rim.dispose();
      shared.frameGeo.dispose();
      shared.faceGeo.dispose();
      shared.frameMat.dispose();
      shared.faces.leaf.dispose();
      shared.faces.turmeric.dispose();
    },
    [shared],
  );

  let photoIndex = 0;
  return (
    <>
      <Rig rig={rig} quality={quality} helix={helix} />
      <group ref={helix}>
        {helixCards.map((card, i) => {
          const a = i * STEP;
          const tex = card.kind === "member" ? photos[photoIndex++] : shared.faces[card.tone];
          return (
            <group key={card.id} position={[Math.sin(a) * quality.radius, -i * HELIX.stepY, Math.cos(a) * quality.radius]} rotation-y={a}>
              <Card
                card={card}
                index={i}
                texture={tex}
                frameGeo={shared.frameGeo}
                faceGeo={shared.faceGeo}
                frameMat={shared.frameMat}
                quality={quality}
                rig={rig}
                onSelect={onSelect}
              />
            </group>
          );
        })}
      </group>
    </>
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#FFFFFF", "#A9D18E", 0.9]} />
      <directionalLight color="#FFE2B0" position={[6, 9, 5]} intensity={2.1} />
      <directionalLight color="#E3F0D3" position={[-5, 2, -4]} intensity={0.5} />
    </>
  );
}

function Background() {
  const sky = useMemo(() => skyTexture(), []);
  useEffect(() => () => sky.dispose(), [sky]);
  return (
    <>
      <primitive attach="background" object={sky} />
      <fog attach="fog" args={["#E8F2DC", 6, 22]} />
    </>
  );
}

export default function HelixScene({ rig, quality, onSelect, active, still }: SceneProps & { active: boolean; still?: boolean }) {
  const post = !quality.lowEnd && !still;
  // adaptive resolution: step the pixel ratio down if the GPU can't hold the frame rate, back up when it can
  const [dprMax, setDprMax] = useState(quality.lowEnd ? 1 : 1.75);
  return (
    <Canvas
      frameloop={still ? "demand" : active ? "always" : "never"}
      dpr={[1, dprMax]}
      gl={{ antialias: !post, powerPreference: "high-performance" }}
      camera={{ fov: 50, position: [0.4, TOP + 4.8, quality.cameraZ + 3.5], near: 0.1, far: 60 }}
      aria-hidden="true"
    >
      {!quality.lowEnd && !still && (
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDprMax((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDprMax((d) => Math.min(1.75, d + 0.25))}
          onFallback={() => setDprMax(1)}
        />
      )}
      <Background />
      <Lights />
      {/* separate boundaries: the tree (GLB) and the cards (photos + fonts) each appear as soon as they're ready */}
      <Suspense fallback={null}>
        <TreeColumn top={TOP} bottom={HELIX_BASE_Y} rig={rig} stepRad={STEP} lowEnd={quality.lowEnd} />
      </Suspense>
      <Suspense fallback={null}>
        <Helix rig={rig} quality={quality} onSelect={onSelect} />
      </Suspense>
      <Base y={HELIX_BASE_Y} />
      <ParticleRings top={TOP + 1} bottom={HELIX_BASE_Y + 1} lowEnd={quality.lowEnd} />
      <FallingLeaves top={TOP + 3} bottom={HELIX_BASE_Y} count={quality.lowEnd ? 7 : 14} />
      {post && (
        <EffectComposer multisampling={4}>
          {/* threshold 1.0 in linear HDR: only the boosted rims, fire and particles bloom, never the paper sky */}
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={0.7} />
          <Vignette offset={0.3} darkness={0.38} />
          <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
          {/* three skips tone mapping when rendering into the composer's targets, so apply it here */}
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
