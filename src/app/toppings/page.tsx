import type { Metadata } from "next";
import { Prose } from "../../components/Shell";

export const metadata: Metadata = {
  title: "Toppings: take control of YouTube",
  description:
    "Toppings is a free Chrome and Firefox extension for YouTube: playlist runtimes, precise playback speed and seek controls, Shorts auto-scroll and custom keybindings. No data collection.",
};

export default function Toppings() {
  return (
    <Prose>
      <h1>Toppings: take control of YouTube</h1>
      <p className="lead">
        Toppings is a free browser extension that adds the small controls YouTube is missing. It works in Chrome and Firefox, and it doesn&apos;t collect any data about
        what you watch.
      </p>
      <p>
        <a href="https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl" target="_blank" rel="noopener noreferrer">
          Get it for Chrome
        </a>{" "}
        ·{" "}
        <a href="https://addons.mozilla.org/en-US/firefox/addon/toppings/" target="_blank" rel="noopener noreferrer">
          Get it for Firefox
        </a>{" "}
        · <a href="https://toppings.enry.ch">Toppings website</a>
      </p>

      <h2>What it adds</h2>
      <h3>Playlist runtimes</h3>
      <p>
        Open any playlist and Toppings tells you how long it takes to watch from start to finish. It&apos;s the difference between “a 40-video course” and “a 6-hour
        course”, which is what you actually need to know before you start.
      </p>
      <h3>Exact playback speed</h3>
      <p>YouTube&apos;s speed menu jumps in big steps. Toppings lets you pick precise speeds instead of the fixed steps, and change them with your own keyboard shortcuts.</p>
      <h3>Custom seek steps</h3>
      <p>
        The arrow keys skip five seconds at a time. With Toppings you choose the step, so a lecture can skip 30 seconds and a music video 2, or anything in between.
      </p>
      <h3>Shorts auto-scroll</h3>
      <p>When a Short ends, Toppings moves to the next one for you, so you can watch hands-free.</p>
      <h3>Your own keybindings</h3>
      <p>Every feature can be mapped to the keys you prefer, so your hands never leave the keyboard.</p>

      <h2>Privacy first</h2>
      <p>
        Toppings runs inside your browser. It doesn&apos;t track the videos you watch, doesn&apos;t sell or share data, and doesn&apos;t show ads. Playlist runtimes are
        looked up through a small server we run, which only sees the playlist ID being asked about.
      </p>

      <h2>Open source</h2>
      <p>
        Toppings is open source. The extension, the server and the website are all on{" "}
        <a href="https://github.com/enrych/toppings" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        , where you can report bugs, suggest features or contribute code.
      </p>
    </Prose>
  );
}
