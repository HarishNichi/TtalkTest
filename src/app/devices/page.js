/* eslint-disable no-console */
"use client";

import React, { useState, useEffect, useRef } from "react";
import intl from "@/utils/locales/jp/jp.json";
import DynamicLabel from "@/components/Label/dynamicLabel";
import IconOutlineBtn from "@/components/Button/iconOutlineBtn";
import AddIcon from "@/components/Icons/addIcon";
import DataTable from "@/components/DataTable/DataTable";
import { Modal as AntModal } from "antd";
import {
  code,
  tableDefaultPageSizeOption,
  maxLimit,
  sampleLinks,
  successToastSettings,
  errorToastSettings,
} from "@/utils/constant";
import SectionDeleteIcon from "@/components/Icons/sectionDelete";
import SectionEditIcon from "@/components/Icons/sectionEditIcon";
import Modal from "@/components/Modal/modal";
import TextPlain from "@/components/Input/textPlain";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import * as Yup from "yup";
import { MAX_100_LENGTH_PATTERN } from "../../validation/validationPattern";
import { validateHandler, formatDate } from "../../validation/helperFunction";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import ProtectedRoute from "@/utils/auth";
import { ToastContainer, toast } from "react-toastify";
import ImportModal from "@/components/ImportModal/importModal";
import { Button, DatePicker, Switch } from "antd";
import locale from "antd/es/date-picker/locale/ja_JP";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { PiWaveSineLight } from "react-icons/pi";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
import "dayjs/locale/ja.js";
import DeleteIcon from "@/components/Icons/deleteIcon";
import DeleteIconDisabled from "@/components/Icons/deleteDisabledIcon";
Amplify.configure(gen.config);
dayjs.extend(customParseFormat);

