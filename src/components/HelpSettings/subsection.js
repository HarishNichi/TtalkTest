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
  return (
    <div className="w-full mt-4">
      <div
        className="flex justify-left items-center mb-2 pl-[30px] bg-customBlue text-white"
        style={{
          borderRadius: "9px",
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
          textAlign: "center",
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: "500",
          height: "62px",
        }}
      >
        <span className="ml-[20px]">
          {intl.help_settings_component_subsection}
        </span>
      </div>

      <ul className="mt-4 border-t">
        {tabs.map((tab, index) => (
          <li
            key={tab.id}
            className={`cursor-pointer p-2 hover:bg-blue-100 bg-white border-b-2 ${
              selected === index ? "bg-blue-100" : ""
            }`}
            onClick={() => handleTabClick(index, tab)}
          >
            <span className="flex justify-between items-center h-[53px]">
              <p
                className={`text-[16px] truncate ${
                  selected === index
                    ? "text-[#FFF]"
                    : "text-[#848484] hover:text-[#bfbfbf]"
                }`}
                style={{
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "29px",
                  textAlign: "center",
                  marginLeft: "20px",
                }}
              >
                {tab.name}
              </p>
              <p className="flex">
                <span
                  data-testid={`delete-${index}`}
                  className="mr-[11px] ml-[25px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(tab);
                  }}
                >
                  <SectionDeleteIcon isActive={selected === index} />
                </span>
              </p>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubSection;
