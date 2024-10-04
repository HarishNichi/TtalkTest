"use client";

import { useState, useEffect, useRef } from "react";
import DynamicLabel from "../Label/dynamicLabel";
import EditIcon from "@/components/Icons/editIcon";
import TitleUserCard from "@/app/user/components/titleUserCard";
import ActionButton from "@/app/user/components/actionButton";
import { useRouter } from "next/navigation";
import intl from "@/utils/locales/jp/jp.json";
import Input from "antd/es/input/Input";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import api from "@/utils/api";

import { getEmployee } from "@/redux/features/employee";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { formatDate, updateEmployee } from "@/validation/helperFunction";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import * as Yup from "yup";
import { PASSWORD_PATTERN } from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import Modal from "@/components/Modal/modal";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import IconOutlineBtn from "../Button/iconOutlineBtn";
import { Button } from "antd";
import ImportUserModal from "../ImportModal/userImport";
import { Modal as AntModal } from "antd";
import UserEdit from "../UserEdit/page";
import { sampleLinks } from "@/utils/constant";

import {
  fileName,
  tableDefaultPageSizeOption,
  EmployeeSearchLimit,
  adminChannel,
  errorToastSettings,
  successToastSettings,
  csvFileNameRegex,
  maxLimit,
  code,
} from "@/utils/constant";
import DropdownMedium from "../Input/dropdownMedium";
import TextPlain from "../Input/textPlain";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
Amplify.configure(gen.config);
// Yup schema to validate the form
const schema = Yup.object().shape({
  password: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_PATTERN.regex, PASSWORD_PATTERN.message),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], intl.password_not_matched)
    .required(intl.validation_required),
});

