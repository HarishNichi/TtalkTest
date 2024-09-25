/* eslint-disable no-console */
"use client";
import React, { useEffect, useRef, useState } from "react";
import intl from "@/utils/locales/jp/jp.json";
import DynamicLabel from "@/components/Label/dynamicLabel";
import IconOutlineBtn from "@/components/Button/iconOutlineBtn";
import AddIcon from "@/components/Icons/addIcon";
import DataTable from "@/components/DataTable/DataTable";
import DeleteIcon from "@/components/Icons/deleteIcon";
import { Modal as AntModal } from "antd";
import { formatDate } from "@/validation/helperFunction";
import {
  adminChannel,
  csvFileNameRegex,
  errorToastSettings,
  fileName,
  tableDefaultPageSizeOption,
  maxLimit,
  code,
  EmployeeSearchLimit,
  successToastSettings,
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
import { Button } from "antd";
import dayjs from "dayjs";
Amplify.configure(gen.config);
import { useLayoutContext } from "../layout";

export default function HelpSettingsList() {
  const router = useRouter();
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };
  const { searchDashboard } = useLayoutContext();
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const [received, setReceived] = React.useState("");
  const [tableHeight, setTableHeight] = React.useState(450);
  const UserData = useAppSelector((state) => state.userReducer.user);
  const dispatch = useAppDispatch();
  const employeeData = useAppSelector(
    (state) => state.employeeReducer.employeeSearchList
  );
  let employeeDataCopy = JSON.parse(JSON.stringify(employeeData));
  const [employeeDataList, setEmployeeDataList] =
    React.useState(employeeDataCopy);

  const [loading, setLoading] = useState(false);
  const [employeeeData, setEmployeeeData] = useState([]);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const CSVDownloadRef = useRef("");
  const [csvFileName, setCsvFileName] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportType, setExportType] = useState(1);
  const [fileNameError, setFileNameError] = useState(null);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [companyListDropdown, setCompanyListDropdown] = useState([]);
  function deleteIcon(flag) {
    return <DeleteIcon isMobile={flag} />;
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
  let offset = "null";
  let all = [];
  function findName(orgId, projectionList) {
    let orgName = projectionList.find((el) => el.id == orgId);
    if (orgName?.name) {
      return orgName.name;
    }
    return "";
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
        setEmployeeeData(() => response);
        setLoading(false);
        return;
      }
    } catch (error) {
      setLoading(false);
    }
  };
  async function withDeviceDetails(projectionList) {
    try {
      let expiredDeviceIds = await fetchDevice();
      await fetchData(projectionList, expiredDeviceIds);
    } catch (err) {
      console.log(err);
    }
  }
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

  async function deleteEmployee() {
    toast.dismiss();

    if (selectedRows.length <= 0) {
      toast(intl.user_please_select_user, errorToastSettings);
      setDeleteModal(false);
      return;
    }

    try {
      let data;
      let url = "employees/delete-all";
      let userIds;

      if (selectedRows.length > 0) {
        userIds = selectedRows.map((record) => ({
          id: record.id, // Assuming record has an 'id' property
        }));
      } else {
        toast(intl.user_please_select_user, errorToastSettings);
        return;
      }

      setLoading(true);
      let result = await api.post(url, userIds);
      toast(intl.user_deletion_completed, successToastSettings);
      setSelectedRows([]);
      setDeleteModal(false);
      setLoading(false);

      searchDashboard();
    } catch (err) {
      setDeleteModal(false);
      setLoading(false);
      toast(intl.search_results_deletion_failed, errorToastSettings);
    }
  }

  useEffect(() => {
    let data = localStorage.getItem("searchEmployee");
    let parsedData = (data.length > 0 && JSON.parse(data)) || [];
    dispatch(searchEmployee(parsedData));
  }, []);

  useEffect(() => {
    let employeeDataCopy = JSON.parse(JSON.stringify(employeeData));
    setEmployeeDataList(employeeDataCopy);
    setSearchFlag(!searchFlag);
    setSelectAll(false);
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
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: intl.user_userId_label,
      dataIndex: "userId",
      render: (text) => <a className="pr-1">{text}</a>,
      width: 120,
      align: "left",
      sorter: (a, b) => a.userId - b.userId,
      sortDirections: ["ascend", "descend", "ascend"],
    },

    {
      title: intl.machineName,
      dataIndex: "machine",
      render: (text) => <a>{text}</a>,
      width: 120,
      align: "left",
      sorter: (a, b) => a.machine.localeCompare(b.machine),
      sortDirections: ["ascend", "descend", "ascend"],
    },

    {
      title: intl.company_list_company_status,
      dataIndex: "isActive",
      render: (text, record) => {
        let bg = text ? "bg-customBlue" : "bg-white";
        let textClass = text ? "text-white" : "text-customBlue";
        return (
          <div style={{ width: "105px" }}>
            <div
              className={`rounded-[5px] cursor-pointer  pt-[5px] pb-[5px] pl-[5px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue text-[16px] ${textClass} block w-full ${bg} text-center
            `}
            >
              {text ? intl.user_online : intl.user_offline}
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
      sortDirections: ["ascend", "descend", "ascend"],
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
  const [searchFlag, setSearchFlag] = useState(false);

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
      let temp = employeeDataList.map((el, index) => {
        if (
          el.radioNumber == received.pttNo &&
          index >= (current - 1) * page &&
          index <= maxCurrent
        ) {
          el.status = received.status;
          el.timestamp = new Date().getTime();
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
        let temp =
          employeeDataList.length > 0 &&
          employeeDataList.map((el, index) => {
            if (el?.status == "online") {
              if (new Date().getTime() - el.timestamp > 1000 * 60 * 3) {
                el.status = "unknown";
              }
            }
            return el;
          });
        temp?.length && temp.length > 0 && setEmployeeDataList(temp);
      }, 1000 * 60 * 5);
    }
    return () => clearInterval(setIntervalCount);
  }, [received]);

  function handelExport() {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast(intl.user_please_select_user, errorToastSettings);
      setExportModal(false);
      return;
    }
    setExportModal(() => true);
  }

  function getExportModalFooter() {
    return (
      <div className="px-[40px] pb-[40px]">
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

  async function exportCSVFile() {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast(intl.user_please_select_user, errorToastSettings);
      setExportModal(false);
      return;
    }
    try {
      let data;
      let url = "employees/export-custom";
      if (!csvFileName) {
        setFileNameError(intl.user_file_name_required);
        return;
      }
      if (!csvFileNameRegex.test(csvFileName)) {
        setFileNameError(intl.user_check_file_name);
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
        toast(intl.user_please_select_user, errorToastSettings);
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
      toast(intl.user_file_export_failed, errorToastSettings);
    }
  }

  const handleSelectRow = (selected) => {
    setSelectedRows(selected);
  };

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
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div>
        <div className="mb-[16px] flex items-center">
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
            <span className="ml-1"> {intl.user_selectAll}</span>
          </label>
        </div>
        <div className=" relative" style={{ width: "100%" }}>
          <DataTable
            scrollVertical={tableHeight > 450 ? tableHeight : 450}
            rowSelectionFlag
            columns={columns}
            dataSource={employeeDataList}
            rowClassName={(record) => (!record.isActive ? "bg-[#F9F9FA]" : "")}
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
            setCurrent={setCurrent}
            current={current}
            setPage={setPage}
            page={page}
          />
        </div>
        {selectedRows.length > 0 && (
          <div className="flex justify-between items-center mt-4 bg-white py-3 px-[4vw] shadow-lg">
            {/* Left side: Buttons */}
            <div className="text-base font-semibold">
              {selectedRows.length}
              {intl.user_item_selected}
            </div>
            <div className="flex space-x-4">
              <IconOutlineBtn
                text={intl.company_list_company_export_title}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                icon={() => exportIcon()}
                borderColor={"border-customBlue"}
                onClick={async () => {
                  await setExportModal(() => false);
                  await handelExport();
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

        {deleteModal && (
          <AntModal
            title={
              <div className="px-[40px] pt-[25px] mb-[2vw] font-semibold text-xl text-customBlue text-center">
                {intl.user_delete_modal}
              </div>
            }
            width={500}
            open={deleteModal}
            onCancel={() => {
              setDeleteModal(false);
            }}
            footer={null}
            centered={true}
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
        {exportModal && (
          <AntModal
            width={385}
            title={
              <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-center">
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
              <div className="flex-grow py-[24px]">
                <form className="grid grid-cols-1 gap-y-3">
                  <div className="flex flex-col px-[40px]">
                    <TextPlain
                      type="text"
                      for={"id"}
                      placeholder={intl.user_history_settings_file_name}
                      borderRound="rounded"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 h-[40px] focus:ring-customBlue"
                      border="border border-gray-300"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
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
                </form>
              </div>
            </div>
          </AntModal>
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
