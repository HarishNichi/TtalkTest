"use client";

import "./globals.css";
import TelnetLogo from "../../public/telnetLogo.svg";
import PtalkLogo from "../../public/Ttalk-logo.png";
import Image from "next/image";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Noto_Sans_JP } from "next/font/google";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import intl from "@/utils/locales/jp/jp.json";
import { code } from "@/utils/constant";

import {
  PASSWORD_LENGTH_PATTERN,
  EMAIL_PATTERN,
  MAX_50_LENGTH_PATTERN,
} from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { addUser } from "@/redux/features/user";
import { useAppDispatch } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import Modal from "@/components/Modal/modal"; // Import the Modal component
import { ToastContainer, toast } from "react-toastify";

// Google Font Import
const natoSans = Noto_Sans_JP({ subsets: ["latin"] });

// Yup schema to validate the form
const schema = Yup.object().shape({
  id: Yup.string().required(intl.validation_required),
  password: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_LENGTH_PATTERN.regex, PASSWORD_LENGTH_PATTERN.message),
});

const modalSchema = Yup.object().shape({
  modalEmail: Yup.string()
    .required(intl.validation_required)
    .matches(EMAIL_PATTERN.regex, EMAIL_PATTERN.message)
    .matches(MAX_50_LENGTH_PATTERN.regex, MAX_50_LENGTH_PATTERN.message),
});

