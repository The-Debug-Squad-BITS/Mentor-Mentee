import { useState, useEffect } from "react";

export default function AssignMentors({ projects, onAssignmentConfirmed }) {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedMentee, setSelectedMentee] = useState("");
  
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);

  const [currentMentor, setCurrentMentor] = useState(null);
  const [currentMentees, setCurrentMentees] = useState([]);

  useEffect(() => {
    // Stubbed until integrated with backend API
    setMentors([]);
    setMentees([]);
  }, [projects]);

  useEffect(() => {
    if (!selectedProject) {
      setCurrentMentor(null);
      setCurrentMentees([]);
      return;
    }
    const proj = projects.find(p => p.id === selectedProject.toString());
    if (proj) {
      setCurrentMentor(proj.mentor);
      setCurrentMentees(proj.mentees || []);
    }
  }, [selectedProject, projects]);

  const selectStyle =
    "w-full p-3 rounded-xl border border-slate-200 outline-none text-sm bg-white focus:border-blue-400 transition-colors";

  const handleAssign = () => {
    if (!selectedProject) return;
    
    // Stubbed until integrated with backend API
    alert("Assignments updated successfully!");
    if (onAssignmentConfirmed) onAssignmentConfirmed();
    setSelectedMentor("");
    setSelectedMentee("");
  };

  return (
    <div
      className="bg-white rounded-2xl p-8 border border-slate-100"
      style={{ boxShadow: "0 2px 16px rgba(59,130,246,0.05)" }}
    >
      <h2 className="m-0 mb-6 text-xl font-black text-slate-800">
        Mentor & Mentee Assignment
      </h2>

      <div className="flex gap-6 flex-wrap lg:flex-nowrap">
        {/* Project Select */}
        <div className="flex-1 min-w-[240px] border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold m-0 mb-4 text-slate-700">
            1. Select Project
          </h3>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className={selectStyle}
            style={{ fontFamily: "inherit" }}
          >
            <option value="">-- Choose Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Mentor: {p.mentorName || "Unassigned"})
              </option>
            ))}
          </select>
        </div>

        {/* Mentor Select */}
        <div className="flex-1 min-w-[240px] border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold m-0 mb-4 text-slate-700">
            2. Assign Mentor
          </h3>
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className={selectStyle}
            style={{ fontFamily: "inherit" }}
          >
            <option value="">-- Select Mentor --</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mentee Select */}
        <div className="flex-1 min-w-[240px] border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold m-0 mb-4 text-slate-700">
            3. Assign Mentee
          </h3>
          <select
            value={selectedMentee}
            onChange={(e) => setSelectedMentee(e.target.value)}
            className={selectStyle}
            style={{ fontFamily: "inherit" }}
          >
            <option value="">-- Select Mentee --</option>
            {mentees.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleAssign}
        className="mt-6 border-0 rounded-xl px-8 py-3.5 font-bold text-sm text-white cursor-pointer hover:bg-blue-600 transition-colors"
        style={{
          background: "#3b82f6",
          boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
          fontFamily: "inherit",
        }}
      >
        Confirm Assignment
      </button>

      {/* Currently Assigned Display */}
      {selectedProject && (
        <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <h3 className="m-0 mb-4 text-xs font-black text-slate-400 uppercase tracking-wider">
            Current Project Assignments
          </h3>
          <div className="flex gap-8 flex-wrap">
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1.5">Assigned Mentor:</span>
              {currentMentor ? (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-xs md:text-sm font-semibold text-slate-800">{currentMentor.name}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic font-medium">No mentor assigned yet.</span>
              )}
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-500 mb-1.5">Assigned Mentees ({currentMentees.length}):</span>
              {currentMentees.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {currentMentees.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-slate-800">{m.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic font-medium">No mentees assigned yet.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
