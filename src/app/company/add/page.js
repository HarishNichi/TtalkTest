"use client";
import { useState } from "react";
import DynamicLabel from "@/components/Label/dynamicLabel";
import CompanyForm from "@/components/CompanyInfo/formComponent";
import Upload from "@/components/Input/upload";
import Breadcrumb from "@/components/Layout/breadcrumb";
import intl from "@/utils/locales/jp/jp.json";
import { companyAddLinks } from "@/utils/constant";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { ToastContainer, toast } from "react-toastify";
import ProtectedRoute from "@/utils/auth";
import LoaderOverlay from "@/components/Loader/loadOverLay";

export default function AddUser() {
  const router = useRouter();
  const [organizationsData, setOrganizationsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [editRecord, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageURL] = useState(null);
  const [imgError, setImgError] = useState("");
  const cardStyle = {
    background: "#FFFFFF",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: "9px",
  };
  const [isToastActive, setIsToastActive] = useState(false);
  const createOrg = async (record, name) => {
    toast.dismiss();
    try {
      setLoading(true);
      if (!imageSource) {
        throw { message: intl.logo_cant_be_empty };
      }
      record.accountDetail.organization.logo = imageSource;
      delete record.accountDetail.organization.isStatus;
      await api.post(`organizations/create`, { ...record });
      setLoading(false);
      router.push("/company/list");
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
  };

  return (
    <>
      <ProtectedRoute allowedRoles={["admin"]}>
        {loading && <LoaderOverlay />}
        <ToastContainer />
        <div className="mb-1">
          <Breadcrumb links={companyAddLinks} />
        </div>
        <div className="flex flex-col flex-1 h-full">
          <div className="flex  justify-between mb-2 xl:mb-2">
            <div className="flex">
              <DynamicLabel
                text={intl.company_details_company_add}
                alignment="text-center"
                fontSize="text-[22px]"
                fontWeight="font-medium"
                textColor="#000000"
                disabled={false}
              />
            </div>
          </div>
          <div
            // style={cardStyle}
            className="pt-2 p-3 md:px-[60px]  xl:px-[80px] xl:pt-2 pb-[40px] flex flex-1 flex-col h-full"
          >
            <div className="flex justify-center">
              <Upload
                edit={true}
                imgError={imgError}
                setImageURL={setImageURL}
                setImgError={setImgError}
              />
            </div>
            <div className="mt-2 mb-3 2xl:mb-8">
              <hr />
            </div>
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
      </ProtectedRoute>
    </>
  );
}
