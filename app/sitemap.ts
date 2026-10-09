import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/kitchen`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/story`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
