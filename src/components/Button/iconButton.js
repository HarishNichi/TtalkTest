"use client";

export default function IconButton(props) {
  return (
    <button
      type={props.type}
      className={`bg-white   h-[40px]  ${props?.textColor} ${props?.text} ${
        props?.py ? props.py : "py-1"
      } ${props?.px ? props.px : "px-4"}  ${
        props?.rounded ? props.rounded : "rounded "
      } inline-flex items-center justify-center border border-[#214BB9]`}
      onClick={props.onClick}
    >
      {props.icon()}{" "}
      <span className="ml-2 lg:hidden xl:block">{props.text}</span>
    </button>
  );
}
