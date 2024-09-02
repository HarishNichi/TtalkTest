"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Layout/breadcrumb";
import { userSubSectionLinks } from "@/utils/constant";
import { Button, Tabs } from "antd";
import Group from "@/components/Groups/page";
import employee from "@/redux/features/employee";
import UserDetails from "@/components/UserDetails/page";
import Contact from "@/components/Contacts/page";
import * as Yup from "yup";

import ViewLog from "@/components/Logs/page";
import Other from "@/components/Other/page";
import IconOutlineBtn from "../Button/iconOutlineBtn";
import intl from "@/utils/locales/jp/jp.json";
import { GearIcon } from "../Icons/gearIcon";
import EditIcon from "../Icons/editIcon";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
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

import { validateHandler } from "@/validation/helperFunction";
import TextPlain from "../Input/textPlain";
import Medium from "../Input/medium";

export default function TerminalSettings() {
  const [loading, setLoading] = useState(false);
  const schema = Yup.object().shape({
    recordedFileStorageLocation: Yup.string().matches(
      /^(\/[0-9a-zA-Z]+)*\/?$/,
      "パスが無効です。パターンは '/xxxxx/xxx' です。"
    ),
    recordedFileSize: Yup.number()
      .required(intl.validation_required)
      .max(1024, "録音ファイルの保存容量は 1024MB を超えることはできません")
      .typeError("ファイルサイズを数字で入力してください"),
  });
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
    isRecordingSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.isRecordingSettings,
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
  };
  const [progressBarPtt, setProgressBarPtt] = useState(
    userInfo.pttNotificationVolume
  );
  const [progressBarNotification, setProgressBarNotification] = useState(
    userInfo.notificationVolume
  );
  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);
  const [selectedRejection, setSelectedRejection] = useState(userInfo);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState(null);
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
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-end mb-4  space-x-4">
        <IconOutlineBtn
          text={intl.company_list_company_export_title}
          textColor={"text-customBlue "}
          borderColor={"border-customBlue bg-white"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5  "}
          px={"xl:px-[32px] md:px-[33.5px] px-[33.5px]"}
          icon={() => exportIcon()}
          // onClick={async () => {
          //   setImportModal(false);
          //   await importHandler();
          // }}
        />
        <IconOutlineBtn
          text={intl.company_list_company_import}
          textColor={"text-customBlue"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5"}
          px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
          borderColor={"border-customBlue bg-white"}
          icon={() => importIcon()}
        />
        <IconOutlineBtn
          text={intl.user_change_history}
          textColor={"text-customBlue"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5"}
          px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
          borderColor={"border-customBlue bg-white"}
          icon={() => <GearIcon />}
        />
        <IconOutlineBtn
          text={intl.help_settings_addition_modal_edit}
          textColor={"text-customBlue"}
          textBold={true}
          py={"xl:py-2.5 md:py-1.5 py-1.5"}
          px={"xl:px-[20px] md:px-[22.5px] px-[22.5px] "}
          borderColor={"border-customBlue bg-white"}
          icon={() => <EditIcon fill={"#214BB9"} />}
        />
      </div>
      <div className=" p-[16px] bg-white">
        <div className="flex flex-col md:flex-row  justify-between items-center space-y-4 md:space-y-0"></div>
        <div className="flex flex-col space-y-4 ">
          <TitleUserCard title={intl.user_ptalk_service_screen_label} />
        </div>
        {/* <div className="flex justify-end mb-4 md:pr-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div> */}

        <div className="flex flex-col md:flex-row" id="ptalk-service">
          <div className="flex flex-col w-full space-y-2    ">
            <div className="">
              <div>
                <div className=" ml-2 mb-[16px]">
                  <ToggleBoxMediumRevamp
                    disabled={false}
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
                <div className="ml-2 ">
                  <ToggleBoxMediumRevamp
                    disabled={false}
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
                    label={"バックグラウンドで起動"}
                    id={"Id"}
                  >
                    <div className="text-[#434343]">バックグラウンドで起動</div>
                  </ToggleBoxMediumRevamp>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col ml-2 w-full space-y-2 mb-2">
            <ToggleBoxMediumRevamp
              disabled={false}
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
              label={"オフラインにする"}
              id={"Id"}
            >
              <div className="text-[#434343]">{"強制オフライン"}</div>
            </ToggleBoxMediumRevamp>
          </div>

          {/* <div className="flex justify-between mb-8 2xl:mb-6">
            {[
              { text: "利用可能", style: " bg-[#1AB517]" },
              { text: "利用不在", style: " bg-[#FFA500]" },
              { text: "利用停止", style: " bg-[#ED2E2E]" },
              { style: "bg-[#C6C3C3]", text: "利用不可" },
            ].map((el, index) => {
              return (
                <div className="flex gap-x-2 items-center" key={index}>
                  <div
                    className={`block rounded-full p-2 h-2 w-2 ${el.style}`}
                  ></div>
                  <div className="text-[#7B7B7B] text-sm">{el.text}</div>
                </div>
              );
            })}
          </div>
          <div className="mb-0 flex justify-end">
            <div className="w-[150px]">
              <ActionButton
                title={intl.help_settings_addition_keep}
                onClick={pTalkUpdate}
              />
            </div>
          </div> */}
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
                text={"PTT通知音量"}
                textColor="#7B7B7B"
                htmlFor="userId"
              />
              <div className="bg-input-white py-5 px-4 rounded-lg">
                <Progress
                  value={progressBarPtt}
                  setValue={setProgressBarPtt}
                  id="nv"
                />
              </div>
            </div>
            <div className="mb-4 2xl:mb-6">
              <DynamicLabel
                text="PTT通知音"
                textColor="#7B7B7B"
                htmlFor="userId"
              />

              <select
                className="rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 dark:text-black"
                defaultValue={"--選択する--"}
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
                    label: "PTT通知音1",
                  },
                  {
                    id: 2,
                    value: "pttNotificationSound2",
                    label: "PTT通知音2",
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
                text="返信要求繰り返し"
                textColor="#7B7B7B"
                htmlFor="user_sound_settings_tone_repeat"
              />

              <select
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
                  {"--選択する--"}
                </option>
                {[
                  { id: 1, value: "1time", label: "1回のみ" },
                  { id: 2, value: "1minuteInterval", label: "1分間隔" },
                  { id: 3, value: "5minuteInterval", label: "５分間隔" },
                  { id: 4, value: "30minuteInterval", label: "30分間隔" },
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
                text="返信要求繰り返し"
                textColor="#7B7B7B"
                htmlFor="userId"
              />

              <select
                className="rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 dark:text-black"
                id={"replyTone"}
                defaultValue={"--選択する--"}
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
                borderRound={"rounded-lg"}
                padding={"py-2 pr-[120px]"}
                options={[
                  {
                    id: 1,
                    value: "continuousAlarm",
                    label: intl.user_network_failure_alarm_option1,
                  },
                  { id: 2, value: "5times", label: "5回" },
                  { id: 3, value: "off", label: "オフ" },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4"}
                id={"networkFailure"}
                labelColor={"#7B7B7B"}
                label="通信環境エラー音"
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
                borderRound={"rounded-lg"}
                padding={"py-2 pr-[120px]"}
                options={[
                  {
                    id: 1,
                    value: "off",
                    label: "オフ",
                  },
                  {
                    id: 2,
                    value: "customGroupCallRejection",
                    label: "カスタムグループコール受信拒否",
                  },
                  {
                    id: 3,
                    value: "cloudGroupCallRejection",
                    label: "クラウドグループコール受信拒否",
                  },
                  {
                    id: 4,
                    value: "individualCallRejection",
                    label: "個別コール受信拒否",
                  },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4"}
                id={"callRejection"}
                labelColor={"#7B7B7B"}
                label="受信拒否"
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
              <div className="mb-1  2xl:mb-4 3xl:mb-4">
                <DynamicLabel
                  text={intl.user_sound_settings_notifcation_volume}
                  textColor="#7B7B7B"
                  htmlFor="userId"
                />
                <div className="bg-input-white py-5 px-4 rounded-lg">
                  <Progress
                    value={progressBarNotification}
                    setValue={setProgressBarNotification}
                    id="notification"
                  />
                </div>
              </div>
              <div className="mb-4 2xl:mb-6">
                {/* <DynamicLabel
                  text={<a className="">&nbsp;</a>}
                  textColor="#7B7B7B"
                  htmlFor="vibrateOnRequestReceived"
                /> */}
                <div className="bg-white  pl-4 rounded-lg ">
                  <ToggleBoxMedium
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
                {/* <DynamicLabel
                  text={<a className="">&nbsp;</a>}
                  textColor="#7B7B7B"
                  htmlFor="vibrationOnPtt"
                /> */}
                <div>
                  <div className="bg-white  pl-4 rounded-lg">
                    <ToggleBoxMedium
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
              <div className="mb-6 pl-4">
                <DropdownMedium
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
                  additionalClass={"block w-full px-4 text-[14px] font-normal"}
                  id={"boosterDuration"}
                  labelColor={"#7B7B7B"}
                  label="TPPブースター"
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
            <div className="mb-8">
              <DropdownMedium
                borderRound={"rounded-lg"}
                padding={"py-2.5 pr-[120px]"}
                options={[
                  { id: 1, value: "highQuality", label: "高品質" },
                  { id: 2, value: "lowQuality", label: "標準品質" },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
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
          <div className="w-full md:w-1/2 flex flex-col ">
            <div className="">
              <div className=" mt-1 2xl:mb-[19px]">
                <div className="bg-white mb-[1px] py-[13px] pl-4 rounded-lg">
                  <ToggleBoxMedium
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
              <div className="mt-[8px] pl-4 2xl:mb-6">
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
                    "block w-full pl-5 text-sm mt-[1px] pr-[30px] h-[40px] text-[#C7C7C7]"
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
          </div>
        </div>
      </div>
    </>
  );
}
