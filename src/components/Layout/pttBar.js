"use client";
import { BsTrash3 } from "react-icons/bs";
import useToggle from "@/utils/hooks/useToggle";
import intl from "../../utils/locales/jp/jp.json";
import ImportIcon from "../Icons/import";
import ExportIcon from "../Icons/exportIcon";
import { GearIcon } from "../Icons/gearIcon";
import { usePathname, useRouter } from "next/navigation";
import DeleteIcon from "../Icons/deleteIconPtt";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import PlusButton from "../Icons/plusButton";
import Transcribe from "../Icons/transcribe";
import Simul from "../Icons/simul";
import SOSBarIcon from "../Icons/sos";
import { importPopup, exportPopup } from "@/redux/features/pttBarSlice";
import { toast } from "react-toastify";
import { errorToastSettings } from "@/utils/constant";
export default function Pttbar({
  setShowModal,
  setShowImportModel,
  setExportModal,
  setDeleteModal,
  setActiveTab,
  setIsSidebarVisible,
  activeTab,
  pushNotification,
  setAddNewModalData,
  optionSettings,
  sosIconVisible,
  isRecordingSettings,
  organizationsData,
  selectedRows,
}) {
  const router = useRouter();
  const path = usePathname();
  const [on, toggle] = useToggle(false);
  const [isMobile, setIsMobile] = useState(false);
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const dispatch = useAppDispatch();
  const [plusButtonClick, setButtonClick] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Change the breakpoint as needed
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className=" flex w-full justify-between items-center bg-white rounded-lg py-2 px-4 overflow-x-auto">
      <div className="flex gap-x-2 items-center">
        <div>
          <div
            className="bg-customBlue px-2 lg:px-4 py-1 rounded-lg  hover:bg-[#5283B3]"
            onClick={() => {
              router.push("/user");
              setActiveTab(0);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="28"
              viewBox="0 0 19 31"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.76937 15.441L18.7332 27.4048L15.7376 30.4004L0.759766 15.4225L3.75531 12.427L3.75727 12.4289L15.5612 0.625L18.5733 3.6371L6.76937 15.441Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
        <div className="cursor-pointer text-header-blue text-sm  bg-header-blue hover:bg-link bg-opacity-10 my-auto px-2 lg:px-4 py-2 rounded-lg">
          <span className="hidden lg:block" onClick={pushNotification}>
            {intl.layout_pttBar_push_settings_to_terminal_ppt}
          </span>
          <span className="text-sm lg:hidden" onClick={pushNotification}>
            PTT
          </span>
        </div>
      </div>
      <div className="text-header-blue text-sm lg:text-[24px]">
        {Employee.radioNumber || ""}
      </div>
      <div className="flex gap-2">
        {/* transcribe */}

        {organizationsData?.isTranscribe &&
          isRecordingSettings &&
          optionSettings?.isTranscribe && (
            <div className="flex flex-col items-center justify-center">
              <div className=" p-2 lg:p-0 lg:border-none">
                <Transcribe isMobile={isMobile} />
              </div>
              <div
                className="hidden lg:block"
                style={{
                  fontSize: "12px",
                  color: "#19388B",
                  fontWeight: "500",
                }}
              >
                {"文字おこし"}
              </div>
            </div>
          )}
        {/* sim */}
        {organizationsData?.isTranslate &&
          isRecordingSettings &&
          optionSettings?.simultaneousInterpretation && (
            <div className="flex flex-col items-center justify-center">
              <div className=" p-2 lg:p-0 lg:border-none">
                <Simul isMobile={isMobile} />
              </div>
              <div
                className="hidden lg:block"
                style={{
                  fontSize: "12px",
                  color: "#19388B",
                  fontWeight: "500",
                }}
              >
                {"同時通訳"}
              </div>
            </div>
          )}

        {/* sos */}
        {sosIconVisible && (
          <div className="flex flex-col justify-center items-center">
            <div className="p-2 lg:p-0 lg:border-none">
              <SOSBarIcon isMobile={isMobile} />
            </div>
            <div
              className="hidden lg:block"
              style={{ fontSize: "12px", color: "#19388B", fontWeight: "500" }}
            >
              {"SOS位置情報"}
            </div>
          </div>
        )}
        {/* - */}
        <div
          className="flex flex-col  items-center justify-center cursor-pointer text-customBlue hover:text-link"
          onClick={() => {
            activeTab == "0"
              ? dispatch(importPopup(true))
              : setShowImportModel(() => true);
          }}
        >
          <div className="md:pl-[10px]">
            <span className="cursor-pointer flex lg:gap-2 items-center  px-1 py-2 lg:p-0 lg:border-none">
              {activeTab == "0" && (
                <button
                  className="flex lg:gap-2 items-center  px-1 py-2 lg:p-0 lg:border-none"
                  onClick={() => {
                    // trigger settings import
                    // dispatch(importPopup(true));
                  }}
                >
                  <ImportIcon isMobile={isMobile} />
                </button>
              )}
              {activeTab != "0" && (
                <button
                  onClick={() => {
                    // setShowImportModel(() => true);
                  }}
                >
                  <ImportIcon isMobile={isMobile} />
                </button>
              )}
            </span>
          </div>
          <div
            className="hidden lg:block"
            style={{ fontSize: "12px", fontWeight: "500" }}
          >
            {intl.company_list_company_import}
          </div>
        </div>
        <div
          className="flex flex-col justify-center  items-center cursor-pointer text-customBlue hover:text-link"
          onClick={() => {
            if (activeTab != 0) {
              if (selectedRows <= 0) {
                let msg =
                  activeTab == 1
                    ? "グループを選択してください"
                    : "連絡先を選択してください";
                toast.dismiss();
                toast(msg, errorToastSettings);
                return;
              }
              setExportModal(() => true);
            } else {
              // trigger settings export
              dispatch(exportPopup(true));
            }
          }}
        >
          <div className="cursor-pointer  p-2 lg:p-0 lg:border-none">
            <ExportIcon isMobile={isMobile} />
          </div>
          <div
            className="hidden lg:block"
            style={{ fontSize: "12px", fontWeight: "500" }}
          >
            {intl.company_list_company_export_title}
          </div>
        </div>
        {activeTab != "0" && (
          <div
            className="flex flex-col  items-center justify-center cursor-pointer text-customBlue hover:text-link"
            onClick={() => {
              setAddNewModalData(true);
            }}
          >
            <div className="cursor-pointer p-2 lg:p-0 lg:border-none">
              <PlusButton isMobile={isMobile} />
            </div>
            <div
              className="hidden lg:block"
              style={{ fontSize: "12px", fontWeight: "500" }}
            >
              {activeTab == "1" ? intl.add_group : intl.add_contact}
            </div>
          </div>
        )}
        {activeTab != "0" && (
          <div
            className="flex flex-col  items-center justify-center cursor-pointer text-customBlue hover:text-link"
            onClick={() => {
              if (selectedRows <= 0) {
                let msg =
                  activeTab == 1
                    ? "グループを選択してください"
                    : "連絡先を選択してください";
                toast.dismiss();
                toast(msg, errorToastSettings);
                return;
              }
              setDeleteModal(() => true);
            }}
          >
            <div className="lg:p-0 lg:border-none cursor-pointer">
              <span>
                <DeleteIcon isMobile={isMobile} />
              </span>
            </div>
            <div
              className="hidden lg:block dark:text-black"
              style={{ fontSize: "12px", fontWeight: "500" }}
            >
              {intl.help_settings_addition_delete}
            </div>
          </div>
        )}

        {activeTab == "0" && (
          <div
            className="flex flex-col  items-center justify-center cursor-pointer text-customBlue hover:text-link"
            onClick={() => {
              setActiveTab(0);
              setIsSidebarVisible(false);
              router.push("/user/history-settings");
            }}
          >
            <div
              className="cursor-pointer p-2 lg:p-0 lg:border-none"
              onClick={() => {
                router.push("/user/history-settings");
              }}
            >
              <GearIcon isMobile={isMobile} />
            </div>
            <div
              className="hidden lg:block cursor-pointer "
              style={{ fontSize: "12px", fontWeight: "500" }}
            >
              設定履歴
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
