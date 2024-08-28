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
import { Modal as AntModal, Button } from "antd";
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
  const [comCreated, setComCreated] = useState(false);
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
        let bgColor = text === true ? "bg-customBlue" : "bg-white";
        let textColor = text === true ? "text-white" : "text-customBlue";
        return (
          <div style={{ width: "85px" }}>
            <div
              className={`rounded-[5px] cursor-pointer pt-[5px] pb-[5px] pl-[5px] pr-[5px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue text-sm ${textColor} ${bgColor} text-center`}
            >
              {text === true ? "有効" : "無効"}
            </div>
          </div>
        );
      },
      width: 140,
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
      setLoading(false);
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
    comCreated && fetchData();
  }, [comCreated]);

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
            textColor={"text-white font-semibold text-sm w-full "}
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
      <AntModal
        title={
          <div className="px-[40px] pt-[40px] mb-[2vw] text-customBlue text-center">
            {intl.delete_company}
          </div>
        }
        open={deleteModal}
        onCancel={() => {
          setDeleteModal(false);
        }}
        footer={null}
        style={{ padding: "40px" }}
      >
        <p style={{ textAlign: "center" }} className="px-[40px]">
          {intl.company_list_delete}
        </p>
        {/* <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]">
          <Button
            key="cancel"
            className="flex-1 text-[#214BB9] border-[#214BB9] font-semibold text-base"
            onClick={() => setDeleteModal(false)}
          >
            {intl.help_settings_addition_modal_cancel}
          </Button>
          <Button
            key="delete"
            className="flex-1 bg-[#BA1818] text-white no-hover"
            onClick={() => deleteOrganization(selectedRows)}
          >
            {intl.help_settings_addition_delete}
          </Button>
        </div> */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]  ">
          <Button
            key="cancel"
            className="sm:flex-1 w-full sm:w-auto text-[#214BB9] border-[#214BB9] font-semibold text-base"
            onClick={() => setDeleteModal(false)}
          >
            {intl.help_settings_addition_modal_cancel}
          </Button>
          <Button
            key="delete"
            className="sm:flex-1 w-full sm:w-auto bg-[#BA1818] text-white no-hover"
            onClick={() => deleteOrganization(selectedRows)}
          >
            {intl.help_settings_addition_delete_button}({selectedRows.length})
          </Button>
        </div>
      </AntModal>

      <div>
        <div className="flex justify-between items-center  mb-[16px]">
          <h1 className="text-lg font-bold">
            {intl.components_card_searchlist_companylist}
          </h1>
          <div className="flex space-x-2.5">
            <span>
              <IconOutlineBtn
                text={intl.company_list_company_import}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[32px] md:px-[33.5px] px-[33.5px]"}
                icon={() => importIcon()}
                onClick={async () => {
                  await setImportModal(() => false);
                  await importHandler();
                }}
              />
            </span>
            <span>
              <IconOutlineBtn
                text={intl.company_details_company_add}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[32.5px] md:px-[22.5px] px-[22.5px]"}
                icon={() => editIcon()}
                onClick={() => {
                  setIsModalOpen(true);
                  //router.push("/company/add");
                }}
              />
            </span>
          </div>
        </div>

        <form
          className="w-full mb-[16px]  hidden lg:flex gap-2 flex-wrap flex-shrink-0 flex-grow-0  px-2 rounded-xl  md:mx-auto md:justify-center lg:justify-normal  "
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
          <form className="md:w-[96%] w-[92%] bg-white  flex lg:hidden gap-2 flex-wrap flex-shrink-0 flex-grow-0  py-6 px-5 rounded-xl mb-4 md:mx-auto md:justify-start lg:justify-normal absolute z-20 justify-start">
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
          {/* <div className="flex items-center">
            <DynamicLabel
              text={intl.company_details_company_management}
              alignment="text-center"
              fontSize="text-[22px]"
              fontWeight="font-medium"
              textColor="#000000"
              disabled={false}
            />
          </div> */}
          <div className="hidden lg:flex items-center">
            {/* <span className="mr-2.5">
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
            </span> */}
            {/* <span className="mr-2.5">
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
            </span> */}
            {/* <span className="mr-2.5">
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
            </span> */}
            {/* <span>
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
            </span> */}
          </div>
          {/* <div className=" lg:hidden flex">
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
          </div> */}
        </div>
        <div className="mb-[16px] flex items-center">
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
        <div className=" relative" style={{ width: "100%" }}>
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
        {selectedRows.length > 0 && (
          <div className="mt-[20px] flex justify-between items-center  bg-white py-3 px-[4vw] shadow-lg">
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

              <IconOutlineBtn
                text={intl.help_settings_addition_delete}
                textColor="text-[#BA1818]" // Red text color
                borderColor="border-[#BA1818]"
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                icon={() => deleteIcon()}
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
                    setDeleteModal(() => false);
                    return;
                  }
                  setDeleteModal(() => true);
                }}
              />
            </div>
          </div>
        )}

        {/* // <Modal
          //   height="412px"
          //   fontSize="text-xl"
          //   fontWeight="font-semibold"
          //   textColor="#19388B"
          //   text={intl.help_settings_addition_delete}
          //   onCloseHandler={setDeleteModal}
          //   modalFooter={getDeleteModalFooter}
          // >
          //   <div className="flex flex-col">
          //     <div className="flex-grow py-[50px] pt-[50px] px-6 dark:text-black">
          //       {intl.company_list_company_delete}
          //     </div>
          //   </div>
          // </Modal> */}

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
          <AntModal
            open={isModalOpen}
            footer={null}
            // fontSize="20"
            // textColor="customBlue"
            // fontWeight="600"
            onCancel={handleCloseModal}
          >
            <div className="flex flex-col">
              <AddUser
                setIsModalOpen={setIsModalOpen}
                setComCreated={setComCreated}
              />
            </div>
          </AntModal>
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
