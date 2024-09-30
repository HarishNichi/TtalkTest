"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarSubLinks } from "@/utils/constant";

export default function Sidebar({ toggleSidebar }) {
  const currentRoute = usePathname();
  return (
    <div className="w-full bg-white drop-shadow-lg flex flex-col md:justify-between h-full  md:rounded text-base">
      <div className="flex flex-col pr-5 pl-5 pt-4 md:pb-4 ">
        {sidebarSubLinks.map((linkElm, index) => {
          return (
            <div
              id={`id-${index}`}
              className="flex gap-y-6 mb-2"
              key={linkElm.title}
            >
              <Link
                href={linkElm.link}
                className={
                  currentRoute === linkElm.link
                    ? `flex flex-1 bg-[#dce5ed]  text-[#19388B] rounded py-2 px-4 items-center`
                    : "flex flex-1 px-4 py-2 rounded text-[#817E78] items-center  hover:bg-[#F9F9FA] hover:text-[#19388B] "
                }
              >
                <div className="pl-0">{linkElm.title}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
