"use client";

import { useState } from "react";
import DropdownMedium from "../../../components/Input/dropdownMedium";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import TitleUserCard from "@/app/user/components/titleUserCard";
import ActionButton from "@/app/user/components/actionButton";
import intl from "@/utils/locales/jp/jp.json";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";

export default function ScreenSettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
    isBluetoothPressed:
      EmployeeDetails?.accountDetail?.employee?.settings?.screenSettings
        ?.TurnOnScreenPttBluetoothPressed,
    isDIMMode:
      EmployeeDetails?.accountDetail?.employee?.settings?.screenSettings
        ?.dimMode,
    basicScreen:
      EmployeeDetails?.accountDetail?.employee?.settings?.screenSettings
        ?.baseScreen,
  };

  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);
  const [loading, setLoading] = useState(false);
  function reset() {
    setUserDetailsInfo(userInfo);
  }

  async function screenSettingsUpdate() {
    toast.dismiss();
    setLoading(true);
    let payload = {
      id: Employee?.id,
      type: "screenSettings",
      data: {
        TurnOnScreenPttBluetoothPressed: userDetailsInfo.isBluetoothPressed,
        dimMode: userDetailsInfo.isDIMMode,
        baseScreen: userDetailsInfo.basicScreen,
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

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center ">
        <TitleUserCard title={intl.user_display_settings_screen_label} />
      </div>
      <div className="flex justify-end mb-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:gap-x-4 ">
        <div className="w-full md:w-1/2">
          <div className="mb-2 2xl:mb-6">
            <div className="bg-input-gray py-3 pr-2 pl-4 rounded-lg">
              <ToggleBoxMedium
                toggle={userDetailsInfo.isBluetoothPressed}
                setToggle={(isBluetoothPressed) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      isBluetoothPressed: isBluetoothPressed,
                    },
                  });
                }}
                label={intl.user_display_settings_bluetooth_label}
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
          <div className="hidden md:block mb-4">
            <div className="">
              <DropdownMedium
                borderRound={"rounded-lg"}
                padding={"py-2.5 pr-[120px]"}
                options={[
                  {
                    id: 1,
                    value: "home",
                    label: intl.user_display_settings_home_option1,
                  },
                  { id: 2, value: "navi", label: "ナビ" },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4"}
                id={"basicScreen"}
                labelColor={"#7B7B7B"}
                label={intl.user_display_settings_basicScreen}
                value={userDetailsInfo.basicScreen}
                onChange={(basicScreen) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ basicScreen: basicScreen },
                  });
                }}
              />
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col md:justify-between">
          <div className="mb-2 md:mb-24 2xl:mb-36">
            <div className="bg-input-gray py-3 pl-4 rounded-lg">
              <ToggleBoxMedium
                toggle={userDetailsInfo.isDIMMode}
                setToggle={(isDIMMode) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      isDIMMode: isDIMMode,
                    },
                  });
                }}
                label={intl.user_display_settings_dimMode}
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
          <div className="block md:hidden mb-4">
            <div className="">
              <DropdownMedium
                borderRound={"rounded-lg"}
                padding={"py-2.5 pr-[120px]"}
                options={[
                  {
                    id: 1,
                    value: "1",
                    label: intl.user_display_settings_home_option1,
                  },
                  { id: 2, value: "2", label: "option 02" },
                  { id: 3, value: "3", label: "option 03" },
                  { id: 4, value: "4", label: "option 04" },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4"}
                id={"basicScreen"}
                labelColor={"#7B7B7B"}
                label={intl.user_display_settings_basicScreen}
                value={userDetailsInfo.basicScreen}
                onChange={(basicScreen) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ basicScreen: basicScreen },
                  });
                }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-[150px]">
              <ActionButton
                title={intl.help_settings_addition_keep}
                onClick={screenSettingsUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
