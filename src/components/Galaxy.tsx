"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Where on screen the word sits, as fractions of the viewport. */
export type Frame = { cx: number; cy: number; width: number };

const FOV = 35;
const DEPTH = 10; // distance from the camera to the plane the word is drawn on

const wordVertex = /* glsl */ `
  uniform float uMix;
  uniform float uTime;
  uniform float uPixel;
  uniform vec2 uMouse;
  uniform float uMouseOn;
  uniform vec3 uBurst; // x, y, strength
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aSeed;
  attribute float aSize;
  varying float vAlpha;
  varying float vHome;

  void main() {
    // Each star leaves and lands a little after its neighbours, so words assemble instead of popping.
    float start = aSeed * 0.45;
    float t = smoothstep(start, start + 0.55, uMix);
    vec3 p = mix(aFrom, aTo, t);
    // Drift along a gentle arc while travelling.
    p.z += sin(t * 3.14159) * (aSeed - 0.5) * 3.0;
    p.x += sin(uTime * 0.6 + aSeed * 40.0) * 0.012;
    p.y += cos(uTime * 0.5 + aSeed * 30.0) * 0.012;

    // Push away from the cursor.
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float push = (1.0 - smoothstep(0.0, 0.9, dist)) * uMouseOn;
    p.xy += normalize(d + 1e-4) * push * 0.35;
    p.z += push * 0.8;

    // Click: a shock ring.
    vec2 b = p.xy - uBurst.xy;
    float bd = length(b);
    p.xy += normalize(b + 1e-4) * uBurst.z * 2.4 / (bd + 0.6);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (115.0 / -mv.z);
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.7 + aSeed * 60.0);
    vHome = aTo.z > -1.5 ? 1.0 : 0.0;
    vAlpha = twinkle * mix(0.18, 0.95, vHome);
  }
`;

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixel;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Differential rotation: the core turns faster than the rim.
    float r = length(position.xz);
    float a = uTime * (0.06 / (r * 0.25 + 0.6));
    float c = cos(a), s = sin(a);
    vec3 p = vec3(position.x * c - position.z * s, position.y, position.x * s + position.z * c);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (140.0 / -mv.z);
    vAlpha = 0.55 + 0.45 * sin(uTime * 1.3 + aSeed * 50.0);
    vColor = aColor;
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

const dustFragment = /* glsl */ `
  uniform float uDim;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = 0.05 / d - 0.1;
    if (glow <= 0.0) discard;
    gl_FragColor = vec4(vColor, clamp(glow, 0.0, 1.0) * vAlpha * 0.55 * uDim);
  }
`;

