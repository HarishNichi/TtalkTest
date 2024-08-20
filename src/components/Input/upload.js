"use client";
import { useRef, useState, useEffect } from "react";
import { FaPen } from "react-icons/fa";
import ProfileAvatar from "../Icons/profileAvatar";
import { SAMPLE_IMAGE } from "../../utils/constant";
import { toast } from "react-toastify";

export default function Upload(props) {
  const inputRef = useRef(null);
  const [imageSource, setImageSource] = useState(null);

  useEffect(() => {
    if (props.imgSrc && props.imgSrc != null)
      setImageSource((prev) => props.imgSrc);
  }, [props.imgSrc]);

  const handleClick = () => {
    if (props.disabled) {
      return;
    }
    // 👇️ open file input box on click of another element
    inputRef.current.click();
  };

  const fileToBase64 = (file) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };
  const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];

  const handleFileChange = async (event) => {
    const fileObj = event?.target?.files && event.target.files[0];
    if (!fileObj) {
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]; // Add more types if needed
    const maxFileSize = 2 * 1024 * 1024; //2 megabytes

    if (!allowedTypes.includes(fileObj.type)) {
      props.setImgError(
        "有効な画像ファイルを選択してください（JPEG、PNG、JPG）。"
      );
      toast.dismiss();
      toast("有効な画像ファイルを選択してください（JPEG、PNG、JPG）。", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      });
      return;
    }
    if (fileObj.size > maxFileSize) {
      props.setImgError(
        "ファイルサイズが大きすぎます。2MB以下のファイルを選択してください。"
      );
      toast(
        "ファイルサイズが大きすぎます。2MB以下のファイルを選択してください。",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          type: "error",
        }
      );
      return;
    }
    try {
      setImageSource((prev) => URL.createObjectURL(fileObj));
      const base64 = await fileToBase64(fileObj);
      props.setImageURL(base64);
    } catch (error) {
      props.setImgError("ファイルの変換エラー。もう一度やり直してください。");
    }
  };

  return (
    <main>
      <div
        className="avatar cursor-pointer"
        style={{ borderRadius: "50%", background: "#D9D9D9" }}
        onClick={handleClick}
      >
        {imageSource && imageSource != null ? (
          <img
            className="avatar-img-custom"
            src={imageSource}
            alt={SAMPLE_IMAGE}
          />
        ) : (
          <ProfileAvatar />
        )}
        {props.edit && (
          <div className="edit-icon border-4 border-white ">
            <input
              style={{ display: "none" }}
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={props.disabled || false}
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="16" height="16" rx="8" fill="#19388B" />
              <g clip-path="url(#clip0_4764_28595)">
                <path
                  d="M7.49984 8.5H4.1665C4.02484 8.5 3.90612 8.45205 3.81034 8.35616C3.71445 8.26027 3.6665 8.1415 3.6665 7.99983C3.6665 7.85805 3.71445 7.73933 3.81034 7.64366C3.90612 7.54789 4.02484 7.5 4.1665 7.5H7.49984V4.16666C7.49984 4.025 7.54778 3.90628 7.64367 3.8105C7.73956 3.71461 7.85834 3.66666 8 3.66666C8.14178 3.66666 8.2605 3.71461 8.35617 3.8105C8.45195 3.90628 8.49984 4.025 8.49984 4.16666V7.5H11.8332C11.9748 7.5 12.0936 7.54794 12.1893 7.64383C12.2852 7.73972 12.3332 7.8585 12.3332 8.00016C12.3332 8.14194 12.2852 8.26066 12.1893 8.35633C12.0936 8.45211 11.9748 8.5 11.8332 8.5H8.49984V11.8333C8.49984 11.975 8.45189 12.0937 8.356 12.1895C8.26011 12.2854 8.14134 12.3333 7.99967 12.3333C7.85789 12.3333 7.73917 12.2854 7.6435 12.1895C7.54773 12.0937 7.49984 11.975 7.49984 11.8333V8.5Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_4764_28595">
                  <rect width="16" height="16" rx="8" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        )}
      </div>
    </main>
  );
}
