"use client";
import React from "react";
import { DataTable } from "@/components";
import { LoadingState } from "@/components";

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
  const enabled = Permissions.filter(
    (permission) => permission.permissionStatus === "Active"
  ).length;
  const disabled = Permissions.filter(
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
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-2/12 h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Permissions
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Permissions
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {enabled}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Inactive Permissions
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {disabled}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full xl:w-10/12 h-full gap-2 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full gap-2">
            <LoadingState />
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
