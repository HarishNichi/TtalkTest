"use client";
import { Button } from "antd";
import intl from "@/utils/locales/jp/jp.json";
import DeleteIcon from "../Icons/deleteIcon";
import { useEffect, useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import * as Yup from "yup";
import { PASSWORD_PATTERN } from "@/validation/validationPattern";
import { updateEmployee, validateHandler } from "@/validation/helperFunction";
import Modal from "@/components/Modal/modal";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import { toast, ToastContainer } from "react-toastify";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { useAppSelector } from "@/redux/hooks";
import LoaderOverlay from "../Loader/loadOverLay";
import api from "@/utils/api";
// Yup schema to validate the form
const schema = Yup.object().shape({
  password: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_PATTERN.regex, PASSWORD_PATTERN.message),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "パスワードが一致しません")
    .required(intl.validation_required),
});

export default function Other() {
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [passwordModal, setPasswordModal] = useState(false);
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
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
      setLoading(true);
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
      setPasswordModal(false);
      setErrors(null);
      setTouched({});
    }
  }

  const [deleteModal, setDeleteModal] = useState(false);

  async function handleRemoteWipeNotification() {
    setLoading(true);
    const payload = {
      pttNos: [Employee.radioNumber],
      data: {
        type: "wipe",
        title: "remote wipe",
        body: {},
      },
    };
    try {
      await api.post("push/notify", payload);
      setLoading(false);
      toast(intl.notify_success, successToastSettings);
      setDeleteModal(() => false);
    } catch (error) {
      setLoading(false);
      setDeleteModal(() => false);
      toast(error.response?.data?.status.message || error.message, {
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
  }

  async function handlePttNotification() {
    toast.dismiss();
    setLoading(true);
    const payload = {
      pttNos: [Employee.radioNumber],
      data: {
        type: "config-emp",
        title: "config employee",
        body: {},
      },
    };
    try {
      await api.post("push/notify", payload);
      setLoading(false);
      toast(intl.notify_success, successToastSettings);
    } catch (error) {
      setLoading(false);
      toast(error.response?.data?.status.message || error.message, {
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
  }

  return (
    <>
      {passwordModal && (
        <Modal
          height="500px"
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text={intl.user_details_password_reset_btn}
          onCloseHandler={() => {
            setPassword(null);
            setConfirmPassword(null);
            setPasswordModal(false);
            setErrors(null);
            setTouched({});
          }}
          contentPaddingTop="pt-1"
          contentPadding="px-0"
          modalFooter={() => (
            <div className="flex flex-col gap-y-3 gap-x-3 md:flex-row md:gap-y-0 w-full">
              <div className="flex-1">
                <IconLeftBtn
                  text="キャンセル"
                  textColor={"text-white font-semibold text-sm w-full rounded"}
                  py={"py-2"}
                  px={"h-[40px] px-[10.5px] md:px-[17.5px]"}
                  bgColor={""}
                  textBold={true}
                  icon={() => null}
                  onClick={() => {
                    setPassword(null);
                    setConfirmPassword(null);
                    setPasswordModal(false);
                    setErrors(null);
                    setTouched({});
                  }}
                />
              </div>
              <div className="flex-1">
                <IconLeftBtn
                  text={intl.reset_submit_btn}
                  textColor={"text-white font-semibold text-sm w-full rounded"}
                  py={"py-2"}
                  px={"h-[40px] px-[10.5px] md:px-[17.5px]"}
                  bgColor={""}
                  textBold={true}
                  icon={() => null}
                  onClick={() => passwordReset()}
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
                      className={`rounded
                        py-3 h-[40px]
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
                      className={`h-[40px] rounded
                        py-3
                        focus:outline-none focus:ring-2 focus:ring-customBlue
                        border border-gray-400
                        block w-full pl-5 text-sm pr-[30px] font-medium text-black`}
                      placeholder={intl.forgot_autenticate_password_placeholder}
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
                      className=" text-left pl-1 validation-font text-left"
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
      {deleteModal && (
        <Modal
          height="412px"
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text="デフォルトに戻す"
          onCloseHandler={setDeleteModal}
          modalFooter={() => {
            return (
              <div className=" flex flex-col gap-y-3 gap-x-3 md:flex-row md:gap-y-0 w-full">
                <div className="flex-1">
                  <IconLeftBtn
                    text={intl.user_remote_wipe_no_btn}
                    textColor={
                      "text-white font-semibold text-sm w-full rounded"
                    }
                    py={"py-2"}
                    px={"h-[40px] px-[10.5px] md:px-[17.5px]"}
                    bgColor={""}
                    textBold={true}
                    icon={() => null}
                    onClick={() => {
                      setDeleteModal(() => false);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <IconLeftBtn
                    text={intl.user_remote_wipe_yes_btn}
                    textColor={
                      "text-white font-semibold text-sm w-full rounded"
                    }
                    py={"py-2"}
                    px={"h-[40px] px-[10.5px] md:px-[17.5px]"}
                    bgColor={""}
                    textBold={true}
                    icon={() => null}
                    onClick={() => {
                      handleRemoteWipeNotification();
                    }}
                  />
                </div>
              </div>
            );
          }}
        >
          <div className="flex flex-col">
            <div className="flex-grow  dark:text-black">
              {intl.remote_wipe_confirm}
            </div>
          </div>
        </Modal>
      )}
      <div className="bg-white p-[32px]">
        <div className="ml-[16px] font-normal text-sm mb-1">
          {intl.password_placeholder}
        </div>
        <div>
          <div className="flex ml-[16px] mb-[16px]">
            <Button
              type="default"
              style={{
                color: "#BA1818", // Red text color
                borderColor: "#BA1818",
                fontWeight: 600, // Font weight 600
                fontSize: "16px",

                height: "40px",
                borderRadius: "4px",
              }}
              onClick={() => {
                setErrors(null);
                setPasswordModal(true);
              }}
            >
              {intl.user_details_password_reset_btn}
            </Button>
          </div>
        </div>
        <div className="ml-[16px] font-normal text-sm mb-1">
          {intl.user_terminal_settings}
        </div>
        <div className="ml-[16px]">
          <Button
            type="default"
            style={{
              color: "#19388B", // Custom blue text color
              borderColor: "#19388B",
              fontWeight: 600, // Font weight 600
              fontSize: "16px",
              height: "40px",
              borderRadius: "4px",
            }}
            onClick={() => {
              setErrors(null);
              setDeleteModal(true);
            }}
          >
            {intl.user_restore_default_settings}
          </Button>
        </div>
        <div className="ml-[16px] font-normal text-sm mb-1">
         PTT
        </div>
        <div className="ml-[16px]">
          <Button
            type="default"
            style={{
              color: "#19388B", // Custom blue text color
              borderColor: "#19388B",
              fontWeight: 600, // Font weight 600
              fontSize: "16px",
              height: "40px",
              borderRadius: "4px",
            }}
            onClick={() => {
               handlePttNotification();
            }}
          >
            {intl.layout_pttBar_push_settings_to_terminal_ppt}
          </Button>
        </div>
      </div>
      {loading && <LoaderOverlay />}
    </>
  );
}
