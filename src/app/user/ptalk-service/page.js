"use client";

import { useState } from "react";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import ToggleBoxMediumRevamp from "@/components/Input/toggleBoxMediumRevamp";
import DynamicLabel from "@/components/Label/dynamicLabel";
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
import { Switch } from "antd";
export default function OneTouchPtt() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
    userState:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk?.userState,
    goOffline:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk?.goOffline,
    backgroundStart:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk
        ?.backgroundStart,
  };
  const [loading, setLoading] = useState(false);
  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);

  function reset() {
    setUserDetailsInfo(userInfo);
  }

  async function pTalkUpdate() {
    toast.dismiss();
    setLoading(true);
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "pTalk",
        data: {
          userState: userDetailsInfo.userState,
          goOffline: userDetailsInfo.goOffline,
          backgroundStart: userDetailsInfo.backgroundStart,
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
        <TitleUserCard title={intl.user_ptalk_service_screen_label} />
      </div>
      <div className="flex justify-end mb-4 md:pr-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>

      <div className="w-full md:w-[330px] mx-auto" id="ptalk-service">
        <div className="mb-8">
          <div>
            <div className="bg-input-gray py-3 pl-4 rounded-lg mb-4 2xl:mb-6  items-center">
              <ToggleBoxMediumRevamp
                disabled={false}
                checked={!!userDetailsInfo.userState}
                setToggle={(userState) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      userState: userState,
                    },
                  });
                }}
                toggle={userDetailsInfo.userState}
                id={"Id"}
              >
                <div className="text-[#434343]">{intl.ptalk_service}</div>
                <div className="text-[#A1A1A1] text-[11px]">
                  <p>無線サービスをOFFにした場合</p>
                  <p> 管理者からONにすることはできません。</p>
                </div>
              </ToggleBoxMediumRevamp>
            </div>
          </div>
          <div className="mb-2">
            {/* オフラインにする */}
            <div className="bg-input-gray py-3 pl-4 rounded-lg mb-4 2xl:mb-6  items-center">
              <ToggleBoxMediumRevamp
                disabled={false}
                checked={!!userDetailsInfo.goOffline}
                setToggle={(goOffline) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      goOffline: goOffline,
                    },
                  });
                }}
                toggle={userDetailsInfo.goOffline}
                label={"オフラインにする"}
                id={"Id"}
              >
                <div className="text-[#434343]">{"オフラインにする"}</div>
                <div className="text-[#A1A1A1] text-[11px]">
                  <p>無線の送受信を停止します。</p>
                  <p> 管理者で強制的にオンラインにする</p>
                  <p>ことができます。</p>
                </div>
              </ToggleBoxMediumRevamp>
            </div>
          </div>

          <div className="bg-input-gray py-3 pl-4 rounded-lg mb-4 2xl:mb-6  items-center">
            <ToggleBoxMediumRevamp
              disabled={false}
              checked={!!userDetailsInfo.backgroundStart}
              setToggle={(backgroundStart) => {
                setUserDetailsInfo({
                  ...userDetailsInfo,
                  ...{
                    backgroundStart: backgroundStart,
                  },
                });
              }}
              toggle={userDetailsInfo.backgroundStart}
              label={"バックグラウンドで起動"}
              id={"Id"}
            >
              <div className="text-[#434343]">バックグラウンドで起動</div>
              <div className="text-[#A1A1A1] text-[11px]">
                <p>無線通信を受信しても、無線画面に</p>
                <p> 切り替えません。他のアプリと</p>
                <p>一緒に利用する際に便利です</p>
              </div>
            </ToggleBoxMediumRevamp>
          </div>

          <div className="flex justify-between mb-8 2xl:mb-6">
            {[
              { text: "利用可能", style: " bg-[#1AB517]" },
              { text: "利用不在", style: " bg-[#FFA500]" },
              { text: "利用停止", style: " bg-[#ED2E2E]" },
              { style: "bg-[#C6C3C3]", text: "利用不可" },
            ].map((el, index) => {
              return (
                <div className="flex gap-x-2 items-center" key={index}>
                  <div
                    className={`block rounded-full p-2 h-2 w-2 ${el.style}`}
                  ></div>
                  <div className="text-[#7B7B7B] text-sm">{el.text}</div>
                </div>
              );
            })}
          </div>
          <div className="mb-0 flex justify-end">
            <div className="w-[150px]">
              <ActionButton
                title={intl.help_settings_addition_keep}
                onClick={pTalkUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
