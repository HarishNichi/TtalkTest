"use client";
import React, { useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
const ReactQuill =
  typeof window === "object" ? require("react-quill") : () => false;
const EditorComponent = ({ onChange, ContentValue }) => {
  const [value, setValue] = useState(ContentValue);
  const [fileNameError, setFileNameError] = useState(null);

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ header: [1, 2, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["image", "link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background", // Add color formats
    "code-block",
    "script",
    "align",
  ];

  function getHTMLSizeInMB(htmlContent) {
    const lengthInBytes = htmlContent.length;
    const sizeInMB = lengthInBytes / (1024 * 1024);
    return sizeInMB;
  }
  // Update the 'value' state when the 'ContentValue' prop changes
  useEffect(() => {
    setValue(ContentValue);
  }, [ContentValue]);

  useEffect(() => {
    setFileNameError("");
  }, []);

  const handleValueChange = (content) => {
    if (getHTMLSizeInMB(content) > 2) {
      setFileNameError(
        "コンテンツの長さが制限を超えています。縮小してください。"
      );
      return;
    }
    setFileNameError("");
    setValue(content);
    // Call the onChange callback function passed from the parent
    onChange(content);
  };

  return (
    <>
      <div className="flex max-h-[328px] dark:text-black">
        <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={handleValueChange}
          className="dark:text-black bg-white h-[328px] max-h-[328px]"
        />
      </div>
      <div>
        {fileNameError && (
          <div className="validation-font text-sm text-[red] text-left">
            {fileNameError}
          </div>
        )}
      </div>
    </>
  );
};

export default EditorComponent;
