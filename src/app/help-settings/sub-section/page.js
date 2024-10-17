"use client";
import React, { useState, useEffect, useRef } from "react";
import SubSection from "@/components/HelpSettings/subsection";
import TextPlain from "@/components/Input/textPlain";
import FileUploadCard from "@/components/HelpSettings/fileUploadCard";
import PlusButton from "@/components/Icons/plusButton";
import DeleteIcon from "../../../components/Icons/deleteIcon";
import dynamic from "next/dynamic";
import intl from "@/utils/locales/jp/jp.json";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import * as Yup from "yup";
import { MAX_100_LENGTH_PATTERN } from "@/validation/validationPattern";
import { validateHandler, formatDate } from "@/validation/helperFunction";
import { ToastContainer, toast } from "react-toastify";
import { code, helperSubSectionLinks, maxLimit } from "@/utils/constant";
import ProtectedRoute from "@/utils/auth";
import Breadcrumb from "@/components/Layout/breadcrumb";
import AddIcon from "@/components/Icons/addIcon";
import { Tabs, Button } from "antd";
import { Modal as AntModal } from "antd";
import HelpAddButton from "../components/helpAddButton";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
const EditorComponent = dynamic(
  () => import("../../../components/HelpSettings/textEditor"),
  {
    ssr: false,
  }
);

