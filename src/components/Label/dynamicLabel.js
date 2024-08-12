"use client";

import React from "react";

export default function DynamicLabel({
  text,
  alignment,
  fontSize,
  fontWeight,
  textColor,
  disabled,
  htmlFor,
  isRequired,
  cursor = "initial",
}) {
  const labelStyles = `${alignment ? alignment : ""} ${
    fontSize ? fontSize : ""
  } ${fontWeight ? fontWeight : ""} truncate`;
  const styles = {
    color: textColor || "",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : cursor,
  };

  return (
    <main>
      {text && (
        <div>
          <label className={labelStyles} style={styles} htmlFor={htmlFor}>
            {text} {isRequired && <span className="text-[#ED2E2E]"> *</span>}
          </label>
        </div>
      )}
    </main>
  );
}
