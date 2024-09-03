"use client";
import React, { useState, useEffect } from "react";
import intl from "@/utils/locales/jp/jp.json";
import DataTable from "@/components/DataTable/DataTable";
import {
  tableDefaultPageSizeOption,
  code,
  maxLimit,
  userDetailsLinks,
} from "@/utils/constant";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import { useRouter } from "next/navigation";
import TitleUserCard from "../dashboard/components/titleUserCard";
import JsonArrayToCsvConverter from "@/components/Csv/csvConverter";
import { formatDate } from "@/validation/helperFunction";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { useAppSelector } from "@/redux/hooks";
import { Popover } from "antd";
import Breadcrumb from "@/components/Layout/breadcrumb";

export default function HistorySettingsList() {
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const router = useRouter();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
  const companyColumns = [
    {
      title: "SL No.",
      dataIndex: "index",
      render: (text) => <a>{text}</a>,
      width: 70,
    },
    {
      title: intl.user_history_settings_file_name,
      dataIndex: "fileName",
      render: (text) => <a>{text}</a>,
      width: 200,
    },
    {
      title: "適用タイプ",
      dataIndex: "accountType",
      render: (text) => <a>{text}</a>,
      width: 120,
    },
    {
      title: "ステータス",
      dataIndex: "isActive",
      render: (text) => <a>{text}</a>,
      width: 120,
    },
    {
      title: intl.user_history_update_date,
      dataIndex: "updateDate",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-customBlue text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 120,
    },
  ];

  const [columns, setColumns] = React.useState(companyColumns);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
        },
      };
      const response = await api.get("history/list", params);
      setLoading(false);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const historyData = response.data.data;
        const formattedData = historyData.Items.map((item, index) => {
          return {
            index: index + 1,
            fileName: <JsonArrayToCsvConverter jsonData={item} />,
            accountType: item.data.accountType,
            isActive: item.data.isActive ? "成功" : "失敗",
            updateDate: item.data.updatedAt
              ? formatDate(item.data.updatedAt)
              : formatDate(item.data.createdAt), // Use createdAt from the response data
          };
        });
        setHistoryList(formattedData);
      }
    } catch (error) {
      setLoading(false);
      toast(error.response?.data?.status.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="mb-[16px]">
        <Breadcrumb links={userDetailsLinks} />
      </div>
      <div className="flex  mb-4 ">
        <TitleUserCard title={intl.user_history_settings} />
      </div>
      <div>
        <div className="mb-[20px] relative" style={{ width: "100%" }}>
          <DataTable
            scrollVertical={450}
            columns={columns}
            dataSource={historyList}
            defaultPaeSizeOptions={tableDefaultPageSizeOption}
            defaultValue={1}
            rowClassName="history-settings-tables"
            page={page}
            setPage={setPage}
            current={current}
            setCurrent={setCurrent}
          />
        </div>
      </div>
    </>
  );
}
