/* ==========================================================================
   SEO / AEO / GEO helpers
   --------------------------------------------------------------------------
   This is a single-page app, so the crawler-facing <head> in index.html only
   describes the landing page. Every other route has to set its own title and
   description at runtime — that is what `useSeo` does.

   Three audiences, one mechanism:
     SEO  — classic crawlers: title, description, canonical, Open Graph.
     AEO  — answer engines quoting a direct answer: FAQPage structured data
            generated from the same copy the page renders, so the two can
            never drift apart.
     GEO  — generative engines summarising the product: an explicit
            SoftwareApplication + Organization graph stating what Trellis is,
            who it is for and what it costs, rather than leaving a model to
            infer it from marketing prose.

   Set VITE_SITE_URL in .env to the deployed origin. It drives canonical URLs,
   Open Graph URLs and the structured-data identifiers.
   ========================================================================== */

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://trellis.example.edu"
).replace(/\/$/, "");

export const SITE_NAME = "Trellis";

export const DEFAULT_DESCRIPTION =
  "Trellis is an academic project and capstone supervision platform. Departments run " +
  "final-year projects, capstones, dissertations and supervised internships through " +
  "milestones, tasks, student submissions and supervisor review.";

/* ── <head> tag plumbing ──────────────────────────────────────────────────
   Tags we manage are marked data-managed so a later route can update them
   without disturbing anything hand-written in index.html.                  */

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("data-managed", "");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-managed", "");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Apply per-route metadata. Call from a route component via useSeo().
 *
 * @param {object}  o
 * @param {string}  o.title        full <title>; also used for og:title
 * @param {string}  [o.description]
 * @param {string}  [o.path]       route path for the canonical URL, e.g. "/login"
 * @param {boolean} [o.noindex]    true for authenticated screens
 */
export function applySeo({ title, description = DEFAULT_DESCRIPTION, path = "/", noindex = false }) {
  const url = SITE_URL + path;

  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertLink("canonical", url);

  // Authenticated screens must never be indexed — they are behind a login and
  // their titles would leak workspace structure into search results.
  upsertMeta('meta[name="robots"]', {
    name: "robots",
    content: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
  });

  upsertMeta('meta[property="og:title"]',       { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:url"]',         { property: "og:url", content: url });
  upsertMeta('meta[name="twitter:title"]',       { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
}

/* ── Structured data ───────────────────────────────────────────────────── */

/** Replace (or create) a JSON-LD block, keyed by id so routes don't stack up. */
export function setJsonLd(id, data) {
  const elId = `jsonld-${id}`;
  let el = document.getElementById(elId);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = elId;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * FAQPage graph built from the same array the page renders, so the structured
 * data and the visible answers can never disagree — which is both a Google
 * requirement and the whole point for answer engines.
 */
export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** What the product is, in terms a generative engine can restate accurately. */
export function productJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Project supervision and academic workflow management",
    operatingSystem: "Web browser",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "Project coordinators, faculty supervisors and students",
    },
    featureList: [
      "Milestone-gated project planning",
      "Student work submission with supervisor review and approval",
      "Revision requests and structured feedback",
      "Reusable project templates",
      "Meeting scheduling and shared calendar",
      "Real-time messaging and notifications",
      "Complete activity history for evaluation",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
