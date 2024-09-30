"use client";

export default function TextareaMedium(props) {
  const disableTextStyle = {
    color: "#666666",
    fontSize: "16px",
    resize: props.resize ? props.resize : "none",
  };
  const normalStyle = {
    color: "#303030",
    fontWeight: "400",
    fontSize: "16px",
    resize: props.resize ? props.resize : "none",
  };
  const requiredColor = {
    color: "#ED2E2E",
  };
  return (
    <main>
      <label
        htmlFor={props.for}
        className={`block  font-medium ${props.labelClass}`}
        style={{ color: props.labelColor, fontSize: "16px" }}
      >
        {props.label}
        {props.isRequired && <span style={requiredColor}> *</span>}
      </label>
      <textarea
        id={props.id}
        name={props.name ? props.name : props.id}
        rows="2"
        style={props.disabled ? disableTextStyle : normalStyle}
        className={`
                block ${props.padding} w-full 
                ${props.text} 
                ${props.bg} rounded border border-[#E7E7E9] p-[8px]
                ${props.border} 
                ${props.focus}  
                ${props.additionalClass}  
              `}
        placeholder={props.placeholder}
        value={props.value}
        disabled={props.disabled ? props.disabled : false}
        onChange={(event) => {
          props.onChange(event);
        }}
        onKeyDown={(event) => {
          props.onKeyDownEvent && props.onKeyDownEvent(event);
        }}
        onFocus={(event) => {
          props.onKeyDownEvent && props.onKeyDownEvent(event);
        }}
        onBlur={(event) => {
          props.onKeyDownEvent && props.onKeyDownEvent(event);
        }}
      ></textarea>
    </main>
  );
}
