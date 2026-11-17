"use client";

import { useEffect, useRef } from "react";

/**
 * A field of stars that gathers into a word. Stars drift, scatter away from the cursor (or a
 * finger) and settle back. Change `word` and they fly to the new letters. Click to burst them.
 * With reduced motion, the word is drawn once, still.
 */
export type Frame = { cx: number; cy: number; width: number };

export function Constellation({ word, font, frame, className }: { word: string; font: string; frame: Frame; className?: string }) {
  const frameRef = useRef(frame);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef(word);
  const retarget = useRef<(() => void) | null>(null);

  useEffect(() => {
    wordRef.current = word;
    frameRef.current = frame;
    retarget.current?.();
  }, [word, frame.cx, frame.cy, frame.width]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;

    type Star = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; home: boolean; r: number; tw: number; hue: number };
    let stars: Star[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let pointerSeen = false;

    /** Sample points inside the word's letters, drawn in the Leixo display font. */
    function sample(text: string): { x: number; y: number }[] {
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d")!;
      const f = frameRef.current;
      o.font = `100px ${font}`;
      const size = Math.min((100 * w * f.width) / o.measureText(text).width, h * 0.3);
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = `${size}px ${font}`;
      o.fillText(text, w * f.cx, h * f.cy);
      const data = o.getImageData(0, 0, w, h).data;
      const step = Math.max(w < 640 ? 3 : 2, Math.round(size / 28));
      const pts: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3]! > 128) pts.push({ x: x + (Math.random() - 0.5) * step, y: y + (Math.random() - 0.5) * step });
      return pts;
    }

    function assign() {
      const pts = wordRef.current ? sample(wordRef.current) : [];
      // Shuffle so stars take new places from all over the sky.
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j]!, pts[i]!];
      }
      stars.forEach((s, i) => {
        const p = pts[i];
        if (p) {
          s.tx = p.x;
          s.ty = p.y;
          s.home = true;
        } else {
          s.home = false; // background dust
          s.tx = Math.random() * w;
          s.ty = Math.random() * h;
        }
      });
    }
    retarget.current = assign;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(3200, Math.max(900, (w * h) / 450)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        tx: 0,
        ty: 0,
        home: false,
        r: (Math.random() * 1.1 + 0.35) * (w < 640 ? 0.7 : 1),
        tw: Math.random() * Math.PI * 2,
        hue: 215 + Math.random() * 50,
      }));
      assign();
      if (reduced) {
        stars.forEach((s) => {
          s.x = s.tx;
          s.y = s.ty;
        });
        draw(0);
      }
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, w, h);
      // Faint milky band, echoing the old video.
      const g = ctx.createRadialGradient(w * 0.72, h * 0.9, 0, w * 0.72, h * 0.9, Math.max(w, h) * 0.7);
      g.addColorStop(0, "rgba(96,104,170,0.16)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (pointer.active) {
        const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
        halo.addColorStop(0, "rgba(233,220,196,0.07)");
        halo.addColorStop(1, "rgba(233,220,196,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(pointer.x - 220, pointer.y - 220, 440, 440);
      }
      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.002 + s.tw);
        const a = s.home ? 0.55 + 0.45 * twinkle : 0.12 + 0.25 * twinkle;
        ctx.fillStyle = s.home ? `hsla(38, 45%, 92%, ${a})` : `hsla(${s.hue}, 35%, 78%, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.home ? s.r + 0.25 : s.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step(t: number) {
      raf = requestAnimationFrame(step);
      if (!visible) return;
      const R = Math.min(140, w * 0.12);
      for (const s of stars) {
        // Spring towards the target; background dust drifts slowly instead.
        const k = s.home ? 0.012 : 0.0006;
        s.vx += (s.tx - s.x) * k + Math.sin(t * 0.0003 + s.tw) * 0.012;
        s.vy += (s.ty - s.y) * k + Math.cos(t * 0.00025 + s.tw) * 0.012;
        if (pointer.active) {
          const dx = s.x - pointer.x;
          const dy = s.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const f = (1 - Math.sqrt(d2) / R) * 1.6;
            const d = Math.sqrt(d2) || 1;
            s.vx += (dx / d) * f;
            s.vy += (dy / d) * f;
          }
        }
        s.vx *= 0.86;
        s.vy *= 0.86;
        s.x += s.vx;
        s.y += s.vy;
        if (!s.home && Math.abs(s.x - s.tx) < 2 && Math.abs(s.y - s.ty) < 2) {
          s.tx = Math.random() * w;
          s.ty = Math.random() * h;
        }
      }
      draw(t);
    }

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = e.pointerType === "mouse";
      pointerSeen = true;
    };
    const leave = () => {
      pointer.active = false;
    };
    void pointerSeen;
    const burst = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a,button,input,textarea,select")) return;
      const r = canvas.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      for (const s of stars) {
        const dx = s.x - cx;
        const dy = s.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const f = 2400 / (d + 60);
        s.vx += (dx / d) * f * (0.6 + Math.random() * 0.8);
        s.vy += (dy / d) * f * (0.6 + Math.random() * 0.8);
      }
    };

    const io = new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(() => resize());

    let cancelled = false;
    (document.fonts?.load(`64px ${font}`) ?? Promise.resolve())
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        resize();
        ro.observe(canvas);
        if (!reduced) {
          window.addEventListener("pointermove", move, { passive: true });
          document.documentElement.addEventListener("pointerleave", leave);
          window.addEventListener("pointerdown", burst);
          raf = requestAnimationFrame(step);
        }
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", burst);
      retarget.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
