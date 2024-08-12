import React, { useState, useEffect } from "react";
import DynamicLabel from "@/components/Label/dynamicLabel";
import HelpSettingPdf from "@/components/Icons/helpSettingPdf";
import ServiceDelete from "@/components/Icons/serviceDelete";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import intl from "../../utils/locales/jp/jp.json";
import IconBtn from "../Button/iconBtn";
import DeleteIcon from "../Icons/deleteIcon";

const FileUploadCard = ({
  handleUploadButtonClick,
  CardHeight,
  HeaderTitle,
  isAdd,
  setIsAdd,
  setActiveButton,
  fileName,
  setFileName,
  setFile,
  file,
  setSubSectionDetails,
  setErrors,
  sectionName,
  setTouched, handleAddButton
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(fileName);
  const uploadButtonStyle = {
    borderRadius: "9px",
    border: "2px solid #19388B",

    textAlign: "center",
    fontSize: "17px",
    fontWeight: "600",
  };

  // Update selectedFileName when fileName changes
  useEffect(() => {
    setSelectedFileName(fileName);
  }, [fileName]);

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

  const handleFileSelect = (event) => {
    const files = event.target.files[0];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB in bytes

    if (!files) {
      setError("ファイルを選択してください。"); // Japanese: "Please select a file."
    } else if (!files.type.includes("pdf")) {
      setError("PDFファイルを選択してください。"); // Japanese: "Please select a PDF file."
    } else if (files.size > maxSizeInBytes) {
      setError("ファイルサイズが5MBの制限を超えています。"); // Japanese: "File size exceeds the maximum allowed limit of 5MB."
    } else {
      setError(null);
      setSelectedFileName(files.name);
      setFileName(files.name);
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileData = event.target.result;
        const blob = new Blob([fileData], { type: files.type });
        const readerBase64 = new FileReader();
        readerBase64.onload = function () {
          const base64Data = readerBase64.result;
          // Remove the data type prefix
          const base64DataExtract = base64Data.replace(
            /^data:application\/pdf;base64,/,
            ""
          );
          setFile(base64DataExtract);
          setIsAdd(isAdd || false);
          setActiveButton("file");
        };

        readerBase64.readAsDataURL(blob);
      };

      reader.onerror = function (event) {
        setError("ファイルの読み込み中にエラーが発生しました。"); // Japanese: "Error reading the file."
      };

      reader.readAsArrayBuffer(files);
    }
  };

  const baseCardStyle = {
    borderRadius: "9px",
    background: "#FFF",
    boxShadow: "0px 0px 15px 0px rgba(0, 0, 0, 0.10)",
  };

  const manualCard = isMobile
    ? { ...baseCardStyle, padding: "10px", maxWidth: "100%" }
    : { ...baseCardStyle, padding: "10px" };

  const fileCardStyle = {
    width: "100%",
    height: "86px",
    borderRadius: "9px",
    background: "rgba(159, 159, 159, 0.17)",
  };

  const requiredColor = {
    color: "#ED2E2E",
  };
  function deleteIcon() {
    return <DeleteIcon />;
  }

  return (
    <div
      style={manualCard}
      className={`flex flex-col h-${CardHeight}  md:h-full`}
    >
      <div className="flex items-center justify-start mt-3">
        <div className="flex w-full md:w-1/2">
          <DynamicLabel
            text={HeaderTitle}
            alignment="text-center"
            fontSize="text-base"
            fontWeight="font-medium"
            textColor="#7B7B7B"
            disabled={false}
          />
          <span
            className="text-[16px] font-medium ml-[3px]"
            style={requiredColor}
          >
            *
          </span>
        </div>
        <div className="flex justify-end w-full md:w-1/2">
          <IconBtn
            text={intl.help_settings_addition_btn}
            textColor={"text-customBlue"}
            textBold={true}
            icon={() => deleteIcon()}
            borderColor={"border-customBlue"}
            onClick={() => {
              setIsAdd(true);
              setSelectedFileName("");
              setFile(null);
              setFileName("");
              setSubSectionDetails((prevState) => {
                if (Object.prototype.hasOwnProperty.call(prevState, "file")) {
                  return {
                    ...prevState,
                    file: "",
                  };
                }
                return prevState;
              });
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-center flex-grow lg:px-[10px] py-[20px]">
        {((!isAdd && selectedFileName) || (isAdd && selectedFileName)) && (
          <div style={fileCardStyle} className="flex items-center">
            <div className="ml-[20px]">
              <HelpSettingPdf />
            </div>
            <div className="flex flex-col flex-grow w-full ml-[19px] truncate">
              <DynamicLabel
                text={selectedFileName}
                alignment="text-center"
                fontSize="text-base"
                fontWeight="font-normal"
                textColor="#19388B"
                disabled={false}
              />
            </div>
            <div
              className="mr-[20px] cursor-pointer"
              onClick={() => {
                setIsAdd(true);
                setSelectedFileName("");
                setFile(null);
                setFileName("");
                setError("");
                setSubSectionDetails((prevState) => {
                  if (Object.prototype.hasOwnProperty.call(prevState, "file")) {
                    return {
                      ...prevState,
                      file: "",
                    };
                  }
                  return prevState;
                });
              }}
            >
              <ServiceDelete />
            </div>
          </div>
        )}
        {((isAdd && !selectedFileName) || (!isAdd && !selectedFileName)) && (
          <div className="w-full flex:col items-center justify-center py-[20px]">
            <label
              htmlFor="fileInput"
              className="cursor-pointer w-full flex items-center justify-center"
            >
              {/* Styled upload button */}
              <button
                className="py-[8px] w-2/5 md:w-2/5 sm:w-full  bg-[#F2FAFF]
                text-[#19388B] hover:bg-[#CCE6FF]"
                style={uploadButtonStyle}
                onClick={() => {
                  // When the styled button is clicked, trigger the click event on the hidden file input
                  document.getElementById("fileInput").click();
                }}
              >
                {intl.helpersettings_fileuploadcard_upload}
              </button>
              {/* Hidden file input */}
              <input
                type="file"
                id="fileInput"
                accept=".pdf" // Specify the accepted file types (optional)
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {error && (
              <div
                className="validation-font text-sm flex justify-center mt-2"
                style={{ color: "red" }}
              >
                {error}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end  lg:px-[10px] pb-2">
        <div className="flex justify-end">
          <div className="flex gap-x-2">
            <IconLeftBtn
              text={intl.help_settings_addition_modal_cancel}
              textColor="text-white font-normal text-base"
              py="py-[8px] px-[29px]"
              bgColor="bg-customBlue"
              textBold={true}
              rounded="rounded-lg"
              icon={() => null}
              onClick={() => handleAddButton()}
            />
            <IconLeftBtn
              text={intl.help_settings_addition_keep}
              textColor="text-white font-normal text-base"
              py="py-[8px] px-[55px]"
              bgColor="bg-customBlue"
              textBold={true}
              rounded="rounded-lg"
              icon={() => null}
              onClick={() => {
                if (!file && isAdd) {
                  setError("ファイルを選択してください。");
                  if (!sectionName) {
                    setTouched((prevTouched) => {
                      if (
                        !Object.prototype.hasOwnProperty.call(
                          prevTouched,
                          "sectionName"
                        )
                      ) {
                        return {
                          ...prevTouched,
                          sectionName: true,
                        };
                      }
                      return prevTouched; // If 'sectionName' key exists, return unchanged state
                    });
                    setErrors((prevState) => {
                      if (
                        !Object.prototype.hasOwnProperty.call(
                          prevState,
                          "sectionName"
                        )
                      ) {
                        return {
                          ...prevState,
                          sectionName: intl.validation_required,
                        };
                      }
                      return prevState; // If 'sectionName' key exists, return unchanged state
                    });
                  }
                } else {
                  handleUploadButtonClick(file);
                }
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FileUploadCard;
