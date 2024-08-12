"use client";

import React from "react";
import PlainBar from "../ProgressBar/plainBar";
import DynamicLabel from "../Label/dynamicLabel";
import FileIcon from "../Icons/fileIcon";
import CloseIcon from "../Icons/closeIcon";

export default function ProgressBar({ fileName, percentage, onClick }) {
  const barStyles = {
    background: "#E4E4E4",
    borderRadius: "10px",
    height: "55px",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div style={barStyles}>
      <div data-testid="file-icon">
        <FileIcon />
      </div>
      <div className="w-full flex flex-col">
        <div className="-mt-1.5" data-testid="file-name">
          <div className="w-[150px] text-center text-sm color-[#19388B] text-ellipsis overflow-hidden">
            {fileName && String(fileName).substring(0, 30) || ""}
          </div>
        </div>
        <div className="mt-1">
          <PlainBar
            percentage={percentage}
            height="5px"
            data-testid="plain-bar"
          />
        </div>
      </div>
      <div data-testid="close-icon" className="w-12">
        {fileName && percentage > 0 && (
          <CloseIcon color="#39a1ea6b" margin={"mx-3.5"} onClick={onClick} />
        )}
      </div>
    </div>
  );
}
