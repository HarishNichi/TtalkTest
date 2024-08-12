"use client";

export default function IconOutlineBtn(props) {
  return (
      <button
        className={`border-[2px] lg:border-[2.5px] ${props.borderColor} bg-transparent  ${props?.textColor} ${props?.text}  md:p-0 px-4 rounded-lg flex items-center justify-center w-full`}
        onClick={props.onClick}
      >
        
        <div className="p-2  md:pl-2 md:pr-1 md:py-1 ">{props.icon()}</div>
        <div className="hidden md:block md:w-32 font-bold md:py-1">
          {props.text}
        </div>
      </button>
  );
}
