import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Village Cooking Channel, a fan tribute",
    short_name: "VCC Tribute",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFDF7",
    theme_color: "#FBFDF7",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
