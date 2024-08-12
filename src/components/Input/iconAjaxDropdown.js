"use client";
import { useState } from "react";

export default function IconAjaxDropdown(props) {
  const [toggle, setToggle] = useState(false);

  return (
    <main>
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {props.icon()}
          </div>
          <input
            disabled={props.isDisabled || false}
            type={props.type}
            id={props.id}
            className={`
                  block w-full ${props.padding} pl-10 text-sm  
                  ${props.border} ${props.borderRound} ${props.additionalClass}
            `}
            placeholder={props.placeholder}
            value={props?.value[props?.keyOfTheData] || props?.value}
            onInput={(evt) => {
              props?.onInput(evt.target.value);
            }}
            onChange={(e) => {
              props?.onChange(e.target.value);
            }}
            onFocus={() => {
              setToggle(!toggle);
            }}
            onBlur={() => {
              setTimeout(() => {
                setToggle(!toggle);
              }, 500);
            }}
          />
          {toggle && (
            <>
              <div
                id="dropdownDelay"
                style={{ zIndex: "100", position: "absolute", width: "100%" }}
                className="z-10 divide-y divide-gray-100 rounded-lg shadow w-100 mt-[8px] bg-[#F6F6F6] text-current text-sm max-h-[300px] overflow-auto"
              >
                <ul
                  className="py-2  font-semibold text-current"
                  aria-labelledby="dropdownDelayButton"
                >
                  {props.data.map((option, index) => {
                    return (
                      <li id={index} key={option.id} className="cursor-pointer">
                        <div
                          className="block pl-8 pr-4 py-2"
                          onClick={() => {
                            props.onChange(option);
                          }}
                          style={{
                            color: "#666666",
                            fontWeight: "400",
                            fontSize: "17px",
                          }}
                        >
                          {option.name}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
