"use client";

import { useState, useEffect } from "react";
import DropdownMedium from "../../../components/Input/dropdownMedium";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import TextPlain from "@/components/Input/textPlain";
import DynamicLabel from "@/components/Label/dynamicLabel";
import Medium from "@/components/Input/medium";
import TitleUserCard from "../components/titleUserCard";
import ActionButton from "../components/actionButton";
import intl from "@/utils/locales/jp/jp.json";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
import { useRouter } from "next/navigation";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";
import { validateHandler } from "../../../validation/helperFunction";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";

export default function UserDetails() {
  const dispatch = useAppDispatch();
  const [errors, setErrors] = useState(null);
  const [touched, setTouched] = useState({});
  const schema = Yup.object().shape({
    recordedFileStorageLocation: Yup.string()
      .matches(
        /^(\/[0-9a-zA-Z]+)*\/?$/,
        "パスが無効です。パターンは '/xxxxx/xxx' です。"
      ),
    recordedFileSize: Yup.number()
      .required(intl.validation_required)
      .max(1024, "録音ファイルの保存容量は 1024MB を超えることはできません")
      .typeError("ファイルサイズを数字で入力してください"),
  });
  const router = useRouter();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
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
  };
  const [loading, setLoading] = useState(false);
  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);
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
  function reset() {
    setUserDetailsInfo(userInfo);
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

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={intl.user_voice_recording_screen_label} />
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
          <div className="mb-4 mt-1 2xl:mb-[19px]">
            <DynamicLabel
              text={<a className="hidden md:block">&nbsp;</a>}
              textColor="#7B7B7B"
              htmlFor="userId"
            />
            <div className="bg-input-gray py-[13px] pl-4 rounded-lg">
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
          <div className="mb-4 2xl:mb-6">
            <DropdownMedium
              borderRound={"rounded-lg"}
              padding={"py-[11.5px] pr-[120px]"}
              options={[
                { id: 1, value: "internal", label: "内蔵ストレージ" },
                { id: 2, value: "external", label: "外部ストレージ" },
              ]}
              keys={"value"} // From options array
              optionLabel={"label"} // From options array
              border={"border border-gray-400"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              bg=""
              text={"text-sm"}
              additionalClass={"block w-full px-4"}
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
        <div className="w-full md:w-1/2 flex flex-col md:justify-center">
          <div className="">
            <div className="mb-4 2xl:mb-6">
              <TextPlain
                type={"text"}
                for={"recordedFileSize"}
                placeholder={intl.user_voice_recording_storage_label}
                borderRound={"rounded-xl"}
                padding={"p-[10px]"}
                focus={
                  "focus:outline-none focus:ring-2  focus:ring-customBlue "
                }
                border={"border border-gray-300"}
                bg={"bg-white "}
                additionalClass={"flex w-full pl-5 text-base pr-[30px]"}
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
                    ...{ recordedFileSize: event.target.value},
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
                  "block w-full pl-5 text-sm pr-[30px] text-[#C7C7C7]"
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
          <div className="mb-0">
            <DynamicLabel
              text={<a className="hidden md:block">&nbsp;</a>}
              textColor="#7B7B7B"
              htmlFor="vibrationOnPtt"
            />
            <div className="flex justify-end mb-0 2xl:mt-12">
              <div className="w-[125px]">
                <ActionButton
                  title={intl.help_settings_addition_keep}
                  onClick={updateVoiceRecordingSettings}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
