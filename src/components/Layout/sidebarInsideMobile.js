"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarSubLinks } from "@/utils/constant";

export default function Sidebar({ toggleSidebar, setIsSidebarVisible }) {
  const currentRoute = usePathname();
  return (
    <div className="w-full  flex flex-col md:justify-between h-full  md:rounded">
      <div className="flex flex-col  pt-4 md:pb-4 gap-y-2 ">
        {sidebarSubLinks.map((linkElm, index) => {
          return (
            <div
              id={`id-${index}`}
              className="flex justify-center gap-y-3 rounded-lg drop-shadow-sidebar"
              key={linkElm.title}
            >
              <Link
                onClick={() => setIsSidebarVisible(false)}
                href={linkElm.link}
                className={
                  currentRoute === linkElm.link
                    ? `flex flex-1 bg-[#19388B] bg-opacity-[0.17]  text-[#19388B] font-bold rounded-lg py-2 px-4 items-center justify-center`
                    : "flex flex-1 bg-white px-4 py-2  rounded-lg  text-[#848484]  font-medium items-center justify-center  hover:bg-[#19388B] hover:text-[#19388B] "
                }
              >
                <div className="pl-0 ">{linkElm.title}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
