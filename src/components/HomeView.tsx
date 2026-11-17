"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Galaxy, type Frame } from "./Galaxy";

const WORK = [
  {
    word: "INITLE",
    name: "Initle",
    line: "A party game of initials. Crack famous phrases from their first letters, or write fakes that fool your friends.",
    kind: "Game, in the browser",
    href: "https://initle.enry.ch",
  },
  {
    word: "TOPPINGS",
    name: "Toppings",
    line: "The controls YouTube forgot: playlist runtimes, exact speeds and seek steps, Shorts that scroll themselves.",
    kind: "Extension for Chrome and Firefox",
    href: "https://toppings.enry.ch",
  },
  {
    word: "VERSE",
    name: "Verse",
    line: "The song you're playing, word by word, on your Mac's lock screen.",
    kind: "App for macOS",
    href: "https://verse.enry.ch",
  },
];

const HERO: Frame = { cx: 0.5, cy: 0.46, width: 0.8 };
const HERO_NARROW: Frame = { cx: 0.5, cy: 0.4, width: 0.9 };
const SIDE: Frame = { cx: 0.77, cy: 0.5, width: 0.35 };

export function HomeView({ font }: { font: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [rowY, setRowY] = useState(0.5);
  const [inHero, setInHero] = useState(true);
  const [wide, setWide] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const scroll = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (hover: hover)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    const io = new IntersectionObserver(([e]) => setInHero(!!e && e.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] });
    if (heroRef.current) io.observe(heroRef.current);
    const onScroll = () => (scroll.current = window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", update);
      io.disconnect();
    };
  }, []);

  // In the hero the sky spells the studio's name. Over the work list it spells whatever you point at,
  // and otherwise dissolves into dust so the text stays easy to read.
  const pointing = hovered && wide;
  const word = pointing ? hovered : inHero ? "ENRYCH" : "";
  const frame = pointing ? { ...SIDE, cy: rowY } : wide ? HERO : HERO_NARROW;

  return (
    <>
      <Galaxy word={word} font={font} frame={frame} scrollRef={scroll} className="fixed inset-0 -z-10 h-[100lvh] w-full" />

      <section ref={heroRef} className="relative -mt-[var(--nav)] flex h-[100svh] min-h-[520px] items-end pb-[9vh]">
        <h1 className="sr-only">Enrych</h1>
        <p className="max-w-[24ch] font-serif text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.25] text-starlight">
          Small, free things that make everyday life a little lighter.
        </p>
      </section>

      <section id="work" aria-label="Work" className="scroll-mt-[var(--nav)] pt-[12vh]">
        <ul onMouseLeave={() => setHovered(null)}>
          {WORK.map((w) => (
            <li key={w.name} className="group border-t border-haze/25 last:border-b">
              <a
                href={w.href}
                onMouseEnter={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setRowY(Math.min(0.8, Math.max(0.2, (r.top + r.height * 0.32) / window.innerHeight)));
                  setHovered(w.word);
                }}
                onFocus={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setRowY(Math.min(0.8, Math.max(0.2, (r.top + r.height * 0.32) / window.innerHeight)));
                  setHovered(w.word);
                }}
                onBlur={() => setHovered(null)}
                className="block py-[clamp(1.75rem,4vw,3.25rem)] outline-none"
              >
                <span className="block font-leixo text-[clamp(3.2rem,10vw,8.5rem)] leading-[0.85] text-starlight transition-[color,transform] duration-500 ease-out group-hover:translate-x-3 group-hover:text-glow group-focus-within:text-glow group-focus-within:underline group-focus-within:decoration-1 group-focus-within:underline-offset-8">
                  {w.name}
                </span>
                <span className="mt-5 block max-w-[34ch] font-serif text-lg leading-snug text-dust">
                  {w.line}
                  <span className="mt-1.5 block text-[15px] italic text-haze">{w.kind}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-serif text-[15px] text-haze">
          New to Initle? Read <Link className="link" href="/initle/how-to-play">how to play</Link> or the <Link className="link" href="/initle/tips">tips</Link>.
        </p>
      </section>

      <section className="py-[18vh]">
        <p className="max-w-[30ch] font-serif text-[clamp(1.6rem,3.4vw,2.8rem)] leading-[1.2] text-starlight">
          Enrych exists to enrich everyday life, one small, finished thing at a time. Everything is free to use, with the code in the open.
        </p>
        <p className="mt-8 font-serif text-lg text-dust">
          <Link className="link" href="/about">
            Why Enrych
          </Link>
          <span className="mx-3 text-haze/60">/</span>
          <a className="link" href="https://github.com/enrych" target="_blank" rel="noopener noreferrer">
            Code on GitHub
          </a>
        </p>
      </section>
    </>
  );
}
