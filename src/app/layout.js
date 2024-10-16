"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/redux/provider";
import Header from "@/components/Layout/header";
import Sidebar from "@/components/Layout/sidebar";
import SearchInput from "@/components/Layout/search";
import useToggle from "@/utils/hooks/useToggle";
import { usePathname, useRouter } from "next/navigation";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import intl from "@/utils/locales/jp/jp.json";
import ProtectedRoute from "@/utils/auth";
import "react-toastify/dist/ReactToastify.css";
import localStorage from "redux-persist/es/storage";
import { ToastContainer, toast } from "react-toastify";
import api from "@/utils/api";

const natoSans = Noto_Sans_JP({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const router = usePathname();
  const routerPath = useRouter();
  const [user, setUser] = useState(null);
  const [path, setPath] = useState(routerPath);
  const [Auth, setAuth] = useState(true);
  const [on, hideAndShowSidebar] = useToggle(false);
  const [searchPanelOnMobile, setSearchPanelOnMobile] = useToggle(false);
  const [compName, setCompName] = useState("");
  const [userId, setUserId] = useState("");
  const [pttNo, setPttNo] = useState("");
  const [salesChannel, setSalesChannel] = useState("");
  const [device, setDevice] = useState("");
  const [isToggler, toggler] = useState(false);
  const [isExpandSidebar, setIsExpandSidebar] = useToggle(true);

  const bgStyle = {
    backgroundColor: "#E5E5E5",
  };
  useEffect(() => {
    getLocalValues();
  }, [router]);
  async function getLocalValues() {
    const UserData = await localStorage.getItem("user");
    const auth = await localStorage.getItem("accessToken");
    let isAuthenticated = auth || false;
    setAuth(isAuthenticated);
    setUser(UserData);
    setPath(routerPath);
  }
  let Admin = true;
  if (user) {
    const LoginUser = user ? JSON.parse(user) : "";
    const roles = LoginUser?.role ? JSON.parse(LoginUser.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
  }

  function getIconWithClass(cls) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0161 9.1667C10.6485 8.29789 11.0218 7.22781 11.0218 6.07129C11.0218 3.16365 8.66481 0.806641 5.75733 0.806641C2.84967 0.806641 0.492676 3.16359 0.492676 6.07129C0.492676 8.97873 2.84963 11.3357 5.75733 11.3357C6.91399 11.3357 7.98413 10.9624 8.85288 10.33L11.9607 13.4378C12.2821 13.7592 12.8032 13.7605 13.1249 13.4388C13.4486 13.1151 13.4447 12.5952 13.124 12.2746C13.124 12.2746 13.1239 12.2745 13.124 12.2746L10.0161 9.1667ZM9.61808 9.19293C9.61811 9.19289 9.61805 9.19298 9.61808 9.19293C9.68154 9.11453 9.74253 9.03403 9.8012 8.95179C10.3808 8.13946 10.7218 7.14517 10.7218 6.07129C10.7218 3.32932 8.49912 1.10664 5.75733 1.10664C3.01536 1.10664 0.792676 3.32928 0.792676 6.07129C0.792676 8.81304 3.01531 11.0357 5.75733 11.0357C6.94009 11.0357 8.02624 10.6222 8.87896 9.93182L12.1728 13.2257C12.3776 13.4304 12.7087 13.4307 12.9128 13.2266C13.1183 13.0211 13.1165 12.6912 12.9118 12.4867L9.61808 9.19293ZM5.75724 9.69069C7.75614 9.69069 9.37664 8.07019 9.37664 6.07129C9.37664 4.07231 7.75614 2.45189 5.75724 2.45189C3.75825 2.45189 2.13784 4.0723 2.13784 6.07129C2.13784 8.0702 3.75825 9.69069 5.75724 9.69069ZM9.67664 6.07129C9.67664 8.23588 7.92182 9.99069 5.75724 9.99069C3.59256 9.99069 1.83784 8.23588 1.83784 6.07129C1.83784 3.90662 3.59256 2.15189 5.75724 2.15189C7.92182 2.15189 9.67664 3.90662 9.67664 6.07129Z"
          fill="white"
          stroke="#ffffff"
        />
      </svg>
    );
  }

  useEffect(() => {
    if (
      !Auth &&
      router != "/" &&
      router != "/forgot" &&
      router != "/terms" &&
      router != "/privacy"
    ) {
      // Perform redirection on the client side
      window.location.href = "/";
    }
  }, [Auth]);

  // Check if the route is unprotected
  const isUnprotectedRoute =
    router === "/" ||
    router === "/forgot" ||
    router === "/reset" ||
    router === "/terms" ||
    router === "/privacy";

  if (isUnprotectedRoute) {
    // Render the unprotected routes without layout
    return (
      <html lang="en">
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          ></meta>
        </head>
        <body className={natoSans.className} style={natoSans.style}>
          <Providers>
            <ProtectedRoute allowedRoles={[]}>{children} </ProtectedRoute>
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
      </head>
      <body className={natoSans.className} style={natoSans.style}>
        <Providers>
          <div className="w-full bg-[#F9F9FA]">
            <div className="w-full fixed z-10 top-0 ">
              <Header
                toggleSidebar={(flag) => {
                  hideAndShowSidebar((prev) => flag);
                }}
                setSearchPanelOnMobile={setSearchPanelOnMobile}
                isToggler={isToggler}
                toggler={toggler}
                setIsExpandSidebar={setIsExpandSidebar}
              />
            </div>
            <div className="flex bg-[#F9F9FA]">
              {on && (
                <div className=" w-full lg:w-1/5 h-screen fixed lg:hidden z-50">
                  <Sidebar toggleSidebar={hideAndShowSidebar} on={on} />
                </div>
              )}
              <div
                className="hidden lg:block w-full h-screen fixed duration-300 mt-[56px]"
                style={{
                  width: isExpandSidebar ? "20%" : "80px",
                  transition: "auto",
                }}
              >
                <Sidebar
                  on={on}
                  toggler={toggler}
                  isExpandSidebar={isExpandSidebar}
                  setIsExpandSidebar={setIsExpandSidebar}
                />
              </div>
              <div
                className={`w-full lg:flex-1 lg:pl-[20%] min-h-[calc(100vh)] max-h-full  bg-[#F9F9FA] duration-300 ${
                  isExpandSidebar ? "lg:pl-[20%]" : "lg:pl-[80px]"
                }`}
                style={{
                  transition: "auto",
                }}
              >
                <main className="pt-[96px] px-[24px]  py-[40px] h-full">
                  <div className="rounded flex flex-col  flex-grow  h-full">
                    <ProtectedRoute allowedRoles={["admin", "organization"]}>
                      {children}
                    </ProtectedRoute>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
