"use client";

import "./globals.css";
import TelnetLogo from "../../public/telnetLogo.svg";
import PtalkLogo from "../../public/Ttalk-logo.png";
import Image from "next/image";
import Linker from "../components/Link/linker";
import { IoEyeOff, IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Noto_Sans_JP } from "next/font/google";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import intl from "@/utils/locales/jp/jp.json";
import { code } from "@/utils/constant";
import { PASSWORD_LENGTH_PATTERN } from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { addUser } from "@/redux/features/user";
import { useAppDispatch } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";

const natoSans = Noto_Sans_JP({ subsets: ["latin"] });

// Yup schema to validate the form
const schema = Yup.object().shape({
  id: Yup.string().required(intl.validation_required),
  password: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_LENGTH_PATTERN.regex, PASSWORD_LENGTH_PATTERN.message),
});

export default function Login() {
  const routerPath = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const formValues = { id, password };
    validateHandler(schema, formValues, setErrors);
  }, [id, password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name == "id") {
      setId(value);
    } else if (name == "password") {
      setPassword(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    toast.dismiss();
    if (!errors) {
      try {
        setLoading(true);
        const response = await api.post("auth/login", {
          id: id,
          password: password,
        });
        // Assuming the response contains the necessary data indicating successful login
        if (response && response.data.status.code == code.OK) {
          setLoading(false);
          // Store the access token and refresh token in local storage
          const data = response.data.data;
          localStorage.setItem("accessToken", data.token.access);
          // Extract the role data and store it in local storage (assuming roles are an array)
          const roles = data.user.roles.map((role) => role);
          const user = {
            id: data.user.id,
            name: data.user.name,
            logo: data.user.logo,
            version: data.user.version,
            role: JSON.stringify(roles),
          };
          dispatch(addUser(JSON.stringify(user)));
          localStorage.setItem("user", JSON.stringify(user));
          const urlOrPath = "/dashboard";
          routerPath.push(urlOrPath);
        }
      } catch (error) {
        setLoading(false);
        toast(
          error.response?.data?.status?.message
            ? error.response?.data?.status?.message
            : error.response.data.message,
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
    } else {
      setTouched({ ...touched, id: true, password: true });
    }
  };

  let [type, setType] = useState("password");
  return (
    <>
      {loading && <LoaderOverlay />}
      <div className={`${natoSans.className} bg-white `} style={natoSans.style}>
        <div className="container  mx-auto p-4 my-auto  w-full flex items-center h-screen bg-white">
          <div className="flex flex-col-reverse md:flex-row w-full min-h-[599px]  md:max-w-[1044px] lg:max-w-[1044px] xl:max-w-[2560px] lg:mx-auto  gap-y-4">
            <div className="md:w-1/2 flex justify-center items-center">
              <Image
                src={TelnetLogo}
                width={200}
                alt="telnet logo"
                className="hidden lg:block "
              />
              <Image
                src={TelnetLogo}
                width={100}
                alt="telnet logo"
                className="lg:hidden"
              />
            </div>

            <div className="md:w-1/2">
              <div className="flex flex-col lg:block bg-customBlue h-full rounded-[40px] px-8   lg:w-[500px] md:mx-auto lg:ml-auto">
                <div className="lg:ml-auto">
                  <Image
                    src={PtalkLogo}
                    width="200"
                    height={100}
                    className="mb-4 mx-auto py-4 lg:py-6"
                    alt="ptalk logo"
                  />
                </div>
                <div className="bg-white">
                  <div className="text-xl font-semibold mb-6 text-left">
                    {intl.login_btn_label}
                  </div>
                  {loginError && (
                    <div
                      className="mb-4 pl-1 validation-font"
                      style={{ color: "red" }}
                    >
                      {loginError}
                    </div>
                  )}

                  <div>
                    <input
                      type="id"
                      name="id" // Add the name attribute
                      className={`w-full py-2 lg:py-3 bg-white text-white  placeholder-[#B8B7B7] pl-8 rounded-xl lg:rounded-2xl ${
                        errors?.id && touched?.id ? "" : "mb-8"
                      } outline-none`}
                      placeholder={intl.login_email_placeholder}
                      value={id}
                      onChange={handleChange}
                      autoComplete="off" // Add this attribute to disable autofilling
                    />
                    {errors?.id && touched?.id && (
                      <div
                        className="mb-8 pl-1 validation-font"
                        style={{ color: "red" }}
                      >
                        {errors?.id}
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex items-center ${
                      errors?.password && touched?.password ? "" : "mb-4"
                    }`}
                  >
                    <input
                      id="password"
                      name="password" // Add the name attribute
                      type={type}
                      className="w-full pl-8 py-2 lg:py-3 bg-white text-white placeholder-[#B8B7B7] rounded-xl lg:rounded-2xl outline-none"
                      placeholder={intl.login_password_placeholder}
                      value={password}
                      onChange={handleChange}
                      autoComplete={"off"} // Add this attribute to disable autofilling
                      onKeyUp={async (e) => {
                        if (e.key === "Enter") {
                          await handleSubmit(e);
                        }
                      }}
                    />
                    <button
                      className="-ml-12"
                      onClick={() => {
                        event.preventDefault();
                        type == "password"
                          ? setType("text")
                          : setType("password");
                      }}
                    >
                      {type == "password" ? (
                        <IoEyeOffOutline className="text-2xl text-[#A3A3A3]" />
                      ) : (
                        <IoEyeOutline className="text-2xl text-[#A3A3A3]" />
                      )}
                    </button>
                  </div>
                  {errors?.password && touched?.password && (
                    <div
                      className="mb-4 pl-1 validation-font"
                      style={{ color: "red" }}
                    >
                      {errors?.password}
                    </div>
                  )}
                  <div className="flex justify-end mb-9 lg:mb-16">
                    <Linker
                      text={intl.forgot_screen_label}
                      fontSize="text-xs lg:text-base"
                      href="/forgot"
                      color="text-white"
                    />
                  </div>
                  <div className="mb-8 lg:mb-12">
                    <button
                      type="submit"
                      className=" w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-900"
                      onClick={handleSubmit}
                    >
                      {intl.login_btn_label}
                    </button>
                  </div>
                </div>

                <div className="flex justify-center gap-x-8 lg:gap-x-16  pb-4  mb-2 mt-auto">
                  <Linker
                    text={intl.login_terms_of_service}
                    fontSize="text-xs lg:text-base"
                    href="/terms"
                    color="text-white"
                  />
                  <Linker
                    text={intl.login_privacy_policy}
                    fontSize="text-xs lg:text-base"
                    href="/privacy"
                    color="text-white"
                  />
                </div>
                <div className="mt-4 text-center text-xs text-gray-500">
                  TELENET Inc. All Rights Reserved
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
