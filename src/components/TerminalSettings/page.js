"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Layout/breadcrumb";
import {
  userSubSectionLinks,
  maxLimit,
  code,
  csvFileNameRegex,
  fileName,
  sampleLinks,
} from "@/utils/constant";
import { Button, Tabs } from "antd";
import Group from "@/components/Groups/page";
import employee from "@/redux/features/employee";
import UserDetails from "@/components/UserDetails/page";
import Contact from "@/components/Contacts/page";
import * as Yup from "yup";
import { Modal as AntModal } from "antd";
import ViewLog from "@/components/Logs/page";
import Other from "@/components/Other/page";
import IconOutlineBtn from "../Button/iconOutlineBtn";
import intl from "@/utils/locales/jp/jp.json";
import { GearIcon } from "../Icons/gearIcon";
import EditIcon from "../Icons/editIcon";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import {
  updateEmployee,
  fetchEmpData,
  updateBulkEmployee,
} from "@/validation/helperFunction";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";
import LoaderOverlay from "../Loader/loadOverLay";
import ActionButton from "@/app/dashboard/components/actionButton";
import ToggleBoxMediumRevamp from "@/components/Input/toggleBoxMediumRevamp";
import TitleUserCard from "@/app/dashboard/components/titleUserCard";
import ToggleBoxMedium from "../Input/toggleBoxMedium";
import DynamicLabel from "../Label/dynamicLabel";
import Progress from "../Input/progress";
import DropdownMedium from "../Input/dropdownMedium";
import Modal from "@/components/Modal/modal";
import ImportModal from "@/components/ImportModal/importModal";

import { validateHandler } from "@/validation/helperFunction";
import TextPlain from "../Input/textPlain";
import Medium from "../Input/medium";
import api from "@/utils/api";
import { HiSearch } from "react-icons/hi";
import { exportPopup, importPopup } from "@/redux/features/pttBarSlice";
import IconLeftBtn from "../Button/iconLeftBtn";
import Amplify from "@aws-amplify/core";
import * as gen from "@/generated";
Amplify.configure(gen.config);

