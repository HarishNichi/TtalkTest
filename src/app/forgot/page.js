"use client";

import "@/app/globals.css";
import TelnetLogo from "../../../public/telnetLogo.svg";
import PtalkLogo from "../../../public/Ttalk-logo.png";
import Image from "next/image";
import Linker from "@/components/Link/linker";
import { Noto_Sans_JP } from "next/font/google";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import intl from "@/utils/locales/jp/jp.json";
import {
  EMAIL_PATTERN,
  MAX_50_LENGTH_PATTERN,
} from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import api from "@/utils/api";
import { code } from "@/utils/constant";
import { useRouter } from "next/navigation";

const natoSans = Noto_Sans_JP({ subsets: ["latin"] });

// Yup schema to validate the form
const schema = Yup.object().shape({
  email: Yup.string()
    .required(intl.validation_required)
    .matches(EMAIL_PATTERN.regex, EMAIL_PATTERN.message)
    .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message),
});

export default function Reset() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const routerPath = useRouter();
  const [isToastActive, setIsToastActive] = useState(false);

  useEffect(() => {
    const formValues = { email };
    validateHandler(schema, formValues, setErrors);
  }, [email]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name == "email") {
      setEmail(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, email: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    toast.dismiss();
    setTouched((prevTouched) => ({ ...prevTouched, email: true }));
    if (!errors) {
      setLoading(true);
      try {
        const response = await api.post("auth/forgot", {
          email: email,
        });
        setLoading(false);
        if (response && response.data.status.code == code.OK) {
          toast(intl.password_has_been_sent, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            type: "success",
          });
          setTimeout(() => {
            routerPath.push("/");
          }, 2000);
        }
      } catch (error) {
        setLoading(false);
        setErrors(error.message);
        if (!isToastActive) {
          setIsToastActive(true);
          toast(error.response?.data?.status.message || error.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            type: "error",
            onClose: () => {
              setIsToastActive(false);
            },
          });
        }
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <div
        className={`${natoSans.className}  bg-[url('../../public/login-bg.png')] `}
        style={natoSans.style}
      >
        <div className="container  mx-auto p-4 my-auto  w-full flex items-center h-screen">
          <div className="flex flex-col-reverse md:flex-row w-full min-h-[599px]  md:max-w-[1044px] lg:max-w-[1044px] xl:max-w-[2560px] lg:mx-auto  gap-y-4">
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
                className="md:hidden"
              />
            </div>

            <div className="md:w-1/2">
              <div className="flex flex-col lg:block bg-customBlue h-full rounded-[40px] px-8   lg:w-[500px] md:mx-auto lg:ml-auto">
                <div className="md:mb-16">
                  <div className="ml-auto">
                    <Image
                      src={PtalkLogo}
                      width="200"
                      height={179}
                      className="mb-4 mx-auto py-4 md:py-6"
                      alt="ptalk logo"
                    />
                  </div>
                  <div className="text-xl md:text-2xl font-semibold text-center text-white mb-8">
                    {intl.login_forget_password_text}
                  </div>
                  <div className="mb-10"></div>
                  <div className="md:mb-10">
                  <label
                    htmlFor="email"
                    className="text-white mb-2 block text-center"
                  >
                   {intl.add_user_email_id_label}
                  </label>
                    <input
                      type="email"
                      name="email" // Add the name attribute
                      value={email}
                      className={`w-full py-2 md:py-3 bg-[#0C4278] text-white placeholder-[#B8B7B7] pl-8 rounded-xl md:rounded-2xl ${
                        errors?.email && touched?.email ? "" : "mb-16"
                      } outline-none`}
                      placeholder={intl.user_email_id_label}
                      onChange={handleChange}
                      autoComplete="off" // Add this attribute to disable autofilling
                      onKeyUp={async (e) => {
                        if (e.key === "Enter") {
                          await handleSubmit(e);
                        }
                      }}
                    />
                    {errors?.email && touched?.email && (
                      <div
                        className="mb-16 md:mb-16 pl-1 validation-font"
                        style={{ color: "red" }}
                      >
                        {errors?.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-8 md:mb-12 lg:mb-32">
                    <button
                      type="button"
                      className=" bg-white hover:bg-[#5FA7D0] hover:text-white hover:border-[#5FA7D0] border border-[#e7e7e9] focus:outline-none font-medium rounded-xl md:rounded-2xl px-5 py-1 md:py-2 mr-2 mb-2 text-[#326394] text-xl w-full "
                      onClick={handleSubmit}
                    >
                      {intl.forgot_btn_form_send}
                    </button>
                  </div>
                </div>
                <div className="flex justify-center gap-x-8 lg:gap-x-16  pb-4  mb-2 mt-auto">
                  <Linker
                    text={intl.login_terms_of_service}
                    fontSize="text-xs md:text-base"
                    href="/terms"
                    color="text-white"
                  />
                  <Linker
                    text={intl.login_privacy_policy}
                    fontSize="text-xs md:text-base"
                    href="/privacy"
                    color="text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
