"use client";

import "@/app/globals.css";
import TelnetLogo from "../../../public/telnetLogo.svg";
import PtalkLogo from "../../../public/Ttalk-logo.png";
import Image from "next/image";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Linker from "@/components/Link/linker";
import { Noto_Sans_JP } from "next/font/google";
import { useState } from "react";
import * as Yup from "yup";
import intl from "@/utils/locales/jp/jp.json";
import {
  PASSWORD_LENGTH_PATTERN,
  MAX_50_LENGTH_PATTERN,
} from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";

const natoSans = Noto_Sans_JP({ subsets: ["latin"] });

// Yup schema to validate the form
const schema = Yup.object().shape({
  type: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_LENGTH_PATTERN.regex, PASSWORD_LENGTH_PATTERN.message)
    .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message),
  typeConfirm: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_LENGTH_PATTERN.regex, PASSWORD_LENGTH_PATTERN.message)
    .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message),
});

export default function Forgot() {
  let [type, setType] = useState("password");
  let [typeConfirm, setTypeConfirm] = useState("password");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = async (event) => {
    const { name, value } = event.target;
    const formValues = { type, typeConfirm };

    if (name === "type") {
      setType(value);
    } else if (name === "typeConfirm") {
      setTypeConfirm(value);
    }

    await setTouched({ ...touched, [name]: true });
    await validateHandler(schema, formValues, setErrors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formValues = { type, typeConfirm };
    await validateHandler(schema, formValues, setErrors);
  };

  return (
    <div className={natoSans.className} style={natoSans.style}>
      <div className="container portrait:h-screen lg:landscape:h-screen mx-auto p-4 my-auto  w-full flex items-center">
        <div className="flex flex-col-reverse md:flex-row w-full min-h-max  md:max-w-[1044px] lg:mx-auto  gap-y-4">
          <div className="md:w-1/2 flex justify-center items-center">
            <Image
              src={TelnetLogo}
              width={200}
              alt="telnet logo"
              className="hidden md:block"
            />
            <Image
              src={TelnetLogo}
              width={100}
              alt="telnet logo"
              className="block md:hidden"
            />
          </div>

          <div className="md:w-1/2 ">
            <div className="flex flex-col lg:block bg-customBlue h-full rounded-[40px] px-8   lg:w-[500px] md:mx-auto lg:ml-auto ">
              <div className="md:ml-auto ">
                <Image
                  src={PtalkLogo}
                  width="200"
                  height={100}
                  className="mb-4 mx-auto py-4 md:py-6"
                  alt="ptalk logo"
                />
              </div>
              <div className="text-xl md:text-2xl font-semibold text-center text-white mb-8">
                {intl.user_details_password_reset_btn}
              </div>

              <div
                className={`flex items-center ${
                  errors?.type && touched?.type ? "" : "mb-8"
                }`}
              >
                <input
                  type={type}
                  id="password"
                  value={type}
                  name="type"
                  className={`w-full pl-8 py-2 md:py-3 bg-auth-input text-white placeholder-[#B8B7B7] rounded-xl md:rounded-2xl outline-none ${
                    errors?.type && touched?.type && ""
                  }`}
                  placeholder={intl.reset_new_password_label}
                  onChange={(event) => {
                    handleChange(event);
                  }}
                />

                {type == "password" ? (
                  <IoEyeOffOutline
                    className="text-2xl text-[#A3A3A3] -ml-12"
                    onClick={() => {
                      setType("text");
                    }}
                  />
                ) : (
                  <IoEyeOutline
                    className="text-2xl text-[#A3A3A3] -ml-12"
                    onClick={() => {
                      setType("password");
                    }}
                  />
                )}
              </div>
              {errors?.type && touched?.type && (
                <div
                  className="mb-8 pl-1 validation-font"
                  style={{ color: "red" }}
                >
                  {errors?.type}
                </div>
              )}
              <div
                className={`flex items-center ${
                  errors?.typeConfirm && touched?.typeConfirm
                    ? ""
                    : "mb-9 md:mb-16"
                }`}
              >
                <input
                  type={typeConfirm}
                  id="passwordConfirm"
                  name="typeConfirm"
                  value={typeConfirm}
                  className={`w-full pl-8 py-2 md:py-3 bg-auth-input text-white placeholder-[#B8B7B7] rounded-xl md:rounded-2xl outline-none ${
                    errors?.typeConfirm && touched?.typeConfirm && ""
                  }`}
                  placeholder={intl.forgot_autenticate_password_placeholder}
                  onChange={(event) => {
                    handleChange(event);
                  }}
                />

                {typeConfirm == "password" ? (
                  <IoEyeOffOutline
                    className="text-2xl text-[#A3A3A3] -ml-12"
                    onClick={() => {
                      setTypeConfirm("text");
                    }}
                  />
                ) : (
                  <IoEyeOutline
                    className="text-2xl text-[#A3A3A3] -ml-12"
                    onClick={() => {
                      setTypeConfirm("password");
                    }}
                  />
                )}
              </div>
              {errors?.typeConfirm && touched?.typeConfirm && (
                <div
                  className="mb-9 md:mb-16 pl-1 validation-font"
                  style={{ color: "red" }}
                >
                  {errors?.typeConfirm}
                </div>
              )}
              {type != typeConfirm && (
                <div
                  className="mb-9 md:mb-16 pl-1 validation-font"
                  style={{ color: "red" }}
                >
                  {intl.validation_check_passwordCheck_same}
                </div>
              )}
              <div className="mb-8 md:mb-12">
                <button
                  type="button"
                  className=" bg-white border border-[#e7e7e9] focus:outline-none  font-medium rounded-2xl px-5 py-1 md:py-2 mr-2 mb-2 text-auth-button-text text-xl w-full "
                >
                  {intl.update_password}
                </button>
              </div>
              <div className="flex justify-center gap-x-8 md:gap-x-16 pb-4 md:pt-8 mb-2 mt-auto ">
                <Linker
                  text={intl.login_terms_of_service}
                  fontSize="text-xs md:text-base"
                  href="#"
                />
                <Linker
                  text={intl.login_privacy_policy}
                  fontSize="text-xs md:text-base"
                  href="#"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
