"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIAssign from "@/module/hr/assign/UIAssign";
import { useEmployees } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useMenu } from "@/hooks";

export default function AssignPage() {
  const router = useRouter();
  const { employees, loading } = useEmployees();
  const { isSuperAdmin } = useMenu();

  const handleAssign = (employee) => {
    router.push(`/hr/assign/${employee.employeeId}`);
  };

  const activeEmployees = employees.filter(
    (emp) => emp.employeeStatus === "Active"
  );

  return (
    <UIAssign
      Employees={activeEmployees}
      loading={loading}
      onAssign={isSuperAdmin ? handleAssign : null}
    />
  );
}