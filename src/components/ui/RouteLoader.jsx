import Brand from "./Brand";

/* ==========================================================================
   RouteLoader — the Suspense fallback for lazily-loaded routes.
   --------------------------------------------------------------------------
   Routes are code-split, so there is a real (if short) gap before a dashboard
   chunk arrives. Showing the brand rather than a bare spinner keeps that gap
   feeling like part of the product.

   `min-h-screen` + centring means it occupies exactly the space the route
   would have, so there is no layout jump when the chunk resolves.
   ========================================================================== */

export default function RouteLoader({ label = "Loading…" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas p-6"
    >
      <Brand size="lg" />

      {/* Indeterminate track — deliberately calm, not a spinner race */}
      <span className="relative block h-1 w-40 overflow-hidden rounded-full bg-slate-200">
        <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-brand-500 animate-route-loader" />
      </span>

      <span className="sr-only">{label}</span>
    </div>
  );
}
