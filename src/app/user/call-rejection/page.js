"use client";

import { useState } from "react";
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
export default function OneTouchPtt() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const sectionInputClass =
    "flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3";

  const userInfo =
    EmployeeDetails?.accountDetail?.employee?.settings?.callRejectionSettings
      ?.callRejection;
  const [loading, setLoading] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState(userInfo);
  function reset() {
    setSelectedRejection(userInfo);
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
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={"受信拒否の設定"} />
      </div>
      <div className="flex justify-end mb-4 md:pr-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>

      <div className="w-full  mx-auto">
        <div className="grid grid-cols-4 mb-8 gap-x-2">
          <div
            className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6 col-span-4 md:col-span-2"
            onChange={() => setSelectedRejection("off")}
          >
            <div
              className={`${sectionInputClass}`}
              onChange={() => setSelectedRejection("off")}
            >
              <input
                type="radio"
                name="action_value"
                className="accent-[#19388B]"
                id="off"
                value={"off"}
                checked={selectedRejection == "off"}
                defaultChecked={selectedRejection == "off"}
              />
              <label htmlFor="off" className="flex flex-1">オフ</label>
            </div>
          </div>

          <div
            className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6  col-span-4 md:col-span-2"
            onChange={() => setSelectedRejection("customGroupCallRejection")}
          >
            <div className={`${sectionInputClass}`}>
              <input
                type="radio"
                name="action_value"

                
                className="accent-[#19388B]"
                id="customGroupCallRejection"
                value={"customGroupCallRejection"}
                checked={selectedRejection == "customGroupCallRejection"}
                defaultChecked={selectedRejection == "customGroupCallRejection"}
              />
              <label htmlFor="customGroupCallRejection">
                カスタムグループコール受信拒否
              </label>
            </div>
          </div>

          <div
            className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6  col-span-4 md:col-span-2"
            onChange={() => setSelectedRejection("cloudGroupCallRejection")}
          >
            <div className={`${sectionInputClass}`}>
              <input
                type="radio"
                name="action_value"
                className="accent-[#19388B]"
                id="cloudGroupCallRejection"
                value={"cloudGroupCallRejection"}
                checked={selectedRejection == "cloudGroupCallRejection"}
                defaultChecked={selectedRejection == "cloudGroupCallRejection"}
              />
              <label htmlFor="cloudGroupCallRejection">
                クラウドグループコール受信拒否
              </label>
            </div>
          </div>

          <div className="bg-input-gray py-2 px-2 rounded-lg mb-4 2xl:mb-6  col-span-4 md:col-span-2">
            <div
              className={`${sectionInputClass}`}
              onChange={() => setSelectedRejection("individualCallRejection")}
            >
              <input
                type="radio"
                name="action_value"
                className="accent-[#19388B]"
                id="individualCallRejection"
                value={"individualCallRejection"}
                checked={selectedRejection == "individualCallRejection"}
                defaultChecked={selectedRejection == "individualCallRejection"}
              />
              <label htmlFor="individualCallRejection">
                個別コール受信拒否
              </label>
            </div>
          </div>

          <div className="mb-0 col-span-4 md:col-start-3 md:col-span-2">
            <div className="w-[150px] ml-auto">
              <ActionButton
                title={intl.help_settings_addition_keep}
                onClick={callRejectionUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
