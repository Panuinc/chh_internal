"use client";
import React from "react";
import UIHeader from "@/components/UIHeader";
import { DataTable } from "@/components";
import { LoadingState } from "@/components";

const columns = [
  { name: "ID", uid: "permissionIndex", sortable: true },
  { name: "Permission Name", uid: "permissionName", sortable: true },
  { name: "Status", uid: "permissionStatus", sortable: true },
  { name: "Created By", uid: "permissionCreatedBy", sortable: true },
  { name: "Created At", uid: "permissionCreatedAt", sortable: true },
  { name: "Updated By", uid: "permissionUpdatedBy", sortable: true },
  { name: "Updated At", uid: "permissionUpdatedAt", sortable: true },
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
  headerTopic,
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
    <div className="flex flex-col items-center justify-start w-full xl:w-10/12 h-full p-2 gap-2 border overflow-auto">
      <UIHeader header={headerTopic} />

      <div className="flex flex-row items-center justify-center w-full h-fit gap-2">
        <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 text-foreground bg-background rounded-xl shadow-md">
          <div className="flex items-center justify-start w-full h-full p-2 gap-2">
            Total Permissions
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-lg">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 text-foreground bg-background rounded-xl shadow-md">
          <div className="flex items-center justify-start w-full h-full p-2 gap-2">
            Active Permissions
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-success text-lg">
            {enabled}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 text-foreground bg-background rounded-xl shadow-md">
          <div className="flex items-center justify-start w-full h-full p-2 gap-2">
            Inactive Permissions
          </div>
          <div className="flex items-center justify-start w-full h-full p-2 gap-2 text-danger text-lg">
            {disabled}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full h-fit gap-2 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
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
