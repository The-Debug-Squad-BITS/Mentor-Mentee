const badgeStyles = {
  green: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  blue: "bg-blue-50 text-blue-600 border-blue-200/60",
  purple: "bg-purple-50 text-purple-600 border-purple-200/60",
  amber: "bg-amber-50 text-amber-600 border-amber-200/60",
  red: "bg-red-50 text-red-600 border-red-200/60",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
};

export default function StatCard({ icon, label, value, badge, badgeColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl md:rounded-2xl
        p-4 md:p-5 lg:p-6
        flex-1 min-w-35 md:min-w-40 lg:min-w-45
        border border-slate-200/75 relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300
        ${onClick ? "cursor-pointer select-none" : ""}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.01)" }}
    >
      <div className="flex justify-between items-start">
        {/* Icon */}
        <div className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 flex items-center justify-center text-[16px] md:text-[18px] lg:text-[20px] shadow-sm">
          {icon}
        </div>

        {/* Badge */}
        {badge && (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold border ${badgeStyles[badgeColor] || badgeStyles.blue}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 lg:mt-5">
        <div className="text-[12px] md:text-[13px] text-slate-500 font-medium">
          {label}
        </div>
        <div className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-slate-900 leading-[1.1] mt-1 tracking-tight">
          {value}
        </div>
      </div>
    </div>
  );
}
