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
                <Button
                  type="danger"
                  onClick={handleEditClick}
                  className="text-white border bg-customBlue h-[40px] flex text-[16px] font-semibold "
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
                        fill="white"
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
