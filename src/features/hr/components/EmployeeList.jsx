"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ID", uid: "employeeIndex" },
  { name: "First Name", uid: "employeeFirstName" },
  { name: "Last Name", uid: "employeeLastName" },
  { name: "Email", uid: "employeeEmail" },
  { name: "Department", uid: "departmentName" },
  { name: "Role", uid: "roleName" },
  { name: "Status", uid: "employeeStatus" },
  { name: "Created By", uid: "employeeCreatedBy" },
  { name: "Created At", uid: "employeeCreatedAt" },
  { name: "Updated By", uid: "employeeUpdatedBy" },
  { name: "Updated At", uid: "employeeUpdatedAt" },
  { name: "Actions", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "Active" },
  { name: "Inactive", uid: "Inactive" },
];

const statusColorMap = {
  Active: "success",
  Inactive: "danger",
};

export default function UIEmployee({
  Employees = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Employees.length;
  const active = Employees.filter(
    (employee) => employee.employeeStatus === "Active",
  ).length;
  const inactive = Employees.filter(
    (employee) => employee.employeeStatus === "Inactive",
  ).length;

  const normalized = Array.isArray(Employees)
    ? Employees.map((employee, i) => ({
        ...employee,
        id: employee.employeeId,
        employeeIndex: i + 1,
        departmentName: employee.department?.departmentName || "-",
        roleName: employee.employeeRoles?.length > 0
          ? employee.employeeRoles.map(er => er.role?.roleName).filter(Boolean).join(", ")
          : "-",
        employeeCreatedBy: employee.createdByEmployee
          ? `${employee.createdByEmployee.employeeFirstName} ${employee.createdByEmployee.employeeLastName}`
          : employee.employeeCreatedBy || "-",
        employeeUpdatedBy: employee.updatedByEmployee
          ? `${employee.updatedByEmployee.employeeFirstName} ${employee.updatedByEmployee.employeeLastName}`
          : employee.employeeUpdatedBy || "-",
        employeeCreatedAt: employee.employeeCreatedAt
          ? new Date(employee.employeeCreatedAt).toISOString().split("T")[0]
          : "-",
        employeeUpdatedAt: employee.employeeUpdatedAt
          ? new Date(employee.employeeUpdatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      {/* Inline stats */}
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Active</span>
          <span className="text-xs font-semibold text-green-700 bg-green-50 p-2 rounded">{active}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Inactive</span>
          <span className="text-xs font-semibold text-red-700 bg-red-50 p-2 rounded">{inactive}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <Loading />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={normalized}
            statusOptions={statusOptions}
            statusColorMap={statusColorMap}
            searchPlaceholder="Search by employee name or email..."
            emptyContent="No Employees found"
            itemName="Employees"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
