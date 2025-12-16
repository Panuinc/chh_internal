"use client";
import React from "react";
import { DataTable } from "@/components";
import { LoadingState } from "@/components";

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
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-2/12 h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Accounts
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Accounts
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {active}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Inactive Accounts
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {inactive}
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