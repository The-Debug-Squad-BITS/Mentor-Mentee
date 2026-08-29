import { Link } from "react-router-dom";

/* ==========================================================================
   Trellis — brand identity
   --------------------------------------------------------------------------
   One place that owns the mark, the wordmark and the lockup between them, so
   the brand reads identically in the marketing header, the three product
   sidebars, the auth screens and the footer.

   The mark is a trellis lattice: two uprights carrying a pair of crossed
   diagonals. It is the product's own metaphor — the structure you build so
   something else can grow along it — and it is deliberately geometric rather
   than a letterform, so it never reads as a placeholder monogram.

   Everything is drawn in `currentColor` and sized from a single `size` token,
   so a lockup inherits the surface it sits on and stays optically balanced at
   any scale.
   ========================================================================== */

/**
 * The bare lattice glyph. Use this when you need the symbol alone — inside a
 * tile, a favicon, or as a watermark. Prefer <Brand /> for anything that also
 * shows the name.
 */
export function BrandMark({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Uprights — the structure */}
        <path d="M6 3.75V20.25" />
        <path d="M18 3.75V20.25" />
        {/* Crossed lattice members, meeting exactly on centre */}
        <path d="M6 16.4 18 7.6" />
        <path d="M6 7.6 18 16.4" />
      </g>
    </svg>
  );
}

/* Tile + type scale for each lockup size. Kept as a table rather than inline
   maths so the three sidebars and the marketing header stay pixel-identical to
   what they rendered before the rebrand. */
const SIZES = {
  sm: { tile: "h-7 w-7 rounded-md", glyph: 15, word: "text-[15px]" },
  md: { tile: "h-8 w-8 rounded-lg", glyph: 18, word: "text-[17px]" },
  lg: { tile: "h-9 w-9 rounded-lg", glyph: 20, word: "text-[16px]" },
};

/* Two surfaces only: the light product/marketing chrome, and the ink sidebars
   and brand panel. The tile is solid brand on both so the mark itself never
   changes weight between surfaces — only the wordmark colour shifts. */
const TONES = {
  light: {
    tile: "bg-brand-600 text-white",
    word: "text-slate-900",
    subtitle: "text-slate-500",
  },
  dark: {
    tile: "bg-brand-600 text-white",
    word: "text-white",
    subtitle: "text-slate-400",
  },
};

/**
 * The full lockup: mark in a tile, wordmark beside it, optional context line
 * underneath (used by the sidebars to name the workspace).
 *
 * @param {"sm"|"md"|"lg"} size
 * @param {"light"|"dark"} tone      light chrome vs the ink sidebars
 * @param {string} [subtitle]        e.g. "Mentor workspace"
 * @param {boolean} [wordmark=true]  false renders the tile alone
 * @param {string} [to]              route to link to; omit for a static lockup
 */
export default function Brand({
  size = "md",
  tone = "light",
  subtitle,
  wordmark = true,
  to,
  className = "",
}) {
  const s = SIZES[size] || SIZES.md;
  const t = TONES[tone] || TONES.light;

  // A logo that goes home is an expectation, not a nicety — but only where a
  // destination is given, so error and loading screens stay inert.
  const Wrapper = to ? Link : "span";
  const wrapperProps = to
    ? { to, "aria-label": "Trellis — go to the home page" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`flex items-center gap-2.5 ${
        to ? "rounded-lg no-underline transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500" : ""
      } ${className}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center ${s.tile} ${t.tile}`}
      >
        <BrandMark size={s.glyph} />
      </span>

      {wordmark && (
        <span className="min-w-0">
          <span
            className={`block truncate font-display font-bold tracking-tight leading-tight ${s.word} ${t.word}`}
          >
            Trellis
          </span>
          {subtitle && (
            <span className={`block truncate text-[11px] leading-tight ${t.subtitle}`}>
              {subtitle}
            </span>
          )}
        </span>
      )}
    </Wrapper>
  );
}
