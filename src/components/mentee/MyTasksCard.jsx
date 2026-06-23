const statusColors = {
  "Revision Needed": { bg: "#fef2f2", text: "#ef4444" },
  "To Do": { bg: "#f1f5f9", text: "#64748b" },
  "In Progress": { bg: "#eff6ff", text: "#3b82f6" },
  "Under Review": { bg: "#fef3c7", text: "#d97706" },
  Completed: { bg: "#dcfce7", text: "#16a34a" },
};

export default function MyTasksCard({ tasks, onManageTasks, onTaskClick }) {
  return (
    <div
      className="bg-white rounded-2xl p-4 md:p-5 lg:p-7 border border-slate-100"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.02)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <h2 className="m-0 text-base md:text-lg lg:text-xl font-black text-slate-800">
          My Tasks
        </h2>
        <button
          onClick={onManageTasks}
          className="bg-transparent border-0 text-indigo-500 text-[11px] md:text-xs lg:text-sm font-bold cursor-pointer hover:text-indigo-700 transition-colors"
          style={{ fontFamily: "inherit" }}
        >
          Manage Tasks
        </button>
      </div>

      {/* Scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-105">
          <thead>
            <tr className="border-b-2 border-slate-100">
              {["Task Name", "Status", "Deadline", "Action"].map((h, i) => (
                <th
                  key={h}
                  className={`pb-2.5 md:pb-3 text-[10px] md:text-xs lg:text-sm font-bold text-slate-400 ${i === 3 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const s = statusColors[t.status] || statusColors["To Do"];
              return (
                <tr
                  key={t.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150"
                >
                  {/* Task name */}
                  <td className="py-3 md:py-3.5 lg:py-4 font-semibold text-slate-800 text-xs md:text-sm lg:text-base pr-3">
                    {t.title}
                  </td>

                  {/* Status badge */}
                  <td className="py-3 md:py-3.5 lg:py-4">
                    <span
                      className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold"
                      style={{ background: s.bg, color: s.text }}
                    >
                      {t.status}
                    </span>
                  </td>

                  {/* Deadline */}
                  <td
                    className="py-3 md:py-3.5 lg:py-4 text-[11px] md:text-xs lg:text-sm font-semibold"
                    style={{
                      color:
                        t.status === "Revision Needed" ? "#ef4444" : "#64748b",
                    }}
                  >
                    {t.deadline}
                  </td>

                  {/* Action */}
                  <td className="py-3 md:py-3.5 lg:py-4 text-right">
                    {t.status !== "Completed" &&
                      t.status !== "Under Review" && (
                        <button
                          onClick={() => onTaskClick(t)}
                          className="bg-white border border-slate-200
                          px-2.5 py-1 text-[10px]
                          md:px-3 md:py-1.5 md:text-xs
                          lg:px-3.5 lg:py-1.5 lg:text-xs
                          rounded-lg font-bold text-slate-800 cursor-pointer hover:border-slate-800 transition-colors"
                          style={{ fontFamily: "inherit" }}
                        >
                          {t.status === "Revision Needed"
                            ? "Resubmit"
                            : "Submit"}
                        </button>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
