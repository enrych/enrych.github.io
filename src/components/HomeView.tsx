"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Voyage, type Stop } from "./Voyage";

const WORK = [
  {
    word: "INITLE",
    name: "Initle",
    line: "A party game of initials. Crack famous phrases from their first letters, or write fakes that fool your friends.",
    kind: "Game, in the browser",
    cta: "Play Initle",
    href: "https://initle.enry.ch",
  },
  {
    word: "TOPPINGS",
    name: "Toppings",
    line: "The controls YouTube forgot: playlist runtimes, exact speeds and seek steps, Shorts that scroll themselves.",
    kind: "Extension for Chrome and Firefox",
    cta: "Add Toppings",
    href: "https://toppings.enry.ch",
  },
  {
    word: "VERSE",
    name: "Verse",
    line: "The song you're playing, word by word, on your Mac's lock screen.",
    kind: "App for macOS",
    cta: "Get Verse",
    href: "https://verse.enry.ch",
  },
];

const STOPS: Stop[] = [{ word: "ENRYCH" }, ...WORK.map((w) => ({ word: w.word })), { word: "" }];
const LEG = 1.3; // screen heights of scrolling between two stops

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function HomeView({ font }: { font: string }) {
  const progress = useRef(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const last = STOPS.length - 1;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const raw = Math.max(0, Math.min(last, (window.scrollY - top) / (vh * LEG)));
      const seg = Math.min(last - 1, Math.floor(raw));
      // Linger at each stop, then travel.
      progress.current = raw >= last ? last : seg + smooth(0.22, 0.78, raw - seg);
      panels.current.forEach((p, i) => {
        if (!p) return;
        const d = Math.abs(raw - i);
        const o = 1 - smooth(0.12, 0.32, d);
        p.style.opacity = String(o);
        p.style.transform = `translateY(${(raw - i) * -40}px)`;
        p.style.visibility = o < 0.02 ? "hidden" : "visible";
        p.style.pointerEvents = o > 0.6 ? "auto" : "none";
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + i * window.innerHeight * LEG });
  };

  const panel = "absolute inset-x-0 bottom-0 pb-[9vh] will-change-transform";

  return (
    <>
      <Voyage stops={STOPS} font={font} progress={progress} className="fixed inset-0 -z-10 h-[100lvh] w-full" />

      <div ref={track} className="relative -mt-[var(--nav)]" style={{ height: `calc(${(STOPS.length - 1) * LEG * 100}svh + 100svh)` }}>
        {/* Anchors so the nav and links can jump to a stop. */}
        {STOPS.map((_, i) => (
          <span key={i} id={i === 1 ? "work" : undefined} className="absolute left-0" style={{ top: `${i * LEG * 100}svh` }} />
        ))}

        <div className="sticky top-0 h-[100svh]">
          <div ref={(el) => (panels.current[0] = el)} className={panel}>
            <h1 className="sr-only">Enrych</h1>
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
              <p className="max-w-[16ch] font-serif text-[clamp(1.9rem,3.6vw,3.25rem)] font-light leading-[1.08] text-starlight">Make every day a little better.</p>
              <button type="button" onClick={() => goTo(1)} className="font-serif text-base italic text-haze transition-colors hover:text-starlight">
                Initle, Toppings and Verse
              </button>
            </div>
          </div>

          {WORK.map((w, i) => (
            <div key={w.name} ref={(el) => (panels.current[i + 1] = el)} className={panel} style={{ opacity: 0, visibility: "hidden" }}>
              <h2 className="sr-only">{w.name}</h2>
              <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
                <div className="max-w-[36ch]">
                  <p className="font-serif text-base italic text-haze">{w.kind}</p>
                  <p className="mt-2 font-serif text-[clamp(1.2rem,1.7vw,1.5rem)] leading-[1.35] text-starlight">{w.line}</p>
                </div>
                <a
                  href={w.href}
                  onFocus={() => goTo(i + 1)}
                  className="rounded-full border border-starlight/40 px-6 py-3 font-serif text-lg text-starlight transition-colors hover:border-starlight hover:bg-starlight hover:text-night"
                >
                  {w.cta}
                </a>
              </div>
            </div>
          ))}

          <div ref={(el) => (panels.current[STOPS.length - 1] = el)} className={panel} style={{ opacity: 0, visibility: "hidden" }}>
            <p className="font-serif text-[clamp(1.9rem,3.6vw,3.25rem)] font-light leading-[1.08] text-starlight">More on the way.</p>
            <p className="mt-6 font-serif text-lg text-dust">
              <Link className="link" href="/about" onFocus={() => goTo(STOPS.length - 1)}>
                Why Enrych
              </Link>
              <span className="mx-3 text-haze/60">/</span>
              <a className="link" href="https://github.com/enrych" target="_blank" rel="noopener noreferrer">
                Code on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
