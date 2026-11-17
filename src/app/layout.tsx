import type { Metadata } from "next";
import { inter, leixo } from "../lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enrych",
  description:
    "We're all about making tools and products that help people out and add a bit of fun to life. We build stuff we’d love to use ourselves, aiming to make your day a little easier and a lot more enjoyable.",
  // Google AdSense site ownership (covers subdomains such as initle.enry.ch).
  other: { "google-adsense-account": "ca-pub-4399872503638784" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${leixo.variable}`}>
        <video
          className="fixed top-0 left-0 object-cover w-screen h-screen object-center"
          playsInline
          autoPlay
          muted
          loop
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute h-screen w-screen overflow-hidden grid grid-rows-1 p-6">
          {children}
        </div>
      </body>
    </html>
  );
}
