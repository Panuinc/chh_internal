"use client";
import { Settings } from "lucide-react";
import { ModulePage, SubMenu } from "@/components";

export default function UISetting() {
  return (
    <ModulePage
      icon={<Settings />}
      title="Setting"
      sidebar={<span>1</span>}
    >
      <SubMenu href="setting/aa" text="AA" />
      <SubMenu href="setting/bb" text="BB" />
      <SubMenu href="setting/cc" text="CC" />
    </ModulePage>
  );
}