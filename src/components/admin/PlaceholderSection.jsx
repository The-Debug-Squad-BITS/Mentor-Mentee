import { Layers } from "../ui/Icons";

/* Rendered for any nav destination that has no section implemented yet.
   Reads as a deliberate, empty state rather than a broken screen. */
export default function PlaceholderSection({ title }) {
  return (
    <div className="card animate-fade-in">
      <div className="empty-state">
        <div className="empty-state-icon">
          <Layers size={22} />
        </div>
        <h2 className="empty-state-title">{title}</h2>
        <p className="empty-state-text">
          This workspace is not available yet. {title} will appear here once the module is released.
        </p>
      </div>
    </div>
  );
}
