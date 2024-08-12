"use client";
import React from "react";
import SectionDeleteIcon from "../Icons/sectionDelete";
import intl from "../../utils/locales/jp/jp.json";

const SubSection = ({
  selected,
  tabs,
  handleTabClick,
  handleEditClick,
  handleDeleteClick,
}) => {
  const sectionStyle = {
    borderRadius: "9px",
    background: "#FFF",
    boxShadow: "0px 0px 15px 0px rgba(0, 0, 0, 0.10)",
    overflow: "auto",
  };

  const headingStyle = {
    borderRadius: "9px",
    borderBottomLeftRadius: "0px",
    borderBottomRightRadius: "0px",
    textAlign: "center",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: "500",
    height: "62px",
  };

  const buttonStyle = {
    borderRadius: "8px",
    background: "#19388B",
    marginBottom: "10px",
  };

  return (
    <div className="h-full" style={sectionStyle}>
      <div
        className="flex justify-left items-center mb-2 pl-[30px] bg-customBlue text-white"
        style={headingStyle}
      >
        <span className="ml-[20px]">
          {intl.help_settings_component_subsection}
        </span>
      </div>

      <div className="px-[32px] md:max-h-[369px] 2xl:max-h-[740px] overflow-y-auto">
        {tabs.map((tab, index) => {
          const textStyle = {
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "29px",
            textAlign: "center",
            marginLeft: "20px",
          };

          return (
            <div
              key={tab.id}
              style={selected === index ? buttonStyle : null}
              className={`tabs.length === index + 1 ? "mb-2" : ""`}
            >
              <span className="flex justify-between items-center h-[53px] cursor-pointer ">
                <p
                  className={`text-[16px] truncate ${
                    selected === index
                      ? "text-[#FFF]"
                      : "text-[#848484] hover:text-[#bfbfbf]"
                  }`}
                  style={textStyle}
                  onClick={() => handleTabClick(index, tab)}
                >
                  {tab.name}
                </p>
                <p className="flex ">
                  <span
                    data-testid={`delete-${index}`}
                    className="mr-[11px] ml-[25px]"
                    onClick={() => handleDeleteClick(tab)}
                  >
                    <SectionDeleteIcon isActive={selected === index} />
                  </span>
                </p>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubSection;
