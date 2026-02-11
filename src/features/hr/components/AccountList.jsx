"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ID", uid: "accountIndex" },
  { name: "Employee", uid: "accountEmployeeName" },
  { name: "Username", uid: "accountUsername" },
  { name: "Status", uid: "accountStatus" },
  { name: "Created By", uid: "accountCreatedBy" },
  { name: "Created At", uid: "accountCreatedAt" },
  { name: "Updated By", uid: "accountUpdatedBy" },
  { name: "Updated At", uid: "accountUpdatedAt" },
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

export default function UIAccount({
  Accounts = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Accounts.length;
  const active = Accounts.filter(
    (account) => account.accountStatus === "Active"
  ).length;
  const inactive = Accounts.filter(
    (account) => account.accountStatus === "Inactive"
  ).length;

  const normalized = Array.isArray(Accounts)
    ? Accounts.map((account, i) => ({
        ...account,
        id: account.accountId,
        accountIndex: i + 1,
        accountEmployeeName: account.accountEmployee
          ? `${account.accountEmployee.employeeFirstName} ${account.accountEmployee.employeeLastName}`
          : "-",
        accountCreatedBy: account.createdByEmployee
          ? `${account.createdByEmployee.employeeFirstName} ${account.createdByEmployee.employeeLastName}`
          : account.accountCreatedBy || "-",
        accountUpdatedBy: account.updatedByEmployee
          ? `${account.updatedByEmployee.employeeFirstName} ${account.updatedByEmployee.employeeLastName}`
          : account.accountUpdatedBy || "-",
        accountCreatedAt: account.accountCreatedAt
          ? new Date(account.accountCreatedAt).toISOString().split("T")[0]
          : "-",
        accountUpdatedAt: account.accountUpdatedAt
          ? new Date(account.accountUpdatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      <div className="hidden xl:flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Accounts</span>
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
            searchPlaceholder="Search by username or employee name..."
            emptyContent="No Accounts found"
            itemName="Accounts"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
