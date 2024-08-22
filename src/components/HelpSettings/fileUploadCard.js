import React, { useState, useEffect,useRef,forwardRef,useImperativeHandle } from "react";
import DynamicLabel from "@/components/Label/dynamicLabel";
import HelpSettingPdf from "@/components/Icons/helpSettingPdf";
import ServiceDelete from "@/components/Icons/serviceDelete";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import intl from "../../utils/locales/jp/jp.json";
import IconBtn from "../Button/iconBtn";
import DeleteIcon from "../Icons/deleteIcon";
import UploadIcon from "../Icons/uploadIcon";
import { toast } from "react-toastify";

const FileUploadCard = forwardRef(({
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
},ref) => {
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(fileName);
  const [files, setFiles] = useState(null);
  const fileInputRef = useRef(null);


  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    
 
    try {
      handleFileSelect(event);
      // eslint-disable-next-line no-console
      console.log(event);
      // event.preventDefault();
      // const droppedFile = event.dataTransfer.files[0];
      // setFile(droppedFile);
      // onFileUpload(droppedFile);
    } catch (e) {
      !file && notify();
    }
  };

  const fileUploadBtn = {
    borderRadius: "5px",
    fontSize: "14px",
  };

  const notify = () => {
    toast.error("何か問題が発生しました");
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const divStyle = {
    height: "188px",
    background: "#F9F9FA",
    border: "",
    borderRadius: "8px",
  };
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
    // eslint-disable-next-line no-console
    console.log(event.target.files[0]);
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

  useImperativeHandle(ref, () => ({
    handleAdd: handleAdd,
  }));

  function handleAdd() {
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
  }

  return (
    <div
      style={manualCard}
      className={`flex flex-col h-${CardHeight}  md:h-full`}
    >
      <div className="flex items-center justify-start mt-3">
        {/* <div className="flex w-full md:w-1/2">
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
        </div> */}
        {/* <div className="flex justify-end w-full md:w-1/2">
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
        </div> */}
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
          <div className="w-full flex:col items-center justify-center py-[20px]" onDragOver={handleDragOver}
          onDrop={handleDrop}>
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
         htmlFor="fileInput"
          style={{ ...fileUploadBtn, border: "2px solid #5283B3" }} // Adding a blue border
          className="text-customBlue flex justify-center items-center h-[32px] w-[144px] rounded cursor-pointer  bg-white hover:bg-[#E8F1FB]"
        >
          <button
            className="text-[14px] text-center font-semibold cursor-pointer text-customBlue"
            onClick={()=>{
              document.getElementById("fileInput").click();
            }}
          >
            {intl.importmodal_fileupload_browse}
          </button>
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".pdf"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
        </label>
      </div>
          
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
      <div className=" hidden ">
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
                
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
});

FileUploadCard.displayName = 'FileUploadCard';

export default FileUploadCard;
