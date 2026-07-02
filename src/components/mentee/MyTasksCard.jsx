import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";

export default function MyTasksCard({ tasks, onManageTasks, onTaskClick }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-lg font-bold text-slate-900">
          My Tasks
        </h2>
        <Button variant="ghost" onClick={onManageTasks} className="text-sm px-3 py-1.5 text-blue-600 hover:text-blue-700">
          Manage Tasks
        </Button>
      </div>

      {/* Scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-200">
              {["Task Name", "Status", "Deadline", "Action"].map((h, i) => (
                <th
                  key={h}
                  className={`pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${i === 3 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((t) => {
              return (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  {/* Task name */}
                  <td className="py-4 font-semibold text-slate-900 text-sm pr-4">
                    {t.title}
                  </td>

                  {/* Status badge */}
                  <td className="py-4">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Deadline */}
                  <td
                    className="py-4 text-sm font-medium"
                    style={{
                      color:
                        t.status === "Revision Needed" ? "#ef4444" : "#64748b",
                    }}
                  >
                    {t.deadline}
                  </td>

                  {/* Action */}
                  <td className="py-4 text-right">
                    {t.status !== "Completed" &&
                      t.status !== "Under Review" && (
                        <Button
                          variant="secondary"
                          onClick={() => onTaskClick(t)}
                          className="text-xs px-3 py-1.5"
                        >
                          {t.status === "Revision Needed"
                            ? "Resubmit"
                            : "Submit"}
                        </Button>
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
