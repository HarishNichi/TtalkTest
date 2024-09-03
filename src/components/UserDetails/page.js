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

// Yup schema to validate the form
const schema = Yup.object().shape({
  password: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_PATTERN.regex, PASSWORD_PATTERN.message),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "パスワードが一致しません")
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
        setFileNameError("ファイル名は必須です。");
        return;
      }
      if (!csvFileNameRegex.test(csvFileName)) {
        setFileNameError("ファイル名を確認してください。");
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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast("ファイルのエクスポートに失敗しました", errorToastSettings);
    }
  }

  function getExportModalFooter() {
    return (
      <IconLeftBtn
        text={"エクスポート"}
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
    );
  }
  useEffect(() => {
    /* eslint-disable no-undef*/
    let hasMap = new Set();
    if (!csvUploadInitiated) {
      setLoading(false);
      return;
    }
    toast.dismiss();
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];

    const subscription = gen.subscribe(csvUploadInitiated, ({ data }) => {
      if (!hasMap.has(data.token)) {
        hasMap.add(data.token);
        setLoading(true);
        let dataReceived = JSON.parse(data);
        toast.dismiss();

        if (dataReceived?.rowsInserted) {
          dataReceived.rowsInserted =
            (dataReceived?.rowsInserted &&
              JSON.parse(dataReceived?.rowsInserted)) ||
            0;
          scount = scount + dataReceived?.rowsInserted;
        }
        if (dataReceived?.rowsFailed) {
          dataReceived.rowsFailed =
            dataReceived?.rowsFailed && JSON.parse(dataReceived?.rowsFailed);
          ecount = ecount + dataReceived?.rowsFailed;
        }

        // get failed index
        failedRowIndexes = [...failedRowIndexes, ...dataReceived.failures];

        if (dataReceived?.currentChunk == dataReceived?.totalChunks) {
          setTimeout(async () => {
            setImportModal(() => !importModal);
            subscription.unsubscribe();
            if (ecount == 0 && scount > 0) {
              toast("正常にインポートされました。", successToastSettings);
              Admin ? fetchOrg() : withDeviceDetails([]);
            }

            if (ecount > 0) {
              toast(
                `${ecount} 行のデータインポートに失敗しました`,
                errorToastSettings
              );
              try {
                let csvLink = await api.post(currentAPI, {
                  failures: failedRowIndexes,
                });
                setDownloadCsvLink(csvLink.data.data.failureFile);
              } finally {
                Admin ? fetchOrg() : withDeviceDetails([]);
              }
            }
          }, 1500);
          setLoading(false);
          setCsvUploadInitiated(() => null);
          setCurrentAPI(() => null);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);
  const handelImport = async (file) => {
    let files;

    // Helper function to convert and upload the file
    const convertAndUpload = async (uploadFunction) => {
      const res = await convertBase64(file);
      files = res.split(",")[1];
      let ids = selectedRows.map((el) => el.id);
      const payload = { file: files, operation: "dynamic" };

      if (activeButton === "employee") {
        payload.operation = "dynamic";
      }

      if (activeButton === "bulk") {
        payload.ids = ids;
      }

      if (activeButton === "bulk" && option === "settings") {
        delete payload.operation;
      }

      uploadFunction(payload);
    };

    if (activeButton == "employee") {
      // If activeButton is "employee", upload using uploadCsvFile
      await convertAndUpload(uploadCsvFile);
    } else if (activeButton == "bulk") {
      if (selectedRows.length <= 0) {
        // Display an error toast if no rows are selected
        toast("ユーザーを選択してください。", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          type: "error",
        });
        setImportModal(false);
        return;
      }
      const uploadFunctions = {
        settings: uploadSettingCsvFile,
        contacts: uploadContactCsvFile,
        groups: uploadGroupCsvFile,
      };
      const selectedUploadFunction = uploadFunctions[option];
      if (selectedUploadFunction) {
        // If option is valid, upload using the corresponding function
        await convertAndUpload(selectedUploadFunction);
      }
    }
  };
  useEffect(() => {
    /* eslint-disable no-undef*/
    let hasMap = new Set();
    if (!csvUploadInitiated) {
      setLoading(false);
      return;
    }
    let scount = 0;
    let ecount = 0;
    let failedRowIndexes = [];
    const subscription = gen.subscribe(csvUploadInitiated, async ({ data }) => {
      if (!hasMap.has(data.token)) {
        hasMap.add(data.token);
        setLoading(true);
        let dataReceived = JSON.parse(data);
        toast.dismiss();
        if (dataReceived?.rowsInserted) {
          dataReceived.rowsInserted =
            dataReceived?.rowsInserted &&
            JSON.parse(dataReceived?.rowsInserted);
          scount = scount + dataReceived?.rowsInserted;
        }

        if (dataReceived?.rowsFailed) {
          dataReceived.rowsFailed =
            dataReceived?.rowsFailed && JSON.parse(dataReceived?.rowsFailed);
          ecount = ecount + dataReceived?.rowsFailed;
        }

        // get failed index
        failedRowIndexes = [...failedRowIndexes, ...dataReceived.failures];
        // finished loop
        if (dataReceived?.currentChunk == dataReceived?.totalChunks) {
          setFileName("");
          setFile(null);

          if (ecount == 0 && scount > 0) {
            toast("正常にインポートされました。", successToastSettings);
            subscription.unsubscribe();
            setImportModal(() => !importModal);
            fetchData();
          }
          if (ecount > 0) {
            try {
              setLoading(true);
              let csvLink = await api.post("organizations/import", {
                failures: failedRowIndexes,
              });
              setDownloadCsvLink(csvLink.data.data.failureFile);
            } finally {
              toast(
                `${ecount} 行のデータインポートに失敗しました`,
                errorToastSettings
              );
              subscription.unsubscribe();
              setImportModal(() => !importModal);
              fetchData();
              setLoading(false);
            }
          }
          setLoading(false);
          setCsvUploadInitiated(() => null);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);
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

  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const UserData = useAppSelector((state) => state.userReducer.user);
  let Admin = false;
  let orgName;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgName = User.name;
  }

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
        confirmPassword: "パスワードが一致しません",
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
  }, []);
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
        className="mr-2"
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
    const matchingOption = deviceList.find(dropDownOption => dropDownOption.value === myId);
    return matchingOption? matchingOption.label : '';
  }
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
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
        <IconOutlineBtn
          text={intl.help_settings_addition_modal_edit}
          textColor={"text-customBlue"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5"}
          px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
          icon={() => editIcon()}
          borderColor={"border-customBlue bg-white"}
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </div>
      <div className="bg-white shadow-lg flex flex-col md:flex-row">
        <div className="flex flex-col p-[16px] pr-0  w-full space-y-2 mt-[2vw]">
          <div className="text-sm font-normal">端末名</div>
          <div className="text-sm font-semibold">
            {deviceName(userDetails?.device?.id) || "-"}
          </div>

          <div className="text-sm font-normal">ユーザーID</div>
          <div className="text-sm font-semibold">
            {userDetails?.userId || "-"}
          </div>

          <div className="text-sm font-normal mt-4">無線番号</div>
          <div className="text-sm font-semibold">
            {userDetails?.radioNumber || "-"}
          </div>

          <div className="text-sm font-normal">ユーザー名</div>
          <div className="text-sm font-semibold">
            {userDetails?.userName || "-"}
          </div>

          <div className="text-sm font-normal mt-4">ふりがな</div>
          <div className="text-sm font-semibold">
            {userDetails?.furigana || "-"}
          </div>

          <div className="text-sm font-normal mt-4">会社名</div>
          <div className="text-sm font-semibold">
            {userDetails?.companyName || "-"}
          </div>

          <div className="text-sm font-normal mt-4">指定</div>
          <div className="text-sm font-semibold">
            {userDetails?.designation || "-"}
          </div>

          <div className="text-sm font-normal mt-4">メールアドレス</div>
          <div className="text-sm font-semibold">
            {userDetails?.email || "-"}
          </div>
        </div>

        <div className="flex flex-col w-full space-y-2 p-[16px] pl-0 mt-[2vw] mb-[2vw]">
          <div className="text-sm font-normal">電話番号</div>
          <div className="text-sm font-semibold">
            {userDetails?.phone || "-"}
          </div>

          <div className="text-sm font-normal mt-4">登録日時</div>
          <div className="text-sm font-semibold">
            {userDetails?.createdAtDate || "-"}
          </div>

          <div className="text-sm font-normal mt-4">最終オンライン日時</div>
          <div className="text-sm font-semibold">
            {userDetails?.appLastSeenDateTime || "-"}
          </div>

          <div className="text-sm font-normal mt-4">利用開始日</div>
          <div className="text-sm font-semibold">
            {userDetails?.appLoginDateTime || "-"}
          </div>

          <div className="text-sm font-normal mt-4">利用停止日</div>
          <div className="text-sm font-semibold">
            {userDetails?.appLogoutDateTime || "-"}
          </div>

          <div className="text-sm font-normal mt-4">バージョン</div>
          <div className="text-sm font-semibold">
            {userDetails?.appVersion || "-"}
          </div>

          <div className="text-sm font-normal mt-4">ステータス</div>
          <div className="text-sm font-semibold">
            {userDetails?.isActive ? "ON" : "OFF"}
          </div>

          {/* <div className="text-sm font-normal mt-4">
            ユーザーのアクティビティを見る権限
          </div>
          <div className="text-sm font-semibold">
            {userDetails?.viewUserActivity ? "ON" : "OFF"}
          </div> */}

          <div className="text-sm font-normal mt-4">
            ユーザーのアクティビティを見る権限
          </div>
          <div className="text-sm font-semibold">
            {userDetails?.seeUserActivity ? "ON" : "OFF"}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AntModal open={isModalOpen} footer={null} onCancel={handleCloseModal}>
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
          onCloseHandler={setImportModal}
          file={file}
          setFile={setFile}
          fileName={fileName}
          setFileName={setFileName}
          fileValidationError={fileValidationError}
          setFileValidationError={setFileValidationError}
          operation="dynamic"
          uploadCsvFile={(payload) => uploadCsvFile(payload)}
          sampleLink={sampleLinks().companyImport}
        />
      )}
      {exportModal && (
        <Modal
          height="500px"
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text={intl.company_list_company_export_title}
          onCloseHandler={() => {
            setFileNameError("");
            setExportModal(false);
          }}
          contentPaddingTop="pt-1"
          contentPadding="px-0"
          modalFooter={getExportModalFooter}
        >
          <div className="flex flex-col">
            <div className="flex-grow">
              <form className="grid grid-cols-1 gap-y-3">
                <div className="flex flex-col">
                  <TextPlain
                    type="text"
                    for={"id"}
                    placeholder={"ファイル名"}
                    borderRound="rounded-xl"
                    padding="p-[10px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-gray-300"
                    bg="bg-white"
                    additionalClass="block w-full pl-5 text-base pr-[30px] "
                    label={"ファイル名"}
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
                    borderRound={"rounded-xl"}
                    padding={"pt-[12px] pb-[12px] pr-[120px]"}
                    options={[
                      { id: 1, value: "1", label: "CSV" },
                      { id: 2, value: "2", label: "QR code" },
                    ]}
                    keys={"value"} // From options array
                    optionLabel={"label"} // From options array
                    border={"border border-gray-300"}
                    value={exportType}
                    focus={
                      "focus:outline-none focus:ring-2 focus:ring-customBlue"
                    }
                    bg={"bg-white"}
                    text={"text-sm"}
                    additionalClass={"block w-full pl-5"}
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
        </Modal>
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
