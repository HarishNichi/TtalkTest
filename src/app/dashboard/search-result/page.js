"use client";
import React, { useEffect, useRef, useState } from "react";
import intl from "@/utils/locales/jp/jp.json";
import DynamicLabel from "@/components/Label/dynamicLabel";
import IconOutlineBtn from "@/components/Button/iconOutlineBtn";
import AddIcon from "@/components/Icons/addIcon";
import DataTable from "@/components/DataTable/DataTable";
import {
  adminChannel,
  csvFileNameRegex,
  errorToastSettings,
  fileName,
  tableDefaultPageSizeOption,
} from "@/utils/constant";
import Modal from "@/components/Modal/modal";
import TextPlain from "@/components/Input/textPlain";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import ExportIcon from "@/components/Icons/exportIcon";
import DropdownMedium from "@/components/Input/dropdownMedium";
import GetIconQRCode from "../../../components/Icons/qrCode";
import { useRouter } from "next/navigation";
import IconBtn from "@/components/Button/iconBtn";
import { folderIcon } from "@/components/Icons/folderIconMobile";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { addEmployee, searchEmployee } from "@/redux/features/employee";
import { ToastContainer, toast } from "react-toastify";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";
Amplify.configure(gen.config);

export default function HelpSettingsList() {
  const router = useRouter();
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const [received, setReceived] = React.useState("");
  const [tableHeight, setTableHeight] = React.useState(450);
  const UserData = useAppSelector((state) => state.userReducer.user);
  const dispatch = useAppDispatch();
  const employeeData = useAppSelector(
    (state) => state.employeeReducer.employeeSearchList
  );
  let employeeDataCopy = JSON.parse(JSON.stringify(employeeData))
  const [employeeDataList, setEmployeeDataList] = React.useState(employeeDataCopy);
  const [loading, setLoading] = useState(false);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const CSVDownloadRef = useRef("");
  const [csvFileName, setCsvFileName] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportType, setExportType] = useState(1);
  const [fileNameError, setFileNameError] = useState(null);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    let data = localStorage.getItem("searchEmployee");
    let parsedData = (data.length > 0 && JSON.parse(data)) || [];
    dispatch(searchEmployee(parsedData));
  }, []);

  useEffect(() => {
    let employeeDataCopy = JSON.parse(JSON.stringify(employeeData))
    setEmployeeDataList(employeeDataCopy);
    setSearchFlag(!searchFlag)
    setSelectAll(false)
  }, [employeeData]);

  let Admin = false;
  let organizationIdForChannel;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    organizationIdForChannel = User.id;
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
  }

  const companyColumns = [
    {
      title: intl.company_list_company_radioNumber,
      dataIndex: "radioNumber",
      render: (text) => <a className="text-customBlue">{text}</a>,
      width: 120,
      align: "left",
      sorter: (a, b) => a.radioNumber.localeCompare(b.radioNumber),
      sortDirections: ['ascend', 'descend','ascend'], 

    },
    {
      title: intl.user_userId_label,
      dataIndex: "userId",
      render: (text) => <a className="pr-1">{text}</a>,
      width: 120,
      align: "left",
      sorter: (a, b) => a.userId - b.userId,
      sortDirections: ['ascend', 'descend','ascend'], 
    },

    {
      title: intl.machineName,
      dataIndex: "machine",
      render: (text) => <a>{text}</a>,
      width: 120,
      align: "left",
      sorter: (a, b) => a.machine.localeCompare(b.machine),
      sortDirections: ['ascend', 'descend','ascend'], 
    },
    {
      title: "",
      dataIndex: "status",
      render: (status) => {
        if (status == "online") {
          return (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#1AB517] h-2 w-2 p-2 rounded-full `}></div>
            </div>
          );
        }
        if (status == "away") {
          return (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#FFA500] h-2 w-2 p-2 rounded-full `}></div>
            </div>
          );
        }
        if (status == "offline") {
          return (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#ED2E2E] h-2 w-2 p-2 rounded-full`}></div>
            </div>
          );
        }
        if (status == "unknown") {
          return (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#D9D9D9] h-2 w-2 p-2 rounded-full`}></div>
            </div>
          );
        }
      },
      width: "30px",
      align: "center",
    },
    {
      title: intl.company_list_company_status,
      dataIndex: "onlineStatus",
      render: (text, record) => {
        let bg = text == "online" ? "bg-customGreen" : "bg-customGray";
        return (
          <div style={{ width: "105px" }}>
            <div
              className={`rounded-[5px] cursor-pointer  pt-[5px] pb-[5px] pl-[5px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue text-sm text-white block w-full ${bg} text-center
            `}
            >
              {text == "online" ? "オンライン" : "オフライン"}
            </div>
          </div>
        );
      },
      width: 120,
    },
  ];

  if (Admin) {
    let org = {
      title: intl.user_add_company_name,
      dataIndex: "organization",
      render: (text) => <a>{text}</a>,
      width: 100,
      align: "left",
      sorter: (a, b) => a.organization.localeCompare(b.organization),
      sortDirections: ['ascend', 'descend','ascend'], 
    };

    let salesChannel = {
      title: intl.form_component_sales_channel,
      dataIndex: "salesChannel",
      render: (text) => <a>{text}</a>,
      width: 120,
      align: "left",
    };

    companyColumns.splice(2, 0, org, salesChannel);
  }

  const [columns, setColumns] = React.useState(companyColumns);
  const [qrCodeModal, setQrCodeModal] = React.useState(false);
  const [exportModal, setExportModal] = React.useState(false);
  const [searchFlag, setSearchFlag] = useState(false)

 
  useEffect(() => {
    const handleResize = () => {
      setTableHeight(window.innerHeight - 300);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const channel = Admin ? adminChannel : organizationIdForChannel;
    const subscription = gen.subscribe(channel, ({ data }) => {
      data = JSON.parse(data);
      setReceived(data);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let maxCurrent = (current - 1) * page + page;
    if (employeeDataList.length > 0) {
      let temp = employeeDataList.map((el,index) => {
        if (el.radioNumber == received.pttNo && index >= (current - 1) * page && index <= maxCurrent) {
          el.status = received.status;
          el.timestamp = new Date().getTime()
        }
        return el;
      });
      setEmployeeDataList(temp);
    }
  }, [received]);

  useEffect(() => {
    downloadCsvLink && CSVDownloadRef.current.click();
  }, [downloadCsvLink]);

  useEffect(() => {
    let setIntervalCount;
    if (!setIntervalCount) {
      setIntervalCount = setInterval(() => {
        let temp = employeeDataList.length > 0 && employeeDataList.map((el, index) => {
          if (el?.status == "online") {
            if ((new Date().getTime() - el.timestamp) > 1000 * 60 * 3) {
              el.status = "unknown";
            }
          }
          return el;
        });
        temp?.length && temp.length > 0 && setEmployeeDataList(temp);

      }, 1000 * 60 * 5)
    }
    return () => clearInterval(setIntervalCount)
  }, [received])


  function handelExport() {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast("ユーザーを選択してください。", errorToastSettings);
      setExportModal(false);
      return;
    }
    setExportModal(() => true);
  }

  function getExportModalFooter() {
    return (
      <IconLeftBtn
        text={"エクスポート"}
        textColor={"text-white font-semibold text-[16px] w-full"}
        py={"py-[11px]"}
        px={"w-[84%]"}
        bgColor={"bg-customBlue"}
        textBold={true}
        icon={() => {
          return null;
        }}
        onClick={() => {
          exportCSVFile();
        }}
      />
    );
  }

  function getQrModalFooter() {
    return (
      <div className="flex gap-x-3">
        <div>
          <IconLeftBtn
            text="キャンセル"
            textColor={"text-white font-semibold text-[16px] w-full rounded-lg"}
            py={"py-2"}
            px={"px-[10.5px] md:px-[17.5px]"}
            bgColor={"bg-customBlue"}
            textBold={true}
            icon={() => {
              return null;
            }}
            onClick={() => {
              setQrCodeModal(() => false);
            }}
          />
        </div>
        <div>
          <IconLeftBtn
            text="ダウンロード"
            textColor={"text-white font-semibold text-[16px] w-full rounded-lg"}
            py={"py-2"}
            px={"px-[10.5px] md:px-[17.5px]"}
            bgColor={"bg-customBlue"}
            textBold={true}
            icon={() => {
              return null;
            }}
            onClick={() => {
              setQrCodeModal(() => false);
            }}
          />
        </div>
      </div>
    );
  }

  async function exportCSVFile() {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast("ユーザーを選択してください。", errorToastSettings);
      setExportModal(false);
      return;
    }
    try {
      let data;
      let url = "employees/export-custom";
      if (!csvFileName) {
        setFileNameError("ファイル名は必須です。");
        return;
      }
      if (!csvFileNameRegex.test(csvFileName)) {
        setFileNameError("ファイル名を確認してください。");
        return;
      }
      setFileNameError("");
      if (selectAll) {
        let ids = selectedRows.map((el) => el.id);
        data = {
          ids,
          filename: csvFileName + ".csv",
        };
      } else if (selectedRows.length > 0) {
        let ids = selectedRows.map((el) => el.id);
        data = {
          ids,
          filename: csvFileName + ".csv",
        };
      } else {
        toast("ユーザーを選択してください。", errorToastSettings);
        return;
      }
      setLoading(true);
      let result = await api.post(url, data);
      setDownloadCsvLink(result?.data.data.path);
      setExportModal(() => false);
      setCsvFileName("");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast("ファイルのエクスポートに失敗しました", errorToastSettings);
    }
  }

  const handleSelectRow = (selected) => {
    setSelectedRows(selected);
  };
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div>
        {/* <div className="flex  justify-between mb-2">
          <div className="flex items-center ">
            <DynamicLabel
              text={intl.search_results}
              alignment="text-center"
              fontSize="text-[22px]"
              fontWeight="font-medium"
              textColor="#000000"
              disabled={false}
            />
          </div>
          <div className="hidden lg:flex gap-x-2">
            <IconOutlineBtn
              text={intl.company_list_company_export_title}
              textColor={"text-customBlue"}
              textBold={true}
              py={"xl:py-2 md:py-1.5 py-1.5"}
              px={"px-4"}
              icon={() => <ExportIcon />}
              borderColor={"border-customBlue"}
              onClick={async () => {
                await setExportModal(() => false);
                await handelExport();
              }}
            />
          </div>

          <div className="flex lg:hidden">
            <span className="mr-2.5">
              <IconBtn
                textColor={"text-white"}
                textBold={true}
                icon={() => <ExportIcon />}
                bg="bg-transparent"
                onClick={() => {
                  setExportModal(() => true);
                }}
              />
            </span>
          </div>
        </div> */}
        <div className="mb-[5px] flex items-center">
          <label
            key={"selectAll"}
            className="flex items-center text-customBlue"
          >
            <input
              type="checkbox"
              disabled={employeeDataList?.length == 0}
              value={selectAll}
              checked={selectAll}
              className="h-[16px] w-[16px] text-[#19388B]  focus:ring-[#19388B] focus:ring-opacity-50 rounded-lg bg-[#19388B] bg-opacity-88 text-opacity-88"
              onChange={(evt) => {
                setSelectAll(evt.target.checked);
              }}
            />
            <span className="ml-1"> {"すべて選択"}</span>
          </label>
        </div>
        <div className="mb-[20px] relative" style={{ width: "100%" }}>
          <DataTable
            scrollVertical={tableHeight > 450 ? tableHeight : 450}
            rowSelectionFlag
            columns={columns}
            dataSource={employeeDataList}
            onSelectRow={(tableData) => {
              handleSelectRow(tableData);
              return tableData;
            }}
            defaultPaeSizeOptions={tableDefaultPageSizeOption}
            defaultValue={1}
            onRowClick={(row, rowIndex) => {
              dispatch(addEmployee(row));
              router.push("/user/details");
            }}
            selectAll={selectAll}
            setSelectAll={setSelectAll}
            setSelectedRows={setSelectedRows}
            searchFlag={searchFlag}
            setCurrent={setCurrent}
            current={current}
            setPage={setPage}
            page={page}
          />
        </div>
        {qrCodeModal && (
          <Modal
            height="auto"
            fontSize="text-xl"
            textColor="#19388B"
            text={intl.company_list_company_qrCode}
            onCloseHandler={setQrCodeModal}
            modalFooter={getQrModalFooter}
          >
            <div className="flex flex-col">
              <div className="flex-grow my-[40px]">
                <center>{GetIconQRCode()}</center>
              </div>
            </div>
          </Modal>
        )}
        {exportModal && (
          <Modal
            height="500px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={intl.company_list_company_export_title}
            contentPaddingTop="pt-1"
            contentPadding="px-0"
            onCloseHandler={() => {
              setExportModal(false);
              setCsvFileName("");
              setFileNameError("");
            }}
            modalFooter={getExportModalFooter}
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[24px]">
                <form className="grid grid-cols-1 gap-y-3">
                  <div className="flex flex-col">
                    <TextPlain
                      type="text"
                      for={"id"}
                      placeholder={"ファイル名"}
                      borderRound="rounded-xl"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                      border="border border-gray-300"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
                      label={"ファイル名"}
                      labelColor="#7B7B7B"
                      id={"id"}
                      isRequired={true}
                      labelClass={"float-left"}
                      onChange={(event) => {
                        setCsvFileName(event.target.value);
                      }}
                    />
                    {fileNameError && (
                      <div className="validation-font text-sm text-[red] text-left">
                        {fileNameError}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </Modal>
        )}
        <a
          id={"linkCsv"}
          ref={CSVDownloadRef}
          href={downloadCsvLink}
          download
          key={downloadCsvLink}
        ></a>
      </div>
    </>
  );
}
