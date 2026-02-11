"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ID", uid: "employeeIndex" },
  { name: "First Name", uid: "employeeFirstName" },
  { name: "Last Name", uid: "employeeLastName" },
  { name: "Email", uid: "employeeEmail" },
  { name: "Status", uid: "employeeStatus" },
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

export default function UIAssign({ Employees = [], loading, onAssign }) {
  const total = Employees.length;
  const active = Employees.filter(
    (employee) => employee.employeeStatus === "Active"
  ).length;
  const inactive = Employees.filter(
    (employee) => employee.employeeStatus === "Inactive"
  ).length;

  const normalized = Array.isArray(Employees)
    ? Employees.map((employee, i) => ({
        ...employee,
        id: employee.employeeId,
        employeeIndex: i + 1,
      }))
    : [];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      {/* Inline stats */}
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Employees</span>
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
            onEdit={onAssign}
          />
        )}
      </div>
    </div>
  );
}
