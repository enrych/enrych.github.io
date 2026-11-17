"use client";

import { useEffect, useRef } from "react";

/*
  A night sky drawn on a 2D canvas.
  - A fixed field of background stars (with a faint band of the galaxy) that drifts slowly with scroll and pointer.
  - A pool of bright stars that arrange themselves into a word, drawn as a constellation:
    stars sit on the letter vertices and hairlines join them.
  Changing the word sends the stars gliding to their new places, then the lines are traced again.
*/

export type Frame = { cx: number; cy: number; width: number; maxH: number };

type Pt = [number, number];

// Single-stroke letters on a 0.7 x 1 grid. Each letter is a list of polylines.
const C_CURVE: Pt[] = [[0.7, 0.15], [0.45, 0], [0.18, 0.06], [0, 0.34], [0, 0.66], [0.18, 0.94], [0.45, 1], [0.7, 0.85]];
const BOWL: Pt[] = [[0, 1], [0, 0], [0.48, 0], [0.7, 0.13], [0.7, 0.37], [0.48, 0.5], [0, 0.5]];
const GLYPHS: Record<string, { w: number; lines: Pt[][] }> = {
  E: { w: 0.62, lines: [[[0.62, 0], [0, 0], [0, 0.5], [0, 1], [0.62, 1]], [[0, 0.5], [0.5, 0.5]]] },
  N: { w: 0.7, lines: [[[0, 1], [0, 0], [0.7, 1], [0.7, 0]]] },
  R: { w: 0.7, lines: [BOWL, [[0.34, 0.5], [0.7, 1]]] },
  Y: { w: 0.7, lines: [[[0, 0], [0.35, 0.5], [0.7, 0]], [[0.35, 0.5], [0.35, 1]]] },
  C: { w: 0.7, lines: [C_CURVE] },
  H: { w: 0.7, lines: [[[0, 0], [0, 0.5], [0, 1]], [[0.7, 0], [0.7, 0.5], [0.7, 1]], [[0, 0.5], [0.7, 0.5]]] },
  I: { w: 0, lines: [[[0, 0], [0, 1]]] },
  T: { w: 0.7, lines: [[[0, 0], [0.35, 0], [0.7, 0]], [[0.35, 0], [0.35, 1]]] },
  L: { w: 0.6, lines: [[[0, 0], [0, 1], [0.6, 1]]] },
  O: {
    w: 0.76,
    lines: [[[0.38, 0], [0.68, 0.16], [0.76, 0.5], [0.68, 0.84], [0.38, 1], [0.08, 0.84], [0, 0.5], [0.08, 0.16], [0.38, 0]]],
  },
  P: { w: 0.7, lines: [BOWL] },
  G: { w: 0.72, lines: [[...C_CURVE.map(([x, y]) => [x, y] as Pt), [0.72, 0.56], [0.42, 0.56]]] },
  S: {
    w: 0.68,
    lines: [[[0.68, 0.12], [0.42, 0], [0.12, 0.06], [0, 0.26], [0.2, 0.46], [0.5, 0.55], [0.68, 0.75], [0.55, 0.95], [0.25, 1], [0, 0.88]]],
  },
  V: { w: 0.72, lines: [[[0, 0], [0.36, 1], [0.72, 0]]] },
};

type Shape = { pts: Pt[]; edges: [number, number][]; w: number };

// Small deterministic noise so a word always forms the same, slightly irregular asterism.
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const shapes = new Map<string, Shape>();
function shapeOf(word: string): Shape {
  const hit = shapes.get(word);
  if (hit) return hit;
  const pts: Pt[] = [];
  const edges: [number, number][] = [];
  const key = new Map<string, number>();
  let x = 0;
  const gap = 0.34;
  Array.from(word).forEach((ch, li) => {
    const g = GLYPHS[ch];
    if (!g) return;
    for (const line of g.lines) {
      let prev = -1;
      for (const [px, py] of line) {
        const k = `${li}:${px.toFixed(3)}:${py.toFixed(3)}`;
        let idx = key.get(k);
        if (idx === undefined) {
          idx = pts.length;
          key.set(k, idx);
          const seed = li * 97 + idx * 13 + word.length;
          pts.push([x + px + (hash(seed) - 0.5) * 0.06, py + (hash(seed + 7) - 0.5) * 0.06]);
        }
        if (prev >= 0 && prev !== idx) edges.push([prev, idx]);
        prev = idx;
      }
    }
    x += g.w + gap;
  });
  const shape = { pts, edges, w: x - gap };
  shapes.set(word, shape);
  return shape;
}

