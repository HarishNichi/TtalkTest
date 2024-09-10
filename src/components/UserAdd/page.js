"use client";

import { useState, useEffect } from "react";
import DropdownMedium from "@/components/Input/dropdownMedium";
import DynamicLabel from "@/components/Label/dynamicLabel";
import Input from "@/components/Input/medium";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import {
  breadUserCrumbLinks,
  code,
  errorToastSettings,
  maxLimit,
} from "@/utils/constant";
import intl from "@/utils/locales/jp/jp.json";
import TitleUserCard from "@/app/user/components/titleUserCard";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import {
  MAX_50_LENGTH_PATTERN,
  EMAIL_PATTERN,
  MAX_100_LENGTH_PATTERN,
} from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import api from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import ProtectedRoute from "@/utils/auth";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Yup schema to validate the form
const schema = Yup.object().shape(
  {
    userName: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
    furigana: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),

    organization: Yup.string().required(intl.validation_required),
    designation: Yup.string()
      .required(intl.validation_required)
      .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message),

    telephoneNo: Yup.string().when("telephoneNo", (val, schema) => {
      if (val == null || val == "") {
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
    emailId: Yup.lazy((value) => {
      if (value?.length > 0) {
        return Yup.string()
          .email()
          .matches(EMAIL_PATTERN.regex, EMAIL_PATTERN.message)
          .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message);
      }
      return Yup.string().notRequired();
    }),

    machine: Yup.string().required(intl.validation_required),
  },
  ["telephoneNo", "telephoneNo"],
  ["emailId", "emailId"]
);

