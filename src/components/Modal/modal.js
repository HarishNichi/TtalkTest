"use client";

import React, { useEffect, useRef, useState } from "react";
import DynamicLabel from "../Label/dynamicLabel";
import IconBtn from "../../components/Button/iconBtn";

const Modal = ({
  children,
  fontSize,
  fontWeight,
  textColor,
  text,
  height,
  onCloseHandler,
  contentPaddingTop,
  handelEdit,
  displayEditIcon,
  contentPadding = "px-12",
  modalFooter,
}) => {
  const modalRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true);
  const [modalWidth, setModalWidth] = useState(calculateModalWidth());

  /**
   * Closes the modal by setting the isOpen state to false.
   */
  const closeModal = () => {
    setIsOpen(false);
    if (typeof onCloseHandler === "function") {
      onCloseHandler(false);
    }
  };

  /**
   * Handles outside click events on the document. If the clicked target is outside the modal,
   * it calls the closeModal function to close the modal.
   * @param {Event} event - The click event
   */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  /**
   * Calculates the width of the modal based on the screen width. If the window object is available,
   * it checks the screen width and returns the appropriate width for the modal.
   * @returns {String} The calculated modal width
   */
  function calculateModalWidth() {
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      return screenWidth >= 768 ? "446px" : "322px";
    }
    return "446px"; // Fallback value for non-browser environments
  }

  useEffect(() => {
    /**
     * Handles window resize events and updates the modal width accordingly.
     */
    function handleResize() {
      setModalWidth(calculateModalWidth());
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const modalStyle = {
    width: modalWidth,
    height: height ? height : "533px",
  };

  const overlayStyle = {
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "14" /* Sit on top */,
    overflowY: "auto",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: "0px",
  };

  function editIcon() {
    return (
      <svg
        width="19"
        height="19"
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.86664 12.8799L5.78657 16.7998L0 18.6665L1.86664 12.8799Z"
          fill="white"
        />
        <path
          d="M3.17798 11.5388L12.2852 2.43164L16.2448 6.39124L7.13758 15.4984L3.17798 11.5388Z"
          fill="white"
        />
        <path
          d="M18.3864 4.19991L17.5464 5.03986L13.6265 1.11992L14.4664 0.27997C14.8397 -0.0933235 15.3997 -0.0933235 15.773 0.27997L18.3863 2.89319C18.7597 3.26662 18.7597 3.82665 18.3864 4.19994L18.3864 4.19991Z"
          fill="white"
        />
      </svg>
    );
  }

  const Footer = modalFooter;

  return (
    <>
      {isOpen && (
        // <!-- Main modal -->
        <>
          <center style={overlayStyle}>
            <div
              id="defaultModal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed top-0 left-0 right-0 z-50  w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
              <div className="relative w-full max-w-2xl max-h-full flex justify-center items-center">
                {/* <!-- Modal content --> */}
                <div className="relative bg-white rounded-lg shadow w-full 1sm:w-1/2 2sm:w-2/3 md:w-3/5 mt-[12vw] md:mt-[12vw]">
                  {/* <!-- Modal header --> */}
                  <div className="flex justify-center items-center pt-4 px-4 pb-0 rounded-t">
                    {" "}
                    {/* Modify this line */}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex-grow">
                      <DynamicLabel
                        text={text}
                        alignment="text-center"
                        fontSize={fontSize}
                        fontWeight={fontWeight}
                        textColor={textColor}
                        disabled={false}
                      />
                    </h3>
                    {displayEditIcon && (
                      <IconBtn
                        textColor={"text-white"}
                        textBold={true}
                        icon={() => editIcon()}
                        onClick={() => handelEdit("company/edit")}
                        bg={"bg-[#346595] ml-[20px]  mb-[10px] text-right"}
                        className="ml-auto"
                      />
                    )}
                    <>&nbsp;&nbsp;</>
                    <button
                      onClick={closeModal}
                      className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none mb-[10px]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>{" "}
                    {/* Modify this line */}
                  </div>
                  {/* <!-- Modal body --> */}
                  <div className="p-[32px] space-y-6">{children}</div>
                  {/* <!-- Modal footer --> */}
                  <div className="flex justify-center items-center px-[32px] pb-[32px] space-x-2 rounded-b">
                    <Footer />
                  </div>
                </div>
              </div>
            </div>
          </center>
        </>
      )}
    </>
  );
};

export default Modal;
