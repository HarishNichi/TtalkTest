"use client";

import { useState, useEffect } from "react";
// import TitleUserCard from "@/components/titleUserCard";
import {
  tableDefaultPageSizeOption,
  LogLevelEnum,
  code,
  maxLimit,
  CallStatus,
  CallType,
} from "@/utils/constant";
import { Pagination, Select } from "antd";
import intl from "@/utils/locales/jp/jp.json";
import { convertDateAndTime, formatDate } from "@/validation/helperFunction";
import { useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { Popover } from "antd";
import { DatePicker } from "antd/es";
import locale from "antd/es/date-picker/locale/ja_JP";
import "dayjs/locale/ja.js";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import DataTable from "@/components/DataTable/DataTable";
dayjs.extend(customParseFormat);

const companyColumns = [
  {
    title: "通話履歴",
    dataIndex: "callHistory",
    render: (text, record) => {
      // let call = record.isGroup ? record.groupId : record.pttNo;
      const contentCall = <div className="">{record.name}</div>;
      const name = <div className="text-sm">{text}</div>;
      return (
        <div className="flex flex-col justify-center">
          <div>{contentCall}</div>
          <div>{name}</div>
        </div>
      );
    },
    width: "130px",
    align: "left",
  },
  {
    title: "コールタイプ",
    dataIndex: "callType",
    render: (text, record) => {
      return <a className="text-ellipsis">{CallType[text] || ""}</a>;
    },
    width: "120px",
    align: "left",
  },

  {
    title: "スターテス",
    dataIndex: "status",
    render: (text) => {
      return <a className="text-ellipsis">{CallStatus[text] || ""}</a>;
    },
    width: "115px",
    align: "left",
  },

  {
    title: "日付時刻",
    dataIndex: "createdAt",
    render: (text, record) => {
      let date = (text && formatDate(text)) || "";
      return (
        <div className="flex justify-around items-center">
          <div style={{ width: "105px" }}>
            <div className={``}>{date}</div>
          </div>
        </div>
      );
    },
    width: "200px",
    align: "center",
  },
];

export default function ViewLog({tab}) {
  let [fromDate, setFromDate] = useState(null);
  let [toDate, setToDate] = useState(null);
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const [loading, setLoading] = useState(false);
  const [logData, setLogData] = useState([]);
  const [reRender, setReRender] = useState(0);
  const [tableHeight, setTableHeight] = useState(450);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);

  const getStatusColor = (level) => {
    switch (level) {
      case "incoming":
        return "bg-red-500 text-white";
      case "missed":
        return "bg-red-400 text-white";
      case "outgoing":
        return "bg-gray-400 text-black";
      default:
        return "";
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Change the breakpoint as needed
      setTableHeight(window.innerHeight - 390);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    fetchData();
  }, [tab]);
  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const disabledDate = (current) => {
    const currentDate = new Date();
    const fromDateObject = new Date(fromDate);

    // Disable dates in the future and before fromDate
    return current && (current > currentDate || current < fromDateObject);
  };

  const fetchData = async () => {
    if ((fromDate && toDate) || (!fromDate && !toDate)) {
      setLoading(true);
      try {
        const params = {
          params: {
            limit: maxLimit,
            offset: "null",
            userId: Employee ? Employee.id : "",
            startDate: fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
            endDate: toDate && dayjs(toDate).format("YYYY-MM-DD"),
          },
        };
        const response = await api.get("activities/list", params);
        setLoading(false);
        if (response && response.data.status.code == code.OK) {
          const data = response.data.data;
          const formattedData = data?.Items.map((item, index) => {
            return {
              createdAt: item.callTime,
              name: item.name,
              isGroup: item.isGroup,
              callHistory: item.isGroup ? item.groupId : item.pttNo,
              groupId: item.groupId,
              callType: item.callType,
              status: item.status,
            };
          });
          setLogData(formattedData);
        }
      } catch (error) {
        setLoading(false);
        toast(
          error.response?.data?.status?.message
            ? error.response?.data?.status?.message
            : error.response.data.message,
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
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <div id="view-log">
        {/* <div className="flex justify-center mb-4 ">
          <TitleUserCard title={intl.user_view_logo_screen_label} />
        </div> */}

        <div className="w-full mx-auto">
          <div className="w-full flex gap-x-4 mb-8 px-2">
            <div className="w-1/2">
              <DatePicker
                className={
                  "rounded py-2 border border-gray-400 block w-full text-sm px-2 focus:outline-none focus:ring-2 focus:ring-customBlue text-[#8B8B8B] md:text-center"
                }
                onChange={(dateObj, dateString) => {
                  const newFromDate = dateString || null;
                  setFromDate(() => newFromDate);
                  // Ensure end date is greater than start date
                  if (toDate && toDate < newFromDate) {
                    setToDate(null); // Reset the end date if it's not valid
                    setReRender(reRender + 1);
                  }
                  if (!toDate && !fromDate) {
                    fetchData();
                  }
                }}
                locale={locale}
                format="YYYY/MM/DD"
                disabledDate={(current) => current > new Date()}
                style={{ textAlign: "center" }}
              />
            </div>
            <div className="w-1/2">
              <DatePicker
                disabledDate={disabledDate}
                key={reRender}
                min={fromDate}
                className={
                  "rounded py-2 border border-gray-400 block w-full text-sm  focus:outline-none focus:ring-2 focus:ring-customBlue text-[#8B8B8B] text-center px-2"
                }
                onChange={(event, dateString) => {
                  const newToDate = dateString;
                  if (!dateString) {
                    setToDate(null)
                  }
                  // Ensure end date is greater than start date
                  if (!fromDate || newToDate >= fromDate) {
                    setToDate(newToDate);
                    toDate && fetchData();
                  }
                }}
                disabled={!fromDate}
                locale={locale}
                style={{ textAlign: "center" }}
                format="YYYY/MM/DD"
              />
            </div>
          </div>
          <div className="mb-8 w-full max-h-[450px] 2xl:max-h-[740px]">
              <DataTable
                scrollHorizontal={500}
                scrollVertical={tableHeight > 450 ? tableHeight : 450}
                loading={loading}
                rowSelectionFlag={false}
                columns={companyColumns}
                dataSource={logData}
                onSelectRow={(tableData) => {
                  // handleSelectRow(tableData);
                  return tableData;
                }}
                defaultPaeSizeOptions={tableDefaultPageSizeOption}
                defaultValue={1}
                onRowClick={(row, rowIndex) => {
                  // dispatch(addEmployee(row));
                  // router.push("/user/details");
                }}
                selectAll={""}
                setSelectAll={""}
                setSelectedRows={""}
                searchFlag={""}
                deleted={""}
                page={page}
                setPage={setPage}
                current={current}
                setCurrent={setCurrent}
              />
            {/* {logData.length <= 0 && (
              <div className="flex justify-center dark:text-black">
                {intl.data_not_found}
              </div>
            )} */}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
