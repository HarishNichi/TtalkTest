"use client";

export default function IconBtn(props) {
  return (
    <main>
      <button
        type={props.type || "button"}
        className={`${
          props.bg ? props.bg : "bg-white"
        } border-2 border-customBlue  hover:bg-gray-300 ${
          props.textBold ? "font-bold" : ""
        } ${props?.textColor} ${
          props?.text
        } py-1 px-1 rounded inline-flex items-center text-base ${
          props?.additionalClass
        }`}
        onClick={props.onClick}
      >
        {props.icon()}
      </button>
    </main>
  );
}
