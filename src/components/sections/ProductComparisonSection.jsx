export default function ProductComparisonSection() {
  const comparisonData = [
    {
      feature: "Mentorship Mapping",
      mentora: "✓ Automated mentor-mentee mapping with strict privacy boundaries.",
      others: "✗ Manual setups needed; users see each other's project folders.",
      highlight: true,
    },
    {
      feature: "Deliverable Reviews & Revisions",
      mentora: "✓ 1-click submission, review, inline feedback & revision cycle.",
      others: "✗ Complex pipelines; no direct revision request status workflow.",
      highlight: true,
    },
    {
      feature: "Student-Friendly UX",
      mentora: "✓ Ultra-simple submission console (Upload files/URL + Notes).",
      others: "✗ Bloated Developer boards (agiles, sprints, story points).",
      highlight: false,
    },
    {
      feature: "Institute Cost Control",
      mentora: "✓ Admin-driven workspace with zero per-student seat licensing fee.",
      others: "✗ Unpredictable monthly costs per seat (huge budget strain).",
      highlight: false,
    },
  ];

  return (
    <section className="border-t border-[#E2DDD8] pt-16 pb-20 px-4 md:px-0">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <p className="text-[11px] font-medium tracking-[0.18em] text-[#B09070] uppercase mb-4">
          Engineered for Academia
        </p>
        <h2 className="font-['Fraunces',serif] font-light text-[32px] md:text-[40px] text-[#1A1714] leading-[1.2] mb-6">
          Why General Project Tools Fail <br />
          <em className="italic text-[#E8B86D]">Institutes & Schools</em>
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#6B6560] max-w-2xl mx-auto">
          Generic project management software is built for developers and corporate teams. 
          Schools and universities face distinct operational hurdles that tools like Jira and ClickUp simply aren't designed to solve.
        </p>
      </div>

      {/* Main comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        {/* Pain points card */}
        <div className="bg-[#1A1714] text-[#F7F4EF] p-8 md:p-10 rounded-[28px] relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-950/50 px-3 py-1 rounded-full">
              The Problem with Jira & ClickUp
            </span>
            <h3 className="font-['Fraunces',serif] text-[26px] font-light mt-6 mb-4 text-white">
              Built for Sprint Cycles, Not Students
            </h3>
            <ul className="flex flex-col gap-4 pl-0 text-[14px] text-stone-400 list-none">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Overwhelming UX:</strong> Agile boards, story points, and sprint logs confuse students and lead to platform abandonment.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Lack of Privacy Control:</strong> Students can accidentally browse other mentees' files and projects.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Manual Review Loops:</strong> No clear process for a mentor to request a student to resubmit files with revision notes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Seat Pricing Traps:</strong> Universities pay exorbitant per-student pricing, making software adoption budget-prohibitive.</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-800 text-[12px] italic text-stone-500 font-medium">
            * Institutes end up relying on fragmented Excel sheets and chaotic email threads instead.
          </div>
        </div>

        {/* Mentora Solution card */}
        <div className="bg-white border border-[#E2DDD8] p-8 md:p-10 rounded-[28px] flex flex-col justify-between hover:border-[#C5BEB8] transition-colors duration-150">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B09070] bg-[#F7F4EF] px-3 py-1 rounded-full">
              The Mentora Solution
            </span>
            <h3 className="font-['Fraunces',serif] text-[26px] font-light mt-6 mb-4 text-[#1A1714]">
              Structured Academic Workflows
            </h3>
            <ul className="flex flex-col gap-4 pl-0 text-[14px] text-[#6B6560] list-none">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Dedicated Dashboards:</strong> Mentors inspect only assigned mentees; Mentees see only their assigned milestones.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Structured Files & Links:</strong> Explicit submission gates for PDFs, mockups, images, and repository URLs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Traceable Audit Loops:</strong> Built-in Approved and Revision Request cycles keep grading histories clear.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Cost Efficient for scale:</strong> Administrators invite unlimited mentees within the organization under simple cost limits.</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 text-[12px] font-semibold text-[#B09070]">
            ✓ Built to map BITS Pilani projects and academic mentorship models.
          </div>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="max-w-4xl mx-auto bg-white border border-[#E2DDD8] rounded-[24px] overflow-hidden shadow-sm shadow-slate-100">
        <div className="px-6 py-4.5 bg-slate-50 border-b border-[#E2DDD8]">
          <h4 className="m-0 text-[14px] font-bold text-[#1A1714] uppercase tracking-wider">
            Feature Comparison Matrix
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E2DDD8]">
                <th className="px-6 py-4 text-left text-[12px] font-bold text-stone-500 uppercase tracking-wide">
                  Capability
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-bold text-[#B09070] bg-[#F7F4EF]/50 uppercase tracking-wide">
                  Mentora
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-bold text-stone-500 uppercase tracking-wide">
                  Jira & ClickUp
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-slate-100 hover:bg-slate-50/40 transition-colors last:border-none ${
                    row.highlight ? "bg-[#F7F4EF]/10" : ""
                  }`}
                >
                  <td className="px-6 py-4 text-[13px] font-bold text-[#1A1714]">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-emerald-700 font-medium">
                    {row.mentora}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-stone-500 font-medium">
                    {row.others}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
