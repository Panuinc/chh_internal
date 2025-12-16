"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIDepartment from "@/module/hr/department/UIDepartment";
import { useDepartments } from "@/app/api/hr/department/core";
import { useMenu } from "@/hooks";

export default function DepartmentPage() {
  const router = useRouter();
  const { departments, loading } = useDepartments();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("department.create")) return;
    router.push("/hr/department/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("department.update")) return;
    router.push(`/hr/department/${item.departmentId}`);
  };

  return (
    <UIDepartment
      Departments={departments}
      loading={loading}
      onAddNew={hasPermission("department.create") ? handleAddNew : null}
      onEdit={hasPermission("department.update") ? handleEdit : null}
    />
  );
}