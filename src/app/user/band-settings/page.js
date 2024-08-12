"use client";

import { useState } from "react";
import TitleUserCard from "@/app/user/components/titleUserCard";
import ActionButton from "@/app/user/components/actionButton";
import DropdownMedium from "@/components/Input/dropdownMedium";
import intl from "@/utils/locales/jp/jp.json";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
import { useRouter } from "next/navigation";
import { successToastSettings, errorToastSettings } from "@/utils/constant";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { getEmployee } from "@/redux/features/employee";

export default function QualitySettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );
  const [loading, setLoading] = useState(false);

  const userInfo = {
    quality:
      EmployeeDetails?.accountDetail?.employee?.settings?.qualitySettings
        ?.quality || "highQuality",
  };

  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);

  function reset() {
    setUserDetailsInfo(userInfo);
  }

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
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={intl.user_band_settings_title_label} />
      </div>
      <div className="flex justify-end mb-4 md:pr-5">
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
              { id: 1, value: "highQuality", label: "高品質" },
              { id: 2, value: "lowQuality", label: "標準品質" },
            ]}
            keys={"value"} // From options array
            optionLabel={"label"} // From options array
            border={"border border-gray-400"}
            focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
            bg=""
            text={"text-sm"}
            additionalClass={"block w-full px-4"}
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
        <div className="flex justify-end mb-0">
          <div className="w-[150px]">
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={qualitySettingsUpdate}
            />
          </div>
        </div>
      </div>
    </>
  );
}
