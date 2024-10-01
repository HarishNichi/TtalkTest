"use client";
import { Noto_Sans_JP } from "next/font/google";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import intl from "@/utils/locales/jp/jp.json";
import { PASSWORD_PATTERN } from "@/validation/validationPattern";
import { validateHandler } from "@/validation/helperFunction";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import DynamicLabel from "@/components/Label/dynamicLabel";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import TextPlain from "@/components/Input/textPlain";
import IconRight from "@/components/Input/iconRight";
import PasswordTickIcon from "@/components/Icons/passwordTick";
import { IoEyeOff, IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Breadcrumb from "@/components/Layout/breadcrumb";
import ProtectedRoute from "@/utils/auth";
import { code } from "@/utils/constant";
const natoSans = Noto_Sans_JP({ subsets: ["latin"] });

// Yup schema to validate the form
const schema = Yup.object().shape({
  currentPassword: Yup.string().required(intl.validation_required),

  password: Yup.string()
    .required(intl.validation_required)
    .matches(PASSWORD_PATTERN.regex, PASSWORD_PATTERN.message),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "パスワードが一致しません")
    .required(intl.validation_required),
});
export default function UpdatePassword(setIsResetModal) {
  const routerPath = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [type1, setType1] = useState("password");
  const [type2, setType2] = useState("password");

  useEffect(() => {
    const formValues = { currentPassword, password, confirmPassword };
    validateHandler(schema, formValues, setErrors);
  }, [currentPassword, password, confirmPassword]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name == "currentPassword") {
      setCurrentPassword(value);
    } else if (name == "password") {
      setPassword(value);
    } else if (name == "confirmPassword") {
      setConfirmPassword(value);
    }
    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    toast.dismiss();
    if (password !== confirmPassword) {
      setLoading(false);
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "パスワードが一致しません",
      }));
      setTouched(() => ({
        ...touched,
        currentPassword: true,
        confirmPassword: true,
        password: true,
      }));
      return;
    }

    if (!errors) {
      setLoading(true);
      try {
        const response = await api.post("organizations/reset", {
          old: currentPassword,
          new: password,
        });
        setLoading(false);
        if (response && response.data.status.code == code.OK) {
          window.history.replaceState(null, "", "/");
          localStorage.clear();
          window.location.href = "/";
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
      setTouched(() => ({
        ...touched,
        currentPassword: true,
        confirmPassword: true,
        password: true,
      }));
    }
  };

  useEffect(() => {
    passwordIcon();
  }, [currentPassword]);

  const cardStyle = {
    background: "#FFFFFF",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: "9px",
  };
  function passwordIcon() {
    return currentPassword ? <PasswordTickIcon /> : null;
  }
  const links = [
    { title: "ダッシュボード", link: "#" },
    { title: "パスワードを変更", link: "/dashboard/update-password" },
  ];
  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />
      <ProtectedRoute allowedRoles={["organization"]}>
        <div className="flex justify-center pt-[30px]">
          <div className="flex justify-center mb-[10px]">
            {/* <DynamicLabel
              text="パスワードを変更"
              alignment="text-center text-customBlue"
              fontSize="text-xl"
              fontWeight="font-semibold"
              disabled={false}
            /> */}
            <DynamicLabel
              text="パスワードを変更"
              alignment="text-center text-customBlue "
              fontSize="text-xl"
              fontWeight="font-semibold"
              disabled={false}
            />
          </div>
        </div>
        <div className="pt-[37px] p-[20px] md:px-[60px] xl:px-[80px] xl:pt-[50px] xl:pb-[40px] flex flex-col flex-1 h-full">
          <form onSubmit={handleSave} className="space y-6 ">
            <div className="flex flex-col mb-[10px] ">
              <IconRight
                icon={passwordIcon}
                id={"currentPassword"}
                name={"currentPassword"}
                for={"currentPassword"}
                onChange={handleChange}
                placeholder={"今のパスワード"}
                padding={"p-[8px]"}
                label={"今のパスワード"}
                labelColor={"#7B7B7B"}
                isRequired={true}
                labelClass={
                  "mb-2 text-sm font-medium text-gray-900 dark:text-white"
                }
                bg={"bg-white"}
                border={"border border-[#e7e7e9]"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                text={"text-base text-gray-900"}
                additionalClass={
                  "bg-white block w-full  text-base pr-[30px] h-[40px]"
                }
                value={currentPassword}
              />
              {errors?.currentPassword && touched?.currentPassword && (
                <div className="pl-1 validation-font" style={{ color: "red" }}>
                  {errors?.currentPassword}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="relative mb-[10px]">
                <TextPlain
                  type={type1}
                  for={"password"}
                  value={password}
                  onChange={handleChange}
                  placeholder={""}
                  padding={"p-[8px]"}
                  focus={
                    "focus:outline-none focus:ring-2  focus:ring-customBlue "
                  }
                  border={"border border-[#e7e7e9]"}
                  bg={"bg-white "}
                  additionalClass={"block w-full  text-base pr-[40px] h-[40px]"}
                  label={intl.reset_new_password_label}
                  labelColor={"#7B7B7B"}
                  isRequired={true}
                  id={"password"}
                  name={"password"}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 pt-7 flex items-center justify-center"
                  onClick={(event) => {
                    event.preventDefault();
                    setType1(type1 === "password" ? "text" : "password");
                  }}
                >
                  {type1 == "password" ? (
                    <IoEyeOffOutline className="text-2xl text-[#A3A3A3]" />
                  ) : (
                    <IoEyeOutline className="text-2xl text-[#A3A3A3]" />
                  )}
                </button>
              </div>
              {errors?.password && touched?.password && (
                <div className="pl-1 validation-font" style={{ color: "red" }}>
                  {errors?.password}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="relative mb-[10px]">
                <TextPlain
                  type={type2}
                  placeholder={""}
                  for={"confirmPassword"}
                  padding={"p-[8px]"}
                  focus={
                    "focus:outline-none focus:ring-2  focus:ring-customBlue "
                  }
                  border={"border border-[#e7e7e9]"}
                  bg={"bg-white "}
                  additionalClass={"block w-full text-base pr-[40px] h-[40px]"}
                  isRequired={true}
                  label={intl.confirm_password}
                  labelColor={"#7B7B7B"}
                  id={"confirmPassword"}
                  name={"confirmPassword"}
                  value={confirmPassword}
                  onChange={handleChange}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 pt-7 flex items-center justify-center"
                  onClick={(event) => {
                    event.preventDefault();
                    setType2(type2 === "password" ? "text" : "password");
                  }}
                >
                  {type2 == "password" ? (
                    <IoEyeOffOutline className="text-2xl text-[#A3A3A3]" />
                  ) : (
                    <IoEyeOutline className="text-2xl text-[#A3A3A3]" />
                  )}
                </button>
              </div>
              {errors?.confirmPassword && touched?.confirmPassword && (
                <div className="pl-1 validation-font" style={{ color: "red" }}>
                  {errors?.confirmPassword}
                </div>
              )}
            </div>

            <div className="">
              <div className="mt-[30px] w-full pb-[30px]">
                <IconLeftBtn
                  text={"保存"}
                  type="submit"
                  py="py-[8px] px-[55px] w-full"
                  textColor="text-white font-normal text-[16px]"
                  bgColor="bg-customBlue"
                  textBold={true}
                  rounded="rounded-lg"
                  icon={() => {
                    return null;
                  }}
                />
              </div>
            </div>
          </form>
        </div>
      </ProtectedRoute>
    </>
  );
}
