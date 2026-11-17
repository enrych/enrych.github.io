import Link from "next/link";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col [--nav:4.5rem]">
      <header className="sticky top-0 z-10 h-[var(--nav)] bg-gradient-to-b from-night via-night/80 to-transparent">
        <nav className="mx-auto flex h-full max-w-[90rem] items-center justify-between px-[clamp(1.25rem,4vw,3.5rem)] text-[15px] text-white">
          <Link href="/" className="font-leixo text-xl tracking-wide" aria-label="Enrych home">
            ENRYCH
          </Link>
          <ul className="flex gap-6">
            <li>
              <Link href="/#work" className="nav-link">Work</Link>
            </li>
            <li>
              <Link href="/about" className="nav-link">About</Link>
            </li>
            <li>
              <Link href="/contact" className="nav-link">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-[clamp(1.25rem,4vw,3.5rem)]">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[90rem] px-[clamp(1.25rem,4vw,3.5rem)] py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-haze/25 pt-6 font-serif text-[15px] text-haze">
          <span>Enrych, {new Date().getFullYear()}</span>
          <span className="flex gap-6">
            <Link href="/privacy" className="hover:text-starlight">Privacy</Link>
            <Link href="/contact" className="hover:text-starlight">Contact</Link>
            <a href="https://github.com/enrych" target="_blank" rel="noopener noreferrer" className="hover:text-starlight">GitHub</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <article className="prose-enrych mx-auto max-w-[40rem] py-[10vh]">{children}</article>;
}
