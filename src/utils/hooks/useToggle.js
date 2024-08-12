"use client"
import { useCallback, useState } from "react";

export default function useToggle(initialValue) {
    const [on, setOn] = useState(initialValue);
    const handleToggle = useCallback((value) => {
      if (typeof value === "boolean") {
        return setOn(value);
      }

      return setOn((v) => !v);
    }, []);

    return [on, handleToggle];
  }
