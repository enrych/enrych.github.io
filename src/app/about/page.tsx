import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "../../components/Shell";

export const metadata: Metadata = {
  title: "About Enrych",
  description: "Enrych is a one-person independent studio in Bengaluru making free tools and games: Initle, Toppings and Verse.",
};

export default function About() {
  return (
    <Prose>
      <h1>About Enrych</h1>
      <p className="lead">
        Enrych is a small, independent studio run by Divyaditya Singh Naruka, a software engineer in Bengaluru, India. It&apos;s where side projects become things other
        people can use.
      </p>

      <h2>How projects start</h2>
      <p>Every Enrych project began as a small irritation:</p>
      <ul>
        <li>
          <strong>Toppings</strong> started with not knowing how long a YouTube course would actually take, and with YouTube&apos;s playback controls being just a bit too
          coarse.
        </li>
        <li>
          <strong>Verse</strong> started with music playing on a locked laptop and no way to glance at the lyrics.
        </li>
        <li>
          <strong>Initle</strong> started with game nights where half the evening went into getting everyone to install the same app.
        </li>
      </ul>
      <p>The rule is simple: build things we&apos;d want to use ourselves, keep them free, and make them feel good to use.</p>

      <h2>What we care about</h2>
      <ul>
        <li>
          <strong>Free to use.</strong> Initle may show a few ads in single-player mode to cover running costs; the tools themselves don&apos;t.
        </li>
        <li>
          <strong>Privacy.</strong> No accounts unless they&apos;re genuinely useful, and no selling of data.
        </li>
        <li>
          <strong>Open source.</strong> The code for every project is public on{" "}
          <a href="https://github.com/enrych" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </li>
        <li>
          <strong>Small and finished.</strong> A tool that does one thing well beats a platform that does ten things badly.
        </li>
      </ul>

      <h2>Get in touch</h2>
      <p>
        Found a bug, have an idea, or want to say hello? See the <Link href="/contact">contact page</Link>.
      </p>
    </Prose>
  );
}
