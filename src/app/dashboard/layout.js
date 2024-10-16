"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import DashboardSearch from "@/components/Button/dashboardSearch";
import { usePathname, useRouter } from "next/navigation";
import SearchInput from "@/components/Layout/search";
import intl from "@/utils/locales/jp/jp.json";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import { searchEmployee } from "@/redux/features/employee";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import {
  EmployeeSearchLimit,
  code,
  dashboardLinks,
  maxLimit,
} from "@/utils/constant";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import DynamicLabel from "@/components/Label/dynamicLabel";
import Breadcrumb from "@/components/Layout/breadcrumb";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const LayoutContext = createContext();

export const useLayoutContext = () => useContext(LayoutContext);

export default function DashboardLayout({ children }) {
  const router = usePathname();
  const routerPath = useRouter();
  const [tabResetProp, setTabResetProp] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const UserData = useAppSelector((state) => state.userReducer.user);
  const [compName, setCompName] = useState("");
  const [userId, setUserId] = useState("");
  const [pttNo, setPttNo] = useState("");
  const [salesChannel, setSalesChannel] = useState("");
  const [device, setDevice] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchPanelOnMobile, setSearchPanelOnMobile] = useState(false);
  const [companyListDropdown, setCompanyListDropdown] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const dispatch = useAppDispatch();
  const [showResult, setShowResult] = useState(false);
  let Admin = false;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : null;
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
  }
  useEffect(() => {
    !isSidebarVisible && setIsSidebarVisible(true);
  }, [tabResetProp]);

  useEffect(() => {
    if (router == "/dashboard/search-result") {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [router]);

  function clickHere(v) {
    setIsSidebarVisible(v);
  }
  function getIconWithClass(cls) {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.51955 15.6153C7.81188 15.6153 6.36571 15.023 5.18105 13.8385C3.99655 12.6538 3.4043 11.2077 3.4043 9.50002C3.4043 7.79235 3.99655 6.34618 5.18105 5.16152C6.36571 3.97702 7.81188 3.38477 9.51955 3.38477C11.2272 3.38477 12.6734 3.97702 13.858 5.16152C15.0425 6.34618 15.6348 7.79235 15.6348 9.50002C15.6348 10.2142 15.515 10.8963 15.2753 11.5463C15.0355 12.1963 14.7155 12.7616 14.3155 13.2423L20.0695 18.9963C20.208 19.1346 20.2789 19.3086 20.282 19.5183C20.2852 19.7279 20.2144 19.9052 20.0695 20.05C19.9247 20.1948 19.749 20.2673 19.5425 20.2673C19.3362 20.2673 19.1606 20.1948 19.0158 20.05L13.2618 14.296C12.7618 14.7088 12.1868 15.0319 11.5368 15.2653C10.8868 15.4986 10.2144 15.6153 9.51955 15.6153ZM9.51955 14.1155C10.808 14.1155 11.8994 13.6683 12.7935 12.774C13.6879 11.8798 14.135 10.7885 14.135 9.50002C14.135 8.21152 13.6879 7.12018 12.7935 6.22601C11.8994 5.33168 10.808 4.88452 9.51955 4.88452C8.23105 4.88452 7.13971 5.33168 6.24555 6.22601C5.35121 7.12018 4.90405 8.21152 4.90405 9.50002C4.90405 10.7885 5.35121 11.8798 6.24555 12.774C7.13971 13.6683 8.23105 14.1155 9.51955 14.1155Z"
          fill="#214BB9"
        />
      </svg>
    );
  }
  let offsetSearch = "null";
  let allEmpSearchData = [];
  async function searchDashboard() {
    toast.dismiss();
    localStorage.setItem("searchEmployee", []);
    try {
      setLoading(true);
      const payload = {
        employeeId: userId || "null",
        organization: compName || "null",
        radio: pttNo || "null",
        device: device || "null",
        sales: salesChannel || "null",
        limit: EmployeeSearchLimit,
        offset: offsetSearch,
      };
      let { data: response } = await api.post("employees/search", payload);
      if (response.data.offset != "end") {
        allEmpSearchData = [...allEmpSearchData, ...response.data.Items];
        offsetSearch = response.data.offset;
        payload.offset = offsetSearch;
        searchDashboard();
      }

      if (response.data.offset == "end") {
        const machineList = await fetchDevice();
        allEmpSearchData = [...allEmpSearchData, ...response.data.Items];
        setLoading(false);
        response = allEmpSearchData.map((org, index) => {
          return {
            key: index,
            id: org.id,
            radioNumber: org.pttNo,
            userId: org.id,
            email: org.accountDetail.employee.emailId || "-",
            organization: org.organizationName || "-",
            name: org.name || "-",
            salesChannel: org.salesChannel || "-",
            numberOfRadioNumber: org.licenseCount || "-",
            status: org?.accountDetail?.employee?.status || "unknown",
            onlineStatus: org?.onlineStatus || "offline",
            isActive: org?.isActive,
            timestamp: new Date().getTime(),
            machine:
              org.accountDetail.employee?.machine?.id &&
              machineList.includes(org.accountDetail.employee?.machine?.id)
                ? org.accountDetail.employee?.machine.name + " - 期限切れ"
                : org.accountDetail.employee?.machine?.name || "-",
            link: "/user-details",
          };
        });
        setSearchData(response);
        localStorage.setItem("searchEmployee", JSON.stringify(response));
        await dispatch(searchEmployee(response));
        offsetSearch = "null";
        allEmpSearchData = [];
        routerPath.push("/dashboard/search-result");
      }
    } catch (error) {
      setLoading(false);
      toast(
        error.response?.data?.status?.message
          ? error.response?.data?.status?.message
          : error?.response?.data?.message,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          type: "error",
        }
      );
    }
  }

  const fetchDevice = async () => {
    toast.dismiss();
    let deviceListMap = [];
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
        },
      };
      const response = await api.get("devices/list", params);
      setLoading(false);
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        let today = data?.todayDatetodayDate || dayjs().format("YYYY-MM-DD");
        data.Items.map((item) => {
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            if (!futureDate) {
              let isValid =
                dayjs(today).isSameOrBefore(item.endDate) &&
                dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                deviceListMap.push(item.id);
              }
            }
          }
        });
        return deviceListMap;
      }
    } catch (error) {
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoading(true);
        let { data: projectionList } = await api.post(
          "organizations/projection",
          {}
        );
        setCompanyListDropdown(() => projectionList.data.Items);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    Admin && fetchOrg();
  }, []);
  return (
    <>
      <LayoutContext.Provider value={{ searchDashboard }}>
        {loading && <LoaderOverlay />}
        {showResult && (
          <>
            <div className="mb-[16px]">
              <Breadcrumb links={dashboardLinks} />
            </div>
            <div className="flex mb-[16px]">
              <DynamicLabel
                text={intl.search_results}
                alignment="text-center"
                fontSize="text-[20px]"
                fontWeight="font-semibold"
                textColor="#000000"
                disabled={false}
              />
            </div>
          </>
        )}
        {Admin && (
          <form
            className="w-full  hidden lg:flex gap-2 flex-wrap flex-shrink-0 flex-grow-0 py-2 rounded-xl mb-2 md:mx-auto md:justify-center lg:justify-normal pt-0"
            onSubmit={(e) => {
              e.preventDefault();
              searchDashboard();
            }}
          >
            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <SearchInput
                placeholder={intl.company_list_company_radioNumber}
                onInput={setPttNo}
                value={pttNo}
              />
            </div>
            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <SearchInput
                placeholder={intl.user_userId_label}
                onInput={setUserId}
                value={userId}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <input
                list="company_search"
                name="company_search"
                className={`w-full border flex  text-[16px]  p-2 border-[#E7E7E9]  rounded focus:outline-none placeholder-[#85868B] 
        placeholder:text-center placeholder:text-[16px]  md:placeholder:text-left md:placeholder:pl-0
        dark:text-black h-[40px]`}
                placeholder={intl.company_list_company_name}
                onInput={(e) => setCompName(e.target.value)}
                value={compName}
              />
              <datalist id="company_search">
                {companyListDropdown.length > 0 &&
                  companyListDropdown.map((item) => {
                    return <option value={item.name} key={item.value}></option>;
                  })}
              </datalist>
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <SearchInput
                placeholder={intl.form_component_sales_channel}
                onInput={setSalesChannel}
                value={salesChannel}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <SearchInput
                placeholder={intl.machine_name}
                onInput={setDevice}
                value={device}
              />
            </div>

            <div className="w-full md:w-[calc(100%-10px)]  lg:w-[100px]   xl:flex xl:flex-1">
              <DashboardSearch
                text={intl.dashboard_layout_search_btn}
                textColor={
                  "w-full  text-[#214BB9] font-[600] text-[16px] w-full px-6 rounded"
                }
                py={"py-2"}
                px={""}
                bgColor={"bg-white "}
                textBold={true}
                icon={() => getIconWithClass("")}
                onClick={() => {
                  searchDashboard();
                }}
              />
            </div>
          </form>
        )}
        {!Admin && (
          <form
            className="w-full  hidden lg:flex gap-2 flex-wrap flex-shrink-0 flex-grow-0 py-2  rounded-xl mb-2 md:mx-auto md:justify-center lg:justify-normal pt-0"
            onSubmit={(e) => {
              e.preventDefault();
              searchDashboard();
            }}
          >
            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <SearchInput
                placeholder={intl.company_list_company_radioNumber}
                onInput={setPttNo}
                value={pttNo}
              />
            </div>
            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <SearchInput
                placeholder={intl.user_userId_label}
                onInput={setUserId}
                value={userId}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
              <SearchInput
                placeholder={intl.machine_name}
                onInput={setDevice}
                value={device}
              />
            </div>

            <div className="w-full md:w-[calc(100%-10px)]  lg:w-[144px]   xl:flex xl:flex-1">
              <DashboardSearch
                text={intl.dashboard_layout_search_btn}
                textColor={
                  "w-full text-[#214BB9] font-medium text-[16px] w-full px-6 rounded-lg"
                }
                py={"py-2"}
                px={""}
                bgColor={"bg-customBlue  hover:bg-[#214BB9]"}
                textBold={true}
                icon={() => getIconWithClass("")}
                onClick={() => {
                  searchDashboard();
                }}
              />
            </div>
          </form>
        )}
        {searchPanelOnMobile && Admin && (
          <form
            className="md:w-[96%] w-[92%] bg-white flex lg:hidden gap-2 flex-wrap flex-shrink-0 flex-grow-0  py-6 px-5 rounded-xl mb-4 md:mx-auto md:justify-center lg:justify-normal absolute z-20"
            onSubmit={(e) => {
              e.preventDefault();
              searchDashboard();
            }}
          >
            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.company_list_company_name}
                onInput={setCompName}
                value={compName}
              />
            </div>
            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.user_userId_label}
                onInput={setUserId}
                value={userId}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.company_list_company_radioNumber}
                onInput={setPttNo}
                value={pttNo}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.form_component_sales_channel}
                onInput={setSalesChannel}
                value={salesChannel}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.machine_name}
                onInput={setDevice}
                value={device}
              />
            </div>
            <div className="w-full md:w-[calc(100%-10px)] sm:float-right ">
              <DashboardSearch
                text={intl.dashboard_layout_search_btn}
                textColor={
                  "w-full text-[#214BB9] font-medium text-[16px] w-full px-6 rounded-lg"
                }
                py={"py-2"}
                px={""}
                bgColor={"bg-customBlue  hover:bg-[#214BB9]"}
                textBold={true}
                icon={() => getIconWithClass("")}
                onClick={() => {
                  setSearchPanelOnMobile(false);
                  searchDashboard();
                }}
              />
            </div>
          </form>
        )}
        {searchPanelOnMobile && !Admin && (
          <form
            className="md:w-[96%] w-[92%] bg-white  flex lg:hidden gap-2 flex-wrap flex-shrink-0 flex-grow-0  py-6 px-5 rounded-xl mb-4 md:mx-auto md:justify-center lg:justify-normal absolute z-20"
            onSubmit={(e) => {
              e.preventDefault();
              searchDashboard();
            }}
          >
            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.company_list_company_radioNumber}
                onInput={setPttNo}
                value={pttNo}
              />
            </div>
            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.user_userId_label}
                onInput={setUserId}
                value={userId}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.machine_name}
                onInput={setDevice}
                value={device}
              />
            </div>
            <div className="w-full md:w-[calc(100%-10px)] sm:float-right ">
              <DashboardSearch
                text={intl.dashboard_layout_search_btn}
                textColor={
                  "w-full text-[#214BB9] font-medium text-[16px] w-full px-6 rounded-lg"
                }
                py={"py-2"}
                px={""}
                bgColor={"bg-customBlue  hover:bg-[#214BB9]"}
                textBold={true}
                icon={() => getIconWithClass("")}
                onClick={() => {
                  setSearchPanelOnMobile(false);
                  searchDashboard();
                }}
              />
            </div>
          </form>
        )}
        <div className="lg:hidden flex mb-2">
          <span className="w-full md:w-[160px]">
            <DashboardSearch
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-[#214BB9] font-medium text-[16px] w-full px-6 rounded-lg"
              }
              py={"py-2"}
              px={""}
              bgColor={"bg-customBlue hover:bg-[#214BB9]"}
              textBold={true}
              icon={() => getIconWithClass("")}
              onClick={() => {
                setSearchPanelOnMobile(true);
              }}
            />
          </span>
        </div>
        <div className="m-w-[1400] flex flex-col flex-1 h-full ">
          {children}
        </div>
      </LayoutContext.Provider>
    </>
  );
}
