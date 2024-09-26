/* eslint-disable no-console */
"use client";
import React, { useEffect, useState, useRef } from "react";
import DynamicLabel from "@/components/Label/dynamicLabel";
import IconOutlineBtn from "@/components/Button/iconOutlineBtn";
import IconBtn from "@/components/Button/iconBtn";
import AddIcon from "@/components/Icons/addIcon";
import SectionDeleteIcon from "@/components/Icons/sectionDelete";
import intl from "@/utils/locales/jp/jp.json";
import DataTable from "@/components/DataTable/DataTable";
import { Modal as AntModal } from "antd";
import {
  tableDefaultPageSizeOption,
  fileName,
  code,
  maxLimit,
  errorToastSettings,
  successToastSettings,
  sampleLinks,
  csvFileNameRegex,
} from "@/utils/constant";
import Modal from "@/components/Modal/modal";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import TextPlain from "@/components/Input/textPlain";
import GetIconQRCode from "@/components/Icons/qrCode";
import ImportModal from "@/components/ImportModal/importModal";

import { useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import {
  validateHandler,
  convertToPttFormat,
} from "@/validation/helperFunction";
import * as Yup from "yup";
import {
  MAX_100_LENGTH_PATTERN,
  PTT_NO_PATTERN,
} from "@/validation/validationPattern";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
import DeleteIcon from "../Icons/deleteIcon";
import { Button } from "antd";
Amplify.configure(gen.config);

export default function Contact({ children, tab }) {
  const radioNumberStyle = {
    color: "#19388B",
    fontWeight: "500",
    fontSize: "14px",
  };
  /**columns of company list and its operations */
  const contactsColumns = [
    {
      title: intl.user_contact_info_contact_name,
      dataIndex: "contactName",
      render: (text) => <a style={radioNumberStyle}>{text}</a>,
      width: 120,
      align: "left",
    },
    {
      title: intl.company_list_company_radioNumber,
      dataIndex: "radioNumber",
      render: (text) => (
        <a style={{ fontSize: "14px", fontWeight: "500" }}>{text}</a>
      ),
      align: "left",
      width: 120,
    },
  ];
  /**columns of company list and its operations ends here*/

  const [columns, setColumns] = React.useState(contactsColumns);
  const [qrCodeModal, setQrCodeModal] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState(null);
  const [addNewModal, setAddNewModal] = React.useState(false);
  const [detailsModal, setDetailsModal] = React.useState(false);
  const [editModal, setEditModal] = React.useState(false);

  const [contactName, setContactName] = React.useState("");
  const [contactNameFurigana, setContactNameFurigana] = React.useState("");
  const [radioNo, setRadioNo] = React.useState("");
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const [loading, setLoading] = React.useState(false);
  const [contactTableData, setContactData] = React.useState([]);
  const [contactRecord, setContactRecord] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const [selectAll, setSelectAll] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [tableHeight, setTableHeight] = React.useState(450);
  const [csvFileName, setCsvFileName] = React.useState("");
  const [downloadCsvLink, setDownloadCsvLink] = React.useState(null);
  const [fileValidationError, setFileValidationError] = React.useState(null);
  const [fileNameError, setFileNameError] = React.useState(null);
  const CSVDownloadRefContact = useRef("");
  const [csvUploadInitiated, setCsvUploadInitiated] = React.useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = React.useState(null);
  const [page, setPage] = React.useState(50);
  const [current, setCurrent] = React.useState(1);
  const [addNewModalData, setAddNewModalData] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectRow = (selected) => {
    setSelectedRows(selected);
  };
  useEffect(() => {
    const handleResize = () => {
      setTableHeight(window.innerHeight - 430);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setAddNewModal(addNewModalData);
  }, [addNewModalData]);

  useEffect(() => {
    setDeleteModal(deleteModalData);
  }, [deleteModalData]);

  useEffect(() => {
    setAddNewModalData(false);
  }, []);

  function editModalIcon() {
    return (
      <svg
        width="19"
        height="19"
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.86664 12.8799L5.78657 16.7998L0 18.6665L1.86664 12.8799Z"
          fill="white"
        />
        <path
          d="M3.17798 11.5388L12.2852 2.43164L16.2448 6.39124L7.13758 15.4984L3.17798 11.5388Z"
          fill="white"
        />
        <path
          d="M18.3864 4.19991L17.5464 5.03986L13.6265 1.11992L14.4664 0.27997C14.8397 -0.0933235 15.3997 -0.0933235 15.773 0.27997L18.3863 2.89319C18.7597 3.26662 18.7597 3.82665 18.3864 4.19994L18.3864 4.19991Z"
          fill="white"
        />
      </svg>
    );
  }

  const schema = Yup.object().shape({
    contactName: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    contactNameFurigana: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    radioNo: Yup.string()
      .required(intl.validation_required)
      .matches(PTT_NO_PATTERN.regex, PTT_NO_PATTERN.message),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name == "contactName") {
      setContactName(value);
    } else if (name == "radioNo") {
      setRadioNo(value);
    } else if (name == "contactNameFurigana") {
      setContactNameFurigana(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  const onClose = () => {
    if (addNewModal) {
      setContactName("");
      setRadioNo("");
      setContactNameFurigana();
      setAddNewModal(false);
      setAddNewModalData(false);
      setErrors({});
      setTouched({});
    } else {
      setContactName("");
      setContactNameFurigana();
      setRadioNo("");
      setEditModal(false);
      setDetailsModal(false);
      setErrors({});
      setTouched({});
    }
  };

  React.useEffect(() => {
    const formValues = { contactName, radioNo, contactNameFurigana };
    validateHandler(schema, formValues, setErrors);
  }, [contactName, radioNo, contactNameFurigana]);

  React.useEffect(() => {
    fetchData();
  }, [tab]);

  function editIcon() {
    return <AddIcon />;
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

  function deleteIcon(flag) {
    return <DeleteIcon isMobile={flag} />;
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

  useEffect(() => {
    CSVDownloadRefContact.current.click();
  }, [downloadCsvLink]);

  /**ICON Imports ends here*/

  /**ICON Imports ends here*/
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };
  /**Delete handler */
  function handelDelete(record) {
    setDeleteModal(true);
    setContactRecord(record);
  }

  function qrCodeIcons() {
    return <GetIconQRCode />;
  }

  function importHandler() {
    setTimeout(() => {
      setImportModal(() => true);
    }, 500);
  }
  function detailHandler(record) {
    setDetailsModal(true);
    setEditModal(false);
    setDeleteModal(false);
    setDeleteModalData(false);
    setContactName(record.contactName);
    setContactNameFurigana(record.furigana);
    setContactRecord(record);
    if (detailsModal) {
      setRadioNo(record.radioNumber);
    } else {
      setRadioNo(record.pttNo);
    }
  }

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
      const response = await api.get("contacts/list", params);
      setLoading(false);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedData = data.Items.map((item, index) => {
          return {
            contactName: item.name,
            furigana: item.furigana,
            radioNumber: convertToPttFormat(item.pttNo),
            pttNo: item.pttNo,
            contactId: item.contactId,
            key: index,
            isDeleted: item.isDeleted,
          };
        }).filter((el) => !el.isDeleted && el.pttNo != Employee.radioNumber);
        setContactData(formattedData);
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
  const createContact = async (name) => {
    toast.dismiss();
    if (!errors) {
      setLoading(true);
      try {
        const payload = {
          userId: Employee.id,
          name: contactName,
          furigana: contactNameFurigana,
          pttNo: radioNo,
        };

        const response = await api.post("contacts/create", payload);
        if (response.data.status.code == code.CREATED) {
          setLoading(false);
          setAddNewModal(false);
          setAddNewModalData(false);
          fetchData();
          setContactName("");
          setContactNameFurigana("");
          setRadioNo("");
          setTouched({});
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
        setAddNewModal(true);
      }
    } else {
      setTouched(() => ({
        ...touched,
        contactName: true,
        contactNameFurigana: true,
        radioNo: true,
      }));
    }
  };

  const updateContact = async (record, name) => {
    toast.dismiss();
    if (!errors) {
      setLoading(true);
      try {
        const payload = {
          userId: Employee.id,
          name: contactName,
          furigana: contactNameFurigana,
          pttNo: radioNo,
          id: contactRecord.contactId,
        };

        const response = await api.put(`contacts/update`, payload);
        if (response.data.status.code == code.OK) {
          setLoading(false);
          setEditModal(false);
          fetchData();
          setContactName("");
          setContactNameFurigana("");
          setRadioNo("");
          setTouched({});
        }
      } catch (error) {
        setLoading(false);
        setEditModal(true);
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
    } else {
      setTouched(() => ({
        ...touched,
        contactName: true,
        contactNameFurigana: true,
        radioNo: true,
      }));
    }
  };

  const deleteContact = async (selectedRows) => {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast(intl.user_contact_selectContact, {
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
      setDeleteModalData(false);
      return;
    }
    const contactIds = selectedRows.map((record) => ({
      id: record.contactId, // Assuming record has an 'id' property
      userId: Employee.id,
    }));

    setLoading(true);
    try {
      const response = await api.post(`contacts/delete-all`, contactIds);
      if (response.data.status.code == code.OK) {
        setLoading(false);
        setDeleteModal(false);
        setDeleteModalData(false);
        setSelectedRows([]);
        setSelectAll(false);
        setDeleted(true);
        fetchData();
      }
    } catch (error) {
      setLoading(false);
      setDeleteModal(true);
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
  async function exportCSVFile() {
    let ids;
    let data;
    toast.dismiss();
    if (!csvFileName) {
      setFileNameError(intl.contacts_file_name_required);
      return;
    }
    if (!csvFileNameRegex.test(csvFileName)) {
      setFileNameError(intl.user_check_file_name);
      return;
    }
    setFileNameError("");
    if (selectAll) {
      ids = selectedRows.map((el) => el.contactId);

      data = {
        userId: Employee.id,
        contactIds: ids,
        filename: csvFileName + ".csv",
      };
    } else {
      if (selectedRows.length == 0) {
        toast(intl.contacts_selcet_record, errorToastSettings);
        return;
      }
      if (selectedRows.length > 0) {
        ids = selectedRows.map((el) => el.contactId);
      }
      data = {
        userId: Employee.id,
        contactIds: ids,
        filename: csvFileName + ".csv",
      };
    }
    try {
      let result = await api.post("contacts/export", data);
      setDownloadCsvLink(result.data.data.link);
      setExportModal(() => false);
      setCsvFileName("");
    } catch (err) {
      toast(intl.contacts_export_failed, errorToastSettings);
    }
  }

  async function uploadCsvFile(payload) {
    setLoading(true);

    try {
      payload.channel = new Date().getTime() + "contactCsvUpload";
      await setCsvUploadInitiated(() => payload.channel);
      let result = await api.post("contacts/import", {
        ...payload,
        ids: [Employee.id],
      });
    } catch (err) {
      subscriptionTrack.unsubscribe();
      setLoading(false);
      toast(intl.user_import_failed, errorToastSettings);
    }
  }

  useEffect(() => {
    if (!csvUploadInitiated) {
      setLoading(false);
      return;
    }

    /* eslint-disable no-undef*/
    let hasMap = new Set();

    toast.dismiss();
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];
    const subscription = gen.subscribe(csvUploadInitiated, ({ data }) => {
      if (!hasMap.has(data.token)) {
        hasMap.add(data.token);
        setLoading(true);
        let dataReceived = JSON.parse(data);
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
        // finished loop
        if (dataReceived?.currentChunk == dataReceived?.totalChunks) {
          setFile(null);
          setFileName("");
          setTimeout(async () => {
            if (ecount > 0) {
              try {
                setLoading(true);
                let csvLink = await api.post("contacts/import", {
                  failures: failedRowIndexes,
                });
                setDownloadCsvLink(csvLink.data.data.failureFile);
              } finally {
                setLoading(false);
                toast(
                  `${ecount} 行のデータインポートに失敗しました`,
                  errorToastSettings
                );
              }
            }
            if (ecount == 0 && scount > 0) {
              toast(intl.user_imported_successfully, successToastSettings);
            }
            setImportModal(() => !importModal);
            subscription.unsubscribe();
            fetchData();
          }, 2000);

          setCsvUploadInitiated(() => null);
          setLoading(false);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);

  return (
    <>
      {loading && <LoaderOverlay />}
      <div>
        <div className="flex justify-end">
          <IconOutlineBtn
            text={intl.company_list_company_import}
            textColor={"text-customBlue"}
            textBold={true}
            py={"xl:py-2.5 md:py-1.5 py-1.5"}
            px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
            icon={() => importIcon()}
            borderColor={"border-customBlue bg-white mr-2"}
            onClick={() => {
              setImportModal(() => true);
            }}
          />

          <IconOutlineBtn
            text={intl.add_contact}
            textColor="text-customBlue" // Red text color
            borderColor="border-customBlue bg-white"
            textBold={true}
            py={"xl:py-2.5 md:py-1.5 py-1.5"}
            px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
            icon={() => editIcon()}
            onClick={() => {
              // check selected row
              setAddNewModal(() => true);
            }}
          />
        </div>

        <div className="mb-[5px] flex items-center">
          <label
            key={"selectAll"}
            className="flex items-center text-customBlue"
          >
            <input
              type="checkbox"
              disabled={contactTableData?.length == 0}
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

        <div className="mb-[20px] relative" style={{ width: "100%" }}>
          <DataTable
            scrollVertical={tableHeight > 450 ? tableHeight : 450}
            rowSelectionFlag
            columns={columns}
            dataSource={contactTableData}
            onSelectRow={handleSelectRow}
            defaultPaeSizeOptions={tableDefaultPageSizeOption}
            defaultValue={1}
            onRowClick={(record, rowIndex) => {
              detailHandler(record);
            }}
            selectAll={selectAll}
            setSelectAll={setSelectAll}
            setSelectedRows={setSelectedRows}
            deleted={deleted}
            page={page}
            setPage={setPage}
            current={current}
            setCurrent={setCurrent}
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
                    toast(intl.contacts_selcet_contact, {
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
                    toast(intl.contacts_selcet_contact, {
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

        {exportModal && (
          <AntModal
            width={385}
            title={
              <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-center">
                {intl.company_list_company_export_title}
              </div>
            }
            open={true}
            onCancel={() => {
              setExportModal(false);
              setCsvFileName("");
              setFileNameError("");
            }}
            footer={() => {
              return (
                <div className="px-[40px] pb-[32px] pt-[20px]">
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
                </div>
              );
            }}
            centered={true}
            className="my-[70px]"
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[20px] mb-4">
                <form className="grid grid-cols-1 gap-y-3 px-[40px]">
                  <div className="flex flex-col">
                    <TextPlain
                      type="text"
                      for={"id"}
                      placeholder={"ファイル名"}
                      borderRound="rounded"
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
          </AntModal>
        )}
        {qrCodeModal && (
          <Modal
            height="412px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={intl.company_list_company_qrCode}
            onCloseHandler={setQrCodeModal}
            modalFooter={() => {
              return (
                <div className="flex gap-x-3">
                  <div>
                    <IconLeftBtn
                      text={intl.help_settings_addition_modal_cancel}
                      textColor={
                        "text-white font-semibold text-[16px] w-full rounded-lg"
                      }
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
                      textColor={
                        "text-white font-semibold text-[16px] w-full rounded-lg"
                      }
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
            }}
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[40px]">
                <center>{qrCodeIcons()}</center>
              </div>
            </div>
          </Modal>
        )}

        {importModal && (
          <ImportModal
            modelToggle={importModal}
            onCloseHandler={() => {
              setImportModal(false);
              setFileValidationError("");
            }}
            setImportModal={setImportModal}
            file={file}
            setFile={setFile}
            fileName={fileName}
            setFileName={setFileName}
            fileValidationError={fileValidationError}
            setFileValidationError={setFileValidationError}
            uploadCsvFile={(payload) => uploadCsvFile(payload)}
            sampleLink={sampleLinks().Contacts}
            operation="dynamic"
          />
        )}

        {deleteModal && (
          <AntModal
            title={
              <div className="px-[40px] pt-[40px] mb-[2vw] text-customBlue font-semibold text-xl text-center">
                {intl.help_settings_addition_delete}
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
              {intl.delete_contact}
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
                className="sm:flex-1 w-full sm:w-auto bg-[#BA1818] text-white no-hover font-semibold h-[40px] text-base"
                onClick={() => {
                  deleteContact(selectedRows);
                }}
              >
                {intl.help_settings_addition_delete_button}(
                {selectedRows.length})
              </Button>
            </div>
          </AntModal>
        )}
        {(addNewModal || detailsModal || editModal) && (
          <AntModal
            title={
              <div className="flex justify-center items-center pt-4 px-4 pb-0 rounded-t">
                {/* Modify this line */}
                <div className="text-xl font-semibold text-[#19388b] dark:text-black flex-grow flex text-customBlue justify-center">
                  {detailsModal
                    ? intl.contact_details
                    : editModal
                    ? intl.edit_contacts
                    : intl.add_new_contact}
                </div>
                {detailsModal && (
                  <IconBtn
                    textColor={"text-white"}
                    textBold={true}
                    icon={() => editModalIcon()}
                    onClick={async () => {
                      await setDetailsModal(() => false);
                      await setAddNewModal(() => false);
                      setAddNewModalData(false);
                      await setEditModal(() => true);
                    }}
                    bg={"bg-[#346595] mr-[30px] mb-[10px] mt-[-3px] text-right"}
                    className="ml-auto"
                  />
                )}
                {/* Modify this line */}
              </div>
            }
            className="my-[70px]"
            open={true}
            width={385}
            onCancel={onClose}
            centered
            footer={() => {
              return (
                !detailsModal && (
                  <div className="px-[40px] pb-[32px] pt-[20px]">
                    <IconLeftBtn
                      text={intl.help_settings_addition_keep}
                      textColor={"text-white font-semibold text-sm w-full"}
                      py={"py-[11px]"}
                      px={"w-[84%]"}
                      bgColor={"bg-customBlue"}
                      textBold={true}
                      icon={() => {
                        return null;
                      }}
                      onClick={() => {
                        if (addNewModal) {
                          createContact();
                        } else {
                          updateContact();
                        }
                      }}
                    />
                  </div>
                )
              );
            }}
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[9px]">
                <form
                  className={`grid grid-cols-1 gap-y-2 px-[40px] ${
                    detailsModal ? "pb-[32px]" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <TextPlain
                      type="text"
                      for={"contactName"}
                      placeholder={intl.user_contact_info_contact_name}
                      borderRound="rounded"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 h-[40px] focus:ring-customBlue"
                      border="border border-gray-300"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
                      label={intl.user_contact_info_contact_name}
                      labelColor="#7B7B7B"
                      id={"contactName"}
                      isRequired={!detailsModal}
                      labelClass={"float-left"}
                      value={contactName}
                      onChange={handleChange}
                      disabled={detailsModal}
                    />
                    {editModal &&
                      errors?.contactName &&
                      touched?.contactName && (
                        <div
                          className="pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.contactName}
                        </div>
                      )}
                    {addNewModal &&
                      errors?.contactName &&
                      touched?.contactName && (
                        <div
                          className="pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.contactName}
                        </div>
                      )}
                  </div>
                  <div className="flex flex-col">
                    <TextPlain
                      type="text"
                      for={"contactNameFurigana"}
                      placeholder={intl.furigana}
                      borderRound="rounded"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 h-[40px] focus:ring-customBlue"
                      border="border border-gray-300"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
                      label={intl.furigana}
                      labelColor="#7B7B7B"
                      id={"contactNameFurigana"}
                      isRequired={!detailsModal}
                      labelClass={"float-left"}
                      value={contactNameFurigana}
                      onChange={handleChange}
                      disabled={detailsModal}
                    />
                    {editModal &&
                      errors?.contactNameFurigana &&
                      touched?.contactNameFurigana && (
                        <div
                          className="pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.contactNameFurigana}
                        </div>
                      )}
                    {addNewModal &&
                      errors?.contactNameFurigana &&
                      touched?.contactNameFurigana && (
                        <div
                          className="pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.contactNameFurigana}
                        </div>
                      )}
                  </div>
                  <div className="flex flex-col">
                    <TextPlain
                      type="text"
                      for={"radioNo"}
                      placeholder={intl.company_list_company_radioNumber}
                      borderRound="rounded"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 h-[40px] focus:ring-customBlue"
                      border="border border-gray-300"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
                      label={intl.company_list_company_radioNumber}
                      labelColor="#7B7B7B"
                      id={"radioNo"}
                      isRequired={!detailsModal}
                      labelClass={"float-left"}
                      value={radioNo}
                      onChange={handleChange}
                      disabled={detailsModal}
                    />
                    {editModal && errors?.radioNo && touched?.radioNo && (
                      <div
                        className="text-left pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.radioNo}
                      </div>
                    )}
                    {addNewModal && errors?.radioNo && touched?.radioNo && (
                      <div
                        className="pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.radioNo}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </AntModal>
        )}
      </div>
      <a
        id={"linkCsv"}
        ref={CSVDownloadRefContact}
        href={downloadCsvLink}
        download
        key={downloadCsvLink}
      ></a>
    </>
  );
}
