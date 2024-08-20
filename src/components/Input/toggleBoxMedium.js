"use client";
import Switch from "react-switch";

export default function ToggleBoxMedium(props) {
  const cursorClass = props.isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';
  return (
    <>
    
      <label className={`flex flex-1 items-center justify-between pr-2 py-3 ${cursorClass}`}>
        <div
          className={`text-ellipsis overflow-hidden truncate  ${props.labelClass}`}
          style={{ color: props.labelColor, fontSize: "16px" }}
        >
          {props.label}
        </div>
  
       
      </label>
            <div
            className={`react-switch-wrapper ${cursorClass}`}
            style={{ pointerEvents: props.isDisabled ? 'none' : 'auto' }}
          >
        
      <Switch
          disabled={props.isDisabled || false}
          checked={props.toggle}
          onChange={() => {
            props.setToggle(!props.toggle);
          }}
          onColor={'#ABBBE4'} 
          onHandleColor={'#ABBBE4'}
          handleDiameter={props.handleDiameter}
          uncheckedIcon={props.uncheckedIcon}
          checkedIcon={props.checkedIcon}
          boxShadow={props.boxShadow}
          activeBoxShadow={props.activeBoxShadow}
          height={14}
          width={34}
          className={`react-switch ${props.additionalClass} ${cursorClass} ml-2`}
          id={props.id}
        />
         </div>
    </>
  );
}
