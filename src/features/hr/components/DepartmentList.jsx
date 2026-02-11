"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ID", uid: "departmentIndex" },
  { name: "Department Name", uid: "departmentName" },
  { name: "Status", uid: "departmentStatus" },
  { name: "Created By", uid: "departmentCreatedBy" },
  { name: "Created At", uid: "departmentCreatedAt" },
  { name: "Updated By", uid: "departmentUpdatedBy" },
  { name: "Updated At", uid: "departmentUpdatedAt" },
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

export default function UIDepartment({
  Departments = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Departments.length;
  const active = Departments.filter(
    (department) => department.departmentStatus === "Active"
  ).length;
  const inactive = Departments.filter(
    (department) => department.departmentStatus === "Inactive"
  ).length;

  const normalized = Array.isArray(Departments)
    ? Departments.map((department, i) => ({
        ...department,
        id: department.departmentId,
        departmentIndex: i + 1,
        departmentCreatedBy: department.createdByEmployee
          ? `${department.createdByEmployee.employeeFirstName} ${department.createdByEmployee.employeeLastName}`
          : department.departmentCreatedBy || "-",
        departmentUpdatedBy: department.updatedByEmployee
          ? `${department.updatedByEmployee.employeeFirstName} ${department.updatedByEmployee.employeeLastName}`
          : department.departmentUpdatedBy || "-",
        departmentCreatedAt: department.departmentCreatedAt
          ? new Date(department.departmentCreatedAt).toISOString().split("T")[0]
          : "-",
        departmentUpdatedAt: department.departmentUpdatedAt
          ? new Date(department.departmentUpdatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Departments</span>
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
            searchPlaceholder="Search by department name..."
            emptyContent="No departments found"
            itemName="departments"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
