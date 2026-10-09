import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship source maps so production errors are debuggable (this is a public fan site, nothing secret client-side)
  productionBrowserSourceMaps: true,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
