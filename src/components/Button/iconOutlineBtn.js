"use client";

export default function IconOutlineBtn(props) {
  return (
    <button
      className={`${props?.textColor} px-[20px] border-[2px] lg:border-[2.5px] h-[32px] ${
        props.borderColor
      } bg-transparent   ${
        props?.text
      } rounded-lg flex items-center justify-center ${
        props?.btnWidth ? props.btnWidth : "w-full"
      } max-w-max  hover:bg-gray-300`}
      onClick={props.onClick}
    >
      <div className="md:pr-1 md:py-1 text-2xl  ">{props.icon()}</div>
      <div className="hidden md:block font-semibold text-base md:py-1">
        {props.text}
      </div>
    </button>
  );
}
