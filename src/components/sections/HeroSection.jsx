import { useNavigate } from "react-router-dom";
import { ArrowRight } from "../ui/Icons";
import { stats } from "../../data/landingData";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section>
      <p className="text-[11px] font-medium tracking-[0.18em] text-[#B09070] uppercase mb-5">
        Streamline Organizational Growth
      </p>

      <h1 className="font-['Fraunces',serif] font-light text-[50px] leading-[1.1] text-[#1A1714] mb-6 max-w-130">
        Accelerate collaboration between mentors & <em className="italic text-[#E8B86D]">mentees.</em>
      </h1>

      <p className="text-[15px] leading-[1.7] text-[#6B6560] max-w-120 mb-9">
        Mentora is the professional workspace designed for organizations to plan milestones,
        manage task submissions, track logs, and review deliverables with absolute clarity.
      </p>

      <div className="flex gap-3 flex-wrap mb-14">
        <button
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E8B86D] text-[#1A1714] rounded-full text-[14px] font-medium border-none cursor-pointer transition-[background] duration-150 font-['DM_Sans',sans-serif] hover:bg-[#D4A45A] shadow-sm shadow-[#E8B86D]/20"
          onClick={() => navigate("/login")}
        >
          Explore Platform
        </button>
        <button
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#1A1714] rounded-full text-[14px] font-medium border border-[#E2DDD8] cursor-pointer transition-[border-color,background] duration-150 font-['DM_Sans',sans-serif] hover:border-[#C5BEB8] hover:bg-[#FDFCFB]"
          onClick={() => navigate("/signup")}
        >
          Register Workspace <ArrowRight />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 max-w-2xl">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#E2DDD8] rounded-2xl p-6 hover:border-[#C5BEB8] transition-colors duration-150"
          >
            <p className="text-[11px] font-medium tracking-[0.14em] text-[#B09070] uppercase mb-3.5">
              {s.label}
            </p>
            <p className="font-['Fraunces',serif] text-[36px] font-light text-[#1A1714] leading-none">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
