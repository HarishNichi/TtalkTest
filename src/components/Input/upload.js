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
          <div className="edit-icon border-4 border-white">
            <input
              style={{ display: "none" }}
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={props.disabled || false}
            />
            <FaPen className="custom-icon-edit cursor-pointer" />
          </div>
        )}
      </div>
    </main>
  );
}
