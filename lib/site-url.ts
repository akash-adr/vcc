// Absolute origin for canonical URLs, OG images, robots and sitemap.
// Set NEXT_PUBLIC_SITE_URL to your custom domain; on Vercel the production URL is used automatically.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");
