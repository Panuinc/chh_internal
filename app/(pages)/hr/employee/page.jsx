"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIEmployee from "@/module/hr/employee/UIEmployee";
import { useEmployees } from "@/app/api/hr/employee/core";
import { useMenu } from "@/hooks";

export default function EmployeePage() {
  const router = useRouter();
  const { employees, loading } = useEmployees();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("employee.create")) return;
    router.push("/hr/employee/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("employee.update")) return;
    router.push(`/hr/employee/${item.employeeId}`);
  };

  return (
    <UIEmployee
      Employees={employees}
      loading={loading}
      onAddNew={hasPermission("employee.create") ? handleAddNew : null}
      onEdit={hasPermission("employee.update") ? handleEdit : null}
    />
  );
}