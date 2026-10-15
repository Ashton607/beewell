// Next.js builds /sitemap.xml from this file automatically.
// Put it at: src/app/sitemap.js

const SITE = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

// Every public page you want Google to find.
const pages = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" },
  { path: "/classes", priority: 0.9, changeFrequency: "monthly" },
  { path: "/book", priority: 0.9, changeFrequency: "weekly" },
  { path: "/benefits", priority: 0.7, changeFrequency: "yearly" },
  { path: "/about", priority: 0.7, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap() {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE}${path}`,
    changeFrequency,
    priority,
  }));
}