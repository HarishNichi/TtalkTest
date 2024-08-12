"use client";

import { useState } from "react";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import TitleUserCard from "../components/titleUserCard";
import ActionButton from "../components/actionButton";
import intl from "@/utils/locales/jp/jp.json";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";

export default function PttButtonSettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
    isVolumeIncreaseBtn:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttButtonSettings
        ?.volumeButtonUp,
    isVolumeDecreaseBtn:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttButtonSettings
        ?.volumeButtonDown,
    isUserSettingsBtn:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttButtonSettings
        ?.userSettings,
    quickPtt:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttButtonSettings
        ?.quickPtt,
    twoSecHold:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttButtonSettings
        ?.twoSecHold,
    fiveSecHold:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttButtonSettings
        ?.fiveSecHold,
  };
  const [loading, setLoading] = useState(false);
  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);

  async function pttButtonSettingsUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "pttButtonSettings",
        data: {
          volumeButtonUp: userDetailsInfo.isVolumeIncreaseBtn,
          volumeButtonDown: userDetailsInfo.isVolumeDecreaseBtn,
          userSettings: userDetailsInfo.isUserSettingsBtn,
          quickPtt: userDetailsInfo.quickPtt,
          twoSecHold: userDetailsInfo.twoSecHold,
          fiveSecHold: userDetailsInfo.fiveSecHold,
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
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center ">
        <TitleUserCard title={intl.user_ptt_button_settings_screen_label} />
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
        <div className="w-full md:w-1/2 md:mb-12">
          <div className="mb-4 2xl:mb-6">
            <div className="bg-input-gray py-3 pl-4 rounded-lg">
              <ToggleBoxMedium
                toggle={userDetailsInfo.isVolumeIncreaseBtn}
                setToggle={(isVolumeIncreaseBtn) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      isVolumeIncreaseBtn: isVolumeIncreaseBtn,
                    },
                  });
                }}
                label={intl.user_ptt_button_settings_volume_up}
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
                additionalClass={" "}
                labelClass={
                  "text-sm font-medium text-gray-900 dark:text-gray-300"
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="bg-input-gray py-3 pl-4 rounded-lg">
              <ToggleBoxMedium
                toggle={userDetailsInfo.isUserSettingsBtn}
                setToggle={(isUserSettingsBtn) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      isUserSettingsBtn: isUserSettingsBtn,
                    },
                  });
                }}
                label={intl.user_ptt_button_settings_user_setting_btn}
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
                additionalClass={" "}
                labelClass={
                  "text-sm font-medium text-gray-900 dark:text-gray-300"
                }
              />
            </div>
          </div>
          {userDetailsInfo.isUserSettingsBtn && (
            <div className="flex gap-x-2">
              <div>
                <label className="dark:text-black" key={"quickPtt"}>
                  <input
                    type="checkbox"
                    value={userDetailsInfo.quickPtt}
                    checked={userDetailsInfo.quickPtt}
                    onChange={(quickPtt) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{
                          quickPtt: !userDetailsInfo.quickPtt,
                        },
                      });
                    }}
                  />
                  {"クイックPTT"}
                </label>
              </div>
              <div>
                <label className="dark:text-black" key={"twoSecHold"}>
                  <input
                    type="checkbox"
                    value={userDetailsInfo.twoSecHold}
                    checked={userDetailsInfo.twoSecHold}
                    onChange={(twoSecHold) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{
                          twoSecHold: !userDetailsInfo.twoSecHold,
                        },
                      });
                    }}
                  />
                  {"長押し（2秒）"}
                </label>
              </div>
              <div>
                <label className="dark:text-black" key={"fiveSecHold"}>
                  <input
                    type="checkbox"
                    value={userDetailsInfo.fiveSecHold}
                    checked={userDetailsInfo.fiveSecHold}
                    onChange={(fiveSecHold) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{
                          fiveSecHold: !userDetailsInfo.fiveSecHold,
                        },
                      });
                    }}
                  />
                  {"長押し（5秒）"}
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 flex flex-col md:justify-between">
          <div className="mb-4">
            <div className="bg-input-gray py-3 pl-4 rounded-lg">
              <ToggleBoxMedium
                toggle={userDetailsInfo.isVolumeDecreaseBtn}
                setToggle={(isVolumeDecreaseBtn) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      isVolumeDecreaseBtn: isVolumeDecreaseBtn,
                    },
                  });
                }}
                label={intl.user_ptt_button_settings_volume_down}
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
                additionalClass={" "}
                labelClass={
                  "text-sm font-medium text-gray-900 dark:text-gray-300"
                }
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 2xl:mt-20">
            <div className="w-[125px]">
              <ActionButton
                title={intl.help_settings_addition_keep}
                onClick={pttButtonSettingsUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
