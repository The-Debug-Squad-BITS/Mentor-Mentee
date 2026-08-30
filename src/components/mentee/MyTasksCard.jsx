import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { CheckCircle, ArrowRight } from "../ui/Icons";

export default function MyTasksCard({ tasks, onManageTasks, onTaskClick }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="section-title m-0">My Tasks</h2>
        <Button variant="ghost" size="sm" onClick={onManageTasks}>
          Manage Tasks <ArrowRight size={15} />
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">
            <CheckCircle size={22} />
          </span>
          <p className="empty-state-title">Nothing due right now</p>
          <p className="empty-state-text">
            Tasks assigned to you by your mentor will appear here with their status and
            deadline.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table min-w-[520px]">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Status</th>
                <th>Deadline</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                return (
                  <tr key={t.id}>
                    {/* Task name */}
                    <td className="font-semibold text-slate-900">{t.title}</td>

                    {/* Status badge */}
                    <td>
                      <StatusBadge status={t.status} />
                    </td>

                    {/* Deadline — a revision request is the one state worth colouring */}
                    <td
                      className={`font-medium ${
                        t.status === "Revision Needed" ? "text-danger-600" : "text-slate-600"
                      }`}
                    >
                      {t.deadline}
                    </td>

                    {/* Action */}
                    <td className="text-right">
                      {t.status !== "Completed" && t.status !== "Under Review" && (
                        <Button variant="secondary" size="sm" onClick={() => onTaskClick(t)}>
                          {t.status === "Revision Needed" ? "Resubmit" : "Submit"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
