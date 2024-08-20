"use client";
import React, { useState, useEffect } from "react";
import DynamicLabel from "@/components/Label/dynamicLabel";
import SubSection from "@/components/HelpSettings/subsection";
import TextPlain from "@/components/Input/textPlain";
import ButtonCard from "@/components/HelpSettings/buttonCard";
import FileUploadCard from "@/components/HelpSettings/fileUploadCard";
import IconOutlineBtn from "@/components/Button/iconOutlineBtn";
import PlusButton from "@/components/Icons/plusButton";
import DeleteIcon from "../../../components/Icons/deleteIcon";
import IconBtn from "../../../components/Button/iconBtn";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import dynamic from "next/dynamic";
import Modal from "@/components/Modal/modal";
import intl from "@/utils/locales/jp/jp.json";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import * as Yup from "yup";
import { MAX_100_LENGTH_PATTERN } from "@/validation/validationPattern";
import { validateHandler, formatDate } from "@/validation/helperFunction";
import { ToastContainer, toast } from "react-toastify";
import { code, maxLimit } from "@/utils/constant";
import ProtectedRoute from "@/utils/auth";
const EditorComponent = dynamic(
  () => import("../../../components/HelpSettings/textEditor"),
  {
    ssr: false,
  }
);

export default function Subsection() {
  const router = useRouter();
  const [activeButton, setActiveButton] = useState("file");
  const Help = useAppSelector((state) => state.helpReducer.help);
  const [isAdd, setIsAdd] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [tabs, setTabData] = useState([]);
  const [subSectionDetails, setSubSectionDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = React.useState({});
  const [errors, setErrors] = useState({});
  const [childData, setDeleteChidData] = useState({});
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const schema = Yup.object().shape({
    sectionName: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    editorValue: Yup.string().required(intl.validation_required),
  });
  const handleAddButton = () => {
    setActiveButton("file");
    setIsAdd(true);
    setSelectedTab(null);
    setEditorValue("");
    setSectionName("");
    setFile("");
    setSubSectionDetails({});
    setFileName("");
    setErrors({});
    setTouched({});
  };
  function deleteIcon() {
    return <DeleteIcon />;
  }

  const handleActiveButtonChange = (buttonName) => {
    setActiveButton(buttonName);
  };
  function plusIcon() {
    return <PlusButton />;
  }
  const subSectionCard = {
    borderRadius: "9px",
    background: "#FFF",
    boxShadow: "0px 0px 15px 0px rgba(0, 0, 0, 0.10)",
  };
  const HeaderButton = {
    borderRadius: "9px",
    color: "#fff",
  };
  const requiredColor = {
    color: "#ED2E2E",
  };
  const [selectedTab, setSelectedTab] = useState(null);
  const [sectionName, setSectionName] = useState("");

  const handleTabClick = (index, tab) => {
    setSelectedTab(index);
    setIsAdd(false);
    fetchSubSetDetails(tab);
  };
  const handleEditClick = (index) => {
    // Handle edit icon click for the tab at the given index
    setShowModal(!showModal);
  };

  const handleDeleteClick = (data) => {
    setDeleteModal(true);
    setDeleteChidData(data);
    // Handle delete icon click for the tab at the given index
  };
  useEffect(() => {
    getSubsetValues();
  }, []);

  const getSubsetValues = async () => {
    toast.dismiss();
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          parent: Help.subSetId,
        },
      };
      const response = await api.get("help/list", params);
      setLoading(false);
      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedData = data.Items.map((item, index) => {
          return {
            name: item.name,
            id: item.subSetId,
            setId: item.setId,
          };
        });
        setTabData(formattedData);
      }
    } catch (error) {
      setLoading(false);
      toast(
        error.response?.data?.status?.message
          ? error.response?.data?.status?.message
          : error.response.data.message,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          type: "error",
        }
      );
    }
  };

  const fetchSubSetDetails = async (record) => {
    toast.dismiss();
    setLoading(true);
    try {
      const params = {
        params: {
          parent: Help.subSetId,
          child: record.id,
        },
      };
      const response = await api.get("help/get", params);
      setLoading(false);
      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const item = data.Item;
        const formattedData = {
          name: item.name,
          id: item.subSetId,
          setId: item.setId,
          description: item.type == "text" ? item.description : "",
          type: item.type,
          cFile: item.file,
          file: item.file?.name,
          filePath: item.file?.path,
        };
        setSubSectionDetails(formattedData);
        setActiveButton(formattedData.type);
        setSectionName(formattedData.name);
        setEditorValue(formattedData.description);
        setErrors({});
        setTouched({});
      }
    } catch (error) {
      setLoading(false);
      toast(
        error.response?.data?.status?.message
          ? error.response?.data?.status?.message
          : error.response.data.message,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          type: "error",
        }
      );
    }
  };

  useEffect(() => {
    const formValues = { sectionName, editorValue };
    validateHandler(schema, formValues, setErrors);
  }, [sectionName, editorValue]);

  const handleChange = (event) => {
    const { value } = event.target;
    setSectionName(value);
    setTouched((prevTouched) => ({ ...prevTouched, sectionName: true }));
  };
  const handleFileUpload = (file) => {
    if (isAdd && Object.keys(subSectionDetails).length == 0) {
      createSection(file);
    } else {
      updateSection(file);
    }
  };
  const createSection = async (file) => {
    toast.dismiss();
    if (activeButton === "file") {
      const formValues = { sectionName };
      setTouched((prevTouched) => ({
        ...prevTouched,
        sectionName: true,
        editorValue: false,
      }));

      await validateHandler(schema, formValues, setErrors);
      errors && delete errors.editorValue;
    }

    if (activeButton === "text") {
      const formValues = { sectionName, editorValue };

      setTouched((prevTouched) => ({
        ...prevTouched,
        editorValue: true,
        sectionName: true,
      }));
      await validateHandler(schema, formValues, setErrors);
    }
    if (Object.keys(errors || {}).length <= 0) {
      setLoading(true);
      try {
        const payload = {
          parent: Help.subSetId,
          name: sectionName,
          type: activeButton == "file" ? "file" : "text",
          description: editorValue,
          file: file || "null",
          fileName: fileName || "null",
        };

        const response = await api.post("help/create", payload);
        if (response && response.data.status.code == code.CREATED) {
          setLoading(false);
          getSubsetValues();
          setActiveButton("file");
          setIsAdd(true);
          setSelectedTab(null);
          setEditorValue("");
          setSectionName("");
          setFile("");
          setSubSectionDetails({});
          setFileName("");
          setErrors({});
          setTouched({});
        }
      } catch (error) {
        setLoading(false);
        toast(
          error.response?.data?.status?.message
            ? error.response?.data?.status?.message
            : error.response.data.message,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            type: "error",
          }
        );
      }
    }
  };

  const updateSection = async (file) => {
    toast.dismiss();
    if (activeButton === "file") {
      const formValues = { sectionName };
      setTouched((prevTouched) => ({
        ...prevTouched,
        sectionName: true,
        editorValue: false,
      }));

      await validateHandler(schema, formValues, setErrors);
      errors && delete errors.editorValue;
    }

    if (activeButton === "text") {
      const formValues = { sectionName, editorValue };

      setTouched((prevTouched) => ({
        ...prevTouched,
        editorValue: true,
        sectionName: true,
      }));
      await validateHandler(schema, formValues, setErrors);
    }
    if (Object.keys(errors || {}).length <= 0) {
      setLoading(true);
      try {
        let payload = {
          parent: Help.subSetId,
          child: subSectionDetails.id,
          name: sectionName,
          type: activeButton == "file" ? "file" : "text",
          description: editorValue,
          file: file || "null",
          fileName: file ? fileName || "null" : "null",
        };

        const response = await api.put("help/update", payload);
        if (response && response.data.status.code == code.OK) {
          setLoading(false);
          getSubsetValues();
          setActiveButton("file");
          setIsAdd(true);
          setSelectedTab(null);
          setSectionName("");
          setEditorValue("");
          setFile("");
          setSubSectionDetails({});
          setFileName("");
          setErrors({});
          setTouched({});
        }
      } catch (error) {
        setLoading(false);
        toast(
          error.response?.data?.status?.message
            ? error.response?.data?.status?.message
            : error.response.data.message,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            type: "error",
          }
        );
      }
    }
  };

  const handleFileButtonClick = () => {
    if (isAdd && Object.keys(subSectionDetails).length === 0) {
      createSection(file);
    } else {
      updateSection(file);
    }
  };

  const handleEditorChange = (content) => {
    let text = content;
    const pattern = /^<p><br><\/p>$/;

    if (pattern.test(text)) {
      text = text.replace(pattern, "");
    }
    setEditorValue(text);
    setTouched((prevTouched) => ({ ...prevTouched, editorValue: true }));
  };

  const deleteSubSection = async (record) => {
    toast.dismiss();
    setLoading(true);
    try {
      const config = {
        data: {
          parent: record.setId,
          child: record.id,
        },
      };
      const response = await api.delete(`help/delete`, config);
      if (response && response.data.status.code == code.OK) {
        setLoading(false);
        setDeleteModal(false);
        getSubsetValues();
      }
    } catch (error) {
      setLoading(false);
      setDeleteModal(true);
      toast(
        error.response?.data?.status?.message
          ? error.response?.data?.status?.message
          : error.response.data.message,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          type: "error",
        }
      );
    }
  };
  return (
    <>
      <ProtectedRoute allowedRoles={["admin"]}>
        {loading && <LoaderOverlay />}
        <div className="flex flex-col flex-1 h-full">
          <div className="flex flex-col flex-1 h-full">
            <div className="flex  flex-col justify-between mb-2 ">
              <div className="flex">
                <DynamicLabel
                  text={intl.help_settings_title}
                  alignment="text-center"
                  fontSize="text-[22px]"
                  fontWeight="font-medium"
                  textColor="#000000"
                  disabled={false}
                />
              </div>
              <div className="">
                <button
                  onClick={() => {
                    router.push("/help-settings/helpSettingsList");
                  }}
                  style={HeaderButton}
                  className="text-base py-2 w-[150px] truncate px-[3px] bg-customBlue hover:bg-[#5283B3]"
                >
                  {Help.section}
                </button>
              </div>
            </div>
            <div className="flex flex-col flex-1 md:flex-row  md:gap-[10px] h-auto">
              <div className="lg:hidden flex-row w-full md:w-2/5">
                <SubSection
                  selected={selectedTab}
                  tabs={tabs}
                  handleTabClick={handleTabClick}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                />
              </div>
              <div className="md:w-3/5 mt-2 md:mt-[0px] flex flex-col h-auto">
                <div style={subSectionCard} className="px-3 pb-4 pt-3">
                  <TextPlain
                    type="text"
                    for="sectionName"
                    placeholder=""
                    borderRound="rounded-xl"
                    padding="p-2"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white"
                    additionalClass="block w-full pl-5 text-base pr-[30px]"
                    label={intl.help_settings_addition_subsection_name}
                    labelColor="#7B7B7B"
                    id="sectionName"
                    isRequired={true}
                    value={sectionName}
                    onChange={handleChange}
                  />
                  {errors?.sectionName && touched?.sectionName && (
                    <div
                      className="pl-1 validation-font"
                      style={{ color: "red" }}
                    >
                      {errors?.sectionName}
                    </div>
                  )}
                </div>
                {isAdd && (
                  <div className="pt-2 flex justify-center">
                    <ButtonCard
                      file={file}
                      editorValue={editorValue}
                      activeButton={activeButton}
                      onActiveButtonChange={handleActiveButtonChange}
                    />
                  </div>
                )}
                {activeButton == "file" && (
                  <div className="pt-2  flex flex-col flex-1 md:h-auto">
                    <FileUploadCard
                      isAdd={isAdd}
                      file={file}
                      sectionName={sectionName}
                      setIsAdd={setIsAdd}
                      setErrors={setErrors}
                      setTouched={setTouched}
                      setSubSectionDetails={setSubSectionDetails}
                      setFileName={setFileName}
                      setFile={setFile}
                      fileName={
                        subSectionDetails?.file
                          ? subSectionDetails.file
                          : fileName
                      }
                      handleUploadButtonClick={handleFileUpload}
                      setActiveButton={setActiveButton}
                      CardHeight={isAdd ? "322px" : "375px"}
                      HeaderTitle={
                        isAdd
                          ? intl.help_settings_addition_upload_file
                          : intl.help_settings_addition_service_manual
                      }
                      handleAddButton={handleAddButton}
                    />
                  </div>
                )}
                {activeButton == "text" && (
                  <div
                    className="mt-2 flex flex-col flex-1 md:h-auto"
                    style={{
                      borderRadius: "9px",
                      background: "#FFF",
                      boxShadow: "0px 0px 15px 0px rgba(0, 0, 0, 0.10)",
                      height: isAdd ? "322px" : "375px",
                    }}
                  >
                    <div className="flex justify-between items-center px-[20px] pt-3 mb-[20px]">
                      <div className="flex">
                        <DynamicLabel
                          text={intl.help_settings_addition_explanation}
                          alignment="text-center"
                          fontSize="text-[17px]"
                          fontWeight="font-normal"
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
                      <div>
                        <IconBtn
                          text={intl.help_settings_addition_btn}
                          textColor={"text-customBlue"}
                          textBold={true}
                          icon={() => deleteIcon()}
                          borderColor={"border-customBlue"}
                          onClick={() => {
                            setIsAdd(true);
                            setEditorValue("");
                            setTouched({});
                            setErrors({});
                          }}
                        />
                      </div>
                    </div>
                    <div className="px-[20px] flex-grow">
                      <EditorComponent
                        ContentValue={editorValue}
                        onChange={handleEditorChange}
                      />
                      {errors?.editorValue && touched?.editorValue && (
                        <div
                          className="pl-1 validation-font"
                          style={{ color: "red" }}
                        >
                          {errors?.editorValue}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end pb-[16px] px-[20px]"> 
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
                        onClick={handleFileButtonClick}
                      />
                    </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden lg:block md:w-2/5 flex flex-col flex-1 h-auto">
                <SubSection
                  selected={selectedTab}
                  tabs={tabs}
                  handleTabClick={handleTabClick}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                />
              </div>
            </div>
            {showModal && (
              <Modal
                height="412px"
                fontSize="text-xl"
                fontWeight="font-semibold"
                textColor="#19388B"
                text={intl.help_settings_addition_modal_add}
                modalFooter={() => {
                  return (
                    <IconLeftBtn
                      text={intl.help_settings_addition_keep}
                      textColor={"text-white font-semibold text-[16px]"}
                      py="py-[8px] px-[55px]"
                      bgColor={"bg-customBlue"}
                      textBold={true}
                      icon={() => {
                        return null;
                      }}
                    />
                  );
                }}
              >
                <div className="flex flex-col px-[4%]">
                  <div className="flex flex-col mt-[20px] mb-[80px]">
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
                      label={intl.help_settings_addition_section_name}
                      labelColor={"#7B7B7B"}
                      id={"sectionName"}
                      value={sectionName}
                      onchange={setSectionName}
                    />
                  </div>
                </div>
              </Modal>
            )}
            {deleteModal && (
              <Modal
                height="412px"
                fontSize="text-xl"
                fontWeight="font-semibold"
                textColor="#19388B"
                text={intl.help_settings_addition_delete}
                onCloseHandler={setDeleteModal}
                modalFooter={() => {
                  return (
                    <div className=" flex justify-between">
                      <div>
                        <IconLeftBtn
                          text={intl.help_settings_addition_modal_cancel}
                          textColor={"text-white font-semibold text-sm w-full"}
                          py={"py-[11px]"}
                          px={"px-[10.5px] md:px-[17.5px]"}
                          bgColor={"bg-customBlue"}
                          textBold={true}
                          icon={() => {
                            return null;
                          }}
                          onClick={() => {
                            setDeleteModal(false);
                          }}
                        />
                      </div>
                      <div>
                        <IconLeftBtn
                          text={intl.help_settings_addition_delete}
                          textColor={
                            "text-white font-semibold text-sm w-full ml-2"
                          }
                          py={"py-[11px]"}
                          px={"px-[30.5px] md:px-[38.5px]"}
                          bgColor={"bg-customBlue"}
                          textBold={true}
                          icon={() => {
                            return null;
                          }}
                          onClick={() => {
                            deleteSubSection(childData);
                          }}
                        />
                      </div>
                    </div>
                  );
                }}
              >
                <div className="flex flex-col">
                  <div className="flex-grow py-[90px] pt-[60px] dark:text-black">
                    {intl.help_settings_subsection_delete}
                  </div>
                </div>
              </Modal>
            )}
          </div>
        </div>
        <ToastContainer />
      </ProtectedRoute>
    </>
  );
}
