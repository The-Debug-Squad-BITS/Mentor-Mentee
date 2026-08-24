/* ==========================================================================
   Icon set — a single, consistent stroke-based family.
   --------------------------------------------------------------------------
   All icons share one geometry: 24×24 viewBox, 1.75 stroke, round caps and
   joins, `currentColor`. That consistency is what makes an icon set read as
   designed rather than assembled.

   Usage:  <Icon.Check size={16} />   or   <ArrowRight />
   ========================================================================== */

function Svg({ size = 16, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ── Navigation & direction ─────────────────────────────────────────────── */

export function ArrowRight(p) {
  return <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
}
export function ArrowLeft(p) {
  return <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>;
}
export function ArrowUpRight(p) {
  return <Svg {...p}><path d="M7 17 17 7M8 7h9v9" /></Svg>;
}
export function ChevronDown(p) {
  return <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>;
}
export function ChevronRight(p) {
  return <Svg {...p}><path d="m9 18 6-6-6-6" /></Svg>;
}
export function ChevronLeft(p) {
  return <Svg {...p}><path d="m15 18-6-6 6-6" /></Svg>;
}
export function ExternalLink(p) {
  return (
    <Svg {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </Svg>
  );
}

/* ── Actions ────────────────────────────────────────────────────────────── */

export function Plus(p) {
  return <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
}
export function Close(p) {
  return <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>;
}
export function Check(p) {
  return <Svg {...p}><path d="m20 6-11 11-5-5" /></Svg>;
}
export function Search(p) {
  return <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" /></Svg>;
}
export function Filter(p) {
  return <Svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" /></Svg>;
}
export function Edit(p) {
  return (
    <Svg {...p}>
      <path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </Svg>
  );
}
export function Trash(p) {
  return (
    <Svg {...p}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
    </Svg>
  );
}
export function Download(p) {
  return <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></Svg>;
}
export function Upload(p) {
  return <Svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></Svg>;
}
export function Send(p) {
  return <Svg {...p}><path d="M21 3 3 10.5l7 3 3 7L21 3Z" /><path d="M10 13.5 21 3" /></Svg>;
}
export function Refresh(p) {
  return (
    <Svg {...p}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
    </Svg>
  );
}
export function MoreHorizontal(p) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </Svg>
  );
}
export function Menu(p) {
  return <Svg {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Svg>;
}
export function LogOut(p) {
  return <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Svg>;
}
export function Eye(p) {
  return <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Svg>;
}
export function EyeOff(p) {
  return (
    <Svg {...p}>
      <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6A17 17 0 0 0 2 13s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
    </Svg>
  );
}

/* ── Objects & domain ───────────────────────────────────────────────────── */

export function Dashboard(p) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  );
}
export function Folder(p) {
  return <Svg {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" /></Svg>;
}
export function Users(p) {
  return (
    <Svg {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}
export function User(p) {
  return <Svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>;
}
export function Mail(p) {
  return <Svg {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></Svg>;
}
export function MessageSquare(p) {
  return <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></Svg>;
}
export function Video(p) {
  return <Svg {...p}><path d="m23 7-7 5 7 5V7Z" /><rect x="1" y="5" width="15" height="14" rx="2" /></Svg>;
}
export function Calendar(p) {
  return (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  );
}
export function Clock(p) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Svg>;
}
export function CheckCircle(p) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>;
}
export function AlertCircle(p) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5M12 16h.01" /></Svg>;
}
export function AlertTriangle(p) {
  return (
    <Svg {...p}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </Svg>
  );
}
export function Info(p) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4.5M12 8h.01" /></Svg>;
}
export function Bell(p) {
  return <Svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></Svg>;
}
export function Settings(p) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Svg>
  );
}
export function Activity(p) {
  return <Svg {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></Svg>;
}
export function BarChart(p) {
  return <Svg {...p}><path d="M18 20V10M12 20V4M6 20v-6" /></Svg>;
}
export function Target(p) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Svg>;
}
export function Flag(p) {
  return <Svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1Z" /><path d="M4 22v-7" /></Svg>;
}
export function FileText(p) {
  return (
    <Svg {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" />
    </Svg>
  );
}
export function Layers(p) {
  return <Svg {...p}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></Svg>;
}
export function Shield(p) {
  return <Svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></Svg>;
}
export function Lock(p) {
  return <Svg {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Svg>;
}
export function Sparkle(p) {
  return <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" /></Svg>;
}
export function GraduationCap(p) {
  return (
    <Svg {...p}>
      <path d="M22 9 12 4 2 9l10 5 10-5Z" />
      <path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
    </Svg>
  );
}
export function Compass(p) {
  return <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></Svg>;
}
export function Inbox(p) {
  return (
    <Svg {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z" />
    </Svg>
  );
}

/* ── Brand mark ─────────────────────────────────────────────────────────── */

/**
 * The Mentora mark: two overlapping rounded chevrons reading as a stylised
 * "M" and as two paths converging — mentor and mentee meeting on a project.
 * Uses `currentColor` so it inherits whatever surface it sits on.
 */
export function Logo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 18V9.2a1.6 1.6 0 0 1 2.7-1.15L12 13l5.3-4.95A1.6 1.6 0 0 1 20 9.2V18"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="19.2" r="1.9" fill="currentColor" />
    </svg>
  );
}

/**
 * StarIcon — retained for backwards compatibility with existing call sites.
 * Now stroke-based and colour-inheriting like the rest of the set.
 */
export function StarIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />
    </svg>
  );
}

/* Namespace export so call sites can do `Icon.Check` without long imports. */
export const Icon = {
  ArrowRight, ArrowLeft, ArrowUpRight, ChevronDown, ChevronRight, ChevronLeft, ExternalLink,
  Plus, Close, Check, Search, Filter, Edit, Trash, Download, Upload, Send, Refresh,
  MoreHorizontal, Menu, LogOut, Eye, EyeOff,
  Dashboard, Folder, Users, User, Mail, MessageSquare, Video, Calendar, Clock,
  CheckCircle, AlertCircle, AlertTriangle, Info, Bell, Settings, Activity, BarChart,
  Target, Flag, FileText, Layers, Shield, Lock, Sparkle, GraduationCap, Compass, Inbox,
  Logo, StarIcon,
};
