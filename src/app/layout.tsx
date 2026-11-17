import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import { leixo } from "../lib/fonts";
import { Shell } from "../components/Shell";
import { SmoothScroll } from "../components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://enry.ch"),
  title: { default: "Enrych: small, fun tools and games", template: "%s · Enrych" },
  description:
    "Enrych makes small, free tools and games that add a bit of fun to everyday life: Initle, a party game of initials; Toppings, a YouTube extension; and Verse, lock-screen lyrics for Mac.",
  // Google AdSense site ownership (covers subdomains such as initle.enry.ch).
  other: { "google-adsense-account": "ca-pub-4399872503638784" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${leixo.variable} bg-night font-serif text-dust antialiased`}>
        <SmoothScroll />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
