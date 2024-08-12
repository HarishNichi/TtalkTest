"use client";

import { useEffect, useState } from "react";
import DropdownMedium from "../../../components/Input/dropdownMedium";
import { HiSearch } from "react-icons/hi";
import TitleUserCard from "../components/titleUserCard";
import ActionButton from "../components/actionButton";
import IconAjaxDropdown from "@/components/Input/iconAjaxDropdown";
import { updateEmployee, fetchEmpData } from "@/validation/helperFunction";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import intl from "@/utils/locales/jp/jp.json";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import api from "@/utils/api";
import { getEmployee } from "@/redux/features/employee";
import {
  code,
  errorToastSettings,
  maxLimit,
  successToastSettings,
} from "@/utils/constant";
import * as Yup from "yup";
import { validateHandler } from "@/validation/helperFunction";

export default function SOS() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );
  const [contactList, setContactData] = useState([]);
  const [groupList, setGroupListData] = useState([]);
  const [inputValue, setInputValue] = useState([]);
  const userInfo = {
    btnSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.sos?.actionForSOS ||
      "volumeUpButton",
    contactSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.sos?.sosPerson ||
      "off",
  };

  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);

  let ptt =
    EmployeeDetails?.accountDetail?.employee?.settings?.sos?.pttNo || "";

  const [ajaxDropdownValue, setAjaxDropdownValue] = useState(ptt);
  const [loading, setLoading] = useState(false);
  const [searchList, setSearchList] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Yup schema to validate the form
  const schema = Yup.object().shape({
    ajaxDropdownValue: Yup.mixed(),
  });

  useEffect(() => {
    setAjaxDropdownValue(ptt);
  }, []);

  useEffect(() => {
    const formValues = { ajaxDropdownValue };
    // Check if ajaxDropdownValue is not in the search list
    if (
      !searchList.some(
        (item) => item.id === ajaxDropdownValue.id || ajaxDropdownValue
      )
    ) {
      if (
        (userDetailsInfo.contactSettings == "pttGroup" &&
          groupList.length > 0) ||
        (userDetailsInfo.contactSettings == "pttNO" && contactList.length > 0)
      ) {
        setTouched({ ...touched, ajaxDropdownValue: true });
        setErrors({
          ajaxDropdownValue: "検索リストから値を選択してください。",
        });
      }
    } else {
      validateHandler(schema, formValues, setErrors);
    }
  }, [ajaxDropdownValue, searchList]);

  useEffect(() => {
    if (inputValue.length > 0) {
      let searchResult = searchList.filter((data) => {
        // You might want to adjust this condition based on your search criteria
        return data.id.toLowerCase().includes(inputValue.toLowerCase());
      });
      setSearchList(searchResult);
    } else {
      if (
        userDetailsInfo.contactSettings == "pttGroup" &&
        groupList.length > 0
      ) {
        setSearchList(groupList);
      }
      if (userDetailsInfo.contactSettings == "pttNO" && groupList.length > 0) {
        setSearchList(contactList);
      }
    }
  }, [inputValue]);

  async function sosSettingsUpdate() {
    toast.dismiss();
    if (Employee?.id && !errors) {
      setLoading(true);
      let payload = {
        id: Employee.id,
        type: "sos",
        data: {
          actionForSOS: userDetailsInfo.btnSettings,
          sosPerson: userDetailsInfo.contactSettings,
          pttNo:
            userDetailsInfo.contactSettings == "off"
              ? ""
              : ajaxDropdownValue.id || ajaxDropdownValue,
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

  function getIconWithClass(cls) {
    return <HiSearch className={cls} />;
  }

  useEffect(() => {
    fetchData();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (
      userDetailsInfo.contactSettings == "pttGroup" &&
      groupList?.length > 0
    ) {
      setSearchList(() => groupList);
      setAjaxDropdownValue(
        EmployeeDetails?.accountDetail?.employee?.settings?.sos?.sosPerson ==
          "pttGroup"
          ? EmployeeDetails?.accountDetail?.employee?.settings?.sos?.pttNo
          : ""
      );
    }
    if (userDetailsInfo.contactSettings == "pttNO" && contactList?.length > 0) {
      setSearchList(() => contactList);
      setAjaxDropdownValue(
        EmployeeDetails?.accountDetail?.employee?.settings?.sos?.sosPerson ==
          "pttNO"
          ? EmployeeDetails?.accountDetail?.employee?.settings?.sos?.pttNo
          : ""
      );
    }
    if (userDetailsInfo.contactSettings == "off") {
      setAjaxDropdownValue(() => "");
      setErrors(undefined);
      setSearchList(() => [{ key: 1, name: "", id: "" }]);
    }
  }, [userDetailsInfo.contactSettings, groupList, contactList]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
        },
      };
      let { data: response } = await api.get("groups/list", params);
      response = response.data.Items.map((group, index) => {
        return {
          key: index,
          id: group.groupId,
          name: group.groupId,
        };
      });
      setGroupListData(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
        },
      };
      const response = await api.get("contacts/list", params);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedData = data.Items.filter((el) => !el.isDeleted).map((item, index) => {
          return {
            key: index,
            id: item.pttNo,
            name: item.pttNo,
          };
        });

        setContactData(formattedData);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast(error.response?.data?.status.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={"SOS"} />
      </div>
      <div className="flex justify-end mb-4 md:pr-4">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:gap-x-4">
        <div className="w-full mb-0 md:w-1/2">
          <div className="mb-2">
            <DropdownMedium
              borderRound={"rounded-lg"}
              padding={"py-2.5 pr-[120px]"}
              options={[
                {
                  id: 1,
                  value: "volumeUpButton",
                  label: intl.user_sos_volume_btn_increase,
                },
                {
                  id: 2,
                  value: "volumeDownButton",
                  label: "音量ボタンを長押し(-)",
                },
                { id: 3, value: "pttButton", label: "PTTボタンを長押し" },
              ]}
              keys={"value"} // From options array
              optionLabel={"label"} // From options array
              border={"border border-gray-400"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              bg=""
              text={"text-sm"}
              additionalClass={"block w-full px-4"}
              id={"btnSettings"}
              labelColor={"#7B7B7B"}
              label={intl.sos_button_settings}
              value={userDetailsInfo.btnSettings}
              onChange={(btnSettings) => {
                setUserDetailsInfo({
                  ...userDetailsInfo,
                  ...{ btnSettings: btnSettings },
                });
              }}
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col md:justify-between">
          <div className="mb-4 2xl:mb-6">
            <div className="mb-4 2xl:mb-6">
              <DropdownMedium
                borderRound={"rounded-lg"}
                padding={"py-2.5 pr-[120px]"}
                isRequired={true}
                options={[
                  {
                    id: 1,
                    value: "pttNO",
                    label: intl.user_sos_designation_ptt_option1,
                  },
                  { id: 2, value: "pttGroup", label: "指定グループ" },
                  { id: 3, value: "off", label: "オフ" },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4"}
                id={"contactSettings"}
                labelColor={"#7B7B7B"}
                label={intl.user_sos_contact_settings}
                value={userDetailsInfo.contactSettings}
                onChange={(contactSettings) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ contactSettings: contactSettings },
                  });
                }}
              />
            </div>
            <div className="mb-0">
              <IconAjaxDropdown
                isDisabled={
                  userDetailsInfo.contactSettings == "off" ? true : false
                }
                keyOfTheData={"id"}
                type={"text"}
                icon={() => getIconWithClass(" text-gray-300 text-[18px]")}
                placeholder={intl.user_sos_company_search_placeholder_ptt}
                borderRound={"rounded-lg"}
                padding={"p-[10px]"}
                border={"border border-gray-400"}
                additionalClass={`  
                focus:outline-none focus:ring-2 focus:ring-customBlue max-h-[300px] overflow-auto dark:text-black
                `}
                options={[{ id: "1", name: "test" }]}
                value={ajaxDropdownValue}
                onChange={setAjaxDropdownValue}
                onInput={(val) => {
                  setInputValue(val);
                }}
                data={searchList}
              />
              {errors?.ajaxDropdownValue && touched?.ajaxDropdownValue && (
                <div
                  className="mb-8 pl-1 validation-font"
                  style={{ color: "red" }}
                >
                  {errors?.ajaxDropdownValue}
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end">
            <div className="w-[150px]">
              <ActionButton
                title={intl.help_settings_addition_keep}
                onClick={sosSettingsUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
