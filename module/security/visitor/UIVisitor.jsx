"use client";
import React from "react";
import { DataTable } from "@/components";
import { LoadingState } from "@/components";

const columns = [
  { name: "ID", uid: "visitorIndex" },
  { name: "Visitor Name", uid: "visitorName" },
  { name: "Status", uid: "visitorStatus" },
  { name: "Created By", uid: "visitorCreatedBy" },
  { name: "Created At", uid: "visitorCreatedAt" },
  { name: "Updated By", uid: "visitorUpdatedBy" },
  { name: "Updated At", uid: "visitorUpdatedAt" },
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

export default function UIVisitor({
  Visitors = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Visitors.length;
  const active = Visitors.filter(
    (visitor) => visitor.visitorStatus === "Active"
  ).length;
  const inactive = Visitors.filter(
    (visitor) => visitor.visitorStatus === "Inactive"
  ).length;

  const normalized = Array.isArray(Visitors)
    ? Visitors.map((visitor, i) => ({
        ...visitor,
        id: visitor.visitorId,
        visitorIndex: i + 1,
        visitorCreatedBy: visitor.createdByEmployee
          ? `${visitor.createdByEmployee.employeeFirstName} ${visitor.createdByEmployee.employeeLastName}`
          : visitor.visitorCreatedBy || "-",
        visitorUpdatedBy: visitor.updatedByEmployee
          ? `${visitor.updatedByEmployee.employeeFirstName} ${visitor.updatedByEmployee.employeeLastName}`
          : visitor.visitorUpdatedBy || "-",
        visitorCreatedAt: visitor.visitorCreatedAt
          ? new Date(visitor.visitorCreatedAt).toISOString().split("T")[0]
          : "-",
        visitorUpdatedAt: visitor.visitorUpdatedAt
          ? new Date(visitor.visitorUpdatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-2/12 h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Visitors
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Visitors
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {active}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Inactive Visitors
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
            searchPlaceholder="Search by visitor name..."
            emptyContent="No visitors found"
            itemName="visitors"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
