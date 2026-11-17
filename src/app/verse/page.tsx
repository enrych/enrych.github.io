import type { Metadata } from "next";
import { Prose } from "../../components/Shell";

export const metadata: Metadata = {
  title: "Verse: lyrics on your Mac's lock screen",
  description:
    "Verse is a free, open-source Mac app that shows the lyrics of the song you're playing, word by word, on your lock screen or any display. Works with Spotify and Apple Music.",
};

export default function Verse() {
  return (
    <Prose>
      <h1>Verse: your lyrics, your way</h1>
      <p className="lead">
        Verse shows the song you&apos;re playing, word by word, on your Mac&apos;s lock screen or on any display you choose. It works with Spotify and Apple Music, on
        macOS 14 or later, on Apple silicon and Intel Macs. It&apos;s free and open source.
      </p>
      <p>
        <a href="https://verse.enry.ch">Download Verse</a> · Or with Homebrew: <code>brew install --cask enrych/tap/verse</code>
      </p>

      <h2>Why it exists</h2>
      <p>
        When music is playing and the laptop is locked, the lyrics are the one thing you can&apos;t see. Verse puts them right there, timed to the song, so a locked Mac on
        a desk becomes something closer to a lyric display.
      </p>

      <h2>Features</h2>
      <ul>
        <li>
          <strong>Two styles.</strong> <em>Constellation</em> places words like stars joined in the order they&apos;re sung; <em>Focus</em> shows one big line with each
          word lighting up as it&apos;s sung.
        </li>
        <li>
          <strong>Backgrounds.</strong> A quiet night sky, plain black, the song&apos;s album art blurred, or your own wallpaper.
        </li>
        <li>
          <strong>Quiet moments.</strong> During intros and instrumental breaks, the next line appears faintly; pausing the music dims the lyrics.
        </li>
        <li>
          <strong>Sync controls.</strong> A global timing offset, plus a per-song nudge that Verse remembers.
        </li>
        <li>
          <strong>Best available lyrics.</strong> Word-by-word timing where it exists, line-by-line otherwise, and plain lyrics spread across the song as a last resort.
        </li>
        <li>
          <strong>Full-screen stage.</strong> Show lyrics on any display, toggled with ⌃⌥⌘L on the screen under your pointer.
        </li>
        <li>
          <strong>Edge glow.</strong> Soft light around the screen edges that moves with the beat or the words, in your colours. It listens to system audio, never the
          microphone.
        </li>
      </ul>

      <h2>Installing</h2>
      <ol>
        <li>Download the DMG from the Verse website, open it, and drag Verse into Applications.</li>
        <li>
          Verse isn&apos;t notarised by Apple yet, so the first time, right-click it and choose <strong>Open</strong>. Installing with Homebrew avoids this step.
        </li>
        <li>Play something in Spotify or Apple Music and allow Verse to read it when macOS asks. Then lock your Mac, or pick a display for the full-screen stage.</li>
      </ol>

      <h2>Open source</h2>
      <p>
        The code is on{" "}
        <a href="https://github.com/enrych/verse" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        . Bug reports and ideas are welcome there.
      </p>
    </Prose>
  );
}
