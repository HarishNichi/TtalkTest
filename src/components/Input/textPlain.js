"use client";

export default function TextPlain(props) {
  const disableTextStyle = {
    color: "#666666",
    fontSize: "14px",
  };
  const normalStyle = {
    color: "#303030",
    fontSize: "14px",
    fontWeight: "400",
  };
  const requiredColor = {
    color: "#ED2E2E",
  };
  return (
    <main>
      <label
        htmlFor={props.for}
        className={`flex mb-1 text-[14px] font-[400] ${props.labelClass}`}
        style={{ color: props.labelColor, fontSize: "14px" }}
      >
        {props.label}
        {props.isRequired && <span style={requiredColor}> *</span>}
      </label>
      <input
        type={props.type}
        name={props.name ? props.name : props.id}
        id={props.id}
        style={props.disabled ? disableTextStyle : normalStyle}
        className={`${props.padding} ${props.additionalClass}  
                  ${props.border} ${props.borderRound}
                  ${props.focus} ${props.bg} ${
          props.disabled ? "text-dark cursor-not-allowed" : ""
        }`}
        placeholder={props.placeholder}
        value={props.value}
        disabled={props.disabled ? props.disabled : false}
        onChange={(event) => {
          props.onChange(event);
        }}
      />
    </main>
  );
}
