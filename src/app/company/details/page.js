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
import IconOutlineBtn from "../../../components/Button/iconOutlineBtn";

import DeleteIcon from "@/components/Icons/deleteIcon";
import CompanyEdit from "@/components/Icons/companyEdit";
import AddButton from "@/components/Button/addButton";

export default function CompanyInformation() {
  const [status, setStatus] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [organizationsData, setOrganizationsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageURL] = useState(null);
  const [imgError, setImgError] = useState("");
  const [validation, setValidation] = useState(false);
  const router = useRouter();

  const Organization = useAppSelector(
    (state) => state.organizationReducer.organization
  );

  /**
   * Fetches the company data from the API by the company ID
   * stored in the redux state. If the API response is successful,
   * it updates the company data state and sets the loading state
   * to false. If the API response fails, it sets the error message
   * state and sets the loading state to false.
   *
   * @async
   * @returns {Promise<void>}
   */
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

  /**
   * Updates the organization information in the API with the given record.
   * If the update is successful, it closes the modal and redirects to the
   * company list page. If the update fails, it sets the error message state
   * and shows a toast notification with the error message.
   *
   * @async
   * @param {Object} record - The organization information to be updated.
   * @returns {Promise<void>}
   */
  const updateOrg = async (record) => {
    toast.dismiss();
    if (!organizationsData.logo && !imageSource) {
      setValidation(true);
      return;
    }
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

  /**
   * Handles the edit button click event.
   * Sets the validation state to false and then sets the isModalVisible state to true
   * after a 100ms delay. This is done to avoid any validation related issues
   * when the modal is opened.
   */
  const handleEditClick = () => {
    setValidation(false);
    setTimeout(() => {
      setIsModalVisible(true);
    }, 100);
  };

  /**
   * Handles the modal close event.
   * Sets the isModalVisible state to false.
   */
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  /**
   * Handles the delete button click event.
   * Sets the isDeleteModalVisible state to true, which then renders the delete confirmation modal.
   */
  const handleDeleteClick = () => {
    setIsDeleteModalVisible(true);
  };

  /**
   * Handles the confirmation of the delete operation.
   * Deletes the organization and then redirects the user to the list page.
   * If there is an error, it sets the loading state to false and shows a toast error message.
   */
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

  /**
   * Handles the cancellation of the delete operation.
   * Sets the isDeleteModalVisible state to false.
   */
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const companyDetailLinks = [
    {
      title: intl.components_card_searchlist_companylist,
      link: "/company/list",
    },
    { title: organizationsData?.name, link: "/company/details" },
  ];

  /**
   * A component that displays a single row of key-value information
   * in the company details page.
   *
   * @param {string} label - The key to be displayed.
   * @param {string} value - The value to be displayed.
   * @returns {JSX.Element} A JSX element containing the key-value pair.
   */
  const DataSection = ({ label, value }) => (
    <div className="mb-4">
      {/* Apply mb-16px as 4 is equivalent to 16px */}
      <div className="text-sm font-normal text-[#595959]">{label}</div>
      <div className="text-sm dark:text-black font-semibold">{value}</div>
    </div>
  );
  function deleteIcon(flag) {
    return <DeleteIcon isMobile={flag} />;
  }
  function editIcon(flag) {
    return <CompanyEdit isMobile={flag} />;
  }
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
              <div className="flex space-x-4">
                <IconOutlineBtn
                  text={intl.help_settings_addition_delete}
                  textColor="text-[#10265C]"
                  borderColor={"border border-[#10265C]"} // Light border when disabled, no border otherwise
                  textBold={true}
                  py={"xl:py-2.5 md:py-1.5 py-1.5"}
                  px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                  icon={deleteIcon}
                  // Disable the button when selectedRows is empty
                  onClick={handleDeleteClick}
                />

                <AddButton
                  text={intl.help_settings_addition_modal_edit}
                  textColor="text-white"
                  borderColor={"border"} // Light border when disabled, no border otherwise
                  textBold={true}
                  py={"xl:py-2.5 md:py-1.5 py-1.5"}
                  px={"xl:px-[20px] md:px-[22.5px] px-[22.5px]"}
                  icon={editIcon}
                  // Disable the button when selectedRows is empty
                  onClick={handleEditClick}
                />
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
            <div className="pb-[32px]">
              {organizationsData && (
                <Upload imgSrc={organizationsData.logo} disabled={true} />
              )}
            </div>

            {organizationsData && (
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col w-full">
                  <DataSection
                    label={intl.form_component_company_name_label}
                    value={organizationsData.name}
                  />
                  <DataSection
                    label={intl.form_component_company_id}
                    value={organizationsData.id}
                  />
                  <DataSection
                    label={intl.form_component_mailid_label}
                    value={organizationsData.email}
                  />
                  <DataSection
                    label={intl.form_component_usercount_label}
                    value={organizationsData.numberOfUsers}
                  />
                  <DataSection
                    label={intl.form_component_sales_channel}
                    value={organizationsData.salesChannel}
                  />
                  <DataSection
                    label={intl.form_component_fleet_number}
                    value={organizationsData.fleetNumber}
                  />
                </div>

                <div className="flex flex-col w-full ">
                  <DataSection
                    label={intl.form_component_simulataneous_intepretation}
                    value={organizationsData.isTranslate ? "ON" : "OFF"}
                  />
                  <DataSection
                    label={intl.form_component_transcription}
                    value={organizationsData.isTranscribe ? "ON" : "OFF"}
                  />
                  <DataSection
                    label={intl.company_list_sos_location}
                    value={organizationsData.sosLocation ? "ON" : "OFF"}
                  />
                  <DataSection
                    label={intl.company_list_company_status}
                    value={organizationsData.isStatus ? "ON" : "OFF"}
                  />
                  <DataSection
                    label={intl.help_settings_addition_service_manual}
                    value={organizationsData.description || "-"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <AntModal
          title={
            <div className="px-[40px] pt-[40px] mb-[32px] text-customBlue text-center text-[20px]">
              {intl.edit_screen_label}
            </div>
          }
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          centered
          className="my-[70px]"
          width={520}
        >
          <div className="flex justify-center h-[150px] pb-[32px] max-h-[120px] r">
            {organizationsData && (
              <Upload
                imgError={imgError}
                edit={true}
                setImageURL={setImageURL}
                imgSrc={organizationsData?.logo}
                setImgError={setImgError}
                cursorClass={"cursor-pointer"}
              />
            )}
          </div>
          {!imageSource && !organizationsData?.logo && validation && (
            <div className="validation-font text-sm text-[red] text-center mt-2">
              {intl.logo_cant_be_empty}
            </div>
          )}
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
            <div className="px-[40px] font-semibold text-xl pt-[25px] mb-[2vw] text-[#0D0E11] text-center">
              {intl.delete_company}
            </div>
          }
          width={500}
          open={isDeleteModalVisible}
          onCancel={handleDeleteCancel}
          footer={[null]}
          centered={true}
          className="my-[70px]"
        >
          <div
            style={{ textAlign: "center" }}
            className="px-[40px] text-[16px] font-normal font-normal text-base"
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
              className="flex-1 bg-[#BA1818] border-[#BA1818] text-white hover:bg-red-500 no-hover font-semibold h-[40px] text-base"
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
