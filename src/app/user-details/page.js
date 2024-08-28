"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Layout/breadcrumb";
import { userSubSectionLinks } from "@/utils/constant";

export default function UserDetail() {
  return (
    <div className="mb-[16px]">
      <Breadcrumb links={userSubSectionLinks} />
    </div>
  );
}
