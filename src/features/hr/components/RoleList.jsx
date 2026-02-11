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
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      {/* Inline stats */}
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Roles</span>
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
