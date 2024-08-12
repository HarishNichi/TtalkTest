"use client";
import React, { useState, useEffect } from "react";
import intl from "../../utils/locales/jp/jp.json";
const TabComponent = ({ tabReset, setActiveTab, activeTab }) => {
  const [isMobile, setIsMobile] = useState(false);

  const handleTabClick = (index) => {
    setActiveTab(index);
    tabReset(true);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const styleConstants = {
    tab: {
      flex: 1,
      height: "40px",
      borderRadius: "9px",
      fontSize: "20px",
      lineHeight: "29px",
      textAlign: "center",
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      ...(isMobile && {
        fontSize: "12px",
        height: "35px",
        lineHeight: "normal",
        verticalAlign: "center",
      }),
    },
    normalTab: {
      background: "rgba(255, 255, 255, 0.95)",
      color: "#9E9E9E",
    },
    activeTab: {
      background: "#19388B",
      boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
      color: "#FFFFFF",
    },
  };

  const handleTabHover = (index) => {
    if (activeTab !== index) {
      // Apply styles when not active tab and hovered
      const tabElement = document.getElementById(`tab-${index}`);
      if (tabElement) {
        tabElement.style.background = "#19388B";
        tabElement.style.boxShadow = "0px 0px 15px rgba(0, 0, 0, 0.1)";
        tabElement.style.color = "#FFFFFF";
      }
    }
  };

  const handleTabLeave = (index) => {
    if (activeTab !== index) {
      // Reset styles when not active tab and mouse leaves
      const tabElement = document.getElementById(`tab-${index}`);
      if (tabElement) {
        tabElement.style.background = "rgba(255, 255, 255, 0.95)";
        tabElement.style.boxShadow = "none";
        tabElement.style.color = "#9E9E9E";
      }
    }
  };

  const tabs = [
    { text: intl.tab_wireless_number_setting },
    { text: intl.tab_group_label },
    { text: intl.tab_contact_address },
  ];

  return (
    <div className="flex items-center">
      {tabs.map((tab, index) => (
        <div
          key={tab.text}
          id={`tab-${index}`}
          className={` ${index !== tabs.length - 1 ? "mr-2" : ""}`}
          style={{
            ...styleConstants.tab,
            ...(activeTab === index
              ? styleConstants.activeTab
              : styleConstants.normalTab),
          }}
          onClick={() => {
            handleTabClick(index);
          }}
          onMouseEnter={() => handleTabHover(index)}
          onMouseLeave={() => handleTabLeave(index)}
          tabIndex={index} // Pass the tabIndex as a prop
        >
          {tab.text}
        </div>
      ))}
    </div>
  );
};

export default TabComponent;
