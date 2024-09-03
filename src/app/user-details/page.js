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
import TerminalSettings from "@/components/TerminalSettings/page";
import { toast } from "react-toastify";

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
      <Breadcrumb links={userSubSectionLinks} />
      <div className="text-[20px] font-semibold text-[#0D0E11]">
        {Employee.name}
      </div>
      <div>
        <Tabs
          defaultActiveKey={"1"}
          activeKey={tabKey}
          className="mt-2"
          onChange={onTabChange}
        >
          <TabPane tab="ユーザー詳細" key="1">
            <div>
              <UserDetails />
            </div>
          </TabPane>
          <TabPane tab="グループ" key="2">
            <div>
              <Group tab={tabKey} />
            </div>
          </TabPane>
          <TabPane tab="連絡先" key="3">
            <div>
              <Contact tab={tabKey} />
            </div>
          </TabPane>
          <TabPane tab="端末設定" key="4">
            <TerminalSettings />
          </TabPane>
          <TabPane tab="操作ログ" key="5">
            <ViewLog tab={tabKey} />
            {/* Content for See Logs */}
          </TabPane>
          <TabPane tab="その他" key="6">
            <Other />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
