/* eslint-disable no-console */
"use client";
import React, { useEffect, useRef, useState } from "react";
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
  displayOrder,
  errorToastSettings,
  successToastSettings,
  sampleLinks,
  csvFileNameRegex,
} from "@/utils/constant";
import Modal from "@/components/Modal/modal";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import TextPlain from "@/components/Input/textPlain";
import DropdownMedium from "@/components/Input/dropdownMedium";
import GetIconQRCode from "@/components/Icons/qrCode";
import ImportModal from "@/components/ImportModal/importModal";
import api from "@/utils/api";
import { useAppSelector } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { convertToPttFormat } from "@/validation/helperFunction";
import { ToastContainer, toast } from "react-toastify";
import { validateHandler } from "@/validation/helperFunction";
import * as Yup from "yup";
import { MAX_100_LENGTH_PATTERN } from "@/validation/validationPattern";
import { Button, Checkbox } from "antd";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
Amplify.configure(gen.config);
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import DeleteIcon from "../Icons/deleteIcon";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function Group({ children, tab }) {
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const schema = Yup.object().shape({
    groupNameCreate: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    groupNameFurigana: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
  });

  const schemaUpdate = Yup.object().shape({
    name: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    furigana: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
  });

  const radioNumberStyle = {
    color: "#19388B",
    fontWeight: "500",
    fontSize: "14px",
  };

  /**columns of company list and its operations */
  const groupManagementColumns = [
    {
      title: intl.group_id,
      dataIndex: "groupId",
      render: (text) => <a>{text}</a>,
      width: 110,
      align: "left",
    },
    {
      title: intl.user_group_mongst_list_grp_name,
      dataIndex: "name",
      render: (text) => (
        <a style={{ fontSize: "14px", fontWeight: "500" }}>{text}</a>
      ),
      width: 240,
      align: "left",
    },
    {
      title: intl.user_group_mongst_list_numberOfContacts,
      dataIndex: "contactsCount",
      render: (text) => (
        <a style={{ fontSize: "14px", fontWeight: "500" }}>{text}</a>
      ),
      width: 110,
      align: "left",
    },
    {
      title: intl.groups_simultaneous_standby, // Add a title for the checkbox column
      dataIndex: "standByGroup", // Provide a unique dataIndex (it can be any string)
      render: (text, record) => (
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Checkbox
            checked={record.standByGroup}
            onChange={(event) => {
              event.stopPropagation();
              handleCheckboxChange(record);
            }}
          ></Checkbox>
        </div>
      ),
      width: 120, // Adjust the width of the checkbox column as per your preference
      align: "left",
    },
  ];
  /**columns of company list and its operations ends here*/

  const [columns, setColumns] = React.useState(groupManagementColumns);
  const [qrCodeModal, setQrCodeModal] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [addNewModal, setAddNewModal] = React.useState(false);
  const [detailsModal, setDetailsModal] = React.useState(false);
  const [editModal, setEditModal] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [radioNo, setRadioNo] = React.useState("");
  const [groupListData, setGroupListData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [editRecord, setRecord] = React.useState(null);
  const [contactList, setContactData] = React.useState([]);
  const CSVDownloadRefGrp = useRef("");
  const [contactDataDropdownList, setContactDataDropdownList] = React.useState(
    []
  );
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState(null);
  const [groupNameCreate, setGroupNameCreate] = React.useState("");
  const [groupNameFurigana, setGroupNameFurigana] = React.useState("");
  const [groupContacts, setGroupContacts] = React.useState([]);
  const [groupDetails, setGroupDetails] = React.useState({
    name: "",
    furigana: "",
  });
  const [contactHolderDropDown, setContactHolderDropDown] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const [deviceList, setDeviceList] = React.useState([]);

  const [groupListOptionFirst, setGroupListOptionFirst] = React.useState([]);
  const [groupListOptionFirstValue, setGroupListOptionFirstValue] =
    React.useState("");

  const [optionError, setSameOptionError] = React.useState("");
  const [selectedOption, setSelectedOption] = React.useState("");
  const [selectAll, setSelectAll] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [checked, setChecked] = React.useState(undefined);
  const [tableHeight, setTableHeight] = React.useState(450);
  const [csvFileName, setCsvFileName] = useState("");
  const [downloadCsvLink, setDownloadCsvLink] = React.useState(null);
  const [fileValidationError, setFileValidationError] = React.useState(null);
  const [fileNameError, setFileNameError] = useState(null);
  const [csvUploadInitiated, setCsvUploadInitiated] = React.useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = React.useState(null);
  const [detachContactFromGrp, setDetachContactFromGrp] = useState([]);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
  const [addNewModalData, setAddNewModalData] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
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

  const handleSelectRow = (selected) => {
    setSelectedRows(selected);
  };

  useEffect(() => {
    setAddNewModal(addNewModalData);
    setSameOptionError("");
  }, [addNewModalData]);

  useEffect(() => {
    setDeleteModal(deleteModalData);
  }, [deleteModalData]);

  useEffect(() => {
    setAddNewModalData(false);
    setSameOptionError("");
  }, []);

  useEffect(() => {
    CSVDownloadRefGrp.current.click();
  }, [downloadCsvLink]);

  React.useEffect(() => {
    fetchContacts();
  }, [deviceList]);

  React.useEffect(() => {
    if (checked != undefined) {
      updateGroup(checked);
    }
  }, [groupDetails, checked]);

  const handleCheckboxChange = async (record) => {
    let checked = !record.standByGroup;
    await fetchGroupDetails(record, checked);

    setGroupListData((prevData) =>
      prevData.map((item) =>
        item.key === record.key
          ? { ...item, standByGroup: !item.standByGroup }
          : item
      )
    );
  };

  async function exportCSVFile() {
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
      data = selectedRows.map((el) => el.id);
      data = {
        userId: Employee.id,
        groupIds: data,
        filename: csvFileName + ".csv",
      };
    } else {
      if (selectedRows.length == 0) {
        toast(intl.contacts_selcet_record, errorToastSettings);
        return;
      }
      if (selectedRows.length > 0) {
        data = selectedRows.map((el) => el.id);
      }
      data = {
        userId: Employee.id,
        groupIds: data,
        filename: csvFileName + ".csv",
      };
    }
    try {
      let result = await api.post("groups/export", data);
      setDownloadCsvLink(result.data.data.path);
      setExportModal(() => false);
      setCsvFileName("");
      toast(intl.groups_export_success, successToastSettings);
    } catch (err) {
      toast(intl.contacts_export_failed, errorToastSettings);
    }
  }

  async function uploadCsvFile(payload) {
    setLoading(true);
    try {
      payload.channel = new Date().getTime() + "groupCsvUpload";
      await setCsvUploadInitiated(() => payload.channel);
      let result = await api.post("groups/import", {
        ...payload,
        ids: [Employee.id],
      });
    } catch (err) {
      setSubscriptionTrack.unsubscribe();
      setLoading(false);
      toast(intl.user_import_failed, errorToastSettings);
    }
  }
  /**ICON Imports */
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

  /**ICON Imports ends here*/
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };
  /**Delete handler */
  function handelDelete(record) {
    setRecord(record);
    setDeleteModal(() => true);
  }

  const handleChange = async (event) => {
    const { name, value } = event.target;
    if (name == "name") {
      setGroupDetails((prv) => {
        return { ...prv, name: value };
      });
      const formValues = { name: value, furigana: groupDetails.furigana };
      validateHandler(schemaUpdate, formValues, setErrors);
      setTouched((prevTouched) => ({
        ...prevTouched,
        ["name"]: true,
      }));
    }
    if (name == "furigana") {
      setGroupDetails((prv) => {
        return { ...prv, furigana: value };
      });
      const formValues = { name: groupDetails.name, furigana: value };
      await validateHandler(schemaUpdate, formValues, setErrors);
      setTouched((prevTouched) => ({
        ...prevTouched,
        ["furigana"]: true,
      }));
    }
    if (name == "groupNameCreate") {
      setGroupNameCreate(value);
      setTouched((prevTouched) => ({
        ...prevTouched,
        groupNameCreate: true,
      }));
    }
    if (name == "groupNameFurigana") {
      setGroupNameFurigana(value);
      setTouched((prevTouched) => ({
        ...prevTouched,
        groupNameFurigana: true,
      }));
    }
  };

  useEffect(() => {
    const formValues = { groupNameCreate, groupNameFurigana };
    validateHandler(schema, formValues, setErrors);
  }, [groupNameCreate, groupNameFurigana]);

  useEffect(() => {
    let name = groupDetails.name;
    let furigana = groupDetails.furigana;
    const formValues = { name, furigana };
    validateHandler(schemaUpdate, formValues, setErrors);
  }, [groupDetails.name, groupDetails.furigana]);

  function qrCodeIcons() {
    return <GetIconQRCode />;
  }

  function importHandler() {
    setTimeout(() => {
      setImportModal(() => true);
    }, 500);
  }
  function detailsHandler(row) {
    setGroupDetails(row);
    fetchGroupDetails(row, undefined);
  }

  React.useEffect(() => {
    fetchDevices();
    fetchData();
  }, [tab]);

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
      let { data: response } = await api.get("groups/list", params);
      response = response.data.Items.map((group, index) => {
        if (group.sender == displayOrder.displayOrderOne) {
          setGroupListOptionFirstValue(group.groupId);
        }
        return {
          key: index,
          id: group.groupId,
          value: group.groupId,
          label: group.name,
          name: group.name,
          userId: group.userId,
          groupId: group.groupId,
          contactsCount: group.contactsCount,
          pttNo: group.pttNo,
          disabled: false,
          standByGroup: group.standByGroup,
        };
      });

      let firstOptionResponse = response.map((item) => ({
        ...item,
        disabled: false,
      }));
      setGroupListData(response);
      setGroupListOptionFirst(firstOptionResponse);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErrors(error.message);
    }
  };

  const deleteGroup = async (selectedRows) => {
    toast.dismiss();
    if (selectedRows.length <= 0) {
      toast(intl.group_select, errorToastSettings);
      setDeleteModal(false);
      setDeleteModalData(false);
      return;
    }

    const groupIds = selectedRows.map((record) => ({
      id: record.id, // Assuming record has an 'id' property
      userId: Employee.id,
    }));

    setLoading(true);
    try {
      const response = await api.post(`groups/delete-all`, groupIds);
      let ids = groupIds.map((el) => el.id);
      if (ids.includes(groupListOptionFirstValue)) {
        setGroupListOptionFirstValue("");
      }
      setLoading(false);
      setDeleteModal(false);
      setDeleteModalData(false);
      setSelectAll(false);
      setSelectedRows([]);
      setDeleted(true);
      fetchData();
    } catch (error) {
      setLoading(false);
      setDeleteModal(false);
      setDeleteModalData(false);
      setErrors(error.message);
    }
  };

  const addGroup = async () => {
    toast.dismiss();
    if (!errors && groupContacts.length > 0) {
      setLoading(true);
      try {
        const payload = {
          userId: Employee.id,
          name: groupNameCreate,
          furigana: groupNameFurigana,
          contacts: groupContacts,
          standByGroup: false,
        };
        const response = await api.post("groups/create", payload);
        setLoading(false);
        setAddNewModal(() => false);
        setAddNewModalData(false);
        setTouched({});
        setGroupNameCreate("");
        setGroupNameFurigana("");
        setContactHolderDropDown("");
        setGroupContacts([]);
        setSameOptionError("");
        fetchData();
        // Assuming the response contains the "Items" array as shown in your example
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
    } else {
      const formValues = { groupNameCreate, groupNameFurigana };
      validateHandler(schema, formValues, setErrors);
      setTouched((prevTouched) => ({
        ...prevTouched,
        groupNameCreate: true,
        groupNameFurigana: true,
        contactHolderDropDown: true,
      }));
    }
  };

  const fetchGroupDetails = async (group, isChecked) => {
    setLoading(true);
    try {
      const params = {
        params: {
          id: group.groupId,
          userId: Employee.id,
        },
      };
      const response = await api.get("groups/get", params);
      if (isChecked == undefined) {
        setDetailsModal(() => true);
        setChecked(undefined);
        setLoading(false);
      }

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        let data = response.data.data.Item;
        const contacts = data.contacts.map((el) => {
          el.id = el.contactId;
          el.label = el.name;
          el.value = el.contactId;
          return el;
        });

        data.contacts = contacts;
        let tempContacts = data.contacts.map((el) => {
          return el.value;
        });
        await setGroupContacts(tempContacts);
        await setGroupDetails(data);
        if (isChecked != undefined) {
          setChecked(isChecked);
        }
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

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
          all: true,
        },
      };
      const response = await api.get("contacts/list", params);
      setLoading(false);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedDataWithoutDeviceName = data.Items.map((item, index) => {
          return {
            label: item.name,
            id: item.contactId,
            value: item.contactId,
            pttNo: item.pttNo,
            deviceId: item.deviceId,
            isDeleted: item.isDeleted,
            isContactImported: item.isContactImported,
          };
        });
        let formattedData = formattedDataWithoutDeviceName.map((contact) => {
          let device = deviceList.find(
            (deviceItem) => deviceItem.id == contact.deviceId
          );
          if (device) {
            contact.deviceName = device?.label || "";
          } else {
            contact.deviceName = "";
          }
          return contact;
        });
        setContactData(formattedData);
        let dropdownListTemp = formattedData.filter((el) => {
          return (
            !el.isDeleted &&
            el.pttNo != Employee.radioNumber &&
            !el.isContactImported
          );
        });
        setContactDataDropdownList(dropdownListTemp);
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

  const updateGroup = async (isChecked) => {
    toast.dismiss();
    if (isChecked == undefined) {
      const formValues = {
        // nameCreate: groupNameCreate,
        name: groupDetails.name,
        furigana: groupDetails.furigana,
      };
      await validateHandler(schemaUpdate, formValues, setErrors);
      await setTouched((prevTouched) => ({
        ...prevTouched,
        ["name"]: true,
      }));

      if (
        (errors && Object.keys(errors).length > 0) ||
        groupContacts.length <= 0
      ) {
        const formValues = {
          name: groupDetails.name,
          furigana: groupDetails.furigana,
        };

        await setTouched(() => ({
          ...touched,
          ["name"]: true,
          ["furigana"]: true,
          contactHolderDropDown: true,
        }));
        await validateHandler(schemaUpdate, formValues, setErrors);
      } else {
        setLoading(true);
        try {
          const payload = {
            id: groupDetails.groupId,
            userId: Employee.id,
            name: groupDetails.name,
            furigana: groupDetails.furigana,
            contacts: groupContacts,
            detachedContact: detachContactFromGrp,
            standByGroup: groupDetails.standByGroup || false,
          };
          const response = await api.put("groups/update", payload);
          setSameOptionError("");
          setLoading(false);
          setDetailsModal(false);
          setEditModal(false);
          setAddNewModal(() => false);
          setAddNewModalData(false);
          fetchData();
          setContactHolderDropDown("");
          setGroupContacts([]);
          setTouched({});
          // Assuming the response contains the "Items" array as shown in your example
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
      }
    } else {
      try {
        setLoading(true);
        const payload = {
          id: groupDetails.groupId,
          userId: Employee.id,
          name: groupDetails.name,
          furigana: groupDetails.furigana,
          contacts: groupContacts,
          standByGroup: isChecked,
          detachedContact: [],
        };
        const response = await api.put("groups/update", payload);
        setSameOptionError("");
        setLoading(false);
        setDetailsModal(false);
        setEditModal(false);
        setAddNewModal(() => false);
        setAddNewModalData(false);
        fetchData();
        setContactHolderDropDown("");
        setGroupContacts([]);
        setTouched({});
        // Assuming the response contains the "Items" array as shown in your example
      } catch (error) {
        toast.dismiss();
        setLoading(false);
        toast(error.response?.data?.status.message, {
          id: "update",
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
    }
  };

  const fetchDevices = async () => {
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
        },
      };
      const response = await api.get("devices/list", params);
      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        let today = data?.todayDate || dayjs().format("YYYY-MM-DD");
        let isValid = false;
        const formattedData = data.Items.map((item) => {
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            item.disabled = false;
            if (!futureDate) {
              isValid =
                dayjs(today).isSameOrBefore(item.endDate) &&
                dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                item.name = item.name + intl.user_expired;
                item.disabled = true;
              }
            }
          }
          return {
            label: item.name,
            id: item.id,
            value: item.id,
            disabled: item.disabled,
          };
        });
        await setDeviceList(formattedData);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  function getLabel(id) {
    const matchingItem = contactList.find((item) => item.id == id);
    if (matchingItem) {
      return `<div class="flex"><span class="truncate flex w-1/2">${matchingItem.pttNo}</span><span class="truncate flex w-1/2">${matchingItem.deviceName}</span></div>`;
    }
  }

  function checkOwnNumber(id) {
    const matchingItem = contactList.find((item) => item.id == id);
    if (matchingItem?.pttNo && Employee.radioNumber == matchingItem.pttNo) {
      return true;
    } else {
      return false;
    }
  }

  function deleteContact(id) {
    setTouched((prevTouched) => ({
      ...prevTouched,
      contactHolderDropDown: true,
    }));
    let isElementExists = groupContacts.find((el) => el == selectedOption);
    isElementExists && setSameOptionError("");
    let tempDel = [];
    let matchingItem = groupContacts.map((item) => {
      if (item != id) {
        return item;
      } else {
        tempDel.push(item);
      }
    });
    matchingItem = matchingItem.filter((item) => item != null);
    setDetachContactFromGrp(() => tempDel);
    setGroupContacts(matchingItem);
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

  async function updatePriority(displayOrder, isReceiver, group_id) {
    toast.dismiss();
    try {
      setLoading(true);
      let payload = {
        userId: Employee.id,
        id: group_id,
        receiver: {
          receiver: isReceiver,
          displayOrder: isReceiver ? displayOrder + "" : "0",
        },
        sender: isReceiver ? "" : displayOrder + "",
      };
      const response = await api.post("groups/priority", payload);
      setLoading(false);
      if (response && response.data.status.code == code.OK) {
        setGroupListOptionFirstValue("");
        fetchData();
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
            setImportModal(() => !importModal);
            if (ecount > 0) {
              setLoading(true);
              try {
                let csvLink = await api.post("groups/import", {
                  failures: failedRowIndexes,
                });
                setDownloadCsvLink(csvLink.data.data.failureFile);
              } finally {
                setLoading(false);
                toast(
                  `${ecount} 行のデータインポートに失敗しました`,
                  errorToastSettings
                );
                subscription.unsubscribe();
                fetchData();
              }
            }

            if (ecount == 0 && scount > 0) {
              toast(intl.user_imported_successfully, successToastSettings);
              subscription.unsubscribe();
              fetchData();
            }
          }, 2000);
          setLoading(false);
          setCsvUploadInitiated(() => null);
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
        <div className="flex justify-between mb-2 xl:mb-2 "></div>
        <div className="flex flex-col justify-between  md:flex-row md:space-y-0 md:space-x-4 pt-[10px] pb-[20px]">
          <div className="w-full md:w-1/4 md:w-auto pb-[20px] md:pb-0">
            <DropdownMedium
              defaultSelectNoOption={false}
              isModal={true}
              borderRound={"rounded"}
              padding={"py-[8px] px-[8px]"}
              options={groupListOptionFirst}
              keys={"value"} // From options array
              optionLabel={"label"} // From options array
              border={"border border-gray-300 w-[140px]"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              bg={"bg-white"}
              text={"text-sm"}
              additionalClass={"block w-full min-w-[250px] pl-2"}
              id={"Id"}
              labelColor={"#7B7B7B"}
              placeholder={intl.groups_last_call}
              //   label={"自端末最終発呼および同時待受グループ"}
              disabled={false}
              labelClass={"float-left"}
              dropIcon={"70%"}
              value={groupListOptionFirstValue}
              onChange={(groupId) => {
                const newValue = groupId;
                const previousValue = groupListOptionFirstValue;
                setGroupListOptionFirstValue(groupId);
                // Check if the value has changed before calling updatePriority
                if (newValue !== previousValue) {
                  if (groupId) {
                    updatePriority(
                      displayOrder.displayOrderOne,
                      false,
                      groupId
                    );
                  }
                }
              }}
            />
          </div>
          <div className="flex">
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
              text={intl.add_group}
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
        </div>
        <div className="mb-[5px] flex items-center">
          <label
            key={"selectAll"}
            className="flex items-center text-customBlue"
          >
            <input
              type="checkbox"
              disabled={groupListData?.length == 0}
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
            dataSource={groupListData}
            onSelectRow={handleSelectRow}
            defaultPaeSizeOptions={tableDefaultPageSizeOption}
            defaultValue={1}
            onRowClick={async (row, rowIndex) => {
              await setChecked(undefined);
              setErrors({});
              setTouched({});
              await setDetailsModal(() => false);
              await setEditModal(() => false);
              await detailsHandler(row);
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
                    toast(intl.group_select, {
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
                    toast(intl.group_select, {
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
      </div>

      {deleteModal && (
        <AntModal
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue font-semibold text-[20px] text-center">
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
          <p style={{ textAlign: "center" }} className="font-normal text-base">
            {intl.user_group_delete}
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
              onClick={() => {
                deleteGroup(selectedRows);
              }}
            >
              {intl.help_settings_addition_delete_button}({selectedRows.length})
            </Button>
          </div>
        </AntModal>
      )}
      {exportModal && (
        <AntModal
          width={385}
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-[20px] text-customBlue text-center">
              {intl.company_list_company_export_title}
            </div>
          }
          open={true}
          onCancel={() => {
            setExportModal(false); // Properly close the modal
            setCsvFileName(""); // Clear the file name field
            setFileNameError(""); // Clear the validation error
          }}
          footer={() => {
            return (
              <div className="px-[40px] pb-[32px] pt-[20px]">
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
          }}
          centered={true}
          className="my-[70px]"
        >
          <div className="flex flex-col">
            <div className="flex-grow py-[20px] mb-4">
              <form className="grid grid-cols-1 gap-y-3 ">
                <div className="flex flex-col px-[40px] ">
                  <TextPlain
                    type="text"
                    for={"id"}
                    placeholder={intl.user_history_settings_file_name}
                    borderRound="rounded"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white"
                    additionalClass="block w-full pl-5 h-[40px] text-base pr-[30px]"
                    label={intl.user_history_settings_file_name}
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
      {importModal && (
        <>
          <ImportModal
            modelToggle={importModal}
            onCloseHandler={() => {
              setImportModal(false);
              setFileValidationError("");
            }}
            file={file}
            setFile={setFile}
            fileName={fileName}
            setFileName={setFileName}
            fileValidationError={fileValidationError}
            setFileValidationError={setFileValidationError}
            uploadCsvFile={(payload) => uploadCsvFile(payload)}
            sampleLink={sampleLinks().Groups}
            operation="dynamic"
          />
        </>
      )}
      {addNewModal && (
        <AntModal
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-[20px] text-customBlue text-center">
              {intl.user_group_add_new}
            </div>
          }
          className="my-[70px]"
          open={true}
          width={385}
          onCancel={() => {
            setAddNewModalData(false);
            setAddNewModal(false);
            setTouched({});
            setGroupNameCreate("");
            setGroupNameFurigana("");
            setContactHolderDropDown("");
            setSameOptionError("");
            setGroupContacts([]);
          }}
          centered
          footer={(_) => (
            <>
              <div className="flex justify-center px-[32px] pb-[32px]">
                <IconLeftBtn
                  type="button"
                  text={intl.help_settings_addition_keep}
                  textColor={"text-white font-semibold text-[16px] w-full"}
                  py={"py-[11px]"}
                  px={"w-[84%]"}
                  bgColor={"bg-customBlue"}
                  textBold={true}
                  icon={() => {
                    return null;
                  }}
                  onClick={() => {
                    addGroup();
                  }}
                />
              </div>
            </>
          )}
        >
          <div className="flex flex-col">
            <div className="flex-grow py-[20px] px-[32px]">
              <form className="grid grid-cols-1 gap-y-2">
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"groupNameCreate"}
                    placeholder={intl.user_group_mongst_list_grp_name}
                    borderRound="rounded"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 h-[40px] focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={intl.user_group_mongst_list_grp_name}
                    labelColor="#7B7B7B"
                    id={"groupNameCreate"}
                    name={"groupNameCreate"}
                    isRequired={true}
                    labelClass="float-left"
                    value={groupNameCreate}
                    onChange={handleChange}
                  />

                  {addNewModal &&
                    errors?.groupNameCreate &&
                    touched?.groupNameCreate && (
                      <div
                        className="pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.groupNameCreate}
                      </div>
                    )}
                </div>
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"groupNameFurigana"}
                    placeholder={intl.furigana}
                    borderRound="rounded"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 h-[40px] focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={intl.furigana}
                    labelColor="#7B7B7B"
                    id={"groupNameFurigana"}
                    name={"groupNameFurigana"}
                    isRequired={true}
                    labelClass="float-left"
                    value={groupNameFurigana}
                    onChange={handleChange}
                  />

                  {addNewModal &&
                    errors?.groupNameFurigana &&
                    touched?.groupNameFurigana && (
                      <div
                        className="pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.groupNameFurigana}
                      </div>
                    )}
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-row items-center">
                    <div className="basis-4/5">
                      <DropdownMedium
                        defaultSelectNoOption={false}
                        borderRound={"rounded"}
                        padding={" h-[40px]"}
                        options={contactDataDropdownList}
                        keys={"value"} // From options array
                        optionLabel={"label"} // From options array
                        border={"border border-gray-300"}
                        focus={
                          "focus:outline-none focus:ring-2 focus:ring-customBlue"
                        }
                        width="max-h-[300px]"
                        bg={"bg-white"}
                        text={"text-sm"}
                        additionalClass={"block w-full pl-5"}
                        id={"Id"}
                        labelColor={"#7B7B7B"}
                        label={intl.group_member}
                        disabled={false}
                        isRequired={true}
                        labelClass="float-left"
                        dropIcon={"70%"}
                        value={contactHolderDropDown}
                        isModal={true}
                        onChange={(pttNo) => {
                          setContactHolderDropDown(pttNo);
                        }}
                      />
                    </div>
                    <div className="basis">
                      <IconBtn
                        textColor={"text-white"}
                        textBold={true}
                        icon={() => editIcon()}
                        additionalClass={
                          "py-[10.5px] px-[8.5px] mt-[26px] h-[40px] ml-3"
                        }
                        bg="bg-transparent"
                        onClick={() => {
                          setTouched((prevTouched) => ({
                            ...prevTouched,
                            contactHolderDropDown: true,
                          }));
                          if (!contactHolderDropDown) {
                            return;
                          }
                          let isElementExists = groupContacts.find(
                            (el) => el == contactHolderDropDown
                          );
                          if (!isElementExists) {
                            setSameOptionError("");
                            setGroupContacts((prv) => [
                              ...prv,
                              contactHolderDropDown,
                            ]);
                            setContactHolderDropDown("");
                          } else {
                            setSelectedOption(contactHolderDropDown);
                            setSameOptionError(intl.contact_already_exist);
                          }
                          return;
                        }}
                      />
                    </div>
                  </div>
                  {addNewModal &&
                    touched?.contactHolderDropDown &&
                    (groupContacts.length <= 0 || optionError) && (
                      <div
                        className="pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {optionError || intl.validation_required}
                      </div>
                    )}
                </div>
                <div style={{ display: "contents" }}>
                  <nav className="group-member-class">
                    <ul>
                      {groupContacts.length > 0 &&
                        groupContacts.map((member, index) => {
                          return (
                            <li
                              className="flex justify-between pr-1 my-2"
                              key={member}
                              id={index}
                            >
                              <div className="w-[90%] truncate">
                                <div
                                  className=""
                                  dangerouslySetInnerHTML={{
                                    __html: getLabel(member),
                                  }}
                                />
                              </div>

                              <button
                                className="float-right cursor-pointer"
                                onClick={() => {
                                  deleteContact(member);
                                  setContactHolderDropDown("");
                                }}
                              >
                                <SectionDeleteIcon />
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </nav>
                </div>
              </form>
            </div>
          </div>
        </AntModal>
      )}
      {(detailsModal || editModal) && (
        // <Modal
        //   height="600px"
        //   fontSize="text-xl"
        //   fontWeight="font-semibold"
        //   textColor="#19388B"
        //   text={detailsModal ? intl.group_details : intl.edit_group}
        //   onCloseHandler={() => {
        //     setAddNewModalData(false);
        //     setAddNewModal(false);
        //     setEditModal(false);
        //     setDetailsModal(false);
        //     setTouched({});
        //     setSameOptionError("");
        //     setGroupContacts([]);
        //     setContactHolderDropDown("");
        //   }}
        //   displayEditIcon={detailsModal}
        //   handelEdit={async () => {
        //     await setDetailsModal(() => false);
        //     await setEditModal(() => true);
        //   }}
        //   modalFooter={() => {
        //     return (
        //       !detailsModal && (
        //         <IconLeftBtn
        //           text={intl.help_settings_addition_keep}
        //           textColor={"text-white font-semibold text-sm w-full"}
        //           py={"py-[11px]"}
        //           px={"w-[84%]"}
        //           bgColor={"bg-customBlue"}
        //           textBold={true}
        //           icon={() => {
        //             return null;
        //           }}
        //           onClick={() => {
        //             updateGroup();
        //           }}
        //         />
        //       )
        //     );
        //   }}
        // >

        <AntModal
          title={
            <div className="flex justify-center items-center pt-4 px-4 pb-0 rounded-t ">
              {/* Modify this line */}
              <h3 className="text-[20px] font-semibold text-[#19388b] dark:text-black flex-grow flex justify-center">
                {detailsModal ? intl.group_details : intl.edit_group}
              </h3>
              {detailsModal && (
                <IconBtn
                  textColor={"text-white"}
                  textBold={true}
                  icon={() => editModalIcon()}
                  onClick={async () => {
                    await setDetailsModal(() => false);
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
          onCancel={() => {
            setAddNewModalData(false);
            setAddNewModal(false);
            setEditModal(false);
            setDetailsModal(false);
            setTouched({});
            setSameOptionError("");
            setGroupContacts([]);
            setContactHolderDropDown("");
          }}
          centered
          footer={() => {
            return (
              !detailsModal && (
                <div className="px-[32px] pb-[32px] pt-[20px]">
                  <IconLeftBtn
                    text={intl.help_settings_addition_keep}
                    textColor={"text-white font-semibold text-sm w-full"}
                    py={""}
                    px={"w-[84%]"}
                    bgColor={"bg-customBlue"}
                    textBold={true}
                    icon={() => {
                      return null;
                    }}
                    onClick={() => {
                      updateGroup();
                    }}
                  />
                </div>
              )
            );
          }}
        >
          <div className="flex flex-col px-[4%]">
            <div className="flex-grow py-[10px]">
              <form
                className={`grid grid-cols-1 gap-y-2  px-[40px] ${
                  detailsModal ? "pb-[32px]" : ""
                }`}
              >
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"name"}
                    name={"name"}
                    placeholder={intl.user_group_mongst_list_grp_name}
                    borderRound="rounded"
                    padding="p-[10px]"
                    focus="focus:outline-none h-[40px] focus:ring-2 focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white border"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={intl.user_group_mongst_list_grp_name}
                    labelColor="#7B7B7B"
                    id={"name"}
                    isRequired={!detailsModal}
                    value={groupDetails.name}
                    onChange={handleChange}
                    disabled={detailsModal}
                    labelClass={"float-left"}
                  />
                  {editModal && errors?.name && touched?.name && (
                    <div
                      className="pl-1 validation-font flex"
                      style={{ color: "red" }}
                    >
                      {errors?.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"furigana"}
                    name={"furigana"}
                    placeholder={intl.furigana}
                    borderRound="rounded"
                    padding="p-[10px]"
                    focus="focus:outline-none h-[40px] focus:ring-2 focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white border"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={intl.furigana}
                    labelColor="#7B7B7B"
                    id={"furigana"}
                    isRequired={!detailsModal}
                    value={groupDetails.furigana}
                    onChange={handleChange}
                    disabled={detailsModal}
                    labelClass={"float-left"}
                  />
                  {editModal && errors?.furigana && touched?.furigana && (
                    <div
                      className="pl-1 validation-font flex"
                      style={{ color: "red" }}
                    >
                      {errors?.furigana}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"groupId"}
                    name={"groupId"}
                    placeholder={intl.group_id}
                    borderRound="rounded"
                    padding="p-[10px]"
                    focus="focus:outline-none h-[40px] focus:ring-2 focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white border"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={intl.group_id}
                    labelColor="#7B7B7B"
                    id={"groupId"}
                    isRequired={false}
                    value={groupDetails.groupId}
                    onChange={handleChange}
                    disabled={true}
                    labelClass={"float-left"}
                  />
                </div>

                <div className="flex flex-col">
                  {!detailsModal && groupDetails.contacts.length > 0 && (
                    <div className="flex flex-col">
                      <div className="flex flex-row items-center mb-2">
                        <div className={detailsModal ? "w-full" : "basis-4/5"}>
                          <DropdownMedium
                            defaultSelectNoOption={false}
                            borderRound={"rounded"}
                            padding={" h-[40px]"}
                            options={contactDataDropdownList}
                            keys={"value"} // From options array
                            optionLabel={"label"} // From options array
                            border={"border border-gray-300"}
                            focus={
                              "focus:outline-none focus:ring-2 focus:ring-customBlue"
                            }
                            bg={"bg-white"}
                            text={"text-sm"}
                            additionalClass={"block w-full pl-5"}
                            id={"Id"}
                            labelColor={"#7B7B7B"}
                            label={intl.group_member}
                            disabled={false}
                            isRequired={!detailsModal ? true : false}
                            labelClass="float-left"
                            dropIcon={"70%"}
                            value={contactHolderDropDown}
                            isModal={true}
                            onChange={(contactId) => {
                              setContactHolderDropDown(contactId);
                            }}
                          />
                        </div>
                        <div className="basis">
                          {!detailsModal && (
                            <IconBtn
                              textColor={"text-white"}
                              textBold={true}
                              icon={() => editIcon()}
                              additionalClass={
                                "py-[10.5px] px-[8.5px] mt-[26px] ml-3 h-[40px]"
                              }
                              bg="bg-transparent"
                              onClick={() => {
                                setTouched((prevTouched) => ({
                                  ...prevTouched,
                                  contactHolderDropDown: true,
                                }));
                                if (contactHolderDropDown) {
                                  let isElementExists = groupContacts.find(
                                    (el) => el == contactHolderDropDown
                                  );
                                  if (!isElementExists) {
                                    setGroupContacts((prv) => [
                                      ...prv,
                                      contactHolderDropDown,
                                    ]);
                                    setSameOptionError("");
                                    setContactHolderDropDown("");
                                  } else {
                                    setSelectedOption(contactHolderDropDown);
                                    setSameOptionError(
                                      intl.contact_already_exist
                                    );
                                  }
                                  return;
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                      {editModal &&
                        touched?.contactHolderDropDown &&
                        (groupContacts.length <= 0 || optionError) && (
                          <div
                            className="pl-1 validation-font flex"
                            style={{ color: "red" }}
                          >
                            {optionError || intl.validation_required}
                          </div>
                        )}
                    </div>
                  )}
                  {detailsModal && (
                    <div className="w-full">
                      <label
                        htmlFor={"label-for-address"}
                        className="flex mb-1 text-[16px] font-medium float-left"
                        style={{ color: "#7B7B7B" }}
                      >
                        {intl.group_member}
                        {!detailsModal && (
                          <span style={{ color: "red" }}> *</span>
                        )}
                      </label>
                    </div>
                  )}
                  <div style={{ display: "contents" }}>
                    <nav className="group-member-class">
                      <ul>
                        {groupContacts.length > 0 &&
                          groupContacts.map((member, index) => {
                            return (
                              <li
                                className="pr-1 my-2 flex justify-between"
                                key={member}
                                id={index}
                              >
                                <div className="w-[90%] truncate">
                                  <div
                                    className=""
                                    dangerouslySetInnerHTML={{
                                      __html: getLabel(member),
                                    }}
                                  />
                                </div>
                                {!detailsModal && (
                                  <button
                                    className="float-right cursor-pointer"
                                    onClick={() => {
                                      deleteContact(member);
                                      setContactHolderDropDown("");
                                    }}
                                    disabled={checkOwnNumber(member)}
                                  >
                                    <SectionDeleteIcon />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                      </ul>
                    </nav>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </AntModal>
      )}
      <a
        id={"linkCsv"}
        ref={CSVDownloadRefGrp}
        href={downloadCsvLink}
        download
        key={downloadCsvLink}
      ></a>
    </>
  );
}
