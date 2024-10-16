"use client";

export default function AddButton(props) {
  return (
    <button
      className={`${
        props?.textColor
      } px-[20px] border-[1px] lg:border-[1px] h-[40px] ${
        props.borderColor
      } bg-customBlue  ${
        props?.text
      } rounded-lg flex items-center justify-center ${
        props?.btnWidth ? props.btnWidth : "w-full"
      } max-w-max  hover:bg-[#214BB9]`}
      onClick={props.onClick}
    >
      <div className="md:pr-1 md:py-1 text-2xl  ">{props.icon()}</div>
      <div className="hidden md:block font-semibold text-base md:py-1">
        {props.text}
      </div>
    </button>
  );
}
