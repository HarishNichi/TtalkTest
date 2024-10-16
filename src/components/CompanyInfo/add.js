"use client";
import { useState } from "react";
import DynamicLabel from "../Label/dynamicLabel";
import CompanyForm from "./formComponent";
import Upload from "@/components/Input/upload";
// import Breadcrumb from "@/components/Layout/breadcrumb";
import intl from "@/utils/locales/jp/jp.json";
import { companyAddLinks } from "@/utils/constant";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "../Loader/loadOverLay";

export default function AddUser({ setIsModalOpen, setComCreated }) {
  const router = useRouter();
  const [organizationsData, setOrganizationsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [editRecord, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageURL] = useState(null);
  const [imgError, setImgError] = useState("");
  const [validation, setValidation] = useState(false);
  const cardStyle = {
    background: "#FFFFFF",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: "9px",
  };
  const [isToastActive, setIsToastActive] = useState(false);
  const createOrg = async (record, name) => {
    toast.dismiss();
    if (!imageSource) {
      setValidation(true);
      return;
      // throw { message: intl.logo_cant_be_empty };
    }
    try {
      setLoading(true);

      record.accountDetail.organization.logo = imageSource;
      delete record.accountDetail.organization.isStatus;
      await api.post(`organizations/create`, { ...record });
      setLoading(false);
      setIsModalOpen(false);
      setComCreated(true);
      router.push("/company/list");
    } catch (error) {
      setLoading(false);
      setComCreated(false);
      setIsModalOpen(false);
      setErrors(error.message);
      if (!isToastActive) {
        setIsToastActive(true);
        toast(error.response?.data?.status.message || error.message, {
          position: "top-center",
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
  };

  return (
    <>
      {loading && <LoaderOverlay />}
      <ToastContainer />

      <div className="flex flex-col flex-1 h-full pt-[40px]">
        <div className="flex  justify-center">
          <div className="flex text-center text-[#0D0E11] text-[20px] font-semibold">
            {/* <DynamicLabel
              text={intl.add_new_company}
              alignment="text-center text-customBlue"
              fontSize="text-[20px]"
              fontWeight="font-semibold"
              disabled={false}
            /> */}
            {intl.add_new_company}
          </div>
        </div>

        <div className="p-[40px] pt-[32px]  flex justify-center flex-1 flex-col h-full">
          <div className="flex  justify-center max-h-[120px] ">
            <Upload
              edit={true}
              imgError={imgError}
              setImageURL={setImageURL}
              setImgError={setImgError}
              cursorClass={"cursor-pointer"}
            />
          </div>
          {!imageSource && validation && (
            <div className="validation-font text-sm text-[red] text-center mt-2">
              {intl.logo_cant_be_empty}
            </div>
          )}
          <div className="pt-[32px]">
            <CompanyForm
              isCreatePage
              isForm={true}
              isRequired={true}
              routerPath={router}
              updateOrg={createOrg}
              initialIsTranslate={false}
              initialIsTranscribe={false}
              initialSosLocation={false}
            ></CompanyForm>
          </div>
        </div>
      </div>
    </>
  );
}
