"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ID", uid: "permissionIndex" },
  { name: "Permission Name", uid: "permissionName" },
  { name: "Status", uid: "permissionStatus" },
  { name: "Created By", uid: "permissionCreatedBy" },
  { name: "Created At", uid: "permissionCreatedAt" },
  { name: "Updated By", uid: "permissionUpdatedBy" },
  { name: "Updated At", uid: "permissionUpdatedAt" },
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

export default function UIPermission({
  Permissions = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Permissions.length;
  const active = Permissions.filter(
    (permission) => permission.permissionStatus === "Active"
  ).length;
  const inactive = Permissions.filter(
    (permission) => permission.permissionStatus === "Inactive"
  ).length;

  const normalized = Array.isArray(Permissions)
    ? Permissions.map((permission, i) => ({
        ...permission,
        id: permission.permissionId,
        permissionIndex: i + 1,
        permissionCreatedBy: permission.createdByEmployee
          ? `${permission.createdByEmployee.employeeFirstName} ${permission.createdByEmployee.employeeLastName}`
          : permission.permissionCreatedBy || "-",
        permissionUpdatedBy: permission.updatedByEmployee
          ? `${permission.updatedByEmployee.employeeFirstName} ${permission.updatedByEmployee.employeeLastName}`
          : permission.permissionUpdatedBy || "-",
        permissionCreatedAt: permission.permissionCreatedAt
          ? new Date(permission.permissionCreatedAt).toISOString().split("T")[0]
          : "-",
        permissionUpdatedAt: permission.permissionUpdatedAt
          ? new Date(permission.permissionUpdatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Permissions</span>
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
            searchPlaceholder="Search by permission name..."
            emptyContent="No permissions found"
            itemName="permissions"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