export default function UserDetails() {
  const dispatch = useAppDispatch();
  const routerPath = useRouter();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [exportModal, setExportModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [csvUploadInitiated, setCsvUploadInitiated] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comCreated, setComCreated] = useState(false);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const [exportType, setExportType] = useState(1);
  const CSVDownloadRef = useRef("");
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileValidationError, setFileValidationError] = useState(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [fileNameError, setFileNameError] = useState(null);
  const [shouldOpenInNewTab, setIsPdf] = useState(false);

  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({});
  let [type1, setType1] = useState("password");
  let [type2, setType2] = useState("password");
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const UserData = useAppSelector((state) => state.userReducer.user);
  let Admin = false;
  let organizationIdForChannel;
  let orgName;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    organizationIdForChannel = User.id;
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgName = User.name;
  }

  const [limit, setLimit] = useState(EmployeeSearchLimit);
  const [received, setReceived] = useState("");

  function importHandler() {
    setTimeout(() => {
      setImportModal(() => true);
    }, 100);
  }
  useEffect(() => {
    downloadCsvLink && CSVDownloadRef.current.click();
  }, [downloadCsvLink]);

  async function exportCSVFile() {
    try {
      let data;
      let downloadFileName = exportType == 1 ? ".csv" : ".pdf";
      let url = exportType == 1 ? "employees/export" : "employees/qr-code";
      toast.dismiss();
      if (!csvFileName) {
        setFileNameError(intl.user_file_name_required);
        return;
      }
      if (!csvFileNameRegex.test(csvFileName)) {
        setFileNameError(intl.user_check_file_name);
        return;
      }
      setFileNameError("");
      setLoading(true);
      let id = [];
      id.push(Employee.id);
      data = { ids: id, filename: csvFileName + downloadFileName };
      let result = await api.post(url, data);
      setDownloadCsvLink(result?.data.data.path);
      const shouldOpenInNewTab = result?.data.data.path.endsWith(".pdf");
      setIsPdf(shouldOpenInNewTab);
      setExportModal(() => false);
      setCsvFileName("");
      if (result?.data?.status?.code == 200) {
        toast(intl.groups_export_success, successToastSettings);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast(intl.user_file_export_failed, errorToastSettings);
    }
  }

  function getExportModalFooter() {
    return (
      <div className="px-[40px] pb-[40px] pt-[20px]">
        <IconLeftBtn
          text={intl.company_list_company_export_title}
          textColor={"text-white font-semibold text-[16px] w-full"}
          py={"py-[11px]"}
          px={"w-[84%]"}
          bgColor={"bg-customBlue"}
          textBold={true}
          icon={() => {
            return null;
          }}
          onClick={() => {
            exportCSVFile();
          }}
        />
      </div>
    );
  }

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name == "password") {
      setPassword(value);
    } else if (name == "confirmPassword") {
      setConfirmPassword(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  useEffect(() => {
    const formValues = { password, confirmPassword };
    validateHandler(schema, formValues, setErrors);
  }, [password, confirmPassword]);

  const fetchData = async (projectionList) => {
    setLoading(true);
    try {
      const params = {
        params: {
          id: Employee.id,
        },
      };
      let { data } = await api.get("employees/get", params);
      let emp = data.data.Item;
      let org = Admin
        ? findName(emp.organizationId, projectionList) || "-"
        : orgName;
      let response = {
        userId: emp.id,
        userName: emp.name,
        furigana: emp.furigana,
        companyName: org,
        onlineStatus:
          emp.accountDetail.employee.onlineStatus == "online" ? true : false,
        designation: emp.accountDetail.employee.designation,
        email: emp.accountDetail.employee.email,
        phone:
          emp.accountDetail.employee.telephoneNo &&
          "+" + emp.accountDetail.employee.telephoneNo,
        currentAddress: "",
        device: emp.accountDetail.employee.machine,
        isStatus: emp.accountDetail.employee.isStatus,
        radioNumber: emp.pttNo,
        seeUserActivity: emp.accountDetail.employee.checkOthersOnlineStatus,
        isActive: emp.isActive,
        accountDetail: emp.accountDetail,
        createdAtDate:
          emp.createdAtDate && dayjs(emp.createdAtDate).format("YYYY/MM/DD"),
        appLastSeenDateTime:
          emp.appLastSeenDateTime && formatDate(emp.appLastSeenDateTime),
        appLoginDateTime:
          emp.appLoginDateTime && formatDate(emp.appLoginDateTime, true),
        appLogoutDateTime:
          emp.appLogoutDateTime && formatDate(emp.appLogoutDateTime, true),
        appVersion: emp.appVersion,
        viewUserActivity:
          emp.accountDetail.employee.checkOthersOnlineStatus || false,
      };
      setLoading(false);
      setUserDetails(response);
      await dispatch(getEmployee(emp));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
        },
      };
      const response = await api.get("devices/list", params);
      setLoading(false);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        let today = data?.todayDate || dayjs().format("YYYY-MM-DD");
        let isValid = false;
        const formattedData = data.Items.map((item) => {
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            if (!futureDate) {
              isValid =
                dayjs(today).isSameOrBefore(item.endDate) &&
                dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                item.name = item.name + " - 期限切れ";
              }
            }
          }
          return {
            id: item.id,
            value: item.id,
            label: item.name,
          };
        });
        setDeviceList(formattedData);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchOrg = async () => {
    setLoading(true);
    try {
      let { data: projectionList } = await api.post(
        "organizations/projection",
        {}
      );
      await fetchData(projectionList.data.Items);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  function findName(orgId, projectionList) {
    let orgName = projectionList.find((el) => el.id == orgId);
    return orgName?.name || "";
  }
  function reset() {
    setUserDetails({});
  }

  async function passwordReset() {
    toast.dismiss();
    setLoading(true);
    setTouched(() => ({
      ...touched,
      confirmPassword: true,
      password: true,
    }));

    const formValues = { password, confirmPassword };
    await validateHandler(schema, formValues, setErrors);

    if (password !== confirmPassword) {
      setLoading(false);
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: intl.password_not_matched,
      }));
      setTouched(() => ({
        ...touched,
        confirmPassword: true,
        password: true,
      }));
      return;
    }

    if (
      (errors &&
        Object.keys(errors)?.length &&
        Object.keys(errors)?.length > 0) ||
      !password ||
      !confirmPassword
    ) {
      setLoading(false);
      return;
    }

    try {
      const response = await updateEmployee({
        id: Employee.id,
        type: "resetPassword",
        data: {
          password: password,
          confirmPassword: confirmPassword,
        },
      });

      setLoading(false);
      if (response?.data?.status?.code == 200) {
        toast(intl.password_updated, successToastSettings);
      }
    } catch (error) {
      setLoading(false);
      toast(
        error.response?.data?.status?.message ?? error.message,
        errorToastSettings
      );
    } finally {
      setPassword(null);
      setConfirmPassword(null);
      setExportModal(false);
      setErrors(null);
      setTouched({});
    }
  }

  useEffect(() => {
    Admin ? fetchOrg() : fetchData([]);
    fetchDevices();
  }, [isModalOpen]);

  const handelImport = async (file) => {
    let files;

    // Helper function to convert and upload the file
    const convertAndUpload = async (uploadFunction) => {
      const res = await convertBase64(file);
      files = res.split(",")[1];
      // let ids = selectedRows.map((el) => el.id);
      const payload = { file: files, operation: "dynamic" };

      uploadFunction(payload);
    };

    // If activeButton is "employee", upload using uploadCsvFile
    await convertAndUpload(uploadCsvFile);
  };

  async function uploadCsvFile(payload) {
    try {
      setLoading(true);
      payload.channel =
        new Date().getTime() + "id" + organizationIdForChannel + "csvUpload";
      // setCsvUploadInitiated(() => payload.channel);
      // setCurrentAPI("employees/import");
      let result = await api.post("employees/import", payload);
      if (result.data.status.code == code.OK) {
        toast(intl.user_imported_successfully, successToastSettings);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      // subscriptionTrack.unsubscribe();
      toast(intl.user_import_failed, errorToastSettings);
    }
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

  function exportIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_5219_7792)">
          <path
            d="M6.30775 19.5C5.80258 19.5 5.375 19.325 5.025 18.975C4.675 18.625 4.5 18.1974 4.5 17.6922V15.7307C4.5 15.5179 4.57183 15.3397 4.7155 15.1962C4.859 15.0525 5.03717 14.9807 5.25 14.9807C5.46283 14.9807 5.641 15.0525 5.7845 15.1962C5.92817 15.3397 6 15.5179 6 15.7307V17.6922C6 17.7692 6.03208 17.8397 6.09625 17.9037C6.16025 17.9679 6.23075 18 6.30775 18H17.6923C17.7692 18 17.8398 17.9679 17.9038 17.9037C17.9679 17.8397 18 17.7692 18 17.6922V15.7307C18 15.5179 18.0718 15.3397 18.2155 15.1962C18.359 15.0525 18.5372 14.9807 18.75 14.9807C18.9628 14.9807 19.141 15.0525 19.2845 15.1962C19.4282 15.3397 19.5 15.5179 19.5 15.7307V17.6922C19.5 18.1974 19.325 18.625 18.975 18.975C18.625 19.325 18.1974 19.5 17.6923 19.5H6.30775ZM11.25 7.38845L9.327 9.31145C9.17817 9.46012 9.00158 9.53354 8.79725 9.5317C8.59275 9.5297 8.41292 9.45112 8.25775 9.29595C8.11292 9.14095 8.03792 8.96537 8.03275 8.7692C8.02758 8.57304 8.10258 8.39737 8.25775 8.2422L11.3672 5.1327C11.4609 5.03904 11.5597 4.97304 11.6635 4.9347C11.7673 4.8962 11.8795 4.87695 12 4.87695C12.1205 4.87695 12.2327 4.8962 12.3365 4.9347C12.4403 4.97304 12.5391 5.03904 12.6328 5.1327L15.7423 8.2422C15.8909 8.39087 15.9643 8.56495 15.9625 8.76445C15.9605 8.96379 15.8871 9.14095 15.7423 9.29595C15.5871 9.45112 15.4089 9.53129 15.2078 9.53645C15.0064 9.54162 14.8282 9.46662 14.673 9.31145L12.75 7.38845V15.0385C12.75 15.2513 12.6782 15.4295 12.5345 15.573C12.391 15.7166 12.2128 15.7885 12 15.7885C11.7872 15.7885 11.609 15.7166 11.4655 15.573C11.3218 15.4295 11.25 15.2513 11.25 15.0385V7.38845Z"
            fill="#19388B"
          />
        </g>
        <defs>
          <clipPath id="clip0_5219_7792">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }

  function editIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className=""
      >
        <g clipPath="url(#clip0_5185_3856)">
          <path
            d="M5 19H6.2615L16.498 8.7635L15.2365 7.502L5 17.7385V19ZM4.404 20.5C4.14783 20.5 3.93317 20.4133 3.76 20.24C3.58667 20.0668 3.5 19.8522 3.5 19.596V17.8635C3.5 17.6197 3.54683 17.3873 3.6405 17.1663C3.734 16.9453 3.86283 16.7527 4.027 16.5885L16.6905 3.93075C16.8417 3.79342 17.0086 3.68733 17.1913 3.6125C17.3741 3.5375 17.5658 3.5 17.7663 3.5C17.9668 3.5 18.1609 3.53558 18.3488 3.60675C18.5368 3.67792 18.7032 3.79108 18.848 3.94625L20.0693 5.18275C20.2244 5.32758 20.335 5.49425 20.401 5.68275C20.467 5.87125 20.5 6.05975 20.5 6.24825C20.5 6.44942 20.4657 6.64133 20.397 6.824C20.3283 7.00683 20.2191 7.17383 20.0693 7.325L7.4115 19.973C7.24733 20.1372 7.05475 20.266 6.83375 20.3595C6.61275 20.4532 6.38033 20.5 6.1365 20.5H4.404ZM15.8562 8.14375L15.2365 7.502L16.498 8.7635L15.8562 8.14375Z"
            fill="#19388B"
          />
        </g>
        <defs>
          <clipPath id="clip0_5185_3856">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }

  function deviceName(myId) {
    const matchingOption = deviceList.find(
      (dropDownOption) => dropDownOption.value === myId
    );
    return matchingOption ? matchingOption.label : "";
  }
  const DataSection = ({ label, value }) => (
    <div className="mb-4">
      {/* Apply mb-16px as 4 is equivalent to 16px */}
      <div className="text-sm font-normal text-[#595959]">{label}</div>
      <div className="text-sm dark:text-black font-semibold">{value}</div>
    </div>
  );
  return (
    <>
      {loading && <LoaderOverlay />}

      <div className="bg-white shadow-lg flex flex-col md:flex-row p-[24px]">
        <div className="flex flex-row w-full justify-end">
        <IconOutlineBtn
          text={intl.help_settings_addition_modal_edit}
          textColor={"text-customBlue"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5"}
          px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
          icon={() => editIcon()}
          borderColor={"bg-white"}
          onClick={() => {
            setIsModalOpen(true);
          }}
        />

        </div>
        {/* Left Column */}
        <div className="flex flex-col w-full ">
          <DataSection
            label={intl.login_email_placeholder}
            value={userDetails?.userId || "-"}
          />
          <DataSection
            label={intl.user_name}
            value={userDetails?.userName || "-"}
          />
          <DataSection
            label={intl.furigana}
            value={userDetails?.furigana || "-"}
          />
          <DataSection
            label={intl.company_list_company_radioNumber}
            value={userDetails?.radioNumber || "-"}
          />

          <DataSection
            label={intl.form_component_company_name_label}
            value={userDetails?.companyName || "-"}
          />
          <DataSection
            label={intl.machineName}
            value={deviceName(userDetails?.device?.id) || "-"}
          />

          <DataSection
            label={intl.user_add_specify_label}
            value={userDetails?.designation || "-"}
          />
          <DataSection
            label={intl.user_email_id_label}
            value={userDetails?.email || "-"}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col w-full ">
          <DataSection
            label={intl.form_component_status}
            value={userDetails?.isActive ? "ON" : "OFF"}
          />
          {/* <DataSection
            label={intl.user_add_telephone_number_label}
            value={userDetails?.phone || "-"}
          /> */}
          <DataSection
            label={intl.user_registration_date_time}
            value={userDetails?.createdAtDate || "-"}
          />
          <DataSection
            label={intl.user_last_online_date_time}
            value={userDetails?.appLastSeenDateTime || "-"}
          />
          <DataSection
            label={intl.usage_start_date}
            value={userDetails?.appLoginDateTime || "-"}
          />
          <DataSection
            label={intl.usage_suspension_date}
            value={userDetails?.appLogoutDateTime || "-"}
          />
          <DataSection
            label={intl.user_version}
            value={userDetails?.appVersion || "-"}
          />

          <DataSection
            label={intl.user_is_see_user_activity}
            value={userDetails?.seeUserActivity ? "ON" : "OFF"}
          />
        </div>
      </div>
      <div className="flex justify-end mb-4  space-x-4">
        <IconOutlineBtn
          text={intl.company_list_company_import}
          textColor={"text-customBlue "}
          borderColor={"border-customBlue bg-white"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5  "}
          px={"xl:px-[32px] md:px-[33.5px] px-[33.5px]"}
          icon={() => importIcon()}
          onClick={async () => {
            setImportModal(false);
            await importHandler();
          }}
        />
        <IconOutlineBtn
          text={intl.company_list_company_export_title}
          textColor={"text-customBlue"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5"}
          px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
          icon={() => exportIcon()}
          borderColor={"border-customBlue bg-white"}
          onClick={() => {
            setExportModal(true);
          }}
        />
     
      </div>

      {isModalOpen && (
        <AntModal
          open={isModalOpen}
          footer={null}
          onCancel={handleCloseModal}
          centered
          className="my-[70px]"
        >
          <div className="flex flex-col">
            <UserEdit
              setIsModalOpen={setIsModalOpen}
              setComCreated={setComCreated}
            />
          </div>
        </AntModal>
      )}
      {importModal && (
        <ImportUserModal
          modelToggle={importModal}
          onCloseHandler={() => {
            setImportModal(false);
            setCsvFileName("");
            setFileNameError("");
          }}
          onClickImport={handelImport}
        />
      )}
      {exportModal && (
        <AntModal
          width={385}
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-[20px] text-center">
              {intl.company_list_company_export_title}
            </div>
          }
          open={exportModal}
          onCancel={() => {
            setExportModal(false);
            setCsvFileName("");
            setFileNameError("");
          }}
          footer={getExportModalFooter}
          centered={true}
        >
          <div className="flex flex-col">
            <div className="flex-grow">
              <form className="grid grid-cols-1 gap-y-3 px-[40px]">
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"id"}
                    placeholder={intl.user_history_settings_file_name}
                    borderRound="rounded"
                    padding="p-[8px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#E7E7E9]"
                    bg="bg-white"
                    additionalClass="block w-full  h-[40px] text-base  "
                    label={intl.user_history_settings_file_name}
                    labelColor="#7B7B7B"
                    id={"id"}
                    isRequired={true}
                    labelClass={"float-left"}
                    onChange={(event) => {
                      setCsvFileName(event.target.value);
                    }}
                  />
                  {fileNameError && (
                    <div className="validation-font text-sm text-[red] text-left">
                      {fileNameError}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <DropdownMedium
                    borderRound={"rounded"}
                    padding={" p-[8px]"}
                    options={[
                      { id: 1, value: "1", label: "CSV" },
                      { id: 2, value: "2", label: "QR code" },
                    ]}
                    keys={"value"} // From options array
                    optionLabel={"label"} // From options array
                    border={"border border-[#E7E7E9]"}
                    value={exportType}
                    focus={
                      "focus:outline-none focus:ring-2 focus:ring-customBlue"
                    }
                    bg={"bg-white"}
                    text={"text-[16px] placeholder:text-[16px]"}
                    additionalClass={"block w-full  h-[40px]"}
                    id={"Id"}
                    labelColor={"#7B7B7B"}
                    label={"ファイルタイプ"}
                    disabled={false}
                    isRequired={true}
                    defaultSelectNoOption
                    labelClass={"float-left"}
                    dropIcon={"70%"}
                    onChange={(val) => {
                      setExportType(val);
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </AntModal>
      )}
      <a
        id={"linkCsv"}
        ref={CSVDownloadRef}
        href={downloadCsvLink}
        {...(shouldOpenInNewTab && { target: "_blank" })}
        download
        key={downloadCsvLink}
      ></a>
    </>
  );
}
