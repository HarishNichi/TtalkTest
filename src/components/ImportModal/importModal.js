"use client";

import React, { useState } from "react";
import Modal from "../Modal/modal";
import FileUpload from "./fileUpload";
import ProgressBar from "./plainProgressBar";
import IconLeftBtn from "../Button/iconLeftBtn";
import intl from "../../utils/locales/jp/jp.json";
import { Modal as AntModal } from "antd";
export default function ImportModal({
  modelToggle,
  file,
  setFile,
  fileName,
  setFileName,
  uploadCsvFile,
  onCloseHandler,
  operation = "create",
  fileValidationError,
  setFileValidationError,
  sampleLink,
  channelName = "",
}) {
  const [progressLine, setProgressLine] = useState(0);
  /**
   * Handles the click event on the progress bar.
   * Resets the file name and performs any necessary actions.
   */
  const handleBarClick = () => {
    setFileName(null);
    setProgressLine(0);
  };

  /**
   * Handles the file upload event.
   * Sets the uploaded file in the state and updates the file name.
   * @param {object} file - The uploaded file.
   */
  const handleFileUpload = (file) => {
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (!file) {
      setFileValidationError(intl.file_upload_select_file); // Japanese: "Please select a file."
      return;
    } else if (!file.type.includes("csv")) {
      setFileValidationError(intl.select_csv_file);
      return;
    } else if (file.size > maxSizeInBytes) {
      setFileValidationError(intl.exceeds_limit);
      return;
    } else {
      setFileValidationError(null);
      // Perform operations with the file in the parent component
      setFileName(file.name);
      convertBase64(file).then((res) => {
        res = res.split(",")[1];
        setFile(res);
        setProgressLine(100);
      });
    }
  };

  const convertBase64 = function (file) {
    /* eslint-disable no-undef*/
    return new Promise((resolve) => {
      var reader = new FileReader();
      // Read file content on file loaded event
      reader.onload = function (event) {
        resolve(event.target.result);
      };

      // Convert data to base64
      reader.readAsDataURL(file);
    });
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
          if (!file) {
            setFileValidationError(intl.file_upload_select_file); // Japanese: "Please select a file."
            return;
          }
          !fileValidationError &&
            uploadCsvFile({
              file: file,
              operation: operation,
              channel: channelName,
            });
        }}
      />
    );
  };

  return (
    <AntModal
      title={
        <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-center">
          {intl.company_list_company_import}
        </div>
      }
      className="my-[70px]"
      open={true}
      width={385}
      onCancel={() => {
        onCloseHandler();
      }}
      centered
      footer={(_) => (
        <>
          <div className="flex justify-center">{modelFooter()}</div>
        </>
      )}
    >
      <div className="flex flex-col">
        {/* File upload component */}
        <div data-testid="file-upload" className="mb-6 md:px-[32px]">
          <div className="flex justify-content-left font-normal text-base mb-2">
            ファイルを選択
          </div>
          <FileUpload onFileUpload={handleFileUpload} key={fileName} />

          <div className="validation-font text-sm flex justify-center mt-2 text-[red]">
            {fileValidationError ?? fileValidationError}
          </div>
        </div>

        {/* Progress bar component */}
        <div data-testid="progress-bar" className="mb-3 md:px-[32px]">
          {fileName && progressLine > 0 && (
            <ProgressBar
              key={progressLine}
              fileName={fileName}
              percentage={progressLine}
              onClick={() => {
                handleBarClick();
              }}
            />
          )}
        </div>
      </div>
    </AntModal>
  );
}
