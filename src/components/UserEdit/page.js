"use client";

import { useState } from "react";
import DynamicLabel from "@/components/Label/dynamicLabel";
import Input from "@/components/Input/medium";
import { useEffect } from "react";
import ActionButton from "@/app/dashboard/components/actionButton";
import TitleUserCard from "@/app/user/components/titleUserCard";
import intl from "@/utils/locales/jp/jp.json";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import { useAppSelector } from "@/redux/hooks";
import api from "@/utils/api";
import { code, maxLimit, successToastSettings } from "@/utils/constant";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import DropdownMedium from "@/components/Input/dropdownMedium";
import * as Yup from "yup";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import {
  MAX_50_LENGTH_PATTERN,
  EMAIL_PATTERN,
  MAX_100_LENGTH_PATTERN,
} from "@/validation/validationPattern";
import { formatDate, validateHandler } from "@/validation/helperFunction";

// Yup schema to validate the form
const schema = Yup.object().shape(
  {
    userName: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    furigana: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    radioNumber: Yup.string(),
    companyName: Yup.string().required(intl.validation_required),
    designation: Yup.string().required(intl.validation_required),
    phone: Yup.string().when("phone", (val, schema) => {
      if (!val || val == "") {
        return Yup.string().notRequired();
      }
      if (val?.length > 0) {
        return Yup.string()
          .matches(
            /^\+?([0-9]{2})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{5})$/,
            intl.mobile_format_message
          )
          .max(13, intl.mobile_format_message);
      } else {
        return Yup.string().notRequired();
      }
    }),
    email: Yup.string().when("email", (val, schema) => {
      if (!val || val == "") {
        return Yup.string().notRequired();
      }
      if (val?.length > 0) {
        return Yup.string()
          .matches(EMAIL_PATTERN.regex, EMAIL_PATTERN.message)
          .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message);
      } else {
        return Yup.string().notRequired();
      }
    }),

    seeUserActivity: Yup.boolean(),
    device: Yup.string().required(intl.validation_required),
  },
  [
    ["phone", "phone"],
    ["email", "email"],
  ]
);

