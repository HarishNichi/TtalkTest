"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Layout/breadcrumb";
import { userSubSectionLinks } from "@/utils/constant";
import { Tabs } from "antd";
import Group from "@/components/Groups/page";
import employee from "@/redux/features/employee";
import UserDetails from "@/components/UserDetails/page";
import Contact from "@/components/Contacts/page";
import { useAppSelector } from "@/redux/hooks";
import ViewLog from "@/components/Logs/page";
import Other from "@/components/Other/page";
import TerminalSettings from "@/components/TerminalSettingsPopup/page";
import { toast, ToastContainer } from "react-toastify";
import intl from "@/utils/locales/jp/jp.json";

export default function UserDetail() {
  const [tabKey, setTabKey] = useState("1");
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const { TabPane } = Tabs;

  const onTabChange = (key) => {
    toast.dismiss();
    // eslint-disable-next-line no-console
    console.log(`onTabChange: ${key}`);
    setTabKey(key);
  };
  return (
    <div className="mb-[16px]">
      <ToastContainer />
      <Breadcrumb links={userSubSectionLinks} />
      <div className="text-[20px] font-semibold text-[#0D0E11]">
        {Employee.name}
      </div>
      <div>
        <Tabs
          defaultActiveKey={"1"}
          activeKey={tabKey}
          className="mt-4 mb-4"
          onChange={onTabChange}
        >
          <TabPane tab={intl.user_details} key="1">
            <div>
              <UserDetails />
            </div>
          </TabPane>
          <TabPane tab={intl.tab_group_label} key="2">
            <div>
              <Group tab={tabKey} />
            </div>
          </TabPane>
          <TabPane tab={intl.tab_contact_address} key="3">
            <div>
              <Contact tab={tabKey} />
            </div>
          </TabPane>
          <TabPane tab={intl.user_terminal_settings} key="4">
            <TerminalSettings isModal={false} />
          </TabPane>
          <TabPane tab={intl.user_operation_log} key="5">
            <ViewLog tab={tabKey} />
            {/* Content for See Logs */}
          </TabPane>
          <TabPane tab={intl.user_others} key="6">
            <Other />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
