"use client";

import React, { useState } from "react";
import Modal from "../Modal/modal";
import FileUpload from "./fileUpload";
import ProgressBar from "./plainProgressBar";
import IconLeftBtn from "../Button/iconLeftBtn";
import intl from "../../utils/locales/jp/jp.json";
import { sampleLinks } from "@/utils/constant";
import { Modal as AntModal } from "antd";
export default function ImportModal(props) {
  const [empFile, setEmpFile] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [empFileName, setEmpFileName] = useState(null);
  const [bulkFileName, setBulkFileName] = useState(null);
  const [error, setError] = useState("");
  const [progressLine, setProgressLine] = useState(0);
  /**
   * Handles the click event on the progress bar.
   * Resets the file name and performs any necessary actions.
   */
  const handleBarClick = () => {
    if (props.activeButton === "bulk") {
      setBulkFile(null);
      setBulkFileName(null);
      setProgressLine(0);
    }
    if (props.activeButton === "employee") {
      setEmpFile(null);
      setEmpFileName(null);
      setProgressLine(0);
    }
  };

  /**
   * Handles the file upload event.
   * Sets the uploaded file in the state and updates the file name.
   * @param {object} file - The uploaded file.
   */
  const handleFileUpload = (file) => {
    // Perform operations with the file in the parent component
    //validate file here
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (!file) {
      setError("ファイルを選択してください。"); // Japanese: "Please select a file."
    } else if (!file.type.includes("csv")) {
      setError("csvファイルを選択してください。"); // Japanese: "Please select a PDF file."
    } else if (file.size > maxSizeInBytes) {
      setError("ファイルサイズが5MBの制限を超えています。"); // Japanese: "File size exceeds the maximum allowed limit of 5MB."
    } else {
      setError(null);
      if (props.activeButton === "bulk") {
        setBulkFile(file);
        setBulkFileName(file.name);
        setProgressLine(100);
      }
      if (props.activeButton === "employee") {
        setEmpFile(file);
        setEmpFileName(file.name);
        setProgressLine(100);
      }
    }
  };

  const modelFooter = () => {
    return (
      <IconLeftBtn
        text={intl.company_list_company_import}
        textColor={"text-white font-semibold text-[16px] mb-[32px]"}
        py={"py-2.5"}
        px={"w-[100%] md:w-[85%]"}
        bgColor={"bg-customBlue"}
        textBold={true}
        icon={() => {
          return null;
        }}
        onClick={(event) => {
          if (empFile != null || bulkFile != null) {
            let { modelToggle, onCloseHandler, onClickImport } = props;
            onCloseHandler(() => !modelToggle);
            onClickImport(
              props.activeButton === "employee" ? empFile : bulkFile
            );
          } else {
            handleFileUpload();
          }
        }}
      />
    );
  };

  const handleButtonClick = (buttonName) => {
    if (buttonName === "employee" || buttonName === "bulk") {
      props.setActiveButton(buttonName);
      if (empFile && buttonName === "employee") {
        setProgressLine(100);
      } else if (bulkFile && buttonName === "bulk") {
        setProgressLine(100);
      } else {
        setProgressLine(0);
      }
    }
  };

  // Button styles
  const buttonStyles = {
    width: "132px",
    height: "30px",
    flexShrink: 0,
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    outline: "none",
  };

  // Active button styles
  const activeButtonStyles = {
    ...buttonStyles,
    borderRadius: "24px",
    background: "#19388B",
    color: "#FFFFFF",
  };

  // Inactive button styles
  const inactiveButtonStyles = {
    ...buttonStyles,
    color: "#737373",
  };
  return (
    <>
      <AntModal
              title={
                <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-center">
                  {intl.company_list_company_import}
                </div>
              }
              className="my-[70px]"
              open={true}
              width={385}
              onCancel={()=>{
                let { modelToggle, onCloseHandler } = props;
                onCloseHandler(() => !modelToggle);
              }}
              centered
              footer={(_) => (
                <>
                  <div className="flex justify-center">
                    {modelFooter()}
                    </div>
                </>
              )}
            >
          <div className="flex flex-col">
            <div className="mb-6 md:px-[32px]">
              <div
                style={{
                  width: "295px",
                  height: "42px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 8px",
                  borderRadius: "32px",
                  background: "#EBEBEB",
                  boxShadow: "0px 0px 7px 0px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Button 1 */}
                <button
                  style={
                    props.activeButton === "employee"
                      ? activeButtonStyles
                      : inactiveButtonStyles
                  }
                  onClick={() => handleButtonClick("employee")}
                >
                  {"ユーザーインポート"}
                </button>

                {/* Button 2 */}
                <button
                  style={
                    props.activeButton === "bulk"
                      ? activeButtonStyles
                      : inactiveButtonStyles
                  }
                  onClick={() => handleButtonClick("bulk")}
                >
                  {"一括インポート"}
                </button>
              </div>
            </div>

            {props.activeButton == "bulk" && (
              <div className="flex flex-col mb-6 md:px-[32px] items-center">
                <div className="mb-[10px] ">
                  インポートタイプを選択してください
                </div>
                <div className="mb-[10px] flex ">
                  <input
                    type="radio"
                    name="action_value"
                    className="accent-[#19388B]"
                    id="settings"
                    value={"settings"}
                    checked={props.option == "settings"}
                    onChange={(evt) => {
                      props.setSelectedOption("settings");
                    }}
                  />
                  <label
                    htmlFor="settings"
                    className="ml-3 w-[80px] text-left dark:text-black"
                  >
                    設定
                  </label>
                  <div>
                    <a
                      download
                      href={sampleLinks().userImportSettings}
                      className="text-xs hover:text-blue-800"
                    >
                      サンプル.csv
                    </a>
                  </div>
                </div>
                <div className="mb-[10px] flex items-center">
                  <input
                    type="radio"
                    name="action_value"
                    className="accent-[#19388B]"
                    id="contact"
                    value={"contacts"}
                    checked={props.option == "contacts"}
                    onChange={(evt) => {
                      props.setSelectedOption("contacts");
                    }}
                  />
                  <label
                    htmlFor="contact"
                    className="ml-3 w-[80px] text-left dark:text-black"
                  >
                    連絡先
                  </label>
                  <div>
                    <a
                      download
                      href={sampleLinks().userImportContacts}
                      className="text-xs hover:text-blue-800"
                    >
                      サンプル.csv
                    </a>
                  </div>
                </div>
                <div className="mb-[10px] flex items-center">
                  <input
                    type="radio"
                    name="action_value"
                    className="accent-[#19388B]"
                    id="group"
                    value={"groups"}
                    checked={props.option == "groups"}
                    onChange={(evt) => {
                      props.setSelectedOption("groups");
                    }}
                  />
                  <label
                    htmlFor="group"
                    className="ml-3 w-[80px] text-left dark:text-black"
                  >
                    グループ
                  </label>
                  <div>
                    <a
                      download
                      href={sampleLinks().Groups}
                      className="text-xs hover:text-blue-800"
                    >
                      サンプル.csv
                    </a>
                  </div>
                </div>
              </div>
            )}
            {/* File upload component */}
            <div data-testid="file-upload" className="md:px-[32px]">
              <FileUpload
                onFileUpload={handleFileUpload}
                key={bulkFileName + empFileName}
              />
            </div>
            {error && (
              <div
                className="validation-font text-sm flex justify-center mt-2"
                style={{ color: "red" }}
              >
                {error}
              </div>
            )}

            {/* Progress bar component */}

            <div data-testid="progress-bar" className="mt-6 mb-3 md:px-[32px]">
              {props.activeButton == "employee" && (
                <div>
                  <a
                    download
                    href={sampleLinks().userImport}
                    className="text-xs hover:text-blue-800"
                  >
                    サンプル.csv
                  </a>
                </div>
              )}

              {(bulkFileName || empFileName) && progressLine > 0 && (
                <ProgressBar
                  fileName={
                    props.activeButton == "bulk" ? bulkFileName : empFileName
                  }
                  percentage={progressLine}
                  onClick={() => {
                    handleBarClick();
                  }}
                />
              )}
            </div>
          </div>
        </AntModal>
    </>
  );
}
