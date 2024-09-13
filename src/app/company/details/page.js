"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import ProtectedRoute from "@/utils/auth";
import { ToastContainer, toast } from "react-toastify";

import { Modal as AntModal, Button, Menu } from "antd";
import Upload from "../../../components/Input/upload";
import CompanyForm from "../../../components/CompanyInfo/formComponent";
import Breadcrumb from "@/components/Layout/breadcrumb";
import intl from "@/utils/locales/jp/jp.json";
import api from "@/utils/api";
import LoaderOverlay from "@/components/Loader/loadOverLay";

export default function CompanyInformation() {
  const [status, setStatus] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [organizationsData, setOrganizationsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageURL] = useState(null);
  const [imgError, setImgError] = useState("");
  const router = useRouter();

  const Organization = useAppSelector(
    (state) => state.organizationReducer.organization
  );

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
      let orgIds = [];
      let id = {
        id: Organization.id,
      };

      orgIds.push(id);
      await api.post(`organizations/delete-all`, orgIds);
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

  const companyDetailLinks = [
    { title: intl.components_card_searchlist_companylist, link: "/company/list" },
    { title: organizationsData?.name, link: "/company/details" },
  ];

  return (
    <>
      <ProtectedRoute allowedRoles={["admin"]}>
        {loading && <LoaderOverlay />}
        <ToastContainer />
        <div className="mb-1">
          <div className="mb-[16px]">
            <Breadcrumb links={companyDetailLinks} />
          </div>

          <div className="">
            <div className="flex justify-between items-center mb-[16px]">
              <div className="font-semibold text-[20px] dark:text-black">
                {organizationsData?.name || ""}
              </div>
              <div className="flex space-x-2">
                <Button
                  type="danger"
                  onClick={handleDeleteClick}
                  className="text-[#BA1818] flex text-[16px] font-semibold "
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.30775 20.5C6.81058 20.5 6.385 20.323 6.031 19.969C5.677 19.615 5.5 19.1894 5.5 18.6923V6H5.25C5.0375 6 4.85942 5.92808 4.71575 5.78425C4.57192 5.64042 4.5 5.46225 4.5 5.24975C4.5 5.03708 4.57192 4.859 4.71575 4.7155C4.85942 4.57183 5.0375 4.5 5.25 4.5H9C9 4.25517 9.08625 4.0465 9.25875 3.874C9.43108 3.70167 9.63967 3.6155 9.8845 3.6155H14.1155C14.3603 3.6155 14.5689 3.70167 14.7413 3.874C14.9138 4.0465 15 4.25517 15 4.5H18.75C18.9625 4.5 19.1406 4.57192 19.2843 4.71575C19.4281 4.85959 19.5 5.03775 19.5 5.25025C19.5 5.46292 19.4281 5.641 19.2843 5.7845C19.1406 5.92817 18.9625 6 18.75 6H18.5V18.6923C18.5 19.1894 18.323 19.615 17.969 19.969C17.615 20.323 17.1894 20.5 16.6923 20.5H7.30775ZM17 6H7V18.6923C7 18.7821 7.02883 18.8558 7.0865 18.9135C7.14417 18.9712 7.21792 19 7.30775 19H16.6923C16.7821 19 16.8558 18.9712 16.9135 18.9135C16.9712 18.8558 17 18.7821 17 18.6923V6ZM10.1543 17C10.3668 17 10.5448 16.9282 10.6885 16.7845C10.832 16.6407 10.9037 16.4625 10.9037 16.25V8.75C10.9037 8.5375 10.8318 8.35933 10.688 8.2155C10.5443 8.07184 10.3662 8 10.1535 8C9.941 8 9.76292 8.07184 9.61925 8.2155C9.47575 8.35933 9.404 8.5375 9.404 8.75V16.25C9.404 16.4625 9.47583 16.6407 9.6195 16.7845C9.76333 16.9282 9.94158 17 10.1543 17ZM13.8465 17C14.059 17 14.2371 16.9282 14.3807 16.7845C14.5243 16.6407 14.596 16.4625 14.596 16.25V8.75C14.596 8.5375 14.5242 8.35933 14.3805 8.2155C14.2367 8.07184 14.0584 8 13.8458 8C13.6333 8 13.4552 8.07184 13.3115 8.2155C13.168 8.35933 13.0962 8.5375 13.0962 8.75V16.25C13.0962 16.4625 13.1682 16.6407 13.312 16.7845C13.4557 16.9282 13.6338 17 13.8465 17Z"
                      fill="#BA1818"
                    />
                  </svg>

                  {intl.help_settings_addition_delete}
                </Button>
                <Button
                  type="danger"
                  onClick={handleEditClick}
                  className="text-customBlue flex text-[16px] font-semibold "
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <g clipPath="url(#clip0_5185_3856)">
                      <path
                        d="M5 19H6.2615L16.498 8.7635L15.2365 7.502L5 17.7385V19ZM4.404 20.5C4.14783 20.5 3.93317 20.4133 3.76 20.24C3.58667 20.0668 3.5 19.8522 3.5 19.596V17.8635C3.5 17.6197 3.54683 17.3873 3.6405 17.1663C3.734 16.9453 3.86283 16.7527 4.027 16.5885L16.6905 3.93075C16.8417 3.79342 17.0086 3.68733 17.1913 3.6125C17.3741 3.5375 17.5658 3.5 17.7663 3.5C17.9668 3.5 18.1609 3.53558 18.3488 3.60675C18.5368 3.67792 18.7032 3.79108 18.848 3.94625L20.0693 5.18275C20.2244 5.32758 20.335 5.49425 20.401 5.68275C20.467 5.87125 20.5 6.05975 20.5 6.24825C20.5 6.44942 20.4657 6.64133 20.397 6.824C20.3283 7.00683 20.2191 7.17383 20.0693 7.325L7.4115 19.973C7.24733 20.1372 7.05475 20.266 6.83375 20.3595C6.61275 20.4532 6.38033 20.5 6.1365 20.5H4.404ZM15.8562 8.14375L15.2365 7.502L16.498 8.7635L15.8562 8.14375Z"
                        fill="#19388B"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_5185_3856">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
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
            className="p-[24px]  flex flex-col flex-1 h-full"
          >
            <div className="pb-[24px]">
              {organizationsData && (
                <Upload imgSrc={organizationsData.logo} disabled={true} />
              )}
            </div>

            {organizationsData && (
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col w-full space-y-2 ">
                  <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_company_name_label}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.name}
                  </div>

                  {/* <div className="text-sm font-normal text-[#595959]">
                    {intl.furigana}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.name}
                  </div> */}
                  <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_company_id}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.id}
                  </div>

                  <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_mailid_label}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.email}
                  </div>

                  <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_usercount_label}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.numberOfUsers}
                  </div>

                  <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_sales_channel}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.salesChannel}
                  </div>

                  <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_fleet_number}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.fleetNumber}
                  </div>
                </div>

                <div className="flex flex-col w-full space-y-2">
                  {/* <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_sales_channel}
                  </div>
                  <div className="text-sm font-semibold">
                    {organizationsData.salesChannel}
                  </div> */}
                  <div className="text-sm font-normal text-[#595959]">
                    {intl.form_component_simulataneous_intepretation}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.isTranslate ? "ON" : "OFF"}
                  </div>

                  <div className="text-sm font-normal text-[#595959] text-[#595959]">
                    {intl.form_component_transcription}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.isTranscribe ? "ON" : "OFF"}
                  </div>

                  <div className="text-sm font-normal text-[#595959]">
                    {intl.company_list_sos_location}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.sosLocation ? "ON" : "OFF"}
                  </div>

                  <div className="text-sm font-normal text-[#595959]">
                    {intl.company_list_company_status}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.isStatus ? "ON" : "OFF"}
                  </div>

                  <div className="text-sm font-normal text-[#595959]">
                    {intl.help_settings_addition_service_manual}
                  </div>

                  <div className="text-sm dark:text-black font-semibold">
                    {organizationsData.description || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <AntModal
          title={
            <div className="px-[40px] pt-[17px] mb-[2vw] text-customBlue text-center">
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
            <div className="px-[40px] pt-[17px] mb-[2vw] text-customBlue text-center">
              {intl.delete_company}
            </div>
          }
          width={500}
          open={isDeleteModalVisible}
          onCancel={handleDeleteCancel}
          footer={[null]}
        >
          <div
            style={{ textAlign: "center" }}
            className="px-[40px] text-[16px] font-normal"
          >
            {intl.company_list_delete}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]">
            <Button
              key="cancel"
              className="flex-1 text-[#214BB9] border-[#214BB9] font-semibold h-[40px] text-base "
              onClick={handleDeleteCancel}
            >
              {intl.help_settings_addition_modal_cancel}
            </Button>
            <Button
              key="delete"
              className="flex-1 bg-[#BA1818] border-[#BA1818] text-white hover:bg-red-500 no-hover h-[40px]"
              onClick={handleDeleteConfirm}
            >
              {intl.help_settings_addition_delete_button}
            </Button>
          </div>
        </AntModal>
      </ProtectedRoute>
    </>
  );
}
