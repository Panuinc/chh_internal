"use client";
import { LoaderCircle, User2 } from "lucide-react";
import { ModulePage, SubMenu } from "@/components";

export default function UIHr() {
  return (
    <ModulePage
      icon={<User2 />}
      title="Human Resource"
      sidebar={<LoaderCircle />}
    >
      <SubMenu href="hr/department" text="Department" />
      <SubMenu href="hr/employee" text="Employee" />
      <SubMenu href="hr/attendance" text="Attendance" />
    </ModulePage>
  );
}