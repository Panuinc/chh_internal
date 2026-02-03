"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIEmployee from "@/module/hr/employee/UIEmployee";
import { useEmployees } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useMenu } from "@/hooks";

export default function EmployeePage() {
  const router = useRouter();
  const { employees, loading } = useEmployees();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("hr.employee.create")) return;
    router.push("/hr/employee/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("hr.employee.edit")) return;
    router.push(`/hr/employee/${item.employeeId}`);
  };

  return (
    <UIEmployee
      Employees={employees}
      loading={loading}
      onAddNew={hasPermission("hr.employee.create") ? handleAddNew : null}
      onEdit={hasPermission("hr.employee.edit") ? handleEdit : null}
    />
  );
}