"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ID", uid: "roleIndex" },
  { name: "Role Name", uid: "roleName" },
  { name: "Status", uid: "roleStatus" },
  { name: "Created By", uid: "roleCreatedBy" },
  { name: "Created At", uid: "roleCreatedAt" },
  { name: "Updated By", uid: "roleUpdatedBy" },
  { name: "Updated At", uid: "roleUpdatedAt" },
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

export default function UIRole({
  Roles = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Roles.length;
  const active = Roles.filter(
    (role) => role.roleStatus === "Active"
  ).length;
  const inactive = Roles.filter(
    (role) => role.roleStatus === "Inactive"
  ).length;

  const normalized = Array.isArray(Roles)
    ? Roles.map((role, i) => ({
        ...role,
        id: role.roleId,
        roleIndex: i + 1,
        roleCreatedBy: role.createdByEmployee
          ? `${role.createdByEmployee.employeeFirstName} ${role.createdByEmployee.employeeLastName}`
          : role.roleCreatedBy || "-",
        roleUpdatedBy: role.updatedByEmployee
          ? `${role.updatedByEmployee.employeeFirstName} ${role.updatedByEmployee.employeeLastName}`
          : role.roleUpdatedBy || "-",
        roleCreatedAt: role.roleCreatedAt
          ? new Date(role.roleCreatedAt).toISOString().split("T")[0]
          : "-",
        roleUpdatedAt: role.roleUpdatedAt
          ? new Date(role.roleUpdatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 border-1 border-default overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Roles
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Roles
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {active}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-1 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Inactive Roles
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
            searchPlaceholder="Search by role name..."
            emptyContent="No roles found"
            itemName="roles"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
