"use client";

/**
 * Employee Hooks
 * สร้างจาก Shared Hook Factories - เหมือน Permission
 */

import { createUseList, createUseItem, createUseSubmit } from "@/lib/shared";

// ============================================================
// Constants
// ============================================================

const API_URL = "/api/hr/employee";

// ============================================================
// Formatter
// ============================================================

function formatEmployee(employee, index = null) {
  if (!employee) return null;

  return {
    ...employee,
    ...(index !== null && { employeeIndex: index + 1 }),
    employeeFullName: `${employee.employeeFirstName} ${employee.employeeLastName}`,
  };
}

// ============================================================
// Hooks
// ============================================================

export const useEmployees = createUseList(API_URL, "employees", formatEmployee);

export const useEmployee = createUseItem(API_URL, "employee", formatEmployee);

export const useSubmitEmployee = createUseSubmit(API_URL, {
  createdByField: "employeeCreatedBy",
  updatedByField: "employeeUpdatedBy",
  redirectPath: "/hr/employee",
});