export default function Login() {
  const routerPath = useRouter();
  // const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [errors, setErrors] = useState({});
  const [modalErrors, setModalErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [modalTouched, setModalTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const dispatch = useAppDispatch();
  const [isToastActive, setIsToastActive] = useState(false);

  // Validate form values
  useEffect(() => {
    const formValues = { id, password };
    validateHandler(schema, formValues, setErrors);
  }, [id, password]);
  useEffect(() => {
    const modalValues = { modalEmail };
    validateHandler(modalSchema, modalValues, setModalErrors);
  }, [modalEmail]);

  // Handle change for input fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "id") {
      setId(value);
    } else if (name === "password") {
      setPassword(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  const handleModalChange = (event) => {
    const { name, value } = event.target;
    if (name == "email") {
      setModalEmail(value);
    }
    setModalTouched((prevTouched) => ({ ...prevTouched, modalEmail: true }));
  };

  // Handle form submission
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
        if (response && response.data.status.code === code.OK) {
          setLoading(false);
          const data = response.data.data;
          localStorage.setItem("accessToken", data.token.access);
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
          routerPath.push("/dashboard");
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

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    toast.dismiss();
    setModalTouched((prevTouched) => ({ ...prevTouched, modalEmail: true }));

    const modalValues = { modalEmail };
    const validationErrors = await validateHandler(
      modalSchema,
      modalValues,
      setModalErrors
    );

    if (!modalErrors) {
      setLoading(true);
      try {
        const response = await api.post("auth/forgot", {
          email: modalEmail,
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
          // Reset modal form fields
          setModalEmail("");
          setModalTouched({});
          setModalErrors({});

          setTimeout(() => {
            routerPath.push("/");
          }, 2000);

          // Close the modal only if there are no validation errors
          handleCloseModal();
        }
      } catch (error) {
        setLoading(false);
        setModalErrors(error.message);
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

  const handleCloseModal = () => {
    // Reset modal form fields when closing the modal
    setModalEmail("");
    setModalTouched({});
    setModalErrors({});
    setIsModalOpen(false);
  };

  // Handle forgot password modal
  const handleForgotPasswordClick = () => {
    setIsModalOpen(true);
  };

  // Handle password visibility toggle
  let [type, setType] = useState("password");

  // Handle forgot password submission
  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    const formValues = { email: modalEmail };
    const validationErrors = await validateHandler(
      modalSchema,
      formValues,
      setErrors
    );

    if (!validationErrors) {
      // Handle forgot password logic here
      toast.success(intl.password_reset_success_message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "success",
      });
      setIsModalOpen(false);
    } else {
      setTouched({ modalEmail: true });
    }
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <div className={`${natoSans.className} bg-white `} style={natoSans.style}>
        <div className="flex flex-col md:flex-row min-h-screen bg-white">
          {/* Left Side */}
          <div className="hidden md:flex md:w-1/2 w-full h-[50vh] md:h-auto items-center justify-center bg-white">
            <Image
              src={TelnetLogo}
              width={200}
              alt="telnet logo"
              className="block lg:block mx-auto "
            />
          </div>

          {/* Right Side */}
          <div className="flex-1 flex flex-col items-center justify-center bg-customBlue text-white">
            <div className="text-center">
              <Image
                src={PtalkLogo}
                width="200"
                height={100}
                className="justify-center items-center "
                alt="ptalk logo"
              />
            </div>
            <div className="p-[40px] pb-[10px] w-full">
              <div className="w-full px-[60px] py-[40px] bg-white rounded-xl shadow-md text-black">
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
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="id"
                      name="id"
                      className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={intl.login_email_placeholder}
                      value={id}
                      onChange={handleChange}
                      autoComplete="off"
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
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium"
                    ></label>
                    <input
                      id="password"
                      name="password"
                      type={type}
                      className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={intl.login_password_placeholder}
                      value={password}
                      onChange={handleChange}
                      autoComplete="off"
                      onKeyUp={async (e) => {
                        if (e.key === "Enter") {
                          await handleSubmit(e);
                        }
                      }}
                    />
                    <button
                      className="-ml-8"
                      onClick={(event) => {
                        event.preventDefault();
                        setType(type === "password" ? "text" : "password");
                      }}
                    >
                      {type === "password" ? (
                        <IoEyeOffOutline className="text-2xl text-[#A3A3A3]" />
                      ) : (
                        <IoEyeOutline className="text-2xl text-[#A3A3A3]" />
                      )}
                    </button>
                    {errors?.password && touched?.password && (
                      <div
                        className="mb-8 pl-1 validation-font"
                        style={{ color: "red" }}
                      >
                        {errors?.password}
                      </div>
                    )}
                  </div>
                  <div className="text-right mb-4 font-normal text-base">
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={handleForgotPasswordClick}
                    >
                      {intl.forgot_screen_label}
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-customBlue text-white font-semibold text-base py-2 mt-4 rounded-md"
                  >
                    {intl.login_btn_label}
                  </button>
                </form>
              </div>
            </div>

            <div className="flex justify-center gap-x-8 lg:gap-x-16 font-normal text-base mt-2 mb-2">
              <a href="/terms" className="text-white hover:underline">
                {intl.login_terms_of_service}
              </a>

              <a
                href="/privacy"
                className="text-white hover:underline ml-[2vw]"
              >
                {intl.login_privacy_policy}
              </a>
            </div>
            <div className="mt-4 text-center font-normal text-base text-white">
              TELENet Inc. All Rights Reserved
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          text={intl.login_forget_password_text}
          fontSize="20"
          textColor="customBlue"
          fontWeight="600"
          onCloseHandler={handleCloseModal}
          modalFooter={() => (
            <button
              className="bg-customBlue text-base font-semibold text-white py-2 px-4 rounded-md w-full"
              onClick={handleModalSubmit}
            >
              {intl.send_password}
            </button>
          )}
        >
          <p className="text-sm font-normal">{intl.forgot_password_message}</p>
          <input
            type="email"
            name="email"
            placeholder={intl.login_email_placeholder}
            className="mt-4 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={modalEmail}
            onChange={handleModalChange}
            autoComplete="off"
            onKeyUp={async (e) => {
              if (e.key === "Enter") {
                await handleForgotPasswordSubmit(e);
              }
            }}
          />
          {modalErrors?.modalEmail && modalTouched?.modalEmail && (
            <div
              className=" m-0 validation-font"
              style={{ color: "red", margin: "0px", display: "flex" }}
            >
              {modalErrors?.modalEmail}
            </div>
          )}
        </Modal>
      )}
      <ToastContainer />
    </>
  );
}
