import { features } from "../../data/landingData";

export default function FeaturesSection() {
  return (
    <section className="border-t border-[#E2DDD8] pt-10 pb-14 px-4 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20">
      <p className="text-[11px] font-medium tracking-[0.18em] text-[#B09070] uppercase mb-4 text-center">
        Why us?
      </p>
      <h2 className="font-['Fraunces',serif] font-light text-[26px] sm:text-[30px] md:text-[36px] text-[#1A1714] text-center mb-8 md:mb-12 leading-[1.2]">
        Everything you need to <em className="italic text-[#E8B86D]">grow.</em>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-[#E2DDD8] rounded-2xl p-5 md:p-6"
          >
            <div className="w-10 h-10 bg-[#F7F4EF] border border-[#E2DDD8] rounded-[10px] flex items-center justify-center text-[18px] mb-5 text-[#B09070]">
              {f.icon}
            </div>
            <h3 className="text-[16px] font-medium text-[#1A1714] mb-2.5">
              {f.title}
            </h3>
            <p className="text-[14px] text-[#7A736C] leading-[1.65]">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
