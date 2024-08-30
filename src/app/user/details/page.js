"use client";

import { useState, useEffect } from "react";
import DynamicLabel from "../../../components/Label/dynamicLabel";
import EditIcon from "@/components/Icons/editIcon";
import TitleUserCard from "@/app/user/components/titleUserCard";
import ActionButton from "@/app/user/components/actionButton";
import { useRouter } from "next/navigation";
import intl from "@/utils/locales/jp/jp.json";
import Input from "../../../components/Input/medium";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import api from "@/utils/api";
import {
  code,
  errorToastSettings,
  maxLimit,
  successToastSettings,
} from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { formatDate, updateEmployee } from "@/validation/helperFunction";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import * as Yup from "yup";
import { PASSWORD_PATTERN } from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import Modal from "@/components/Modal/modal";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
// Yup schema to validate the form
const schema = Yup.object().shape({
  password: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_PATTERN.regex, PASSWORD_PATTERN.message),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "パスワードが一致しません")
    .required(intl.validation_required),
});

export default function UserDetails() {
  const dispatch = useAppDispatch();
  const routerPath = useRouter();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [exportModal, setExportModal] = useState(false);

  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({});
  let [type1, setType1] = useState("password");
  let [type2, setType2] = useState("password");

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name == "password") {
      setPassword(value);
    } else if (name == "confirmPassword") {
      setConfirmPassword(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  useEffect(() => {
    const formValues = { password, confirmPassword };
    validateHandler(schema, formValues, setErrors);
  }, [password, confirmPassword]);

  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth ? true : false;
  const UserData = useAppSelector((state) => state.userReducer.user);
  let Admin = false;
  let orgName;
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgName = User.name;
  }

  const [userDetails, setUserDetails] = useState({
    userId: "",
    userName: "",
    furigana: "",
    companyName: "",
    companyAddress: "",
    designation: "",
    email: "",
    phone: "",
    currentAddress: "",
    device: "",
    radioNumber: "",
    onlineStatus: false,
    createdAtDate: "",
    appLastSeenDateTime: "",
    appLoginDateTime: "",
    appLogoutDateTime: "",
    viewUserActivity: false,
  });

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
        furigana: emp.furigana || "",
        companyName: org,
        onlineStatus:
          emp.accountDetail.employee.onlineStatus == "online" ? true : false,
        designation: emp.accountDetail.employee.designation,
        email: emp.accountDetail.employee.email,
        phone:
          emp.accountDetail.employee.telephoneNo &&
          "+" + emp.accountDetail.employee.telephoneNo,
        currentAddress: "",
        device: emp.accountDetail.employee.machine,
        isStatus: emp.accountDetail.employee.isStatus,
        radioNumber: emp.pttNo,
        seeUserActivity: emp.accountDetail.employee.checkOthersOnlineStatus,
        isActive: emp.isActive,
        accountDetail: emp.accountDetail,
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
      setLoading(false);
      setUserDetails(response);
      await dispatch(getEmployee(emp));
    } catch (error) {
      setLoading(false);
    }
  };

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
      setLoading(false);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        let today = data?.todayDate || dayjs().format("YYYY-MM-DD");
        let isValid = false;
        const formattedData = data.Items.map((item) => {
          if (item.startDate && item.endDate) {
            let futureDate = dayjs(today).isBefore(item.startDate);
            if (!futureDate) {
              isValid =
                dayjs(today).isSameOrBefore(item.endDate) &&
                dayjs(today).isSameOrAfter(item.startDate);
              if (!isValid) {
                item.name = item.name + " - 期限切れ";
              }
            }
          }
          return {
            id: item.id,
            value: item.id,
            label: item.name,
          };
        });
        setDeviceList(formattedData);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchOrg = async () => {
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
  function reset() {
    setUserDetails({});
  }

  async function passwordReset() {
    toast.dismiss();
    setLoading(true);
    setTouched(() => ({
      ...touched,
      confirmPassword: true,
      password: true,
    }));

    const formValues = { password, confirmPassword };
    await validateHandler(schema, formValues, setErrors);

    if (password !== confirmPassword) {
      setLoading(false);
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "パスワードが一致しません",
      }));
      setTouched(() => ({
        ...touched,
        confirmPassword: true,
        password: true,
      }));
      return;
    }

    if (
      (errors &&
        Object.keys(errors)?.length &&
        Object.keys(errors)?.length > 0) ||
      !password ||
      !confirmPassword
    ) {
      setLoading(false);
      return;
    }

    try {
      const response = await updateEmployee({
        id: Employee.id,
        type: "resetPassword",
        data: {
          password: password,
          confirmPassword: confirmPassword,
        },
      });

      setLoading(false);
      if (response?.data?.status?.code == 200) {
        toast(intl.password_updated, successToastSettings);
      }
    } catch (error) {
      setLoading(false);
      toast(
        error.response?.data?.status?.message ?? error.message,
        errorToastSettings
      );
    } finally {
      setPassword(null);
      setConfirmPassword(null);
      setExportModal(false);
      setErrors(null);
      setTouched({});
    }
  }

  useEffect(() => {
    Admin ? fetchOrg() : fetchData([]);
    fetchDevices();
  }, []);

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <div className="flex justify-between mb-4">
        <div></div>
        <TitleUserCard title={intl.user_details_screem_label} />
        <div
          className="bg-customBlue hover:bg-[#5283B3] h-8 w-8 rounded-lg flex items-center justify-center"
          onClick={() => routerPath.push("/user/edit")}
        >
          <EditIcon fill="#ffffff" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:gap-x-4 md:gap-y-4 2xl:gap-y-12 mb-4">
        <div className="w-full md:w-1/2">
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.machineName}
              textColor="#7B7B7B"
              htmlFor="machine"
            />
            <select
              disabled
              className="rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-[9px] dark:text-black"
              id={"device"}
              defaultValue={"--選択する--"}
              value={userDetails.device?.id}
              onChange={(device) => {
                setUserDetails({
                  ...userDetails,
                  ...{ device: device },
                });
              }}
            >
              {deviceList.length > 0 &&
                deviceList.map((dropDownOption, index) => (
                  <option
                    className="bg-white text-black rounded py-2"
                    id={`id-${index}`}
                    key={dropDownOption.value}
                    value={dropDownOption.value}
                  >
                    {dropDownOption.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-4 2xl:mb-6">
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
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.userId}
            />
          </div>
          {/* ptt */}
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.company_list_company_radioNumber}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="userId"
            />
            <Input
              id="radioNumber"
              type={"text"}
              isDisabled={true}
              placeholder={intl.company_list_company_radioNumber}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.radioNumber}
              onChange={(radioNo) => {
                setUserDetails({
                  ...userDetails,
                  ...{ radioNumber: radioNo },
                });
              }}
            />
          </div>
          {/* user name */}
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.user_name}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="userName"
            />
            <Input
              id="userName"
              type={"text"}
              isDisabled={true}
              placeholder={intl.user_name}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.userName}
              onChange={(name) => {
                setUserDetails({
                  ...userDetails,
                  ...{ userName: name },
                });
              }}
            />
          </div>

          {/* furigana */}
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.furigana}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="userName"
            />
            <Input
              id="furigana"
              type={"text"}
              isDisabled={true}
              placeholder={intl.furigana}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.furigana}
              onChange={(furigana) => {
                setUserDetails({
                  ...userDetails,
                  ...{ furigana: furigana },
                });
              }}
            />
          </div>
          {/* org name */}
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.form_component_company_name_label}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
              htmlFor="companyName"
            />
            <Input
              id="companyName"
              type={"text"}
              isDisabled={true}
              placeholder={intl.form_component_company_name_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.companyName}
              onChange={(companyName) => {
                setUserDetails({
                  ...userDetails,
                  ...{ companyName: companyName },
                });
              }}
            />
          </div>
          {/* desig */}
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.user_add_specify_label}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
            />
            <Input
              type={"text"}
              isDisabled={true}
              placeholder={intl.user_add_specify_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.designation}
              onChange={(designation) => {
                setUserDetails({
                  ...userDetails,
                  ...{ designation: designation },
                });
              }}
            />
          </div>
          {/* email id */}
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.user_email_id_label}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
            />
            <Input
              type={"email"}
              isDisabled={true}
              placeholder={intl.user_email_id_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              testId="content-input-email"
              value={userDetails.email}
              onChange={(email) => {
                setUserDetails({
                  ...userDetails,
                  ...{ email: email },
                });
              }}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          {/* telephone */}
          <div className="mb-4 2xl:mb-6">
            <DynamicLabel
              text={intl.user_add_telephone_number_label}
              textColor="#7B7B7B"
              fontWeight={"font-[500]"}
            />
            <Input
              type={"text"}
              isDisabled={true}
              placeholder={intl.user_add_telephone_number_label}
              borderRound={"rounded-lg"}
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
              }
              value={userDetails.phone}
              onChange={(phone) => {
                setUserDetails({
                  ...userDetails,
                  ...{ phone: phone },
                });
              }}
            />
          </div>
          {/* 登録日時  createdAtDate*/}
          <div className="mb-4 2xl:mb-6">
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
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
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
          <div className="mb-4 2xl:mb-6">
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
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
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
          <div className="mb-4 2xl:mb-6">
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
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
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
          <div className="mb-4 2xl:mb-6">
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
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
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
          <div className="mb-9 2xl:mb-12">
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
              padding={"px-[10px] py-2.5"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400"}
              bg={"bg-white"}
              additionalClass={
                "font-medium  block w-full pl-5 text-[16px] pr-[30px]"
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
          {/* status */}
          <div className="mb-4  2xl:mb-6">
            <div className="bg-input-gray py-[13px] pl-4  rounded-lg">
              <ToggleBoxMedium
                toggle={userDetails.isActive}
                setToggle={(evt) => {
                  return;
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
                additionalClass={""}
                labelClass={
                  "text-sm font-medium text-gray-900 dark:text-gray-300"
                }
                isDisabled={true}
              />
            </div>
          </div>

          <div className="hidden md:block mb-4 md:mb-0 mt-4 2xl:mt-[44px]">
            <div className="bg-input-gray py-[11px] pl-4 mt-[40px] rounded-lg">
              <ToggleBoxMedium
                toggle={userDetails.viewUserActivity}
                setToggle={(viewUserActivity) => {
                  setUserDetails({
                    ...userDetails,
                    ...{
                      viewUserActivity: viewUserActivity,
                    },
                  });
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
                additionalClass={""}
                labelClass={
                  "text-[16px] font-[500] text-gray-900 dark:text-gray-300"
                }
                isDisabled={true}
              />
            </div>
          </div>
          <div className="block md:hidden  mb-4 md:mb-0 mt-4 2xl:mt-[44px]">
            <div className="bg-input-gray py-3 pl-4 rounded-lg">
              <ToggleBoxMedium
                toggle={userDetails.seeUserActivity}
                setToggle={(seeUserActivity) => {
                  setUserDetails({
                    ...userDetails,
                    ...{
                      seeUserActivity: seeUserActivity,
                    },
                  });
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
                additionalClass={""}
                labelClass={
                  "text-[16px] font-[500] text-gray-900 dark:text-gray-300"
                }
                isDisabled={true}
              />
            </div>
          </div>
        </div>

        {exportModal && (
          <Modal
            height="500px"
            fontSize="text-xl"
            fontWeight="font-semibold"
            textColor="#19388B"
            text={intl.user_details_password_reset_btn}
            onCloseHandler={() => {
              setPassword(null);
              setConfirmPassword(null);
              setExportModal(false);
              setErrors(null);
              setTouched({});
            }}
            contentPaddingTop="pt-1"
            contentPadding="px-0"
            modalFooter={() => (
              <div className="flex gap-x-3">
                <div>
                  <IconLeftBtn
                    text="キャンセル"
                    textColor={
                      "text-white font-semibold text-sm w-full rounded-lg"
                    }
                    py={"py-2"}
                    px={"px-[10.5px] md:px-[17.5px]"}
                    bgColor={""}
                    textBold={true}
                    icon={() => {
                      return null;
                    }}
                    onClick={() => {
                      setPassword(null);
                      setConfirmPassword(null);
                      setExportModal(false);
                      setErrors(null);
                      setTouched({});
                    }}
                  />
                </div>
                <div>
                  <IconLeftBtn
                    text={intl.reset_submit_btn}
                    textColor={
                      "text-white font-semibold text-sm w-full rounded-lg"
                    }
                    py={"py-2"}
                    px={"px-[10.5px] md:px-[17.5px]"}
                    bgColor={""}
                    textBold={true}
                    icon={() => {
                      return null;
                    }}
                    onClick={() => {
                      passwordReset();
                    }}
                  />
                </div>
              </div>
            )}
          >
            <div className="flex flex-col">
              <div className="flex-grow py-[27px]">
                <form className="grid grid-cols-1 gap-y-3">
                  <div className="flex flex-col">
                    <div
                      className={`flex items-center ${
                        errors?.password && touched?.password ? "" : "mb-8"
                      }`}
                    >
                      <input
                        type={type1}
                        id="password"
                        value={password}
                        name="password"
                        className={`rounded-xl
                        py-3
                        focus:outline-none focus:ring-2 focus:ring-customBlue
                        border border-gray-400
                        block w-full pl-5 text-sm pr-[30px] font-medium text-black`}
                        placeholder={intl.reset_new_password_label}
                        onChange={(event) => {
                          handleChange(event);
                        }}
                      />
                      {type1 == "password" ? (
                        <IoEyeOffOutline
                          className="text-2xl text-[#A3A3A3] -ml-12"
                          onClick={() => {
                            setType1("text");
                          }}
                        />
                      ) : (
                        <IoEyeOutline
                          className="text-2xl text-[#A3A3A3] -ml-12"
                          onClick={() => {
                            setType1("password");
                          }}
                        />
                      )}
                    </div>
                    {errors?.password && touched?.password && (
                      <div
                        className="mb-8 pl-1 validation-font text-left"
                        style={{ color: "red" }}
                      >
                        {errors?.password}
                      </div>
                    )}
                    <div
                      className={`flex items-center ${
                        errors?.confirmPassword && touched?.confirmPassword
                          ? ""
                          : ""
                      }`}
                    >
                      <input
                        type={type2}
                        id="passwordConfirm"
                        name="confirmPassword"
                        value={confirmPassword}
                        className={`rounded-xl
                        py-3
                        focus:outline-none focus:ring-2 focus:ring-customBlue
                        border border-gray-400
                        block w-full pl-5 text-sm pr-[30px] font-medium text-black`}
                        placeholder={
                          intl.forgot_autenticate_password_placeholder
                        }
                        onChange={(event) => {
                          handleChange(event);
                        }}
                      />
                      {type2 == "password" ? (
                        <IoEyeOffOutline
                          className="text-2xl text-[#A3A3A3] -ml-12"
                          onClick={() => {
                            setType2("text");
                          }}
                        />
                      ) : (
                        <IoEyeOutline
                          className="text-2xl text-[#A3A3A3] -ml-12"
                          onClick={() => {
                            setType2("password");
                          }}
                        />
                      )}
                    </div>
                    {errors?.confirmPassword && touched?.confirmPassword && (
                      <div
                        className="mb-4 text-left pl-1 validation-font text-left"
                        style={{ color: "red" }}
                      >
                        {errors?.confirmPassword}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </Modal>
        )}
      </div>

      <div className="flex flex-shrink justify-end max-w-max float-right">
        <ActionButton
          title={intl.user_details_password_reset_btn}
          onClick={() => {
            setErrors(null);
            setExportModal(true);
          }}
        />
      </div>
    </>
  );
}
