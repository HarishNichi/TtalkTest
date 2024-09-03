"use client";

import React, { useState } from "react";
import Modal from "../Modal/modal";
import FileUpload from "./fileUpload";
import ProgressBar from "./plainProgressBar";
import IconLeftBtn from "../Button/iconLeftBtn";
import intl from "../../utils/locales/jp/jp.json";
import { sampleLinks } from "@/utils/constant";
export default function ImportUserModal(props) {
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
      setEmpFile(null);
      setEmpFileName(null);
      setProgressLine(0);
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

        setEmpFile(file);
        setEmpFileName(file.name);
        setProgressLine(100);
    }
  };

  const modelFooter = () => {
    return (
      <IconLeftBtn
        text={intl.company_list_company_import}
        textColor={"text-white font-semibold text-[16px]"}
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
            onClickImport( empFile
            );
          } else {
            handleFileUpload();
          }
        }}
      />
    );
  };


  return (
    <>
      <div className="flex direction-column">
        <Modal
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text={intl.company_list_company_import}
          modalFooter={modelFooter}
        >
          <div className="flex flex-col">

            {/* Progress bar component */}

            <div data-testid="progress-bar" className="mt-6 mb-3 md:px-[32px]">
                <div>
                  <a
                    download
                    href={sampleLinks().userImport}
                    className="text-xs hover:text-blue-800"
                  >
                    サンプル.csv
                  </a>
                </div>

              {(bulkFileName || empFileName) && progressLine > 0 && (
                <ProgressBar
                  fileName={empFileName
                  }
                  percentage={progressLine}
                  onClick={() => {
                    handleBarClick();
                  }}
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
