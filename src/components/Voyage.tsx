"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/*
  A flight through space, driven by scroll.
  Every stop is a place along the camera's path. At each one, drifting dust gathers into a word made of stars.
  Keep scrolling and the word comes apart around you as you fly through it towards the next one.
  The last stop is a spiral galaxy.
*/

export type Stop = { word: string };

const FOV = 35;
const DEPTH = 10; // camera to word, at a stop
export const GAP = 42; // distance between stops

const wordVertex = /* glsl */ `
  uniform float uCamZ;
  uniform float uIntro;
  uniform float uTime;
  uniform float uPixel;
  uniform vec2 uMouse;
  uniform float uMouseOn;
  uniform vec3 uBurst;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  attribute float aSize;
  attribute float aStop;
  varying float vAlpha;

  void main() {
    // How far the camera is from this word's stop. Close to it, the star takes its place in the word.
    float d = abs(uCamZ - aStop);
    float t = 1.0 - smoothstep(1.5 + aSeed * 5.0, 14.0 + aSeed * 16.0, d);
    float s = aSeed * 0.45;
    t *= smoothstep(s, s + 0.55, uIntro);
    vec3 p = mix(aFrom, aTo, t);
    p.z += sin(t * 3.14159) * (aSeed - 0.5) * 3.0;
    p.x += sin(uTime * 0.6 + aSeed * 40.0) * 0.012;
    p.y += cos(uTime * 0.5 + aSeed * 30.0) * 0.012;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float z = max(0.2, -mv.z);
    // Cursor and click act on what you see, so work in the camera's view plane.
    vec2 v = mv.xy * (${DEPTH.toFixed(1)} / z);
    vec2 dm = v - uMouse;
    float push = (1.0 - smoothstep(0.0, 0.9, length(dm))) * uMouseOn * t;
    mv.xy += normalize(dm + 1e-4) * push * 0.35 * (z / ${DEPTH.toFixed(1)});
    mv.z -= push * 0.8;
    vec2 b = v - uBurst.xy;
    mv.xy += normalize(b + 1e-4) * uBurst.z * 2.4 / (length(b) + 0.6) * t;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (115.0 / z);
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.7 + aSeed * 60.0);
    float near = smoothstep(0.6, 3.5, -mv.z);
    float far = 1.0 - smoothstep(60.0, 110.0, -mv.z);
    vAlpha = twinkle * mix(0.38, 0.95, t) * near * far;
  }
`;

const starFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = 0.05 / d - 0.1;
    if (glow <= 0.0) discard;
    gl_FragColor = vec4(uColor, clamp(glow, 0.0, 1.0) * vAlpha);
  }
`;

const fieldVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixel;
  uniform float uSpin;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 p = position;
    if (uSpin > 0.0) {
      // Differential rotation: the core turns faster than the rim.
      float r = length(p.xz);
      float a = uTime * (uSpin / (r * 0.25 + 0.6));
      float c = cos(a), s = sin(a);
      p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float z = max(0.2, -mv.z);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (140.0 / z);
    float near = smoothstep(0.5, 4.0, -mv.z);
    float far = 1.0 - smoothstep(70.0, 140.0, -mv.z);
    vAlpha = (0.55 + 0.45 * sin(uTime * 1.3 + aSeed * 50.0)) * near * far;
    vColor = aColor;
  }
`;

const fieldFragment = /* glsl */ `
  uniform float uBright;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = 0.05 / d - 0.1;
    if (glow <= 0.0) discard;
    gl_FragColor = vec4(vColor, clamp(glow, 0.0, 1.0) * vAlpha * uBright);
  }
`;

function galaxyGeometry(count: number) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const inner = new THREE.Color("#F3E4C8");
  const outer = new THREE.Color("#5A63C8");
  const BRANCHES = 4;
  const RADIUS = 16;
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 1.6) * RADIUS;
    const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
    const spin = r * 0.42;
    const scatter = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (0.4 + r * 0.18);
    pos[i * 3] = Math.cos(branch + spin) * r + scatter();
    pos[i * 3 + 1] = scatter() * 0.35;
    pos[i * 3 + 2] = Math.sin(branch + spin) * r + scatter();
    const c = inner.clone().lerp(outer, Math.min(1, r / RADIUS + Math.random() * 0.1));
    col.set([c.r, c.g, c.b], i * 3);
    seed[i] = Math.random();
    size[i] = 0.6 + Math.random() * 1.4;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  return geo;
}

