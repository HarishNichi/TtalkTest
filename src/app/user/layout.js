/* eslint-disable no-console */
"use client";

import { useState, useEffect, useRef } from "react";
import Pttbar from "../../components/Layout/pttBar";
import SidebarInside from "@/components/Layout/sidebarInside";
import TabComponent from "@/components/Tab/tab";
import { usePathname } from "next/navigation";
import SidebarInsideMobile from "@/components/Layout/sidebarInsideMobile";
import Group from "./group-information/group";
import Contact from "./contact-information/contact";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import TextPlain from "@/components/Input/textPlain";
import Modal from "@/components/Modal/modal";
import intl from "@/utils/locales/jp/jp.json";
import ImportModal from "@/components/ImportModal/importModal";
import DropdownMedium from "@/components/Input/dropdownMedium";
import {
  csvFileNameRegex,
  errorToastSettings,
  fileName,
  sampleLinks,
  successToastSettings,
} from "@/utils/constant";
import GetIconQRCode from "../../components/Icons/qrCode";
import api from "@/utils/api";
import { code } from "@/utils/constant";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { exportPopup, importPopup } from "@/redux/features/pttBarSlice";
import { fetchEmpData } from "@/validation/helperFunction";
import { getEmployee } from "@/redux/features/employee";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
Amplify.configure(gen.config);

