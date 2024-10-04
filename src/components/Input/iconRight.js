"use client";

export default function IconRight(props) {
  const requiredColor = {
    color: "#ED2E2E",
  };
  return (
    <main>
      <div>
        <label
          htmlFor={props.for}
          className="block mb-1 text-[16px] font-medium"
          style={{ color: props.labelColor }}
        >
          {props.label}
          {props.isRequired && <span style={requiredColor}> *</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {props.icon() ? props.icon() : null}
          </div>
          <input
            type={props.type}
            id={props.id}
            name={props.name ? props.name : props.id}
            className={`
                  block w-full ${props.padding}  text-[16px]
                  ${props.border} ${props.borderRound} ${props.focus} ${props.additionalClass}`}
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
          />
        </div>
      </div>
    </main>
  );
}
