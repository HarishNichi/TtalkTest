/* eslint-disable no-console */
"use client";
/* eslint-disable no-irregular-whitespace */
import { useState, useEffect, useRef } from "react";
import intl from "@/utils/locales/jp/jp.json";
import DynamicLabel from "@/components/Label/dynamicLabel";
import IconOutlineBtn from "../../components/Button/iconOutlineBtn";
import AddIcon from "@/components/Icons/addIcon";
import DataTable from "@/components/DataTable/DataTable";
import IconBtn from "@/components/Button/iconBtn";

import {
  fileName,
  tableDefaultPageSizeOption,
  EmployeeSearchLimit,
  adminChannel,
  errorToastSettings,
  successToastSettings,
  csvFileNameRegex,
  maxLimit,
  code,
} from "@/utils/constant";
import copy from "copy-to-clipboard";
import Modal from "@/components/Modal/modal";
import TextPlain from "@/components/Input/textPlain";
import IconLeftBtn from "@/components/Button/iconLeftBtn";

import DropdownMedium from "@/components/Input/dropdownMedium";
import ImportModal from "@/components/ImportModal/empImport";
import GetIconQRCode from "@/components/Icons/qrCode";
import { useRouter } from "next/navigation";

import api from "@/utils/api";
import { addEmployee } from "@/redux/features/employee";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { decrypt } from "@/utils/decryption";
import { DatePicker, Popover, Tooltip } from "antd";
import DeleteIcon from "@/components/Icons/deleteIcon";
import SearchInput from "@/components/Search/SearchInput";

