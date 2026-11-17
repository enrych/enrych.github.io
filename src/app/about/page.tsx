import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "../../components/Shell";

export const metadata: Metadata = {
  title: "About Enrych",
  description: "Enrych makes free tools and games that enrich everyday life: Initle, Toppings and Verse.",
};

export default function About() {
  return (
    <Prose>
      <h1>About Enrych</h1>
      <p className="lead">The name says the aim: to enrich everyday life. Not with big platforms, but with small things that make an ordinary moment better.</p>

      <h2>Where the work starts</h2>
      <p>Every Enrych project begins with a small moment that could be better:</p>
      <ul>
        <li>
          <strong>Toppings</strong>: not knowing how long a YouTube course will really take, and playback controls that are just a bit too coarse.
        </li>
        <li>
          <strong>Verse</strong>: music playing on a locked laptop, with no way to glance at the words.
        </li>
        <li>
          <strong>Initle</strong>: game nights where half the evening goes into getting everyone to install the same app.
        </li>
      </ul>
      <p>Fix that moment well, make the fix free, and make it a pleasure to use. That&apos;s the whole method.</p>

      <h2>What Enrych stands for</h2>
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
