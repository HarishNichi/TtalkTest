"use client";
import Switch from "react-switch";

export default function ToggleBoxMedium(props) {
  return (
    <>
      <label className="flex-col  flex-1 items-center justify-between cursor-pointer pr-2 ">
        <div
          className={`text-ellipsis overflow-hidden truncate font-normal mb-[8px] ${props.labelClass}`}
          style={{ fontSize: "14px" }}
        >
          {props.children}
        </div>
        <Switch
          disabled={props.isDisabled || false}
          checked={props.toggle}
          onChange={() => {
            props.setToggle(!props.toggle);
          }}
          onColor={"#19388B"}
          onHandleColor={"#214BB9"}
          handleDiameter={16}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.6)"}
          activeBoxShadow={"0px 0px 1px 10px rgba(0, 0, 0, 0.2)"}
          height={10}
          width={27}
          className="react-switch"
          id={props.id}
        />
      </label>
    </>
  );
}
