"use client";

import { useState } from "react";
import DropdownMedium from "@/components/Input/dropdownMedium";
import TitleUserCard from "../components/titleUserCard";
import ActionButton from "../components/actionButton";
import intl from "@/utils/locales/jp/jp.json";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
    soundSettings: EmployeeDetails?.accountDetail?.employee?.settings?.sound || {},
    pttBooster: EmployeeDetails?.accountDetail?.employee?.settings?.pttBooster || {},
    networkFailure: EmployeeDetails?.accountDetail?.employee?.settings?.networkFailure || "continuousAlarm",
    callRejection: EmployeeDetails?.accountDetail?.employee?.settings?.callRejectionSettings?.callRejection || "off",
    deviceSettings: EmployeeDetails?.accountDetail?.employee?.settings?.deviceSettings || {},
    voiceRecording: EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording || "off",
    pttService: EmployeeDetails?.accountDetail?.employee?.settings?.pttService || "off",
  };

  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);
  const [loading, setLoading] = useState(false);

  async function updateSettings(type) {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: type,
        data: userDetailsInfo[type],
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

  function reset() {
    setUserDetailsInfo(userInfo);
  }

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={intl.user_settings_screen_label} />
      </div>
      <div className="flex justify-end mb-4 md:pr-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_settings_reset_btn_label}
        </button>
      </div>
      <div className="w-full md:w-[330px] mx-auto">
        {/* Sound Settings */}
        <div className="mb-8">
          <DropdownMedium
            borderRound={"rounded-lg"}
            padding={"py-2.5 pr-[120px]"}
            options={[
              { id: 1, value: "low", label: "Low" },
              { id: 2, value: "medium", label: "Medium" },
              { id: 3, value: "high", label: "High" },
            ]}
            keys={"value"}
            optionLabel={"label"}
            border={"border border-gray-400"}
            focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
            bg=""
            text={"text-sm"}
            additionalClass={"block w-full px-4"}
            id={"soundSettings"}
            label={"Sound Settings"}
            value={userDetailsInfo.soundSettings}
            onChange={(soundSettings) => {
              setUserDetailsInfo({
                ...userDetailsInfo,
                ...{ soundSettings: soundSettings },
              });
            }}
          />
        </div>
        {/* PTT Booster Settings */}
        <div className="mb-8">
          <DropdownMedium
            borderRound={"rounded-lg"}
            padding={"py-2.5 pr-[120px]"}
            options={[
              { id: 1, value: "short", label: "Short" },
              { id: 2, value: "medium", label: "Medium" },
              { id: 3, value: "long", label: "Long" },
            ]}
            keys={"value"}
            optionLabel={"label"}
            border={"border border-gray-400"}
            focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
            bg=""
            text={"text-sm"}
            additionalClass={"block w-full px-4"}
            id={"pttBooster"}
            label={"PTT Booster Settings"}
            value={userDetailsInfo.pttBooster}
            onChange={(pttBooster) => {
              setUserDetailsInfo({
                ...userDetailsInfo,
                ...{ pttBooster: pttBooster },
              });
            }}
          />
        </div>
        {/* Network Failure Settings */}
        <div className="mb-8">
          <DropdownMedium
            borderRound={"rounded-lg"}
            padding={"py-2.5 pr-[120px]"}
            options={[
              { id: 1, value: "continuousAlarm", label: "Continuous Alarm" },
              { id: 2, value: "5times", label: "5 Times" },
              { id: 3, value: "off", label: "Off" },
            ]}
            keys={"value"}
            optionLabel={"label"}
            border={"border border-gray-400"}
            focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
            bg=""
            text={"text-sm"}
            additionalClass={"block w-full px-4"}
            id={"networkFailure"}
            label={"Network Failure Alarm Settings"}
            value={userDetailsInfo.networkFailure}
            onChange={(networkFailure) => {
              setUserDetailsInfo({
                ...userDetailsInfo,
                ...{ networkFailure: networkFailure },
              });
            }}
          />
        </div>
        {/* Call Rejection Settings */}
        <div className="mb-8">
          <div className="grid grid-cols-4 mb-8 gap-x-2">
            <div
              className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
              onChange={() => setUserDetailsInfo({ ...userDetailsInfo, callRejection: "off" })}
            >
              <div className="flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3">
                <input
                  type="radio"
                  name="callRejection"
                  className="accent-[#19388B]"
                  id="off"
                  value="off"
                  checked={userDetailsInfo.callRejection === "off"}
                  defaultChecked={userDetailsInfo.callRejection === "off"}
                />
                <label htmlFor="off" className="flex flex-1">Off</label>
              </div>
            </div>
            <div
              className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
              onChange={() => setUserDetailsInfo({ ...userDetailsInfo, callRejection: "customGroupCallRejection" })}
            >
              <div className="flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3">
                <input
                  type="radio"
                  name="callRejection"
                  className="accent-[#19388B]"
                  id="customGroupCallRejection"
                  value="customGroupCallRejection"
                  checked={userDetailsInfo.callRejection === "customGroupCallRejection"}
                  defaultChecked={userDetailsInfo.callRejection === "customGroupCallRejection"}
                />
                <label htmlFor="customGroupCallRejection">Custom Group Call Rejection</label>
              </div>
            </div>
            <div
              className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
              onChange={() => setUserDetailsInfo({ ...userDetailsInfo, callRejection: "cloudGroupCallRejection" })}
            >
              <div className="flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3">
                <input
                  type="radio"
                  name="callRejection"
                  className="accent-[#19388B]"
                  id="cloudGroupCallRejection"
                  value="cloudGroupCallRejection"
                  checked={userDetailsInfo.callRejection === "cloudGroupCallRejection"}
                  defaultChecked={userDetailsInfo.callRejection === "cloudGroupCallRejection"}
                />
                               <label htmlFor="cloudGroupCallRejection">Cloud Group Call Rejection</label>
              </div>
            </div>
          </div>
        </div>
        {/* Device Settings */}
        <div className="mb-8">
          <DropdownMedium
            borderRound={"rounded-lg"}
            padding={"py-2.5 pr-[120px]"}
            options={[
              { id: 1, value: "device1", label: "Device 1" },
              { id: 2, value: "device2", label: "Device 2" },
              { id: 3, value: "device3", label: "Device 3" },
            ]}
            keys={"value"}
            optionLabel={"label"}
            border={"border border-gray-400"}
            focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
            bg=""
            text={"text-sm"}
            additionalClass={"block w-full px-4"}
            id={"deviceSettings"}
            label={"Device Settings"}
            value={userDetailsInfo.deviceSettings}
            onChange={(deviceSettings) => {
              setUserDetailsInfo({
                ...userDetailsInfo,
                ...{ deviceSettings: deviceSettings },
              });
            }}
          />
        </div>
        {/* Voice Recording Settings */}
        <div className="mb-8">
          <div className="grid grid-cols-4 mb-8 gap-x-2">
            <div
              className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
              onChange={() => setUserDetailsInfo({ ...userDetailsInfo, voiceRecording: "off" })}
            >
              <div className="flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3">
                <input
                  type="radio"
                  name="voiceRecording"
                  className="accent-[#19388B]"
                  id="voiceRecordingOff"
                  value="off"
                  checked={userDetailsInfo.voiceRecording === "off"}
                  defaultChecked={userDetailsInfo.voiceRecording === "off"}
                />
                <label htmlFor="voiceRecordingOff" className="flex flex-1">Off</label>
              </div>
            </div>
            <div
              className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
              onChange={() => setUserDetailsInfo({ ...userDetailsInfo, voiceRecording: "on" })}
            >
              <div className="flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3">
                <input
                  type="radio"
                  name="voiceRecording"
                  className="accent-[#19388B]"
                  id="voiceRecordingOn"
                  value="on"
                  checked={userDetailsInfo.voiceRecording === "on"}
                  defaultChecked={userDetailsInfo.voiceRecording === "on"}
                />
                <label htmlFor="voiceRecordingOn">On</label>
              </div>
            </div>
          </div>
        </div>
        {/* PTT Service Settings */}
        <div className="mb-8">
          <div className="grid grid-cols-4 mb-8 gap-x-2">
            <div
              className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
              onChange={() => setUserDetailsInfo({ ...userDetailsInfo, pttService: "off" })}
            >
              <div className="flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3">
                <input
                  type="radio"
                  name="pttService"
                  className="accent-[#19388B]"
                  id="pttServiceOff"
                  value="off"
                  checked={userDetailsInfo.pttService === "off"}
                  defaultChecked={userDetailsInfo.pttService === "off"}
                />
                <label htmlFor="pttServiceOff" className="flex flex-1">Off</label>
              </div>
            </div>
            <div
              className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
              onChange={() => setUserDetailsInfo({ ...userDetailsInfo, pttService: "on" })}
            >
              <div className="flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3">
                <input
                  type="radio"
                  name="pttService"
                  className="accent-[#19388B]"
                  id="pttServiceOn"
                  value="on"
                  checked={userDetailsInfo.pttService === "on"}
                  defaultChecked={userDetailsInfo.pttService === "on"}
                />
                <label htmlFor="pttServiceOn">On</label>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-0 flex justify-end">
          <div className="w-[150px]">
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => updateSettings("soundSettings")}
            />
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => updateSettings("pttBooster")}
            />
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => updateSettings("networkFailure")}
            />
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => updateSettings("callRejection")}
            />
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => updateSettings("deviceSettings")}
            />
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => updateSettings("voiceRecording")}
            />
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => updateSettings("pttService")}
            />
          </div>
        </div>
      </div>
    </>
  );
}
