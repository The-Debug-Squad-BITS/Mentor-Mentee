/* ==========================================================================
   avatarColor — a stable, legible fill for an initials chip.
   --------------------------------------------------------------------------
   These used to be `Math.random()`, which had two problems: the colour changed
   on every refetch so avatars visibly flickered between colours, and a random
   24-bit value can land anywhere — including near-white, which is unreadable
   under Avatar's white initials.

   Hashing a stable key instead means the same person is always the same
   colour, and the palette is fixed to tones that clear 4.5:1 against white.
   ========================================================================== */

// All chosen to carry white text at 4.5:1 or better.
const PALETTE = [
  "#4f46e5", // indigo
  "#0f766e", // teal
  "#b45309", // amber
  "#9333ea", // purple
  "#0369a1", // sky
  "#be123c", // rose
  "#15803d", // green
  "#c2410c", // orange
  "#1e40af", // blue
  "#7e22ce", // violet
];

/**
 * @param {string} seed  something stable per person — a user id, or their email
 *                       or name as a fallback.
 * @returns {string} hex colour
 */
export function avatarColor(seed) {
  const key = String(seed || "");
  if (!key) return PALETTE[0];

  // djb2 — small, fast, and spreads short strings like ids well enough.
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0;
  }

  return PALETTE[Math.abs(hash) % PALETTE.length];
}
