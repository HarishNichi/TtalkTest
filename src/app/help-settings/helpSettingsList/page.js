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
import DeleteIcon from "@/components/Icons/deleteIcon";
import { Button } from "antd";
import DeleteIconDisabled from "@/components/Icons/deleteDisabledIcon";
import { Modal as AntModal } from "antd";
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
      title: intl.help_settings_help_name,
      dataIndex: "section",
      render: (text) => <a>{text}</a>,
      width: 120,
      align: "left",
    },
    {
      title: intl.help_settings_count,
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
      align: "right",
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
  const [data, setData] = useState([]);
  function editIcon(flag) {
    return <AddIcon isMobile={flag} />;
  }
  function deleteIcon(flag) {
    return <DeleteIcon isMobile={flag} />;
  }
  function disabledDeleteIcon(flag) {
    return <DeleteIconDisabled isMobile={flag} />;
  }
  function importIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_5185_3186)">
          <path
            d="M12.0002 15.4115C11.8797 15.4115 11.7676 15.3923 11.6637 15.3538C11.5599 15.3154 11.4612 15.2494 11.3675 15.1558L8.25799 12.0463C8.10933 11.8974 8.03591 11.7233 8.03774 11.524C8.03974 11.3247 8.11316 11.1474 8.25799 10.9922C8.41316 10.8373 8.59133 10.7572 8.79249 10.752C8.99383 10.7468 9.17208 10.8218 9.32724 10.977L11.2502 12.9V5.25C11.2502 5.03717 11.3221 4.859 11.4657 4.7155C11.6092 4.57183 11.7874 4.5 12.0002 4.5C12.2131 4.5 12.3912 4.57183 12.5347 4.7155C12.6784 4.859 12.7502 5.03717 12.7502 5.25V12.9L14.6732 10.977C14.8221 10.8283 14.9987 10.7549 15.203 10.7568C15.4075 10.7588 15.5873 10.8373 15.7425 10.9922C15.8873 11.1474 15.9623 11.3231 15.9675 11.5192C15.9727 11.7154 15.8977 11.8911 15.7425 12.0463L12.633 15.1558C12.5393 15.2494 12.4406 15.3154 12.3367 15.3538C12.2329 15.3923 12.1207 15.4115 12.0002 15.4115ZM6.30799 19.5C5.80283 19.5 5.37524 19.325 5.02524 18.975C4.67524 18.625 4.50024 18.1974 4.50024 17.6923V15.7308C4.50024 15.5179 4.57208 15.3398 4.71574 15.1962C4.85924 15.0526 5.03741 14.9808 5.25024 14.9808C5.46308 14.9808 5.64124 15.0526 5.78474 15.1962C5.92841 15.3398 6.00024 15.5179 6.00024 15.7308V17.6923C6.00024 17.7692 6.03233 17.8398 6.09649 17.9038C6.16049 17.9679 6.23099 18 6.30799 18H17.6925C17.7695 18 17.84 17.9679 17.904 17.9038C17.9682 17.8398 18.0002 17.7692 18.0002 17.6923V15.7308C18.0002 15.5179 18.0721 15.3398 18.2157 15.1962C18.3592 15.0526 18.5374 14.9808 18.7502 14.9808C18.9631 14.9808 19.1412 15.0526 19.2847 15.1962C19.4284 15.3398 19.5002 15.5179 19.5002 15.7308V17.6923C19.5002 18.1974 19.3252 18.625 18.9752 18.975C18.6252 19.325 18.1977 19.5 17.6925 19.5H6.30799Z"
            fill="#19388B"
          />
        </g>
        <defs>
          <clipPath id="clip0_5185_3186">
            <rect
              width="24"
              height="24"
              fill="white"
              transform="translate(0.000244141)"
            />
          </clipPath>
        </defs>
      </svg>
    );
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

  const deleteSection = async () => {
    // Check if there are selected rows
    if (selectedRows.length === 0) {
      toast.error("No rows selected for deletion.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
      return;
    }

    toast.dismiss();
    setLoading(true);

    try {
      // Iterate through selected rows to delete them
      for (const record of selectedRows) {
        const config = {
          data: {
            parent: "null",
            child: record.subSetId,
          },
        };

        const response = await api.delete(`help/delete`, config);

        if (response.data.status.code !== code.OK) {
          throw new Error(
            response.data.status.message || "Failed to delete record"
          );
        }
      }

      // Update the state to remove the deleted records
      setData((prevData) =>
        prevData.filter(
          (item) => !selectedRows.some((selected) => selected.id === item.id)
        )
      );

      // Reset selectedRows state
      setSelectedRows([]);

      // Hide the delete modal
      setDeleteModal(false);

      // Optionally, fetch fresh data if needed
      fetchData();
    } catch (error) {
      // Handle errors and display a toast message
      toast(error.message || "An error occurred while deleting the record.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
    } finally {
      setLoading(false); // Ensure loading state is reset
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
          <div className="flex  justify-between mb-4 xl:mb-2 ">
            <div className="flex items-center dark:text-black">
              <DynamicLabel
                text={intl.helper_sub_section_terminal_help_list}
                alignment="text-center dark:text-black"
                fontSize="text-xl"
                fontWeight="font-semibold"
                textColor="#000000"
                disabled={false}
              />
            </div>
            <div className="flex ">
              <IconOutlineBtn
                text={
                  selectedRows.length === 0
                    ? `${intl.help_settings_addition_delete}`
                    : `${intl.help_settings_addition_delete}(${selectedRows.length})`
                }
                textColor={
                  selectedRows.length === 0
                    ? "text-[#FFCCCC]"
                    : "text-[#BA1818]"
                } // Light red when disabled, darker red otherwise
                borderColor={"border-none"} // Light border when disabled, no border otherwise
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                icon={
                  selectedRows.length === 0 ? disabledDeleteIcon : deleteIcon
                }
                disabled={selectedRows.length === 0} // Disable the button when selectedRows is empty
                onClick={(event) => {
                  event.stopPropagation();
                  if (selectedRows.length > 0) {
                    handelDelete(selectedRows); // Call your delete handler with selected rows
                  }
                }}
              />

              <IconOutlineBtn
                text={intl.help_settings_help_category}
                textColor={"text-customBlue"}
                textBold={true}
                py={"xl:py-2.5 md:py-1.5 py-1.5"}
                px={"px-[20px]"}
                icon={() => editIcon(false)}
                borderColor={"border-none"}
                onClick={async () => {
                  setEditModal(() => false);
                  await setAddModal(() => false);
                  await addHandler();
                }}
              />
            </div>
          </div>
          <div className="mb-[16px] flex items-center">
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
          <div className=" relative" style={{ width: "100%" }}>
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
                  ? intl.help_settings_help_category
                  : intl.help_settings_help_category_edit
              }
              onCloseHandler={onClose}
              modalFooter={() => {
                return (
                  <IconLeftBtn
                    text={
                      addModal
                        ? intl.add_machine
                        : intl.help_settings_addition_modal_edit
                    }
                    textColor={"text-white font-semibold text-[16px]"}
                    py="py-[8px] px-[55px] w-full"
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
              <div className="flex flex-col ">
                <div className="flex flex-col  ">
                  <TextPlain
                    isRequired={true}
                    type={"text"}
                    for={addModal ? "addSettings" : "editSettings"}
                    placeholder={intl.help_settings_help_name}
                    padding={"p-[10px] h-[40px]"}
                    focus={
                      "focus:outline-none focus:ring-2  focus:ring-customBlue "
                    }
                    border={"border border-gray-300"}
                    bg={"bg-white "}
                    additionalClass={"flex w-full pl-5 text-base pr-[30px]"}
                    label={intl.help_settings_help_name}
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
            <AntModal
              title={
                <div className="px-[40px] pt-[40px] mb-[2vw] text-customBlue text-center">
                  {intl.help_settings_delete_help_category}
                </div>
              }
              width={500}
              open={deleteModal}
              onCancel={() => {
                setDeleteModal(false);
              }}
              footer={null}
            >
              <p style={{ textAlign: "center" }} className="px-[40px]">
                {intl.help_settings_help_items_deleted}
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]  ">
                <Button
                  key="cancel"
                  className="sm:flex-1 w-full sm:w-auto text-[#214BB9] border-[#214BB9] font-semibold h-[40px] text-base"
                  onClick={() => setDeleteModal(false)}
                >
                  {intl.help_settings_addition_modal_cancel}
                </Button>
                <Button
                  key="delete"
                  className="sm:flex-1 w-full sm:w-auto bg-[#BA1818] h-[40px] text-white no-hover"
                  onClick={() => {
                    deleteSection(editRecord);
                  }}
                >
                  {intl.help_settings_addition_delete_button}(
                  {selectedRows.length})
                </Button>
              </div>
            </AntModal>
          )}
        </div>
        <ToastContainer />
      </ProtectedRoute>
    </>
  );
}