const POOL = 72;
const MOVE = 1100; // ms each star takes to glide
const SPREAD = 420; // ms of stagger across the word, left to right
const TRACE = 520; // ms to trace one line

type Star = {
  x: number; y: number;
  fx: number; fy: number;
  tx: number; ty: number;
  a: number; fa: number; ta: number;
  delay: number;
  size: number;
  phase: number;
};

type BgStar = { x: number; y: number; r: number; a: number; tw: number; warm: boolean };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export function Sky({
  word,
  frame,
  className,
}: {
  word: string;
  frame: Frame;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ set: (w: string, f: Frame) => void } | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1;
    let bg: BgStar[] = [];
    let band: HTMLCanvasElement | null = null;
    const glow = document.createElement("canvas");
    {
      glow.width = glow.height = 64;
      const g = glow.getContext("2d")!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,248,232,1)");
      grad.addColorStop(0.12, "rgba(255,240,214,0.55)");
      grad.addColorStop(0.4, "rgba(233,220,196,0.12)");
      grad.addColorStop(1, "rgba(233,220,196,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }

    const stars: Star[] = Array.from({ length: POOL }, (_, i) => ({
      x: 0, y: 0, fx: 0, fy: 0, tx: 0, ty: 0, a: 0, fa: 0, ta: 0, delay: 0,
      size: 1.5 + hash(i + 3) * 1.1,
      phase: hash(i + 11) * Math.PI * 2,
    }));
    let edges: [number, number][] = [];
    let oldEdges: [number, number][] = [];
    let oldPos: Pt[] = [];
    let changedAt = -1e9;
    let traceStart = 0;
    let curWord = "";
    let curFrame: Frame = frame;
    let starScale = 1;

    const mouse = { x: -1, y: -1, on: false, px: 0, py: 0 };
    let scrollY = window.scrollY;

    function makeBackground() {
      const area = W * H;
      const count = Math.round(Math.min(1400, Math.max(450, area / 1300)));
      bg = [];
      const tileH = H * 1.5;
      for (let i = 0; i < count; i++) {
        // Most stars are faint; a few are bright. Roughly a magnitude distribution.
        const m = Math.pow(Math.random(), 3.2);
        bg.push({
          x: Math.random() * W,
          y: Math.random() * tileH,
          r: 0.35 + m * 1.35,
          a: 0.25 + m * 0.75,
          tw: Math.random() < 0.08 ? 0.6 + Math.random() * 1.6 : 0,
          warm: Math.random() < 0.3,
        });
      }
      // The galaxy band: a soft diagonal haze with dense pinpricks, rendered once.
      band = document.createElement("canvas");
      band.width = Math.ceil(W * dpr);
      band.height = Math.ceil(tileH * dpr);
      const b = band.getContext("2d")!;
      b.scale(dpr, dpr);
      b.translate(W * 0.55, tileH * 0.5);
      b.rotate(-0.42);
      const len = Math.hypot(W, tileH);
      for (let i = 0; i < 22; i++) {
        const t = i / 21 - 0.5;
        const cx = t * len;
        const cy = Math.sin(t * 5.2) * 40;
        const r = 240 + hash(i) * 200;
        b.save();
        b.translate(cx, cy);
        b.scale(1, 0.38);
        const g = b.createRadialGradient(0, 0, 0, 0, 0, r);
        const a = 0.022 + hash(i + 40) * 0.02;
        g.addColorStop(0, `rgba(128,134,205,${a})`);
        g.addColorStop(0.5, `rgba(128,134,205,${a * 0.45})`);
        g.addColorStop(1, "rgba(128,134,205,0)");
        b.fillStyle = g;
        b.fillRect(-r, -r, r * 2, r * 2);
        b.restore();
      }
      const dust = Math.round(count * 1.4);
      for (let i = 0; i < dust; i++) {
        const u = (Math.random() - 0.5) * len;
        const v = (Math.random() + Math.random() + Math.random() - 1.5) * 90 + Math.sin((u / len) * 5.2) * 40;
        b.fillStyle = `rgba(214,216,240,${0.12 + Math.random() * 0.28})`;
        const s = 0.3 + Math.random() * 0.6;
        b.fillRect(u, v, s, s);
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas!.clientWidth;
      H = canvas!.clientHeight;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      makeBackground();
      retarget(curWord, curFrame, true);
    }

    function targetsFor(w: string, f: Frame): Pt[] {
      if (!w) return [];
      const s = shapeOf(w);
      const scale = Math.min((f.width * W) / s.w, f.maxH * H);
      const ox = f.cx * W - (s.w * scale) / 2;
      const oy = f.cy * H - scale / 2;
      starScale = Math.max(0.55, Math.min(1, scale / 95));
      return s.pts.map(([x, y]) => [ox + x * scale, oy + y * scale]);
    }

    function retarget(w: string, f: Frame, keepLines: boolean) {
      const now = performance.now();
      const targets = targetsFor(w, f);
      const sameWord = w === curWord;
      if (!sameWord) oldEdges = edges;
      // Pair visible stars with the new vertices left to right, so the sky sweeps rather than scrambles.
      const order = targets.map((p, i) => ({ p, i })).sort((a, b) => a.p[0] - b.p[0]);
      const visible = stars.map((s, i) => ({ s, i })).filter((o) => o.s.ta > 0).sort((a, b) => a.s.x - b.s.x);
      const hidden = stars.map((s, i) => ({ s, i })).filter((o) => o.s.ta === 0);
      const assign = new Array<number>(targets.length);
      if (sameWord) {
        for (let i = 0; i < targets.length; i++) assign[i] = i;
      } else {
        const pool = [...visible, ...hidden];
        order.forEach((o, k) => (assign[o.i] = pool[k]!.i));
      }
      const used = new Set(assign);
      // Re-index stars so star i sits on vertex i; keeps edges simple.
      const next: Star[] = [];
      assign.forEach((si) => next.push(stars[si]!));
      stars.forEach((s, i) => !used.has(i) && next.push(s));
      const remap = new Map<Star, number>();
      next.forEach((s, i) => remap.set(s, i));
      if (!sameWord) oldPos = next.map((s) => [s.x, s.y] as Pt);
      // oldEdges referenced old indices; rewrite to the new indices
      if (!sameWord) {
        const oldIndex = stars.map((s) => remap.get(s)!);
        oldEdges = oldEdges.map(([a, b]) => [oldIndex[a]!, oldIndex[b]!] as [number, number]);
      }
      stars.splice(0, stars.length, ...next);

      const minX = order.length ? order[0]!.p[0] : 0;
      const spanX = order.length ? Math.max(1, order[order.length - 1]!.p[0] - minX) : 1;
      stars.forEach((s, i) => {
        s.fx = s.x;
        s.fy = s.y;
        s.fa = s.a;
        const t = targets[i];
        if (t) {
          if (s.ta === 0 && s.a < 0.05) {
            // Rises out of the background somewhere near its place.
            const ang = hash(i * 3 + now) * Math.PI * 2;
            const d = 60 + hash(i * 5 + now) * Math.min(W, H) * 0.25;
            s.fx = s.x = t[0] + Math.cos(ang) * d;
            s.fy = s.y = t[1] + Math.sin(ang) * d;
          }
          s.tx = t[0];
          s.ty = t[1];
          s.ta = 1;
          s.delay = keepLines || still ? 0 : ((t[0] - minX) / spanX) * SPREAD;
        } else {
          s.tx = s.x;
          s.ty = s.y;
          s.ta = 0;
          s.delay = 0;
        }
      });
      edges = w ? shapeOf(w).edges : [];
      if (!sameWord) {
        changedAt = now;
        traceStart = now + (still ? 0 : SPREAD + MOVE * 0.75);
      } else if (keepLines) {
        changedAt = now - (still ? 1e6 : 0);
      }
      curWord = w;
      curFrame = f;
      if (still) settle();
    }

    function settle() {
      for (const s of stars) {
        s.x = s.tx; s.y = s.ty; s.a = s.ta;
      }
      oldEdges = [];
    }

    function drawStar(x: number, y: number, size: number, a: number) {
      const d = size * 11 * starScale;
      ctx!.globalAlpha = a;
      ctx!.drawImage(glow, x - d / 2, y - d / 2, d, d);
    }

    function frameDraw(now: number) {
      const c = ctx!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);

      // Pointer parallax, eased.
      const tx = mouse.on ? (mouse.x / W - 0.5) : 0;
      const ty = mouse.on ? (mouse.y / H - 0.5) : 0;
      mouse.px += (tx - mouse.px) * 0.05;
      mouse.py += (ty - mouse.py) * 0.05;

      // Background: tile repeats vertically with scroll, moving slower than the page.
      const tileH = H * 1.5;
      const off = still ? 0 : ((scrollY * 0.12) % tileH);
      const bx = -mouse.px * 14, by = -mouse.py * 10;
      if (band) {
        c.globalAlpha = 1;
        const bandOff = still ? 0 : ((scrollY * 0.06) % tileH);
        c.drawImage(band, 0, 0, band.width, band.height, bx * 0.6, -bandOff + by * 0.6, W, tileH);
        c.drawImage(band, 0, 0, band.width, band.height, bx * 0.6, tileH - bandOff + by * 0.6, W, tileH);
      }
      const t = now / 1000;
      for (const s of bg) {
        let y = s.y - off;
        if (y < -2) y += tileH;
        if (y > H + 2) continue;
        let a = s.a;
        if (s.tw && !still) a *= 0.65 + 0.35 * Math.sin(t * s.tw + s.x);
        c.globalAlpha = a;
        c.fillStyle = s.warm ? "#ffe9c9" : "#e6e9ff";
        const x = s.x + bx * (0.4 + s.r * 0.4);
        const yy = y + by * (0.4 + s.r * 0.4);
        if (s.r < 0.9) c.fillRect(x, yy, s.r * 1.4, s.r * 1.4);
        else {
          c.beginPath();
          c.arc(x, yy, s.r, 0, Math.PI * 2);
          c.fill();
        }
      }

      // Constellation stars.
      const since = now - changedAt;
      const cx = -mouse.px * 5, cy = -mouse.py * 4;
      for (const s of stars) {
        if (!still) {
          const k = ease(clamp01((since - s.delay) / MOVE));
          s.x = s.fx + (s.tx - s.fx) * k;
          s.y = s.fy + (s.ty - s.fy) * k;
          const ka = s.ta > s.fa ? clamp01((since - s.delay) / (MOVE * 0.6)) : clamp01(since / 500);
          s.a = s.fa + (s.ta - s.fa) * ka;
        }
      }

      // Old lines fade quickly as the stars start to leave.
      const fade = 1 - clamp01(since / 280);
      if (oldEdges.length && fade > 0) {
        c.globalAlpha = 0.34 * fade;
        c.strokeStyle = "#e9dcc4";
        c.lineWidth = 0.8;
        c.beginPath();
        for (const [a, b] of oldEdges) {
          const p = oldPos[a], q = oldPos[b];
          if (!p || !q) continue;
          c.moveTo(p[0] + cx, p[1] + cy);
          c.lineTo(q[0] + cx, q[1] + cy);
        }
        c.stroke();
      } else if (oldEdges.length) oldEdges = [];

      // New lines are traced in order, one after another, like a pen joining the dots.
      if (edges.length) {
        const per = still ? 0 : TRACE / Math.max(4, edges.length / 3);
        c.strokeStyle = "#e9dcc4";
        c.lineWidth = 0.8;
        edges.forEach(([a, b], i) => {
          const p = stars[a], q = stars[b];
          if (!p || !q) return;
          const k = still ? 1 : ease(clamp01((now - traceStart - i * per) / TRACE));
          if (k <= 0) return;
          let la = 0.32 * Math.min(p.a, q.a);
          if (mouse.on && !still) {
            const mx = (p.x + q.x) / 2 + cx - mouse.x, my = (p.y + q.y) / 2 + cy - mouse.y;
            la += 0.25 * clamp01(1 - Math.hypot(mx, my) / 180);
          }
          c.globalAlpha = la;
          c.beginPath();
          c.moveTo(p.x + cx, p.y + cy);
          c.lineTo(p.x + cx + (q.x - p.x) * k, p.y + cy + (q.y - p.y) * k);
          c.stroke();
        });
      }

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!;
        if (s.a < 0.01) continue;
        let a = s.a * (still ? 1 : 0.86 + 0.14 * Math.sin(t * 1.3 + s.phase));
        let size = s.size;
        if (mouse.on && !still) {
          const d = Math.hypot(s.x + cx - mouse.x, s.y + cy - mouse.y);
          const near = clamp01(1 - d / 140);
          a = Math.min(1, a + near * 0.3);
          size += near * 0.8;
        }
        drawStar(s.x + cx, s.y + cy, size, a);
      }
      c.globalAlpha = 1;
    }

    let raf = 0;
    let running = false;
    const loop = (now: number) => {
      frameDraw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || still) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    api.current = {
      set: (w, f) => {
        const sameWord = w === curWord;
        retarget(w, f, sameWord);
        if (still) frameDraw(performance.now());
      },
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
    };
    const onLeave = () => (mouse.on = false);
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onVis = () => (document.hidden ? stop() : start());

    resize();
    retarget(word, frame, false);
    if (still) frameDraw(performance.now());
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (still) frameDraw(performance.now());
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      api.current = null;
    };
    // The canvas is set up once; word and frame changes go through api.set below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const key = `${word}|${frame.cx}|${frame.cy}|${frame.width}|${frame.maxH}`;
  useEffect(() => {
    api.current?.set(word, frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
