import Button from "../ui/Button";
import { Close } from "../ui/Icons";

export default function NewUserModal({ onClose }) {
  return (
    <div
      className="modal-backdrop items-end sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-panel max-w-md rounded-t-3xl sm:rounded-2xl">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="m-0 font-display text-[17px] font-bold tracking-tight text-slate-900">
              Add New User
            </h2>
            <p className="m-0 mt-1 text-[13px] text-slate-500">
              Invite a new mentee to your Trellis workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
              text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Close size={17} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 px-6 pb-6">
          {["Full Name", "Email Address", "Project"].map((f) => (
            <div key={f}>
              <label className="field-label">{f}</label>
              <input
                placeholder={`Enter ${f.toLowerCase()}`}
                className="input-field"
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={onClose} className="flex-1 sm:flex-none">
            Create User
          </Button>
        </div>
      </div>
    </div>
  );
}
