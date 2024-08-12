"use client"

const CloseIcon = ({ color,onClick,margin }) => {
  return (
    <svg
      role={"close-icon"}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${margin} cursor-pointer`}
      onClick={onClick}
    >
      <circle cx="10" cy="10" r="10" fill={color} />
      <path
        d="M13.75 5.74854L14.8747 6.87324L6.62685 15.1211L5.50214 13.9964L13.75 5.74854Z"
        fill="#fff"
      />
      <path
        d="M5.5 6.49854L6.62471 5.37383L14.8726 13.6217L13.7479 14.7464L5.5 6.49854Z"
        fill="#fff"
      />
    </svg>
  );
};

export default CloseIcon;
