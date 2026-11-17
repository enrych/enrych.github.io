"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sky, type Frame } from "./Sky";

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

const HERO: Frame = { cx: 0.5, cy: 0.42, width: 0.6, maxH: 0.24 };
const HERO_NARROW: Frame = { cx: 0.5, cy: 0.36, width: 0.84, maxH: 0.14 };
const SIDE: Frame = { cx: 0.76, cy: 0.5, width: 0.34, maxH: 0.2 };

export function HomeView() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [inView, setInView] = useState<string>(WORK[0]!.word);
  const [inHero, setInHero] = useState(true);
  const [wide, setWide] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    const hero = new IntersectionObserver(([e]) => setInHero(!!e && e.intersectionRatio > 0.4), { threshold: [0, 0.4, 1] });
    if (heroRef.current) hero.observe(heroRef.current);
    // The row crossing the middle of the screen is the one drawn in the sky.
    const mid = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setInView((e.target as HTMLElement).dataset.word!);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    rows.current.forEach((r) => r && mid.observe(r));
    return () => {
      mq.removeEventListener("change", update);
      hero.disconnect();
      mid.disconnect();
    };
  }, []);

  const current = hovered ?? inView;
  const word = inHero ? "ENRYCH" : wide ? current : "";
  const frame = inHero ? (wide ? HERO : HERO_NARROW) : SIDE;

  return (
    <>
      <Sky word={word} frame={frame} className="fixed inset-0 -z-10 h-[100lvh] w-full" />

      <section ref={heroRef} className="relative -mt-[var(--nav)] flex h-[100svh] min-h-[560px] flex-col justify-end pb-[8vh]">
        <h1 className="sr-only">Enrych</h1>
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <p className="font-serif text-[clamp(1.75rem,3vw,2.6rem)] font-light leading-[1.1] text-starlight">Enrich the everyday.</p>
          <a href="#work" className="font-serif text-base italic text-haze transition-colors hover:text-starlight">
            Initle, Toppings and Verse
          </a>
        </div>
      </section>

      <section id="work" aria-label="Work" className="scroll-mt-[var(--nav)] py-[16vh]">
        <ul className="lg:max-w-[52%]" onMouseLeave={() => setHovered(null)}>
          {WORK.map((w, i) => {
            const lit = !wide || current === w.word;
            return (
              <li key={w.name} ref={(el) => (rows.current[i] = el)} data-word={w.word}>
                <a
                  href={w.href}
                  onMouseEnter={() => setHovered(w.word)}
                  onFocus={() => setHovered(w.word)}
                  onBlur={() => setHovered(null)}
                  className={`group block py-[clamp(2rem,6vh,4rem)] transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-40"}`}
                >
                  <span className="block font-serif text-[clamp(3.25rem,7.5vw,7rem)] font-light leading-[0.95] tracking-[-0.02em] text-starlight group-focus-visible:underline group-focus-visible:decoration-1 group-focus-visible:underline-offset-[10px]">
                    {w.name}
                  </span>
                  <span className="mt-5 block max-w-[38ch] font-serif text-[1.1875rem] leading-[1.45] text-dust">{w.line}</span>
                  <span className="mt-2 block font-serif text-base italic text-haze">{w.kind}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="pb-[18vh] pt-[8vh]">
        <p className="font-serif text-[clamp(2.25rem,5vw,4.25rem)] font-light leading-[1.05] tracking-[-0.015em] text-starlight">Small things, done right.</p>
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
