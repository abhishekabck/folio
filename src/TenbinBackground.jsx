import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* tenbinlabs.xyz-style living background: a vast grid of dots forming a plane
   that undulates like water, with raindrop ripples expanding across it, a
   slowly drifting camera, and a surface that reacts to scrolling (the waves
   scrub forward and fresh ripples spawn as you scroll). GPU wave + ripples in
   the vertex shader; full-page fixed canvas behind all content. */
const COLS = 230;
const ROWS = 160;
const WIDTH = 110;
const NEAR_Z = 12;
const FAR_Z = -95;
const NDROPS = 6;
const DROP_LIFE = 7.0;

const VERT = `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform float uCalm;              // 1 = full ambient waves, →low when parked at the end (pond settles)
  uniform vec4 uDrops[${NDROPS}];   // xy = (x,z) centre, z = birth time, w = strength
  uniform vec4 uBigDrop;            // big end-of-page droplet: xy = centre, z = birth, w = strength
  varying float vFade;
  varying float vH;
  void main(){
    vec3 pos = position;
    float t = uTime + uScroll * 9.0;             // scrolling scrubs the surface forward
    float y = (sin(pos.x * 0.16 + t * 0.5) * 0.85
            + sin(pos.z * 0.14 + t * 0.45) * 0.85
            + sin((pos.x * 0.55 + pos.z * 0.7) * 0.10 + t * 0.75) * 0.55) * uCalm;
    for (int i = 0; i < ${NDROPS}; i++){
      vec4 d = uDrops[i];
      float age = uTime - d.z;
      if (age > 0.0 && age < ${DROP_LIFE.toFixed(1)}){
        float dist = distance(pos.xz, d.xy);
        float ring = sin(dist * 1.1 - age * 3.2);
        float decay = exp(-age * 0.65) * exp(-dist * 0.085);
        y += ring * decay * d.w * 2.4;
      }
    }
    // one big central droplet — a broad single ripple when you reach the end of the page
    {
      float bage = uTime - uBigDrop.z;
      if (bage > 0.0 && bage < 14.0){
        float bdist = distance(pos.xz, uBigDrop.xy);
        float front = bage * 6.8;                                       // wave front expands outward from centre
        float env = exp(-pow((bdist - front) / 22.0, 2.0));            // wide band of dots ripple at the moving front
        float ring = sin(bdist * 0.66 - bage * 2.6);
        float life = exp(-bage * 0.10);
        y += ring * env * uBigDrop.w * life;                           // the expanding ripple itself
        y -= exp(-bage * 2.0) * exp(-bdist * 0.38) * uBigDrop.w * 0.7;  // the initial "plop" dip at the centre
      }
    }
    pos.y = y;
    vH = y;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = -mv.z;
    vFade = smoothstep(98.0, 6.0, dist);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixelRatio * (24.0 / dist);
  }
`;
const FRAG = `
  precision mediump float;
  varying float vFade;
  varying float vH;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    float h = clamp(vH * 0.32 + 0.5, 0.0, 1.0);
    vec3 col = mix(vec3(0.38, 0.38, 0.48), vec3(0.96, 0.97, 1.0), h);
    gl_FragColor = vec4(col, vFade);
  }
`;

const rnd = (a, b) => a + Math.random() * (b - a);

function Waves() {
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const drops = useMemo(
    () => Array.from({ length: NDROPS }, (_, i) => new THREE.Vector4(rnd(-WIDTH / 2, WIDTH / 2), rnd(FAR_Z, NEAR_Z), -2 + i * 1.1, rnd(0.8, 1.4))),
    []
  );
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2) },
      uDrops: { value: drops },
      uBigDrop: { value: new THREE.Vector4(0, -28, -100, 0) },
      uCalm: { value: 1 },
    }),
    [drops]
  );
  const scroll = useRef({ progress: 0, lastY: 0, spawn: false, cooldown: 0, atEnd: false });

  const geo = useMemo(() => {
    const pos = new Float32Array(COLS * ROWS * 3);
    let k = 0;
    for (let j = 0; j < ROWS; j++) {
      const z = NEAR_Z + (j / (ROWS - 1)) * (FAR_Z - NEAR_Z);
      for (let i = 0; i < COLS; i++) {
        pos[k++] = (i / (COLS - 1) - 0.5) * WIDTH;
        pos[k++] = 0;
        pos[k++] = z;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current.progress = max > 0 ? y / max : 0;
      scroll.current.atEnd = max > 0 && y >= max - 4; // within 4px of the very bottom
      if (Math.abs(y - scroll.current.lastY) > 6) scroll.current.spawn = true;
      scroll.current.lastY = y;
    };
    onScroll(); // initialise (handles a restored scroll position at load)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    if (reduce) return;
    const t = (uniforms.uTime.value += delta);
    uniforms.uScroll.value += (scroll.current.progress - uniforms.uScroll.value) * 0.08;

    // recycle finished raindrops; spawn a fresh one near the view on scroll
    scroll.current.cooldown -= delta;
    let oldest = drops[0];
    for (const d of drops) {
      if (t - d.z > DROP_LIFE) d.set(rnd(-WIDTH / 2, WIDTH / 2), rnd(FAR_Z, NEAR_Z), t, rnd(0.8, 1.4));
      if (d.z < oldest.z) oldest = d;
    }
    if (scroll.current.spawn && scroll.current.cooldown <= 0) {
      oldest.set(rnd(-32, 32), rnd(-42, -6), t, rnd(1.1, 1.7)); // ripple in the visible area
      scroll.current.cooldown = 0.28;
      scroll.current.spawn = false;
    }

    // at the very bottom of the page the surface settles to a calm pond and a big
    // droplet falls dead-centre, sending out a single broad ripple; it re-falls every
    // ~5.5s while you stay parked at the end, then the pond fills back in as you leave.
    const atEnd = scroll.current.atEnd;
    uniforms.uCalm.value += ((atEnd ? 0.22 : 1) - uniforms.uCalm.value) * 0.04;
    const big = uniforms.uBigDrop.value;
    if (atEnd && t - big.z > 4.0) big.set(0, -28, t, 7.0);

    // gentle camera drift so the 3D space itself feels alive
    state.camera.position.x = Math.sin(t * 0.08) * 2.2;
    state.camera.position.y = 7 + Math.sin(t * 0.05) * 0.7;
    state.camera.lookAt(0, 0.5, -28);
  });

  return (
    <points geometry={geo}>
      <shaderMaterial uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} transparent depthWrite={false} />
    </points>
  );
}

export default function TenbinBackground() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 7, 16], fov: 55 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop="always"
        onCreated={({ camera }) => camera.lookAt(0, 0.5, -28)}
      >
        <Waves />
      </Canvas>
    </div>
  );
}
