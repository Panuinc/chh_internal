"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIDepartment from "@/app/(pages)/hr/_components/department/UIDepartment";
import { useDepartments } from "@/app/(pages)/hr/_hooks/useDepartment";
import { useMenu } from "@/hooks";

export default function DepartmentPage() {
  const router = useRouter();
  const { departments, loading } = useDepartments();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("hr.department.create")) return;
    router.push("/hr/department/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("hr.department.edit")) return;
    router.push(`/hr/department/${item.departmentId}`);
  };

  return (
    <UIDepartment
      Departments={departments}
      loading={loading}
      onAddNew={hasPermission("hr.department.create") ? handleAddNew : null}
      onEdit={hasPermission("hr.department.edit") ? handleEdit : null}
    />
  );
}