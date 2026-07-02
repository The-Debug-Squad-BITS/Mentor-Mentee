// variant: "primary" | "secondary" | "danger" | "ghost"
export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 font-sans cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent focus:ring-blue-500",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm focus:ring-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent focus:ring-slate-200",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
