"use client";

import { useState, useEffect } from "react";
import DynamicLabel from "@/components/Label/dynamicLabel";
import Upload from "@/components/Input/upload";
import intl from "@/utils/locales/jp/jp.json";
import CompanyForm from "@/components/CompanyInfo/formComponent";
import Breadcrumb from "@/components/Layout/breadcrumb";
import { companyEditLinks } from "@/utils/constant";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { useAppSelector } from "@/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import ProtectedRoute from "@/utils/auth";

export default function EditCompanyInformation() {
  const Organization = useAppSelector(
    (state) => state.organizationReducer.organization
  );
  const cardStyle = {
    background: "#FFFFFF",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: "9px",
  };
  const routerPath = useRouter();

  const [organizationsData, setOrganizationsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [editRecord, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageURL] = useState(null);
  const [imgError, setImgError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          id: Organization.id,
        },
      };
      let { data } = await api.get("organizations/get", params);
      let org = data.data.Item;
      let response = {
        id: org.id,
        name: org.name,
        numberOfUsers: org.accountDetail.organization.licenseCount?.actual,
        fleetNumber: org.fleetNumber,
        email: org.email,
        agencyName: org.accountDetail.organization.salesChannel,
        status: org.accountDetail.organization.isStatus || false,
        isTranslate: org.accountDetail.organization.isTranslate,
        isTranscribe: org.accountDetail.organization.isTranscribe,
        address: org.accountDetail.organization.address,
        description: org.accountDetail.organization.description,
        onlineStatus: org.accountDetail.organization.employeeOnlineStatus,
        isStatus: org.accountDetail.organization.isStatus || false,
        salesChannel: org.accountDetail.organization.salesChannel,
        logo: org?.accountDetail?.organization?.logo?.path || "",
        sosLocation: org.accountDetail.organization.sosLocation,
      };
      setOrganizationsData(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErrors(error.message);
    }
  };

  const updateOrg = async (record, name) => {
    toast.dismiss();
    setLoading(true);
    if (imageSource) {
      record.accountDetail.organization.logo = imageSource;
    } else {
      delete record.accountDetail.organization.logo;
    }
    record.accountDetail.organization.onlineStatus =
      organizationsData.onlineStatus || "offline";
    try {
      const payload = {
        id: Organization.id,
      };

      await api.put(`organizations/update`, { ...record, id: payload.id });
      setLoading(false);
      routerPath.push("/company/list");
    } catch (error) {
      setLoading(false);
      setErrors(error.message);
      toast(error.response?.data?.status.message, {
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
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <ProtectedRoute allowedRoles={["admin"]}>
        {loading && <LoaderOverlay />}
        <ToastContainer />
        <div className="mb-1">
          <Breadcrumb links={companyEditLinks} />
        </div>
        <div className="flex flex-col flex-1 h-full">
          <div className="flex justify-between mb-2 xl:mb-2">
            <div className="flex items-center">
              <DynamicLabel
                text={intl.edit_screen_label}
                alignment="text-center"
                fontSize="text-[22px]"
                fontWeight="font-medium"
                textColor="#000000"
                disabled={false}
              />
            </div>
          </div>
          <div
            style={cardStyle}
            className="pt-2 p-3 md:px-[60px]  xl:px-[80px] xl:pt-2 pb-[40px] flex flex-col flex-1 h-full"
          >
            <div className="flex justify-center">
              {organizationsData && (
                <Upload
                  imgError={imgError}
                  edit={true}
                  setImageURL={setImageURL}
                  imgSrc={organizationsData.logo}
                  setImgError={setImgError}
                />
              )}
            </div>
            <div className="mt-1 mb-1 2xl:mb-8">
              <hr />
            </div>
            {organizationsData && (
              <CompanyForm
                initialCompanyName={organizationsData.name}
                initialMailId={organizationsData.email}
                initialUserCount={organizationsData.numberOfUsers}
                initialSalesChannel={organizationsData.agencyName}
                initialDescription={organizationsData.description}
                initialIsTranslate={organizationsData.isTranslate}
                initialIsTranscribe={organizationsData.isTranscribe}
                initialIsStatus={organizationsData.isStatus}
                initialFleetNumber={organizationsData.fleetNumber}
                initialCompanyId={organizationsData.id}
                initialSosLocation={organizationsData.sosLocation}
                isForm={true}
                isRequired={true}
                routerPath={routerPath}
                updateOrg={updateOrg}
              ></CompanyForm>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}
