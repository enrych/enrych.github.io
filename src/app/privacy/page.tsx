import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "../../components/Shell";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How enry.ch and Enrych's projects handle your data, cookies and advertising.",
};

export default function Privacy() {
  return (
    <Prose>
      <h1>Privacy policy</h1>
      <p>Last updated: 17 November 2026</p>
      <p>
        This policy covers enry.ch and its subdomains. Each product also has its own details: see{" "}
        <a href="https://initle.enry.ch/privacy">Initle&apos;s privacy policy</a> for the game.
      </p>

      <h2>What this website collects</h2>
      <p>
        enry.ch is a static website. It has no accounts and no forms. Like any website, the servers that deliver it (Cloudflare and GitHub Pages) process your IP
        address and basic request details to serve pages and protect against abuse. We use Cloudflare Web Analytics to count visits; it doesn&apos;t use cookies and
        doesn&apos;t track you across sites.
      </p>

      <h2>Advertising and cookies</h2>
      <p>
        Some pages on enry.ch and its subdomains may show ads served by Google. Google and its partners use cookies to serve ads based on your previous visits to this and
        other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visits to our sites and other sites on the
        internet.
      </p>
      <ul>
        <li>
          You can turn off personalised advertising in{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>
          .
        </li>
        <li>
          You can opt out of some third-party vendors&apos; use of cookies for personalised advertising at{" "}
          <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          .
        </li>
        <li>
          Read how Google uses information from sites that use its services at{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            policies.google.com
          </a>
          .
        </li>
      </ul>
      <p>Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalised ads are shown.</p>

      <h2>Our products</h2>
      <ul>
        <li>
          <strong>Initle</strong> stores your nickname, game progress and, if you use friends and leaderboards, a public friend code and your Daily results. Details are in{" "}
          <a href="https://initle.enry.ch/privacy">its privacy policy</a>.
        </li>
        <li>
          <strong>Toppings</strong> runs in your browser and doesn&apos;t collect browsing data. Playlist runtime lookups send only the playlist ID to our server.
        </li>
        <li>
          <strong>Verse</strong> runs on your Mac. It reads the currently playing song from Spotify or Apple Music to fetch its lyrics, and doesn&apos;t send anything
          about you to us.
        </li>
      </ul>

      <h2>Children</h2>
      <p>Our sites are for a general audience and aren&apos;t directed at children under 13.</p>

      <h2>Changes and contact</h2>
      <p>
        If this policy changes, the date at the top changes too. Questions or removal requests: see the <Link href="/contact">contact page</Link>.
      </p>
    </Prose>
  );
}
