import React from "react";
import intl from "../../utils/locales/jp/jp.json";

const ButtonCard = ({
  activeButton,
  onActiveButtonChange,
  file,
  editorValue,
}) => {
  const handleButtonClick = (buttonName) => {
    if ((buttonName === "file" && !text) || (buttonName === "text" && !file)) {
      onActiveButtonChange(buttonName);
    }
  };
  let text = editorValue;

  if (text.includes("<p><br></p>")) {
    text = text.replace("<p><br></p>", "");
  }

  const isFileButtonDisabled = text.length > 0 || false;
  const isTextButtonDisabled = file;

  // Button styles
  const buttonStyles = {
    width: "132px",
    height: "30px",
    flexShrink: 0,
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    outline: "none",
  };

  // Active button styles
  const activeButtonStyles = {
    ...buttonStyles,
    borderRadius: "24px",
    background: "#19388B",
    color: "#FFFFFF",
  };

  // Inactive button styles
  const inactiveButtonStyles = {
    ...buttonStyles,
    color: "#737373",
  };

  const handleButtonHover = (buttonName) => {
    if (buttonName !== activeButton) {
      const buttonElement = document.getElementById(`button-${buttonName}`);
      if (buttonElement) {
        buttonElement.style.background = "#19388B";
        buttonElement.style.color = "#FFFFFF";
        buttonElement.style.borderRadius = "24px";
      }
    }
  };

  const handleButtonLeave = (buttonName) => {
    if (buttonName !== activeButton) {
      const buttonElement = document.getElementById(`button-${buttonName}`);
      if (buttonElement) {
        buttonElement.style.background = "#FFF";
        buttonElement.style.color = "#737373";
      }
    }
  };

  return (
    <div
      style={{
        width: "295px",
        height: "42px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px",
        borderRadius: "32px",
        background: "#FFF",
        boxShadow: "0px 0px 7px 0px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Button 1 */}
      <button
        id="button-file"
        style={
          activeButton === "file" ? activeButtonStyles : inactiveButtonStyles
        }
        onClick={() => handleButtonClick("file")}
        onMouseEnter={() => handleButtonHover("file")}
        onMouseLeave={() => handleButtonLeave("file")}
        disabled={isFileButtonDisabled}
      >
        {intl.layout_pttBar_file_label}
      </button>

      {/* Button 2 */}
      <button
        id="button-text"
        style={
          activeButton === "text" ? activeButtonStyles : inactiveButtonStyles
        }
        onClick={() => handleButtonClick("text")}
        onMouseEnter={() => handleButtonHover("text")}
        onMouseLeave={() => handleButtonLeave("text")}
        disabled={isTextButtonDisabled}
      >
        {intl.helpSettings_buttonCard_text_label}
      </button>
    </div>
  );
};

export default ButtonCard;
