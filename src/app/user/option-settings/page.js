"use client";

import { useState, useEffect } from "react";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import ToggleBoxMediumRevamp from "@/components/Input/toggleBoxMediumRevamp";
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
import api from "@/utils/api";

export default function PttButtonSettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const [organizationsData, setOrganizationsData] = useState(null);
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth || false;
  const UserData = useAppSelector((state) => state.userReducer.user);
  let Admin = false;
  let orgId;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgId = User.id;
  }

  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );
  // sosScheduledTime
  const userInfo = {
    simultaneousInterpretation:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.simultaneousInterpretation,
    isTranscribe:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.isTranscribe,

    isSOS:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.isSOS,
    locationInformation:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.locationInformation,
    sosScheduledTime:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.sosScheduledTime || "5sec",

    isRecordingSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.isRecordingSettings,
  };
  const [loading, setLoading] = useState(false);
  const [userDetailsInfo, setUserDetailsInfo] = useState({});

  useEffect(() => {
    fetchData();
    setUserDetailsInfo(userInfo);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          id: Admin ? EmployeeDetails?.organizationId : orgId,
        },
      };
      let { data } = await api.get("employees/get-organization", params);
      let org = data.data.Item;
      setLoading(false);
      let response = {
        isTranslate: org.accountDetail.organization.isTranslate,
        isTranscribe: org.accountDetail.organization.isTranscribe,
        sosLocation: org.accountDetail.organization.sosLocation,
      };
      setOrganizationsData(response);
    } catch (error) {
      setLoading(false);
    }
  };

  async function optionSettingsUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "optionSettings",
        data: {
          isTranscribe: userDetailsInfo.isTranscribe,
          simultaneousInterpretation:
            userDetailsInfo.simultaneousInterpretation,
          isSOS: userDetailsInfo.isSOS,
          locationInformation: userDetailsInfo.locationInformation,
          sosScheduledTime: userDetailsInfo.sosScheduledTime,
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
        <TitleUserCard title={"オプションの設定"} />
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
                toggle={
                  organizationsData?.isTranscribe
                    ? userDetailsInfo.isTranscribe
                    : false
                }
                setToggle={(isTranscribe) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      isTranscribe: isTranscribe,
                    },
                  });
                }}
                label={"文字おこし"}
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
                isDisabled={
                  !organizationsData?.isTranscribe ||
                  !userInfo.isRecordingSettings
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="bg-input-gray py-3 pl-4 rounded-lg">
              <ToggleBoxMedium
                toggle={
                  organizationsData?.isTranslate
                    ? userDetailsInfo.simultaneousInterpretation
                    : false
                }
                setToggle={(simultaneousInterpretation) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      simultaneousInterpretation: simultaneousInterpretation,
                    },
                  });
                }}
                label={"同時通訳"}
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
                isDisabled={
                  !organizationsData?.isTranslate ||
                  !userInfo.isRecordingSettings
                }
              />
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col md:justify-between">
          <div className="bg-input-gray py-3 pl-4 rounded-lg mb-4 2xl:mb-6 items-center">
            <ToggleBoxMediumRevamp
              isDisabled={!organizationsData?.sosLocation}
              checked={userDetailsInfo.isSOS}
              setToggle={(isSOS) => {
                setUserDetailsInfo({
                  ...userDetailsInfo,
                  ...{
                    isSOS: isSOS,
                    locationInformation: isSOS
                      ? userDetailsInfo.locationInformation
                      : false,
                  },
                });
              }}
              toggle={
                organizationsData?.sosLocation
                  ? userDetailsInfo.isSOS
                  : false
              }
              id={"Id"}
            >
              <div className="text-[#434343]">{"SOS"}</div>
              <div className="text-[#A1A1A1] text-[11px]">
                <p>SOS はオンの場合、ユーザーが</p>
                <p> SOSコールを送受信可能です</p>
              </div>
            </ToggleBoxMediumRevamp>
          </div>
          <div className="bg-input-gray py-3 pl-4 rounded-lg mb-4 2xl:mb-6 items-center">
            <ToggleBoxMediumRevamp
              isDisabled={
                !organizationsData?.sosLocation || !userDetailsInfo.isSOS
              }
              checked={userDetailsInfo.locationInformation}
              setToggle={(locationInformation) => {
                setUserDetailsInfo({
                  ...userDetailsInfo,
                  ...{
                    locationInformation: locationInformation,
                  },
                });
              }}
              toggle={
                organizationsData?.sosLocation
                  ? userDetailsInfo.locationInformation
                  : false
              }
              id={"Id"}
            >
              <div className="text-[#434343]">{"位置情報"}</div>
              <div className="text-[#A1A1A1] text-[11px]">
                <p>オンの場合、SOS</p>
                <p> コールで現在の位置も送信可能です</p>
              </div>
            </ToggleBoxMediumRevamp>
          </div>
          <div className="bg-input-gray py-3 pl-4 rounded-lg mb-4 2xl:mb-6 items-center grid grid-cols-4">
            <div className="col-span-2">
              <div className="text-[#434343]">{"SOS定期時間"}</div>
              <div className="text-[#A1A1A1] text-[11px]">
                <p>SOSコールの</p>
                <p>定期時間設定</p>
              </div>
            </div>
            <div className="col-span-2">
              <div className="pl-4  pr-2 ml-auto flex justify-end">
                <select
                  disabled={
                    !organizationsData?.sosLocation ||
                    !userDetailsInfo.isSOS
                  }
                  className="rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block px-4  py-2 w-24 dark:text-black "
                  value={userDetailsInfo.sosScheduledTime}
                  onChange={(evt) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ sosScheduledTime: evt.target.value },
                    });
                  }}
                >
                  <option disabled value={""} selected className="py-4">
                    {"--選択する--"}
                  </option>
                  {[
                    { id: 1, value: "5sec", label: "5秒" },
                    { id: 2, value: "10sec", label: "10秒" },
                    { id: 3, value: "15sec", label: "15秒" },
                    { id: 4, value: "20sec", label: "20秒" },
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
          </div>
          <div className="flex justify-end mt-4 2xl:mt-20">
            <div className="w-[150px]">
              <ActionButton
                title={intl.help_settings_addition_keep}
                onClick={optionSettingsUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