export function Galaxy({ word, frame, font, scrollRef, className }: { word: string; frame: Frame; font: string; scrollRef: { current: number }; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ setWord: (w: string, f: Frame) => void } | null>(null);
  const latest = useRef({ word, frame });

  useEffect(() => {
    latest.current = { word, frame };
    api.current?.setWord(word, frame);
  }, [word, frame.cx, frame.cy, frame.width]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = host.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the page still works; the sky is just empty.
    }
    const pixel = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixel);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    scene.add(camera);

    const narrow = window.innerWidth < 700;
    const WORD_COUNT = narrow ? 4000 : 8000;
    const DUST_COUNT = narrow ? 7000 : 16000;

    // ---------- The galaxy (world space, slowly turning) ----------
    const dustGeo = new THREE.BufferGeometry();
    {
      const pos = new Float32Array(DUST_COUNT * 3);
      const col = new Float32Array(DUST_COUNT * 3);
      const seed = new Float32Array(DUST_COUNT);
      const size = new Float32Array(DUST_COUNT);
      const inner = new THREE.Color("#F3E4C8");
      const outer = new THREE.Color("#5A63C8");
      const BRANCHES = 4;
      const RADIUS = 16;
      for (let i = 0; i < DUST_COUNT; i++) {
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
      dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      dustGeo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
      dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      dustGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    }
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: { uTime: { value: 0 }, uPixel: { value: pixel }, uDim: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const galaxy = new THREE.Points(dustGeo, dustMat);
    galaxy.position.set(3, -6.5, -18);
    galaxy.rotation.set(0.42, 0, -0.18);
    scene.add(galaxy);

    // ---------- The word (screen-aligned, a child of the camera) ----------
    const wordGeo = new THREE.BufferGeometry();
    const from = new Float32Array(WORD_COUNT * 3);
    const to = new Float32Array(WORD_COUNT * 3);
    const seeds = new Float32Array(WORD_COUNT);
    const sizes = new Float32Array(WORD_COUNT);
    for (let i = 0; i < WORD_COUNT; i++) {
      seeds[i] = Math.random();
      sizes[i] = (0.7 + Math.random() * 1.1) * (narrow ? 0.5 : 1);
    }
    wordGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(WORD_COUNT * 3), 3));
    wordGeo.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
    wordGeo.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
    wordGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    wordGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    wordGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    const wordMat = new THREE.ShaderMaterial({
      vertexShader: wordVertex,
      fragmentShader: starFragment,
      uniforms: {
        uMix: { value: 0 },
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
    const wordPoints = new THREE.Points(wordGeo, wordMat);
    wordPoints.position.z = -DEPTH;
    camera.add(wordPoints);

    let w = 1;
    let h = 1;
    const view = () => {
      const vh = 2 * DEPTH * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      return { vw: vh * (w / h), vh };
    };

    /** A loose cloud far behind the word, where stars wait when no word is shown. */
    const cloud = (i: number, out: Float32Array) => {
      const { vw, vh } = view();
      out[i * 3] = (Math.random() - 0.5) * vw * 1.6;
      out[i * 3 + 1] = (Math.random() - 0.5) * vh * 1.6;
      out[i * 3 + 2] = -3 - Math.random() * 8;
    };

    function sample(text: string, f: Frame): number[] {
      if (!text) return [];
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      g.font = `100px ${font}`;
      const size = Math.min((100 * w * f.width) / g.measureText(text).width, h * 0.3);
      g.font = `${size}px ${font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#fff";
      g.fillText(text, w * f.cx, h * f.cy);
      const data = g.getImageData(0, 0, w, h).data;
      const pts: number[] = [];
      const step = Math.max(narrow ? 3 : 2, Math.round(size / 40));
      const { vw, vh } = view();
      for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step)
          if (data[(y * w + x) * 4 + 3]! > 128) pts.push(((x + Math.random() * step) / w - 0.5) * vw, -((y + Math.random() * step) / h - 0.5) * vh, (Math.random() - 0.5) * 0.35);
      return pts;
    }

    let mixStart = 0;
    let mixDur = 1;
    const MORPH_MS = 1700;

    function setWord(text: string, f: Frame, first = false) {
      // Freeze where every star is right now, then fly from there.
      const now = performance.now();
      const m = first ? 1 : Math.min(1, (now - mixStart) / mixDur);
      for (let i = 0; i < WORD_COUNT; i++) {
        const s = seeds[i]! * 0.45;
        const t = THREE.MathUtils.smoothstep(m, s, s + 0.55);
        for (let k = 0; k < 3; k++) from[i * 3 + k] = first ? 0 : from[i * 3 + k]! + (to[i * 3 + k]! - from[i * 3 + k]!) * t;
        if (first) cloud(i, from);
      }
      const pts = sample(text, f);
      const n = pts.length / 3;
      // Spread the word's points across all stars so density stays even.
      const order = Array.from({ length: WORD_COUNT }, (_, i) => i).sort(() => Math.random() - 0.5);
      order.forEach((star, j) => {
        if (n > 0 && j < Math.min(WORD_COUNT, n * 1.0)) {
          const p = Math.floor((j / Math.min(WORD_COUNT, n)) * n) % n;
          to[star * 3] = pts[p * 3]!;
          to[star * 3 + 1] = pts[p * 3 + 1]!;
          to[star * 3 + 2] = pts[p * 3 + 2]!;
        } else cloud(star, to);
      });
      wordGeo.attributes.aFrom!.needsUpdate = true;
      wordGeo.attributes.aTo!.needsUpdate = true;
      mixStart = now;
      mixDur = first ? 2600 : MORPH_MS;
    }

    // ---------- Input ----------
    const mouse = new THREE.Vector2(99, 99);
    let mouseOn = 0;
    let mouseTarget = 0;
    let burst = 0;
    const toWorld = (cx: number, cy: number) => {
      const { vw, vh } = view();
      return new THREE.Vector2((cx / w - 0.5) * vw, -(cy / h - 0.5) * vh);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.copy(toWorld(e.clientX, e.clientY));
      mouseTarget = 1;
    };
    const onLeave = () => (mouseTarget = 0);
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a,button,input,textarea,select")) return;
      const p = toWorld(e.clientX, e.clientY);
      wordMat.uniforms.uBurst!.value.set(p.x, p.y, 1);
      burst = 1;
    };

    // ---------- Size ----------
    function resize() {
      w = el.clientWidth;
      h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(() => {
      const ow = w;
      resize();
      if (Math.abs(ow - w) > 40) setWord(latest.current.word, latest.current.frame);
    });

    // ---------- Loop ----------
    const clock = new THREE.Clock();
    let raf = 0;
    const smoothScroll = { v: 0 };
    function frameLoop() {
      raf = requestAnimationFrame(frameLoop);
      const t = clock.getElapsedTime();
      const now = performance.now();
      wordMat.uniforms.uTime!.value = t;
      dustMat.uniforms.uTime!.value = t;
      wordMat.uniforms.uMix!.value = Math.min(1, (now - mixStart) / mixDur);
      mouseOn += (mouseTarget - mouseOn) * 0.08;
      wordMat.uniforms.uMouseOn!.value = mouseOn;
      (wordMat.uniforms.uMouse!.value as THREE.Vector2).lerp(mouse, 0.18);
      burst *= 0.92;
      wordMat.uniforms.uBurst!.value.z = burst;

      // Scrolling tips the camera down into the galaxy.
      const target = Math.min(1.6, scrollRef.current / Math.max(1, h));
      smoothScroll.v += (target - smoothScroll.v) * 0.08;
      const s = smoothScroll.v;
      const px = (mouse.x / 20) * mouseOn;
      const py = (mouse.y / 20) * mouseOn;
      camera.position.set(px * 0.6, py * 0.4 - s * 1.2, 0);
      camera.rotation.set(-s * 0.32 + py * 0.02, px * 0.03, 0);
      dustMat.uniforms.uDim!.value = 1 - Math.min(1, s) * 0.55;
      renderer.render(scene, camera);
    }

    let cancelled = false;
    resize();
    (document.fonts?.load(`64px ${font}`) ?? Promise.resolve())
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        setWord(latest.current.word, latest.current.frame, true);
        api.current = { setWord: (wd, f) => setWord(wd, f) };
        ro.observe(el);
        if (reduced) {
          mixStart = performance.now() - 1e6;
          wordMat.uniforms.uMix!.value = 1;
          renderer.render(scene, camera);
          api.current = {
            setWord: (wd, f) => {
              setWord(wd, f);
              mixStart = performance.now() - 1e6;
              wordMat.uniforms.uMix!.value = 1;
              renderer.render(scene, camera);
            },
          };
          return;
        }
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        window.addEventListener("pointerdown", onDown);
        frameLoop();
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      api.current = null;
      dustGeo.dispose();
      wordGeo.dispose();
      dustMat.dispose();
      wordMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={host} className={className} aria-hidden />;
}
