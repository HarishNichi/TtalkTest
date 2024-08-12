"use client";

export default function IconLeftBtnCSV(props) {
  return (
    <button
      className={`bg-customBlue hover:bg-grey ${props?.textColor} ${
        props?.text
      } ${props?.py ? props.py : "py-1"} ${props?.px ? props.px : "px-4"}  ${
        props?.rounded ? props.rounded : "rounded"
      } inline-flex items-center justify-center  hover:bg-[#5283B3]`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
