"use client";
import React, { useState, useEffect } from "react";
import intl from "@/utils/locales/jp/jp.json";
import DynamicLabel from "../../../components/Label/dynamicLabel";
import IconOutlineBtn from "../../../components/Button/iconOutlineBtn";
import AddIcon from "../../../components/Icons/addIcon";
import DataTable from "@/components/DataTable/DataTable";
import { code, tableDefaultPageSizeOption, maxLimit } from "@/utils/constant";
import SectionDeleteIcon from "@/components/Icons/sectionDelete";
import SectionEditIcon from "@/components/Icons/sectionEditIcon";
import Modal from "@/components/Modal/modal";
import TextPlain from "@/components/Input/textPlain";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import IconBtn from "@/components/Button/iconBtn";
import { useRouter } from "next/navigation";
import { setHelp } from "@/redux/features/help";
import { useAppDispatch } from "@/redux/hooks";
import api from "@/utils/api";
import * as Yup from "yup";
import { MAX_100_LENGTH_PATTERN } from "@/validation/validationPattern";
import { validateHandler, formatDate } from "@/validation/helperFunction";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import ProtectedRoute from "@/utils/auth";

export default function HelpSettingsList() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const schema = Yup.object().shape({
    addSettings: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    editSettings: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
  });
  const helpSettingsColumns = [
    {
      title: intl.helpSettingsList_section_label,
      dataIndex: "section",
      render: (text) => <a>{text}</a>,
      width: 120,
      align: "left",
    },
    {
      title: intl.helpSettingsList_Subsection_label,
      dataIndex: "numberOfSubsections",
      render: (text) => (
        <a className="" style={{ paddingRight: "10px" }}>
          {text}
        </a>
      ),
      width: 90,
      align: "right",
    },
    {
      title: "",
      dataIndex: "deleteEdit",
      render: (text, record) => (
        <div
          className="md:float-right"
          style={{ marginLeft: "10%", marginRight: "5%" }}
        >
          <p className="flex">
            <span
              className="ml-[25px] cursor-pointer rounded-full px-3 py-2 bg-[#EDF2F5] hover:bg-[#DCE7F0]"
              onClick={(event) => {
                event.stopPropagation();
                handelEdit(record);
              }}
            >
              <SectionEditIcon />
            </span>
            <span
              className="ml-[50px] cursor-pointer rounded-full px-3 py-2  bg-[#EDF2F5] hover:bg-[#DCE7F0]"
              onClick={(event) => {
                event.stopPropagation();
                handelDelete(record);
              }}
            >
              <SectionDeleteIcon />
            </span>
          </p>
        </div>
      ),
      width: "200px",
    },
  ];

  const [columns, setColumns] = React.useState(helpSettingsColumns);
  const [editModal, setEditModal] = React.useState(false);
  const [editSettings, setEditSettings] = useState("");
  const [addSettings, setAddSettings] = useState("");
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [addModal, setAddModal] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [editRecord, setRecord] = React.useState();
  const [helpSettingsData, setHelpSettingsData] = React.useState([]);
  const [tableHeight, setTableHeight] = useState(450);
  const [page, setPage] = useState(50);
  const [current, setCurrent] = useState(1);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [selectAll, setSelectAll] = useState(false);
  function editIcon(flag) {
    return <AddIcon isMobile={flag} />;
  }

  function handelEdit(record) {
    setEditModal(() => false);
    setAddModal(() => false);
    setTimeout(() => {
      setRecord(record);
      setEditSettings(record.section);
      setEditModal(() => true);
    }, 500);
  }

  function handelDelete(record) {
    setRecord(record);
    setDeleteModal(() => true);
  }

  function addHandler() {
    setAddModal(true);
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "addSettings") {
      setAddSettings(value);
    } else if (name === "editSettings") {
      setEditSettings(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  useEffect(() => {
    const formValues = { addSettings, editSettings };
    validateHandler(schema, formValues, setErrors);
  }, [addSettings, editSettings]);

  const onClose = () => {
    if (addModal) {
      setAddSettings("");
      setAddModal(false);
      setErrors({});
      setTouched({});
    } else {
      setEditSettings("");
      setEditModal(false);
      setErrors({});
      setTouched({});
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setTableHeight(window.innerHeight - 210);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          parent: "null",
        },
      };
      const response = await api.get("help/list", params);
      setLoading(false);
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedData = data.Items.map((item, index) => {
          const updateDate = item.updatedAt ? item.updatedAt : "";
          const createDate = item.createdAt;
          return {
            section: item.name,
            numberOfSubsections: item.childCount,
            updateDate: formatDate(updateDate),
            createDate: formatDate(createDate),
            id: item.setId,
            key: item.subSetId,
            subSetId: item.subSetId,
          };
        });
        setHelpSettingsData(formattedData);
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
  const createSection = async (name) => {
    toast.dismiss();
    setLoading(true);
    if (addSettings.trim().length === 0) {
      setLoading(false);
      const formValues = { addSettings, editSettings };
      setTouched({ ...touched, addSettings: true, editSettings: true });
      await validateHandler(schema, formValues, setErrors);
      setAddModal(true);
      return;
    }
    try {
      const payload = {
        parent: "null",
        name: name,
        type: "null",
        description: "null",
        file: "null",
      };

      const response = await api.post("help/create", payload);
      if (response.data.status.code == code.CREATED) {
        setLoading(false);
        setAddModal(false);
        setAddSettings("");
        setErrors({});
        setTouched({});
        fetchData();
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
      setAddModal(true);
    }
  };

  const updateSection = async (record, name) => {
    toast.dismiss();
    setLoading(true);
    if (editSettings.trim().length === 0) {
      setLoading(false);
      const formValues = { addSettings, editSettings };
      setTouched({ ...touched, addSettings: true, editSettings: true });
      await validateHandler(schema, formValues, setErrors);
      setEditModal(true);
      return;
    }
    try {
      const payload = {
        parent: "null",
        child: record.subSetId,
        name: name,
        type: "null",
        description: "null",
        file: "null",
      };

      const response = await api.put(`help/update`, payload);
      if (response.data.status.code == code.OK) {
        setLoading(false);
        setEditModal(false);
        fetchData();
      }
    } catch (error) {
      setLoading(false);
      setEditModal(true);
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

  const deleteSection = async (record) => {
    toast.dismiss();
    setLoading(true);
    try {
      const config = {
        data: {
          parent: "null",
          child: record.subSetId,
        },
      };
      const response = await api.delete(`help/delete`, config);
      if (response.data.status.code == code.OK) {
        setLoading(false);
        setDeleteModal(false);
        fetchData();
      }
    } catch (error) {
      setLoading(false);
      setDeleteModal(false);
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

  const handleSelectRow = (selected) => {
    setSelectedRows(selected);
  };

  return (
    <>
      <ProtectedRoute allowedRoles={["admin"]}>
        {loading && <LoaderOverlay />}
        <div>
          <div className="flex  justify-between mb-2 xl:mb-2 ">
            <div className="flex items-center">
              <DynamicLabel
                text={intl.help_settings_title}
                alignment="text-center"
                fontSize="text-[22px]"
                fontWeight="font-medium"
                textColor="#000000"
                disabled={false}
              />
            </div>
            <div className="hidden md:flex ">
              <IconOutlineBtn
                text={intl.help_settings_addition_btn}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"px-[20px]"}
                icon={() => editIcon(false)}
                borderColor={"border-customBlue"}
                onClick={async () => {
                  await setEditModal(() => false);
                  await setAddModal(() => false);
                  await addHandler();
                }}
              />
            </div>
            <div className="flex md:hidden">
              <IconBtn
                text={intl.help_settings_addition_btn}
                textColor={"text-customBlue"}
                textBold={true}
                icon={() => editIcon(false)}
                borderColor={"border-customBlue"}
                onClick={async () => {
                  await setEditModal(() => false);
                  await setAddModal(() => false);
                  await addHandler();
                }}
              />
            </div>
          </div>
          <div className="mb-[5px] flex items-center">
          <label
            key={"selectAll"}
            className="flex items-center text-customBlue"
          >
            <input
              type="checkbox"
              disabled={helpSettingsData?.length == 0}
              value={selectAll}
              checked={selectAll}
              className="h-[16px] w-[16px] text-[#19388B]  focus:ring-[#19388B] focus:ring-opacity-50 rounded-lg bg-[#19388B] bg-opacity-88 text-opacity-88"
              onChange={(evt) => {
                setSelectAll(evt.target.checked);
              }}
            />
            <span className="ml-1"> {"すべて選択"}</span>
          </label>
        </div>
          <div className="mb-[20px] relative" style={{ width: "100%" }}>
            <DataTable
              scrollVertical={tableHeight > 450 ? tableHeight : 450}
              rowSelectionFlag
              columns={columns}
              dataSource={helpSettingsData}
              onSelectRow={handleSelectRow}
              defaultPaeSizeOptions={tableDefaultPageSizeOption}
              defaultValue={1}
              onRowClick={(row, rowIndex) => {
                dispatch(setHelp(row));
                router.push("/help-settings/sub-section");
              }}
              selectAll={selectAll}
              setSelectAll={setSelectAll}
              setSelectedRows={setSelectedRows}
              page={page}
              setPage={setPage}
              current={current}
              setCurrent={setCurrent}
            />
          </div>
          {(editModal || addModal) && (
            <Modal
              height="412px"
              fontSize="text-xl"
              fontWeight="font-semibold"
              textColor="#19388B"
              text={
                addModal
                  ? "セクションを追加"
                  : intl.help_settings_addition_modal_edit
              }
              onCloseHandler={onClose}
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
                    onClick={() => {
                      if (editModal) {
                        updateSection(editRecord, editSettings);
                      }
                      if (addModal) {
                        createSection(addSettings);
                      }
                    }}
                  />
                );
              }}
            >
              <div className="flex flex-col px-[4%]">
                <div className="flex flex-col mt-[20px] mb-[80px]">
                  <TextPlain
                    isRequired={true}
                    type={"text"}
                    for={addModal ? "addSettings" : "editSettings"}
                    placeholder={intl.help_settings_addition_section_name}
                    borderRound={"rounded-xl"}
                    padding={"p-[10px]"}
                    focus={
                      "focus:outline-none focus:ring-2  focus:ring-customBlue "
                    }
                    border={"border border-gray-300"}
                    bg={"bg-white "}
                    additionalClass={"flex w-full pl-5 text-base pr-[30px]"}
                    label={intl.help_settings_addition_section_name}
                    labelColor={"#7B7B7B"}
                    id={addModal ? "addSettings" : "editSettings"}
                    value={addModal ? addSettings : editSettings}
                    onChange={handleChange}
                  />
                  {editModal &&
                    errors?.editSettings &&
                    touched?.editSettings && (
                      <div
                        className="mb-8 pl-1 validation-font flex"
                        style={{ color: "red" }}
                      >
                        {errors?.editSettings}
                      </div>
                    )}
                  {addModal && errors?.addSettings && touched?.addSettings && (
                    <div
                      className="mb-8 pl-1 validation-font flex"
                      style={{ color: "red" }}
                    >
                      {errors?.addSettings}
                    </div>
                  )}
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
                          setDeleteModal(() => false);
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
                          deleteSection(editRecord);
                        }}
                      />
                    </div>
                  </div>
                );
              }}
            >
              <div className="flex flex-col">
                <div className="flex-grow py-[90px] pt-[60px] dark:text-black">
                  {intl.help_settings_addition_msg}
                </div>
              </div>
            </Modal>
          )}
        </div>
        <ToastContainer />
      </ProtectedRoute>
    </>
  );
}
