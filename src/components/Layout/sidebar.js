"use client";


import Link from "next/link";
import Image from "next/image";
import TelnetLogo from "../../../public/telnetLogo.svg";
import { usePathname } from "next/navigation.js";
import MenuSettings from "../Icons/menuSettings.js";
import MenuDashboard from "../Icons/menuDashBoard.js";
import MenuUsers from "../Icons/menuUsers.js";
import MenuOrganization from "../Icons/menuOrganization.js";
import intl from "../../utils/locales/jp/jp.json";
import DeviceSettings from "../Icons/deviceSettings.js";
export default function Sidebar({
  toggleSidebar,
  toggler,
  on,
  isExpandSidebar,
  setIsExpandSidebar,
}) {
  const currentRoute = usePathname();
  const userRoleStr = localStorage.getItem("user");
  const version = JSON.parse(userRoleStr)?.version || "0.0.1"
  const userRole = JSON.parse(userRoleStr);
  const roles = userRole?.role ? JSON.parse(userRole.role) : [];
  const Admin = roles
    ? roles.some((role) => role.toLowerCase() == "admin")
    : false;

  const links = [
    {
      title: intl.layout_sidebar_dashboard_label,
      link: "/dashboard",
      icon: (color) => MenuDashboard(color),
      module: "dashboard",
    },
  ];

  if (Admin) {
    // Add the admin-only sections if 'Admin' is true
    links.push(
      {
        title: intl.layout_sidebar_company_label,
        link: "/company/list",
        icon: (color) => MenuOrganization(color),
        module: "company",
      },
      {
        title: intl.layout_sidebar_user_label,
        link: "/user",
        icon: (color) => MenuUsers(color),
        module: "user",
      },
      {
        title: intl.layout_sidebar_helperSettings_label,
        link: "/help-settings/helpSettingsList",
        icon: (color) => MenuSettings(color),
        module: "help-settings",
      },
      {
        title: intl.machine,
        link: "/devices",
        icon: (color) => DeviceSettings(color),
        module: "devices",
      }
    );
  } else {
    // Add the "user" section for non-admin users
    const userSection = {
      title: intl.layout_sidebar_user_label,
      link: "/user",
      icon: (color) => MenuUsers(color),
      module: "user",
    };
    links.push(userSection);
  }
  function handleOnClick() {
    toggler(false);
  }

  return (
    <div className="w-full bg-white drop-shadow-lg flex flex-col md:justify-between h-full">
      <div className="w-full md:hidden py-4 pr-5">
        <svg
          className="text-2xl ml-auto "
          onClick={on ? toggleSidebar : handleOnClick}
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="14" cy="14" r="14" fill="#F3F3F3" />
          <path
            d="M19.25 7.25012L20.8246 8.82471L9.27759 20.3717L7.70299 18.7971L19.25 7.25012Z"
            fill="#D2D2D2"
          />
          <path
            d="M7.69922 8.2998L9.27381 6.72521L20.8208 18.2722L19.2462 19.8468L7.69922 8.2998Z"
            fill="#D2D2D2"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-4 pr-5 pl-5 md:pb-4 md:pt-4 ">
        {links.map((linkElm, index) => {
          return (
            <div id={`id-${index}`} className="flex gap-2" key={linkElm.title}>
              <Link
                href={linkElm.link}
                onClick={on ? toggleSidebar : handleOnClick}
                className={
                  currentRoute.includes(linkElm.module)
                    ? `flex ${isExpandSidebar
                      ? "flex-grow px-2"
                      : "flex-grow lg:justify-center px-2"
                    } bg-[#dce5ed]  text-[#19388B] rounded py-2  items-center min-h-[40px] max-h-[40px]`
                    : `flex ${isExpandSidebar
                      ? "flex-grow px-2"
                      : "flex-grow lg:justify-center px-2"
                    }  py-2 rounded text-[#817E78] items-center min-h-[40px] max-h-[40px]  hover:bg-[#dce5ed] hover:text-[#19388B]`
                }
              >
                {currentRoute === linkElm.link
                  ? linkElm.icon({ color: "#19388B" })
                  : linkElm.icon({ color: "#817E78" })}
                <div className={`${isExpandSidebar ? "pl-4" : "hidden"}`}>
                  {linkElm.title}
                </div>
                <div className="pl-4 lg:hidden">{linkElm.title}</div>
              </Link>
            </div>
          );
        })}
      </div>
      {isExpandSidebar && (
        <div className="mx-auto pb-[5rem] hidden md:block ">
          <Image src={TelnetLogo} height={17} alt="telnet logo" />
          {/* <a
            href="https://telenet.co.jp/support_ht/" target="_blank"
            className="underline text-[#19388B] mt-8 text-sm hover:text-link"
          >
            ユーザページ
          </a>
          <p
            className="text-[#19388B] text-sm hover:text-link"
          >
            {version}
          </p> */}
        </div>
      )}
    </div>
  );
}