function starfieldGeometry(count: number, length: number) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const cool = new THREE.Color("#B9C0FF");
  const warm = new THREE.Color("#F6E7CF");
  for (let i = 0; i < count; i++) {
    // A long tube of stars around the flight path, kept clear right where the camera passes.
    const ang = Math.random() * Math.PI * 2;
    const rad = 2.2 + Math.pow(Math.random(), 0.7) * 30;
    pos[i * 3] = Math.cos(ang) * rad;
    pos[i * 3 + 1] = Math.sin(ang) * rad * 0.75;
    pos[i * 3 + 2] = 20 - Math.random() * (length + 60);
    const c = cool.clone().lerp(warm, Math.random());
    col.set([c.r, c.g, c.b], i * 3);
    seed[i] = Math.random();
    size[i] = 0.5 + Math.pow(Math.random(), 3) * 2.4;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  return geo;
}

/**
 * progress: a ref holding the camera's position along the path, in stops (0 = first stop).
 * Words are laid out on screen by frame: cx, cy and width as fractions of the viewport.
 */
export function Voyage({
  stops,
  font,
  progress,
  className,
}: {
  stops: Stop[];
  font: string;
  progress: { current: number };
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the page still reads fine, the sky is just empty.
    }
    const pixel = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixel);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);
    scene.add(camera);

    const narrow = window.innerWidth < 700;
    const last = stops.length - 1;
    const pathLength = last * GAP;

    // ---------- Starfield around the path ----------
    const fieldGeo = starfieldGeometry(narrow ? 9000 : 22000, pathLength);
    const fieldMat = new THREE.ShaderMaterial({
      vertexShader: fieldVertex,
      fragmentShader: fieldFragment,
      uniforms: { uTime: { value: 0 }, uPixel: { value: pixel }, uSpin: { value: 0 }, uBright: { value: 1.0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(fieldGeo, fieldMat));

    // ---------- Galaxies: one below the first stop, one waiting at the end ----------
    const galGeo = galaxyGeometry(narrow ? 7000 : 16000);
    const galMat = new THREE.ShaderMaterial({
      vertexShader: fieldVertex,
      fragmentShader: fieldFragment,
      uniforms: { uTime: { value: 0 }, uPixel: { value: pixel }, uSpin: { value: 0.06 }, uBright: { value: 0.55 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const near = new THREE.Points(galGeo, galMat);
    near.position.set(3, -6.5, -18);
    near.rotation.set(0.42, 0, -0.18);
    scene.add(near);
    const farGalMat = galMat.clone();
    farGalMat.uniforms.uBright!.value = 0.8;
    const far = new THREE.Points(galGeo, farGalMat);
    far.position.set(0, -1.5, -pathLength - 34);
    far.rotation.set(1.05, 0, 0.25);
    far.scale.setScalar(1.25);
    scene.add(far);

    // ---------- Words ----------
    const PER_WORD = narrow ? 1800 : 3600;
    const words = stops.filter((s) => s.word).length;
    const COUNT = PER_WORD * words;
    const wordGeo = new THREE.BufferGeometry();
    const from = new Float32Array(COUNT * 3);
    const to = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    const stopZ = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      seeds[i] = Math.random();
      sizes[i] = (0.7 + Math.random() * 1.1) * (narrow ? 0.55 : 1);
    }
    wordGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    wordGeo.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
    wordGeo.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
    wordGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    wordGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    wordGeo.setAttribute("aStop", new THREE.BufferAttribute(stopZ, 1));
    wordGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    const wordMat = new THREE.ShaderMaterial({
      vertexShader: wordVertex,
      fragmentShader: starFragment,
      uniforms: {
        uCamZ: { value: 0 },
        uIntro: { value: reduced ? 1 : 0 },
        uTime: { value: 0 },
        uPixel: { value: pixel },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uMouseOn: { value: 0 },
        uBurst: { value: new THREE.Vector3(0, 0, 0) },
        uColor: { value: new THREE.Color("#F6EEDD") },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(wordGeo, wordMat));

    let w = 1;
    let h = 1;
    const view = () => {
      const vh = 2 * DEPTH * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      return { vw: vh * (w / h), vh };
    };

    function sample(text: string, cx: number, cy: number, width: number): number[] {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      g.font = `100px ${font}`;
      const size = Math.min((100 * w * width) / g.measureText(text).width, h * 0.28);
      g.font = `${size}px ${font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#fff";
      g.fillText(text, w * cx, h * cy);
      const data = g.getImageData(0, 0, w, h).data;
      const pts: number[] = [];
      const step = Math.max(narrow ? 3 : 2, Math.round(size / 45));
      const { vw, vh } = view();
      for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step)
          if (data[(y * w + x) * 4 + 3]! > 128)
            pts.push(((x + Math.random() * step) / w - 0.5) * vw, -((y + Math.random() * step) / h - 0.5) * vh, (Math.random() - 0.5) * 0.35);
      return pts;
    }

    function layout() {
      const { vw, vh } = view();
      const cy = narrow ? 0.36 : 0.42;
      const width = narrow ? 0.88 : 0.72;
      let k = 0;
      stops.forEach((s, si) => {
        if (!s.word) return;
        const pts = sample(s.word, 0.5, cy, si === 0 ? width : width * 0.86);
        const n = Math.max(1, pts.length / 3);
        const camZ = -si * GAP;
        for (let j = 0; j < PER_WORD; j++) {
          const i = k * PER_WORD + j;
          const p = Math.floor((j / PER_WORD) * n) % n;
          to[i * 3] = pts[p * 3] ?? 0;
          to[i * 3 + 1] = pts[p * 3 + 1] ?? 0;
          to[i * 3 + 2] = (pts[p * 3 + 2] ?? 0) + camZ - DEPTH;
          // Before it gathers, the star drifts somewhere in a wide cloud around the word.
          from[i * 3] = (Math.random() - 0.5) * vw * 2.6;
          from[i * 3 + 1] = (Math.random() - 0.5) * vh * 2.4;
          from[i * 3 + 2] = camZ - DEPTH + (Math.random() - 0.5) * 30;
          stopZ[i] = camZ;
        }
        k++;
      });
      wordGeo.attributes.aFrom!.needsUpdate = true;
      wordGeo.attributes.aTo!.needsUpdate = true;
      wordGeo.attributes.aStop!.needsUpdate = true;
    }

    // ---------- Input ----------
    const mouse = new THREE.Vector2(99, 99);
    const look = new THREE.Vector2(0, 0);
    let mouseOn = 0;
    let mouseTarget = 0;
    let burst = 0;
    const toView = (x: number, y: number) => {
      const { vw, vh } = view();
      return new THREE.Vector2((x / w - 0.5) * vw, -(y / h - 0.5) * vh);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.copy(toView(e.clientX, e.clientY));
      mouseTarget = 1;
    };
    const onLeave = () => (mouseTarget = 0);
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a,button,input,textarea,select")) return;
      const p = toView(e.clientX, e.clientY);
      wordMat.uniforms.uBurst!.value.set(p.x, p.y, 1);
      burst = 1;
    };

    function resize() {
      w = el.clientWidth;
      h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    let lastW = 0;
    const ro = new ResizeObserver(() => {
      resize();
      if (Math.abs(lastW - w) > 40) {
        lastW = w;
        layout();
      }
    });

    // ---------- Loop ----------
    const clock = new THREE.Clock();
    let raf = 0;
    let introStart = 0;
    let pos = progress.current;
    function frameLoop() {
      raf = requestAnimationFrame(frameLoop);
      const t = reduced ? 0 : clock.getElapsedTime();
      wordMat.uniforms.uTime!.value = t;
      fieldMat.uniforms.uTime!.value = t;
      galMat.uniforms.uTime!.value = t;
      farGalMat.uniforms.uTime!.value = t;
      if (!reduced) wordMat.uniforms.uIntro!.value = Math.min(1, (performance.now() - introStart) / 2600);
      mouseOn += (mouseTarget - mouseOn) * 0.08;
      wordMat.uniforms.uMouseOn!.value = mouseOn;
      (wordMat.uniforms.uMouse!.value as THREE.Vector2).lerp(mouse, 0.18);
      burst *= 0.92;
      wordMat.uniforms.uBurst!.value.z = burst;

      // Glide towards the scrolled position.
      pos += (progress.current - pos) * (reduced ? 1 : 0.075);
      const seg = Math.min(last - 1e-6, Math.max(0, Math.floor(pos)));
      const local = pos - seg;
      // Between stops the path bends a little, alternating sides, so it feels like flying, not a zoom.
      const side = seg % 2 === 0 ? 1 : -1;
      const bend = Math.sin(local * Math.PI) * side;
      look.lerp(new THREE.Vector2((mouse.x / 20) * mouseOn, (mouse.y / 20) * mouseOn), 0.06);
      camera.position.set(bend * 2.4 + look.x * 0.6, Math.sin(local * Math.PI) * 0.8 + look.y * 0.4, -pos * GAP);
      camera.rotation.set(look.y * 0.02, -bend * 0.06 + look.x * 0.03, bend * 0.05);
      wordMat.uniforms.uCamZ!.value = camera.position.z;
      renderer.render(scene, camera);
    }

    let cancelled = false;
    resize();
    lastW = w;
    (document.fonts?.load(`64px ${font}`) ?? Promise.resolve())
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        layout();
        ro.observe(el);
        introStart = performance.now();
        if (!reduced) {
          window.addEventListener("pointermove", onMove, { passive: true });
          document.documentElement.addEventListener("pointerleave", onLeave);
          window.addEventListener("pointerdown", onDown);
        }
        frameLoop();
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      fieldGeo.dispose();
      galGeo.dispose();
      wordGeo.dispose();
      fieldMat.dispose();
      galMat.dispose();
      farGalMat.dispose();
      wordMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={host} className={className} aria-hidden />;
}
