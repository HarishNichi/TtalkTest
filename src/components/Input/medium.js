"use client";

export default function Medium(props) {
  const disableTextStyle = {
    color: "#666666",
    fontSize: "16px",
    fontWeight: "400",
    cursor: "not-allowed",
  };
  const normalStyle = {
    color: "#303030",
    fontWeight: "500",
  };
  return (
    <main>
      <div>
        <div className="relative">
          <input
            type={props.type}
            id={props.id}
            name={props.name ? props.name : props.id}
            disabled={props.isDisabled || false}
            className={`p-2 text-[16px] ${props.padding} ${props.additionalClass}  
                  ${props.border} ${props.borderRound}
                  ${props.focus} ${props.bg}`}
            placeholder={props.placeholder}
            value={props.value}
            onChange={(event) => {
              props.onChange(event);
            }}
            onKeyDown={(event) => {
              props.onKeyDownEvent && props.onKeyDownEvent(event);
            }}
            onFocus={(event) => {
              props.onKeyDownEvent && props.onKeyDownEvent(event);
            }}
            onBlur={(event) =>{
              props.onKeyDownEvent && props.onKeyDownEvent(event);
            }}
            style={props.isDisabled ? disableTextStyle : normalStyle}
          />
        </div>
      </div>
    </main>
  );
}
