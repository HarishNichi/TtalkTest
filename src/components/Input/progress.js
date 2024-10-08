"use client";

import { useEffect } from "react";

export default function Progress(props) {
  useEffect(() => {
    let id = props.id;
    const elm = document.getElementById(id);
    const gradient = `linear-gradient(to right, #19388B, #19388B ${props.value}%, #214BB9 ${props.value}%)`;
    elm.style.background = gradient;
  }, [props.value]);
  return (
    <input
      id={props.id}
      onChange={(e) => {
        props.setValue(() => e.target.value);
      }}
      onClick={(e) => {
        props.setValue(() => e.target.value);
      }}
      type="range"
      value={props.value}
      disabled={props.disabled}
      className="h-1 w-full bg-[#214BB9] flex items-center rounded-lg appearance-none disabled:pointer-events-none range-sm dark:bg-gray-700"
    />
  );
}
