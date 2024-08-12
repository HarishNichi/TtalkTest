/* eslint-disable no-console */
"use client";
import React, { useState, useEffect, useRef } from "react";
import intl from "@/utils/locales/jp/jp.json";
import Modal from "@/components/Modal/modal";
import DynamicLabel from "../../../components/Label/dynamicLabel";
import IconOutlineBtn from "../../../components/Button/iconOutlineBtn";
import AddIcon from "../../../components/Icons/addIcon";
import GetIconQRCode from "../../../components/Icons/qrCode";
import DataTable from "@/components/DataTable/DataTable";
import AddUser from "@/components/CompanyInfo/add";
import { Modal as AntModel } from "antd";
import {
  tableDefaultPageSizeOption,
  fileName,
  OrgSearchLimit,
  errorToastSettings,
  successToastSettings,
  sampleLinks,
  csvFileNameRegex,
} from "@/utils/constant";
import SectionDeleteIcon from "@/components/Icons/sectionDelete";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import IconLeftBtnCSV from "@/components/Button/iconLeftBtnCSV";
import IconBtn from "../../../components/Button/iconBtn";
import DropdownMedium from "@/components/Input/dropdownMedium";
import TextPlain from "@/components/Input/textPlain";
import ImportModal from "@/components/ImportModal/importModal";
import { useRouter } from "next/navigation";
import { folderIcon } from "@/components/Icons/folderIconMobile";
import api from "@/utils/api";
import { formatDate } from "@/validation/helperFunction";
import { addOrganization } from "@/redux/features/organization";
import { useAppDispatch } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import ProtectedRoute from "@/utils/auth";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
import DeleteIcon from "../../../components/Icons/deleteIcon";
import SearchInput from "@/components/Layout/search";
Amplify.configure(gen.config);

