"use client";

import React, { useState, useRef } from "react";
import UploadIcon from "../Icons/uploadIcon";
import DynamicLabel from "../Label/dynamicLabel";
import intl from "../../utils/locales/jp/jp.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const divStyle = {
    height: "188px",
    background: "#F9F9FA",
    border: "",
    borderRadius: "8px",
  };

  const handleFileUpload = (event) => {
    try {
      const uploadedFile = event.target.files[0];
      setFile(uploadedFile);
      onFileUpload(uploadedFile);
    } catch (error) {
      !file && notify();
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    try {
      event.preventDefault();
      const droppedFile = event.dataTransfer.files[0];
      setFile(droppedFile);
      onFileUpload(droppedFile);
    } catch (e) {
      !file && notify();
    }
  };

  const fileUploadBtn = {
    borderRadius: "5px",
    fontSize: "14px",
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const notify = () => {
    toast.error("何か問題が発生しました");
  };

  return (
    <div
      data-testid="droppedFile"
      style={divStyle}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <>
        <ToastContainer />
      </>
      <div className="flex flex-col items-center justify-center h-full">
        <UploadIcon />
        <span className="mb-1">
          <DynamicLabel
            text={intl.importmodal_fileupload_drag_drop_file}
            alignment="text-center"
            fontSize="text-[14px]"
            fontWeight="font-normal"
            textColor="#7B7B7B"
            disabled={false}
          />
        </span>
        <span className="mb-1">
          <DynamicLabel
            text={intl.importmodal_fileupload_or}
            alignment="text-center"
            fontSize="text-[14px]"
            fontWeight="font-normal"
            textColor="#7B7B7B"
            disabled={false}
          />
        </span>

        <label
          style={{ ...fileUploadBtn, border: "2px solid #5283B3" }} // Adding a blue border
          className="text-customBlue px-7 py-1.5 rounded cursor-pointer mt-2 bg-white hover:bg-[#E8F1FB]"
        >
          <button
            className="text-[14px] text-center font-semibold cursor-pointer text-customBlue"
            onClick={handleButtonClick}
          >
            {intl.importmodal_fileupload_browse}
          </button>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            ref={fileInputRef}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUpload;
