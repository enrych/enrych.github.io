import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const PATHS = ["", "/initle", "/initle/how-to-play", "/initle/tips", "/toppings", "/verse", "/about", "/contact", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({ url: `https://enry.ch${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
}
