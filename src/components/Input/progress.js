"use client";

import { useEffect } from "react";

export default function Progress(props) {
  useEffect(() => {
    let id = props.id;
    const elm = document.getElementById(id);
    const gradient = `linear-gradient(to right, #00ACFF, #85D6FD ${props.value}%, #282828 ${props.value}%)`;
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
      className="h-1 w-full bg-black flex items-center rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700"
    />
  );
}
