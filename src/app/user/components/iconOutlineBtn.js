"use client";

export default function IconOutlineBtn(props) {
  return (
    <button
      className={`border-[2px] lg:border-[2.5px] ${props.borderColor} bg-transparent  ${props?.textColor} ${props?.text}  md:p-0 px-4 rounded-lg flex items-center justify-center w-full  hover:bg-gray-300`}
      onClick={props.onClick}
    >
      <div className="md:pr-1 md:py-1 md:pl-5">{props.icon()}</div>
      <div className="hidden md:block min-w-max font-bold md:py-1 md:pr-5">
        {props.text}
      </div>
    </button>
  );
}
