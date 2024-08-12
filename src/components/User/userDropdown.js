
"use client"

import React, { useState } from "react";
import DropDownIcon from "../Icons/dropdownIcon";

const UserDropDown = ({ options, dropDownOptions }) => {
  const [showCard, setShowCard] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCardClick = () => {
    setShowCard(!showCard);
  };

  const handleDropdownClick = () => {
    setShowDropdown(!showDropdown);
  };

  const container = {
    display: "flex",
    alignItems: "center",
  };

  const cardContainer = {
    position: "relative",
  };

  const card = {
    width: "155px",
    minHeight: "224px",
    background: "#F9F9F9",
    boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.26)",
    borderRadius: "13px",
    color: "#656565",
    marginTop: "20px",
    position: "absolute",
    right: "0px",
    top: "20px",
    zIndex: 1,
  };

  const cardItem = {
    margin: "10px",
    marginBottom: "15px",
    marginLeft: "30px",
    cursor: "pointer",
    fontSize:"15px",
  };

  const firstItem = {
    margin: "10px",
    paddingTop: "15px",
    marginBottom: "15px",
    marginLeft: "30px",
    cursor: "pointer",
    fontSize:"15px",
  };

  const lastItem = {
    margin: "10px",
    marginBottom: "13px",
    paddingLeft: "40px",
    cursor: "pointer",
    fontSize:"13px",
  };

  const dropDownItem = {
    margin: "10px",
    marginBottom: "13px",
    marginLeft: "30px",
    cursor: "pointer",
  };

  function getStyleStatus(index) {
    if (index === 0) {
      return firstItem;
    }
    return index === options.length - 1 ? dropDownItem : cardItem;
  }

  return (
    <div>
      <div style={container}>
        <svg
          width="31"
          height="31"
          viewBox="0 0 46 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={handleCardClick}
          aria-label="card-icon"
          className="cursor-pointer"
        >
          <rect width="46" height="44" rx="9" fill="#19388B" />
          <circle
            cx="3.12047"
            cy="3.12047"
            r="3.12047"
            transform="matrix(-1 0 0 1 26.241 10.7256)"
            fill="white"
          />
          <circle
            cx="3.12047"
            cy="3.12047"
            r="3.12047"
            transform="matrix(-1 0 0 1 26.241 18.8789)"
            fill="white"
          />
          <circle
            cx="3.12047"
            cy="3.12047"
            r="3.12047"
            transform="matrix(-1 0 0 1 26.241 27.0332)"
            fill="white"
          />
        </svg>

        {showCard && (
          <div style={cardContainer}>
            <div style={card}>
              {options.map((option, index) => (
                <p
                  key={option.label}
                  className={`flex flex-row items-center ${index === options.length - 1 ?"justify-between":""}`}
                  style={
                    getStyleStatus(index)
                  }
                  onClick={
                    index < options.length - 1
                      ? option.onClick
                      : handleDropdownClick
                  }
                >
                  {option.label}{" "}
                  {index === options.length - 1 && (
                    <span className="mr-[10px]">
                      <DropDownIcon />
                    </span>
                  )}
                </p>
              ))}
              {showDropdown && (
                <>
                  {dropDownOptions.map((option, index) => (
                    <span
                      id={`id-${index}`}
                      className="flex flex-column items-center"
                      key={option.label}
                      style={lastItem}
                      onClick={option.onClick}
                    >
                      {option.label}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropDown;
