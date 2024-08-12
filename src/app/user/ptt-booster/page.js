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

export default function PttBooster() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );
  const userInfo = {
    boosterDuration:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttBoaster
        ?.durations || "1sec",
  };

  const [loading, setLoading] = useState(false);
  const [userDetailsInfo, setUserDetailsInfo] = useState({
    boosterDuration:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttBoaster
        ?.durations || "1sec",
  });

  function reset() {
    setUserDetailsInfo(userInfo);
  }

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
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={intl.user_ptt_booster_screen_label} />
      </div>
      <div className="flex justify-end mb-4 md:pr-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>
      <div className="w-full md:w-[330px] mx-auto">
        <div className="mb-8">
          <DropdownMedium
            borderRound={"rounded-lg"}
            padding={"py-2.5 pr-[120px]"}
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
            focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
            bg=""
            text={"text-sm"}
            additionalClass={"block w-full px-4"}
            id={"boosterDuration"}
            labelColor={"#7B7B7B"}
            label={intl.user_ptt_booster_duration_label}
            value={userDetailsInfo.boosterDuration}
            onChange={(boosterDuration) => {
              setUserDetailsInfo({
                ...userDetailsInfo,
                ...{ boosterDuration: boosterDuration },
              });
            }}
          />
        </div>
        <div className="mb-0 flex justify-end">
          <div className="w-[150px]">
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={pttBoasterSettingsUpdate}
            />
          </div>
        </div>
      </div>
    </>
  );
}
