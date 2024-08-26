"use client";

import React from "react";

const MenuSettings = ({ color = "#817E78" }) => {
  return (
    <svg
      width="19"
      height="20"
      viewBox="0 0 19 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.214 4.793C11.782 4.793 11.382 5.193 11.382 5.625C11.382 6.057 11.782 6.457 12.214 6.457C12.645 6.457 13.046 6.057 13.046 5.625C13.046 5.193 12.645 4.793 12.214 4.793Z"
        fill={color}
      />
      <path
        d="M7.785 4.793C7.353 4.793 6.953 5.193 6.953 5.625C6.953 6.057 7.353 6.457 7.785 6.457C8.217 6.457 8.617 6.057 8.617 5.625C8.617 5.193 8.217 4.793 7.785 4.793Z"
        fill={color}
      />
      <path
        d="M17.215 13.368C16.783 13.368 16.383 13.768 16.383 14.199C16.383 14.631 16.783 15.031 17.215 15.031C17.646 15.031 18.047 14.631 18.047 14.199C18.047 13.768 17.646 13.368 17.215 13.368Z"
        fill={color}
      />
      <path
        d="M3.785 13.368C3.353 13.368 2.953 13.768 2.953 14.199C2.953 14.631 3.353 15.031 3.785 15.031C4.217 15.031 4.617 14.631 4.617 14.199C4.617 13.768 4.217 13.368 3.785 13.368Z"
        fill={color}
      />
    </svg>
  );
};

export default MenuSettings;
