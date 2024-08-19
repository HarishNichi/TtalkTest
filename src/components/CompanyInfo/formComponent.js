import React, { useEffect, useState } from "react";
import TextPlain from "../Input/textPlain";
import TextareaMedium from "../Input/textareaMedium";
import IconLeftBtn from "../Button/iconLeftBtn";
import * as Yup from "yup";
import intl from "../../utils/locales/jp/jp.json";
import {
  MAX_50_LENGTH_PATTERN,
  EMAIL_PATTERN,
  MAX_100_LENGTH_PATTERN,
  MAX_256_LENGTH_PATTERN,
  MAX_4_LENGTH_PATTERN,
} from "../../validation/validationPattern";
import { validateHandler } from "../../validation/helperFunction";
import api from "@/utils/api";
import ToggleBoxMedium from "../Input/toggleBoxMedium";
import CompanyList from "@/app/company/list/page";
import { Modal as AntModel } from "antd";

// Yup schema to validate the form
const schema = Yup.object().shape({
  companyName: Yup.string()
    .required(intl.validation_required)
    .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
  mailId: Yup.string()
    .required(intl.validation_required)
    .matches(EMAIL_PATTERN.regex, EMAIL_PATTERN.message)
    .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message),
  userCount: Yup.number()
    .required(intl.validation_required)
    .max(9999, MAX_4_LENGTH_PATTERN.message)
    .typeError(intl.user_user_count_only_number),
  salesChannel: Yup.string()
    .required(intl.validation_required)
    .matches(MAX_100_LENGTH_PATTERN.regex, MAX_100_LENGTH_PATTERN.message),
  description: Yup.string().matches(
    MAX_256_LENGTH_PATTERN.regex,
    MAX_256_LENGTH_PATTERN.message
  ),
  isTranslate: Yup.boolean().default(false),
  sosLocation: Yup.boolean().default(false),
  isTranscribe: Yup.boolean().default(false),
  isStatus: Yup.boolean().default(false),
  logo: Yup.string().required(intl.validation_required).nullable(),
});

