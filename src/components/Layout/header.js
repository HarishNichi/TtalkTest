"use client";

import Image from "next/image";
import Logo from "../../../public/Ttalk-logo.png";
import { RxCaretDown } from "react-icons/rx";
import Link from "next/link";
import HeaderTabSearch from "../../components/Icons/headerTabSearch";
import HeaderTabOptions from "../Icons/headerTabOptions";
import HeaderTabMenu from "../Icons/headerTabMenu";
import useToggle from "../../utils/hooks/useToggle";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import SidebarExpansion from "../Icons/sidebarExpansion";
import intl from "@/utils/locales/jp/jp.json";
import Modal from "@/components/Modal/modal";
import IconLeftBtn from "@/components/Button/iconLeftBtn";

export default function Header({
  toggleSidebar,
  setSearchPanelOnMobile,
  isToggler,
  toggler,
  isExpandSidebar,
  setIsExpandSidebar,
}) {
  /**
   * Toggle hook
   * @param {boolean} initialValue
   * @returns {boolean}
   */

  const [on, toggle] = useToggle(isToggler);
  const pathname = usePathname();
  const isDashboardRoute = pathname === "/dashboard";
  // Retrieve the user string from localStorage
  const userString = localStorage.getItem("user");
  const [logoutModal,setLogoutModal] = useState(false)

  // Convert the user string back to an object using JSON.parse()
  const user = JSON.parse(userString);
  const roleArray = user ? JSON.parse(user?.role) : [0];
  const logo = user?.logo || "";
  const roles = user?.role ? JSON.parse(user.role) : [];
  const Admin = roles
    ? roles.some((role) => role.toLowerCase() == "admin")
    : false;

  const headerRef = useRef(null);
  const mobileHeaderRef = useRef(null);
  const dropdownRef = useRef(null);
  const [show,setShow] = useState(false)

  useEffect(() => {
    toggle(isToggler);
  }, [isToggler]);

  useEffect(() => {

    function handleOutsideClick(event) {
      const targetElement = event.target || event.srcElement;
      const isMobile = window.innerWidth <= 768;
      if (
        headerRef.current &&
        !headerRef.current.contains(targetElement) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) && 
        !isMobile
      ) {
        toggle(false);
        // Close the dropdown here
      }
      if (
        mobileHeaderRef.current &&
        !mobileHeaderRef.current.contains(targetElement) &&
        isMobile
      ) {
        toggle(false);
        // Close the dropdown here
      }
    }

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);
  function updateState() {
    toggle(!on)
    toggler(!on);
  }
  useEffect(()=>{
    setShow(on||false)
  },[on])
  return (
    <>
    <div className="w-full bg-header-blue">
      <div ref={mobileHeaderRef} className="flex justify-between items-center px-5 lg:hidden">
        <span className="lg:hidden" onClick={toggleSidebar}>
          <HeaderTabMenu data-testid="menu-icon" />
        </span>
        <Image
          src={Logo}
          alt="Ptalk logo"
          style={{ width: "100px", paddingTop: "5px", paddingBottom: "5px" }}
        />
        <div className="flex gap-5 lg:hidden">
          <span onClick={() => {
             updateState();
          }
            } data-testid="options-icon">
            <HeaderTabOptions />
          </span>
          {show && (
            <>
              <div
                id="dropdownDelay"
                className="z-auto absolute right-5 top-16 divide-y divide-gray-100 rounded-xl shadow bg-[#0C4278] text-white "
                style={{
                  width: "170px",
                }}
                data-testid="options-dropdown"
                ref={dropdownRef}
              >
                <ul
                  className="py-2 pl-2 font-bold text-[14px]"
                  aria-labelledby="dropdownDelayButton"
                  data-testid="dropdown-menu-first"
                >
                  {!Admin && (
                    <li>
                      <Link
                        href="/update-password"
                        className="block px-4 py-2 hover:text-link"
                        onClick={() => {
                          toggle(false);
                          toggler(false);
                        }}
                      >
                        パスワードリセット
                      </Link>
                    </li>
                  )}

                  <li>
                    <p
                      className="block px-4 py-2 hover:text-link cursor-pointer"
                      onClick={() => {
                        setLogoutModal(true)
                      }}
                    >
                      ログアウト
                    </p>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
      <div
        className="hidden lg:flex py-1 items-center justify-between ml-[26px]"
        ref={headerRef}
      >
        <span className="flex items-center">
          <span
            className="cursor-pointer"
            onClick={() => {
              setIsExpandSidebar();
              toggle(false);
            }}
          >
            <SidebarExpansion />
          </span>
          <Image
            src={Logo}
            alt="Ptalk"
            style={{ marginLeft: "55px", width: "110px" }}
          />
        </span>
        <div>
          <div className="flex items-center gap-4 pr-4">
            {logo && (
              <div
                style={{
                  borderRadius: "50%",
                  background: "#D9D9D9",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <img
                  src={logo}
                  className="avatar-img-custom"
                  style={{ width: "40px", height: "40px" }}
                />
              </div>
            )}
            {!logo && (
              <div
                className="bg-zinc-300	 w-10 h-10 rounded-full p-5"
                data-testid="user-avatar"
              ></div>
            )}
            <div className="flex flex-col gap-0">
              <h3 className="text-[16px] text-white font-semibold tracking-widest">
                {user?.name ? user.name : ""}
              </h3>
            </div>
            <div
              className={`${on ? "bg-[#0C4278] rounded-lg p-2" : "p-2"}`}
              data-testid="user-menu"
            >
              <span className="sr-only">Open main menu</span>
              <RxCaretDown
                className="text-white text-2xl font-bold"
                onClick={() => {
                  toggle(!on);
                  toggler(!on);
                }}
                data-testid="toggle-button"
              />
            </div>
            {on && (
              <>
                <div
                  id="dropdownDelay"
                  className="z-10 absolute right-5  divide-y divide-gray-100 rounded-xl shadow bg-[#0C4278] text-white"
                  style={{
                    width: "170px",
                    top: "4.5rem",
                  }}
                  data-testid="user-menu-dropdown"
                  ref={dropdownRef}
                >
                  <ul
                    className="py-2  pl-2 font-bold text-[14px]"
                    aria-labelledby="dropdownDelayButton"
                  >
                    {!Admin && (
                      <li>
                        <Link
                          href="/update-password"
                          className="block px-4 py-2 hover:text-link"
                          onClick={() => {
                            toggle(false);
                            toggler(false);
                          }}
                        >
                          パスワードリセット
                        </Link>
                      </li>
                    )}
                    <li>
                      <p
                        className="block px-4 py-2 hover:text-link  cursor-pointer"
                        onClick={() => {
                          setLogoutModal(true)
                        }}
                      >
                        ログアウト
                      </p>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
     {logoutModal && (
      <Modal
        height="250px"
        fontSize="text-xl"
        fontWeight="font-semibold"
        textColor="#19388B"
        text={"ログアウト"}
        onCloseHandler={setLogoutModal}
        modalFooter={() => {
          return (
            <div className=" flex justify-between">
              <div>
                <IconLeftBtn
                  text={intl.user_remote_wipe_no_btn}
                  textColor={"text-white font-semibold text-sm w-full"}
                  py={"py-[11px]"}
                  px={"px-[26.5px] md:px-[35.5px]"}
                  bgColor={"bg-customBlue"}
                  textBold={true}
                  icon={() => {
                    return null;
                  }}
                  onClick={() => {
                    setLogoutModal(() => false);
                  }}
                />
              </div>
              <div>
                <IconLeftBtn
                  text={intl.user_remote_wipe_yes_btn}
                  textColor={"text-white font-semibold text-sm w-full ml-2"}
                  py={"py-[11px]"}
                  px={"px-[30.5px] md:px-[38.5px]"}
                  bgColor={"bg-customBlue"}
                  textBold={true}
                  icon={() => {
                    return null;
                  }}
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                    // Clear navigation history
                    
                    window.history.replaceState(null, "", "/");
                    setLogoutModal(false);
                  }}
                />
              </div>
            </div>
          );
        }}
      >
        <div className="flex flex-col">
          <div className="flex-grow py-[90px] pt-[60px] dark:text-black">
            {intl.logout_confirm} 
          </div>
        </div>
      </Modal>
    )}
    </>
  );
}
