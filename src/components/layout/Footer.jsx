import { StarIcon } from "../ui/Icons";
import { footerLinks } from "../../data/landingData";

export default function Footer() {
  return (
    // <footer className="border-t border-stone-200 py-6 flex items-center justify-between flex-wrap gap-3">
    //   <div className="flex items-center gap-2">
    //     <div className="w-6 h-6 bg-amber rounded-md flex items-center justify-center">
    //       <StarIcon size={10} />
    //     </div>
    //     <span className="text-xs text-stone-500">
    //       © 2025 Mentora. All rights reserved.
    //     </span>
    //   </div>

    //   <div className="flex gap-5">
    //     {footerLinks.map((item) => (
    //       <a
    //         key={item}
    //         href="#"
    //         className="text-xs text-stone-500 border-b border-transparent hover:text-ink hover:border-stone-300 transition-all duration-150"
    //       >
    //         {item}
    //       </a>
    //     ))}
    //   </div>
    // </footer>

    <footer className="border-t border-[#E2DDD8] py-6 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[#E8B86D] rounded-md flex items-center justify-center">
          <StarIcon size={10} />
        </div>
        <span className="text-[13px] text-[#9C948C]">
          © 2026 Mentora. All rights reserved.
        </span>
      </div>

      <div className="flex gap-5">
        {footerLinks.map((item) => (
          <a
            key={item}
            href="#"
            className="text-[13px] text-[#9C948C] no-underline transition-colors duration-150 hover:text-[#1A1714]"
          >
            {item}
          </a>
        ))}
      </div>
    </footer>
  );
}
