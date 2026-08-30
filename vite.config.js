import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Third-party code, grouped by how often it changes. Routes are already split
// per-page by lazy() in App.jsx; this splits the vendor half of the entry chunk
// so a deploy that only touches app code leaves these cached in the browser.
// Rolldown (Vite 8) wants manualChunks as a function, not an object map.
const VENDOR_CHUNKS = [
  ["vendor-react",    ["react-router-dom", "react-dom", "react/", "scheduler"]],
  ["vendor-realtime", ["socket.io-client", "engine.io-client", "socket.io-parser"]],
  ["vendor-ui",       ["react-toastify", "zustand", "axios"]],
];

// robots.txt and sitemap.xml need an absolute origin, and anything in public/ is
// copied verbatim with no env substitution — so emit them at build time from the
// same VITE_SITE_URL that drives the canonical and Open Graph tags.
function seoFiles(siteUrl) {
  const origin = siteUrl.replace(/\/+$/, "");
  // Only public routes belong in a sitemap; everything else sits behind a login.
  const routes = ["/", "/login", "/signup"];
  const lastmod = new Date().toISOString().slice(0, 10);

  const robots = [
    "User-agent: *",
    "Allow: /$",
    "Allow: /login",
    "Allow: /signup",
    "",
    "# Authenticated application routes — nothing here is useful to a crawler",
    "Disallow: /admin/",
    "Disallow: /mentor/",
    "Disallow: /mentee/",
    "Disallow: /change-password",
    "Disallow: /unauthorized",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");

  const urls = routes
    .map((r) =>
      [
        "  <url>",
        `    <loc>${origin}${r}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${r === "/" ? "weekly" : "monthly"}</changefreq>`,
        `    <priority>${r === "/" ? "1.0" : "0.6"}</priority>`,
        "  </url>",
      ].join("\n")
    )
    .join("\n");

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    "\n</urlset>\n";

  return {
    name: "trellis-seo-files",
    apply: "build",

    // Two separate problems with %VITE_SITE_URL% in index.html:
    //
    // 1. When the variable is undefined, Vite warns and leaves the literal
    //    token in place, shipping "%VITE_SITE_URL%/" as the canonical URL and
    //    in every Open Graph and JSON-LD field. robots.txt and sitemap.xml
    //    already fall back to `origin`, so resolve the HTML the same way.
    //
    // 2. When it *is* defined, Vite substitutes the raw value before this hook
    //    runs. The template writes "%VITE_SITE_URL%/", so a value ending in a
    //    slash yields "https://host//" — which search engines treat as a
    //    different URL from the real one. Collapse repeated slashes directly
    //    after the host so the deployed value cannot depend on whether someone
    //    typed a trailing slash into the dashboard.
    transformIndexHtml(html) {
      return html
        .split("%VITE_SITE_URL%")
        .join(origin)
        .replace(/(https?:\/\/[^/"'\s]+)\/{2,}/g, "$1/");
    },

    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL || "https://trellis.example.edu";

  return {
    plugins: [react(), tailwindcss(), seoFiles(siteUrl)],

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            const pkg = id.split("node_modules/").pop();
            for (const [chunk, packages] of VENDOR_CHUNKS) {
              if (packages.some((p) => pkg.startsWith(p))) return chunk;
            }
          },
        },
      },
      // Every route chunk sits well under this, so a future size regression
      // surfaces as a warning rather than going unnoticed.
      chunkSizeWarningLimit: 350,
    },
  };
});
