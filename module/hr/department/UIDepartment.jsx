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
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Departments
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Departments
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {active}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Inactive Departments
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {inactive}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full xl:w-[80%] h-full gap-2 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full gap-2">
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
