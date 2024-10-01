/* eslint-disable no-console */
"use client";
import React, { useEffect, useRef } from "react";
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
import GetIconQRCode from "../../../components/Icons/qrCode";
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
Amplify.configure(gen.config);

export default function Contact({
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
  const [deleteModal, setDeleteModal] = React.useState(deleteModalData);
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
  }, []);

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
      toast("エクスポートに失敗しました", errorToastSettings);
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
      toast("インポートに失敗しました", errorToastSettings);
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
              toast("正常にインポートされました。", successToastSettings);
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
        <div className="flex justify-between mb-2 xl:mb-2 ">
          <div className="flex items-center">
            <DynamicLabel
              text={intl.user_contact_info_title}
              alignment="text-center"
              fontSize="text-[22px]"
              fontWeight="font-medium"
              textColor="#000000"
              disabled={false}
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
              disabled={contactTableData?.length == 0}
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

        {exportModal && (
          // <Modal
          //   height="500px"
          //   fontSize="text-xl"
          //   fontWeight="font-semibold"
          //   textColor="#19388B"
          //   text={intl.company_list_company_export_title}
          //   onCloseHandler={() => {
          //     setExportModal(false);
          //     setCsvFileName("");
          //     setFileNameError("");
          //   }}
          //   contentPaddingTop="pt-1"
          //   modalFooter={() => {
          //     return (
          //       <IconLeftBtn
          //         text={"エクスポート"}
          //         textColor={"text-white font-semibold text-[16px] w-full"}
          //         py={"py-[11px]"}
          //         px={"w-[84%]"}
          //         bgColor={"bg-customBlue"}
          //         textBold={true}
          //         icon={() => {
          //           return null;
          //         }}
          //         onClick={() => {
          //           exportCSVFile();
          //         }}
          //       />
          //     );
          //   }}
          // >
          //   <div className="flex flex-col">
          //     <div className="flex-grow py-[20px] mb-4">
          //       <form className="grid grid-cols-1 gap-y-3">
          //         <div className="flex flex-col">
          //           <TextPlain
          //             type="text"
          //             for={"id"}
          //             placeholder={"ファイル名"}
          //             borderRound="rounded-xl"
          //             padding="p-[10px]"
          //             focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
          //             border="border border-[#e7e7e9]"
          //             bg="bg-white"
          //             additionalClass="block w-full pl-5 text-base pr-[30px]"
          //             label={"ファイル名"}
          //             labelColor="#7B7B7B"
          //             id={"id"}
          //             isRequired={true}
          //             labelClass={"float-left"}
          //             value={csvFileName}
          //             onChange={(event) => {
          //               setCsvFileName(event.target.value);
          //             }}
          //           />
          //           {fileNameError && (
          //             <div className="validation-font text-sm text-[red] text-left">
          //               {fileNameError}
          //             </div>
          //           )}
          //         </div>
          //       </form>
          //     </div>
          //   </div>
          // </Modal>
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
            centered={true}
            className="my-[70px]"
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
                      text="キャンセル"
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
                      text="ダウンロード"
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
            onCloseHandler={setImportModal}
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
          // <Modal
          //   height="412px"
          //   fontSize="text-xl"
          //   fontWeight="font-semibold"
          //   textColor="#19388B"
          //   text={intl.help_settings_addition_delete}
          //   onCloseHandler={() => {
          //     setDeleteModal(false);
          //     setDeleteModalData(false);
          //   }}
          //   modalFooter={() => {
          //     return (
          //       <div className="grid grid-cols-2 gap-2 place-content-center">
          //         <div>
          //           <IconLeftBtn
          //             text={intl.help_settings_addition_modal_cancel}
          //             textColor={"text-white font-semibold text-sm w-full"}
          //             py={"py-[11px]"}
          //             px={"px-6"}
          //             bgColor={"bg-customBlue"}
          //             textBold={true}
          //             icon={() => {
          //               return null;
          //             }}
          //             onClick={() => {
          //               setDeleteModal(() => false);
          //               setDeleteModalData(false);
          //             }}
          //           />
          //         </div>
          //         <div>
          //           <IconLeftBtn
          //             text={intl.help_settings_addition_delete}
          //             textColor={"text-white font-semibold text-sm w-full"}
          //             py={"py-[11px]"}
          //             px={"px-6"}
          //             bgColor={"bg-customBlue"}
          //             textBold={true}
          //             icon={() => {
          //               return null;
          //             }}
          //             onClick={() => {
          //               deleteContact(selectedRows);
          //             }}
          //           />
          //         </div>
          //       </div>
          //     );
          //   }}
          // >
          //   <div className="flex flex-col px-[4%]">
          //     <div className="flex-grow py-[90px] pt-[60px] dark:text-black">
          //       {intl.delete_contact}
          //     </div>
          //   </div>
          // </Modal>
          <AntModal
            title={
              <div className="px-[40px] pt-[25px] font-semibold text-xl mb-[2vw] text-customBlue text-center">
                {intl.help_settings_addition_delete}
              </div>
            }
            width={500}
            open={true}
            onCancel={() => {
              setDeleteModal(false);
              setDeleteModalData(false);
            }}
            footer={() => {
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
                        deleteContact(selectedRows);
                      }}
                    />
                  </div>
                </div>
              );
            }}
            centered
            className="my-[70px]"
          >
            <div className="flex flex-col px-[4%]">
              <div className="flex-grow py-[90px] pt-[60px] dark:text-black">
                {intl.delete_contact}
              </div>
            </div>
          </AntModal>
        )}
        {(addNewModal || detailsModal || editModal) && (
          <Modal
            height="480px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={
              detailsModal
                ? intl.contact_details
                : editModal
                ? intl.edit_contacts
                : intl.add_new_contact
            }
            onCloseHandler={onClose}
            displayEditIcon={detailsModal}
            handelEdit={async () => {
              await setDetailsModal(() => false);
              await setAddNewModal(() => false);
              setAddNewModalData(false);
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
                      if (addNewModal) {
                        createContact();
                      } else {
                        updateContact();
                      }
                    }}
                  />
                )
              );
            }}
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[9px]">
                <form className="grid grid-cols-1 gap-y-2">
                  <div className="flex flex-col">
                    <TextPlain
                      type="text"
                      for={"contactName"}
                      placeholder={"連絡先名"}
                      borderRound="rounded-xl"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                      border="border border-[#e7e7e9]"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
                      label={"連絡先名"}
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
                      placeholder={"ふりがな"}
                      borderRound="rounded-xl"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                      border="border border-[#e7e7e9]"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
                      label={"ふりがな"}
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
                      placeholder={"無線番号"}
                      borderRound="rounded-xl"
                      padding="p-[10px]"
                      focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                      border="border border-[#e7e7e9]"
                      bg="bg-white"
                      additionalClass="block w-full pl-5 text-base pr-[30px]"
                      label={"無線番号"}
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
                        className="pl-1 validation-font flex"
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
          </Modal>
        )}
      </div>
      <ToastContainer />
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
