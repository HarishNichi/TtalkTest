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
import GetIconQRCode from "../../../components/Icons/qrCode";
import ImportModal from "@/components/ImportModal/importModal";
import api from "@/utils/api";
import { useAppSelector } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { convertToPttFormat } from "@/validation/helperFunction";
import { ToastContainer, toast } from "react-toastify";
import { validateHandler } from "@/validation/helperFunction";
import * as Yup from "yup";
import { MAX_100_LENGTH_PATTERN } from "@/validation/validationPattern";
import { Checkbox } from "antd";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
Amplify.configure(gen.config);
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export default function Group({
  children,
  addNewModalData,
  setAddNewModalData,
  deleteModalData,
  setDeleteModalData,
  exportModal,
  setExportModal,
  importModal,
  setImportModal,
  selectedRows,
  setSelectedRows,
}) {
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const schema = Yup.object().shape({
    groupNameCreate: Yup.string().required(intl.validation_required).matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    groupNameFurigana: Yup.string().required(intl.validation_required).matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
  });

  const schemaUpdate = Yup.object().shape({
    name: Yup.string().required(intl.validation_required).matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    furigana: Yup.string().required(intl.validation_required).matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
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
      render: (text) => <a style={{ fontSize: "14px", fontWeight: "500" }}>{text}</a>,
      width: 240,
      align: "left",
    },
    {
      title: intl.user_group_mongst_list_numberOfContacts,
      dataIndex: "contactsCount",
      render: (text) => <a style={{ fontSize: "14px", fontWeight: "500" }}>{text}</a>,
      width: 110,
      align: "left",
    },
    {
      title: "同時待受けグループ", // Add a title for the checkbox column
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
  const [deleteModal, setDeleteModal] = React.useState(deleteModalData);
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
  const [contactDataDropdownList, setContactDataDropdownList] = React.useState([]);
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
  const [groupListOptionFirstValue, setGroupListOptionFirstValue] = React.useState("");

  const [optionError, setSameOptionError] = React.useState("");
  const [selectedOption, setSelectedOption] = React.useState("");
  const [selectAll, setSelectAll] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const [checked, setChecked] = React.useState(undefined);
  const [tableHeight, setTableHeight] = React.useState(450);
  const [csvFileName, setCsvFileName] = React.useState("");
  const [downloadCsvLink, setDownloadCsvLink] = React.useState(null);
  const [fileValidationError, setFileValidationError] = React.useState(null);
  const [fileNameError, setFileNameError] = React.useState(null);
  const [csvUploadInitiated, setCsvUploadInitiated] = React.useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = React.useState(null);
  const [detachContactFromGrp, setDetachContactFromGrp] = useState([]);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
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

    setGroupListData((prevData) => prevData.map((item) => (item.key === record.key ? { ...item, standByGroup: !item.standByGroup } : item)));
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
      toast("エクスポートが成功しました", successToastSettings);
    } catch (err) {
      toast("エクスポートに失敗しました", errorToastSettings);
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
      toast("インポートに失敗しました", errorToastSettings);
    }
  }
  /**ICON Imports */
  function editIcon() {
    return <AddIcon />;
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
          all: true
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
            isContactImported: item.isContactImported
          };
        });
        let formattedData = formattedDataWithoutDeviceName.map((contact) => {
          let device = deviceList.find((deviceItem) => deviceItem.id == contact.deviceId);
          if (device) {
            contact.deviceName = device?.label || "";
          } else {
            contact.deviceName = "";
          }
          return contact;
        });
        setContactData(formattedData);
        let dropdownListTemp = formattedData.filter((el) => {
          return !el.isDeleted && el.pttNo != Employee.radioNumber && !el.isContactImported;
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

      if ((errors && Object.keys(errors).length > 0) || groupContacts.length <= 0) {
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
          detachedContact: []
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
        let today = data?.todayDate || dayjs().format('YYYY-MM-DD')
        let isValid = false;
        const formattedData = data.Items.map((item) => {
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            item.disabled = false;
            if (!futureDate) {
              isValid = dayjs(today).isSameOrBefore(item.endDate) && dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                item.name = item.name + " - 期限切れ";
                item.disabled = true;
              }
            }
          }
          return {
            label: item.name,
            id: item.id,
            value: item.id,
            disabled: item.disabled
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
        hasMap.add(data.token)
        setLoading(true);
        let dataReceived = JSON.parse(data);

        if (dataReceived?.rowsInserted) {
          dataReceived.rowsInserted = (dataReceived?.rowsInserted && JSON.parse(dataReceived?.rowsInserted)) || 0;
          scount = scount + dataReceived?.rowsInserted;
        }

        if (dataReceived?.rowsFailed) {
          dataReceived.rowsFailed = dataReceived?.rowsFailed && JSON.parse(dataReceived?.rowsFailed);
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
                toast(`${ecount} 行のデータインポートに失敗しました`, errorToastSettings);
                subscription.unsubscribe();
                fetchData();
              }
            }

            if (ecount == 0 && scount > 0) {
              toast("正常にインポートされました。", successToastSettings);
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
      <ToastContainer />
      <div>
        <div className="flex justify-between mb-2 xl:mb-2 ">
          <div className="flex items-center">
            <DynamicLabel
              text={intl.user_group_mongst_list_grp_title}
              alignment="text-center"
              fontSize="text-[22px]"
              fontWeight="font-medium"
              textColor="#000000"
              disabled={false}
            />
          </div>
        </div>
        <div className="flex flex-col justify-end  md:flex-row md:space-y-0 md:space-x-4 pt-[10px] pb-[20px]">
          <div className="w-full md:w-1/4 md:w-auto pb-[20px] md:pb-0">
            <DropdownMedium
              defaultSelectNoOption={false}
              isModal={true}
              borderRound={"rounded-xl"}
              padding={"py-[11px]"}
              options={groupListOptionFirst}
              keys={"value"} // From options array
              optionLabel={"label"} // From options array
              border={"border border-[#e7e7e9]"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              bg={"bg-white"}
              text={"text-sm"}
              additionalClass={"block w-full pl-2"}
              id={"Id"}
              labelColor={"#7B7B7B"}
              label={"自端末最終発呼および同時待受グループ"}
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
                    updatePriority(displayOrder.displayOrderOne, false, groupId);
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="mb-[5px] flex items-center">
          <label key={"selectAll"} className="flex items-center text-customBlue">
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
            <span className="ml-1"> {"すべて選択"}</span>
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
      </div>
      {deleteModal && (
        <Modal
          height="412px"
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text={intl.help_settings_addition_delete}
          onCloseHandler={() => {
            setDeleteModalData(false);
            setDeleteModal(false);
          }}
          modalFooter={() => {
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
                      setDeleteModalData(false);
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
                      deleteGroup(selectedRows);
                    }}
                  />
                </div>
              </div>
            );
          }}
        >
          <div className="flex flex-col">
            <div className="flex-grow py-[90px] pt-[60px] dark:text-black">{intl.user_group_delete}</div>
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
          modalFooter={() => {
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
          }}
        >
          <div className="flex flex-col">
            <div className="flex-grow py-[20px] mb-4">
              <form className="grid grid-cols-1 gap-y-3">
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"id"}
                    placeholder={"ファイル名"}
                    borderRound="rounded-xl"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#e7e7e9]"
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
                  {fileNameError && <div className="validation-font text-sm text-[red] text-left">{fileNameError}</div>}
                </div>
              </form>
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
      {importModal && (
        <>
          <ImportModal
            modelToggle={importModal}
            onCloseHandler={setImportModal}
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
        <Modal
          height="520px"
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text={intl.user_group_add_new}
          onCloseHandler={() => {
            setAddNewModalData(false);
            setAddNewModal(false);
            setTouched({});
            setGroupNameCreate("");
            setGroupNameFurigana("");
            setContactHolderDropDown("");
            setSameOptionError("");
            setGroupContacts([]);
          }}
          modalFooter={() => {
            return (
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
            );
          }}
        >
          <div className="flex flex-col">
            <div className="flex-grow py-[20px]">
              <form className="grid grid-cols-1 gap-y-2">
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"groupNameCreate"}
                    placeholder={"グループ名"}
                    borderRound="rounded-xl"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#e7e7e9]"
                    bg="bg-white"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={"グループ名"}
                    labelColor="#7B7B7B"
                    id={"groupNameCreate"}
                    name={"groupNameCreate"}
                    isRequired={true}
                    labelClass="float-left"
                    value={groupNameCreate}
                    onChange={handleChange}
                  />

                  {addNewModal && errors?.groupNameCreate && touched?.groupNameCreate && (
                    <div className="pl-1 validation-font flex" style={{ color: "red" }}>
                      {errors?.groupNameCreate}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"groupNameFurigana"}
                    placeholder={"ふりがな"}
                    borderRound="rounded-xl"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#e7e7e9]"
                    bg="bg-white"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={"ふりがな"}
                    labelColor="#7B7B7B"
                    id={"groupNameFurigana"}
                    name={"groupNameFurigana"}
                    isRequired={true}
                    labelClass="float-left"
                    value={groupNameFurigana}
                    onChange={handleChange}
                  />

                  {addNewModal && errors?.groupNameFurigana && touched?.groupNameFurigana && (
                    <div className="pl-1 validation-font flex" style={{ color: "red" }}>
                      {errors?.groupNameFurigana}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-row items-center">
                    <div className="basis-4/5">
                      <DropdownMedium
                        defaultSelectNoOption={false}
                        borderRound={"rounded-xl"}
                        padding={"pt-[12px] pb-[12px]"}
                        options={contactDataDropdownList}
                        keys={"value"} // From options array
                        optionLabel={"label"} // From options array
                        border={"border border-[#e7e7e9]"}
                        focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                        width="max-h-[300px]"
                        bg={"bg-white"}
                        text={"text-sm"}
                        additionalClass={"block w-full pl-5"}
                        id={"Id"}
                        labelColor={"#7B7B7B"}
                        label={"グループメンバー"}
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
                        additionalClass={"py-[10.5px] px-[8.5px] mt-[26px] ml-3"}
                        bg="bg-transparent"
                        onClick={() => {
                          setTouched((prevTouched) => ({
                            ...prevTouched,
                            contactHolderDropDown: true,
                          }));
                          if (!contactHolderDropDown) {
                            return;
                          }
                          let isElementExists = groupContacts.find((el) => el == contactHolderDropDown);
                          if (!isElementExists) {
                            setSameOptionError("");
                            setGroupContacts((prv) => [...prv, contactHolderDropDown]);
                            setContactHolderDropDown("");
                          } else {
                            setSelectedOption(contactHolderDropDown);
                            setSameOptionError("連絡先はすでに存在します");
                          }
                          return;
                        }}
                      />
                    </div>
                  </div>
                  {addNewModal && touched?.contactHolderDropDown && (groupContacts.length <= 0 || optionError) && (
                    <div className="pl-1 validation-font flex" style={{ color: "red" }}>
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
                            <li className="flex justify-between pr-1 my-2" key={member} id={index}>
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
        </Modal>
      )}
      {(detailsModal || editModal) && (
        <Modal
          height="600px"
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text={detailsModal ? "グループの詳細" : "グループの編集"}
          onCloseHandler={() => {
            setAddNewModalData(false);
            setAddNewModal(false);
            setEditModal(false);
            setDetailsModal(false);
            setTouched({});
            setSameOptionError("");
            setGroupContacts([]);
            setContactHolderDropDown("");
          }}
          displayEditIcon={detailsModal}
          handelEdit={async () => {
            await setDetailsModal(() => false);
            await setEditModal(() => true);
          }}
          modalFooter={() => {
            return (
              !detailsModal && (
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
                    updateGroup();
                  }}
                />
              )
            );
          }}
        >
          <div className="flex flex-col px-[4%]">
            <div className="flex-grow py-[10px]">
              <form className="grid grid-cols-1 gap-y-2">
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"name"}
                    name={"name"}
                    placeholder={"グループ名"}
                    borderRound="rounded-xl"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#e7e7e9]"
                    bg="bg-white border"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={"グループ名"}
                    labelColor="#7B7B7B"
                    id={"name"}
                    isRequired={!detailsModal}
                    value={groupDetails.name}
                    onChange={handleChange}
                    disabled={detailsModal}
                    labelClass={"float-left"}
                  />
                  {editModal && errors?.name && touched?.name && (
                    <div className="pl-1 validation-font flex" style={{ color: "red" }}>
                      {errors?.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"furigana"}
                    name={"furigana"}
                    placeholder={"ふりがな"}
                    borderRound="rounded-xl"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#e7e7e9]"
                    bg="bg-white border"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={"ふりがな"}
                    labelColor="#7B7B7B"
                    id={"furigana"}
                    isRequired={!detailsModal}
                    value={groupDetails.furigana}
                    onChange={handleChange}
                    disabled={detailsModal}
                    labelClass={"float-left"}
                  />
                  {editModal && errors?.furigana && touched?.furigana && (
                    <div className="pl-1 validation-font flex" style={{ color: "red" }}>
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
                    borderRound="rounded-xl"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#e7e7e9]"
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
                            borderRound={"rounded-xl"}
                            padding={"pt-[12px] pb-[12px]"}
                            options={contactDataDropdownList}
                            keys={"value"} // From options array
                            optionLabel={"label"} // From options array
                            border={"border border-[#e7e7e9]"}
                            focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                            bg={"bg-white"}
                            text={"text-sm"}
                            additionalClass={"block w-full pl-5"}
                            id={"Id"}
                            labelColor={"#7B7B7B"}
                            label={"グループメンバー"}
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
                              additionalClass={"py-[10.5px] px-[8.5px] mt-[26px] ml-3"}
                              bg="bg-transparent"
                              onClick={() => {
                                setTouched((prevTouched) => ({
                                  ...prevTouched,
                                  contactHolderDropDown: true,
                                }));
                                if (contactHolderDropDown) {
                                  let isElementExists = groupContacts.find((el) => el == contactHolderDropDown);
                                  if (!isElementExists) {
                                    setGroupContacts((prv) => [...prv, contactHolderDropDown]);
                                    setSameOptionError("");
                                    setContactHolderDropDown("");
                                  } else {
                                    setSelectedOption(contactHolderDropDown);
                                    setSameOptionError("連絡先はすでに存在します");
                                  }
                                  return;
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                      {editModal && touched?.contactHolderDropDown && (groupContacts.length <= 0 || optionError) && (
                        <div className="pl-1 validation-font flex" style={{ color: "red" }}>
                          {optionError || intl.validation_required}
                        </div>
                      )}
                    </div>
                  )}
                  {detailsModal && (
                    <div className="w-full">
                      <label htmlFor={"label-for-address"} className="flex mb-1 text-[16px] font-medium float-left" style={{ color: "#7B7B7B" }}>
                        {"グループメンバー"}
                        {!detailsModal && <span style={{ color: "red" }}> *</span>}
                      </label>
                    </div>
                  )}
                  <div style={{ display: "contents" }}>
                    <nav className="group-member-class">
                      <ul>
                        {groupContacts.length > 0 &&
                          groupContacts.map((member, index) => {
                            return (
                              <li className="pr-1 my-2 flex justify-between" key={member} id={index}>
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
        </Modal>
      )}
      <a id={"linkCsv"} ref={CSVDownloadRefGrp} href={downloadCsvLink} download key={downloadCsvLink}></a>
    </>
  );
}