export default function Subsection() {
  const router = useRouter();
  const [activeButton, setActiveButton] = useState("text");
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
  const [helpToDelete, setHelpToDelete] = useState("");
  const fileUploadCardRef = useRef(null);
  const [tabKey, setTabKey] = useState("1");
  const [showDetails, setShowDetails] = useState(false);
  const [editModal, setEditModal] = React.useState(false);
  const [editSettings, setEditSettings] = useState("");
  const schema = Yup.object().shape({
    sectionName: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    editorValue: Yup.string().required(intl.validation_required),
  });
  const editSchema = Yup.object().shape({
    editSettings: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
  });
  const [fieldsToShow, setFieldsToShow] = useState(0);
  const HeaderButton = {
    color: "#fff",
  };

  const [selectedTab, setSelectedTab] = useState(null);
  const [sectionName, setSectionName] = useState("");

  const { TabPane } = Tabs;

  useEffect(() => {
    const formValues = { sectionName, editorValue };
    validateHandler(schema, formValues, setErrors);
  }, [sectionName, editorValue]);
  useEffect(() => {
    const formValues = { editSettings };
    validateHandler(editSchema, formValues, setErrors);
  }, [editSettings]);

  useEffect(() => {
    getSubsetValues();
  }, []);

  function handelEdit(record) {
    setEditModal(false);
    setTimeout(() => {
      setEditSettings(record.section);
      setEditModal(true);
    }, 500);
  }

  /**
   * Handles the change event for the edit settings input fields. The function sets the
   * state of the editSettings based on the name of the input field that triggered the event.
   * @param {object} event - The event triggered by the input field change.
   */
  const handleModalChange = (event) => {
    const { name, value } = event.target;
    if (name === "editSettings") {
      setEditSettings(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  /**
   * Resets the state of the edit modal when it is closed.
   * When the edit modal is closed, the function resets the editSettings state
   * to an empty string, sets editModal to false, and resets the errors and
   * touched states.
   */
  const onClose = () => {
    setEditSettings("");
    setEditModal(false);
    setErrors({});
    setTouched({});
  };

  /**
   * This function is used to update the section name.
   * It is called when the user clicks the edit button.
   * It makes a PUT request to the server to update the section name.
   * If the request is successful, it sets the edit modal to false
   * and fetches the data again.
   * If the request fails, it sets the edit modal to true and displays an error message.
   * @param {object} record - The section object to be updated.
   * @param {string} name - The new name of the section.
   */
  const updateParentSection = async (record, name) => {
    toast.dismiss();
    setLoading(true);
    if (editSettings.trim().length === 0) {
      setLoading(false);
      const formValues = { editSettings };
      setTouched({ ...touched, editSettings: true });
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
        router.push("/help-settings/helpSettingsList");
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

  /**
   * Handles the change event of the tab.
   * @param {string} key - The key of the tab to be changed.
   * If the key is 1, it sets the active button to 'text', else it sets it to 'file'.
   * And it also sets the tab key to the key.
   */
  const onTabChange = (key) => {
    // eslint-disable-next-line no-console
    console.log(`onTabChange: ${key}`);
    handleActiveButtonChange(key == 1 ? "text" : "file");
    setTabKey(key);
  };

  /**
   * Resets the state to prepare for adding a new help section.
   * @function
   * @returns {undefined}
   */
  const addHelp = () => {
    setIsAdd(true);
    setSelectedTab(null);
    setEditorValue("");
    setSectionName("");
    setFile("");
    setSubSectionDetails({});
    setFileName("");
    setErrors({});
    setTouched({});
    setTabKey("1");
    setShowDetails(true);
  };
  function editIcon(flag) {
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 19H6.2615L16.498 8.7635L15.2365 7.502L5 17.7385V19ZM4.404 20.5C4.14783 20.5 3.93317 20.4133 3.76 20.24C3.58667 20.0668 3.5 19.8522 3.5 19.596V17.8635C3.5 17.6197 3.54683 17.3873 3.6405 17.1663C3.734 16.9453 3.86283 16.7527 4.027 16.5885L16.6905 3.93075C16.8417 3.79342 17.0086 3.68733 17.1913 3.6125C17.3741 3.5375 17.5658 3.5 17.7663 3.5C17.9668 3.5 18.1609 3.53558 18.3488 3.60675C18.5368 3.67792 18.7032 3.79108 18.848 3.94625L20.0693 5.18275C20.2244 5.32758 20.335 5.49425 20.401 5.68275C20.467 5.87125 20.5 6.05975 20.5 6.24825C20.5 6.44942 20.4657 6.64133 20.397 6.824C20.3283 7.00683 20.2191 7.17383 20.0693 7.325L7.4115 19.973C7.24733 20.1372 7.05475 20.266 6.83375 20.3595C6.61275 20.4532 6.38033 20.5 6.1365 20.5H4.404ZM15.8562 8.14375L15.2365 7.502L16.498 8.7635L15.8562 8.14375Z"
        fill="#19388B"
      />
    </svg>;
  }

  /**
   * Handles the click event of the add button.
   * Resets the state to prepare for adding a new help section.
   * @function
   * @returns {undefined}
   */
  const handleAddButton = () => {
    // setActiveButton("file");
    setTabKey("1");
    setActiveButton("text");
    setIsAdd(true);
    setSelectedTab(null);
    setEditorValue("");
    setSectionName("");
    setFile("");
    setSubSectionDetails({});
    setFileName("");
    setErrors({});
    setTouched({});
    setShowDetails(false);
  };

  /**
   * Returns a DeleteIcon element.
   * @returns {ReactElement} The DeleteIcon element.
   */
  function deleteIcon() {
    return <DeleteIcon />;
  }

  /**
   * Handles the click event of the active button.
   * Sets the activeButton state to the name of the button clicked.
   * @param {string} buttonName - The name of the button clicked.
   * @returns {undefined}
   */
  const handleActiveButtonChange = (buttonName) => {
    setActiveButton(buttonName);
  };

  /**
   * Returns a PlusButton element.
   * @returns {ReactElement} The PlusButton element.
   */
  function plusIcon() {
    return <PlusButton />;
  }

  /**
   * Returns an AddIcon element.
   * @returns {ReactElement} The AddIcon element.
   */
  // function editIcon() {
  //   return <AddIcon />;
  // }

  /**
   * Returns an ImportIcon element.
   * @returns {ReactElement} The ImportIcon element.
   */
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

  /**
   * @function
   * @description Handles when a tab is clicked.  Updates the selectedTab state to the index of the clicked tab, sets isAdd to false, and calls fetchSubSetDetails with the clicked tab.
   * @param {number} index - The index of the clicked tab.
   * @param {object} tab - The clicked tab object.
   */
  const handleTabClick = (index, tab) => {
    setSelectedTab(index);
    setIsAdd(false);
    fetchSubSetDetails(tab);
  };

  /**
   * @function
   * @description Handles when an edit icon is clicked.  Toggles the showModal state to show/hide the modal for the given index.
   * @param {number} index - The index of the clicked edit icon.
   */
  const handleEditClick = (index) => {
    // Handle edit icon click for the tab at the given index
    setShowModal(!showModal);
  };

  /**
   * @function
   * @description Handles when a delete icon is clicked.  Updates the deleteModal state to true, sets the deleteChidData state to the given data, and handles the delete icon click for the tab at the given index.
   * @param {object} data - The data for the subset tab to be deleted.
   */
  const handleDeleteClick = (data) => {
    setDeleteModal(true);
    setDeleteChidData(data);
    // Handle delete icon click for the tab at the given index
  };

  /**
   * Fetches the subset values from the API and updates the tab data
   * @returns {Promise<void>}
   */
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

  /**
   * Fetches a subset of help settings data from the API and formats it for the UI.
   * The function sets the loading state to true, makes a GET request to the help/get
   * endpoint, and then sets the loading state to false. If the response is successful,
   * the function formats the data and sets the subSectionDetails state to the formatted
   * data, activeButton state to the type of the subset, sectionName state to the name of
   * the subset, editorValue state to the description of the subset, and errors state and
   * touched state to an empty object. The function also sets the showDetails state to true.
   * If the response is not successful, the function displays an error toast.
   * @param record The subset of help settings to fetch
   */
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
        setTabKey(formattedData.type == "text" ? "1" : "2");
        setActiveButton(formattedData.type);
        setSectionName(formattedData.name);
        setEditorValue(formattedData.description);
        setErrors({});
        setTouched({});
        setShowDetails(true);
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

  /**
   * Handles the change event for the section name input field.
   * It updates the state variable sectionName with the new value, and sets the touched state for the sectionName to true.
   * @param {object} event - The event object from the input field change event.
   */
  const handleChange = (event) => {
    const { value } = event.target;
    setSectionName(value);
    setTouched((prevTouched) => ({ ...prevTouched, sectionName: true }));
  };

  /**
   * Handles the file upload event.
   * If the section is being added for the first time, calls createSection.
   * Otherwise, calls updateSection.
   * @param {object} file - The uploaded file.
   */
  const handleFileUpload = (file) => {
    if (isAdd && Object.keys(subSectionDetails).length == 0) {
      createSection(file);
    } else {
      updateSection(file);
    }
  };

  /**
   * This function creates a new section in the help settings.
   * If the activeButton is "file", it validates the sectionName.
   * If the activeButton is "text", it validates the sectionName and editorValue.
   * If the validation is successful, it sends a POST request to the server to create the section.
   * The request payload contains the parent, name, type, description, file and fileName.
   * If the request is successful, it resets the form values, and resets the touched state for the form fields.
   * If the request fails, it shows an error toast with the error message.
   * @param {object} file - The file to be uploaded.
   */
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
          setErrors({});
          setTouched((prevTouched) => ({
            ...prevTouched,
            sectionName: false,
            editorValue: false,
          }));
          getSubsetValues();
          setTabKey("1");
          setActiveButton("text");
          setIsAdd(true);
          setSelectedTab(null);
          setEditorValue("");
          setSectionName("");
          setFile("");
          setSubSectionDetails({});
          setFileName("");
          setShowDetails(false);
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

  /**
   * This function updates a section in the help settings.
   * If the activeButton is "file", it validates the sectionName.
   * If the activeButton is "text", it validates the sectionName and editorValue.
   * If the validation is successful, it sends a PUT request to the server to update the section.
   * The request payload contains the parent, child, name, type, description, file and fileName.
   * If the request is successful, it resets the form values, and resets the touched state for the form fields.
   * If the request fails, it shows an error toast with the error message.
   * @param {object} file - The file to be uploaded.
   */
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
          setErrors({});
          setTouched((prevTouched) => ({
            ...prevTouched,
            sectionName: false,
            editorValue: false,
          }));
          getSubsetValues();
          setTabKey("1");
          setActiveButton("text");
          setIsAdd(true);
          setSelectedTab(null);
          setSectionName("");
          setEditorValue("");
          setFile("");
          setSubSectionDetails({});
          setFileName("");
          setShowDetails(false);
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

  /**
   * Handles the file upload button click event.
   * If the user is adding a new section and there is no section details,
   * it calls the createSection function.
   * Otherwise, it calls the updateSection function.
   */
  const handleFileButtonClick = () => {
    if (isAdd && Object.keys(subSectionDetails).length === 0) {
      createSection(file);
    } else {
      updateSection(file);
    }
  };

  /**
   * @function
   * @description
   * This function handles the changes in the editor.
   * It takes the content as a parameter and checks if it matches a certain pattern.
   * If it does, it replaces the pattern with an empty string.
   * It then sets the editorValue state to the new text and sets touched to true.
   * @param {string} content - The content of the editor.
   * @returns {void}
   */
  const handleEditorChange = (content) => {
    let text = content;
    const pattern = /^<p><br><\/p>$/;

    if (pattern.test(text)) {
      text = text.replace(pattern, "");
    }
    setEditorValue(text);
    if (text) {
      setTouched((prevTouched) => ({ ...prevTouched, editorValue: true }));
    }
  };

  /**
   * Handles the deletion of selected help sections.
   * Shows a toast error message if no help section is selected.
   * Sends a POST request to the API to delete the selected help sections.
   * If the response is successful, it sets the deleteModal state to false, updates the data to remove the deleted records, resets the selectedRows state, and fetches the data again.
   * If there is an error, it sets the deleteModal state to false, shows a toast error message and resets the selectedRows state.
   */
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
        setErrors({});
        setTouched((prevTouched) => ({
          ...prevTouched,
          sectionName: false,
          editorValue: false,
        }));
        getSubsetValues();
        setTabKey("1");
        setActiveButton("text");
        setIsAdd(true);
        setSelectedTab(null);
        setEditorValue("");
        setSectionName("");
        setFile("");
        setSubSectionDetails({});
        setFileName("");
        setShowDetails(false);
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
  const helperSubSectionLinks = [
    {
      title: intl.helper_sub_section_terminal_help_list,
      link: "/help-settings/helpSettingsList",
    },
    { title: Help.section, link: "/help-settings/sub-section" },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {loading && <LoaderOverlay />}

      <div className="">
        <div className="flex mb-[16px]">
          <Breadcrumb links={helperSubSectionLinks} />
        </div>
        <div className="flex items-center space-x-4">
          <div className="  text-xl font-semibold dark:text-black mb-[16px]">
            {Help.section}
          </div>
          <div className="flex mb-[16px] cursor-pointer">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => handelEdit(Help)}
            >
              <path
                d="M5 19H6.2615L16.498 8.7635L15.2365 7.502L5 17.7385V19ZM4.404 20.5C4.14783 20.5 3.93317 20.4133 3.76 20.24C3.58667 20.0668 3.5 19.8522 3.5 19.596V17.8635C3.5 17.6197 3.54683 17.3873 3.6405 17.1663C3.734 16.9453 3.86283 16.7527 4.027 16.5885L16.6905 3.93075C16.8417 3.79342 17.0086 3.68733 17.1913 3.6125C17.3741 3.5375 17.5658 3.5 17.7663 3.5C17.9668 3.5 18.1609 3.53558 18.3488 3.60675C18.5368 3.67792 18.7032 3.79108 18.848 3.94625L20.0693 5.18275C20.2244 5.32758 20.335 5.49425 20.401 5.68275C20.467 5.87125 20.5 6.05975 20.5 6.24825C20.5 6.44942 20.4657 6.64133 20.397 6.824C20.3283 7.00683 20.2191 7.17383 20.0693 7.325L7.4115 19.973C7.24733 20.1372 7.05475 20.266 6.83375 20.3595C6.61275 20.4532 6.38033 20.5 6.1365 20.5H4.404ZM15.8562 8.14375L15.2365 7.502L16.498 8.7635L15.8562 8.14375Z"
                fill="#19388B"
              />
            </svg>
            ;
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        {/* Left Column */}
        <div className="w-full md:w-1/2  md:pr-[24px] md:border-r border-[#e7e7e9]">
          <div className={tabs?.length > 0 ? "mb-[2vw]" : ""}>
            <SubSection
              selected={selectedTab}
              tabs={tabs}
              handleTabClick={handleTabClick}
              handleEditClick={handleEditClick}
              handleDeleteClick={handleDeleteClick}
            />
          </div>
          <div className="w-full mb-4">
            <HelpAddButton
              text={intl.help_settings_subsection_added_help}
              textColor={"text-[#214BB9]"}
              textBold={true}
              py={"xl:py-2.5 md:py-1.5 py-1.5 mt-2"}
              px={"xl:px-[32.5px] md:px-[22.5px] px-[22.5px]"}
              borderColor={"border-[#214BB9] bg-white"}
              icon={() => editIcon()}
              onClick={addHelp}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 pt-0 pr-0 md:pl-[24px] border-[#e7e7e9]">
          {showDetails && (
            <>
              <TextPlain
                type="text"
                for="sectionName"
                placeholder=""
                borderRound="rounded"
                padding="p-[8px]"
                focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                border="border border-[#e7e7e9]"
                bg="bg-white"
                additionalClass="block w-full text-base"
                label={intl.help_title}
                labelColor="#7B7B7B"
                id="sectionName"
                isRequired={true}
                value={sectionName}
                onChange={handleChange}
              />
              {errors?.sectionName && touched?.sectionName && (
                <div className="pl-1 validation-font" style={{ color: "red" }}>
                  {errors?.sectionName}
                </div>
              )}
              <div className="mt-4">
                <label className="block text-gray-700">
                  {intl.help_settings_addition_service_manual}
                </label>
                <Tabs
                  defaultActiveKey={"1"}
                  activeKey={tabKey}
                  className="mt-2"
                  onChange={onTabChange}
                >
                  <TabPane
                    tab={intl.helpSettings_buttonCard_text_label}
                    key="1"
                    className="max-h-[500px]"
                  >
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
                  </TabPane>
                  <TabPane tab={intl.layout_pttBar_file_label} key="2">
                    <FileUploadCard
                      ref={fileUploadCardRef}
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
                  </TabPane>
                </Tabs>
              </div>
              <div className="flex flex-row justify-end mt-4 sm:space-y-0 sm:space-x-2">
                <button
                  className="text-[16px] h-[32px] w-[124px] mr-[10px] text-center font-semibold cursor-pointer text-customBlue rounded border border-customBlue bg-white rounded"
                  onClick={() => {
                    if (tabKey == "1") {
                      handleAddButton();
                    } else {
                      fileUploadCardRef.current.handleCancel();
                    }
                  }}
                >
                  {intl.help_settings_addition_modal_cancel}
                </button>
                <button
                  style={HeaderButton}
                  className="text-[16px] font-[600] w-[124px] h-[32px] truncate bg-customBlue hover:bg-[#214BB9] rounded border border-customBlue rounded"
                  onClick={() => {
                    if (tabKey == "1") {
                      handleFileButtonClick();
                    } else {
                      fileUploadCardRef.current.handleAdd();
                    }
                  }}
                >
                  {intl.help_settings_addition_keep}
                </button>
              </div>
            </>
          )}
        </div>

        <AntModal
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-[20px] text-customBlue text-center">
              {intl.help_settings_delete_help_item}
            </div>
          }
          open={deleteModal}
          onCancel={() => {
            setDeleteModal(false);
          }}
          footer={[null]}
          style={{ padding: "40px" }}
        >
          <p
            style={{ textAlign: "center" }}
            className="px-[40px] font-normal text-base"
          >
            {childData.name}
            {/* {JSON.stringify(childData)} */}
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]">
            <Button
              key="cancel"
              className="flex-1 text-[#214BB9] border-[#214BB9] font-semibold h-[40px] text-base "
              onClick={() => {
                setDeleteModal(false);
              }}
            >
              {intl.help_settings_addition_modal_cancel}
            </Button>
            <Button
              key="delete"
              className="flex-1 bg-[#BA1818] border-[#BA1818] font-semibold h-[40px] text-base text-white hover:bg-red-500 no-hover"
              onClick={() => {
                deleteSubSection(childData);
              }}
            >
              {intl.help_settings_addition_delete_button}
            </Button>
          </div>
        </AntModal>
      </div>
      {editModal && (
        <AntModal
          width={520}
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-[20px] text-customBlue text-center">
              {intl.help_settings_help_category_edit}
            </div>
          }
          open={editModal}
          onCancel={() => {
            onClose();
          }}
          footer={() => {
            return (
              <div className="px-[40px] pb-[40px] pt-[20px]">
                <IconLeftBtn
                  text={intl.help_settings_addition_modal_edit}
                  textColor={"text-white font-semibold text-[16px]"}
                  py="py-[8px] px-[55px] w-full"
                  bgColor={"bg-customBlue"}
                  textBold={true}
                  icon={() => null}
                  onClick={() => {
                    updateParentSection(Help, editSettings);
                  }}
                />
              </div>
            );
          }}
          centered={true}
          className="my-[70px]"
        >
          <div className="flex flex-col">
            <div className="flex flex-col px-[40px]">
              <TextPlain
                isRequired={true}
                type={"text"}
                for="editSettings"
                placeholder={intl.help_settings_help_name}
                padding={"p-[8px] h-[40px]"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                border={"border border-[#E7E7E9]"}
                bg={"bg-white"}
                additionalClass={"flex w-full text-[16px]"}
                label={intl.help_settings_help_name}
                labelColor={"#7B7B7B"}
                id="editSettings"
                value={editSettings}
                onChange={handleModalChange}
              />
              {errors?.editSettings && touched?.editSettings && (
                <div
                  className="mb-8 pl-1 validation-font flex"
                  style={{ color: "red" }}
                >
                  {errors?.editSettings}
                </div>
              )}
            </div>
          </div>
        </AntModal>
      )}
    </ProtectedRoute>
  );
}
