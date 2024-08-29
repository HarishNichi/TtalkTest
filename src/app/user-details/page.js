"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Layout/breadcrumb";
import { userSubSectionLinks } from "@/utils/constant";
import { Tabs } from "antd";
import Group from "@/components/Groups/page";
import employee from "@/redux/features/employee";
import UserDetails from "@/components/UserDetails/page";

export default function UserDetail() {
  const [tabKey, setTabKey] = useState("1");

  const { TabPane } = Tabs;

  const onTabChange = (key) => {
    // eslint-disable-next-line no-console
    console.log(`onTabChange: ${key}`);
    setTabKey(key);
  };
  return (
    <div className="mb-[16px]">
      <Breadcrumb links={userSubSectionLinks} />
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
      <TabPane tab="Groups" key="2">
        <div>
        <Group tab={tabKey} />
        </div>
        {/* Content for Groups */}
      </TabPane>
      <TabPane tab="Contacts" key="3">
        {/* Content for Contacts */}
      </TabPane>
      <TabPane tab="Settings" key="4">
        {/* Content for Settings */}
      </TabPane>
      <TabPane tab="See Logs" key="5">
        {/* Content for See Logs */}
      </TabPane>
      <TabPane tab="Others" key="6">
        {/* Content for Others */}
      </TabPane>
    </Tabs>
      </div>
    </div>
  );
}