import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
import { formatDate } from "@/validation/helperFunction";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/en_US";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/ja.js";
import { FaRegCopy } from "react-icons/fa";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
Amplify.configure(gen);
export default function UserList() {
  const router = useRouter();
  const [editRecord, setRecord] = useState(null);
  const [fileNameError, setFileNameError] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const dispatch = useAppDispatch();
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };

  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const UserData = useAppSelector((state) => state.userReducer.user);
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
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-customBlue text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 130,
      align: "left",
      sorter: (a, b) => a.radioNumber.localeCompare(b.radioNumber),
      sortDirections: ['ascend', 'descend','ascend'], 
    },
    {
      title: intl.user_userId_label,
      dataIndex: "userId",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 120,
      align: "left",
      sorter: (a, b) => a.userId - b.userId,
      sortDirections: ['ascend', 'descend','ascend'], 
    },
    {
      title: "パスワード",
      dataIndex: "password",
      render: (text, record) => {
        const Msg = ({ closeToast, toastProps, password, userId }) => (
          <div>
            <div>
              {intl.user_userId_label}　:　{userId}
            </div>
            <div className="flex gap-x-[15px]">パスワード　:　{password} <button onClick={() => copy(password)}><FaRegCopy />
            </button></div>
          </div>
        )
        return (
          <div className="text-left">
            <button
              type="button"
              style={{ width: "105px" }}
              className="text-left"
              onClick={async (event) => {
                event.stopPropagation();
                toast.dismiss();
                try {
                  setLoading(true);
                  let response = await api.post(
                    `employees/hint?id=${record.id}`
                  );
                  let password = response.data.data;
                  password = decrypt(password);
                  setLoading(false);
                  toast(<Msg password={password} userId={record.userId} />, {
                    position: "top-right",
                    autoClose: false,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                    type: "success",
                  });
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
              }}
            >
              <div className="hover:text-[#69b1ff]">******</div>
            </button>
          </div>
        );
      },
      width: 105,
      align: "left",
    },

    {
      title: intl.machineName,
      dataIndex: "machine",
      render: (text) => {
        let content = <span className="text-white">{text}</span>
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 115,
      align: "left",
      sorter: (a, b) => a.machine.localeCompare(b.machine),
      sortDirections: ['ascend', 'descend','ascend'], 
    },
    {
      title: "グループ",
      dataIndex: "groupName",
      align: "left",
      render: (text, evt) => {
        const popupContainer = (
          <>
            {text && text.length > 0 && (
              <>
                {text.map((el, index) => {
                  return (
                    <div key={el.groupId} className="text-white">
                      {el.name}
                    </div>
                  );
                })}
              </>
            )}
          </>
        );

        return (
          <>
            {text.length > 0 ? (
              <Popover
                content={popupContainer}
                title=""
                placement="bottom"
                color="#19388B"
              >
                <a>{(text.length > 0 && text[text.length - 1]?.name) || "-"}</a>
              </Popover>
            ) : (
              <a>{text[text.length - 1]?.name || "-"}</a>
            )}
          </>
        );
      },
      width: 150,
    },
    {
      title: intl.user_name,
      dataIndex: "name",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 150,
      align: "left",
    },

    {
      title: "登録日時",
      dataIndex: "createdAtDate",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 160,
      align: "left",
      sorter: (a, b) => new Date(a.createdAtDate) - new Date(b.createdAtDate),
      sortDirections: ['ascend', 'descend','ascend'], 
    },
    {
      title: "最終オンライン日時",
      dataIndex: "appLastSeenDateTime",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 180,
      align: "left",
    },
    {
      title: "利用開始日",
      dataIndex: "appLoginDateTime",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 180,
      align: "left",
    },
    {
      title: "利用停止日",
      dataIndex: "appLogoutDateTime",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 180,
      align: "left",
    },
    {
      title: "バージョン",
      dataIndex: "appVersion",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 120,
      align: "left",
    },

    {
      title: intl.company_list_company_status,
      dataIndex: "isActive",
      render: (text, record) => {
        let bg = text ? "bg-customGreen" : "bg-customGray";
        let roundStatus;
        if (record.status == "online") {
          roundStatus = (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#1AB517] h-2 w-2 p-2 rounded-full `}></div>
            </div>
          );
        }

        if (record.status == "away") {
          roundStatus = (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#FFA500] h-2 w-2 p-2 rounded-full `}></div>
            </div>
          );
        }
        if (record.status == "offline") {
          roundStatus = (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#ED2E2E] h-2 w-2 p-2 rounded-full`}></div>
            </div>
          );
        }
        if (record.status == "unknown") {
          roundStatus = (
            <div className="w-full flex justify-center h-full">
              <div className={`bg-[#D9D9D9] h-2 w-2 p-2 rounded-full`}></div>
            </div>
          );
        }

        return (
          <div className="flex justify-around items-center">
            <div>{roundStatus}</div>
            <div style={{ width: "105px" }}>
              <div
                className={`rounded-[5px] cursor-pointer  pt-[5px] pb-[5px] pl-[5px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue text-sm text-white block w-full ${bg} text-center
            `}
              >
                {text ? "オンライン" : "オフライン"}
              </div>
            </div>
          </div>
        );
      },
      width: 200,
      align: "left",
    },
  ];

  if (Admin) {
    let org = {
      title: intl.user_add_company_name,
      dataIndex: "organization",
      render: (text) => {
        const content = <div className="text-white">{text}</div>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 180,
      align: "left",

      sorter: (a, b) => a.organization.localeCompare(b.organization),
      sortDirections: ['ascend', 'descend','ascend'], 

    };
    companyColumns.splice(3, 0, org);
  }
  const [csvFileName, setCsvFileName] = useState("");
  const [exportType, setExportType] = useState(1);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const CSVDownloadRef = useRef("");
  const [columns, setColumns] = useState(companyColumns);
  const [editModal, setEditModal] = useState(false);
  const [editSettings, setEditSettings] = useState("グループ");
  const [modelToggle, setModelToggle] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [received, setReceived] = useState("");
  const [searchFlag, setSearchFlag] = useState(false);
  //emp-import
  const [activeButton, setActiveButton] = useState("employee");
  const [option, setSelectedOption] = useState("settings");
  const [tableHeight, setTableHeight] = useState(450);
  const [exceededLimitOfExport, setExceededLimitOfExport] = useState(false);
  const [confirmationExport, setConfirmationExport] = useState(false);
  const [shouldOpenInNewTab, setIsPdf] = useState(false);
  const [csvUploadInitiated, setCsvUploadInitiated] = useState(null);
  const [csvUploadInitiatedSettings, setCsvUploadInitiatedSettings] = useState(null);
  const [currentAPI, setCurrentAPI] = useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = useState(null);
  const [companyListDropdown, setCompanyListDropdown] = useState([]);
  const [current, setCurrent] = useState(1);
  const [page, setPage] = useState(50);

  const [searchPayload, setSearchPayload] = useState({
    employeeId: "",
    organization: "",
    pttNo: "",
    device: "",
    groups: "",
    createdAtDate: "",
    appLastSeenDateTime: "",
    appLoginDateTime: "",
    appLogoutDateTime: "",
    appVersion: "",
    onlineStatus: "",
    isActive: "",
  });
  const handleSelectRow = (selected) => {
    setSelectedRows(selected);
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

  function editIcon(flag) {
    return <AddIcon isMobile={flag} />;
  }

  const deleteEmployee = async (selectedRows) => {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast("ユーザーを選択してください。", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
      setDeleteModal(false);
      return;
    }
    const userIds = selectedRows.map((record) => ({
      id: record.id, // Assuming record has an 'id' property
    }));

    setLoading(true);
    try {
      const response = await api.post(`employees/delete-all`, userIds);
      setLoading(false);
      setDeleteModal(false);
      setSelectAll(false);
      setSelectedRows([]);
      setDeleted(true);
      Admin ? fetchOrg() : withDeviceDetails([]);
    } catch (error) {
      setLoading(false);
      setDeleteModal(false);
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
    }
  };

  function handelEdit(record) {
    setEditModal(() => true);
  }

  function deleteIcon(flag) {
    return <DeleteIcon isMobile={flag} />;
  }

  /**Delete handler */
  function handelDelete(record) {
    setRecord(record);
    setDeleteModal(() => true);
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      //
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  function importHandler() {
    setTimeout(() => {
      setModelToggle(() => true);
    }, 500);
  }

  useEffect(() => {
    downloadCsvLink && CSVDownloadRef.current.click();
  }, [downloadCsvLink]);

  async function exportCSVFile() {
    try {
      let data;
      let downloadFileName = exportType == 1 ? ".csv" : ".pdf";
      let url = exportType == 1 ? "employees/export" : "employees/qr-code";
      toast.dismiss();
      if (!csvFileName) {
        setFileNameError("ファイル名は必須です。");
        return;
      }
      if (!csvFileNameRegex.test(csvFileName)) {
        setFileNameError("ファイル名を確認してください。");
        return;
      }
      setFileNameError("");
      setLoading(true);
      if (selectAll) {
        let ids = selectedRows.map((el) => el.id);
        data = { ids: ids, filename: csvFileName + downloadFileName };
      } else if (selectedRows.length > 0) {
        let ids = selectedRows.map((el) => el.id);
        data = {
          ids,
          filename: csvFileName + downloadFileName,
        }
      } else {
        toast("ユーザーを選択してください。", errorToastSettings);
        setLoading(false);
        return;
      }
      let result = await api.post(url, data);
      setDownloadCsvLink(result?.data.data.path);
      const shouldOpenInNewTab = result?.data.data.path.endsWith(".pdf");
      setIsPdf(shouldOpenInNewTab);
      setExportModal(() => false);
      setCsvFileName("");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast("ファイルのエクスポートに失敗しました", errorToastSettings);
    }
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

  function getExceededModalFooter() {
    return (
      <div className="flex gap-x-3">
        <div>
          <IconLeftBtn
            text="いいえ"
            textColor={"text-white font-semibold text-[16px] w-full rounded-lg"}
            py={"py-2"}
            px={"px-[10.5px] md:px-[17.5px]"}
            bgColor={"bg-customBlue"}
            textBold={true}
            icon={() => {
              return null;
            }}
            onClick={() => {
              setExceededLimitOfExport(false);
            }}
          />
        </div>
        <div>
          <IconLeftBtn
            text="はい"
            textColor={"text-white font-semibold text-[16px] w-full rounded-lg"}
            py={"py-2"}
            px={"px-[10.5px] md:px-[17.5px]"}
            bgColor={"bg-customBlue"}
            textBold={true}
            icon={() => {
              return null;
            }}
            onClick={() => {
              setExceededLimitOfExport(false);
              setConfirmationExport(true);
              setQrCodeModal(() => false);
            }}
          />
        </div>
      </div>
    );
  }

  function getDeleteModalFooter() {
    return (
      <div className="grid grid-cols-2 gap-2 place-content-center">
        <div>
          <IconLeftBtn
            text={intl.help_settings_addition_modal_cancel}
            textColor={"text-white font-semibold text-sm w-full"}
            py={"py-[11px]"}
            px={"px-6"}
            bgColor={"bg-customBlue"}
            textBold={true}
            icon={() => {
              return null;
            }}
            onClick={() => {
              setDeleteModal(() => false);
            }}
          />
        </div>
        <div>
          <IconLeftBtn
            text={intl.help_settings_addition_delete}
            textColor={"text-white font-semibold text-sm w-full"}
            py={"py-[11px]"}
            px={"px-6"}
            bgColor={"bg-customBlue"}
            textBold={true}
            icon={() => {
              return null;
            }}
            onClick={() => {
              deleteEmployee(selectedRows);
            }}
          />
        </div>
      </div>
    );
  }
  function qrCodeIcons() {
    return <GetIconQRCode />;
  }
  function importIcon() {
    return (
      <svg
        width="29"
        height="25"
        viewBox="0 0 29 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.0693 13.3013H20.0471C20.0471 13.3124 20.0471 13.3346 20.0471 13.3457C20.0471 14.6541 20.0471 15.9736 20.0471 17.2819C20.0471 18.5903 20.0471 19.932 20.0471 21.2625C20.0471 21.5619 20.0249 21.8835 19.781 22.1163C19.5371 22.3603 19.1933 22.3824 18.9494 22.3935C13.86 22.3713 8.77062 22.3713 3.69231 22.3935C3.38184 22.3935 3.09355 22.3603 2.86071 22.1274C2.62786 21.8946 2.59459 21.5619 2.59459 21.2736C2.59459 18.3575 2.59459 15.4413 2.60568 12.5252V6.92574C2.60568 6.80378 2.59459 6.68181 2.58351 6.55984C2.53915 6.12741 2.47263 5.59518 2.84962 5.19601C3.22661 4.79685 3.78101 4.87446 4.19127 4.91881C4.27997 4.91881 4.35759 4.94099 4.4352 4.94099C4.41303 3.86545 4.42412 3.06712 4.4352 2.32422C3.81428 2.33531 3.20444 2.32422 2.58351 2.32422H1.55232C0.487872 2.33531 0 2.81209 0 3.88763C0 10.3963 0 16.905 0 23.4247C0 24.5224 0.476785 24.9881 1.59667 24.9992H8.90367H11.343H14.104C16.4657 24.9992 18.8385 24.9992 21.2003 24.9992C22.0984 24.9992 22.6528 24.5002 22.6639 23.7019C22.6639 21.7393 22.6639 19.7767 22.6639 17.8142C22.6639 16.3173 22.6639 14.8204 22.6639 13.3235C21.7547 13.3346 20.912 13.3457 20.0693 13.3235V13.3013Z"
          fill="#19388B"
        />
        <path
          d="M15.9336 2.15931C15.9336 2.625 15.7451 3.25702 15.978 3.53422C16.2552 3.85577 16.9094 3.65619 17.3861 3.63401C19.382 3.57857 21.3335 3.76707 23.1297 4.73172C26.6114 6.6056 28.4409 9.53283 28.6405 13.4802C28.6737 14.0235 28.4631 14.4226 27.9198 14.5557C27.3986 14.6777 27.0549 14.3783 26.8442 13.9237C25.6467 11.44 23.7174 9.85439 21.0119 9.2889C19.4153 8.95626 17.7964 9.16693 16.1886 9.11149C15.9114 9.11149 15.8893 9.25563 15.8893 9.4663C15.8893 10.2092 15.8893 10.9521 15.8893 11.6839C15.8893 12.0942 15.7784 12.4268 15.4014 12.6375C14.9911 12.8592 14.6363 12.7262 14.2926 12.4712C11.9419 10.7082 9.59127 8.94517 7.24061 7.17109C6.6086 6.6943 6.6086 6.0512 7.24061 5.56332C9.59127 3.80033 11.953 2.03734 14.3037 0.274343C14.6252 0.030407 14.969 -0.102649 15.357 0.0969351C15.7673 0.296519 15.9004 0.651336 15.8893 1.08377C15.8893 1.44967 15.8893 1.80449 15.8893 2.17039C15.9004 2.17039 15.9114 2.17039 15.9336 2.17039V2.15931Z"
          fill="#19388B"
        />
      </svg>
    );
  }

  function exportIcon() {
    return (
      <svg
        width="29"
        height="25"
        viewBox="0 0 29 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.0313 9.10656C15.8116 9.05112 14.348 9.12874 12.9398 9.7164C11.199 10.4482 9.85732 11.6235 8.92592 13.2646C8.80396 13.4752 8.69307 13.697 8.58219 13.9188C8.36043 14.3734 8.02779 14.6727 7.50666 14.5508C6.96335 14.4288 6.76376 14.0186 6.77485 13.4863C6.84138 11.424 7.42904 9.52791 8.65981 7.85362C10.7111 5.05944 13.4942 3.68452 16.9536 3.65126C17.6522 3.65126 18.3618 3.62908 19.0604 3.65126C19.4152 3.66235 19.5593 3.57364 19.5482 3.18556C19.515 2.48702 19.5482 1.77739 19.5482 1.07884C19.5482 0.646408 19.6702 0.291592 20.0805 0.0920078C20.4796 -0.0964884 20.8123 0.0254798 21.1338 0.269416C23.4845 2.03241 25.8351 3.7954 28.1858 5.56949C28.8289 6.05736 28.8289 6.68937 28.1858 7.17725C25.8351 8.95133 23.4845 10.7032 21.1338 12.4773C20.7901 12.7323 20.4353 12.8654 20.025 12.6436C19.648 12.4441 19.5261 12.1003 19.5372 11.6901C19.5372 10.9693 19.5261 10.2486 19.5372 9.52791C19.5372 9.20635 19.4595 9.09547 19.1269 9.10656C18.5171 9.12874 17.9072 9.10656 17.0313 9.10656Z"
          fill="#19388B"
        />
        <path
          d="M14.2592 24.9855C16.5766 24.9855 18.9051 24.9855 21.2225 24.9855C22.0873 24.9855 22.6417 24.4866 22.6528 23.7104C22.6639 21.9918 22.6639 20.262 22.6639 18.5434C22.6639 17.4013 22.6639 16.2704 22.6639 15.1283C21.7879 15.1394 20.912 15.1505 20.036 15.1283V15.1505C20.036 16.1816 20.036 17.2017 20.036 18.2329C20.036 19.253 20.036 20.2842 20.036 21.3043C20.036 21.5815 20.0139 21.892 19.781 22.1359C19.5482 22.3798 19.2377 22.4131 18.9605 22.402C13.8489 22.3798 8.74844 22.3909 3.64796 22.402C3.45946 22.402 3.09355 22.402 2.83853 22.147C2.60568 21.9142 2.58351 21.6037 2.58351 21.3598C2.60568 16.2371 2.60568 11.1144 2.58351 5.99177C2.58351 5.74783 2.61677 5.42628 2.84962 5.19343C3.08247 4.96058 3.38184 4.93841 3.65904 4.93841C4.44629 4.94949 5.23354 4.94949 6.02079 4.93841C6.69716 4.93841 7.38462 4.93841 8.06098 4.93841C8.03881 3.88504 8.03881 3.06453 8.06098 2.31055C6.54193 2.33272 5.03396 2.32163 3.5149 2.32163H1.64103C0.44352 2.33272 0 2.77624 0 3.97375V23.3334C0 24.5198 0.454609 24.9855 1.62994 24.9855H8.47124H11.3209H14.2592Z"
          fill="#19388B"
        />
      </svg>
    );
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
                item.name = item.name + " - 期限切れ";
                deviceListMap.push(item.id)
                setDeviceList((prv) => [...prv, item.id])
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
    Admin ? fetchOrg() : withDeviceDetails([]);
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
    console.log((current - 1) * page, maxCurrent)
    if (employeeData.length > 0) {
      let temp = employeeData.map((el, index) => {
        if (el.radioNumber == received.pttNo && index >= (current - 1) * page && index <= maxCurrent) {
          el.status = received.status;
        }
        return el;
      });
      setEmployeeData(temp);
    }
  }, [received]);

  useEffect(() => {
    let setIntervalCount;
    if (!setIntervalCount) {
      setIntervalCount = setInterval(() => {
        let temp =
          employeeData.length > 0 &&
          employeeData.map((el, index) => {
            if (el?.status == "online") {
              if (new Date().getTime() - el.timestamp > 1000 * 60 * 3) {
                el.status = "unknown";
              }
            }
            return el;
          });
        temp?.length && temp.length > 0 && setEmployeeData(temp);
      }, 1000 * 60 * 5);
    }
    return () => clearInterval(setIntervalCount);
  }, [received]);

  useEffect(() => {
    /* eslint-disable no-undef*/
    let hasMap = new Set();
    if (!csvUploadInitiated) {
      setLoading(false);
      return;
    }
    toast.dismiss();
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];

    const subscription = gen.subscribe(csvUploadInitiated, ({ data }) => {
      if (!hasMap.has(data.token)) {
        hasMap.add(data.token)
        setLoading(true);
        let dataReceived = JSON.parse(data);
        toast.dismiss();

        if (dataReceived?.rowsInserted) {
          dataReceived.rowsInserted =
            (dataReceived?.rowsInserted &&
              JSON.parse(dataReceived?.rowsInserted)) ||
            0;
          scount = scount + dataReceived?.rowsInserted;
        }
        if (dataReceived?.rowsFailed) {
          dataReceived.rowsFailed =
            dataReceived?.rowsFailed && JSON.parse(dataReceived?.rowsFailed);
          ecount = ecount + dataReceived?.rowsFailed;
        }

        // get failed index
        failedRowIndexes = [...failedRowIndexes, ...dataReceived.failures];

        if (dataReceived?.currentChunk == dataReceived?.totalChunks) {
          setTimeout(async () => {
            setImportModal(() => !importModal);
            subscription.unsubscribe();
            if (ecount == 0 && scount > 0) {
              toast("正常にインポートされました。", successToastSettings);
              Admin ? fetchOrg() : withDeviceDetails([]);
            }

            if (ecount > 0) {
              toast(
                `${ecount} 行のデータインポートに失敗しました`,
                errorToastSettings
              );
              try {
                let csvLink = await api.post(currentAPI, {
                  failures: failedRowIndexes,
                });
                setDownloadCsvLink(csvLink.data.data.failureFile);
              } finally {
                Admin ? fetchOrg() : withDeviceDetails([]);
              }
            }
          }, 1500);
          setLoading(false);
          setCsvUploadInitiated(() => null);
          setCurrentAPI(() => null);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);


  // for settings
  useEffect(() => {
    /* eslint-disable no-undef*/
    let hasMap = new Set();
    if (!csvUploadInitiatedSettings) {
      setLoading(false);
      return;
    }
    toast.dismiss();
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];

    const subscription = gen.subscribe(csvUploadInitiatedSettings, ({ data }) => {

      let dataReceived = JSON.parse(data);
      if (!hasMap.has(dataReceived.token)) {
        hasMap.add(dataReceived.token)
        setLoading(true);
        toast.dismiss();
        if (dataReceived?.rowsInserted) {
          dataReceived.rowsInserted =
            (dataReceived?.rowsInserted &&
              JSON.parse(dataReceived?.rowsInserted)) ||
            0;
          scount = scount + dataReceived?.rowsInserted;
        }
        if (dataReceived?.rowsFailed) {
          dataReceived.rowsFailed =
            dataReceived?.rowsFailed && JSON.parse(dataReceived?.rowsFailed);
          ecount = ecount + dataReceived?.rowsFailed;
        }

        // get failed index
        failedRowIndexes = [...failedRowIndexes, ...dataReceived.failures];

        if (dataReceived?.currentChunk == dataReceived?.totalChunks) {
          setImportModal(() => !importModal);
          subscription.unsubscribe();
          if (ecount == 0 && scount > 0) {
            toast("正常にインポートされました。", successToastSettings);
            Admin ? fetchOrg() : withDeviceDetails([]);
          }

          if (ecount > 0) {
            toast(
              `${ecount} 行のデータインポートに失敗しました`,
              errorToastSettings
            );
            try {
              let csvLink = api.post(currentAPI, {
                failures: failedRowIndexes,
              });
              setDownloadCsvLink(csvLink.data.data.failureFile);
            } finally {
              Admin ? fetchOrg() : withDeviceDetails([]);
            }
          }
          setLoading(false);
          setCsvUploadInitiatedSettings(() => null);
          setCurrentAPI(() => null);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiatedSettings]);



  const fetchOrg = async () => {
    try {
      setLoading(true);
      let { data: projectionList } = await api.post(
        "organizations/projection",
        {}
      );
      setCompanyListDropdown(() => projectionList.data.Items)
      await withDeviceDetails(projectionList.data.Items)
    } catch (error) {
      setLoading(false);
    }
  };

  function findName(orgId, projectionList) {
    let orgName = projectionList.find((el) => el.id == orgId);
    if (orgName?.name) {
      return orgName.name;
    }
    return "";
  }

  let offset = "null";
  let all = [];

  async function withDeviceDetails(projectionList) {
    try {
      let expiredDeviceIds = await fetchDevice();
      await fetchData(projectionList, expiredDeviceIds);
    } catch (err) {
      console.log(err)
    }
  }
  const fetchData = async (projectionList, expDeviceList) => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: EmployeeSearchLimit,
          offset: offset,
        },
      };
      let { data: response } = await api.get("employees/list", params);
      if (response.data.offset !== "end" && response.data.Items.length > 0) {
        offset = response.data.offset;
        all = [...all, ...response.data.Items];
        fetchData(projectionList, expDeviceList);
      }
      if (response.data.offset == "end") {
        all = [...all, ...response.data.Items];
        response = all.map((emp, index) => {
          let orgName = Admin
            ? findName(emp.organizationId, projectionList) || "-"
            : "";
          return {
            key: index,
            id: emp.id,
            password: emp.hint,
            radioNumber: emp.pttNo,
            userId: emp.id,
            email: emp.accountDetail.employee.email || "-",
            organization: orgName,
            name: emp.name || "-",
            numberOfRadioNumber: emp.licenseCount || "-",
            status: emp?.accountDetail?.employee?.status || "unknown",
            isActive: emp.isActive,
            onlineStatus:
              emp?.accountDetail?.employee?.onlineStatus || "offline",
            machine: emp.accountDetail.employee?.machine.id &&
              expDeviceList.includes(emp.accountDetail.employee?.machine.id) ? emp.accountDetail.employee?.machine.name + " - 期限切れ" : emp.accountDetail.employee?.machine.name || "-",

            fleetNumber: emp.fleetNumber,
            isTranscribe: emp.isTranscribe,
            deviceCategory: emp.deviceCategory,
            groupName: emp.accountDetail.employee.groups || [],
            createdAtDate:
              emp.createdAtDate &&
              dayjs(emp.createdAtDate).format("YYYY/MM/DD"),
            appLastSeenDateTime:
              emp.appLastSeenDateTime && formatDate(emp.appLastSeenDateTime),
            appLoginDateTime:
              emp.appLoginDateTime && formatDate(emp.appLoginDateTime, true),
            appLogoutDateTime:
              emp.appLogoutDateTime && formatDate(emp.appLogoutDateTime, true),
            appVersion: emp.appVersion,
            timestamp: new Date().getTime(),
          };
        });
        setEmployeeData(() => response);
        setLoading(false);
        return;
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const updateSearchPayload = (event) => {
    setSearchPayload({
      ...searchPayload,
      [event.target.id]: event.target.value,
    });
  };

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
  let allData = [];
  const searchEmployee = async (e) => {
    e?.preventDefault();
    setLoading(true);
    searchPayload.appLastSeenDateTime =
      (searchPayload.appLastSeenDateTime &&
        dayjs(searchPayload.appLastSeenDateTime).format("YYYY-MM-DD") +
        "T00:00:00.000Z") ||
      "";
    searchPayload.appLoginDateTime =
      (searchPayload.appLoginDateTime &&
        dayjs(searchPayload.appLoginDateTime).format("YYYY-MM-DD") +
        "T00:00:00.000Z") ||
      "";

    searchPayload.createdAt =
      (searchPayload.createdAt &&
        dayjs(searchPayload.createdAt).format("YYYY-MM-DD") +
        "T00:00:00.000Z") ||
      "";

    searchPayload.appLogoutDateTime =
      (searchPayload.appLogoutDateTime &&
        dayjs(searchPayload.appLogoutDateTime).format("YYYY-MM-DD") +
        "T00:00:00.000Z") ||
      "";
    let Payload = {};
    for (let key in searchPayload) {
      if (searchPayload[key]) {
        Object.assign(Payload, { [key]: searchPayload[key] });
      }
    }

    try {
      Payload.offset = offsetSearch;
      Payload.limit = EmployeeSearchLimit;

      let { data: response } = await api.post("employees/search-emp", Payload);
      if (response.data.offset != "end") {
        allData = [...allData, ...response.data.Items];
        offsetSearch = response.data.offset;
        searchEmployee();
      }
      if (response.data.offset == "end") {
        allData = [...allData, ...response.data.Items];
        response = allData.map((emp, index) => {
          return {
            key: index,
            id: emp.id,
            password: emp.hint,
            radioNumber: emp.pttNo,
            userId: emp.id,
            email: emp.accountDetail.employee.email || "-",
            organization: emp.organizationName,
            name: emp.name || "-",
            numberOfRadioNumber: emp.licenseCount || "-",
            status: emp?.accountDetail?.employee?.status || "unknown",
            isActive: emp.isActive,
            onlineStatus:
              emp?.accountDetail?.employee?.onlineStatus || "offline",
            machine: emp.accountDetail.employee?.machine.id &&
              deviceList.includes(emp.accountDetail.employee?.machine.id) ? emp.accountDetail.employee?.machine.name + "- 期限切れ" : emp.accountDetail.employee?.machine.name || "-",

            fleetNumber: emp.fleetNumber,
            isTranscribe: emp.isTranscribe,
            deviceCategory: emp.deviceCategory,
            groupName: emp.accountDetail.employee.groups || [],
            createdAtDate:
              emp.createdAtDate &&
              dayjs(emp.createdAtDate).format("YYYY/MM/DD"),
            appLastSeenDateTime:
              emp.appLastSeenDateTime && formatDate(emp.appLastSeenDateTime),
            appLoginDateTime:
              emp.appLoginDateTime && formatDate(emp.appLoginDateTime, true),
            appLogoutDateTime:
              emp.appLogoutDateTime && formatDate(emp.appLogoutDateTime, true),
            appVersion: emp.appVersion,
            timestamp: new Date().getTime(),
          };
        });
        setEmployeeData(response);
        setSearchFlag(!searchFlag);
        setSelectAll(false);
        offsetSearch = "null";
        allData = [];
        setSelectedRows([]); // list will rerender but this one also need to clear for delete
        setLoading(false);
        return;
      }

    } catch (error) {
      setLoading(false);
      setErrors(error.message);
    } finally {
      setLoading(false);
    }
  };

  // import Function
  const handelImport = async (file) => {
    let files;

    // Helper function to convert and upload the file
    const convertAndUpload = async (uploadFunction) => {
      const res = await convertBase64(file);
      files = res.split(",")[1];
      let ids = selectedRows.map((el) => el.id);
      const payload = { file: files, operation: "dynamic" };

      if (activeButton === "employee") {
        payload.operation = "dynamic";
      }

      if (activeButton === "bulk") {
        payload.ids = ids;
      }

      if (activeButton === "bulk" && option === "settings") {
        delete payload.operation;
      }

      uploadFunction(payload);
    };

    if (activeButton == "employee") {
      // If activeButton is "employee", upload using uploadCsvFile
      await convertAndUpload(uploadCsvFile);
    } else if (activeButton == "bulk") {
      if (selectedRows.length <= 0) {
        // Display an error toast if no rows are selected
        toast("ユーザーを選択してください。", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          type: "error",
        });
        setImportModal(false);
        return;
      }
      const uploadFunctions = {
        settings: uploadSettingCsvFile,
        contacts: uploadContactCsvFile,
        groups: uploadGroupCsvFile,
      };
      const selectedUploadFunction = uploadFunctions[option];
      if (selectedUploadFunction) {
        // If option is valid, upload using the corresponding function
        await convertAndUpload(selectedUploadFunction);
      }
    }
  };

  async function uploadCsvFile(payload) {
    try {
      setLoading(true);
      payload.channel = new Date().getTime() + "id" + organizationIdForChannel + "csvUpload";
      setCsvUploadInitiated(() => payload.channel);
      setCurrentAPI("employees/import");
      let result = await api.post("employees/import", payload);
    } catch (err) {
      setLoading(false);
      subscriptionTrack.unsubscribe();
      toast("インポートに失敗しました", errorToastSettings);
    }
  }

  async function uploadSettingCsvFile(payload) {
    try {
      setLoading(true);
      payload.channel =
        new Date().getTime() + organizationIdForChannel + "uploadSetting";
      setCsvUploadInitiatedSettings(() => payload.channel);
      setCurrentAPI("employees/import-settings");
      let result = await api.post("employees/import-settings", payload);
    } catch (err) {
      setLoading(false);
      toast("インポートに失敗しました", errorToastSettings);
    }
  }

  async function uploadGroupCsvFile(payload) {
    try {
      setLoading(true);
      payload.channel =
        new Date().getTime() + organizationIdForChannel + "uploadGroup";
      setCsvUploadInitiated(() => payload.channel);
      setCurrentAPI("groups/import");
      let result = await api.post("groups/import", payload);
    } catch (err) {
      setLoading(false);
      toast("インポートに失敗しました", errorToastSettings);
    }
  }

  async function uploadContactCsvFile(payload) {
    try {
      setLoading(true);
      payload.channel =
        new Date().getTime() + organizationIdForChannel + "uploadContact";
      setCsvUploadInitiated(() => payload.channel);
      setCurrentAPI("contacts/import");
      let result = await api.post("contacts/import", payload);
    } catch (err) {
      setLoading(false);
      toast("インポートに失敗しました", errorToastSettings);
    }
  }

  const convertBase64 = function (file) {
    /* eslint-disable no-undef*/
    return new Promise((resolve) => {
      var reader = new FileReader();
      // Read file content on file loaded event
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      // Convert data to base64
      reader.readAsDataURL(file);
    });
  };
  return (
    <div id="userPage">
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div>
        {modelToggle && (
          <div>
            <ImportModal
              activeButton={activeButton}
              setActiveButton={setActiveButton}
              setSelectedOption={setSelectedOption}
              modelToggle={modelToggle}
              option={option}
              onCloseHandler={() => {
                setSelectedOption("settings");
                setModelToggle(false);
              }}
              onClickImport={handelImport}
            />
          </div>
        )}
        {exceededLimitOfExport && (
          <Modal
            height="auto"
            fontSize="text-xl"
            textColor="#19388B"
            text={"エクスポート"}
            onCloseHandler={() => {
              setExceededLimitOfExport(false);
            }}
            modalFooter={getExceededModalFooter}
          >
            <div className="flex flex-col">
              <div className="flex-grow text-sm">
                <div> 3000 人のユーザーを選択しました。</div>
                <div className="mb-6">
                  一度にエクスポートできるユーザーは 2500 人だけです。
                </div>
                <div className="mb-6">
                  最初の 2500 ユーザーがエクスポートされます。
                </div>
                <div>エクスポートしますか?</div>
              </div>
            </div>
          </Modal>
        )}
        {confirmationExport && (
          <Modal
            height="auto"
            fontSize="text-xl"
            textColor="#19388B"
            text={"エクスポート"}
            onCloseHandler={() => {
              setConfirmationExport(false);
            }}
            modalFooter={() => (
              <>
                <div className="w-full mx-auto">
                  <button
                    className="w-1/2 text-white py-2 px-2 rounded-lg bg-customBlue  hover:bg-[#5283B3]"
                    onClick={() => {
                      setExportModal(true);
                      setConfirmationExport(false);
                    }}
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          >
            <div className="flex flex-col mb-14">
              <div className="flex-grow text-sm">
                <div>最初の 2500 ユーザーがエクスポートされます。</div>
              </div>
            </div>
          </Modal>
        )}
        <form className="bg-white p-2 rounded-lg shadow-md mb-8">
          <div
            className="grid grid-cols-12 gap-2 max-h-72 overflow-y-auto md:h-auto px-2"
            id="search-panel-emp-list"
          >
            {/* <!-- Row 1 --> */}
            <div className="col-span-12 md:col-span-6 xl:col-span-2 mt-2 lg:mt-0">
              <SearchInput
                id="pttNo"
                value={searchPayload.pttNo}
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
                placeholder={"無線番号"}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2 md:mt-2 lg:mt-0">
              <SearchInput
                value={searchPayload.employeeId}
                placeholder={"ユーザーID"}
                id="employeeId"
                onSubmit={(e) => searchEmployee(e)}
                onInput={(e) => updateSearchPayload(e)}
              />
            </div>
            {Admin && (
              <div className="col-span-12 md:col-span-6 xl:col-span-2">
                {/* <SearchInput
                  value={searchPayload.organization}
                  placeholder={"会社名"}
                  id="organization"
                  onSubmit={(e) => searchEmployee(e)}
                  onInput={(e) => updateSearchPayload(e)}
                /> */}

                <input list="company_search" name="company_search" className={`w-full border flex  py-2.5 text-xs  pl-2  rounded-lg focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-center md:placeholder:text-left md:placeholder:pl-0
        dark:text-black`}
                  placeholder={intl.company_list_company_name}
                  id="organization"
                  onInput={(e) => updateSearchPayload(e)}
                  value={searchPayload.organization}

                />
                <datalist id="company_search">
                  {companyListDropdown.length > 0 && companyListDropdown.map((item) => { return (<option value={item.name} key={item.value}></option>) })}
                </datalist>

              </div>
            )}
            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <SearchInput
                value={searchPayload.device}
                placeholder={"端末名"}
                id="device"
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <SearchInput
                value={searchPayload.groups}
                placeholder={"グループ"}
                id="groups"
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2 custom-date-picker">
              <DatePicker
                placeholder="登録日(YYYY/MM/DD)"
                className="w-full py-[0.44rem] rounded-lg "
                id="createdAt"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "none",
                }}
                onChange={(dateObj, dateString) => {
                  let event = {
                    target: {
                      id: "createdAt",
                      value: dateString,
                    },
                  };
                  updateSearchPayload(event);
                }}
                locale={locale}
                format="YYYY/MM/DD"
                disabledDate={(current) => {
                  return current.valueOf() > Date.now();
                }}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2 custom-date-picker">
              <DatePicker
                placeholder="最終オンライン日(YYYY/MM/DD)"
                className="w-full py-[0.44rem] rounded-lg"
                id="appLastSeenDateTime"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "none",
                }}
                onChange={(dateObj, dateString) => {
                  let event = {
                    target: {
                      id: "appLastSeenDateTime",
                      value: dateString,
                    },
                  };
                  updateSearchPayload(event);
                }}
                locale={locale}
                format="YYYY/MM/DD"
                disabledDate={(current) => {
                  return current.valueOf() > Date.now();
                }}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2 custom-date-picker">
              <DatePicker
                placeholder="利用開始日(YYYY/MM/DD)"
                className="w-full py-[0.44rem] rounded-lg"
                id="appLoginDateTime"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "none",
                }}
                onChange={(dateObj, dateString) => {
                  let event = {
                    target: {
                      id: "appLoginDateTime",
                      value: dateString,
                    },
                  };
                  updateSearchPayload(event);
                }}
                locale={locale}
                format="YYYY/MM/DD"
                disabledDate={(current) => {
                  return current.valueOf() > Date.now();
                }}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>

            {/* <!-- Row 2 --> */}
            <div className="col-span-12 md:col-span-6 xl:col-span-2 custom-date-picker">
              <DatePicker
                placeholder="利用停止日(YYYY/MM/DD)"
                className="w-full py-[0.44rem] rounded-lg"
                id="appLogoutDateTime"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "none",
                }}
                onChange={(dateObj, dateString) => {
                  let event = {
                    target: {
                      id: "appLogoutDateTime",
                      value: dateString,
                    },
                  };
                  updateSearchPayload(event);
                }}
                locale={locale}
                format="YYYY/MM/DD"
                disabledDate={(current) => {
                  return current.valueOf() > Date.now();
                }}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>

            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <SearchInput
                id={"appVersion"}
                value={searchPayload.appVersion}
                placeholder={"バージョン"}
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <select
                id={"isActive"}
                className="w-full md:min-w-[100px] lg:min-w-[100px] border flex flex-auto md:flex-1  py-[8.5px] text-xs  pl-2 bg-[white] rounded-lg focus:outline-none placeholder-[#AEA8A8] 
                placeholder:text-center md:placeholder:text-left md:placeholder:pl-0 dark:text-black"
                value={searchPayload.isActive}
                onChange={(e) => updateSearchPayload(e)}
              >
                <option value="">--選択--</option>
                <option value={true}>オンライン</option>
                <option value={false}>オフライン</option>
              </select>
            </div>
            {!Admin && (
              <div className="col-span-12 md:col-span-6 xl:col-span-2"></div>
            )}

            <div className="col-span-12 md:col-span-6 xl:col-span-2 mb-2">
              <button
                className="bg-customBlue hover:bg-[#5283B3] w-full text-white font-medium text-sm w-full px-6 rounded-lg  py-[9px] px-4  rounded inline-flex items-center justify-center"
                onClick={searchEmployee}
              >
                {getIconWithClass()} <span className="ml-2">検索</span>
              </button>
            </div>
          </div>
        </form>

        <div className="flex justify-between mb-2 xl:mb-2 ">
          <div className="flex items-center ">
            <DynamicLabel
              text={intl.user_screen_label}
              alignment="text-center"
              fontSize="text-[22px]"
              fontWeight="font-medium"
              textColor="#000000"
              disabled={false}
            />
          </div>
          <div className="hidden  lg:flex gap-x-2">
            <IconOutlineBtn
              text={intl.company_list_company_import}
              textColor={"text-customBlue"}
              textBold={true}
              py={"xl:py-2 md:py-1.5 py-1.5"}
              px={" px-[33.5px]  md:px-[24.5px] xl:px-[24px]"}
              icon={() => importIcon()}
              borderColor={"border-customBlue"}
              onClick={async () => {
                await setModelToggle(() => false);
                await importHandler();
              }}
            />
            <IconOutlineBtn
              text={intl.company_list_company_export_title}
              textColor={"text-customBlue"}
              textBold={true}
              py={"xl:py-2 md:py-1.5 py-1.5"}
              px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
              icon={() => exportIcon()}
              borderColor={"border-customBlue"}
              onClick={() => {
                toast.dismiss();
                if (selectedRows.length <= 0) {
                  toast("ユーザーを選択してください。", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                    type: "error",
                  });
                  setExportModal(false);
                  return;
                }
                if (selectedRows.length > 2500) {
                  setExceededLimitOfExport(true);
                  return;
                }
                setExportModal(() => true);
              }}
            />
            {Admin && (
              <IconOutlineBtn
                text={intl.user_addUser_label}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2 md:py-1.5 py-1.5"}
                px={"xl:px-[32.5px] md:px-[22.5px] px-[22.5px]"}
                icon={() => editIcon(false)}
                borderColor={"border-customBlue"}
                onClick={() => router.push("/user/add")}
              />
            )}

            <IconBtn
              bg={"bg"}
              textColor={"text-white"}
              textBold={true}
              icon={() => deleteIcon(false)}
              onClick={() => {
                toast.dismiss();
                if (selectedRows.length <= 0) {
                  toast("ユーザーを選択してください。", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                    type: "error",
                  });
                  setDeleteModal(false);
                  return;
                }
                setDeleteModal(() => true);
              }}
              additionalClass="px-2 py-2 rounded-lg"
            />
          </div>
          <div className="flex lg:hidden">
            <span className="mr-2.5">
              <IconBtn
                textColor={"text-white"}
                textBold={true}
                icon={() => importIcon()}
                onClick={async () => {
                  setModelToggle(() => false);
                  await importHandler();
                }}
                bg="bg-transparent"
              />
            </span>
            <span className="mr-2.5">
              <IconBtn
                textColor={"text-white"}
                textBold={true}
                icon={() => exportIcon()}
                bg="bg-transparent"
                onClick={() => {
                  toast.dismiss();
                  if (selectedRows.length <= 0) {
                    toast("ユーザーを選択してください。", {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      theme: "colored",
                      type: "error",
                    });
                    setExportModal(false);
                    return;
                  }
                  setExportModal(() => true);
                }}
              />
            </span>
            <span className="mr-2.5">
              <IconBtn
                textColor={"text-white"}
                textBold={true}
                icon={() => editIcon()}
                additionalClass={"py-[8.5px] px-[8.5px]"}
                bg="bg-transparent"
                onClick={() => {
                  router.push("/user/add");
                }}
              />
            </span>
            <span>
              <span>
                <IconBtn
                  bg={"bg"}
                  textColor={"text-white"}
                  textBold={true}
                  icon={() => deleteIcon(false)}
                  additionalClass={"py-[7px] px-[8.5px]"}
                  onClick={() => {
                    toast.dismiss();
                    if (selectedRows.length <= 0) {
                      toast("ユーザーを選択してください。", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored",
                        type: "error",
                      });
                      setDeleteModal(false);
                      return;
                    }
                    setDeleteModal(() => true);
                  }}
                />
              </span>
            </span>
          </div>
        </div>
        <div className="mb-[5px] flex flex-col md:flex-row md:items-center justify-between ">
          <label
            key={"selectAll"}
            className="flex items-center text-customBlue"
          >
            <input
              type="checkbox"
              disabled={employeeData.length == 0}
              value={selectAll}
              checked={selectAll}
              className="h-[16px] w-[16px] text-[#19388B]  focus:ring-[#19388B] focus:ring-opacity-50 rounded-lg bg-[#19388B] bg-opacity-88 text-opacity-88"
              onChange={(evt) => {
                setSelectAll(evt.target.checked);
              }}
            />
            <span className="ml-1"> {"すべて選択"}</span>
          </label>
          <div className="w-full md:w-auto flex gap-x-3">
            {[
              { text: "利用可能", style: " bg-[#1AB517]" },
              { text: "利用不在", style: " bg-[#FFA500]" },
              { text: "利用停止", style: " bg-[#ED2E2E]" },
              { style: "bg-[#C6C3C3]", text: "利用不可" },
            ].map((el, index) => {
              return (
                <div className="flex gap-x-2 items-center" key={index}>
                  <div
                    className={`block rounded-full p-2 h-2 w-2 ${el.style}`}
                  ></div>
                  <div className="text-[#7B7B7B] text-sm">{el.text}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mb-[20px] relative" style={{ width: "100%" }}>
          <DataTable
            scrollVertical={tableHeight > 450 ? tableHeight : 450}
            scrollHorizontal={1400}
            loading={loading}
            rowSelectionFlag
            columns={columns}
            dataSource={employeeData}
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
            deleted={deleted}
            setCurrent={setCurrent}
            current={current}
            setPage={setPage}
            page={page}
          />
        </div>

        {editModal && (
          <Modal
            height="412px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={intl.help_settings_addition_modal_edit}
            onCloseHandler={setEditModal}
          >
            <div className="flex flex-col">
              <div className="flex flex-col mt-[20px] mb-[80px]">
                <TextPlain
                  type={"text"}
                  for={"editSettings"}
                  placeholder={""}
                  borderRound={"rounded-xl"}
                  padding={"p-[10px]"}
                  focus={
                    "focus:outline-none focus:ring-2  focus:ring-customBlue "
                  }
                  border={"border border-gray-300"}
                  bg={"bg-input-color "}
                  additionalClass={"block w-full pl-5 text-base pr-[30px]"}
                  label={intl.help_settings_addition_section_name}
                  labelColor={"#7B7B7B"}
                  id={"editSettings"}
                  value={editSettings}
                  onChange={setEditSettings}
                />
              </div>
              <div>
                <div className=" flex justify-end">
                  <IconLeftBtn
                    text={intl.help_settings_addition_keep}
                    textColor={"text-white font-semibold text-sm w-full"}
                    py={"py-3"}
                    bgColor={"bg-customBlue"}
                    textBold={true}
                    icon={() => {
                      return null;
                    }}
                    onClick={() => {
                      setEditModal(() => false);
                    }}
                  />
                </div>
              </div>
            </div>
          </Modal>
        )}

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
                <center>{qrCodeIcons()}</center>
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
            onCloseHandler={() => {
              setFileNameError("");
              setExportModal(false);
            }}
            contentPaddingTop="pt-1"
            contentPadding="px-0"
            modalFooter={getExportModalFooter}
          >
            <div className="flex flex-col">
              <div className="flex-grow">
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
                      additionalClass="block w-full pl-5 text-base pr-[30px] "
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
                  <div className="flex flex-col">
                    <DropdownMedium
                      borderRound={"rounded-xl"}
                      padding={"pt-[12px] pb-[12px] pr-[120px]"}
                      options={[
                        { id: 1, value: "1", label: "CSV" },
                        { id: 2, value: "2", label: "QR code" },
                      ]}
                      keys={"value"} // From options array
                      optionLabel={"label"} // From options array
                      border={"border border-gray-300"}
                      value={exportType}
                      focus={
                        "focus:outline-none focus:ring-2 focus:ring-customBlue"
                      }
                      bg={"bg-white"}
                      text={"text-sm"}
                      additionalClass={"block w-full pl-5"}
                      id={"Id"}
                      labelColor={"#7B7B7B"}
                      label={"ファイルタイプ"}
                      disabled={false}
                      isRequired={true}
                      defaultSelectNoOption
                      labelClass={"float-left"}
                      dropIcon={"70%"}
                      onChange={(val) => {
                        setExportType(val);
                      }}
                    />
                  </div>
                </form>
              </div>
            </div>
          </Modal>
        )}
        {deleteModal && (
          <Modal
            height="412px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={intl.help_settings_addition_delete}
            onCloseHandler={setDeleteModal}
            modalFooter={getDeleteModalFooter}
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[50px] pt-[50px] px-6 dark:text-black">
                {`ユーザーに関連付けられている PTT 番号、設定、グループ、連絡先も削除されます。 削除してよろしいですか？`}
              </div>
            </div>
          </Modal>
        )}
      </div>
      <a
        id={"linkCsv"}
        ref={CSVDownloadRef}
        href={downloadCsvLink}
        {...(shouldOpenInNewTab && { target: "_blank" })}
        download
        key={downloadCsvLink}
      ></a>
    </div>
  );
}
