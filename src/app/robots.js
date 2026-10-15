// Next.js builds /robots.txt from this file automatically.
// Put it at: src/app/robots.js

const SITE = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // booking, payment and cron endpoints are not pages for search results
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}