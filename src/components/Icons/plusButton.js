"use client";

import React from "react";

const PlusButton = (props) => {
  const width = props.isMobile ? 14 : 19;
  const height = props.isMobile ? 14 : 21;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.71422 0.5H6.28564V6.7853H0V10.2139H6.28564V16.5H9.71422V10.2139H16V6.7853H9.71422V0.5Z"
        fill="#19388B"
      />
    </svg>
  );
};

export default PlusButton;