export default function Devices() {
  const [loading, setLoading] = useState(false);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const CSVDownloadRef = useRef("");
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
  const router = useRouter();
  const [helpSettingsData, setHelpSettingsData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [fileNameError, setFileNameError] = useState(null);
  const [data, setData] = useState([]);
  // Yup schema to validate the form
  const schema = Yup.object().shape({
    addSettings: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    editSettings: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    deviceIsOnRent: Yup.boolean().required(),
    rentDateRange: Yup.array().test(
      "start-end-date-required",
      intl.validation_required,
      (value, parent) => {
        if (
          parent.parent.deviceIsOnRent == true &&
          parent.parent.deviceIsOnRent !== false
        ) {
          return value.every((item) => item);
        } else {
          return true;
        }
      }
    ),
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    CSVDownloadRef.current.click();
  }, [downloadCsvLink]);

  const helpSettingsColumns = [
    {
      title: intl.machine_name,
      dataIndex: "machineName",
      render: (text) => <a className="truncate">{text}</a>,
      width: "140px",
      align: "left",
      sorter: (a, b) => a.machineName.localeCompare(b.machineName),
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: intl.deadline,
      dataIndex: "isToggleOn",
      render: (text, record) => (
        <div style={{ marginLeft: "20%" }}>
          {text ? intl.devices_canbe : intl.devices_none}
        </div>
      ),
      width: "140px",
    },
    {
      title: intl.start_date,
      dataIndex: "startDate",
      render: (text, record) => {
        let startDate = record.isToggleOn ? text : "";
        return <div>{startDate}</div>;
      },
      width: "140px",
      sorter: (a, b) =>
        !a.startDate - !b.startDate || a.startDate.localeCompare(b.startDate),
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: intl.end_date,
      dataIndex: "endDate",
      render: (text, record) => {
        let endDate = record.isToggleOn ? text : "";
        return <div>{endDate}</div>;
      },
      width: "140px",
      sorter: (a, b) =>
        !a.endDate - !b.endDate || a.endDate.localeCompare(b.endDate),
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: "",
      dataIndex: "machineEdit",
      render: (text, record) => (
        <div style={{ marginLeft: "20%" }}>
          <p className="flex">
            <span
              data-testid={`delete`}
              className="ml-[25px] cursor-pointer rounded-full px-3 py-2 bg-[#EDF2F5] hover:bg-[#DCE7F0]"
              onClick={() => {
                setError("");
                handelEdit(record);
              }}
              style={{
                pointerEvents: record.deleted ? "none" : "auto",
              }}
              disabled={record.deleted}
            >
              <SectionEditIcon />
            </span>
          </p>
        </div>
      ),
      width: "140px",
      align: "left",
    },

    {
      title: "",
      dataIndex: "machineDelete",
      render: (text, record) => (
        <div style={{ marginLeft: "20%" }}>
          <p className="flex"></p>
        </div>
      ),
      width: "140px",
    },
  ];

  const [columns, setColumns] = React.useState(helpSettingsColumns);
  const [editModal, setEditModal] = React.useState(false);
  const [editSettings, setEditSettings] = React.useState("");
  const [addSettings, setAddSettings] = React.useState("");
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [addModal, setAddModal] = React.useState(false);
  const [editRecord, setRecord] = React.useState();
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [genericError, setError] = React.useState("");
  const [tableHeight, setTableHeight] = useState(450);
  const [deviceIsOnRent, setDeviceIsOnRent] = useState(false);
  const [rentDateRange, setRentDateRange] = useState(["", ""]);
  const [importModal, setImportModal] = React.useState(false);
  const [csvFileName, setCsvFileName] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState(null);
  const [fileValidationError, setFileValidationError] = React.useState(null);

  const [csvUploadInitiated, setCsvUploadInitiated] = React.useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = React.useState(null);
  function disabledDeleteIcon(flag) {
    return <DeleteIconDisabled isMobile={flag} />;
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
  function editIcon(flag) {
    return <AddIcon isMobile={flag} />;
  }

  function handelEdit(record) {
    setEditModal(() => false);
    setAddModal(() => false);
    setDeviceIsOnRent(() => false);
    setTimeout(() => {
      setRecord(record);
      setEditSettings(record.machineName);
      record.startDate && record.endDate && setDeviceIsOnRent(true);

      let x = record.startDate ? dayjs(record.startDate) : "";
      let y = record.endDate ? dayjs(record.endDate) : "";
      setRentDateRange([x, y]);
      setEditModal(() => true);
    }, 500);
  }

  function handelDelete(record) {
    setRecord(record);
    setDeleteModal(() => true);
  }
  const fetchData = async () => {
    toast.dismiss();
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

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedData = data.Items.map((item) => {
          const updateDate = item.updatedAt ? item.updatedAt : "";
          const createDate = item.createdAt;
          return {
            machineName: item.name,
            updateDate: formatDate(updateDate),
            createDate: formatDate(createDate),
            startDate: item.startDate
              ? dayjs(item.startDate).format("YYYY/MM/DD")
              : "",
            endDate: item.endDate
              ? dayjs(item.endDate).format("YYYY/MM/DD")
              : "",
            isToggleOn: item.startDate && item.endDate ? true : false,
            id: item.id,
            key: item.id,
            deleted: item.isDeleted,
            deviceAttachedCount: item.deviceAttachedCount,
          };
        });
        setHelpSettingsData(formattedData);
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
  const createDevice = async (name) => {
    toast.dismiss();
    setLoading(true);
    if (addSettings.trim().length === 0 || addSettings.trim().length > 100) {
      setLoading(false);
      const formValues = {
        addSettings,
        deviceIsOnRent,
        rentDateRange,
      };
      setTouched({
        ...touched,
        addSettings: true,
        deviceIsOnRent: true,
        rentDateRange: true,
      });
      await validateHandler(schema, formValues, setErrors);
      setAddModal(true);
    }

    if (deviceIsOnRent) {
      setLoading(false);
      const formValues = {
        addSettings,
        deviceIsOnRent,
        rentDateRange,
      };
      setTouched({
        ...touched,
        addSettings: true,
        deviceIsOnRent: true,
        rentDateRange: true,
      });
      await validateHandler(schema, formValues, setErrors);
    }
    errors?.editSettings && delete errors.editSettings;
    if (Object.keys(errors)?.length > 0) {
      return;
    }

    try {
      const payload = {
        name: name,
      };
      deviceIsOnRent &&
        Object.assign(payload, {
          startDate: rentDateRange[0]
            ? dayjs(rentDateRange[0]).format("YYYY-MM-DD")
            : "",
          endDate: rentDateRange[1]
            ? dayjs(rentDateRange[1]).format("YYYY-MM-DD")
            : "",
        });
      const response = await api.post("devices/create", payload);
      if (response.data.status.code == code.CREATED) {
        setLoading(false);
        setAddModal(false);
        fetchData();
        setAddSettings("");
        setErrors({});
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
      setAddModal(true);
    }
  };

  const updateDevice = async (record, name) => {
    toast.dismiss();
    setLoading(true);
    if (editSettings.trim().length === 0 || editSettings.trim().length > 100) {
      setLoading(false);
      const formValues = { editSettings, deviceIsOnRent, rentDateRange };
      setTouched({
        ...touched,
        editSettings: true,
        deviceIsOnRent: true,
        rentDateRange: true,
      });
      await validateHandler(schema, formValues, setErrors);
      setEditModal(true);
    }

    if (deviceIsOnRent) {
      setLoading(false);
      const formValues = {
        editSettings,
        deviceIsOnRent,
        rentDateRange,
      };
      setTouched((prevTouched) => ({
        ...prevTouched,
        editSettings: true,
        deviceIsOnRent: true,
        rentDateRange: true,
      }));
      await validateHandler(schema, formValues, setErrors);
    }

    errors?.addSettings && delete errors.addSettings;
    if (errors && Object.keys(errors)?.length > 0) {
      return;
    }

    try {
      const payload = {
        id: record.id,
        name: name,
      };

      deviceIsOnRent &&
        Object.assign(payload, {
          startDate: rentDateRange[0]
            ? dayjs(rentDateRange[0]).format("YYYY-MM-DD")
            : "",
          endDate: rentDateRange[1]
            ? dayjs(rentDateRange[1]).format("YYYY-MM-DD")
            : "",
        });

      const response = await api.put(`devices/update`, payload);
      if (response.data.status.code == code.OK) {
        setLoading(false);
        setEditModal(false);
        console.log("publish start");
        gen.publish(
          "admin",
          JSON.stringify({
            ...payload,
            type: "device",
          })
        );
        console.log("publish end");
        fetchData();
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
  };

  const deleteDevices = async () => {
    // Check if there are selected rows
    if (selectedRows.length === 0) {
      toast.error("No devices selected for deletion.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
      return;
    }

    toast.dismiss();
    setLoading(true);

    try {
      // Iterate through selected rows to delete them
      for (const record of selectedRows) {
        if (record.deviceAttachedCount > 0) {
          // If any device is attached, show an error and skip deletion
          toast.error(intl.device_user_attach, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            type: "error",
          });
          continue; // Skip this record and move to the next
        }

        const config = {
          data: {
            id: record.id,
          },
        };

        const response = await api.delete(`devices/delete`, config);

        if (response.data.status.code !== code.OK) {
          throw new Error(
            response.data.status.message || "Failed to delete device"
          );
        }
      }

      // Optionally, fetch fresh data if needed
      fetchData();

      // Hide the delete modal
      setDeleteModal(false);

      // Reset selectedRows state
      setSelectedRows([]);
    } catch (error) {
      // Handle errors and display a toast message
      toast(error.message || "An error occurred while deleting the devices.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "addSettings") {
      setAddSettings(value);
    } else if (name === "editSettings") {
      setEditSettings(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  useEffect(() => {
    const formValues = {
      addSettings,
      editSettings,
      deviceIsOnRent,
      rentDateRange,
    };
    validateHandler(schema, formValues, setErrors);
  }, [addSettings, editSettings, deviceIsOnRent, rentDateRange]);

  const onClose = () => {
    if (addModal) {
      setAddSettings("");
      setDeviceIsOnRent(false);
      setRentDateRange(["", ""]);
      setAddModal(false);
      setErrors({});
      setTouched({});
    } else {
      setEditSettings("");
      setDeviceIsOnRent(false);
      setRentDateRange(["", ""]);
      setEditModal(false);
      setErrors({});
      setTouched({});
    }
  };
  useEffect(() => {
    const handleResize = () => {
      setTableHeight(window.innerHeight - 210);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    console.log("enter", csvUploadInitiated);
    toast.dismiss();
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];
    const subscription = gen.subscribe(csvUploadInitiated, ({ data }) => {
      console.log("enter subs", data);
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
              let csvLink = await api.post("devices/import", {
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
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);

  async function uploadCsvFile(payload) {
    setLoading(true);
    try {
      payload.channel = new Date().getTime() + "deviceCsvUpload";
      console.log("hti  b4", payload);

      await setCsvUploadInitiated(() => payload.channel);
      let result = await api.post("devices/import", {
        ...payload,
      });

      console.log("hti");
    } catch (err) {
      subscriptionTrack.unsubscribe();
      setLoading(false);
      toast("インポートに失敗しました", errorToastSettings);
    }
  }

  return (
    <>
      <ProtectedRoute allowedRoles={["admin"]}>
        {loading && <LoaderOverlay />}

        <div>
          <div className="flex  justify-between mb-4 xl:mb-2 ">
            <div className="flex items-center">
              <DynamicLabel
                text={intl.device_terminal}
                alignment="text-center"
                fontSize="text-xl"
                fontWeight="font-semibold"
                textColor="#000000"
                disabled={false}
              />
            </div>

            <div className="flex gap-x-2">
              <IconOutlineBtn
                text={
                  selectedRows.length === 0
                    ? `${intl.help_settings_addition_delete}`
                    : `${intl.help_settings_addition_delete}(${selectedRows.length})`
                }
                textColor={"text-[#BA1818]"} // Light red when disabled, darker red otherwise
                borderColor={"border-none"} // Light border when disabled, no border otherwise
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                icon={deleteIcon}
                onClick={(event) => {
                  event.stopPropagation();
                  if (selectedRows.length > 0) {
                    handelDelete(selectedRows); // Call your delete handler with selected rows
                  }
                }}
                // Disable the button when selectedRows is empty
              />
              <IconOutlineBtn
                text={intl.company_list_company_import}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[47px] md:px-[48.5px] px-[48.5px]"}
                icon={() => importIcon()}
                borderColor={"border-none"}
                onClick={() => {
                  setImportModal(true);
                }}
              />
              <IconOutlineBtn
                text={intl.device_add_device}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[47px] md:px-[48.5px] px-[48.5px]"}
                icon={() => editIcon(false)}
                borderColor={"border-none"}
                onClick={() => {
                  setAddSettings("");
                  setDeviceIsOnRent(false);
                  setRentDateRange(["", ""]);
                  setAddModal(true);
                }}
              />
            </div>
          </div>
          <div className="mb-[16px] flex items-center">
            <label
              key={"selectAll"}
              className="flex items-center text-customBlue"
            >
              <input
                type="checkbox"
                disabled={helpSettingsData?.length == 0}
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
              rowSelectionFlag
              scrollVertical={tableHeight > 450 ? tableHeight : 450}
              columns={columns}
              dataSource={helpSettingsData}
              defaultPaeSizeOptions={tableDefaultPageSizeOption}
              defaultValue={1}
              page={page}
              selectAll={selectAll}
              setSelectAll={setSelectAll}
              setSelectedRows={setSelectedRows}
              setPage={setPage}
              current={current}
              setCurrent={setCurrent}
            />
          </div>
          <ToastContainer />
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
              sampleLink={sampleLinks().Devices}
              operation="dynamic"
            />
          )}
          {(editModal || addModal) && (
            <AntModal
              width={520}
              title={
                <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-center">
                  {addModal ? intl.device_add_device : intl.device_edit}
                </div>
              }
              open={editModal || addModal}
              onCancel={() => {
                onClose();
              }}
              centered
              className="my-[70px]"
              footer={() => {
                return (
                  <div className="px-[40px] pb-[40px] ">
                    <IconLeftBtn
                      text={
                        addModal
                          ? intl.help_settings_addition_btn
                          : intl.help_settings_addition_keep
                      }
                      textColor={"text-white font-semibold text-[16px] w-full"}
                      py={"py-[8px] px-[55px] w-full"}
                      px={""}
                      bgColor={"bg-customBlue"}
                      textBold={true}
                      icon={() => {
                        return null;
                      }}
                      onClick={() => {
                        setError("");
                        if (editModal) {
                          updateDevice(editRecord, editSettings);
                        }
                        if (addModal) {
                          createDevice(addSettings);
                        }
                      }}
                    />
                  </div>
                );
              }}
            >
              <div className="flex flex-col ">
                <div className="flex flex-col px-[40px] pb-[20px] ">
                  <div className={"mb-4"}>
                    <TextPlain
                      isRequired={true}
                      type={"text"}
                      for={addModal ? "addSettings" : "editSettings"}
                      placeholder={intl.machineName}
                      padding={"p-[10px] h-[40px]"}
                      focus={
                        "focus:outline-none focus:ring-2  focus:ring-customBlue "
                      }
                      border={"border border-gray-300"}
                      bg={"bg-white"}
                      additionalClass={"flex w-full pl-5 text-base pr-[30px]"}
                      label={intl.machine_name}
                      labelColor={"#7B7B7B"}
                      id={addModal ? "addSettings" : "editSettings"}
                      value={addModal ? addSettings : editSettings}
                      onChange={handleChange}
                    />
                    {editModal &&
                      errors?.editSettings &&
                      touched?.editSettings && (
                        <div
                          className=" pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.editSettings}
                        </div>
                      )}
                    {addModal &&
                      errors?.addSettings &&
                      touched?.addSettings && (
                        <div
                          className=" pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.addSettings}
                        </div>
                      )}
                  </div>
                  <div className="mb-4">
                    <label className="flex mb-1 text-[16px] font-medium  text-[#7b7b7b]">
                    {intl.deadline}
                    </label>
                    <div className="flex justify-start">
                      <Switch
                        handleBg="#fff"
                        value={deviceIsOnRent}
                        checked={deviceIsOnRent}
                        className="bg-gray-500"
                        onChange={async () => {
                          await setDeviceIsOnRent((prv) => !prv);
                        }}
                      />
                      {addModal &&
                        errors?.deviceIsOnRent &&
                        touched?.deviceIsOnRent && (
                          <div
                            className="mb-8 pl-1 validation-font flex"
                            style={{ color: "red" }}
                          >
                            {errors?.deviceIsOnRent}
                          </div>
                        )}
                    </div>
                  </div>
                  {deviceIsOnRent && (
                    <RangePicker
                      className="w-full py-[0.44rem] rounded-lg"
                      id="deviceIsOnRent"
                      separator={<PiWaveSineLight />}
                      style={{
                        border: "1px solid #e5e7eb",
                      }}
                      onChange={(dateObj, dateString) => {
                        dateString[0] = dateString[0]
                          ? dayjs(dateString[0])
                          : "";
                        dateString[1] = dateString[1]
                          ? dayjs(dateString[1])
                          : "";
                        setRentDateRange(dateString);
                      }}
                      value={[rentDateRange[0], rentDateRange[1]]}
                      locale={locale}
                      allowEmpty={[true, true]}
                      format={"YYYY/MM/DD"}
                      placeholder={["開始日", "終了日"]}
                      disabledDate={(current) => {
                        let yesterday = new Date(
                          Date.now() - 86400000
                        ).getTime(); // that is: 24 * 60 * 60 * 1000
                        return current.valueOf() < yesterday;
                      }}
                    />
                  )}

                  {addModal &&
                    errors?.rentDateRange &&
                    touched?.rentDateRange && (
                      <div
                        className="mb-8 pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.rentDateRange}
                      </div>
                    )}
                  {editModal &&
                    errors?.rentDateRange &&
                    touched?.rentDateRange && (
                      <div
                        className="mb-8 pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.rentDateRange}
                      </div>
                    )}
                </div>
              </div>
            </AntModal>
          )}

          {deleteModal && (
            <AntModal
              title={
                <div className="px-[40px] pt-[25px] font-semibold text-xl mb-[2vw] text-customBlue text-center">
                  {intl.device_delete_device}
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
                  onClick={deleteDevices}
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
          download
          key={downloadCsvLink}
        ></a>
      </ProtectedRoute>
    </>
  );
}
