/* ==========================================================================
   Button — the single control primitive for actions.
   --------------------------------------------------------------------------
   variant: "primary" | "secondary" | "danger" | "ghost" | "subtle" | "success"
   size:    "sm" | "md" | "lg"

   `primary`, `secondary`, `danger` and `ghost` are the original four and keep
   their original meaning; the rest are additive. Any extra props (onClick,
   type, disabled, aria-*, …) pass straight through to the <button>.
   ========================================================================== */

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "font-sans whitespace-nowrap select-none " +
  "transition-[background-color,border-color,box-shadow,color] duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-brand-600 text-white border border-brand-600 shadow-xs " +
    "hover:bg-brand-700 hover:border-brand-700 active:bg-brand-800 " +
    "focus-visible:outline-brand-600",
  secondary:
    "bg-white text-slate-700 border border-slate-300 shadow-xs " +
    "hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 active:bg-slate-100 " +
    "focus-visible:outline-slate-500",
  danger:
    "bg-danger-600 text-white border border-danger-600 shadow-xs " +
    "hover:bg-danger-700 hover:border-danger-700 active:bg-danger-800 " +
    "focus-visible:outline-danger-600",
  ghost:
    "bg-transparent text-slate-600 border border-transparent " +
    "hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 " +
    "focus-visible:outline-slate-500",
  subtle:
    "bg-brand-50 text-brand-700 border border-brand-100 " +
    "hover:bg-brand-100 hover:border-brand-200 active:bg-brand-200 " +
    "focus-visible:outline-brand-600",
  success:
    "bg-success-600 text-white border border-success-600 shadow-xs " +
    "hover:bg-success-700 hover:border-success-700 " +
    "focus-visible:outline-success-600",
};

const sizes = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-[15px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) {
  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