const CompanyForm = (props) => {
  const {
    initialCompanyName,
    initialMailId,
    initialUserCount,
    initialSalesChannel,
    initialDescription,
    disabled,
    isForm,
    isRequired,
    initialIsTranslate,
    initialIsTranscribe,
    initialSosLocation,
    initialIsStatus,
    updateOrg,
    initialFleetNumber,
    initialCompanyId,
  } = props;
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [mailId, setMailId] = useState(initialMailId);
  const [userCount, setUserCount] = useState(initialUserCount);
  const [salesChannel, setSalesChannel] = useState(initialSalesChannel);
  const [description, setDescription] = useState(initialDescription);
  const [isTranslate, setIsTranslate] = useState(initialIsTranslate);
  const [isTranscribe, setIsTranscribe] = useState(initialIsTranscribe);
  const [sosLocation, setSosLocation] = useState(initialSosLocation);
  const [isStatus, setIsStatus] = useState(initialIsStatus);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const fleetNumber = initialFleetNumber;
  const companyId = initialCompanyId;

  // ---------------------- FOR VALIDATIONS ----------------------------- //
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  // ---------------------- FOR VALIDATIONS ENDS------------------------- //

  useEffect(() => {
    const formValues = {
      companyName,
      mailId,
      userCount,
      salesChannel,
      logo,
      description,
    };
    validateHandler(schema, formValues, setErrors);
  }, [companyName, mailId, userCount, salesChannel, logo, description]);
  const handleChange = async (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "companyName":
        setCompanyName(() => value);
        break;
      case "mailId":
        setMailId(() => value);
        break;
      case "userCount":
        setUserCount(() => value);
        break;
      case "description":
        setDescription(() => value);
        break;
      case "salesChannel":
        setSalesChannel(() => value);
        break;
      case "isTranscribe":
        setIsTranscribe(() => value);
        break;
      case "isTranslate":
        setIsTranslate(() => value);
        break;
      case "sosLocation":
        setSosLocation(() => value);
        break;
      case "logo":
        setLogo(() => value);
        break;
      case "isStatus":
        setIsStatus(() => value);
        break;
      default:
        break;
    }
    setTouched(() => ({ ...touched, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formValues = {
      companyName,
      mailId,
      userCount,
      salesChannel,
      description,
      logo,
      isTranslate,
      isTranscribe,
      isStatus,
      sosLocation,
    };

    await setTouched(() => ({
      ...touched,
      companyName: true,
      mailId: true,
      userCount: true,
      salesChannel: true,
      logo: true,
    }));
    await validateHandler(schema, formValues, setErrors);

    if (errors) {
      setTouched(() => ({
        ...touched,
        companyName: true,
        mailId: true,
        userCount: true,
        salesChannel: true,
        logo: true,
      }));
      await validateHandler(schema, formValues, setErrors);
    } else {
      updateOrg({
        name: companyName,
        email: mailId,
        accountDetail: {
          organization: {
            description: description || "",
            licenseCount: userCount + "",
            salesChannel: salesChannel || "",
            isTranslate: isTranslate,
            sosLocation: sosLocation,
            isTranscribe: isTranscribe,
            isStatus: isStatus,
            logo,
          },
        },
      });
    }
  };

  return (
    <form
      id="model-scroll"
      className="grid grid-cols-1  gap-y-4 gap-x-12 lg:gap-y-3 xl:gap-y-4 2xl:gap-y-6 lg:gap-x-24"
    >
      <div style={{ maxHeight: "350px", overflow: "auto", padding: "2px" }}>
        <FormField
          label={intl.form_component_company_name_label}
          id="companyName"
          placeholder={intl.form_component_company_name_label}
          value={companyName}
          onChange={handleChange}
          disabled={disabled}
          isRequired={isRequired}
          errors={errors}
          touched={touched}
        />
        {!props.isCreatePage && (
          <FormField
            label={intl.form_component_company_id}
            id="companyId"
            placeholder={intl.form_component_company_id}
            value={companyId}
            disabled={true}
            isRequired={false}
            errors={errors}
            touched={touched}
          />
        )}
        <FormField
          label={intl.form_component_mailid_label}
          id="mailId"
          placeholder={intl.form_component_mailid_label}
          value={mailId}
          onChange={handleChange}
          disabled={disabled}
          isRequired={isRequired}
          errors={errors}
          touched={touched}
        />

        <FormField
          label={intl.form_component_usercount_label}
          id="userCount"
          placeholder={intl.form_component_usercount_label}
          value={userCount}
          onChange={handleChange}
          disabled={disabled}
          isRequired={isRequired}
          errors={errors}
          touched={touched}
        />

        <FormField
          label={intl.form_component_sales_channel}
          id="salesChannel"
          placeholder={intl.form_component_sales_channel}
          value={salesChannel}
          onChange={handleChange}
          disabled={disabled}
          isRequired={isRequired}
          errors={errors}
          touched={touched}
        />
        {!props.isCreatePage && (
          <>
            <FormField
              label={intl.form_component_fleet_number}
              id="fleetNumber"
              placeholder={intl.form_component_fleet_number}
              value={fleetNumber}
              onChange={handleChange}
              disabled={true}
              isRequired={false}
              disabledBg={"bg-[#EAEAEA] cursor-not-allowed"}
              errors={errors}
              touched={touched}
            />
          </>
        )}

        <div className="flex  flex-col mt-[32px]">
          <div className="bg-input-gray py-3 pl-4 rounded-lg">
            <ToggleBoxMedium
              isDisabled={disabled}
              toggle={isTranslate}
              setToggle={(val) => {
                setIsTranslate(val);
              }}
              label={"同時通訳"}
              labelColor={"#7B7B7B"}
              id={"Id"}
              onColor={"#1E1E1E"}
              onHandleColor={"#00ACFF"}
              handleDiameter={16}
              uncheckedIcon={false}
              disabledBg={"bg-[#EAEAEA] cursor-not-allowed"}
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
        <div className="flex  flex-col mt-[32px]">
          <div className="bg-input-gray py-3 pl-4 rounded-lg ">
            <ToggleBoxMedium
              isDisabled={disabled}
              toggle={isTranscribe}
              setToggle={(val) => {
                setIsTranscribe(val);
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
              additionalClass={""}
              labelClass={
                "text-sm font-medium text-gray-900 dark:text-gray-300"
              }
            />
          </div>
        </div>
        <div className="flex  flex-col mt-[32px] mb-[32px]">
          <div className="bg-input-gray py-3 pl-4 rounded-lg">
            <ToggleBoxMedium
              isDisabled={disabled}
              toggle={sosLocation}
              setToggle={(val) => {
                setSosLocation(val);
              }}
              label={"SOS位置情報"}
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
            />
          </div>
        </div>
        {!props.isCreatePage && (
          <>
            <div className="flex  flex-col mt-[32px]">
              <div className="bg-input-gray py-3 pl-4 rounded-lg ">
                <ToggleBoxMedium
                  isDisabled={disabled}
                  toggle={isStatus}
                  setToggle={(val) => {
                    setIsStatus(val);
                  }}
                  label={"スターテス"}
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
                />
              </div>
            </div>
          </>
        )}
        <div className="mt-[32px]">
          <FormField
            label={intl.help_settings_addition_explanation}
            id="description"
            placeholder={intl.help_settings_addition_explanation}
            isTextarea={true}
            value={description}
            onChange={handleChange}
            disabled={disabled}
            isRequired={false}
            errors={errors}
            touched={touched}
          />
        </div>
      </div>

      {isForm && (
        <>
          <div className="hidden lg:flex lg:flex-col"></div>
          <div className="hidden lg:flex lg:flex-col"></div>
          {props.isCreatePage && (
            <div className="hidden lg:flex lg:flex-col"></div>
          )}
          <div className="w-full">
            <div className="w-full">
              <IconLeftBtn
                text={intl.help_settings_addition_keep}
                py="py-[8px] px-[55px] w-full "
                textColor="text-white font-normal text-[16px]"
                bgColor="bg-customBlue"
                textBold={true}
                rounded="rounded-lg"
                icon={() => {
                  return null;
                }}
                onClick={(event) => {
                  handleSubmit(event);
                }}
              />
            </div>
          </div>
        </>
      )}
    </form>
  );
};

const FormField = ({
  label,
  id,
  placeholder,
  isTextarea = false,
  value,
  onChange,
  disabled,
  disabledBg,
  isRequired,
  errors,
  touched,
  extraCol,
  onKeyDownHandler,
}) => {
  const FieldComponent = isTextarea ? TextareaMedium : TextPlain;

  const handleChange = (event) => {
    onChange(event);
  };

  return (
    <>
      {extraCol && <div className="hidden lg:flex lg:flex-col"></div>}
      <div className="flex flex-col mb-[32px]">
        <FieldComponent
          type="text"
          for={id}
          placeholder={placeholder}
          borderRound="rounded-[4px]"
          padding="p-[10px]"
          focus="focus:outline-none focus:ring-2 focus:ring-customBlue"
          border="border border-gray-300"
          bg="bg-white"
          additionalClass={`${
            disabled ? "bg-[#AAAAAA] cursor-not-allowed text-white " : ""
          } block w-full pl-5 text-base pr-[30px] h-[40px]`}
          label={label}
          labelColor="#7B7B7B"
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          disabledBg={disabledBg}
          isRequired={isRequired}
        />
        {touched && errors && errors[id] && touched[id] && (
          <div className="pl-1 validation-font" style={{ color: "red" }}>
            {errors[id]}
          </div>
        )}
      </div>
    </>
  );
};

export default CompanyForm;
