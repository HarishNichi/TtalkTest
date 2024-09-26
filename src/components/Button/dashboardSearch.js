"use client";

export default function DashboardSearch(props) {
  return (
    <button
      type={props.type}
      className={`bg-customBlue  hover:bg-[#214BB9] h-[40px] ${
        props?.textColor
      } ${props?.text} ${props?.py ? props.py : "py-1"} ${
        props?.px ? props.px : "px-4"
      }  ${
        props?.rounded ? props.rounded : "rounded"
      } inline-flex items-center justify-center`}
      onClick={props.onClick}
    >
      {props.icon()} <span className="ml-2 lg:hidden">{props.text}</span>
    </button>
  );
}
