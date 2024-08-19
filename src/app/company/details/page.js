"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import ProtectedRoute from "@/utils/auth";
import { ToastContainer, toast } from "react-toastify";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Modal as AntModal, Button, Menu } from "antd";

import Upload from "../../../components/Input/upload";
import CompanyForm from "../../../components/CompanyInfo/formComponent";
import Breadcrumb from "@/components/Layout/breadcrumb";
import intl from "@/utils/locales/jp/jp.json";
import { companyDetailLinks } from "../../../utils/constant";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";

export default function CompanyInformation() {
  const Organization = useAppSelector(
    (state) => state.organizationReducer.organization
  );
  const [status, setStatus] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [organizationsData, setOrganizationsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageURL] = useState(null);
  const [imgError, setImgError] = useState("");
  const router = useRouter();
  const menu = (
    <Menu>
      <Menu.Item key="1">Option 1</Menu.Item>
      <Menu.Item key="2">Option 2</Menu.Item>
    </Menu>
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { params: { id: Organization.id } };
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

  const updateOrg = async (record) => {
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
      setIsModalVisible(false); // Close modal after update
      router.push("/company/list");
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

  const handleEditClick = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await api.delete(`organizations/delete/${Organization.id}`);
      setLoading(false);
      setIsDeleteModalVisible(false); // Close modal after delete
      router.push("/company/list");
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

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
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
          <Breadcrumb links={companyDetailLinks} />
          <div className="">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {organizationsData?.name || ""}
              </h2>
              <div className="flex space-x-2">
                <Button
                  type="danger"
                  onClick={handleDeleteClick}
                  icon={<AiFillDelete />}
                  className="text-red-500"
                >
                  {intl.help_settings_addition_delete}
                </Button>
                <Button
                  type=""
                  onClick={handleEditClick}
                  icon={<AiFillEdit />}
                  className="text-customBlue"
                >
                  {intl.help_settings_addition_modal_edit}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 h-full relative">
          <div
            id="cardId"
            style={{
              background: "#FFFFFF",
              boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
              borderRadius: "9px",
            }}
            className="pt-2 p-3 pb-[30px] md:px-[60px] xl:px-[80px] xl:pt-2 xl:pb-[40px] flex flex-col flex-1 h-full"
          >
            <div className="">
              {organizationsData && (
                <Upload imgSrc={organizationsData.logo} disabled={true} />
              )}
            </div>

            {organizationsData && (
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col w-full space-y-2 mt-[2vw]">
                  <div className="text-sm font-normal">
                    {intl.form_component_company_name_label}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.name}
                  </div>
                  <div className="text-sm font-normal">{intl.furigana}</div>
                  <div className="text-sm font-semibold">
                    {organizationsData.name}
                  </div>
                  <div className="text-sm font-normal">
                    {intl.form_component_company_id}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.id}
                  </div>
                  <div className="text-sm font-normal">
                    {intl.form_component_mailid_label}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.email}
                  </div>
                  <div className="text-sm font-normal">
                    {intl.form_component_usercount_label}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.numberOfUsers}
                  </div>
                  <div className="text-sm font-normal">
                    {intl.form_component_fleet_number}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.fleetNumber}
                  </div>
                </div>

                <div className="flex flex-col w-full space-y-2 mt-[2vw]">
                  <div className="text-sm font-normal">
                    {intl.form_component_sales_channel}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.salesChannel}
                  </div>
                  <div className="text-sm font-normal">
                    {intl.form_component_transcription}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.isTranscribe ? "ON" : "OFF"}
                  </div>
                  <div className="text-sm font-normal">
                    {intl.form_component_sales_channel}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.isStatus ? "ON" : "OFF"}
                  </div>
                  <div className="text-sm font-normal">
                    {intl.form_component_simulataneous_intepretation}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.isTranslate ? "ON" : "OFF"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <AntModal
          title={
            <div className="px-[40px] pt-[40px] mb-[2vw] text-customBlue text-center">
              {intl.edit_screen_label}
            </div>
          }
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
        >
          <div className="flex justify-center h-[150px]">
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
          <div className="px-[40px] pb-[40px]">
            <CompanyForm
              initialCompanyName={organizationsData?.name}
              initialMailId={organizationsData?.email}
              initialUserCount={organizationsData?.numberOfUsers}
              initialSalesChannel={organizationsData?.agencyName}
              initialDescription={organizationsData?.description}
              initialIsTranslate={organizationsData?.isTranslate}
              initialIsTranscribe={organizationsData?.isTranscribe}
              initialIsStatus={organizationsData?.isStatus}
              initialFleetNumber={organizationsData?.fleetNumber}
              initialCompanyId={organizationsData?.id}
              initialSosLocation={organizationsData?.sosLocation}
              isForm={true}
              isRequired={true}
              updateOrg={updateOrg} // Add this to handle updates
            />
          </div>
        </AntModal>

        <AntModal
          title={
            <div className="px-[40px] pt-[40px] mb-[2vw] text-customBlue text-center">
              {intl.delete_company}
            </div>
          }
          visible={isDeleteModalVisible}
          onCancel={handleDeleteCancel}
          footer={[null]}
          style={{ padding: "40px" }}
        >
          <p style={{ textAlign: "center" }}>{intl.company_list_delete}</p>
          <div className="flex justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]">
            <Button
              key="cancel"
              className="flex-1 text-blue-500 border-blue-500 "
              onClick={handleDeleteCancel}
            >
              {intl.help_settings_addition_modal_cancel}
            </Button>
            <Button
              key="delete"
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeleteConfirm}
            >
              {intl.help_settings_addition_delete}
            </Button>
          </div>
        </AntModal>
      </ProtectedRoute>
    </>
  );
}