export default function UserEdit({ setIsModalOpen, setComCreated }) {
  const [progressBarPtt, setProgressBarPtt] = useState(0);
  const [progressBarNotification, setProgressBarNotification] = useState(0);
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const [deviceList, setDeviceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [organizationList, setOrganizationsData] = useState([]);

  // ---------------------- FOR VALIDATIONS ----------------------------- //
  const [errors, setErrors] = useState(null);
  const [touched, setTouched] = useState({});
  // ---------------------- FOR VALIDATIONS ENDS------------------------- //

  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const UserData = useAppSelector((state) => state.userReducer.user);
  let Admin = false;
  let orgId;
  let orgName;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgId = User.id;
    orgName = User.name;
  }

  const userInfo = {
    userName: "",
    furigana: "",
    radioNumber: "",
    companyName: "",
    designation: "",
    email: "",
    phone: "",
    currentAddress: "",
    companyAddress: "",
    seeUserActivity: false,
    device: "",
  };

  const [userDetails, setUserDetails] = useState({
    userId: "",
    userName: "",
    furigana: "",
    radioNumber: "",
    companyName: "",
    companyAddress: "",
    designation: "",
    email: "",
    phone: "",
    currentAddress: "",
    device: "",
    seeUserActivity: false,
  });

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [furigana, setFurigana] = useState("");
  const [radioNumber, setRadioNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [device, setDevice] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [seeUserActivity, setSeeUserActivity] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState("");
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const formValues = {
      userName,
      furigana,
      companyName,
      device,
      designation,
      email,
      phone,
    };
    validateHandler(schema, formValues, setErrors);
  }, [userName, furigana, companyName, device, designation, email, phone]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
        },
      };
      const response = await api.get("devices/list", params);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        let today = data?.todayDatetodayDate || dayjs().format("YYYY-MM-DD");
        let isValid = false;
        const formattedData = data.Items.map((item) => {
          item.disabled = false;
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            if (!futureDate) {
              isValid =
                dayjs(today).isSameOrBefore(item.endDate) &&
                dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                item.name = item.name + " - 期限切れ";
                item.disabled = true;
              }
            }
          }
          return {
            label: item.name,
            id: item.id,
            value: item.id,
            disabled: item.disabled,
          };
        });
        setDeviceList(formattedData);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const fetchData = async (projectionList) => {
    setLoading(true);
    try {
      const params = {
        params: {
          id: Employee.id,
        },
      };
      let { data } = await api.get("employees/get", params);
      let emp = data.data.Item;
      let org = Admin
        ? findName(emp.organizationId, projectionList) || "-"
        : orgName;
      let response = {
        userId: emp.id,
        userName: emp.name,
        furigana: emp.furigana,
        radioNumber: emp.pttNo,
        organizationId: emp.organizationId,
        companyName: org,
        isActive: emp.isActive,
        onlineStatus: emp.accountDetail.employee.onlineStatus,
        phoneStatus: emp.accountDetail.employee.phoneStatus,
        designation: emp.accountDetail.employee.designation,
        email: emp.accountDetail.employee.email,
        phone:
          emp.accountDetail.employee.telephoneNo &&
          "+" + emp.accountDetail.employee.telephoneNo,
        device: emp.accountDetail.employee.machine?.id,
        seeUserActivity:
          emp.accountDetail.employee.checkOthersOnlineStatus || false,
        createdAtDate:
          emp.createdAtDate && dayjs(emp.createdAtDate).format("YYYY/MM/DD"),
        appLastSeenDateTime:
          emp.appLastSeenDateTime && formatDate(emp.appLastSeenDateTime),
        appLoginDateTime:
          emp.appLoginDateTime && formatDate(emp.appLoginDateTime, true),
        appLogoutDateTime:
          emp.appLogoutDateTime && formatDate(emp.appLogoutDateTime, true),
        appVersion: emp.appVersion,
        viewUserActivity:
          emp.accountDetail.employee.checkOthersOnlineStatus || false,
      };

      setUserDetails(response);
      setUserId(response.userId);
      setUserName(response.userName);
      setFurigana(response.furigana);
      setRadioNumber(response.radioNumber);
      setCompanyName(org);
      setCompanyId(response.organizationId);
      setDevice(response.device);
      setDesignation(response.designation);
      setPhoneStatus(response.phoneStatus);
      setOnlineStatus(response.onlineStatus);
      setIsActive(response.isActive);
      setEmail(response.email);
      setPhone(response.phone);
      setSeeUserActivity(response.seeUserActivity);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const updateUser = async (record, name) => {
    toast.dismiss();
    const selectedDevice = deviceList.find((el) => el.id == device);
    let payload = {
      id: Employee.id,
      name: userName,
      furigana: furigana,
      organizationId: companyId,
      isActive: isActive,
      accountDetail: {
        employee: {
          machine: { id: selectedDevice.id, name: selectedDevice.label },
          designation: designation,
          phoneStatus: phoneStatus,
          email: email,
          telephoneNo: phone ? parseInt(phone) + "" : "",
          onlineStatus: onlineStatus,
          checkOthersOnlineStatus: seeUserActivity,
          viewUserActivity: seeUserActivity,
        },
      },
    };
    const formValues = {
      userName,
      furigana,
      radioNumber,
      companyName,
      designation,
      email,
      seeUserActivity,
      device,
      phone,
    };
    await validateHandler(schema, formValues, setErrors);
    if (errors && Object.keys(errors).length > 0) {
      const formValues = {
        userName,
        furigana,
        radioNumber,
        companyName,
        designation,
        email,
        seeUserActivity,
        device,
        phone,
      };
      await setTouched(() => ({
        ...touched,
        ["userName"]: true,
        ["furigana"]: true,
        ["companyName"]: true,
        ["designation"]: true,
        ["email"]: true,
        ["device"]: true,
        ["phone"]: true,
      }));

      await validateHandler(schema, formValues, setErrors);
    } else {
      setLoading(true);
      try {
        await api.put(`employees/update`, payload);
        setLoading(false);
        setIsModalOpen(false);

        router.push("/user-details");

        toast("正常に保存しました。", successToastSettings);
      } catch (error) {
        setLoading(false);

        toast(
          error.response?.data?.status?.message
            ? error.response?.data?.status?.message
            : error?.response?.data?.message,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            type: "error",
          }
        );
      }
    }
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      let { data: projectionList } = await api.post(
        "organizations/projection",
        {}
      );
      await fetchData(projectionList.data.Items);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  function findName(orgId, projectionList) {
    let orgName = projectionList.find((el) => el.id == orgId);
    return orgName?.name || "";
  }
  useEffect(() => {
    fetchDevices();
    Admin && fetchOrganizations();
    fetchData([]);
  }, []);

  useEffect(() => {
    if (Admin) {
      setCompanyName(orgId);
      setCompanyId(orgId);
    }
  }, []);
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />

      <div className="flex p-[40px] pb-0 justify-center items-center">
        <TitleUserCard title={intl.user_edit_screen_label} />
      </div>
      <div
        className="flex flex-col h-full p-[40px] pt-[32px] pb-0 "
        style={{ maxHeight: "450px", overflow: "auto" }}
      >
        <div className="w-full">
          {/* device - >>>>>>>>>>>>>>>>>>>> */}
          <div className="mb-[32px]">
            <DynamicLabel
              text={intl.machineName}
              textColor="#7B7B7B font text-base font-semibold"
              htmlFor="userName"
              isRequired={true}
            />

            <select
              className="rounded-lg border h-[40px] border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-[8px] truncate dark:text-black"
              id={"device"}
              defaultValue={""}
              value={device}
              onChange={(evt) => {
                setDevice(evt.target.value);
                setTouched(() => ({ ...touched, ["device"]: true }));
              }}
            >
              <option defaultValue={""} value="" style={{ fontSize: "14px" }}>
                {"--選択する--"}
              </option>
              {deviceList.length > 0 &&
                deviceList.map((dropDownOption, index) => {
                  // Check if the length of the option label is greater than a certain number of characters
                  const maxLabelLength = 50; // You can adjust this value as needed
                  const optionLabel =
                    dropDownOption.label.length > maxLabelLength
                      ? `${dropDownOption.label.substring(
                          0,
                          maxLabelLength
                        )}...` // Truncate the label
                      : dropDownOption.label; // Use the full label if not too long

                  return (
                    <option
                      className="bg-white text-black rounded py-2"
                      id={`id-${index}`}
                      key={dropDownOption.value}
                      value={dropDownOption.value}
                      disabled={dropDownOption.disabled || false}
                    >
                      {optionLabel}
                    </option>
                  );
                })}
            </select>
            {touched && errors && errors.device && touched.device && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors.device}
              </div>
            )}
          </div>
          {/* user id */}
          <div className="mb-[32px]">
            <DynamicLabel
              text={intl.user_userId_label}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="userId"
            />
            <Input
              id="userId"
              type={"text"}
              isDisabled={true}
              placeholder={intl.user_userId_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 h-[40px] text-[16px] pr-[30px]"
              }
              value={userId}
            />
          </div>

          {/* radioNumber */}
          <div className="mb-[32px]">
            <DynamicLabel
              isRequired={true}
              text={intl.company_list_company_radioNumber}
              textColor="#7B7B7B"
              htmlFor="pttNumber"
            />
            <Input
              isDisabled={true}
              id="pttNumber"
              type={"text"}
              placeholder={intl.company_list_company_radioNumber}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={""}
              additionalClass={
                "font-medium  block h-[40px] w-full pl-5 text-sm pr-[30px]"
              }
              value={radioNumber}
            />
          </div>

          {/* user_name */}
          <div className="mb-[32px]">
            <DynamicLabel
              isRequired={true}
              text={intl.user_name}
              textColor="#7B7B7B"
              htmlFor="userName"
            />
            <Input
              id="userName"
              type={"text"}
              placeholder={intl.user_name}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={""}
              additionalClass={
                "font-medium  block h-[40px] w-full pl-5 text-sm pr-[30px]"
              }
              value={userName}
              onChange={async (evt) => {
                setUserName(() => evt.target.value);
                await setTouched(() => ({ ...touched, ["userName"]: true }));
              }}
            />
            {touched && errors && errors["userName"] && touched["userName"] && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors["userName"]}
              </div>
            )}
          </div>
          {/* furigana */}
          <div className="mb-[32px]">
            <DynamicLabel
              isRequired={true}
              text={intl.furigana}
              textColor="#7B7B7B"
              htmlFor="furigana"
            />
            <Input
              id="furigana"
              type={"text"}
              placeholder={intl.furigana}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={""}
              additionalClass={
                "font-medium  h-[40px] block w-full pl-5 text-sm pr-[30px]"
              }
              value={furigana}
              onChange={async (evt) => {
                setFurigana(() => evt.target.value);
                await setTouched(() => ({ ...touched, ["furigana"]: true }));
              }}
            />
            {touched && errors && errors["furigana"] && touched["furigana"] && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors["furigana"]}
              </div>
            )}
          </div>

          {/* orgname */}
          <div className="mb-[32px]">
            <DynamicLabel
              text={intl.form_component_company_name_label}
              textColor="#7B7B7B"
              htmlFor="companyName"
            />
            <Input
              id="companyName"
              type={"text"}
              isDisabled={true}
              placeholder={intl.form_component_company_name_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium h-[40px] block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={companyName}
            />
          </div>
          {/* designation */}
          <div className="mb-[32px]">
            <DynamicLabel
              isRequired={true}
              text={intl.user_add_specify_label}
              textColor="#7B7B7B"
            />
            <Input
              type={"text"}
              placeholder={intl.user_add_specify_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={""}
              additionalClass={
                "font-medium h-[40px]  block w-full pl-5 text-sm pr-[30px]"
              }
              value={designation}
              onChange={async (evt) => {
                setDesignation(() => evt.target.value);
                await setTouched(() => ({ ...touched, ["designation"]: true }));
              }}
            />
            {touched &&
              errors &&
              errors["designation"] &&
              touched["designation"] && (
                <div className="pl-1 validation-font" style={{ color: "red" }}>
                  {errors["designation"]}
                </div>
              )}
          </div>

          {/* メールID *  user_email_id_label*/}
          <div className="mb-[32px]">
            <DynamicLabel
              isRequired={false}
              text={intl.user_email_id_label}
              textColor="#7B7B7B"
            />
            <Input
              type={"email"}
              placeholder={intl.user_email_id_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={""}
              additionalClass={
                "font-medium h-[40px] block w-full pl-5 text-sm pr-[30px]"
              }
              testId="content-input-email"
              value={email}
              onChange={async (evt) => {
                setEmail(() => evt.target.value);
                await setTouched(() => ({ ...touched, ["email"]: true }));
              }}
            />
            {touched && errors && errors["email"] && touched["email"] && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors["email"]}
              </div>
            )}
          </div>
        </div>

        <div className="w-full ">
          {/* phone ->>>>>>>>>>>>>>>> */}
          <div className="mb-[32px]">
            <DynamicLabel
              text={intl.user_add_telephone_number_label}
              textColor="#7B7B7B"
            />
            <Input
              id="phone"
              name="phone"
              type={"text"}
              placeholder={intl.user_add_telephone_number_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={""}
              additionalClass={
                "font-medium h-[40px] block w-full pl-5 text-sm pr-[30px]"
              }
              value={phone}
              onChange={async (evt) => {
                setPhone(evt.target.value);
                if (!evt.target.value) {
                  return;
                }
                await setTouched(() => ({ ...touched, ["phone"]: true }));
              }}
            />
            {touched && errors && errors["phone"] && touched["phone"] && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors["phone"]}
              </div>
            )}
          </div>

          {/* 登録日時  createdAtDate*/}
          <div className="mb-[32px]">
            <DynamicLabel
              text={"登録日時"}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="createdAtDate"
            />
            <Input
              id="createdAtDate"
              type={"text"}
              isDisabled={true}
              placeholder={"登録日時"}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium h-[40px] block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.createdAtDate}
              onChange={(createdAtDate) => {
                setUserDetails({
                  ...userDetails,
                  ...{ createdAtDate: createdAtDate },
                });
              }}
            />
          </div>

          {/* 最終オンライン日時  appLastSeenDateTime*/}
          <div className="mb-[32px]">
            <DynamicLabel
              text={"最終オンライン日時"}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
            />
            <Input
              type={"text"}
              isDisabled={true}
              placeholder={"最終オンライン日時"}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium h-[40px] block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.appLastSeenDateTime}
              onChange={(appLastSeenDateTime) => {
                setUserDetails({
                  ...userDetails,
                  ...{
                    appLastSeenDateTime: appLastSeenDateTime,
                  },
                });
              }}
            />
          </div>

          {/* 利用開始日  appLoginDateTime*/}
          <div className="mb-[32px]">
            <DynamicLabel
              text={"利用開始日"}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="appLoginDateTime"
            />
            <Input
              id="appLoginDateTime"
              type={"text"}
              isDisabled={true}
              placeholder={"利用開始日"}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium h-[40px]  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.appLoginDateTime}
              onChange={(appLoginDateTime) => {
                setUserDetails({
                  ...userDetails,
                  ...{ appLoginDateTime: appLoginDateTime },
                });
              }}
            />
          </div>
          {/* 利用停止日 appLogOutDateTime*/}
          <div className="mb-[32px]">
            <DynamicLabel
              text={"利用停止日"}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
            />
            <Input
              type={"text"}
              isDisabled={true}
              placeholder={"利用停止日"}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium h-[40px] block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.appLogoutDateTime}
              onChange={(appLogoutDateTime) => {
                setUserDetails({
                  ...userDetails,
                  ...{ appLogoutDateTime: appLogoutDateTime },
                });
              }}
            />
          </div>
          {/* バージョン  version*/}
          <div className="mb-[20px]">
            <DynamicLabel
              text={"バージョン"}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="version"
            />
            <Input
              id="version"
              type={"text"}
              isDisabled={true}
              placeholder={"バージョン"}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block h-[40px] w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.appVersion}
              onChange={(version) => {
                setUserDetails({
                  ...userDetails,
                  ...{ version: version },
                });
              }}
            />
          </div>

          {/* onlineStatus - <<<<<<<<<<<<<<<<<<<<*/}
          <div className="">
            <div className="   ">
              <ToggleBoxMedium
                toggle={isActive}
                setToggle={(evt) => {
                  setIsActive(evt);
                }}
                label={intl.company_list_company_status}
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
                additionalClass={"h-[40px]"}
                labelClass={
                  "text-sm font-medium text-gray-900 dark:text-gray-300"
                }
              />
            </div>
          </div>

          {/* activity - no vaidation  */}
          <div className="">
            <div className=" mb-[10px]   ">
              <ToggleBoxMedium
                toggle={seeUserActivity}
                setToggle={(evt) => {
                  setSeeUserActivity(evt);
                }}
                label={intl.user_is_see_user_activity}
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
                additionalClass={"h-[40px]"}
                labelClass={
                  "text-sm font-medium text-gray-900 dark:text-gray-300"
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex  w-full px-[40px] mb-[32px]">
        <ActionButton
          title={intl.help_settings_addition_keep}
          onClick={updateUser}
        />
      </div>
    </>
  );
}
