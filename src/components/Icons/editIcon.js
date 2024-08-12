"use client";

import React from "react";

const EditIcon = (props) => {
  const width = props.isMobile ? 14 : 19;
  const height = props.isMobile ? 14 : 19;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.86664 12.8799L5.78657 16.7998L0 18.6665L1.86664 12.8799Z"
        fill={props.fill}
      />
      <path
        d="M3.17798 11.5388L12.2852 2.43164L16.2448 6.39124L7.13758 15.4984L3.17798 11.5388Z"
        fill={props.fill}
      />
      <path
        d="M18.3864 4.19991L17.5464 5.03986L13.6265 1.11992L14.4664 0.27997C14.8397 -0.0933235 15.3997 -0.0933235 15.773 0.27997L18.3863 2.89319C18.7597 3.26662 18.7597 3.82665 18.3864 4.19994L18.3864 4.19991Z"
        fill={props.fill}
      />
    </svg>
  );
};

export default EditIcon;