export default function TerminalSettings({ isModal, selectedRows }) {
  const [loading, setLoading] = useState(false);
  const [subscriptionTrack, setSubscriptionTrack] = useState(null);
  const schema = Yup.object().shape({
    recordedFileStorageLocation: Yup.string().matches(
      /^(\/[0-9a-zA-Z]+)*\/?$/,
      intl.path_is_invalid
    ),
    recordedFileSize: Yup.number()
      .required(intl.validation_required)
      .max(1024, intl.recording_cannot_exceed)
      .typeError(intl.file_size_message),
  });
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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
    userState:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk?.userState,
    goOffline:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk?.goOffline,
    backgroundStart:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk
        ?.backgroundStart,
    pttNotificationVolume:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.pttNotificationVolume || 0,
    notificationVolume:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.notificationVolume,
    notificationSound:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.pttNotificationSound,
    replyTone:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound?.replyTone,
    toneRepeatSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound?.repeatSetting,
    vibrateOnRequestReceived:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.vibrateReplyRequestReceived,
    vibrationOnPtt:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.vibrationReceivingPtt,
    networkFailure:
      EmployeeDetails?.accountDetail?.employee?.settings?.networkFailure
        ?.failureIndication || "continuousAlarm",
    callRejection:
      EmployeeDetails?.accountDetail?.employee?.settings?.callRejectionSettings
        ?.callRejection,
    boosterDuration:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttBoaster
        ?.durations || "1sec",

    mobileStorage:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.storages || "internal",
    recordedFileSize:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.totalStorageSizeLimit || "0",
    recordedFileStorageLocation:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.paths || "",
    quality:
      EmployeeDetails?.accountDetail?.employee?.settings?.qualitySettings
        ?.quality || "highQuality",
    simultaneousInterpretation:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.simultaneousInterpretation,
    isTranscribe:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.isTranscribe,

    isSOS:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings?.isSOS,
    locationInformation:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.locationInformation,
    sosScheduledTime:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.sosScheduledTime || "5sec",

    isRecordingSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.isRecordingSettings,
  };
  const [progressBarPtt, setProgressBarPtt] = useState(
    userInfo.pttNotificationVolume
  );
  const [progressBarNotification, setProgressBarNotification] = useState(
    userInfo.notificationVolume
  );
  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);
  // const [selectedRejection, setSelectedRejection] = useState(userInfo);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState(null);
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [exportModalContact, setExportModalContact] = useState(false);
  const exportIsOn = useAppSelector((state) => state.pttBarReducer.exportIsOn);
  const [csvFileName, setCsvFileName] = useState("");
  const [fileNameError, setFileNameError] = useState(null);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const importIsOn = useAppSelector((state) => state.pttBarReducer.importIsOn);
  const [fileValidationError, setFileValidationError] = useState(null);
  const [csvUploadInitiated, setCsvUploadInitiated] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  const CSVDownloadRef = useRef("");

  useEffect(() => {
    downloadCsvLink && CSVDownloadRef.current.click();
  }, [downloadCsvLink]);

  useEffect(() => {
    setUserDetailsInfo(userInfo);
  }, []);

  async function updateEmployeeSettings() {
    // eslint-disable-next-line no-console
    console.log(userDetailsInfo, userInfo);
    let payload = {
      id: Employee.id,
      type: "",
      data: {
        quality: userDetailsInfo.quality,
        isRecordingSettings: userDetailsInfo.isRecordingSettings,
        totalStorageSizeLimit: userDetailsInfo.recordedFileSize
          ? String(userDetailsInfo.recordedFileSize)
          : "0",
        paths: userDetailsInfo.recordedFileStorageLocation,
        storages: userDetailsInfo.mobileStorage,
        durations: userDetailsInfo.boosterDuration,
        callRejection: userDetailsInfo.callRejection,
        failureIndication: userDetailsInfo.networkFailure,
        pttNotificationVolume:
          String(progressBarPtt) || userDetailsInfo.pttNotificationVolume,
        notificationVolume:
          String(progressBarNotification) || userDetailsInfo.notificationVolume,
        pttNotificationSound: userDetailsInfo.notificationSound,
        replyTone: userDetailsInfo.replyTone,
        repeatSetting: userDetailsInfo.toneRepeatSettings,
        vibrateReplyRequestReceived: userDetailsInfo.vibrateOnRequestReceived,
        vibrationReceivingPtt: userDetailsInfo.vibrationOnPtt,
        userState: userDetailsInfo.userState,
        goOffline: userDetailsInfo.goOffline,
        backgroundStart: userDetailsInfo.backgroundStart,
        deviceSettings: deviceSettings,
        isTranscribe: userDetailsInfo.isTranscribe,
        simultaneousInterpretation: userDetailsInfo.simultaneousInterpretation,
        isSOS: userDetailsInfo.isSOS,
        locationInformation: userDetailsInfo.locationInformation,
        sosScheduledTime: userDetailsInfo.sosScheduledTime,
      },
    };

    try {
      setLoading(true);
      const settingsUpdated = await updateEmployee(payload);
      if (settingsUpdated) {
        let id = Employee.id;
        let result = await fetchEmpData(id);
        result && dispatch(getEmployee(result));
        toast(intl.settings_update_success, successToastSettings);
        setConfirmModal(false);
      }
    } catch (err) {
      toast(intl.settings_update_failed, errorToastSettings);
      setConfirmModal(false);
    } finally {
      setLoading(false);
    }
  }
  async function updateBulkSettings() {
    // eslint-disable-next-line no-console
    console.log(userDetailsInfo, userInfo);
    let ids = selectedRows.map((el) => el.id);
    let payload = {
      id: ids,
      type: "",
      data: {
        quality: userDetailsInfo.quality,
        isRecordingSettings: userDetailsInfo.isRecordingSettings,
        totalStorageSizeLimit: userDetailsInfo.recordedFileSize
          ? String(userDetailsInfo.recordedFileSize)
          : "0",
        paths: userDetailsInfo.recordedFileStorageLocation,
        storages: userDetailsInfo.mobileStorage,
        durations: userDetailsInfo.boosterDuration,
        callRejection: userDetailsInfo.callRejection,
        failureIndication: userDetailsInfo.networkFailure,
        pttNotificationVolume:
          String(progressBarPtt) || userDetailsInfo.pttNotificationVolume,
        notificationVolume:
          String(progressBarNotification) || userDetailsInfo.notificationVolume,
        pttNotificationSound: userDetailsInfo.notificationSound,
        replyTone: userDetailsInfo.replyTone,
        repeatSetting: userDetailsInfo.toneRepeatSettings,
        vibrateReplyRequestReceived: userDetailsInfo.vibrateOnRequestReceived,
        vibrationReceivingPtt: userDetailsInfo.vibrationOnPtt,
        userState: userDetailsInfo.userState,
        goOffline: userDetailsInfo.goOffline,
        backgroundStart: userDetailsInfo.backgroundStart,
        deviceSettings: deviceSettings,
        isTranscribe: userDetailsInfo.isTranscribe,
        simultaneousInterpretation: userDetailsInfo.simultaneousInterpretation,
        isSOS: userDetailsInfo.isSOS,
        locationInformation: userDetailsInfo.locationInformation,
        sosScheduledTime: userDetailsInfo.sosScheduledTime,
      },
    };

    try {
      setLoading(true);
      const settingsUpdated = await updateBulkEmployee(payload);
      if (settingsUpdated) {
        toast(intl.settings_update_success, successToastSettings);
        setConfirmModal(false);
        setIsEditable(false);
      }
    } catch (err) {
      toast(intl.settings_update_failed, errorToastSettings);
      setConfirmModal(false);
    } finally {
      setLoading(false);
    }
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
    const subscription = gen.subscribe(csvUploadInitiated, async ({ data }) => {
      let dataReceived = JSON.parse(data);
      if (!hasMap.has(dataReceived.token)) {
        hasMap.add(dataReceived.token);
        setLoading(true);

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
          setFile(null);
          setFileName("");
          dispatch(importPopup(false));
          let result = await fetchEmpData(Employee.id);
          result && dispatch(getEmployee(result));

          setExportModal(false);
          if (ecount > 0) {
            try {
              setLoading(true);
              let csvLink = api.post("employees/import-settings", {
                failures: failedRowIndexes,
              });
              setDownloadCsvLink(csvLink.data.data.failureFile);
            } catch (err) {
              setLoading(false);
            } finally {
              toast(
                `${ecount} ${intl.user_failed_to_import}`,
                errorToastSettings
              );
              setLoading(false);
            }
          }
          if (ecount == 0 && scount > 0) {
            toast(intl.user_imported_successfully, successToastSettings);
          }
          subscription.unsubscribe();
          setLoading(false);
          setCsvUploadInitiated(() => null);
        }
      }
    });
    setSubscriptionTrack(subscription);
    return () => subscription.unsubscribe();
  }, [csvUploadInitiated]);

  async function uploadSettingCsvFile(payload) {
    try {
      setLoading(true);
      let channel = new Date().getTime() + "settingsCsvEmp";
      setCsvUploadInitiated(() => channel);
      let result = await api.post("employees/import-settings", {
        file: payload.file,
        ids: [Employee.id],
        channel,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast(intl.user_import_failed, errorToastSettings);
    }
  }

  async function exportCSVFile() {
    let data;
    toast.dismiss();
    if (!csvFileName) {
      setFileNameError(intl.contacts_file_name_required);
      return;
    }
    if (!csvFileNameRegex.test(csvFileName)) {
      setFileNameError(intl.user_check_file_name);
      return;
    }
    setFileNameError("");
    data = {
      filename: csvFileName + ".csv",
      ids: [Employee.id],
    };

    try {
      setLoading(true);
      let result = await api.post("/employees/export-settings", data);
      setDownloadCsvLink(result.data.data.data.path);
      dispatch(exportPopup(false));
      setCsvFileName("");
      setExportModal(false);
      toast(intl.groups_export_success, successToastSettings);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast(intl.contacts_export_failed, errorToastSettings);
    }
  }
  const fetchOtherData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          id: Admin ? EmployeeDetails?.organizationId : orgId,
        },
      };
      let { data } = await api.get("employees/get-organization", params);
      let org = data.data.Item;
      setLoading(false);
      let response = {
        isTranslate: org.accountDetail.organization.isTranslate,
        isTranscribe: org.accountDetail.organization.isTranscribe,
        sosLocation: org.accountDetail.organization.sosLocation,
      };
      setOrganizationsData(response);
    } catch (error) {
      setLoading(false);
    }
  };
  async function qualitySettingsUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "qualitySettings",
        data: {
          quality: userDetailsInfo.quality,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }
  async function updateVoiceRecordingSettings() {
    toast.dismiss();
    const formValues = {
      recordedFileStorageLocation: userDetailsInfo.recordedFileStorageLocation,
      recordedFileSize: userDetailsInfo.recordedFileSize,
    };
    setTouched(() => ({
      ...touched,
      ["recordedFileStorageLocation"]: true,
      ["recordedFileSize"]: true,
    }));
    await validateHandler(schema, formValues, setErrors);
    if (errors && Object.keys(errors).length > 0) {
      return;
    }
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "voiceRecording",
        data: {
          isRecordingSettings: userDetailsInfo.isRecordingSettings,
          totalStorageSizeLimit: userDetailsInfo.recordedFileSize
            ? String(userDetailsInfo.recordedFileSize)
            : "0",
          paths: userDetailsInfo.recordedFileStorageLocation,
          storages: userDetailsInfo.mobileStorage,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }
  useEffect(() => {
    const formValues = {
      recordedFileStorageLocation: userDetailsInfo.recordedFileStorageLocation,
      recordedFileSize: userDetailsInfo.recordedFileSize,
    };

    validateHandler(schema, formValues, setErrors);
  }, [
    userDetailsInfo.recordedFileStorageLocation,
    userDetailsInfo.recordedFileSize,
  ]);
  async function pttBoasterSettingsUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "pttBoaster",
        data: {
          durations: userDetailsInfo.boosterDuration,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }
  async function callRejectionUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "callRejectionSettings",
        data: {
          callRejection: selectedRejection,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }
  async function updateNetworkFailureSettings() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "networkFailure",
        data: {
          failureIndication: userDetailsInfo.networkFailure,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }
  async function updateSoundSettings() {
    toast.dismiss();
    setLoading(true);
    let payload = {
      id: Employee.id,
      type: "sound",
      data: {
        pttNotificationVolume:
          String(progressBarPtt) || userDetailsInfo.pttNotificationVolume,
        notificationVolume:
          String(progressBarNotification) || userDetailsInfo.notificationVolume,
        pttNotificationSound: userDetailsInfo.notificationSound,
        replyTone: userDetailsInfo.replyTone,
        repeatSetting: userDetailsInfo.toneRepeatSettings,
        vibrateReplyRequestReceived: userDetailsInfo.vibrateOnRequestReceived,
        vibrationReceivingPtt: userDetailsInfo.vibrationOnPtt,
      },
    };
    try {
      const settingsUpdated = await updateEmployee(payload);
      if (settingsUpdated) {
        let id = Employee.id;
        let result = await fetchEmpData(id);
        result && dispatch(getEmployee(result));
        toast(intl.settings_update_success, successToastSettings);
      }
    } catch (err) {
      toast(intl.settings_update_success, errorToastSettings);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setUserDetailsInfo(userInfo);
    setProgressBarPtt(userInfo.pttNotificationVolume);
    setProgressBarNotification(userInfo.notificationVolume);
  }

  async function pTalkUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "pTalk",
        data: {
          userState: userDetailsInfo.userState,
          goOffline: userDetailsInfo.goOffline,
          backgroundStart: userDetailsInfo.backgroundStart,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }
  const btnClass =
    "text-left bg-white shadow text-[#817E78] rounded-lg w-full py-3  px-3";
  const thirdSectionInput =
    "flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3";
  const [isModalOpen, setModal] = useState(false);
  const [isModalOpenGroup, setModalGroup] = useState(false);
  const defaultDeviceSettings = JSON.parse(
    JSON.stringify(
      EmployeeDetails?.accountDetail?.employee?.settings?.deviceSettings
    )
  );
  const [deviceSettings, setDeviceSettings] = useState(defaultDeviceSettings);
  const [pttButtonSettings, setPttButtonSettings] = useState(false);
  const [selectedButton, setSelectedButton] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [thirdSection, setThirdSection] = useState("");
  const [reRender, setReRender] = useState(1);
  const [contactSearchResults, setContactSearchResults] = useState([]);
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupListData, setGroupListData] = useState([]);
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [contactList, setContactData] = useState([]);
  const [history, setHistory] = useState("");
  const [organizationsData, setOrganizationsData] = useState(null);
  const auth = localStorage.getItem("accessToken");
  const [file, setFile] = useState(null);
  const isAuthenticated = auth || false;
  const [fileName, setFileName] = useState(null);
  let Admin = false;
  let orgId;
  const UserData = useAppSelector((state) => state.userReducer.user);
  useEffect(() => {
    fetchOtherData();
    // setUserDetailsInfo({});
  }, []);
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgId = User.id;
  }

  useEffect(() => {
    setDeviceSettings(defaultDeviceSettings);
    setPttButtonSettings(false);
    setSelectedButton("");
    setSelectedType("");
    setThirdSection("");
  }, []);

  useEffect(() => {
    setThirdSection("");
    setReRender(reRender + 1);
  }, [selectedType, selectedButton]);
  async function deviceSettingsUpdate() {
    setLoading(true);
    const isValid = deviceSettings.some((el) => {
      return el.type.some((typeEl) => {
        return (
          typeEl &&
          typeEl.value &&
          typeEl.value.optionName &&
          typeEl.value.type &&
          typeEl.value.value
        );
      });
    });
    if (!isValid) {
      toast(intl.please_fill_atleast_1, errorToastSettings);
      setLoading(false);
      return;
    }
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "deviceSettings",
        data: {
          deviceSettings: deviceSettings,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }

  function getModalFooter() {
    return (
      <>
        <div className="px-8 w-full">
          <button
            className="w-full bg-customBlue border border-[#e7e7e9] focus:outline-none font-medium rounded-lg px-4 py-2  mb-2 text-white"
            onClick={() => {
              let settings = deviceSettings.map((deviceSetting) => {
                if (selectedButton.name == deviceSetting.name) {
                  deviceSetting.type.map((typeEl) => {
                    if (typeEl.type == selectedType) {
                      typeEl.value = {
                        optionName: thirdSection,
                        type: "contact",
                        value: selectedContact,
                      };
                    }
                    return typeEl;
                  });
                }
                return deviceSetting;
              });
              setDeviceSettings(settings);
              setModal(false);
            }}
          >
            {intl.help_settings_addition_keep}
          </button>
        </div>
      </>
    );
  }

  function getModalFooterGroup() {
    return (
      <>
        <div className="px-8 w-full">
          <button
            className="w-full bg-customBlue border border-[#e7e7e9] focus:outline-none font-medium rounded-lg px-4 py-2  mb-2 text-white"
            onClick={() => {
              let settings = deviceSettings.map((deviceSetting) => {
                if (selectedButton.name == deviceSetting.name) {
                  deviceSetting.type.map((typeEl) => {
                    if (typeEl.type == selectedType) {
                      typeEl.value = {
                        optionName: thirdSection,
                        type: "group",
                        value: selectedGroup,
                      };
                    }
                    return typeEl;
                  });
                }
                return deviceSetting;
              });
              setDeviceSettings(settings);
              setModalGroup(false);
            }}
          >
            {intl.help_settings_addition_keep}
          </button>
        </div>
      </>
    );
  }

  function handleType(type, label) {
    setSelectedType(type);
    setDeviceSettings((prv) => {
      let updatedType = prv.map((el) => {
        if (el.name == selectedButton.name) {
          el.type.map((typeEl) => {
            if (typeEl.type == type) {
              typeEl.type = type;
              typeEl.label = label;
            }
            return typeEl;
          });
        }
        return el;
      });
      return updatedType;
    });

    let updatedType;
    deviceSettings.map((el) => {
      if (el.name == selectedButton.name) {
        el.type.map((typeEl) => {
          if (typeEl.type == type) {
            typeEl.type = type;
            typeEl.label = label;
            updatedType = typeEl.value.optionName;
          }
          return typeEl;
        });
      }
      return el;
    });

    setTimeout(() => {
      setThirdSection(() => updatedType);
    }, 100);
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
        },
      };
      let { data: response } = await api.get("groups/list", params);
      response = response.data.Items.map((group, index) => {
        return {
          key: index,
          id: group.groupId,
          value: group.groupId,
          label: group.name,
          name: group.name,
          userId: group.userId,
          groupId: group.groupId,
          contactsCount: group.contactsCount,
          pttNo: group.pttNo,
          disabled: false,
          standByGroup: group.standByGroup,
        };
      });

      setGroupListData(response);
      setGroupSearchResults(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
        },
      };
      const response = await api.get("contacts/list", params);
      setLoading(false);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedData = data.Items.map((item, index) => {
          return {
            label: item.name,
            id: item.contactId,
            value: item.contactId,
            pttNo: item.pttNo,
            isDeleted: item.isDeleted,
          };
        }).filter((el) => !el.isDeleted && el.pttNo != Employee.radioNumber);
        setContactData(formattedData);
        setContactSearchResults(formattedData);
      }
    } catch (error) {
      setLoading(false);
      toast(error.response?.data?.status.message, errorToastSettings);
    }
  };

  function searchContactOrGroup(inputValue, type = null) {
    if (type == "groupSearch") {
      if (inputValue) {
        const filteredResults = groupListData.filter((group) => {
          return group.id.toLowerCase().includes(inputValue.toLowerCase());
        });
        setGroupSearchResults(filteredResults);
      } else {
        setGroupSearchResults(groupListData);
      }
    }

    if (type == "contactSearch") {
      if (inputValue) {
        const filteredResults = contactList.filter((contact) => {
          return contact.pttNo.toLowerCase().includes(inputValue.toLowerCase());
        });
        setContactSearchResults(filteredResults);
      } else {
        setContactSearchResults(contactList);
      }
    }
  }
  function PttBtnHtml({ pttButtonSettings, index }) {
    let pttBtnTemp = pttButtonSettings
      ? selectedButton.type[index].value
      : selectedButton.type[index - 1].value;
    return (
      <>
        {pttBtnTemp.optionName == pttBtnTemp.value ? (
          <>
            <div>{pttBtnTemp.value}</div>
          </>
        ) : (
          <>
            <div>
              {pttBtnTemp.value
                ? `${pttBtnTemp.optionName} : ${pttBtnTemp.value}`
                : ""}
            </div>
          </>
        )}
      </>
    );
  }
  useEffect(() => {
    fetchData();
    fetchContacts();
  }, []);
  async function optionSettingsUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "optionSettings",
        data: {
          isTranscribe: userDetailsInfo.isTranscribe,
          simultaneousInterpretation:
            userDetailsInfo.simultaneousInterpretation,
          isSOS: userDetailsInfo.isSOS,
          locationInformation: userDetailsInfo.locationInformation,
          sosScheduledTime: userDetailsInfo.sosScheduledTime,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }
  return (
    <>
      {loading && <LoaderOverlay />}
      {!isModal && (
        <div className="flex justify-end mb-4  space-x-4">
          <IconOutlineBtn
            text={intl.company_list_company_export_title}
            textColor={"text-customBlue "}
            borderColor={"border-customBlue bg-white"}
            textBold={true}
            py={"xl:py-2.5 md:py-1.5 py-1.5  "}
            px={"xl:px-[32px] md:px-[33.5px] px-[33.5px]"}
            icon={() => exportIcon()}
            onClick={async () => {
              setExportModal(true);
            }}
          />
          <IconOutlineBtn
            text={intl.company_list_company_import}
            textColor={"text-customBlue"}
            textBold={true}
            py={"xl:py-2.5 md:py-1.5 py-1.5"}
            px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
            borderColor={"border-customBlue bg-white"}
            icon={() => importIcon()}
            onClick={async () => {
              setImportModal(() => true);
            }}
          />
          <IconOutlineBtn
            text={intl.user_change_history}
            textColor={"text-customBlue"}
            textBold={true}
            py={"xl:py-2.5 md:py-1.5 py-1.5"}
            px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
            borderColor={"border-customBlue bg-white"}
            icon={() => <GearIcon />}
            onClick={() => {
              router.push("./historySettings");
            }}
          />
          <IconOutlineBtn
            text={intl.help_settings_addition_modal_edit}
            textColor={"text-customBlue"}
            textBold={true}
            py={"xl:py-2.5 md:py-1.5 py-1.5"}
            px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
            borderColor={"border-customBlue bg-white"}
            icon={() => editIcon()}
            onClick={() => {
              setIsEditable(true);
              // updateEmployeeSettings();
            }}
          />
        </div>
      )}
      {isModal && (
        <div className="flex mt-[16px] ml-[16px] mb-[16px] ">
          <TitleUserCard title={intl.bulk_setting_change} />
        </div>
      )}
      <div className={`${isEditable}?'pointer-events-none'`}>
        <div className=" p-[16px] bg-white">
          <div className="flex flex-col md:flex-row  justify-between items-center space-y-4 md:space-y-0"></div>
          <div className="flex flex-col space-y-4 ">
            <TitleUserCard title={intl.user_ptalk_service_screen_label} />
          </div>

          <div className="flex flex-col md:flex-row" id="ptalk-service">
            <div className="flex flex-col w-full space-y-2    ">
              <div className="">
                <div>
                  <div className="  mb-[16px]">
                    <ToggleBoxMediumRevamp
                      isDisabled={!isEditable}
                      checked={!!userDetailsInfo.userState}
                      setToggle={(userState) => {
                        setUserDetailsInfo({
                          ...userDetailsInfo,
                          ...{
                            userState: userState,
                          },
                        });
                      }}
                      toggle={userDetailsInfo.userState}
                      id={"Id"}
                    >
                      <div className="text-[#434343]">{intl.ptalk_service}</div>
                    </ToggleBoxMediumRevamp>
                  </div>
                </div>
                <div className="mb-2">
                  <div className=" ">
                    <ToggleBoxMediumRevamp
                      isDisabled={!isEditable}
                      checked={!!userDetailsInfo.backgroundStart}
                      setToggle={(backgroundStart) => {
                        setUserDetailsInfo({
                          ...userDetailsInfo,
                          ...{
                            backgroundStart: backgroundStart,
                          },
                        });
                      }}
                      toggle={userDetailsInfo.backgroundStart}
                      label={intl.start_in_background}
                      id={"Id"}
                    >
                      <div className="text-[#434343]">
                        {intl.start_in_background}
                      </div>
                    </ToggleBoxMediumRevamp>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col  w-full pl-0 md:pl-4 space-y-2 mb-2 ">
              <ToggleBoxMediumRevamp
                isDisabled={!isEditable}
                checked={!!userDetailsInfo.goOffline}
                setToggle={(goOffline) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      goOffline: goOffline,
                    },
                  });
                }}
                toggle={userDetailsInfo.goOffline}
                label={intl.go_offline}
                id={"Id"}
              >
                <div className="text-[#434343]">{intl.forced_offline}</div>
              </ToggleBoxMediumRevamp>
            </div>
          </div>
        </div>

        <div className="mt-[16px] bg-white p-[16px]">
          <div className="flex">
            <TitleUserCard title={intl.user_sound_settings_screen_label} />
          </div>
          <div className="flex flex-col md:flex-row md:gap-x-4">
            <div className="w-full md:w-1/2">
              <div className="mb-4 2xl:mb-6">
                <DynamicLabel
                  text={intl.user_dial_pad_operation_volume}
                  textColor="#7B7B7B"
                  htmlFor="userId"
                />
                <div className="bg-input-white py-5  rounded-lg">
                  <Progress
                    disabled={!isEditable}
                    value={progressBarPtt}
                    setValue={setProgressBarPtt}
                    id="nv"
                  />
                </div>
              </div>
              <div className="mb-4 2xl:mb-6">
                <DynamicLabel
                  text={intl.user_dial_pad_operation_sound}
                  textColor="#7B7B7B"
                  htmlFor="userId"
                />

                <select
                  disabled={!isEditable}
                  className="rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 dark:text-black"
                  defaultValue={intl.dropdownmedium_select_label}
                  value={userDetailsInfo.notificationSound}
                  onChange={(evt) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ notificationSound: evt.target.value },
                    });
                  }}
                >
                  {[
                    {
                      id: 1,
                      value: "pttNotificationSound1",
                      label: intl.ptt_notification_sound_1,
                    },
                    {
                      id: 2,
                      value: "pttNotificationSound2",
                      label: intl.ptt_notification_sound_2,
                    },
                  ].map((dropDownOption, index) => (
                    <option
                      className="bg-white text-black rounded py-4"
                      id={`id-${index}`}
                      key={dropDownOption.value}
                      value={dropDownOption.value}
                    >
                      {dropDownOption.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 2xl:mb-6">
                <DynamicLabel
                  text={intl.user_repeated_request}
                  textColor="#7B7B7B"
                  htmlFor="user_sound_settings_tone_repeat"
                />

                <select
                  disabled={!isEditable}
                  className="rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 dark:text-black"
                  value={userDetailsInfo.toneRepeatSettings}
                  onChange={(evt) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ toneRepeatSettings: evt.target.value },
                    });
                  }}
                >
                  <option disabled value={""} selected className="py-4">
                    {intl.dropdownmedium_select_label}
                  </option>
                  {[
                    { id: 1, value: "1time", label: intl.only_once },
                    {
                      id: 2,
                      value: "1minuteInterval",
                      label: intl.one_minute_interval,
                    },
                    {
                      id: 3,
                      value: "5minuteInterval",
                      label: intl.five_minute_interval,
                    },
                    {
                      id: 4,
                      value: "30minuteInterval",
                      label: intl.thirty_minute_interval,
                    },
                  ].map((dropDownOption, index) => (
                    <option
                      className="bg-white text-black rounded py-4"
                      id={`id-${index}`}
                      key={dropDownOption.value}
                      value={dropDownOption.value}
                    >
                      {dropDownOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className=" hidden mb-4 2xl:mb-6">
                <DynamicLabel
                  text={intl.user_repeated_request}
                  textColor="#7B7B7B"
                  htmlFor="userId"
                />

                <select
                  disabled={!isEditable}
                  className="rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 dark:text-black"
                  id={"replyTone"}
                  defaultValue={intl.dropdownmedium_select_label}
                  value={userDetailsInfo.replyTone}
                  onChange={(evt) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ replyTone: evt.target.value },
                    });
                  }}
                >
                  {[
                    { id: 1, value: "1", label: "option 01" },
                    { id: 2, value: "2", label: "option 02" },
                    { id: 3, value: "3", label: "option 03" },
                    { id: 4, value: "4", label: "option 04" },
                  ].map((dropDownOption, index) => (
                    <option
                      className="bg-white text-black rounded py-4"
                      id={`id-${index}`}
                      key={dropDownOption.value}
                      value={dropDownOption.value}
                    >
                      {dropDownOption.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 2xl:mb-6">
                <DropdownMedium
                  isDisabled={!isEditable}
                  borderRound={"rounded-lg"}
                  padding={"py-2 pr-[120px]"}
                  options={[
                    {
                      id: 1,
                      value: "continuousAlarm",
                      label: intl.user_network_failure_alarm_option1,
                    },
                    { id: 2, value: "5times", label: intl.five_times },
                    { id: 3, value: "off", label: intl.off },
                  ]}
                  keys={"value"} // From options array
                  optionLabel={"label"} // From options array
                  border={"border border-gray-400"}
                  focus={
                    "focus:outline-none focus:ring-2 focus:ring-customBlue"
                  }
                  bg=""
                  text={"text-sm"}
                  additionalClass={"block w-full px-4"}
                  id={"networkFailure"}
                  labelColor={"#7B7B7B"}
                  label={intl.user_network_failure_alarm_screen_label}
                  value={userDetailsInfo.networkFailure}
                  onChange={(networkFailure) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ networkFailure: networkFailure },
                    });
                  }}
                />
              </div>
              <div className="mb-8">
                <DropdownMedium
                  isDisabled={!isEditable}
                  borderRound={"rounded-lg"}
                  padding={"py-2 pr-[120px]"}
                  options={[
                    {
                      id: 1,
                      value: "off",
                      label: intl.off,
                    },
                    {
                      id: 2,
                      value: "customGroupCallRejection",
                      label: intl.custom_group_call_rejection,
                    },
                    {
                      id: 3,
                      value: "cloudGroupCallRejection",
                      label: intl.rejecting_cloud_group_calls,
                    },
                    {
                      id: 4,
                      value: "individualCallRejection",
                      label: intl.rejecting_individual_calls,
                    },
                  ]}
                  keys={"value"} // From options array
                  optionLabel={"label"} // From options array
                  border={"border border-gray-400"}
                  focus={
                    "focus:outline-none focus:ring-2 focus:ring-customBlue"
                  }
                  bg=""
                  text={"text-sm"}
                  additionalClass={"block w-full px-4"}
                  id={"callRejection"}
                  labelColor={"#7B7B7B"}
                  label={intl.refusal_to_recieve}
                  value={userDetailsInfo.callRejection}
                  onChange={(callRejection) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ callRejection: callRejection },
                    });
                  }}
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col ">
              <div className="w-full md:mb-9 2xl:mb-32">
                <div className="mb-1 pl-0 md:pl-4 2xl:mb-4 3xl:mb-4">
                  <DynamicLabel
                    text={intl.user_sound_settings_notifcation_volume}
                    textColor="#7B7B7B"
                    htmlFor="userId"
                  />
                  <div className="bg-input-white py-5  rounded-lg">
                    <Progress
                      disabled={!isEditable}
                      value={progressBarNotification}
                      setValue={setProgressBarNotification}
                      id="notification"
                    />
                  </div>
                </div>
                <div className="mb-4 2xl:mb-6">
                  <div className="bg-white  md:pl-4 pl-0 rounded-lg ">
                    <ToggleBoxMedium
                      isDisabled={!isEditable}
                      toggle={userDetailsInfo.vibrateOnRequestReceived}
                      setToggle={(vibrateOnRequestReceived) => {
                        setUserDetailsInfo({
                          ...userDetailsInfo,
                          ...{
                            vibrateOnRequestReceived: vibrateOnRequestReceived,
                          },
                        });
                      }}
                      label={intl.user_ptalk_service_vibrate}
                      labelColor={"#7B7B7B"}
                      id={"Id"}
                      onColor={"#1E1E1E"}
                      onHandleColor={"#00ACFF"}
                      handleDiameter={16}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.6)"}
                      activeBoxShadow={"0px 0px 1px 10px rgba(0, 0, 0, 0.2)"}
                      height={10}
                      width={27}
                      additionalClass={""}
                      labelClass={
                        "text-[14px] font-medium text-gray-900 dark:text-gray-300"
                      }
                    />
                  </div>
                </div>
                <div className="mb-4 2xl:mb-6">
                  <div>
                    <div className="bg-white  md:pl-4 pl-0 rounded-lg">
                      <ToggleBoxMedium
                        isDisabled={!isEditable}
                        toggle={userDetailsInfo.vibrationOnPtt}
                        setToggle={(vibrationOnPtt) => {
                          setUserDetailsInfo({
                            ...userDetailsInfo,
                            ...{ vibrationOnPtt: vibrationOnPtt },
                          });
                        }}
                        label={
                          intl.user_sound_settings_vibration_when_receiving_on_ptt
                        }
                        labelColor={"#7B7B7B"}
                        id={"Id"}
                        onColor={"#1E1E1E"}
                        onHandleColor={"#00ACFF"}
                        handleDiameter={16}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.6)"}
                        activeBoxShadow={"0px 0px 1px 10px rgba(0, 0, 0, 0.2)"}
                        height={10}
                        width={27}
                        additionalClass={""}
                        labelClass={
                          "text-[14px] font-normal text-gray-900 dark:text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-6 md:pl-4 pl-0">
                  <DropdownMedium
                    isDisabled={!isEditable}
                    borderRound={"rounded-lg"}
                    padding={"py-2 pr-[120px]"}
                    options={[
                      { id: 1, value: "1sec", label: "1秒" },
                      { id: 2, value: "2sec", label: "2秒" },
                      { id: 3, value: "3sec", label: "3秒" },
                      { id: 4, value: "4sec", label: "4秒" },
                      { id: 5, value: "5sec", label: "5秒" },
                      { id: 6, value: "6sec", label: "6秒" },
                      { id: 7, value: "7sec", label: "7秒" },
                      { id: 8, value: "8sec", label: "8秒" },
                      { id: 9, value: "9sec", label: "9秒" },
                      { id: 10, value: "10sec", label: "10秒" },
                    ]}
                    keys={"value"} // From options array
                    optionLabel={"label"} // From options array
                    border={"border border-gray-400"}
                    focus={
                      "focus:outline-none focus:ring-2 focus:ring-customBlue"
                    }
                    bg=""
                    text={"text-[14px] font-normal"}
                    additionalClass={
                      "block w-full px-4 text-[14px] font-normal"
                    }
                    id={"boosterDuration"}
                    labelColor={"#7B7B7B"}
                    label={intl.ptt_booster}
                    value={userDetailsInfo.boosterDuration}
                    onChange={(boosterDuration) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{ boosterDuration: boosterDuration },
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[16px] bg-white p-[16px]">
          <div className="flex ">
            <TitleUserCard title={intl.user_voice_recording_screen_label} />
          </div>
          <div className="flex flex-col md:flex-row md:gap-x-4">
            <div className="w-full md:w-1/2">
              <div className="mb-4">
                <DropdownMedium
                  isDisabled={!isEditable}
                  borderRound={"rounded-lg"}
                  padding={"py-2.5 pr-[120px]"}
                  options={[
                    { id: 1, value: "highQuality", label: "高品質" },
                    { id: 2, value: "lowQuality", label: "標準品質" },
                  ]}
                  keys={"value"} // From options array
                  optionLabel={"label"} // From options array
                  border={"border border-gray-400"}
                  focus={
                    "focus:outline-none focus:ring-2 focus:ring-customBlue"
                  }
                  bg=""
                  text={"text-sm"}
                  additionalClass={"block w-full px-4 h-[40px]"}
                  id={"quality"}
                  labelColor={"#7B7B7B"}
                  label={intl.user_band_settings_quality_label}
                  value={userDetailsInfo.quality}
                  onChange={(quality) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ quality: quality },
                    });
                  }}
                />
              </div>

              <div className="mb-4 2xl:mb-6">
                <TextPlain
                  disabled={!isEditable}
                  type={"text"}
                  for={"recordedFileSize"}
                  placeholder={intl.user_voice_recording_storage_label}
                  padding={"p-[10px]"}
                  focus={
                    "focus:outline-none focus:ring-2  focus:ring-customBlue "
                  }
                  border={"border border-gray-400 rounded-lg"}
                  bg={"bg-white "}
                  additionalClass={
                    "flex w-full pl-5 text-base pr-[30px] h-[40px]"
                  }
                  label={intl.user_voice_recording_storage_label + "(MB)"}
                  labelColor={"#7B7B7B"}
                  id={"recordedFileSize"}
                  value={userDetailsInfo.recordedFileSize}
                  onChange={(event) => {
                    setTouched(() => ({
                      ...touched,
                      ["recordedFileSize"]: true,
                    }));
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ recordedFileSize: event.target.value },
                    });
                  }}
                />
                {touched &&
                  errors &&
                  errors.recordedFileSize &&
                  touched.recordedFileSize && (
                    <div
                      className="pl-1 validation-font"
                      style={{ color: "red" }}
                    >
                      {errors.recordedFileSize}
                    </div>
                  )}
              </div>
              <div className="mt-[18px] mb-4 2xl:mb-6">
                <DynamicLabel
                  text={intl.user_voice_recording_storage_location}
                  textColor="#7B7B7B"
                  htmlFor="recordedFileStorageLocation"
                />
                <Medium
                  id="recordedFileStorageLocation"
                  type={"text"}
                  placeholder={""}
                  borderRound={"rounded-lg"}
                  padding={"p-[10px] py-3"}
                  focus={"focus:outline-none"}
                  border={"border border-gray-400"}
                  bg={"bg-[#f2f2f2]"}
                  isDisabled="true"
                  additionalClass={
                    "block w-full pl-5 text-sm pr-[30px] h-[40px] text-[#C7C7C7]"
                  }
                  value={userDetailsInfo.recordedFileStorageLocation}
                  onChange={(evt) => {
                    setTouched(() => ({
                      ...touched,
                      ["recordedFileStorageLocation"]: true,
                    }));
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{
                        recordedFileStorageLocation: evt.target.value,
                      },
                    });
                  }}
                />
                {touched &&
                  errors &&
                  errors.recordedFileStorageLocation &&
                  touched.recordedFileStorageLocation && (
                    <div
                      className="pl-1 validation-font"
                      style={{ color: "red" }}
                    >
                      {errors.recordedFileStorageLocation}
                    </div>
                  )}
              </div>
            </div>
            <div className="w-full pl-0 md:pl-4 md:w-1/2 flex flex-col ">
              <div className="">
                <div className="2xl:mb-[19px]">
                  <div className="bg-white mb-[20px] md:mb-[20px] md:mt-[-8px]   pl-0 rounded-lg">
                    <ToggleBoxMedium
                      isDisabled={!isEditable}
                      toggle={userDetailsInfo.isRecordingSettings}
                      setToggle={(isRecordingSettings) => {
                        setUserDetailsInfo({
                          ...userDetailsInfo,
                          ...{
                            isRecordingSettings: isRecordingSettings,
                          },
                        });
                      }}
                      label={intl.user_voice_recording_setting_label}
                      labelColor={"#7B7B7B"}
                      id={"Id"}
                      onColor={"#1E1E1E"}
                      onHandleColor={"#00ACFF"}
                      handleDiameter={16}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.6)"}
                      activeBoxShadow={"0px 0px 1px 10px rgba(0, 0, 0, 0.2)"}
                      height={10}
                      width={27}
                      additionalClass={""}
                      labelClass={
                        "text-sm font-medium text-gray-900 dark:text-gray-300"
                      }
                    />
                  </div>
                </div>
                <div className="mb-4 2xl:mb-6">
                  <DropdownMedium
                    isDisabled={!isEditable}
                    labelClass={"mb-[4px]"}
                    borderRound={"rounded"}
                    padding={"py-2 pr-[120px]"}
                    options={[
                      { id: 1, value: "internal", label: "内蔵ストレージ" },
                      { id: 2, value: "external", label: "外部ストレージ" },
                    ]}
                    keys={"value"} // From options array
                    optionLabel={"label"} // From options array
                    border={"border border-gray-400"}
                    focus={
                      "focus:outline-none focus:ring-2 focus:ring-customBlue"
                    }
                    bg=""
                    text={"text-sm"}
                    additionalClass={"block w-full px-4 h-[40px]"}
                    id={"mobileStorage"}
                    labelColor={"#7B7B7B"}
                    label={intl.user_sos_destination_label}
                    value={userDetailsInfo.mobileStorage}
                    onChange={(mobileStorage) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{ mobileStorage: mobileStorage },
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[16px] bg-white p-[16px]">
          <div className="flex ">
            <TitleUserCard title={intl.user_device_button_settings} />
          </div>
          <div className="w-full  mx-auto">
            <div className="mb-8">
              <div className="grid grid-cols-12 gap-4">
                <div
                  className={`${
                    selectedButton && selectedType
                      ? "md:col-span-4"
                      : selectedButton
                      ? "md:col-span-6"
                      : ""
                  } col-span-12 rounded-lg bg-[#f6f6f6]`}
                >
                  <div className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">
                    {/* first section */}
                    {deviceSettings.map((el, index) => {
                      return (
                        <button
                          disabled={!isEditable}
                          key={index}
                          type="button"
                          className={`${btnClass} ${
                            el.name == selectedButton?.name
                              ? "border border-customBlue"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedButton(el);
                            if (el.name == "pttButton") {
                              setPttButtonSettings(true);
                            } else {
                              setPttButtonSettings(false);
                            }
                          }}
                        >
                          {el.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* second section */}
                {selectedButton && (
                  <div
                    className={`${
                      selectedButton && selectedType
                        ? "md:col-span-4"
                        : selectedButton
                        ? "md:col-span-6"
                        : ""
                    } col-span-12 rounded-lg bg-[#f6f6f6]`}
                  >
                    <div className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">
                      {/* ptt */}
                      {selectedButton.name != "pttButton" &&
                        pttButtonSettings && (
                          <button
                            type="button"
                            className={`${
                              selectedType == "ptt"
                                ? "border border-customBlue"
                                : ""
                            }  ${btnClass}`}
                            onClick={() =>
                              handleType("ptt", intl.set_quick_ppt_name)
                            }
                          >
                            <div>{intl.set_quick_ppt_names}</div>
                            <div className="text-customBlue">
                              {selectedButton.type[0].value.value ==
                              selectedButton.type[0].value.optionName
                                ? `${selectedButton.type[0].value.value}`
                                : `${selectedButton.type[0].value.optionName}
                        ${selectedButton.type[0].value.value ? ":" : ""}
                        ${selectedButton.type[0].value.value}`}
                            </div>
                          </button>
                        )}

                      {/* tap */}
                      {selectedButton.name != "volumeIncrease" &&
                        selectedButton.name != "volumeDecrease" && (
                          <button
                            type="button"
                            className={`${
                              selectedType == "tap"
                                ? "border border-customBlue"
                                : ""
                            }  ${btnClass}`}
                            onClick={() => handleType("tap", intl.tap)}
                          >
                            <div>{intl.tap}</div>
                            <div className="text-customBlue">
                              <PttBtnHtml
                                pttButtonSettings={pttButtonSettings}
                                index={1}
                              />
                            </div>
                          </button>
                        )}

                      {/* long press 2 */}
                      <button
                        type="button"
                        className={`${
                          selectedType == "longPress2sec"
                            ? "border border-customBlue"
                            : ""
                        }  ${btnClass}`}
                        onClick={() =>
                          handleType("longPress2sec", intl.long_press)
                        }
                      >
                        <div>{intl.long_press}</div>
                        <div className="text-customBlue">
                          <PttBtnHtml
                            pttButtonSettings={pttButtonSettings}
                            index={2}
                          />
                        </div>
                      </button>

                      {/* long press 5 */}
                      <button
                        type="button"
                        className={`${
                          selectedType == "longPress5sec"
                            ? "border border-customBlue"
                            : ""
                        }  ${btnClass}`}
                        onClick={() =>
                          handleType("longPress5sec", intl.long_press_5s)
                        }
                      >
                        <div>{intl.long_press_5s}</div>
                        <div className="text-customBlue">
                          <PttBtnHtml
                            pttButtonSettings={pttButtonSettings}
                            index={3}
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* third section */}

                {selectedType && (
                  <div
                    className="md:col-span-4 col-span-12 rounded-lg bg-[#f6f6f6]"
                    key={reRender}
                  >
                    {selectedType == "ptt" ? (
                      <>
                        <form className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection("PTT")}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="PTTPTT"
                              value={"PTT"}
                              checked={thirdSection == "PTT"}
                              onChange={() => {
                                let settings = deviceSettings.map(
                                  (deviceSetting) => {
                                    if (
                                      selectedButton.name == deviceSetting.name
                                    ) {
                                      deviceSetting.type.map((typeEl) => {
                                        if (typeEl.type == selectedType) {
                                          typeEl.value = {
                                            optionName: "PTT",
                                            type: "PTT",
                                            value: "PTT",
                                          };
                                        }
                                        return typeEl;
                                      });
                                    }
                                    return deviceSetting;
                                  }
                                );
                                setDeviceSettings(settings);
                              }}
                            />
                            <label htmlFor="PTTPTT">PTT</label>
                          </div>
                          {/* group */}
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection(intl.call)}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="Call"
                              value={intl.call}
                              checked={thirdSection == intl.call}
                              onChange={() => {
                                let settings = deviceSettings.map(
                                  (deviceSetting) => {
                                    if (
                                      selectedButton.name == deviceSetting.name
                                    ) {
                                      deviceSetting.type.map((typeEl) => {
                                        if (typeEl.type == selectedType) {
                                          typeEl.value = {
                                            optionName: intl.call,
                                            type: "call",
                                            value: intl.call,
                                          };
                                        }
                                        return typeEl;
                                      });
                                    }
                                    return deviceSetting;
                                  }
                                );
                                setDeviceSettings(settings);
                              }}
                            />
                            <label htmlFor="Call">{intl.call}</label>
                          </div>
                          {/* sos */}
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection(intl.mike_icon)}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="MicroPhone"
                              value={intl.mike_icon}
                              checked={thirdSection == intl.mike_icon}
                              onChange={() => {
                                let settings = deviceSettings.map(
                                  (deviceSetting) => {
                                    if (
                                      selectedButton.name == deviceSetting.name
                                    ) {
                                      deviceSetting.type.map((typeEl) => {
                                        if (typeEl.type == selectedType) {
                                          typeEl.value = {
                                            optionName: intl.mike_icon,
                                            type: "micro",
                                            value: intl.mike_icon,
                                          };
                                        }
                                        return typeEl;
                                      });
                                    }
                                    return deviceSetting;
                                  }
                                );
                                setDeviceSettings(settings);
                              }}
                            />
                            <label htmlFor="MicroPhone">{intl.mike_icon}</label>
                          </div>
                          {/* マイクアイコン＋通話 */}
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection(intl.mikecall)}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="MikePlusCall"
                              value={intl.mikecall}
                              checked={thirdSection == intl.mikecall}
                              onChange={() => {
                                let settings = deviceSettings.map(
                                  (deviceSetting) => {
                                    if (
                                      selectedButton.name == deviceSetting.name
                                    ) {
                                      deviceSetting.type.map((typeEl) => {
                                        if (typeEl.type == selectedType) {
                                          typeEl.value = {
                                            optionName: intl.mikecall,
                                            type: "microPlusCall",
                                            value: intl.mikecall,
                                          };
                                        }
                                        return typeEl;
                                      });
                                    }
                                    return deviceSetting;
                                  }
                                );
                                setDeviceSettings(settings);
                              }}
                            />
                            <label htmlFor="MikePlusCall">
                              {intl.mikecall}
                            </label>
                          </div>
                          {/*  */}
                        </form>
                      </>
                    ) : (
                      <>
                        {selectedType && (
                          <form className="flex flex-col gap-y-2 rounded-lg p-4 w-full">
                            <div
                              className={`${thirdSectionInput}`}
                              onChange={() =>
                                setThirdSection(
                                  intl.user_sos_designation_ptt_option1
                                )
                              }
                            >
                              <input
                                type="radio"
                                name="action_value"
                                className="accent-[#19388B]"
                                id="Specified_PTT"
                                value={intl.user_sos_designation_ptt_option1}
                                checked={
                                  thirdSection ==
                                  intl.user_sos_designation_ptt_option1
                                }
                              />
                              <label htmlFor="Specified_PTT">
                                {intl.user_sos_designation_ptt_option1}
                              </label>
                            </div>
                            {thirdSection ==
                              intl.user_sos_designation_ptt_option1 && (
                              <div>
                                <button
                                  type="button"
                                  className=" bg-customBlue border border-[#e7e7e9] focus:outline-none rounded-lg px-2 py-1  mb-2 text-white  min-w-min text-sm"
                                  onClick={() => setModal(!isModalOpen)}
                                >
                                  {intl.select_contacts}
                                </button>
                              </div>
                            )}

                            {/* group */}
                            <div
                              className={`${thirdSectionInput}`}
                              onChange={() =>
                                setThirdSection(intl.designated_group)
                              }
                            >
                              <input
                                type="radio"
                                name="action_value"
                                className="accent-[#19388B]"
                                id="Designated_Group"
                                value={intl.designated_group}
                                checked={thirdSection == intl.designated_group}
                              />
                              <label htmlFor="Designated_Group">
                                {intl.designated_group}
                              </label>
                            </div>
                            {thirdSection == intl.designated_group && (
                              <div>
                                <button
                                  type="button"
                                  className=" bg-customBlue border border-[#e7e7e9] focus:outline-none  rounded-lg py-1 px-2 mb-2 text-white  min-w-min text-sm"
                                  onClick={() =>
                                    setModalGroup(!isModalOpenGroup)
                                  }
                                >
                                  {intl.designated_group}
                                </button>
                              </div>
                            )}
                            {/* sos */}
                            <div
                              className={`${thirdSectionInput}`}
                              onChange={() => setThirdSection(intl.sos_call)}
                            >
                              <input
                                type="radio"
                                name="action_value"
                                className="accent-[#19388B]"
                                id="SOS_Call"
                                value={intl.sos_call}
                                checked={thirdSection == intl.sos_call}
                              />
                              <label htmlFor="SOS_Call">
                                {intl.sos_call} {thirdSection == intl.sos_call}
                              </label>
                            </div>
                            {thirdSection == intl.sos_call && (
                              <div>
                                <button
                                  type="button"
                                  className=" bg-customBlue border border-[#e7e7e9] focus:outline-none  rounded-lg py-1 px-2 mb-2 text-white  min-w-min text-sm"
                                  onClick={() => setModal(!isModalOpen)}
                                >
                                  {intl.select_contacts}
                                </button>

                                <button
                                  type="button"
                                  className=" bg-customBlue border border-[#e7e7e9] focus:outline-none  rounded-lg py-1 px-2 mb-2 text-white  min-w-min text-sm"
                                  onClick={() =>
                                    setModalGroup(!isModalOpenGroup)
                                  }
                                >
                                  {intl.select_group}
                                </button>
                              </div>
                            )}
                            <div
                              className={`${thirdSectionInput}`}
                              onChange={() =>
                                setThirdSection(intl.last_history)
                              }
                            >
                              <input
                                type="radio"
                                name="action_value"
                                className="accent-[#19388B]"
                                id="history"
                                value={intl.last_history}
                                checked={thirdSection == intl.last_history}
                                onChange={() => {
                                  setHistory(intl.last_history);
                                  let settings = deviceSettings.map(
                                    (deviceSetting) => {
                                      if (
                                        selectedButton.name ==
                                        deviceSetting.name
                                      ) {
                                        deviceSetting.type.map((typeEl) => {
                                          if (typeEl.type == selectedType) {
                                            typeEl.value = {
                                              optionName: intl.last_history,
                                              type: "history",
                                              value: intl.last_history,
                                            };
                                          }
                                          return typeEl;
                                        });
                                      }
                                      return deviceSetting;
                                    }
                                  );
                                  setDeviceSettings(settings);
                                }}
                              />
                              <label htmlFor="history">
                                {intl.last_history}
                              </label>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isModalOpen && (
              <Modal
                height="500px"
                fontSize="text-xl"
                fontWeight="font-semibold"
                textColor="#19388B"
                text={""}
                onCloseHandler={() => {
                  setGroupSearchResults(groupListData);
                  setContactSearchResults(contactList);
                  setModal(false);
                }}
                contentPaddingTop=""
                contentPadding="px-0"
                modalFooter={getModalFooter}
                footerParentClass={"w-full"}
              >
                <div className="flex flex-col">
                  <div className="flex-grow">
                    <form className="px-8">
                      <div className="relative mb-2">
                        <input
                          type="text"
                          placeholder={intl.dashboard_layout_search_btn}
                          className="rounded-lg pr-2 py-2 border border-[#F6F6F6] w-full pl-8 placeholder:pl-5"
                          onChange={(evt) =>
                            searchContactOrGroup(
                              evt.target.value,
                              "contactSearch"
                            )
                          }
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <HiSearch className="text-[#AEAEAE] font-bold" />
                        </div>
                      </div>
                      <ul className="max-h-[350px] overflow-auto ">
                        {contactSearchResults.length > 0 &&
                          contactSearchResults.map((contact, index) => {
                            return (
                              <li
                                key={index}
                                type="radio"
                                name="select_contact_or_group"
                                className="flex gap-x-6 pl-3"
                              >
                                <input
                                  type="radio"
                                  name="select_contact_or_group"
                                  value={contact.value}
                                  onChange={() => {
                                    setSelectedContact(contact.pttNo);
                                  }}
                                  className="w-[14px]"
                                />
                                <div className="flex flex-col text-left">
                                  <div>{contact.label}</div>
                                  <label
                                    htmlFor={contact.pttNo}
                                    className="text-[#686868]"
                                  >
                                    {contact.pttNo}
                                  </label>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </form>
                  </div>
                </div>
              </Modal>
            )}

            {isModalOpenGroup && (
              <Modal
                height="500px"
                fontSize="text-xl"
                fontWeight="font-semibold"
                textColor="#19388B"
                text={""}
                onCloseHandler={() => {
                  setGroupSearchResults(groupListData);
                  setContactSearchResults(contactList);
                  setModalGroup(false);
                }}
                contentPaddingTop=""
                contentPadding="px-0"
                modalFooter={getModalFooterGroup}
                footerParentClass={"w-full"}
              >
                <div className="flex flex-col">
                  <div className="flex-grow">
                    <form className="px-8">
                      <div className="mb-2 relative">
                        <input
                          type="text"
                          placeholder="検索"
                          className="rounded-lg px-2 py-2 border border-[#F6F6F6] w-full pl-8 placeholder:pl-5"
                          onChange={(evt) =>
                            searchContactOrGroup(
                              evt.target.value,
                              "groupSearch"
                            )
                          }
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <HiSearch className="text-[#AEAEAE] font-bold" />
                        </div>
                      </div>
                      <ul className="max-h-[350px] overflow-auto">
                        {groupSearchResults.length > 0 &&
                          groupSearchResults.map((group, index) => {
                            return (
                              <li
                                key={index}
                                type="radio"
                                name="select_contact_or_group"
                                className="flex gap-x-6 pl-3"
                              >
                                <input
                                  type="radio"
                                  name="select_contact_or_group"
                                  value={selectedGroup.value}
                                  onChange={() => {
                                    setSelectedGroup(group.groupId);
                                  }}
                                  className="w-[14px]"
                                />
                                <div className="flex flex-col text-left">
                                  <div> {group.label}</div>
                                  <label
                                    htmlFor={group.groupId}
                                    className="text-[#686868]"
                                  >
                                    {group.groupId}
                                  </label>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </form>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        </div>

        <div className="mt-[16px] bg-white p-[16px]">
          <div className="flex ">
            <TitleUserCard title={intl.user_others} />
          </div>
          <div className="flex flex-col md:flex-row md:gap-x-4">
            <div className="w-full md:w-1/2 md:mb-12">
              <div className="mb-4 2xl:mb-6">
                <div className="bg-white mb-4  rounded-lg">
                  <ToggleBoxMediumRevamp
                    isDisabled={
                      !organizationsData?.isTranscribe ||
                      !userInfo.isRecordingSettings ||
                      !isEditable
                    }
                    checked={
                      organizationsData?.isTranscribe
                        ? userDetailsInfo.isTranscribe
                        : false
                    }
                    setToggle={(isTranscribe) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        isTranscribe: isTranscribe,
                      });
                    }}
                    toggle={
                      organizationsData?.isTranscribe
                        ? userDetailsInfo.isTranscribe
                        : false
                    }
                    id={"Id"}
                  >
                    <div className="text-[#7B7B7B]">{intl.transcribe}</div>
                  </ToggleBoxMediumRevamp>
                </div>
              </div>

              <div className="bg-white mb-4  rounded-lg mb-4 2xl:mb-6 items-center">
                <ToggleBoxMediumRevamp
                  isDisabled={!organizationsData?.sosLocation || !isEditable}
                  checked={userDetailsInfo.isSOS}
                  setToggle={(isSOS) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{
                        isSOS: isSOS,
                        locationInformation: isSOS
                          ? userDetailsInfo.locationInformation
                          : false,
                      },
                    });
                  }}
                  toggle={
                    organizationsData?.sosLocation
                      ? userDetailsInfo.isSOS
                      : false
                  }
                  id={"Id"}
                >
                  <div className="text-[#434343]">{"SOS"}</div>
                </ToggleBoxMediumRevamp>
              </div>
              <div className="bg-white mb-4  rounded-lg mb-4 2xl:mb-6 items-center">
                <ToggleBoxMediumRevamp
                  isDisabled={
                    !organizationsData?.sosLocation ||
                    !userDetailsInfo.isSOS ||
                    !isEditable
                  }
                  checked={userDetailsInfo.locationInformation}
                  setToggle={(locationInformation) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{
                        locationInformation: locationInformation,
                      },
                    });
                  }}
                  toggle={
                    organizationsData?.sosLocation
                      ? userDetailsInfo.locationInformation
                      : false
                  }
                  id={"Id"}
                >
                  <div className="text-[#434343]">
                    {intl.location_information}
                  </div>
                </ToggleBoxMediumRevamp>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col ">
              <div className="">
                <div className="bg-white  mb-4 pl-0 md:pl-4 rounded-lg">
                  <ToggleBoxMediumRevamp
                    isDisabled={
                      !organizationsData?.isTranslate ||
                      !userInfo.isRecordingSettings ||
                      !isEditable
                    }
                    checked={
                      organizationsData?.isTranslate
                        ? userDetailsInfo.simultaneousInterpretation
                        : false
                    }
                    setToggle={(simultaneousInterpretation) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        simultaneousInterpretation: simultaneousInterpretation,
                      });
                    }}
                    toggle={
                      organizationsData?.isTranslate
                        ? userDetailsInfo.simultaneousInterpretation
                        : false
                    }
                    id={"Id"}
                  >
                    <div className="text-[#7B7B7B]">
                      {intl.form_component_simulataneous_intepretation}
                    </div>
                  </ToggleBoxMediumRevamp>
                </div>
              </div>

              <div className="bg-white pl-0 md:pl-4 rounded-lg mb-4 2xl:mb-6 grid grid-cols-4 items-start">
                <div className="col-span-4 mb-[1px] ">
                  <div className="text-[#434343]">{intl.sos_regular_time}</div>
                </div>
                <div className="col-span-4">
                  <div className=" pr-2  flex ">
                    <select
                      disabled={
                        !organizationsData?.sosLocation ||
                        !userDetailsInfo.isSOS ||
                        !isEditable
                      }
                      className="rounded w-full border border-gray-400 h-[40px] focus:outline-none focus:ring-2 focus:ring-customBlue block px-4 py-2 w-24 dark:text-black"
                      value={userDetailsInfo.sosScheduledTime}
                      onChange={(evt) => {
                        setUserDetailsInfo({
                          ...userDetailsInfo,
                          ...{ sosScheduledTime: evt.target.value },
                        });
                      }}
                    >
                      <option disabled value={""} selected className="py-4">
                        {intl.dropdownmedium_select_label}
                      </option>
                      {[
                        { id: 1, value: "5sec", label: intl.five_seconds },
                        { id: 2, value: "10sec", label: intl.ten_seconds },
                        { id: 3, value: "15sec", label: intl.fifteen_seconds },
                        { id: 4, value: "20sec", label: intl.twenty_seconds },
                      ].map((dropDownOption, index) => (
                        <option
                          className="bg-white text-black rounded py-4"
                          id={`id-${index}`}
                          key={dropDownOption.value}
                          value={dropDownOption.value}
                        >
                          {dropDownOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditable && (
        <div className="flex justify-end p-[16px] bg-white mb-[16px]">
          <Button
            type="secondary"
            className="border-[#214BB9] h-[40px] border-solid text-[#214BB9] text-[16px] font-semibold"
            onClick={() => {
              setConfirmModal(true);
            }}
          >
            {intl.save_settings}
          </Button>
        </div>
      )}
      {confirmModal && (
        <AntModal
          width={385}
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-[20px] text-customBlue text-center">
              {intl.save_popup}
            </div>
          }
          open={confirmModal}
          onCancel={() => {
            setConfirmModal(false);
          }}
          centered
          className="my-[70px]"
          footer={() => {
            return (
              <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]">
                <button
                  className=" sm:flex-1 w-full sm:w-auto text-[#19388B] border-2 border-[#19388B] font-semibold h-[40px] text-base"
                  onClick={() => {
                    setConfirmModal(false);
                  }}
                >
                  {intl.help_settings_addition_modal_cancel}
                </button>
                <button
                  className="sm:flex-1 w-full sm:w-auto bg-[#19388B] hover:bg-[#214BB9] font-semibold h-[40px] text-base text-white "
                  onClick={() => {
                    updateEmployeeSettings();
                  }}
                >
                  {intl.save}
                </button>
              </div>
            );
          }}
        >
          <div className="text-center"> {intl.changes_reflected}</div>
        </AntModal>
      )}

      {exportModal && (
        <AntModal
          width={385}
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-[20px] text-customBlue text-center">
              {intl.company_list_company_export_title}
            </div>
          }
          open={exportModal}
          onCancel={() => {
            setExportModal(false);

            setCsvFileName(""); // Clear the file name field
            setFileNameError("");
          }}
          footer={() => {
            return (
              <div className="px-[40px] pb-[40px] ">
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
          }}
          centered={true}
        >
          <div className="flex flex-col">
            <div className="flex-grow py-[20px] mb-4">
              <form className="grid grid-cols-1 gap-y-3">
                <div className="flex flex-col px-[40px]">
                  <TextPlain
                    type="text"
                    for={"id"}
                    placeholder={intl.user_history_settings_file_name}
                    borderRound="rounded"
                    padding="p-[8px]"
                    focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
                    border="border border-[#E7E7E9]"
                    bg="bg-white"
                    additionalClass="block w-full  text-[16px] h-[40px]"
                    label={intl.user_history_settings_file_name}
                    labelColor="#7B7B7B"
                    id={"id"}
                    isRequired={true}
                    labelClass={"float-left"}
                    value={csvFileName}
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
              </form>
            </div>
          </div>
        </AntModal>
      )}
      {importModal && (
        <>
          <ImportModal
            modelToggle={importIsOn}
            file={file}
            setFile={setFile}
            fileName={fileName}
            setFileName={setFileName}
            operation="update"
            fileValidationError={fileValidationError}
            setFileValidationError={setFileValidationError}
            uploadCsvFile={(payload) => {
              uploadSettingCsvFile(payload);
              setImportModal(false);
            }}
            onCloseHandler={() => {
              dispatch(importPopup(false));
              setImportModal(false);
              setFileValidationError("");
            }}
            sampleLink={sampleLinks().settingsImport}
          />
        </>
      )}
      <a
        id={"linkCsv"}
        ref={CSVDownloadRef}
        href={downloadCsvLink}
        download
        key={downloadCsvLink}
      ></a>
    </>
  );
}
