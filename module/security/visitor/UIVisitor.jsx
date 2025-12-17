"use client";
import React from "react";
import { DataTable } from "@/components";
import { LoadingState } from "@/components";

const columns = [
  { name: "ID", uid: "visitorIndex" },
  { name: "First Name", uid: "visitorFirstName" },
  { name: "Last Name", uid: "visitorLastName" },
  { name: "Company", uid: "visitorCompany" },
  { name: "Car Registration", uid: "visitorCarRegistration" },
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
  { name: "CheckIn", uid: "CheckIn" },
  { name: "CheckOut", uid: "CheckOut" },
];

const statusColorMap = {
  CheckIn: "success",
  CheckOut: "danger",
};

const contactReasonMap = {
  Shipping: "การจัดส่ง",
  BillingChequeCollection: "รับเช็ค/วางบิล",
  JobApplication: "สมัครงาน",
  ProductPresentation: "นำเสนอสินค้า",
  Meeting: "ประชุม",
  Other: "อื่นๆ",
};

export default function UIVisitor({
  Visitors = [],
  loading,
  onAddNew,
  onEdit,
}) {
  const total = Visitors.length;
  const checkIn = Visitors.filter(
    (visitor) => visitor.visitorStatus === "CheckIn"
  ).length;
  const checkOut = Visitors.filter(
    (visitor) => visitor.visitorStatus === "CheckOut"
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
            CheckIn Visitors
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {checkIn}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            CheckOut Visitors
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {checkOut}
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
