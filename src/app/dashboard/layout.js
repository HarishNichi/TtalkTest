"use client";

import React, { useState, useEffect } from "react";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import { usePathname, useRouter } from "next/navigation";
import SearchInput from "@/components/Layout/search";
import intl from "@/utils/locales/jp/jp.json";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import { searchEmployee } from "@/redux/features/employee";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { EmployeeSearchLimit, code, dashboardLinks, maxLimit } from "@/utils/constant";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import DynamicLabel from "@/components/Label/dynamicLabel";
import Breadcrumb from "@/components/Layout/breadcrumb";
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

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
  let Admin = false;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : null;
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
  }
  useEffect(() => {
    !isSidebarVisible && setIsSidebarVisible(true);
  }, [tabResetProp]);

  function clickHere(v) {
    setIsSidebarVisible(v);
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
            name: org.accountDetail.employee.userName,
            salesChannel: org.salesChannel || "-",
            numberOfRadioNumber: org.licenseCount || "-",
            status: org?.accountDetail?.employee?.status || "unknown",
            onlineStatus: org?.onlineStatus || "offline",
            timestamp: new Date().getTime(),
            machine: org.accountDetail.employee?.machine?.id &&
              machineList.includes(org.accountDetail.employee?.machine?.id) ? org.accountDetail.employee?.machine.name + " - 期限切れ" : org.accountDetail.employee?.machine?.name || "-",
            link: "/user/details",
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
        let today = data?.todayDatetodayDate || dayjs().format('YYYY-MM-DD')
        data.Items.map((item) => {
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            if (!futureDate) {
              let isValid = dayjs(today).isSameOrBefore(item.endDate) && dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                deviceListMap.push(item.id)
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
  }

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoading(true);
        let { data: projectionList } = await api.post(
          "organizations/projection",
          {}
        );
        setCompanyListDropdown(() => projectionList.data.Items)
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    Admin && fetchOrg()
  }, [])
  return (
    <>
      {loading && <LoaderOverlay />}
      { window.location.pathname == '/dashboard/search-result' &&
      (
        <>
        <div className="mb-1">
          <Breadcrumb links={dashboardLinks} />
        </div>
         <div className="flex">
            <DynamicLabel
              text={intl.search_results}
              alignment="text-center"
              fontSize="text-[22px]"
              fontWeight="font-medium"
              textColor="#000000"
              disabled={false}
            />
          </div>
        </>

      )}
      {Admin && (
        <form
          className="w-full  hidden lg:flex gap-2 flex-wrap flex-shrink-0 flex-grow-0 py-2 rounded-xl mb-2 md:mx-auto md:justify-center lg:justify-normal"
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
            <input list="company_search" name="company_search" className={`w-full border flex  py-2.5 text-xs  pl-2  rounded-lg focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-center md:placeholder:text-left md:placeholder:pl-0
        dark:text-black`}
              placeholder={intl.company_list_company_name}
              onInput={(e) => setCompName(e.target.value)}
              value={compName}
            />
            <datalist id="company_search">
              {companyListDropdown.length > 0 && companyListDropdown.map((item) => { return (<option value={item.name} key={item.value}></option>) })}
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
            <IconLeftBtn
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-white font-medium text-sm w-full px-6 rounded-lg"
              }
              py={"py-2"}
              px={""}
              bgColor={"bg-customBlue  hover:bg-[#5283B3]"}
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
          className="w-full  hidden lg:flex gap-2 flex-wrap flex-shrink-0 flex-grow-0 py-2  rounded-xl mb-2 md:mx-auto md:justify-center lg:justify-normal"
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
            <IconLeftBtn
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-white font-medium text-sm w-full px-6 rounded-lg"
              }
              py={"py-2"}
              px={""}
              bgColor={"bg-customBlue  hover:bg-[#5283B3]"}
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
          className="md:w-[96%] w-[92%]  flex lg:hidden gap-2 flex-wrap flex-shrink-0 flex-grow-0  py-6 px-5 rounded-xl mb-4 md:mx-auto md:justify-center lg:justify-normal absolute z-20"
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
            <IconLeftBtn
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-white font-medium text-sm w-full px-6 rounded-lg"
              }
              py={"py-2"}
              px={""}
              bgColor={"bg-customBlue  hover:bg-[#5283B3]"}
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
          className="md:w-[96%] w-[92%]  flex lg:hidden gap-2 flex-wrap flex-shrink-0 flex-grow-0  py-6 px-5 rounded-xl mb-4 md:mx-auto md:justify-center lg:justify-normal absolute z-20"
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
            <IconLeftBtn
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-white font-medium text-sm w-full px-6 rounded-lg"
              }
              py={"py-2"}
              px={""}
              bgColor={"bg-customBlue  hover:bg-[#5283B3]"}
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
          <IconLeftBtn
            text={intl.dashboard_layout_search_btn}
            textColor={
              "w-full text-white font-medium text-sm w-full px-6 rounded-lg"
            }
            py={"py-2"}
            px={""}
            bgColor={"bg-customBlue hover:bg-[#5283B3]"}
            textBold={true}
            icon={() => getIconWithClass("")}
            onClick={() => {
              setSearchPanelOnMobile(true);
            }}
          />
        </span>
      </div>
      <div className="m-w-[1400] flex flex-col flex-1 h-full ">{children}</div>
    </>
  );
}