export default function AddUser({
  setIsModalOpen,
  setComCreated,
  setCount,
  count,
}) {
  const [user, setUser] = useState({
    phoneStatus: "active",
    onlineStatus: "online",
    machine: "",
    organization: "",
  });
  const router = useRouter();

  // ---------------------- FOR VALIDATIONS ----------------------------- //
  const [errors, setErrors] = useState(null);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [organizationList, setOrganizationsData] = useState([]);
  const [deviceList, setDevices] = useState([]);

  const [userName, setUserName] = useState("");
  const [furigana, setFurigana] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [emailId, setEmailId] = useState("");
  const [telephoneNo, setTelephoneNo] = useState("");
  const [machine, setMachine] = useState("");
  const [onlineStatus, setOnlineStatus] = useState("online");
  const [seeUserActivity, setSeeUserActivity] = useState(false);

  // ---------------------- FOR VALIDATIONS ENDS------------------------- //

  const cardStyle = {
    background: "#FFFFFF",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: "9px",
  };

  const fetchData = async () => {
    setLoading(false);
    try {
      let { data: response } = await api.post("organizations/projection", {});
      response = response.data.Items.map((org, index) => {
        return {
          id: org.id,
          name: org.name,
          label: org.name,
          value: org.id,
          disabled: !org.accountDetail.organization.isStatus,
        };
      });
      setOrganizationsData(response);
      await fetchDevices();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
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
        let today = data?.todayDate || dayjs().format("YYYY-MM-DD");
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
        setDevices(formattedData);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const formValues = {
      userName,
      furigana,
      organization,
      machine,
      designation,
      emailId,
      telephoneNo,
    };
    validateHandler(schema, formValues, setErrors);
  }, [
    userName,
    furigana,
    organization,
    machine,
    designation,
    emailId,
    telephoneNo,
  ]);

  const createUser = async (record, name) => {
    toast.dismiss();
    if (errors && Object.keys(errors).length > 0) {
      const formValues = {
        userName: userName,
        furigana: furigana,
        organization: organization,
        machine: machine,
        designation: designation,
        emailId: emailId,
      };

      await setTouched(() => ({
        ...touched,
        ["userName"]: true,
        ["furigana"]: true,
        ["organization"]: true,
        ["machine"]: true,
        ["designation"]: true,
        ["emailId"]: true,
      }));
      await validateHandler(schema, formValues, setErrors);
    } else {
      setLoading(true);
      try {
        await api.post(`employees/create`, record);
        setLoading(false);
        setIsModalOpen(false);
        setCount(count + 1);
      } catch (error) {
        setLoading(false);
        toast(
          error.response?.data?.status?.message ?? error?.message,
          errorToastSettings
        );
      }
    }
  };
  const handleSubmit = async () => {
    const formValues = {
      userName: userName,
      furigana: furigana,
      organization: organization,
      machine: machine,
      designation: designation,
      emailId: emailId,
    };

    await setTouched(() => ({
      ...touched,
      ["userName"]: true,
      ["furigana"]: true,
      ["organization"]: true,
      ["machine"]: true,
      ["designation"]: true,
      ["emailId"]: true,
    }));
    await validateHandler(schema, formValues, setErrors);
    if (errors && Object.keys(errors).length > 0) {
      return;
    } else {
      const selectedDevice = deviceList.find((el) => el.id == machine);
      createUser({
        name: userName,
        furigana: furigana,
        organizationId: organization,
        accountDetail: {
          employee: {
            machine: { name: selectedDevice.label, id: selectedDevice.id },
            designation: designation,
            email: emailId,
            telephoneNo: telephoneNo ? parseInt(telephoneNo) + "" : "",
            phoneStatus: "active",
            onlineStatus: onlineStatus,
            checkOthersOnlineStatus: seeUserActivity,
          },
        },
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {loading && <LoaderOverlay />}
      <ToastContainer />

      <div className="flex p-[40px] pb-0 justify-center items-center ">
        <TitleUserCard title={intl.user_add_screen_label} />
      </div>
      <div
        className="flex flex-col h-full p-[40px] pt-[20px] pb-0 "
        style={{ maxHeight: "450px", overflow: "auto" }}
      >
        <div className="w-full">
          {/* machine */}
          <div className="mb-[32px]">
            <DropdownMedium
              defaultSelectNoOption={false}
              isRequired={true}
              requiredColor={{
                color: "#ED2E2E",
              }}
              padding={"h-[40px]"}
              options={deviceList}
              keys={"value"} // From options array
              optionLabel={"label"} // From options array
              border={"border border-gray-400 rounded"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              bg=""
              text={"text-sm"}
              additionalClass={"block w-full pl-5"}
              id={"machine"}
              name={"machine"}
              labelColor={"#0D0E11"}
              label={intl.machineName}
              value={machine}
              onChange={async (event) => {
                setMachine(event);
                await setTouched(() => ({ ...touched, ["machine"]: true }));
              }}
            />
            {touched && errors && errors.machine && touched.machine && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors.machine}
              </div>
            )}
          </div>
          {/* user name */}
          <div className="mb-[32px]">
            <DynamicLabel
              isRequired={true}
              text={intl.user_name}
              textColor="#0D0E11"
              fontWeight={"font-medium"}
              htmlFor="userName"
            />
            <Input
              id="userName"
              name="userName"
              type={"text"}
              placeholder={intl.user_name}
              padding={"py-3"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400 rounded"}
              bg=""
              additionalClass={"block w-full pl-5 text-sm pr-[30px] h-[40px]"}
              value={userName}
              onChange={async (event) => {
                setUserName(event.target.value);
              }}
            />
            {touched && errors && errors.userName && touched.userName && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors.userName}
              </div>
            )}
          </div>
          {/* furigana */}
          <div className="mb-[32px]">
            <DynamicLabel
              isRequired={true}
              text={intl.furigana}
              textColor="#0D0E11"
              fontWeight={"font-medium"}
              htmlFor="furigana"
            />
            <Input
              id="furigana"
              name="furigana"
              type={"text"}
              placeholder={intl.furigana}
              padding={"py-3"}
              focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
              border={"border border-gray-400 rounded"}
              bg=""
              additionalClass={"block w-full pl-5 text-sm h-[40px] pr-[30px]"}
              value={furigana}
              onChange={async (event) => {
                setFurigana(event.target.value);
              }}
            />
            {touched && errors && errors.furigana && touched.furigana && (
              <div className="pl-1 validation-font" style={{ color: "red" }}>
                {errors.furigana}
              </div>
            )}
          </div>
          {/*  */}

          {/* org list */}
          <div className="mb-[32px]">
            {organizationList.length > 0 && (
              <DropdownMedium
                defaultSelectNoOption={false}
                isRequired={true}
                requiredColor={{
                  color: "#ED2E2E",
                }}
                padding={""}
                options={organizationList}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400 rounded"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full pl-5 h-[40px]"}
                id={"organization"}
                name={"organization"}
                labelColor={"#0D0E11"}
                label={intl.user_add_company_name}
                value={organization}
                onChange={async (event) => {
                  setOrganization(event);
                  await setTouched(() => ({
                    ...touched,
                    ["organization"]: true,
                  }));
                }}
              />
            )}
            {touched &&
              errors &&
              errors.organization &&
              touched.organization && (
                <div className="pl-1 validation-font" style={{ color: "red" }}>
                  {errors.organization}
                </div>
              )}
          </div>
        </div>

        {/* -------------- */}
        <div className="md:w-full ">
          <div className="">
            <div className="mb-[32px]">
              <DynamicLabel
                isRequired={true}
                text={intl.user_add_specify_label}
                textColor="#0D0E11"
                fontWeight={"font-medium"}
              />
              <Input
                type={"text"}
                name="designation"
                placeholder={intl.user_add_specify_label}
                padding={"py-3"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                border={"border border-gray-400 rounded"}
                bg=""
                additionalClass={"block w-full pl-5 text-sm h-[40px] pr-[30px]"}
                value={designation}
                onChange={async (event) => {
                  setDesignation(event.target.value);
                  await setTouched(() => ({
                    ...touched,
                    ["designation"]: true,
                  }));
                }}
              />
              {touched &&
                errors &&
                errors.designation &&
                touched.designation && (
                  <div
                    className="pl-1 validation-font"
                    style={{ color: "red" }}
                  >
                    {errors.designation}
                  </div>
                )}
            </div>
            <div className="mb-[32px]">
              <DynamicLabel
                isRequired={false}
                text={intl.user_email_id_label}
                textColor="#0D0E11"
                fontWeight={"font-medium"}
              />
              <Input
                type={"email"}
                placeholder={intl.user_email_id_label}
                name="emailId"
                id="emailId"
                padding={"py-3"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                border={"border border-gray-400 rounded"}
                bg=""
                additionalClass={"block w-full h-[40px] pl-5 text-sm pr-[30px]"}
                testId="content-input-email"
                value={emailId}
                onChange={async (event) => {
                  setEmailId(event.target.value);
                  await setTouched(() => ({ ...touched, ["emailId"]: true }));
                }}
              />
              {touched && errors && errors.emailId && touched.emailId && (
                <div className="pl-1 validation-font" style={{ color: "red" }}>
                  {errors.emailId}
                </div>
              )}
            </div>

            {/* telephone */}

            <div className="mb-[32px]">
              <DynamicLabel
                text={intl.user_add_telephone_number_label}
                textColor="#0D0E11"
                fontWeight={"font-medium"}
              />
              <Input
                type={"tel"}
                placeholder={intl.user_add_telephone_number_label}
                name="telephoneNo"
                id="telephoneNo"
                padding={"py-3"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                border={"border border-gray-400 rounded"}
                bg=""
                additionalClass={"block w-full pl-5 h-[40px] text-sm pr-[30px]"}
                value={telephoneNo}
                onChange={async (event) => {
                  setTelephoneNo(event.target.value);
                  await setTouched(() => ({
                    ...touched,
                    ["telephoneNo"]: true,
                  }));
                }}
              />
              {touched &&
                errors &&
                errors.telephoneNo &&
                touched.telephoneNo && (
                  <div
                    className="pl-1 validation-font"
                    style={{ color: "red" }}
                  >
                    {errors.telephoneNo}
                  </div>
                )}
            </div>

            {/* activity - no vaidation  */}
            <div className="mb-8 sm:mb-0">
              <div className="rounded-lg">
                <ToggleBoxMedium
                  toggle={seeUserActivity}
                  setToggle={(evt) => {
                    setSeeUserActivity(evt);
                  }}
                  label={intl.user_is_see_user_activity}
                  labelColor={"#0D0E11"}
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
          </div>
        </div>
      </div>
      <div className="md:mt-6 p-[40px]">
        <div className="flex justify-end">
          <IconLeftBtn
            type="submit"
            text={intl.help_settings_addition_keep}
            py="py-[8px] px-[55px] w-full"
            textColor="text-white font-normal text-[16px]"
            bgColor="bg-customBlue"
            textBold={true}
            rounded="rounded-lg"
            icon={() => {
              return null;
            }}
            onClick={() => handleSubmit()}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
