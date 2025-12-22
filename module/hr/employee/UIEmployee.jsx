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
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Employees
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Employees
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {active}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Inactive Employees
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
