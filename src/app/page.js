"use client";
import "./globals.css";
import Image from "next/image";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { Noto_Sans_JP } from "next/font/google";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { addUser } from "@/redux/features/user";
import { useAppDispatch } from "@/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import { Modal as AntModal } from "antd";
import PtalkLogo from "../../public/Ttalk-logo.png";
import intl from "@/utils/locales/jp/jp.json";
import { code } from "@/utils/constant";
import {
  PASSWORD_LENGTH_PATTERN,
  EMAIL_PATTERN,
  MAX_50_LENGTH_PATTERN,
} from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import LoaderOverlay from "@/components/Loader/loadOverLay";
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
  const dispatch = useAppDispatch();
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
  const [isToastActive, setIsToastActive] = useState(false);
  let [type, setType] = useState("password");

  // Validate form values
  useEffect(() => {
    const formValues = { id, password };
    validateHandler(schema, formValues, setErrors);
  }, [id, password]);

  useEffect(() => {
    const modalValues = { modalEmail };
    validateHandler(modalSchema, modalValues, setModalErrors);
  }, [modalEmail]);

  /**
   * Handles changes in the input fields. If the name of the input field that
   * changed is 'id', it updates the state variable id. If the name of the input
   * field that changed is 'password', it updates the state variable password. It
   * also updates the touched state for the input fields, so that the form
   * validation can be performed when the user clicks the submit button.
   * @param {React.FormEvent<HTMLFormElement>} event The form event object
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "id") {
      setId(value);
    } else if (name === "password") {
      setPassword(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  /**
   * Handles changes in the modal form fields. If the name of the form field that
   * changed is 'email', it updates the state variable modalEmail. It also updates
   * the touched state for the modal form fields, so that the form validation can
   * be performed when the user clicks the submit button.
   * @param {React.FormEvent<HTMLFormElement>} event The form event object
   */
  const handleModalChange = (event) => {
    const { name, value } = event.target;
    if (name == "email") {
      setModalEmail(value);
    }
    setModalTouched((prevTouched) => ({ ...prevTouched, modalEmail: true }));
  };

  /**
   * Handles the form submission. It prevents the default form submission
   * behavior and displays a toast message if there are any errors in the form.
   * If the form is valid, it sends a POST request to the server with the user
   * credentials and stores the access token in the local storage. It also
   * stores the user data in the local storage and dispatches the user data to
   * the Redux store. Finally, it redirects the user to the dashboard page.
   * @param {React.FormEvent<HTMLFormElement>} event The form event object
   */
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

  /**
   * Handles the submission of the forgot password modal form.
   * Prevents the default form submission behavior, resets the toast notification,
   * and validates the form values against the modalSchema.
   * If there are no validation errors, it sends a POST request to the /auth/forgot
   * endpoint with the user's email and displays a success toast notification.
   * If there are validation errors, it displays the errors in the form fields.
   * If the request fails, it displays an error toast notification.
   * It also closes the modal and redirects the user to the login page after a
   * 2-second delay.
   * @param {React.FormEvent<HTMLFormElement>} event The form event object
   */
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

  /**
   * Resets the forgot password modal form fields when closing the modal.
   * Sets the modalEmail state to an empty string, the modalTouched state to an empty object,
   * and the modalErrors state to an empty object. Also sets the isModalOpen state to false.
   */
  const handleCloseModal = () => {
    // Reset modal form fields when closing the modal
    setModalEmail("");
    setModalTouched({});
    setModalErrors({});
    setIsModalOpen(false);
  };

  /**
   * Handles the click event on the forgot password link.
   * Sets the isModalOpen state to true, which opens the forgot password modal.
   */
  const handleForgotPasswordClick = () => {
    setIsModalOpen(true);
  };

  /**
   * Handles the submit event on the forgot password form.
   * Prevents the default form submit event, validates the form using the modalSchema and setErrors,
   * and if there are no validation errors, sends a request to the API to reset the password.
   * If the response is successful, shows a toast success message and closes the modal.
   * If there are validation errors, sets the touched state of the form to true.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event
   */
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
        <div className="flex flex-col md:flex-row min-h-screen bg-white border">
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
            <div className=" xl:px-[80px] lg:px-[60px] md:px-[40px] py-[24px] p-[20px]  w-full flex justify-center">
              <div className="w-[600px] md:px-[60px] md:py-[40px] px-[40px] py-[20px] bg-white rounded shadow-md text-black">
                <div className="text-xl font-semibold mb-[32px] text-left">
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
                  <div className="mb-[32px]">
                    <input
                      type="id"
                      name="id"
                      className="mt-1 p-2 w-full border rounded focus:ring-blue-500 focus:border-blue-500 h-[40px]"
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
                  <div className="mb-4 ">
                    <div className="flex">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                      ></label>
                      <input
                        id="password"
                        name="password"
                        type={type}
                        className="mt-1 p-2 pr-[40px] w-full border rounded focus:ring-blue-500 focus:border-blue-500 flex items-center h-[40px]"
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
                    </div>
                    {errors?.password && touched?.password && (
                      <div
                        className="mb-8 pl-1 validation-font"
                        style={{ color: "red" }}
                      >
                        {errors?.password}
                      </div>
                    )}
                  </div>
                  <div className="text-right mb-[35px] font-normal text-base">
                    <a
                      href="#"
                      className="text-base text-blue-600 hover:underline"
                      onClick={handleForgotPasswordClick}
                    >
                      {intl.forgot_screen_label}
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-customBlue hover:bg-[#214BB9] text-white font-semibold text-base py-2  rounded h-[40px]"
                  >
                    {intl.login_btn_label}
                  </button>
                </form>
              </div>
            </div>
            <div className="flex justify-center gap-x-8 lg:gap-x-16 font-normal text-base mb-[24px]">
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
            <div className="text-center font-normal text-base text-white mb-[24px]">
              TELENET.inc All Rights Reserverd
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AntModal
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] font-semibold text-xl text-customBlue text-center">
              {intl.login_forget_password_text}
            </div>
          }
          width={400}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
          }}
          footer={() => (
            <div className="px-[40px] pb-[40px] pt-[20px]">
              <button
                className="bg-customBlue text-base font-semibold text-white py-2 px-4 rounded w-full h-[40px]"
                onClick={handleModalSubmit}
              >
                {intl.send_password}
              </button>
            </div>
          )}
          centered={true}
          className="my-[70px]"
        >
          <p className="text-sm dark:text-black font-normal px-[40px]">
            {intl.forgot_password_message}
          </p>
          <div className="px-[40px]">
            <input
              type="email"
              name="email"
              placeholder={intl.login_email_placeholder}
              className="mt-4 p-2 w-full border rounded focus:ring-blue-500 focus:border-blue-500 h-[40px]"
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
          </div>
        </AntModal>
      )}
      <ToastContainer />
    </>
  );
}
