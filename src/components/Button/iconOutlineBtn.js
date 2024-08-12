"use client";

export default function IconOutlineBtn(props) {
  return (
    <button
      className={`px-[20px] border-[2px] lg:border-[2.5px] ${
        props.borderColor
      } bg-transparent  ${props?.textColor} ${
        props?.text
      } rounded-lg flex items-center justify-center ${
        props?.btnWidth ? props.btnWidth : "w-full"
      } max-w-max  hover:bg-gray-300`}
      onClick={props.onClick}
    >
      <div className="md:pr-1 md:py-1 ">{props.icon()}</div>
      <div className="hidden md:block font-bold md:py-1">{props.text}</div>
    </button>
  );
}
