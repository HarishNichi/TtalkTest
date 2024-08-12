"use client";

import { useState } from "react";
import ActionButton from "../components/actionButton";
import TitleUserCard from "../components/titleUserCard";
import intl from "@/utils/locales/jp/jp.json";
import Modal from "@/components/Modal/modal";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import { useAppSelector } from "@/redux/hooks";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import { successToastSettings } from "@/utils/constant";

import api from "@/utils/api";
export default function RemoteWipe() {
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const Employee = useAppSelector((state) => state.employeeReducer.employee);

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
      toast(intl.notify_success, successToastSettings)
      setDeleteModal(() => false);
    } catch (error) {
      setLoading(false);
      setDeleteModal(() => true);
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
      {loading && <LoaderOverlay />}
      <div className="flex justify-center mb-4 ">
        <TitleUserCard title={intl.user_remote_wipe_screen_label} />
      </div>

      <div className="w-full mx-auto">
        <div className="mb-12 text-center font-semibold text-[#817E78]">
          データを消去しますか?
        </div>

        <div className="mb-0 flex gap-x-4 justify-center md:px-24">
          <div className="w-[150px]" onClick={setDeleteModal}>
            <ActionButton title={"はい"} />
          </div>
        </div>
      </div>
      <ToastContainer />
      {deleteModal && (
        <Modal
          height="412px"
          fontSize="text-xl"
          fontWeight="font-semibold"
          textColor="#19388B"
          text={intl.user_remote_wipe_screen_label}
          onCloseHandler={setDeleteModal}
          modalFooter={() => {
            return (
              <div className=" flex justify-between">
                <div>
                  <IconLeftBtn
                    text={intl.user_remote_wipe_no_btn}
                    textColor={"text-white font-semibold text-sm w-full"}
                    py={"py-[11px]"}
                    px={"px-[26.5px] md:px-[35.5px]"}
                    bgColor={"bg-customBlue"}
                    textBold={true}
                    icon={() => {
                      return null;
                    }}
                    onClick={() => {
                      setDeleteModal(() => false);
                    }}
                  />
                </div>
                <div>
                  <IconLeftBtn
                    text={intl.user_remote_wipe_yes_btn}
                    textColor={"text-white font-semibold text-sm w-full ml-2"}
                    py={"py-[11px]"}
                    px={"px-[30.5px] md:px-[38.5px]"}
                    bgColor={"bg-customBlue"}
                    textBold={true}
                    icon={() => {
                      return null;
                    }}
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
            <div className="flex-grow py-[90px] pt-[60px] dark:text-black">
              {intl.remote_wipe_confirm}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
