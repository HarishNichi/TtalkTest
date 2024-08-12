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

export default function NetworkAlarm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );
  const userInfo = {
    networkFailure:
      EmployeeDetails?.accountDetail?.employee?.settings?.networkFailure
        ?.failureIndication || "continuousAlarm",
  };

  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);
  const [loading, setLoading] = useState(false);

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

  function reset() {
    setUserDetailsInfo(userInfo);
  }
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={intl.user_network_failure_alarm_screen_label} />
      </div>
      <div className="flex justify-end mb-4 md:pr-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>
      <div className="w-full  md:w-[330px] mx-auto">
        <div className="mb-8">
          <DropdownMedium
            borderRound={"rounded-lg"}
            padding={"py-2.5 pr-[120px]"}
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
            label={intl.user_network_failure_alarm_repeat_setting_label}
            value={userDetailsInfo.networkFailure}
            onChange={(networkFailure) => {
              setUserDetailsInfo({
                ...userDetailsInfo,
                ...{ networkFailure: networkFailure },
              });
            }}
          />
        </div>
        <div className="mb-0 flex justify-end">
          <div className="w-[150px]">
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={updateNetworkFailureSettings}
            />
          </div>
        </div>
      </div>
    </>
  );
}
