"use client";

import React from "react";

const MenuDashboard = ({ color }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 19.0001H9.34625V13.9616C9.34625 13.7056 9.43283 13.4909 9.606 13.3176C9.77933 13.1444 9.994 13.0579 10.25 13.0579H13.75C14.006 13.0579 14.2207 13.1444 14.394 13.3176C14.5672 13.4909 14.6538 13.7056 14.6538 13.9616V19.0001H18V10.1539C18 10.1027 17.9888 10.0563 17.9663 10.0146C17.9439 9.97295 17.9135 9.93603 17.875 9.90386L12.1828 5.62511C12.1314 5.58028 12.0705 5.55786 12 5.55786C11.9295 5.55786 11.8686 5.58028 11.8173 5.62511L6.125 9.90386C6.0865 9.93603 6.05608 9.97295 6.03375 10.0146C6.01125 10.0563 6 10.1027 6 10.1539V19.0001ZM4.5 19.0001V10.1539C4.5 9.8677 4.564 9.59661 4.692 9.34061C4.82017 9.08444 4.99717 8.87353 5.223 8.70786L10.9155 4.41936C11.2313 4.17836 11.5923 4.05786 11.9985 4.05786C12.4047 4.05786 12.7667 4.17836 13.0845 4.41936L18.777 8.70786C19.0028 8.87353 19.1798 9.08444 19.308 9.34061C19.436 9.59661 19.5 9.8677 19.5 10.1539V19.0001C19.5 19.4091 19.3523 19.7614 19.0568 20.0569C18.7613 20.3524 18.409 20.5001 18 20.5001H14.0577C13.8016 20.5001 13.5869 20.4134 13.4137 20.2401C13.2404 20.0669 13.1538 19.8523 13.1538 19.5961V14.5579H10.8463V19.5961C10.8463 19.8523 10.7596 20.0669 10.5863 20.2401C10.4131 20.4134 10.1984 20.5001 9.94225 20.5001H6C5.591 20.5001 5.23875 20.3524 4.94325 20.0569C4.64775 19.7614 4.5 19.4091 4.5 19.0001Z"
        fill={color}
      />
    </svg>
  );
};

export default MenuDashboard;
