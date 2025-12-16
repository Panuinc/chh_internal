// app/(protected)/hr/assign/page.js
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIAssign from "@/module/hr/assign/UIAssign";
import { useEmployees } from "@/app/api/hr/employee/core";
import { useMenu } from "@/hooks";

export default function AssignPage() {
  const router = useRouter();
  const { employees, loading } = useEmployees();
  const { hasPermission } = useMenu();

  const handleAssign = (employee) => {
    if (!hasPermission("assign.update")) return;
    router.push(`/hr/assign/${employee.employeeId}`);
  };

  // กรองเฉพาะ active employees
  const activeEmployees = employees.filter(
    (emp) => emp.employeeStatus === "Active"
  );

  return (
    <UIAssign
      Employees={activeEmployees}
      loading={loading}
      onAssign={hasPermission("assign.update") ? handleAssign : null}
    />
  );
}