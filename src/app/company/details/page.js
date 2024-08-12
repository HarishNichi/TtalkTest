"use client";
import { useState, useEffect } from "react";
import DynamicLabel from "../../../components/Label/dynamicLabel";
import Upload from "../../../components/Input/upload";
import IconOutlineBtn from "../../../components/Button/iconOutlineBtn";
import EditIcon from "../../../components/Icons/editIcon";
import IconBtn from "../../../components/Button/iconBtn";
import CompanyForm from "../../../components/CompanyInfo/formComponent";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Layout/breadcrumb";
import intl from "@/utils/locales/jp/jp.json";
import { companyDetailLinks } from "../../../utils/constant";
import api from "@/utils/api";
import { useAppSelector } from "@/redux/hooks";
import ProtectedRoute from "@/utils/auth";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";

export default function CompanyInformation() {
  const Organization = useAppSelector(
    (state) => state.organizationReducer.organization
  );

  const router = useRouter();
  const cardStyle = {
    background: "#FFFFFF",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    borderRadius: "9px",
  };

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
      setLoading(false);
      let response = {
        id: org.id,
        name: org.name,
        fleetNumber: org.fleetNumber,
        numberOfUsers: org.accountDetail.organization.licenseCount?.actual,
        email: org.email,
        agencyName: org.accountDetail.organization.salesChannel,
        isStatus: org.accountDetail.organization.isStatus,
        status: org.accountDetail.organization.isStatus || false,
        isTranslate: org.accountDetail.organization.isTranslate,
        isTranscribe: org.accountDetail.organization.isTranscribe,
        address: org.accountDetail.organization.address,
        description: org.accountDetail.organization.description,
        salesChannel: org.accountDetail.organization.salesChannel,
        logo: org?.accountDetail?.organization?.logo?.path || "",
        sosLocation: org.accountDetail.organization.sosLocation,
      };
      setOrganizationsData(response);
    } catch (error) {
      setLoading(false);
      setErrors(error.message);
    }
  };
  function editIcon(flag) {
    return <EditIcon isMobile={flag} fill="#19388B" />;
  }

  const [organizationsData, setOrganizationsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <ProtectedRoute allowedRoles={["admin"]}>
        {loading && <LoaderOverlay />}
        <ToastContainer />
        <div className="mb-1">
          <Breadcrumb links={companyDetailLinks} />
        </div>
        <div className="flex flex-col flex-1 h-full">
          <div className="flex  justify-between mb-2 xl:mb-2 ">
            <div className="flex items-center">
              <DynamicLabel
                text={intl.company_details_company_details}
                alignment="text-center"
                fontSize="text-[22px]"
                fontWeight="font-medium"
                textColor="#000000"
                disabled={false}
              />
            </div>
            <div className="hidden lg:flex items-center">
              <span className="mr-2.5">
                <IconOutlineBtn
                  text={intl.company_details_edit}
                  textColor={"text-customBlue"}
                  textBold={true}
                  py={"xl:py-2.5 md:py-1.5"}
                  px={"xl:px-[47px] md:px-[48.5px]"}
                  icon={() => editIcon(false)}
                  borderColor={"border-customBlue"}
                  onClick={() => router.push("/company/edit")}
                />
              </span>
            </div>
            <div className=" lg:hidden flex">
              <span className="mr-2.5">
                <IconBtn
                  textColor={"text-white"}
                  textBold={true}
                  icon={() => editIcon(true)}
                  onClick={() => router.push("company/edit")}
                />
              </span>
            </div>
          </div>
          <div
            id="cardId"
            style={cardStyle}
            className="pt-2 p-3 pb-[30px] md:px-[60px]  xl:px-[80px] xl:pt-2 xl:pb-[40px] flex flex-col flex-1 h-full"
          >
            <div className="flex justify-center">
              {organizationsData && (
                <Upload imgSrc={organizationsData.logo} disabled={true} />
              )}
            </div>
            <div className="mt-1 mb-1 2xl:mb-8">
              <hr />
            </div>
            {organizationsData && (
              <CompanyForm
                disabled={true}
                initialCompanyName={organizationsData.name}
                initialMailId={organizationsData.email}
                initialUserCount={organizationsData.numberOfUsers}
                initialSalesChannel={organizationsData.agencyName}
                initialDescription={organizationsData.description}
                initialFleetNumber={organizationsData.fleetNumber}
                initialIsTranscribe={organizationsData.isTranscribe}
                initialIsTranslate={organizationsData.isTranslate}
                initialIsStatus={organizationsData.isStatus}
                initialCompanyId={organizationsData.id}
                initialSosLocation={organizationsData.sosLocation}
                routerPath={router}
              ></CompanyForm>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}
