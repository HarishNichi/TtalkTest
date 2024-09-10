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
import { Modal as AntModal, Button } from "antd";
import UpdatePassword from "@/app/update-password/page";

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
  const [logoutModal, setLogoutModal] = useState(false);
  const [isResetModal, setIsResetModal] = useState(false);
  const handleCloseModal = () => {
    setIsResetModal(false);
  };

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
  const [show, setShow] = useState(false);

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
    toggle(!on);
    toggler(!on);
  }
  useEffect(() => {
    setShow(on || false);
  }, [on]);

  function dropDownIcon() {
    <>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.5203 14.174L8.369 11.023C8.32567 10.9795 8.2915 10.9309 8.2665 10.8773C8.2415 10.8238 8.229 10.7663 8.229 10.705C8.229 10.5825 8.27042 10.476 8.35325 10.3855C8.43609 10.2952 8.54525 10.25 8.68075 10.25H15.3193C15.4548 10.25 15.5639 10.2957 15.6468 10.387C15.7296 10.4782 15.771 10.5846 15.771 10.7063C15.771 10.7368 15.7243 10.8423 15.6308 11.023L12.4798 14.174C12.4074 14.2465 12.3326 14.2994 12.2553 14.3327C12.1779 14.3661 12.0928 14.3828 12 14.3828C11.9072 14.3828 11.8221 14.3661 11.7448 14.3327C11.6674 14.2994 11.5926 14.2465 11.5203 14.174Z"
          fill="white"
        />
      </svg>
    </>;
  }
  return (
    <>
      <div className="w-full bg-header-blue">
        <div
          ref={mobileHeaderRef}
          className="flex justify-between items-center px-5 lg:hidden"
        >
          <span className="lg:hidden" onClick={toggleSidebar}>
            <HeaderTabMenu data-testid="menu-icon" />
          </span>
          <Image
            src={Logo}
            alt="Ptalk logo"
            style={{ width: "100px", paddingTop: "5px", paddingBottom: "5px" }}
          />
          <div className="flex gap-5 lg:hidden">
            <span
              onClick={() => {
                updateState();
              }}
              data-testid="options-icon"
            >
              <HeaderTabOptions />
            </span>
            {show && (
              <>
                <div
                  id="dropdownDelay"
                  className="z-auto absolute right-5 top-16 divide-y divide-gray-100 rounded-xl shadow bg-[#0C4278] text-white "
                  style={{
                    width: "170px",
                    backgroundColor: "white",
                    color: "black",
                    borderRadius: "0px",
                  }}
                  data-testid="options-dropdown"
                  ref={dropdownRef}
                >
                  <ul
                    className="py-2  font-bold text-[14px]"
                    aria-labelledby="dropdownDelayButton"
                    data-testid="dropdown-menu-first"
                  >
                    {!Admin && (
                      <li>
                        <Link
                          href="/update-password"
                          className="block px-4 py-2 hover:text-link border-b  border-[#E7E7E9]"
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
                          setLogoutModal(true);
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
              style={{ marginLeft: "10px", width: "110px" }}
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
                <span
                  className="text-white text-2xl font-bold hover:cursor-pointer"
                  onClick={() => {
                    toggle(!on);
                    toggler(!on);
                  }}
                  data-testid="toggle-button"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.5203 14.174L8.369 11.023C8.32567 10.9795 8.2915 10.9309 8.2665 10.8773C8.2415 10.8238 8.229 10.7663 8.229 10.705C8.229 10.5825 8.27042 10.476 8.35325 10.3855C8.43609 10.2952 8.54525 10.25 8.68075 10.25H15.3193C15.4548 10.25 15.5639 10.2957 15.6468 10.387C15.7296 10.4782 15.771 10.5846 15.771 10.7063C15.771 10.7368 15.7243 10.8423 15.6308 11.023L12.4798 14.174C12.4074 14.2465 12.3326 14.2994 12.2553 14.3327C12.1779 14.3661 12.0928 14.3828 12 14.3828C11.9072 14.3828 11.8221 14.3661 11.7448 14.3327C11.6674 14.2994 11.5926 14.2465 11.5203 14.174Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </div>
              {on && (
                <>
                  <div
                    id="dropdownDelay"
                    className="z-10 absolute right-5  divide-y divide-gray-100  shadow"
                    style={{
                      width: "170px",
                      top: "3.6rem",
                      backgroundColor: "white",
                      color: "black",
                      borderRadius: "0px",
                    }}
                    data-testid="user-menu-dropdown"
                    ref={dropdownRef}
                  >
                    <ul
                      className="py-2   font-bold text-[14px]"
                      aria-labelledby="dropdownDelayButton"
                    >
                      {!Admin && (
                        <li>
                          {/* <Link
                            href="/update-password"
                            className="block px-4 py-2 hover:text-link border-b  border-[#E7E7E9]"
                            onClick={() => {
                              setIsResetModal(true);
                            }}
                          >
                            パスワードリセット
                          </Link> */}
                          <p
                            className="block px-4 py-2 hover:text-link  cursor-pointer"
                            onClick={() => {
                              setIsResetModal(true);
                            }}
                          >
                            パスワードリセット
                          </p>
                        </li>
                      )}
                      <li>
                        <p
                          className="block px-4 py-2 hover:text-link  cursor-pointer"
                          onClick={() => {
                            setLogoutModal(true);
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
            <div className="flex-grow dark:text-black">
              {intl.logout_confirm}
            </div>
          </div>
        </Modal>
      )}

      <AntModal
        open={isResetModal}
        footer={null}
        // fontSize="20"
        // textColor="customBlue"
        // fontWeight="600"
        onCancel={handleCloseModal}
      >
        <div className="flex flex-col">
          {/* <AddUser
            setIsModalOpen={setIsModalOpen}
            setComCreated={setComCreated}
          /> */}
          <UpdatePassword setIsResetModal={setIsResetModal} />
        </div>
      </AntModal>
    </>
  );
}
