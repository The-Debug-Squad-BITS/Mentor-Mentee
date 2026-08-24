/* ==========================================================================
   Avatar — initials chip for a person.
   --------------------------------------------------------------------------
   Props unchanged: { initials, color, size }. `color` still drives the fill,
   so existing per-user colours carry through untouched.

   Refinements: a squircle radius that scales with the chip, an inner hairline
   that lifts it off light surfaces, and a `title` so the initials are
   readable to assistive tech rather than being decorative noise.
   ========================================================================== */

export default function Avatar({ initials, color, size = 36, title }) {
  return (
    <div
      title={title}
      className="relative flex items-center justify-center font-semibold text-white shrink-0
        shadow-xs ring-1 ring-inset ring-white/15 select-none"
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.3)),
        background: color || "var(--color-brand-600)",
        fontSize: Math.round(size * 0.38),
        letterSpacing: "0.01em",
      }}
    >
      {initials}
    </div>
  );
}