export default function UserLayout({ children }) {
  const router = usePathname();
  const fileStyle = { fontWeight: "400", color: "#7B7B7B", fontSize: "12px" };
  const changeLink = { fontWeight: "700", fontSize: "12px" };

  const [showModal, setShowModal] = useState(false);
  const [tabResetProp, setTabResetProp] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [modelToggle, setModelToggle] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sectionName, setSectionName] = useState("");
  const [exportModal, setExportModal] = useState(false);
  const [exportModalContact, setExportModalContact] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [organizationsData, setOrganizationsData] = useState(null);
  const [isPtt, setIsPtt] = useState(false);
  const [addNewModalData, setAddNewModalData] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileValidationError, setFileValidationError] = useState(null);
  const [fileNameError, setFileNameError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  //
  const [csvUploadInitiated, setCsvUploadInitiated] = useState(null);
  const [subscriptionTrack, setSubscriptionTrack] = useState(null);

  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );
  const importIsOn = useAppSelector((state) => state.pttBarReducer.importIsOn);
  const exportIsOn = useAppSelector((state) => state.pttBarReducer.exportIsOn);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const CSVDownloadRef = useRef("");
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth || false;
  const UserData = useAppSelector((state) => state.userReducer.user);
  const dispatch = useAppDispatch();

  let Admin = false;
  let orgId;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgId = User.id;
  }

  const optionSettings =
    EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings;
  const isRecordingSettings =
    EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
      ?.isRecordingSettings;

  useEffect(() => {
    !isSidebarVisible && setIsSidebarVisible(true);
  }, [tabResetProp]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    downloadCsvLink && CSVDownloadRef.current.click();
  }, [downloadCsvLink]);

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
    const subscription = gen.subscribe(csvUploadInitiated, async ({ data }) => {
      let dataReceived = JSON.parse(data);
      if (!hasMap.has(dataReceived.token)) {
        hasMap.add(dataReceived.token)
        setLoading(true);

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
          setFile(null);
          setFileName("");
          dispatch(importPopup(false));
          let result = await fetchEmpData(Employee.id);
          result && dispatch(getEmployee(result));

          setModelToggle(false);
          if (ecount > 0) {
            try {
              setLoading(true);
              let csvLink = api.post("employees/import-settings", {
                failures: failedRowIndexes,
              });
              setDownloadCsvLink(csvLink.data.data.failureFile);
            } catch (err) {
              setLoading(false);
            } finally {
              toast(
                `${ecount} 行のデータインポートに失敗しました`,
                errorToastSettings
              );
              setLoading(false);
            }
          }
          if (ecount == 0 && scount > 0) {
            toast("正常にインポートされました。", successToastSettings);
          }
          subscription.unsubscribe();
          setLoading(false);
          setCsvUploadInitiated(() => null);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);


  function clickHere(v) {
    setIsSidebarVisible(v);
    setAddNewModalData(false);
  }

  const fetchData = async () => {
    setLoading(true);
    if (Admin && !EmployeeDetails?.organizationId || !Admin && orgId) {
      return;
    }
    try {
      const params = {
        params: {
          id: Admin ? EmployeeDetails?.organizationId : orgId,
        },
      };
      let { data } = await api.get("employees/get-organization", params);
      let org = data.data.Item;
      setLoading(false);
      let response = {
        isTranslate: org.accountDetail.organization.isTranslate,
        isTranscribe: org.accountDetail.organization.isTranscribe,
        sosLocation: org.accountDetail.organization.sosLocation,
      };
      setOrganizationsData(response);
    } catch (error) {
      setLoading(false);
    }
  };



  async function handlePttNotification() {
    toast.dismiss();
    setLoading(true);
    const payload = {
      pttNos: [Employee.radioNumber],
      data: {
        type: "config-emp",
        title: "config employee",
        body: {},
      },
    };
    try {
      await api.post("push/notify", payload);
      setLoading(false);
      toast(intl.notify_success, successToastSettings)
    } catch (error) {
      setLoading(false);
      toast(error.response?.data?.status.message || error.message, {
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

  if (router === "/user") return children;
  if (router === "/user/add") return children;

  function showModalHandler() {
    setShowModal(() => true);
  }

  function toggleModalHandler() {
    setModelToggle(() => true);
  }

  function qrCodeIcons() {
    return <GetIconQRCode />;
  }

  function getQrModalFooter() {
    return (
      <div className="flex gap-x-3">
        <div>
          <IconLeftBtn
            text="キャンセル"
            textColor={"text-white font-semibold text-sm w-full rounded-lg"}
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
            textColor={"text-white font-semibold text-sm w-full rounded-lg"}
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
    let data;
    toast.dismiss();
    if (!csvFileName) {
      setFileNameError("ファイル名が必要です。");
      return;
    }
    if (!csvFileNameRegex.test(csvFileName)) {
      setFileNameError("ファイル名を確認してください。");
      return;
    }
    setFileNameError("");
    data = {
      filename: csvFileName + ".csv",
      ids: [Employee.id],
    };

    try {
      setLoading(true);
      let result = await api.post("/employees/export-settings", data);
      setDownloadCsvLink(result.data.data.data.path);
      dispatch(exportPopup(false));
      setCsvFileName("");
      toast("エクスポートが成功しました", successToastSettings);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast("エクスポートに失敗しました", errorToastSettings);
    }
  }

  async function uploadSettingCsvFile(payload) {
    try {
      setLoading(true);
      let channel = new Date().getTime() + "settingsCsvEmp";
      setCsvUploadInitiated(() => channel);
      let result = await api.post("employees/import-settings", {
        file: payload.file,
        ids: [Employee.id],
        channel,
      });
    } catch (err) {
      setLoading(false);
      toast("インポートに失敗しました", errorToastSettings);
    }
  }

  return (
    <>
      {loading && <LoaderOverlay />}
      <div className="mb-2">
        <Pttbar
          setShowModal={async () => {
            await setShowModal(() => false);
            await showModalHandler();
          }}
          setShowImportModel={async () => {
            await setModelToggle(() => false);
            await toggleModalHandler();
          }}
          setExportModal={setExportModal}
          setDeleteModal={setDeleteModal}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          setIsSidebarVisible={setIsSidebarVisible}
          pushNotification={handlePttNotification}
          setAddNewModalData={setAddNewModalData}
          optionSettings={optionSettings}
          sosIconVisible={
            organizationsData?.sosLocation &&
            optionSettings?.isSOS &&
            optionSettings?.locationInformation
          }
          isRecordingSettings={isRecordingSettings}
          organizationsData={organizationsData}
          selectedRows={selectedRows}
        />
      </div>
      <div className="w-full mb-2">
        <TabComponent
          tabReset={clickHere}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
      </div>
      <div className="flex gap-x-2 flex-1 h-full">
        {activeTab === 0 && (
          <div className="grid lg:grid-cols-4 lg:gap-2 w-full">
            <div className="hidden lg:block lg:col-span-1">
              <SidebarInside />
            </div>
            {isSidebarVisible && (
              <div
                className="w-full block lg:hidden"
                style={{ minWidth: "250px" }}
              >
                <SidebarInsideMobile
                  setIsSidebarVisible={setIsSidebarVisible}
                />
              </div>
            )}
            {/* Use conditional rendering here */}
            {isSidebarVisible ? (
              <div className="hidden lg:block  lg:col-span-3 border bg-white border-gray-200 rounded-lg shadow px-4 max-h-max py-2 lg:mt-0 ml-[0px]">
                {children}
              </div>
            ) : (
              <div className=" border lg:block  lg:col-span-3 bg-white border-gray-200 rounded-lg shadow px-4 max-h-max py-2 lg:mt-0 ml-[0px]">
                {children}
              </div>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <>
            <div className="block w-full border pr-0 pl-1 max-h-max py-1 mt-2 lg:mt-0">
              <Group
                addNewModalData={addNewModalData}
                setAddNewModalData={setAddNewModalData}
                deleteModalData={deleteModal}
                setDeleteModalData={setDeleteModal}
                setExportModal={setExportModal}
                exportModal={exportModal}
                importModal={modelToggle}
                setImportModal={setModelToggle}
                setSelectedRows={setSelectedRows}
                selectedRows={selectedRows}
              />
            </div>
          </>
        )}
        {activeTab === 2 && (
          <>
            <div className="block w-full border pr-0 pl-1 max-h-max md:mt-0">
              <Contact
                addNewModalData={addNewModalData}
                setAddNewModalData={setAddNewModalData}
                deleteModalData={deleteModal}
                setDeleteModalData={setDeleteModal}
                setExportModal={setExportModal}
                exportModal={exportModal}
                importModal={modelToggle}
                setImportModal={setModelToggle}
                setSelectedRows={setSelectedRows}
                selectedRows={selectedRows}
              />
            </div>
          </>
        )}
        {exportIsOn && (
          <Modal
            height="500px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={intl.company_list_company_export_title}
            onCloseHandler={() => {
              dispatch(exportPopup(false));
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
        {importIsOn && (
          <>
            <ImportModal
              modelToggle={importIsOn}
              file={file}
              setFile={setFile}
              fileName={fileName}
              setFileName={setFileName}
              operation="update"
              fileValidationError={fileValidationError}
              setFileValidationError={setFileValidationError}
              uploadCsvFile={(payload) => uploadSettingCsvFile(payload)}
              onCloseHandler={() => dispatch(importPopup(false))}
              sampleLink={sampleLinks().settingsImport}
            />
          </>
        )}

        {showModal && (
          <Modal
            height="412px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={intl.user_layout_import_settings}
            modalFooter={() => {
              return (
                <IconLeftBtn
                  text={intl.company_list_company_import}
                  textColor={"text-white font-semibold text-[16px] w-full"}
                  py={"py-3"}
                  px={"w-[350px] 1sm:w-[85%] 2sm:w-[85%]"}
                  bgColor={"bg-customBlue"}
                  textBold={true}
                  icon={() => {
                    return "";
                  }}
                  onClick={(event) => {
                    setShowModal(() => false);
                  }}
                />
              );
            }}
          >
            <div className="flex flex-col">
              <div className="flex flex-col mt-[40px] mb-[40px] px-[5%]">
                <TextPlain
                  type={"text"}
                  for={"sectionName"}
                  placeholder={""}
                  borderRound={"rounded-xl"}
                  padding={"p-[10px]"}
                  focus={
                    "focus:outline-none focus:ring-2  focus:ring-customBlue "
                  }
                  border={"border border-gray-300"}
                  bg={"bg-input-color "}
                  additionalClass={"block w-full pl-5 text-base pr-[30px]"}
                  label={intl.user_layout_enter_ptt_number}
                  labelColor={"#7B7B7B"}
                  id={"sectionName"}
                  value={"000*000*0004"}
                  onchange={setSectionName}
                />
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
      </div>
      <a
        id={"linkCsv"}
        ref={CSVDownloadRef}
        href={downloadCsvLink}
        download
        key={downloadCsvLink}
      ></a>
      {isPtt && <ToastContainer />}
    </>
  );
}
