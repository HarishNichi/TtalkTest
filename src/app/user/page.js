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
import { Modal as AntModal } from "antd";

import DropdownMedium from "@/components/Input/dropdownMedium";
import ImportModal from "@/components/ImportModal/empImport";
import GetIconQRCode from "@/components/Icons/qrCode";
import { useRouter } from "next/navigation";

import api from "@/utils/api";
import { addEmployee, getEmployee } from "@/redux/features/employee";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { decrypt } from "@/utils/decryption";
import { Button, DatePicker, Popover, Tooltip } from "antd";
import DeleteIcon from "@/components/Icons/deleteIcon";
import SearchInput from "@/components/Search/SearchInput";

import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
import { formatDate } from "@/validation/helperFunction";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/ja_JP";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/ja.js";
import { FaRegCopy } from "react-icons/fa";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import AddUser from "@/components/UserAdd/page";
import CopyButton from "@/components/Icons/copyButton";
import TerminalSettings from "@/components/TerminalSettingsPopup/page";
import TerminalSettingsPopup from "@/components/TerminalSettingsPopup/page";
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
Amplify.configure(gen);
export default function UserList() {
  const router = useRouter();
  const [editRecord, setRecord] = useState(null);
  const [fileNameError, setFileNameError] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const dispatch = useAppDispatch();
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [comCreated, setComCreated] = useState(false);
  const [settingscomCreated, setSettingsComCreated] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleSettingsCloseModal = () => {
    setIsSettingsModalOpen(false);
  };

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
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: intl.login_password,
      dataIndex: "password",
      render: (text, record) => {
        const Msg = ({ closeToast, toastProps, password, userId }) => (
          <div>
            <div>
              {intl.user_userId_label} : {userId}
            </div>
            <div className="flex gap-x-[15px]">
              {intl.login_password_placeholder} : {password}{" "}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(password);
                  toast.dismiss();
                  toast.success(intl.password_copy, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                  });
                }}
              >
                <FaRegCopy />
              </button>
            </div>
          </div>
        );

        return (
          <div className="text-left">
            <div className="flex hover:text-[#69b1ff] text-customBlue cursor-pointer">
              ******
              <CopyButton
                className="ml-2 text-[#69b1ff] "
                onClick={async (event) => {
                  event.stopPropagation();
                  toast.dismiss();
                  setLoading(true);
                  let response = await api.post(
                    `employees/hint?id=${record.id}`
                  );
                  let password = response.data.data;
                  password = decrypt(password);
                  copy(password);
                  setLoading(false);
                  toast.dismiss();
                  toast.success(intl.user_password_copy, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                  });
                }}
              />
            </div>
            {/* </button> */}
          </div>
        );
      },
      width: 105,
      align: "left",
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
      title: intl.furigana,
      dataIndex: "furigana",
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
      width: 150,
      align: "left",
      sorter: (a, b) => a.radioNumber.localeCompare(b.radioNumber),
      sortDirections: ["ascend", "descend", "ascend"],
    },

    {
      title: intl.machineName,
      dataIndex: "machine",
      render: (text) => {
        let content = <span className="text-white">{text}</span>;
        return (
          <Popover content={content} color="#19388B">
            <a className="text-ellipsis">{text}</a>
          </Popover>
        );
      },
      width: 115,
      align: "left",
      sorter: (a, b) => a.machine.localeCompare(b.machine),
      sortDirections: ["ascend", "descend", "ascend"],
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
              <div className={`bg-customGreen h-2 w-2 p-2 rounded-full `}></div>
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
              <div className={`bg-customGray h-2 w-2 p-2 rounded-full`}></div>
            </div>
          );
        }
        if (record.status == "unknown") {
          roundStatus = (
            <div className="w-full flex justify-center h-full">
              <div
                className={`bg-white border border-customGray h-2 w-2 p-2 rounded-full`}
              ></div>
            </div>
          );
        }

        return (
          <div className="flex  items-center">
            <div>{roundStatus}</div>
            <div style={{ width: "105px" }}>
              <div
                className={`rounded-[5px] cursor-pointer  pt-[5px] pb-[5px] pl-[5px]  focus:outline-none focus:ring-2 focus:ring-customBlue text-[16px] text-black block w-full  text-center
            `}
              >
                {text ? intl.user_online : intl.user_offline}
              </div>
            </div>
          </div>
        );
      },
      width: 200,
      align: "left",
    },
    {
      title: intl.tab_group_label,
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
      title: intl.user_registration_date_time,
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
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: intl.user_last_online_date_time,
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
      title: intl.usage_start_date,
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
      title: intl.usage_suspension_date,
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
      title: intl.user_version,
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
      sortDirections: ["ascend", "descend", "ascend"],
    };
    companyColumns.splice(5, 0, org);
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
  const [csvUploadInitiatedSettings, setCsvUploadInitiatedSettings] =
    useState(null);
  const [currentAPI, setCurrentAPI] = useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = useState(null);
  const [companyListDropdown, setCompanyListDropdown] = useState([]);
  const [current, setCurrent] = useState(1);
  const [page, setPage] = useState(50);
  const [count, setCount] = useState(1);

  const [searchPayload, setSearchPayload] = useState({
    employeeId: "",
    furigana: "",
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
      toast(intl.user_please_select_user, {
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
      toast(intl.user_deletion_completed, successToastSettings);
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
        setFileNameError(intl.user_file_name_required);
        return;
      }
      if (!csvFileNameRegex.test(csvFileName)) {
        setFileNameError(intl.user_check_file_name);
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
        };
      } else {
        toast(intl.user_please_select_user, errorToastSettings);
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
      toast(intl.user_file_export_failed, errorToastSettings);
    }
  }

  function getExportModalFooter() {
    return (
      <div className="px-[40px] pt-[20px] pb-[40px]">
        <IconLeftBtn
          text={intl.company_list_company_export_title}
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
      </div>
    );
  }
  function getQrModalFooter() {
    return (
      <div className="flex gap-x-3">
        <div>
          <IconLeftBtn
            text={intl.help_settings_addition_modal_cancel}
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
            text={intl.user_download}
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
            text={intl.user_remote_wipe_no_btn}
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
            text={intl.user_remote_wipe_yes_btn}
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
      <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
        <Button
          key="cancel"
          className="flex-1 h-[40px] text-[#19388B] border border-[#19388B] hover:bg-[#e0e7ff] focus:outline-none focus:ring-2 focus:ring-[#19388B] focus:ring-opacity-50"
          onClick={() => {
            setDeleteModal(() => false);
          }}
        >
          {intl.help_settings_addition_modal_cancel}
        </Button>
        <Button
          key="delete"
          className="flex-1 bg-[#BA1818] h-[40px] text-white no-hover focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
          onClick={() => {
            deleteEmployee(selectedRows);
          }}
        >
          {intl.help_settings_addition_delete}({selectedRows.length})
        </Button>
      </div>
    );
  }
  function qrCodeIcons() {
    return <GetIconQRCode />;
  }
  function copyIcon() {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.0385 11.6667C5.70172 11.6667 5.41667 11.5501 5.18333 11.3167C4.95 11.0834 4.83333 10.7984 4.83333 10.4616V2.87191C4.83333 2.53514 4.95 2.25008 5.18333 2.01675C5.41667 1.78341 5.70172 1.66675 6.0385 1.66675H11.6282C11.9649 1.66675 12.25 1.78341 12.4833 2.01675C12.7167 2.25008 12.8333 2.53514 12.8333 2.87191V10.4616C12.8333 10.7984 12.7167 11.0834 12.4833 11.3167C12.25 11.5501 11.9649 11.6667 11.6282 11.6667H6.0385ZM6.0385 10.6667H11.6282C11.6795 10.6667 11.7265 10.6454 11.7692 10.6026C11.8119 10.5599 11.8333 10.5129 11.8333 10.4616V2.87191C11.8333 2.82058 11.8119 2.77358 11.7692 2.73091C11.7265 2.68814 11.6795 2.66675 11.6282 2.66675H6.0385C5.98717 2.66675 5.94017 2.68814 5.8975 2.73091C5.85472 2.77358 5.83333 2.82058 5.83333 2.87191V10.4616C5.83333 10.5129 5.85472 10.5599 5.8975 10.6026C5.94017 10.6454 5.98717 10.6667 6.0385 10.6667ZM3.70517 14.0001C3.36839 14.0001 3.08333 13.8834 2.85 13.6501C2.61667 13.4167 2.5 13.1317 2.5 12.7949V4.70525C2.5 4.56336 2.54789 4.44453 2.64367 4.34875C2.73933 4.25308 2.85811 4.20525 3 4.20525C3.14189 4.20525 3.26072 4.25308 3.3565 4.34875C3.45217 4.44453 3.5 4.56336 3.5 4.70525V12.7949C3.5 12.8462 3.52139 12.8932 3.56417 12.9359C3.60683 12.9787 3.65383 13.0001 3.70517 13.0001H9.79483C9.93672 13.0001 10.0556 13.0479 10.1513 13.1436C10.247 13.2394 10.2948 13.3582 10.2948 13.5001C10.2948 13.642 10.247 13.7607 10.1513 13.8564C10.0556 13.9522 9.93672 14.0001 9.79483 14.0001H3.70517Z"
          fill="#19388B"
        />
      </svg>
    );
  }
  function importIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_5185_3186)">
          <path
            d="M12.0002 15.4115C11.8797 15.4115 11.7676 15.3923 11.6637 15.3538C11.5599 15.3154 11.4612 15.2494 11.3675 15.1558L8.25799 12.0463C8.10933 11.8974 8.03591 11.7233 8.03774 11.524C8.03974 11.3247 8.11316 11.1474 8.25799 10.9922C8.41316 10.8373 8.59133 10.7572 8.79249 10.752C8.99383 10.7468 9.17208 10.8218 9.32724 10.977L11.2502 12.9V5.25C11.2502 5.03717 11.3221 4.859 11.4657 4.7155C11.6092 4.57183 11.7874 4.5 12.0002 4.5C12.2131 4.5 12.3912 4.57183 12.5347 4.7155C12.6784 4.859 12.7502 5.03717 12.7502 5.25V12.9L14.6732 10.977C14.8221 10.8283 14.9987 10.7549 15.203 10.7568C15.4075 10.7588 15.5873 10.8373 15.7425 10.9922C15.8873 11.1474 15.9623 11.3231 15.9675 11.5192C15.9727 11.7154 15.8977 11.8911 15.7425 12.0463L12.633 15.1558C12.5393 15.2494 12.4406 15.3154 12.3367 15.3538C12.2329 15.3923 12.1207 15.4115 12.0002 15.4115ZM6.30799 19.5C5.80283 19.5 5.37524 19.325 5.02524 18.975C4.67524 18.625 4.50024 18.1974 4.50024 17.6923V15.7308C4.50024 15.5179 4.57208 15.3398 4.71574 15.1962C4.85924 15.0526 5.03741 14.9808 5.25024 14.9808C5.46308 14.9808 5.64124 15.0526 5.78474 15.1962C5.92841 15.3398 6.00024 15.5179 6.00024 15.7308V17.6923C6.00024 17.7692 6.03233 17.8398 6.09649 17.9038C6.16049 17.9679 6.23099 18 6.30799 18H17.6925C17.7695 18 17.84 17.9679 17.904 17.9038C17.9682 17.8398 18.0002 17.7692 18.0002 17.6923V15.7308C18.0002 15.5179 18.0721 15.3398 18.2157 15.1962C18.3592 15.0526 18.5374 14.9808 18.7502 14.9808C18.9631 14.9808 19.1412 15.0526 19.2847 15.1962C19.4284 15.3398 19.5002 15.5179 19.5002 15.7308V17.6923C19.5002 18.1974 19.3252 18.625 18.9752 18.975C18.6252 19.325 18.1977 19.5 17.6925 19.5H6.30799Z"
            fill="#19388B"
          />
        </g>
        <defs>
          <clipPath id="clip0_5185_3186">
            <rect
              width="24"
              height="24"
              fill="white"
              transform="translate(0.000244141)"
            />
          </clipPath>
        </defs>
      </svg>
    );
  }

  function exportIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_5219_7792)">
          <path
            d="M6.30775 19.5C5.80258 19.5 5.375 19.325 5.025 18.975C4.675 18.625 4.5 18.1974 4.5 17.6922V15.7307C4.5 15.5179 4.57183 15.3397 4.7155 15.1962C4.859 15.0525 5.03717 14.9807 5.25 14.9807C5.46283 14.9807 5.641 15.0525 5.7845 15.1962C5.92817 15.3397 6 15.5179 6 15.7307V17.6922C6 17.7692 6.03208 17.8397 6.09625 17.9037C6.16025 17.9679 6.23075 18 6.30775 18H17.6923C17.7692 18 17.8398 17.9679 17.9038 17.9037C17.9679 17.8397 18 17.7692 18 17.6922V15.7307C18 15.5179 18.0718 15.3397 18.2155 15.1962C18.359 15.0525 18.5372 14.9807 18.75 14.9807C18.9628 14.9807 19.141 15.0525 19.2845 15.1962C19.4282 15.3397 19.5 15.5179 19.5 15.7307V17.6922C19.5 18.1974 19.325 18.625 18.975 18.975C18.625 19.325 18.1974 19.5 17.6923 19.5H6.30775ZM11.25 7.38845L9.327 9.31145C9.17817 9.46012 9.00158 9.53354 8.79725 9.5317C8.59275 9.5297 8.41292 9.45112 8.25775 9.29595C8.11292 9.14095 8.03792 8.96537 8.03275 8.7692C8.02758 8.57304 8.10258 8.39737 8.25775 8.2422L11.3672 5.1327C11.4609 5.03904 11.5597 4.97304 11.6635 4.9347C11.7673 4.8962 11.8795 4.87695 12 4.87695C12.1205 4.87695 12.2327 4.8962 12.3365 4.9347C12.4403 4.97304 12.5391 5.03904 12.6328 5.1327L15.7423 8.2422C15.8909 8.39087 15.9643 8.56495 15.9625 8.76445C15.9605 8.96379 15.8871 9.14095 15.7423 9.29595C15.5871 9.45112 15.4089 9.53129 15.2078 9.53645C15.0064 9.54162 14.8282 9.46662 14.673 9.31145L12.75 7.38845V15.0385C12.75 15.2513 12.6782 15.4295 12.5345 15.573C12.391 15.7166 12.2128 15.7885 12 15.7885C11.7872 15.7885 11.609 15.7166 11.4655 15.573C11.3218 15.4295 11.25 15.2513 11.25 15.0385V7.38845Z"
            fill="#19388B"
          />
        </g>
        <defs>
          <clipPath id="clip0_5219_7792">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }
  function settingsIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_5691_1807)">
          <path
            d="M10.8922 21.5C10.5512 21.5 10.2567 21.3868 10.0087 21.1605C9.76058 20.9343 9.60958 20.6558 9.55574 20.325L9.31149 18.4538C9.04366 18.3641 8.76899 18.2385 8.48749 18.077C8.20616 17.9153 7.95458 17.7423 7.73274 17.5577L5.99999 18.2943C5.68583 18.4328 5.37016 18.4462 5.05299 18.3345C4.73566 18.223 4.48916 18.0205 4.31349 17.727L3.18649 15.773C3.01083 15.4795 2.96024 15.1689 3.03474 14.8413C3.10908 14.5138 3.27958 14.2436 3.54624 14.0308L5.04424 12.9058C5.02124 12.7571 5.00491 12.6077 4.99524 12.4578C4.98558 12.3077 4.98074 12.1583 4.98074 12.0095C4.98074 11.8673 4.98558 11.7228 4.99524 11.576C5.00491 11.4292 5.02124 11.2686 5.04424 11.0943L3.54624 9.96925C3.27958 9.75642 3.11066 9.48458 3.03949 9.15375C2.96833 8.82308 3.02058 8.51092 3.19624 8.21725L4.31349 6.29225C4.48916 6.00508 4.73566 5.80417 5.05299 5.6895C5.37016 5.57467 5.68583 5.5865 5.99999 5.725L7.72299 6.452C7.96416 6.261 8.22158 6.08633 8.49524 5.928C8.76891 5.76967 9.03783 5.64242 9.30199 5.54625L9.55574 3.675C9.60958 3.34417 9.76058 3.06567 10.0087 2.8395C10.2567 2.61317 10.5512 2.5 10.8922 2.5H13.1077C13.4487 2.5 13.7432 2.61317 13.9912 2.8395C14.2394 3.06567 14.3904 3.34417 14.4442 3.675L14.6885 5.55575C14.9885 5.66475 15.2599 5.792 15.5027 5.9375C15.7457 6.083 15.991 6.2545 16.2385 6.452L18.0097 5.725C18.3237 5.5865 18.6394 5.57467 18.9567 5.6895C19.2741 5.80417 19.5205 6.00508 19.696 6.29225L20.8135 8.227C20.9892 8.5205 21.0397 8.83108 20.9652 9.15875C20.8909 9.48625 20.7204 9.75642 20.4537 9.96925L18.9172 11.123C18.9531 11.2845 18.9727 11.4355 18.976 11.576C18.9792 11.7163 18.9807 11.8577 18.9807 12C18.9807 12.1358 18.9775 12.274 18.971 12.4145C18.9647 12.5548 18.9417 12.7154 18.902 12.8963L20.4095 14.0308C20.6762 14.2436 20.8483 14.5138 20.926 14.8413C21.0035 15.1689 20.9544 15.4795 20.7787 15.773L19.646 17.7172C19.4705 18.0109 19.2225 18.2135 18.902 18.325C18.5815 18.4365 18.2642 18.423 17.95 18.2845L16.2385 17.548C15.991 17.7455 15.7384 17.9202 15.4807 18.072C15.2231 18.224 14.959 18.3481 14.6885 18.4443L14.4442 20.325C14.3904 20.6558 14.2394 20.9343 13.9912 21.1605C13.7432 21.3868 13.4487 21.5 13.1077 21.5H10.8922ZM11 20H12.9655L13.325 17.3212C13.8353 17.1879 14.3017 16.9985 14.724 16.753C15.1465 16.5073 15.5539 16.1916 15.9462 15.8057L18.4307 16.85L19.4155 15.15L17.2462 13.5155C17.3296 13.2565 17.3862 13.0026 17.4162 12.7537C17.4464 12.5051 17.4615 12.2538 17.4615 12C17.4615 11.7397 17.4464 11.4884 17.4162 11.2463C17.3862 11.0039 17.3296 10.7564 17.2462 10.5038L19.4345 8.85L18.45 7.15L15.9365 8.2095C15.6018 7.85183 15.2009 7.53583 14.7337 7.2615C14.2664 6.98717 13.7937 6.79292 13.3155 6.67875L13 4H11.0155L10.6845 6.66925C10.1743 6.78975 9.70324 6.97433 9.27124 7.223C8.83908 7.47183 8.42683 7.79233 8.03449 8.1845L5.54999 7.15L4.56549 8.85L6.72499 10.4595C6.64166 10.6968 6.58333 10.9437 6.54999 11.2C6.51666 11.4563 6.49999 11.7262 6.49999 12.0095C6.49999 12.2698 6.51666 12.525 6.54999 12.775C6.58333 13.025 6.63849 13.2718 6.71549 13.5155L4.56549 15.15L5.54999 16.85L8.02499 15.8C8.40449 16.1897 8.81024 16.5089 9.24224 16.7578C9.67441 17.0064 10.152 17.1974 10.675 17.3307L11 20ZM12.0115 15C12.8435 15 13.5515 14.708 14.1355 14.124C14.7195 13.54 15.0115 12.832 15.0115 12C15.0115 11.168 14.7195 10.46 14.1355 9.876C13.5515 9.292 12.8435 9 12.0115 9C11.1692 9 10.4586 9.292 9.87974 9.876C9.30091 10.46 9.01149 11.168 9.01149 12C9.01149 12.832 9.30091 13.54 9.87974 14.124C10.4586 14.708 11.1692 15 12.0115 15Z"
            fill="#214BB9"
          />
        </g>
        <defs>
          <clipPath id="clip0_5691_1807">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
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
        let today = data?.todayDatetodayDate || dayjs().format("YYYY-MM-DD");
        data.Items.map((item) => {
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            if (!futureDate) {
              let isValid =
                dayjs(today).isSameOrBefore(item.endDate) &&
                dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                item.name = item.name + intl.user_expired;
                deviceListMap.push(item.id);
                setDeviceList((prv) => [...prv, item.id]);
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
  }, [count]);

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
    console.log((current - 1) * page, maxCurrent);
    try {
      if (employeeData.length > 0) {
        let temp = employeeData.map((el, index) => {
          if (
            el.radioNumber == received.pttNo &&
            index >= (current - 1) * page &&
            index <= maxCurrent
          ) {
            el.status = received?.status;
          }
          return el;
        });
        setEmployeeData(temp);
      }
    } catch (err) {
      console.log(err);
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
        hasMap.add(data.token);
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
              toast(intl.user_imported_successfully, successToastSettings);
              Admin ? fetchOrg() : withDeviceDetails([]);
            }

            if (ecount > 0) {
              toast(`${ecount} intl.user_failed_to_import`, errorToastSettings);
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

    const subscription = gen.subscribe(
      csvUploadInitiatedSettings,
      ({ data }) => {
        let dataReceived = JSON.parse(data);
        if (!hasMap.has(dataReceived.token)) {
          hasMap.add(dataReceived.token);
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
              toast(intl.user_imported_successfully, successToastSettings);
              Admin ? fetchOrg() : withDeviceDetails([]);
            }

            if (ecount > 0) {
              toast(`${ecount} intl.user_failed_to_import`, errorToastSettings);
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
      }
    );
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
      setCompanyListDropdown(() => projectionList.data.Items);
      await withDeviceDetails(projectionList.data.Items);
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
      console.log(err);
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
            furigana: emp.furigana,
            userId: emp.id,
            email: emp.accountDetail.employee.email || "-",
            organization: orgName,
            name: emp.name || "-",
            numberOfRadioNumber: emp.licenseCount || "-",
            status: emp?.accountDetail?.employee?.status || "unknown",
            isActive: emp.isActive,
            onlineStatus:
              emp?.accountDetail?.employee?.onlineStatus || "offline",
            machine:
              emp.accountDetail.employee?.machine.id &&
              expDeviceList.includes(emp.accountDetail.employee?.machine.id)
                ? emp.accountDetail.employee?.machine.name + intl.user_expired
                : emp.accountDetail.employee?.machine.name || "-",

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
            furigana: emp.furigana,
            userId: emp.id,
            email: emp.accountDetail.employee.email || "-",
            organization: emp.organizationName,
            name: emp.name || "-",
            numberOfRadioNumber: emp.licenseCount || "-",
            status: emp?.accountDetail?.employee?.status || "unknown",
            isActive: emp.isActive,
            onlineStatus:
              emp?.accountDetail?.employee?.onlineStatus || "offline",
            machine:
              emp.accountDetail.employee?.machine.id &&
              deviceList.includes(emp.accountDetail.employee?.machine.id)
                ? emp.accountDetail.employee?.machine.name + intl.user_expired
                : emp.accountDetail.employee?.machine.name || "-",

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
        toast(intl.user_please_select_user, {
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
      payload.channel =
        new Date().getTime() + "id" + organizationIdForChannel + "csvUpload";
      setCsvUploadInitiated(() => payload.channel);
      setCurrentAPI("employees/import");
      let result = await api.post("employees/import", payload);
    } catch (err) {
      setLoading(false);
      subscriptionTrack.unsubscribe();
      toast(intl.user_import_failed, errorToastSettings);
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
      toast(intl.user_import_failed, errorToastSettings);
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
      toast(intl, errorToastSettings);
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
      toast(intl.user_import_failed, errorToastSettings);
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
      <div className="flex justify-between mb-[16px] xl:mb-2 ">
        <div className="flex items-center ">
          <DynamicLabel
            text={intl.dashboard_user_list}
            alignment="text-center"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#000000"
            disabled={false}
          />
        </div>
        <div className="hidden  lg:flex gap-x-2">
          <IconOutlineBtn
            text={intl.company_list_company_import}
            textColor={"text-customBlue"}
            borderColor={"border-none"}
            textBold={true}
            py={"xl:py-2 md:py-1.5 py-1.5"}
            px={" px-[33.5px]  md:px-[24.5px] xl:px-[24px]"}
            icon={() => importIcon()}
            onClick={async () => {
              await setModelToggle(() => false);
              await importHandler();
            }}
          />

          {Admin && (
            <IconOutlineBtn
              text={intl.user_addUser_label}
              textColor={"text-customBlue"}
              borderColor={"border-none"}
              textBold={true}
              py={"xl:py-2 md:py-1.5 py-1.5"}
              px={"xl:px-[32.5px] md:px-[22.5px] px-[22.5px]"}
              icon={() => editIcon(false)}
              onClick={() => {
                setIsModalOpen(true);
              }}
            />
          )}
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
              bg="bg-transparent border-none"
            />
          </span>

          <span className="mr-2.5">
            <IconBtn
              textColor={"text-white"}
              textBold={true}
              icon={() => editIcon()}
              bg="bg-transparent border-none"
              onClick={() => {
                setIsModalOpen(true);
              }}
            />
          </span>
          <span></span>
        </div>
      </div>
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
            text={intl.company_list_company_export_title}
            onCloseHandler={() => {
              setExceededLimitOfExport(false);
            }}
            modalFooter={getExceededModalFooter}
          >
            <div className="flex flex-col">
              <div className="flex-grow text-sm">
                <div> {users_selected}</div>
                <div className="mb-6">{intl.export_message}</div>
                <div className="mb-6">{intl.first_exported}</div>
                <div>{intl.user_want_to_export}</div>
              </div>
            </div>
          </Modal>
        )}
        {confirmationExport && (
          <Modal
            height="auto"
            fontSize="text-xl"
            textColor="#19388B"
            text={intl.company_list_company_export_title}
            onCloseHandler={() => {
              setConfirmationExport(false);
            }}
            modalFooter={() => (
              <>
                <div className="w-full mx-auto">
                  <button
                    className="w-1/2 text-white py-2 px-2 rounded-lg bg-customBlue  hover:bg-[#214BB9]"
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
                <div>{intl.first_exported}</div>
              </div>
            </div>
          </Modal>
        )}
        <form className="rounded-lg  mb-[16px]">
          <div
            className="grid grid-cols-12 gap-2 max-h-72 overflow-y-auto md:h-auto"
            id="search-panel-emp-list"
          >
            {/* <!-- Row 1 --> */}
            <div className="col-span-12 md:col-span-6 xl:col-span-2 mt-2 lg:mt-0">
              <SearchInput
                id="pttNo"
                value={searchPayload.pttNo}
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
                placeholder={intl.company_list_company_radioNumber}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2 md:mt-2 lg:mt-0">
              <SearchInput
                value={searchPayload.employeeId}
                placeholder={intl.login_email}
                id="employeeId"
                onSubmit={(e) => searchEmployee(e)}
                onInput={(e) => updateSearchPayload(e)}
              />
            </div>
            {Admin && (
              <div className="col-span-12 md:col-span-6 xl:col-span-2">
                <input
                  list="company_search"
                  name="company_search"
                  className={`w-full border flex   text-[16px]  p-2 rounded focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-left placeholder:text-[16px] md:placeholder:text-left md:placeholder:pl-0
        dark:text-black h-[40px] border border-[#E7E7E9]`}
                  placeholder={intl.company_list_company_name}
                  id="organization"
                  onInput={(e) => updateSearchPayload(e)}
                  value={searchPayload.organization}
                />
                <datalist id="company_search">
                  {companyListDropdown.length > 0 &&
                    companyListDropdown.map((item) => {
                      return (
                        <option value={item.name} key={item.value}></option>
                      );
                    })}
                </datalist>
              </div>
            )}
            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <SearchInput
                value={searchPayload.device}
                placeholder={intl.machineName}
                id="device"
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <SearchInput
                value={searchPayload.groups}
                placeholder={intl.tab_group_label}
                id="groups"
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2 custom-date-picker">
              <DatePicker
                placeholder={intl.user_registration_date_without_ddmmyy}
                className="w-full  rounded h-[40px] placeholder:text-[16px] text-[16px] p-2 border border-[#E7E7E9]"
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
                placeholder={intl.user_last_online_date_time}
                className="w-full  rounded h-[40px] placeholder:text-[16px] text-[16px] p-2 border border-[#E7E7E9]"
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
                placeholder={intl.usage_start_date}
                className="w-full  rounded h-[40px] placeholder:text-[16px] text-[16px] p-2 border border-[#E7E7E9]"
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
                placeholder={intl.usage_suspension_date}
                className="w-full  rounded h-[40px] placeholder:text-[16px] text-[16px] p-2 border border-[#E7E7E9]"
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
                placeholder={intl.user_version}
                onInput={(e) => updateSearchPayload(e)}
                onSubmit={(e) => searchEmployee(e)}
              />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-2">
              <select
                id={"isActive"}
                className={`w-full md:min-w-[100px] lg:min-w-[100px] border flex flex-auto md:flex-1  text-[16px]  p-2 bg-[white] rounded-lg focus:outline-none placeholder-[#AEA8A8] 
                placeholder:text-center placeholder:text-[16px] rounded h-[40px] border border-[#E7E7E9] md:placeholder:text-left md:placeholder:pl-0 dark:text-black h-[38px] ${
                  searchPayload.isActive == ""
                    ? "text-[#85868B] text-[16px]"
                    : "text-black text-[16px]"
                }`}
                value={searchPayload.isActive}
                onChange={(e) => updateSearchPayload(e)}
              >
                <option className="text-[#85868B]" value="">
                  {intl.form_component_status}
                </option>
                <option className="text-black" value={true}>
                  {intl.user_online}
                </option>
                <option className="text-black" value={false}>
                  {intl.user_offline}
                </option>
              </select>
            </div>
            {!Admin && (
              <div className="col-span-12 md:col-span-6 xl:col-span-2"></div>
            )}

            <div className="col-span-12 md:col-span-6 xl:col-span-2 mb-2">
              <button
                className="bg-customBlue hover:bg-[#214BB9] w-full text-white font-medium text-sm w-full px-6 rounded-lg  py-[9px] px-4  rounded inline-flex items-center justify-center"
                onClick={searchEmployee}
              >
                {getIconWithClass()}{" "}
                <span className="ml-2">{intl.dashboard_layout_search_btn}</span>
              </button>
            </div>
          </div>
        </form>

        <div className="mb-[16px] flex flex-col md:flex-row md:items-center justify-between ">
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
            <span className="ml-1"> {intl.user_selectAll}</span>
          </label>
          <div className="w-full md:w-auto flex gap-x-3">
            {[
              { text: intl.user_online, style: " bg-[#1AB517]" },
              { text: intl.user_away, style: " bg-[#FFA500]" },
              { text: intl.user_offline, style: " bg-customGray" },
              {
                style: "bg-white border border-customGray",
                text: intl.user_status_unkown,
              },
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
        <div className=" relative" style={{ width: "100%" }}>
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
              router.push("/user-details");
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
        {selectedRows.length > 0 && (
          <div className="mt-[16px] flex justify-between items-center  bg-white py-3 px-[4vw] shadow-lg">
            {/* Left side: Buttons */}
            <div className="text-base font-semibold">
              {selectedRows.length}
              {intl.user_item_selected}
            </div>
            <div className="flex space-x-4">
              <IconOutlineBtn
                text={intl.user_change_settings}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2 md:py-1.5 py-1.5"}
                px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                icon={() => settingsIcon()}
                borderColor={"border-customBlue"}
                onClick={async () => {
                  const params = {
                    params: {
                      id: selectedRows[0].id,
                    },
                  };
                  let { data } = await api.get("employees/get", params);
                  let emp = data.data.Item;
                  dispatch(getEmployee(emp));
                  dispatch(addEmployee(selectedRows[0]));
                  setIsSettingsModalOpen(true);
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
                    toast(intl.user_please_select_user, {
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
              <IconOutlineBtn
                text={intl.help_settings_addition_delete}
                textColor="text-[#BA1818]"
                textBold={true}
                borderColor="border-[#BA1818]"
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                icon={() => deleteIcon()}
                onClick={() => {
                  toast.dismiss();
                  if (selectedRows.length <= 0) {
                    toast(intl.user_please_select_user, {
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
            </div>
          </div>
        )}

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
                  border={"border border-[#e7e7e9]"}
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
          <AntModal
            width={385}
            title={
              <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-[20px] text-center">
                {intl.company_list_company_export_title}
              </div>
            }
            open={exportModal}
            onCancel={() => {
              setExportModal(false);
              setCsvFileName("");
              setFileNameError("");
            }}
            footer={getExportModalFooter}
            centered={true}
          >
            <div className="flex flex-col">
              <div className="flex-grow">
                <form className="grid grid-cols-1 gap-y-3 px-[40px]">
                  <div className="flex flex-col">
                    <TextPlain
                      type="text"
                      for={"id"}
                      placeholder={intl.user_history_settings_file_name}
                      borderRound="rounded "
                      padding="p-[8px]"
                      focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                      border="border border-[#E7E7E9]"
                      bg="bg-white"
                      additionalClass="block w-full  text-[16px] h-[40px] "
                      label={intl.user_history_settings_file_name}
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
                  <div className="flex flex-col ">
                    <DropdownMedium
                      borderRound={"rounded"}
                      padding={" p-[8px]"}
                      options={[
                        { id: 1, value: "1", label: "CSV" },
                        { id: 2, value: "2", label: "QR code" },
                      ]}
                      keys={"value"} // From options array
                      optionLabel={"label"} // From options array
                      border={"border border-[#E7E7E9]"}
                      value={exportType}
                      focus={
                        "focus:outline-none focus:ring-2 focus:ring-customBlue h-[40px]"
                      }
                      bg={"bg-white"}
                      text={"text-[16px]"}
                      additionalClass={"block w-full "}
                      id={"Id"}
                      labelColor={"#7B7B7B"}
                      label={intl.user_file_type}
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
          </AntModal>
        )}
        {isModalOpen && (
          <AntModal
            open={isModalOpen}
            footer={null}
            onCancel={handleCloseModal}
          >
            <div className="flex flex-col">
              <AddUser
                setIsModalOpen={setIsModalOpen}
                setComCreated={setComCreated}
                setCount={setCount}
                count={count}
              />
            </div>
          </AntModal>
        )}
        {isSettingsModalOpen && (
          <AntModal
            open={isSettingsModalOpen}
            footer={null}
            onCancel={handleSettingsCloseModal}
            width={720}
            centered
            className="my-[70px]"
          >
            <div className="flex flex-col p-[24px]">
              <TerminalSettingsPopup
                isModal={true}
                selectedRows={selectedRows}
              />
            </div>
          </AntModal>
        )}
        {deleteModal && (
          <AntModal
            title={
              <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue font-semibold text-[20px] text-center">
                {intl.user_delete_modal}
              </div>
            }
            width={500}
            open={deleteModal}
            onCancel={() => {
              setDeleteModal(false);
            }}
            footer={null}
            centered
            className="my-[70px]"
          >
            <p
              style={{ textAlign: "center" }}
              className="px-[40px] font-normal text-base"
            >
              {intl.user_modal_content}
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]  ">
              <Button
                key="cancel"
                className="sm:flex-1 w-full sm:w-auto text-[#214BB9] border-[#214BB9] font-semibold h-[40px] text-base"
                onClick={() => setDeleteModal(false)}
              >
                {intl.help_settings_addition_modal_cancel}
              </Button>
              <Button
                key="delete"
                className="sm:flex-1 w-full sm:w-auto bg-[#BA1818] font-semibold h-[40px] text-base text-white no-hover"
                onClick={() => deleteEmployee(selectedRows)}
              >
                {intl.help_settings_addition_delete_button}(
                {selectedRows.length})
              </Button>
            </div>
          </AntModal>
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