export default function CompanyList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const customNameStyle = {
    color: "#19388B",
    fontWeight: "500",
    fontSize: "14px",
  };
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const CSVDownloadRef = useRef("");
  /**columns of company list and its operations */
  const companyColumns = [
    {
      title: intl.company_list_company_name,
      dataIndex: "name",
      render: (text) => <a style={customNameStyle}>{text}</a>,
      width: 120,
      align: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: intl.form_component_fleet_number,
      dataIndex: "fleetNumber",
      render: (text) => <a>{text}</a>,
      width: 80,
      align: "left",
      sorter: (a, b) => a.fleetNumber.localeCompare(b.fleetNumber),
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: intl.company_list_company_contact_mail,
      dataIndex: "email",
      render: (text) => <a>{text}</a>,
      width: 140,
      align: "left",
    },
    {
      title: intl.form_component_sales_channel,
      dataIndex: "agencyName",
      render: (text) => <a>{text}</a>,
      width: 120,
      align: "left",
    },
    {
      title: intl.company_list_company_status,
      dataIndex: "status",
      render: (text, record) => {
        let bg = text == true ? "bg-customGreen" : "bg-customGray";
        return (
          <div style={{ width: "85px" }}>
            <div
              className={`rounded-[5px] cursor-pointer  pt-[5px] pb-[5px] pl-[5px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue text-sm text-white block w-full ${bg} text-center
            `}
            >
              {text === true ? "有効" : "無効"}
            </div>
          </div>
        );
      },
      width: 110,
      align: "left",
    },
  ];
  /**columns of company list and its operations ends here*/
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };
  /** States of Company list and data grids */
  const [columns, setColumns] = useState(companyColumns);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  //
  const [importModal, setImportModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [searchFlag, setSearchFlag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [organizationsData, setOrganizationsData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [editRecord, setRecord] = useState(null);
  const [csv, setCsv] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [fileValidationError, setFileValidationError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [fileNameError, setFileNameError] = useState(null);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [compName, setCompName] = useState("");
  const [fleetNumber, setFleetNumber] = useState("");
  const [email, setEmail] = useState("");
  const [salesChannel, setSalesChannel] = useState("");
  const [companyStatus, setCompanyStatus] = useState("");
  const [isMobileSearch, setIsMobileSearch] = useState(false);
  const [tableHeight, setTableHeight] = useState(450);
  const [csvUploadInitiated, setCsvUploadInitiated] = useState(null);
  const [currentAPI, setCurrentAPI] = useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = useState(null);
  const [companyListDropdown, setCompanyListDropdown] = useState([]);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleSelectRow = (selected) => {
    setSelectedRows(selected);
  };
  const [selectedValue, setSelectedValue] = useState("");
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
  };

  /** States of Company list and data grids ends here*/

  /**ICON Imports */
  function editIcon() {
    return <AddIcon />;
  }

  function deleteIcon(flag) {
    return <DeleteIcon isMobile={flag} />;
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

  /**ICON Imports ends here*/

  function importHandler() {
    setTimeout(() => {
      setImportModal(() => true);
    }, 500);
  }

  async function exportCSVFile() {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast("会社を選択してください", errorToastSettings);
      setExportModal(false);
      return;
    }
    let data;
    if (!csvFileName) {
      setFileNameError("ファイル名が必要です。");
      return;
    }
    if (!csvFileNameRegex.test(csvFileName) && !/\s/.test(csvFileName)) {
      setFileNameError("ファイル名を確認してください。");
      return;
    }
    setFileNameError("");
    if (selectAll) {
      data = selectedRows.map((el) => el.id);
      data = { data, filename: csvFileName + ".csv" };
    } else {
      if (selectedRows.length > 0) {
        data = selectedRows.map((el) => el.id);
      }
      data = { data, filename: csvFileName + ".csv" };
    }

    try {
      setLoading(true);
      let result = await api.post("organizations/export", data);
      setDownloadCsvLink(result.data.data.link);
      setExportModal(() => false);
      setCsvFileName("");
      setLoading(false);
      toast("エクスポートが成功しました", successToastSettings);
    } catch (err) {
      setLoading(false);
      toast("ファイルのエクスポートに失敗しました", errorToastSettings);
    }
  }

  async function uploadCsvFile(payload) {
    try {
      setLoading(true);
      payload.channel = new Date().getTime() + "orgCsvUpload";
      setCsvUploadInitiated(() => payload.channel);
      setCurrentAPI("organizations/import");
      let result = await api.post("organizations/import", payload);
    } catch (err) {
      subscriptionTrack.unsubscribe();
      setLoading(false);
      toast("インポートに失敗しました", errorToastSettings);
    }
  }

  function getExportModalFooter() {
    return (
      <IconLeftBtnCSV
        type="submit"
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
      >
        エクスポート
      </IconLeftBtnCSV>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

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
    fetchOrg();
  }, []);

  let all = [];
  let offset = "null";

  const fetchData = async () => {
    toast.dismiss();
    setLoading(true);
    try {
      const params = {
        params: {
          limit: OrgSearchLimit,
          offset: offset,
        },
      };
      let { data: response } = await api.get("organizations/list", params);
      if (response.data.offset != "end" && response.data.Items.length > 0) {
        params.params.offset = response.data.offset;
        offset = response.data.offset;
        all = [...all, ...response.data.Items];
        fetchData();
      }
      if (response.data.offset == "end") {
        all = [...all, ...response.data.Items];
        let dataAll = all.map((org) => {
          return {
            key: org.id,
            id: org.id,
            name: org.name || "-",
            numberOfUsers: org.accountDetail.organization.licenseCount || "-",
            email: org.email || "-",
            agencyName: org.accountDetail.organization.salesChannel || "-",
            status: org.accountDetail.organization.isStatus || false,
            fleetNumber: org.fleetNumber || "-",
            isTranslate: org.accountDetail.organization.isTranslate || "-",
            isTranscribe: org.accountDetail.organization.isTranscribe || "-",
          };
        });

        setOrganizationsData(dataAll);
        setAllData(dataAll);
        setLoading(false);
        all = [];
        offset = "null";
        return;
      }
    } catch (error) {
      setLoading(false);
      toast(
        error.response?.data?.status?.message
          ? error.response?.data?.status?.message
          : error?.response?.data?.message,
        errorToastSettings
      );
    }
  };

  const deleteOrganization = async (selectedRows) => {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast("会社を選択してください。", {
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
    const orgIds = selectedRows.map((record) => ({
      id: record.id, // Assuming record has an 'id' property
    }));
    setLoading(true);
    try {
      const response = await api.post(`organizations/delete-all`, orgIds);
      setLoading(false);
      setDeleteModal(false);
      setSelectAll(false);
      setSelectedRows([]);
      setDeleted(true);
      fetchData();
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
              deleteOrganization(selectedRows);
            }}
          />
        </div>
      </div>
    );
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

  async function searchOrganization() {
    toast.dismiss();
    try {
      setLoading(true);
      const payload = {};
      const variables = [
        { key: "organization", value: compName },
        { key: "fleetNumber", value: fleetNumber },
        { key: "email", value: email },
        { key: "salesChannel", value: salesChannel },
        { key: "status", value: selectedValue },
      ];

      variables.forEach((variable) => {
        if (
          variable.value !== undefined &&
          variable.value !== null &&
          variable.value !== ""
        ) {
          payload[variable.key] = variable.value;
        }
      });

      payload["limit"] = OrgSearchLimit;
      payload["offset"] = offset;
      payload["paging"] = true;

      // Now, payload will only contain the properties with valid values.

      let { data: response } = await api.post("organizations/search", payload);
      if (response.data.offset != "end") {
        payload.offset = response.data.offset;
        offset = response.data.offset;
        all = [...all, ...response.data.Items];
        await searchOrganization();
      }
      if (response.data.offset == "end") {
        all = [...all, ...response.data.Items];
        response = all.map((org, index) => {
          return {
            key: org.id,
            id: org.id,
            name: org.name || "-",
            numberOfUsers: org.accountDetail.organization.licenseCount || "-",
            email: org.email || "-",
            agencyName: org.accountDetail.organization.salesChannel || "-",
            status: org.accountDetail.organization.isStatus || false,
            fleetNumber: org.fleetNumber || "-",
            isTranslate: org.accountDetail.organization.isTranslate || "-",
            isTranscribe: org.accountDetail.organization.isTranscribe || "-",
          };
        });
        setOrganizationsData(response);
        setSearchFlag(!searchFlag);
        setSelectAll(false);
        setAllData(response);
        setSelectedRows([]); // list will rerender but this one also need to clear for delete
        setLoading(false);
        all = [];
        offset = "null";
      }
    } catch (error) {
      setLoading(false);
      toast.dismiss();
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

  useEffect(() => {
    CSVDownloadRef.current.click();
  }, [downloadCsvLink]);

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
    /* eslint-disable no-undef*/
    let hasMap = new Set();
    if (!csvUploadInitiated) {
      setLoading(false);
      return;
    }
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];
    const subscription = gen.subscribe(csvUploadInitiated, async ({ data }) => {
      if (!hasMap.has(data.token)) {
        hasMap.add(data.token);
        setLoading(true);
        let dataReceived = JSON.parse(data);
        toast.dismiss();
        if (dataReceived?.rowsInserted) {
          dataReceived.rowsInserted =
            dataReceived?.rowsInserted &&
            JSON.parse(dataReceived?.rowsInserted);
          scount = scount + dataReceived?.rowsInserted;
        }

        if (dataReceived?.rowsFailed) {
          dataReceived.rowsFailed =
            dataReceived?.rowsFailed && JSON.parse(dataReceived?.rowsFailed);
          ecount = ecount + dataReceived?.rowsFailed;
        }

        // get failed index
        failedRowIndexes = [...failedRowIndexes, ...dataReceived.failures];
        // finished loop
        if (dataReceived?.currentChunk == dataReceived?.totalChunks) {
          setFileName("");
          setFile(null);

          if (ecount == 0 && scount > 0) {
            toast("正常にインポートされました。", successToastSettings);
            subscription.unsubscribe();
            setImportModal(() => !importModal);
            fetchData();
          }
          if (ecount > 0) {
            try {
              setLoading(true);
              let csvLink = await api.post("organizations/import", {
                failures: failedRowIndexes,
              });
              setDownloadCsvLink(csvLink.data.data.failureFile);
            } finally {
              toast(
                `${ecount} 行のデータインポートに失敗しました`,
                errorToastSettings
              );
              subscription.unsubscribe();
              setImportModal(() => !importModal);
              fetchData();
              setLoading(false);
            }
          }
          setLoading(false);
          setCsvUploadInitiated(() => null);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div>
        <form
          className="w-full bg-white hidden lg:flex gap-2 flex-wrap flex-shrink-0 flex-grow-0 py-2 px-2 rounded-xl mb-2 md:mx-auto md:justify-center lg:justify-normal mb-[10px]"
          onSubmit={(e) => {
            e.preventDefault();
            //searchOrganization();
          }}
        >
          <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
            <input
              list="company_search"
              name="company_search"
              className={`w-full border flex  py-2.5 text-xs  pl-2  rounded-lg focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-center md:placeholder:text-left md:placeholder:pl-0
        dark:text-black`}
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
              placeholder={intl.form_component_fleet_number}
              onInput={setFleetNumber}
              value={fleetNumber}
            />
          </div>

          <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
            <SearchInput
              placeholder={intl.company_list_company_contact_mail}
              onInput={setEmail}
              value={email}
            />
          </div>

          <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
            <SearchInput
              placeholder={intl.form_component_sales_channel}
              onInput={setSalesChannel}
              value={salesChannel}
            />
          </div>

          <div className={`w-full md:w-[calc(50%-10px)] lg:flex lg:flex-1 `}>
            <select
              className="w-full md:min-w-[100px] lg:min-w-[100px] border flex flex-auto md:flex-1  py-2.5 text-xs  pl-2 bg-[white] rounded-lg focus:outline-none placeholder-[#AEA8A8] 
                placeholder:text-center md:placeholder:text-left md:placeholder:pl-0 dark:text-black"
              value={selectedValue}
              onChange={handleSelectChange}
            >
              <option value="">--選択--</option>
              <option value={true}>有効</option>
              <option value={false}>無効</option>
            </select>
          </div>

          <div className="w-full md:w-[calc(100%-10px)]  lg:w-[144px]   xl:flex xl:flex-1">
            <IconLeftBtn
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-white font-medium text-sm w-full px-6 rounded-lg"
              }
              py={"py-2"}
              px={""}
              bgColor={"bg-customBlue"}
              textBold={true}
              icon={() => getIconWithClass("")}
              onClick={() => {
                searchOrganization();
              }}
            />
          </div>
        </form>
        <div className="lg:hidden flex mb-2">
          <span className="w-full md:w-[160px]">
            <IconLeftBtn
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-white font-medium text-sm w-full px-6 rounded-lg"
              }
              py={"py-2"}
              px={""}
              bgColor={"bg-customBlue"}
              textBold={true}
              icon={() => getIconWithClass("")}
              onClick={() => {
                setIsMobileSearch(true);
              }}
            />
          </span>
        </div>
        {isMobileSearch && (
          <form className="md:w-[96%] w-[92%] bg-white flex lg:hidden gap-2 flex-wrap flex-shrink-0 flex-grow-0  py-6 px-5 rounded-xl mb-4 md:mx-auto md:justify-start lg:justify-normal absolute z-20 justify-start">
            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.company_list_company_name}
                onInput={setCompName}
                value={compName}
              />
            </div>
            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.form_component_fleet_number}
                onInput={setFleetNumber}
                value={fleetNumber}
              />
            </div>

            <div className={`w-full md:w-[calc(50%-10px)] `}>
              <SearchInput
                placeholder={intl.company_list_company_contact_mail}
                onInput={setEmail}
                value={email}
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
                placeholder={intl.company_list_company_status}
                onInput={setCompanyStatus}
                value={companyStatus}
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
                bgColor={"bg-customBlue"}
                textBold={true}
                icon={() => getIconWithClass("")}
                onClick={() => {
                  setIsMobileSearch(false);
                  searchOrganization();
                }}
              />
            </div>
          </form>
        )}

        <div className="flex  justify-between mb-[20px] xl:mb-2 ">
          <div className="flex items-center">
            <DynamicLabel
              text={intl.company_details_company_management}
              alignment="text-center"
              fontSize="text-[22px]"
              fontWeight="font-medium"
              textColor="#000000"
              disabled={false}
            />
          </div>
          <div className="hidden lg:flex items-center">
            <span className="mr-2.5">
              <IconOutlineBtn
                text={intl.company_list_company_import}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[32px] md:px-[33.5px] px-[33.5px]"}
                icon={() => importIcon()}
                borderColor={"border-customBlue"}
                onClick={async () => {
                  await setImportModal(() => false);
                  await importHandler();
                }}
              />
            </span>
            <span className="mr-2.5">
              <IconOutlineBtn
                text={intl.company_list_company_export_title}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                icon={() => exportIcon()}
                borderColor={"border-customBlue"}
                onClick={() => {
                  // check selected row
                  toast.dismiss();
                  if (selectedRows.length <= 0) {
                    toast("会社を選択してください。", {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      theme: "colored",
                      type: "error",
                    });
                    setExportModal(() => false);
                    return;
                  }
                  setExportModal(() => true);
                }}
              />
            </span>
            <span className="mr-2.5">
              <IconOutlineBtn
                text={intl.company_details_company_add}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[32.5px] md:px-[22.5px] px-[22.5px]"}
                icon={() => editIcon()}
                borderColor={"border-customBlue"}
                onClick={() => {
                  setIsModalOpen(true);
                  //router.push("/company/add");
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
                  onClick={() => {
                    if (selectedRows.length <= 0) {
                      toast("会社を選択してください。", {
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
          <div className=" lg:hidden flex">
            <span className="mr-2.5">
              <IconBtn
                textColor={"text-white"}
                textBold={true}
                icon={() => importIcon()}
                onClick={async () => {
                  await setImportModal(() => false);
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
                  // router.push("/company/add");
                  setIsModalOpen(true);
                }}
              />
            </span>
            <span>
              <IconBtn
                textColor={"text-white"}
                textBold={true}
                icon={() => deleteIcon(false)}
                additionalClass={"py-[7px] px-[8.5px]"}
                bg="bg-transparent"
                onClick={() => {
                  if (selectedRows.length <= 0) {
                    toast("会社を選択してください。", {
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
          </div>
        </div>
        <div className="mb-[5px] flex items-center">
          <label
            key={"selectAll"}
            className="flex items-center text-customBlue"
          >
            <input
              type="checkbox"
              disabled={organizationsData?.length == 0}
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
            loading={loading}
            rowSelectionFlag
            columns={columns}
            dataSource={organizationsData}
            onSelectRow={(tableData) => {
              setCsv(tableData);
              handleSelectRow(tableData);
              return tableData;
            }}
            defaultPaeSizeOptions={tableDefaultPageSizeOption}
            defaultValue={1}
            onRowClick={(row, rowIndex) => {
              dispatch(addOrganization(row));
              router.push("/company/details");
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
                {intl.company_list_company_delete}
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
              setExportModal();
              setCsvFileName("");
              setFileNameError("");
            }}
            contentPaddingTop="pt-1"
            contentPadding="px-0"
            modalFooter={getExportModalFooter}
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[27px]">
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
                      value={csvFileName}
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
        {importModal && (
          <ImportModal
            modelToggle={importModal}
            onCloseHandler={setImportModal}
            file={file}
            setFile={setFile}
            fileName={fileName}
            setFileName={setFileName}
            fileValidationError={fileValidationError}
            setFileValidationError={setFileValidationError}
            operation="dynamic"
            uploadCsvFile={(payload) => uploadCsvFile(payload)}
            sampleLink={sampleLinks().companyImport}
          />
        )}
        {isModalOpen && (
          <AntModel
            open={isModalOpen}
            footer={null}
            // fontSize="20"
            // textColor="customBlue"
            // fontWeight="600"
            onCancel={handleCloseModal}
          >
            <div className="flex flex-col">
              <AddUser />
            </div>
          </AntModel>
        )}
      </div>
      <a
        id={"linkCsv"}
        ref={CSVDownloadRef}
        href={downloadCsvLink}
        download
        key={downloadCsvLink}
      ></a>
    </ProtectedRoute>
  );
}
