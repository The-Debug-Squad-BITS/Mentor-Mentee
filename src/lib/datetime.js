// Local-time helpers for <input type="datetime-local"> values and calendar day
// bucketing. Using UTC (toISOString) for these would shift the time/day by the
// viewer's timezone offset — e.g. in IST (+5:30) a 05:30 local event would show,
// and save back, as the previous day at 00:00. Always format in LOCAL time so the
// value the user sees is exactly the value that round-trips through
// `new Date(value).toISOString()` on save.

const pad = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DDTHH:mm" in the viewer's LOCAL time — feed straight to a
// datetime-local input; slice(0, 10) gives the local date for a date input.
export function toLocalInput(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// "YYYY-MM-DD" for the LOCAL calendar day — matches how the month grid builds its
// per-cell keys, so events land on the day the user actually sees.
export function localDayKey(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "DD-MM-YYYY" for displaying raw date fields in UI uniformly across browser locales
export function formatUIDate(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}
