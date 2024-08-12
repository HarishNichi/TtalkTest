"use client";

import { useState } from "react";
import DynamicLabel from "../../../components/Label/dynamicLabel";
import Progress from "@/components/Input/progress";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import TitleUserCard from "../components/titleUserCard";
import ActionButton from "../components/actionButton";
import intl from "@/utils/locales/jp/jp.json";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";

export default function UserDetails() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
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
  };
  const [progressBarPtt, setProgressBarPtt] = useState(
    userInfo.pttNotificationVolume
  );
  const [progressBarNotification, setProgressBarNotification] = useState(
    userInfo.notificationVolume
  );
  const [loading, setLoading] = useState(false);
  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);

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
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={intl.user_sound_settings_screen_label} />
      </div>
      <div className="flex justify-end mb-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:gap-x-4">
        <div className="w-full md:w-1/2">
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.user_quick_ptt_notification_volume}
              textColor="#7B7B7B"
              htmlFor="userId"
            />
            <div className="bg-input-gray py-5 px-4 rounded-lg">
              <Progress value={progressBarPtt} setValue={setProgressBarPtt} id="nv" />
            </div>
          </div>
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.user_sound_settings_notifcation_volume}
              textColor="#7B7B7B"
              htmlFor="userId"
            />
            <div className="bg-input-gray py-5 px-4 rounded-lg">
              <Progress
                value={progressBarNotification}
                setValue={setProgressBarNotification}
                id="notification"
              />
            </div>
          </div>
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.user_sound_settings_select_ptt_notication_sound}
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
                { id: 1, value: "pttNotificationSound1", label: "PTT通知音1" },
                { id: 2, value: "pttNotificationSound2", label: "PTT通知音2" },
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
              text={intl.user_sound_settings_reply_tone}
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
        </div>
        <div className="w-full md:w-1/2 flex flex-col ">
          <div className="w-full md:mb-9 2xl:mb-32">
            <div className="mb-4 2xl:mb-6">
              <DynamicLabel
                text={intl.user_sound_settings_tone_repeat}
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
            <div className="mb-4 2xl:mb-6">
              <DynamicLabel
                text={<a className="hidden md:block">&nbsp;</a>}
                textColor="#7B7B7B"
                htmlFor="vibrateOnRequestReceived"
              />
              <div className="bg-input-gray py-3 pl-4 rounded-lg ">
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
                    "text-sm font-medium text-gray-900 dark:text-gray-300"
                  }
                />
              </div>
            </div>
            <div className="mb-4 2xl:mb-6">
              <DynamicLabel
                text={<a className="hidden md:block">&nbsp;</a>}
                textColor="#7B7B7B"
                htmlFor="vibrationOnPtt"
              />
              <div>
                <div className="bg-input-gray py-3 pl-4 rounded-lg">
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
                      "text-sm font-medium text-gray-900 dark:text-gray-300"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mb-0">
            <div className="w-[150px]">
              <ActionButton
                title={intl.user_sound_settings}
                onClick={updateSoundSettings}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
