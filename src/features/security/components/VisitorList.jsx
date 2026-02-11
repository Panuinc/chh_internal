"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "#", uid: "visitorIndex" },
  { name: "First Name", uid: "visitorFirstName" },
  { name: "Last Name", uid: "visitorLastName" },
  { name: "Company", uid: "visitorCompany" },
  { name: "License Plate", uid: "visitorCarRegistration" },
  { name: "Province", uid: "visitorProvince" },
  { name: "Contact Person", uid: "visitorContactUserName" },
  { name: "Contact Reason", uid: "visitorContactReason" },
  { name: "Status", uid: "visitorStatus" },
  { name: "Created By", uid: "visitorCreatedByName" },
  { name: "Created At", uid: "visitorCreatedAt" },
  { name: "Updated By", uid: "visitorUpdatedByName" },
  { name: "Updated At", uid: "visitorUpdatedAt" },
  { name: "Actions", uid: "actions" },
];

const statusOptions = [
  { name: "Check In", uid: "CheckIn" },
  { name: "Check Out", uid: "CheckOut" },
];

const statusColorMap = {
  CheckIn: "success",
  CheckOut: "danger",
};

const contactReasonMap = {
  Shipping: "Shipping",
  BillingChequeCollection: "Cheque Collection / Billing",
  JobApplication: "Job Application",
  ProductPresentation: "Product Presentation",
  Meeting: "Meeting",
  Other: "Other",
};

export default function UIVisitor({
  Visitors = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Visitors.length;
  const checkIn = Visitors.filter(
    (visitor) => visitor.visitorStatus === "CheckIn",
  ).length;
  const checkOut = Visitors.filter(
    (visitor) => visitor.visitorStatus === "CheckOut",
  ).length;

  const normalized = Array.isArray(Visitors)
    ? Visitors.map((visitor, i) => ({
        ...visitor,
        id: visitor.visitorId,
        visitorIndex: i + 1,
        visitorContactUserName: visitor.contactUser
          ? `${visitor.contactUser.employeeFirstName} ${visitor.contactUser.employeeLastName}`
          : visitor.visitorContactUserName || "-",
        visitorContactReason:
          contactReasonMap[visitor.visitorContactReason] ||
          visitor.visitorContactReason,
        visitorCreatedByName: visitor.createdByEmployee
          ? `${visitor.createdByEmployee.employeeFirstName} ${visitor.createdByEmployee.employeeLastName}`
          : visitor.visitorCreatedByName || "-",
        visitorUpdatedByName: visitor.updatedByEmployee
          ? `${visitor.updatedByEmployee.employeeFirstName} ${visitor.updatedByEmployee.employeeLastName}`
          : visitor.visitorUpdatedByName || "-",
        visitorCreatedAt: visitor.visitorCreatedAt
          ? new Date(visitor.visitorCreatedAt).toISOString().split("T")[0]
          : "-",
        visitorUpdatedAt: visitor.visitorUpdatedAt
          ? new Date(visitor.visitorUpdatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      <div className="hidden xl:flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Visitors</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Checked In</span>
          <span className="text-xs font-semibold text-green-700 bg-green-50 p-2 rounded">{checkIn}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Checked Out</span>
          <span className="text-xs font-semibold text-red-700 bg-red-50 p-2 rounded">{checkOut}</span>
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
            searchPlaceholder="Search by visitor name..."
            emptyContent="No visitors found"
            itemName="Visitor"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
