/* eslint-disable no-console */
"use client";

import React, { useState, useEffect, useRef } from "react";
import intl from "@/utils/locales/jp/jp.json";
import DynamicLabel from "@/components/Label/dynamicLabel";
import IconOutlineBtn from "@/components/Button/iconOutlineBtn";
import AddIcon from "@/components/Icons/addIcon";
import DataTable from "@/components/DataTable/DataTable";
import { code, tableDefaultPageSizeOption, maxLimit, sampleLinks, successToastSettings, errorToastSettings } from "@/utils/constant";
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
import { DatePicker, Switch } from "antd";
import locale from "antd/es/date-picker/locale/en_US";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { PiWaveSineLight } from "react-icons/pi";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
import "dayjs/locale/ja.js";
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
        if (parent.parent.deviceIsOnRent == true && parent.parent.deviceIsOnRent !== false) {
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
      width: "70%",
      align: "left",sorter: (a, b) => a.machineName.localeCompare(b.machineName),
      sortDirections: ['ascend', 'descend','ascend'], 
    },
    {
      title: "期限指定",
      dataIndex: "isToggleOn",
      render: (text, record) => (
        <div style={{ marginLeft: "20%" }}>
          {text ? "あり" : "なし"}
        </div>
      ),
      width: "140px",
    },
    {
      title: "開始日",
      dataIndex: "startDate",
      render: (text, record) => {
        let startDate = record.isToggleOn ? text : ""
        return (
          <div>
            {startDate}
          </div>
        )
      },
      width: "140px",
      sorter: (a, b) => 
      !a.startDate - !b.startDate || a.startDate.localeCompare(b.startDate), 
      sortDirections: ['ascend', 'descend','ascend'], 
    },
    {
      title: "終了日",
      dataIndex: "endDate",
      render: (text, record) => {
        let endDate = record.isToggleOn ? text : ""
        return (
          <div>
            {endDate}
          </div>
        )
      },
      width: "140px",
      sorter: (a, b) => 
      !a.endDate - !b.endDate || a.endDate.localeCompare(b.endDate), 
      sortDirections: ['ascend', 'descend','ascend'], 
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
          <p className="flex">
            <span
              data-testid={`delete`}
              className="ml-[25px] cursor-pointer rounded-full px-3 py-2 bg-[#EDF2F5] hover:bg-[#DCE7F0]"
              onClick={() => {
                setError("");
                handelDelete(record);
              }}
              style={{
                pointerEvents: record.deleted ? "none" : "auto",
              }}
            >
              <SectionDeleteIcon />
            </span>
          </p>
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
  const [rentDateRange, setRentDateRange] = useState(['', ''])
  const [importModal, setImportModal] = React.useState(false);
  const [csvFileName, setCsvFileName] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState(null);
  const [fileValidationError, setFileValidationError] = React.useState(null);
  // const [fileNameError, setFileNameError] =  React.useState(null);
  // const [selectedRows, setSelectedRows] =  React.useState([]);
  const [csvUploadInitiated, setCsvUploadInitiated] = React.useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = React.useState(null);
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
      (record.startDate && record.endDate) && setDeviceIsOnRent(true);

      let x = record.startDate ? dayjs(record.startDate) : ''
      let y = record.endDate ? dayjs(record.endDate) : ''
      setRentDateRange([x, y])
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
            startDate: item.startDate ? dayjs(item.startDate).format('YYYY/MM/DD') : "",
            endDate: item.endDate ? dayjs(item.endDate).format('YYYY/MM/DD') : "",
            isToggleOn: item.startDate && item.endDate ? true : false,
            id: item.id,
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
        rentDateRange
      };
      setTouched({ ...touched, addSettings: true, deviceIsOnRent: true, rentDateRange: true });
      await validateHandler(schema, formValues, setErrors);
      setAddModal(true);
    }

    if (deviceIsOnRent) {
      setLoading(false);
      const formValues = {
        addSettings,
        deviceIsOnRent,
        rentDateRange
      };
      setTouched({ ...touched, addSettings: true, deviceIsOnRent: true, rentDateRange: true });
      await validateHandler(schema, formValues, setErrors);
    }
    errors?.editSettings && delete errors.editSettings;
    if (Object.keys(errors)?.length > 0) { return; }

    try {
      const payload = {
        name: name,
      };
      deviceIsOnRent && Object.assign(payload, {
        startDate: rentDateRange[0] ? dayjs(rentDateRange[0]).format('YYYY-MM-DD') : "",
        endDate: rentDateRange[1] ? dayjs(rentDateRange[1]).format('YYYY-MM-DD') : "",
      })
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
      setTouched({ ...touched, editSettings: true, deviceIsOnRent: true, rentDateRange: true });
      await validateHandler(schema, formValues, setErrors);
      setEditModal(true);
    }

    if (deviceIsOnRent) {
      setLoading(false);
      const formValues = {
        editSettings,
        deviceIsOnRent,
        rentDateRange
      };
      setTouched((prevTouched) => ({ ...prevTouched, editSettings: true, deviceIsOnRent: true, rentDateRange: true }));
      await validateHandler(schema, formValues, setErrors);
    }

    errors?.addSettings && delete errors.addSettings;
    if (errors && Object.keys(errors)?.length > 0) { return; }

    try {
      const payload = {
        id: record.id,
        name: name,
      };

      deviceIsOnRent && Object.assign(payload, {
        startDate: rentDateRange[0] ? dayjs(rentDateRange[0]).format('YYYY-MM-DD') : "",
        endDate: rentDateRange[1] ? dayjs(rentDateRange[1]).format('YYYY-MM-DD') : "",
      })

      const response = await api.put(`devices/update`, payload);
      if (response.data.status.code == code.OK) {
        setLoading(false);
        setEditModal(false);
        console.log('publish start')
        gen.publish("admin", JSON.stringify({
          ...payload,
          type: "device"
        }))
        console.log('publish end')
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

  const deleteDevice = async (record) => {
    toast.dismiss();
    setLoading(true);
    try {
      const config = {
        data: {
          id: record.id,
        },
      };
      if (record.deviceAttachedCount > 0) {
        setLoading(false);
        setDeleteModal(false);
        toast(intl.device_user_attach, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          type: "error",
        });
      } else {
        const response = await api.delete(`devices/delete`, config);
        if (response.data.status.code == code.OK) {
          setLoading(false);
          setDeleteModal(false);
          fetchData();
        }
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
    const formValues = { addSettings, editSettings, deviceIsOnRent, rentDateRange };
    validateHandler(schema, formValues, setErrors);
  }, [addSettings, editSettings, deviceIsOnRent, rentDateRange]);


  const onClose = () => {
    if (addModal) {
      setAddSettings("");
      setDeviceIsOnRent(false);
      setRentDateRange(['', ''])
      setAddModal(false);
      setErrors({});
      setTouched({});
    } else {
      setEditSettings("");
      setDeviceIsOnRent(false);
      setRentDateRange(['', '']);
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
    console.log('enter',csvUploadInitiated)
    toast.dismiss();
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];
    const subscription = gen.subscribe(csvUploadInitiated, ({ data }) => {
    console.log('enter subs', data)
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
            toast("正常にインポートされました。", successToastSettings);
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
      console.log('hti  b4', payload)

      await setCsvUploadInitiated(() => payload.channel);
      let result = await api.post("devices/import", {
        ...payload,
      });

      console.log('hti')
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
          <div className="flex  justify-between mb-2 xl:mb-2 ">
            <div className="flex items-center">
              <DynamicLabel
                text={intl.machine_list}
                alignment="text-center"
                fontSize="text-[22px]"
                fontWeight="font-medium"
                textColor="#000000"
                disabled={false}
              />
            </div>
            <div className="flex gap-x-2">
              <IconOutlineBtn
                text={intl.company_list_company_import}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[47px] md:px-[48.5px] px-[48.5px]"}
                icon={() => editIcon(false)}
                borderColor={"border-customBlue"}
                onClick={() => {
                  setImportModal(true);
                }} />
              <IconOutlineBtn
                text={intl.add_machine}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[47px] md:px-[48.5px] px-[48.5px]"}
                icon={() => editIcon(false)}
                borderColor={"border-customBlue"}
                onClick={() => {
                  setAddSettings("");
                  setDeviceIsOnRent(false);
                  setRentDateRange(['', ''])
                  setAddModal(true);
                }}
              />
            </div>
          </div>
          <div className="mb-[20px] relative" style={{ width: "100%" }}>
            <DataTable
              scrollVertical={tableHeight > 450 ? tableHeight : 450}
              columns={columns}
              dataSource={helpSettingsData}
              defaultPaeSizeOptions={tableDefaultPageSizeOption}
              defaultValue={1}
              page={page}
              setPage={setPage}
              current={current}
              setCurrent={setCurrent}
            />
          </div>
          <ToastContainer />
          {importModal && (
            <ImportModal
              modelToggle={importModal}
              onCloseHandler={setImportModal}
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
            <Modal
              height="412px"
              fontSize="text-xl"
              fontWeight="font-semibold"
              textColor="#19388B"
              text={addModal ? "端末の追加" : "端末の編集"}
              onCloseHandler={onClose}
              modalFooter={() => {
                return (
                  <IconLeftBtn
                    text={intl.help_settings_addition_keep}
                    textColor={"text-white font-semibold text-sm w-full"}
                    py={"py-3"}
                    px={"w-[320px]"}
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
                );
              }}
            >
              <div className="flex flex-col px-[4%]">
                <div className="flex flex-col mt-[20px] mb-[40px]">
                  <div className={"mb-4"}>
                    <TextPlain
                      isRequired={true}
                      type={"text"}
                      for={addModal ? "addSettings" : "editSettings"}
                      placeholder={"端末名"}
                      borderRound={"rounded-xl"}
                      padding={"p-[10px]"}
                      focus={
                        "focus:outline-none focus:ring-2  focus:ring-customBlue "
                      }
                      border={"border border-gray-300"}
                      bg={"bg-white"}
                      additionalClass={"block w-full pl-5 text-base pr-[30px]"}
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
                          className="mb-8 pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.editSettings}
                        </div>
                      )}
                    {addModal && errors?.addSettings && touched?.addSettings && (
                      <div
                        className="mb-8 pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.addSettings}
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="flex mb-1 text-[16px] font-medium  text-[#7b7b7b]">期限指定</label>
                    <div className="flex justify-start">
                      <Switch handleBg="#fff" value={deviceIsOnRent}
                        checked={deviceIsOnRent}
                        className="bg-gray-500" onChange={async () => {
                          await setDeviceIsOnRent((prv) => !prv)
                        }} />


                      {addModal && errors?.deviceIsOnRent && touched?.deviceIsOnRent && (
                        <div
                          className="mb-8 pl-1 validation-font flex"
                          style={{ color: "red" }}
                        >
                          {errors?.deviceIsOnRent}
                        </div>
                      )}
                    </div>
                  </div>
                  {deviceIsOnRent &&
                    (<RangePicker
                      className="w-full py-[0.44rem] rounded-lg"
                      id="deviceIsOnRent"
                      separator={<PiWaveSineLight />}
                      style={{
                        border: "1px solid #e5e7eb",
                      }}
                      onChange={(dateObj, dateString) => {
                        dateString[0] = dateString[0] ? dayjs(dateString[0]) : ''
                        dateString[1] = dateString[1] ? dayjs(dateString[1]) : ''
                        setRentDateRange(dateString)
                      }}
                      value={[rentDateRange[0], rentDateRange[1]]}
                      locale={locale}
                      allowEmpty={[true, true]}
                      format={"YYYY/MM/DD"}
                      placeholder={["開始日", "終了日"]}
                      disabledDate={(current) => {
                        let yesterday = new Date(Date.now() - 86400000).getTime(); // that is: 24 * 60 * 60 * 1000
                        return current.valueOf() < yesterday;
                      }}
                    />
                    )}

                  {addModal && errors?.rentDateRange && touched?.rentDateRange && (
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
            </Modal>
          )}
          {deleteModal && (
            <Modal
              height="412px"
              fontSize="text-xl"
              fontWeight="font-semibold"
              textColor="#19388B"
              text={"削除"}
              onCloseHandler={setDeleteModal}
              modalFooter={() => {
                return (
                  <div className=" flex justify-between">
                    <div>
                      <IconLeftBtn
                        text={intl.help_settings_addition_modal_cancel}
                        textColor={"text-white font-semibold text-sm w-full"}
                        py={"py-[11px]"}
                        px={"px-[10.5px] md:px-[17.5px]"}
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
                        textColor={
                          "text-white font-semibold text-sm w-full ml-2"
                        }
                        py={"py-[11px]"}
                        px={"px-[30.5px] md:px-[38.5px]"}
                        bgColor={"bg-customBlue"}
                        textBold={true}
                        icon={() => {
                          return null;
                        }}
                        onClick={() => {
                          deleteDevice(editRecord);
                        }}
                      />
                    </div>
                  </div>
                );
              }}
            >
              <div className="flex flex-col">
                <div className="flex-grow py-[90px] pt-[60px] dark:text-black">
                  {intl.device_delete_message}
                </div>
              </div>
            </Modal>
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
