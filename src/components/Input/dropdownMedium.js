import React, { useRef, useEffect } from "react";
import DropDownIcon from "../Icons/dropdownIcon";
import intl from "../../utils/locales/jp/jp.json";
export default function DropdownMedium(props) {
  const selectRef = useRef(null);
  let selectedOptionValue = props.value || "";
  const handleChange = (event) => {
    event.stopPropagation();
    const selectedIndex = event.target.selectedIndex;
    const selectedOption = event.target.options[selectedIndex];
    const selectedValue = selectedOption.value;
    if (props.onChange) {
      props.onChange(selectedValue, event);
      selectedOptionValue = selectedValue;
    }
  };
  const handleIconClick = (event) => {
    event.stopPropagation();
    selectRef.current.click();
  };
  const requiredColor = {
    color: "#ED2E2E",
  };

  return (
    <main>
      <label
        htmlFor="countries"
        className={`block pt-1 text-[14px] font-normal ${props.labelClass}`}
        style={{ color: props.labelColor }}
      >
        {props.label}
        {props.isRequired && <span style={requiredColor}> *</span>}
      </label>
      <div className="select-container">
        <select
          id={props.id}
          className={`${props.additionalClass} ${props.padding} ${props.text}
            ${props.border} ${props.borderRound} ${props.additionalClass}
            ${props.focus} ${props.bg} truncate dark:text-black ${
            selectedOptionValue == "" ? "text-[#85868B]" : "text-black"
          }`}
          ref={selectRef}
          onChange={handleChange}
          onBlur={handleChange}
          value={props?.value}
          disabled={props?.isDisabled || false}
        >
          {!props.defaultSelectNoOption && (
            <option
              disabled
              selected
              hidden
              value=""
              style={{ fontSize: "14px", width: "200px" }}
              key={"default"}
              className="text-[#85868B]"
            >
              {props?.placeholder || intl.dropdownmedium_select_label}
            </option>
          )}
          {props.options.map((dropDownOption, index) => {
            // Check if the length of the option label is greater than 50 characters
            let maxLabelLength = props?.isModal ? 28 : 50;
            const optionLabel =
              dropDownOption[props.optionLabel].length > maxLabelLength
                ? dropDownOption[props.optionLabel].substring(
                    0,
                    maxLabelLength
                  ) + "..." // Truncate the label
                : dropDownOption[props.optionLabel]; // Use the full label if not too long

            return (
              <option
                className={`bg-white text-black rounded max-w-[10px] truncate ${
                  dropDownOption?.disabled ? "bg-gray-300" : ""
                }`}
                id={`id-${index}`}
                key={dropDownOption.value + index}
                value={dropDownOption.value}
                style={{ fontSize: "14px" }}
                disabled={dropDownOption?.disabled ?? false}
              >
                {optionLabel}
              </option>
            );
          })}
        </select>
      </div>
    </main>
  );
}
