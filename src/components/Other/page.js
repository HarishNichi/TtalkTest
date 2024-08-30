"use client";
import { Button } from "antd";
import intl from "@/utils/locales/jp/jp.json";
import DeleteIcon from "../Icons/deleteIcon";

export default function Other() {
  return (
    <div className="bg-white p-[32px]">
      <div className="ml-[16px] font-normal text-sm mb-1">
        {intl.login_password_placeholder}
      </div>
      <div>
        <div className="flex ml-[16px] mb-[16px]">
          <Button
            type="default"
            style={{
              color: "#BA1818", // Red text color
              borderColor: "#BA1818",
              fontWeight: 600, // Font weight 600
              fontSize: "16px",
              padding: "10px 22.5px",
              height: "40px",
              borderRadius: "4px",
            }}
          >
            {intl.user_details_password_reset_btn}
          </Button>
        </div>
      </div>
      <div className="ml-[16px] font-normal text-sm mb-1">
        {intl.user_terminal_settings}
      </div>
      <div className="ml-[16px]">
        <Button
          type="default"
          style={{
            color: "#19388B", // Custom blue text color
            borderColor: "#19388B",
            fontWeight: 600, // Font weight 600
            fontSize: "16px",
            padding: "10px 22.5px",
            height: "40px",
            borderRadius: "4px",
          }}
        >
          {intl.user_restore_default_settings}
        </Button>
      </div>
    </div>
  );
}
