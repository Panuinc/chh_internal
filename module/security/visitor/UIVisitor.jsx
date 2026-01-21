"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ลำดับ", uid: "visitorIndex" },
  { name: "ชื่อ", uid: "visitorFirstName" },
  { name: "นามสกุล", uid: "visitorLastName" },
  { name: "บริษัท", uid: "visitorCompany" },
  { name: "ทะเบียนรถ", uid: "visitorCarRegistration" },
  { name: "จังหวัด", uid: "visitorProvince" },
  { name: "ผู้ติดต่อ", uid: "visitorContactUserName" },
  { name: "เหตุผลการติดต่อ", uid: "visitorContactReason" },
  { name: "สถานะ", uid: "visitorStatus" },
  { name: "สร้างโดย", uid: "visitorCreatedByName" },
  { name: "วันที่สร้าง", uid: "visitorCreatedAt" },
  { name: "แก้ไขโดย", uid: "visitorUpdatedByName" },
  { name: "วันที่แก้ไข", uid: "visitorUpdatedAt" },
  { name: "จัดการ", uid: "actions" },
];

const statusOptions = [
  { name: "เข้า", uid: "CheckIn" },
  { name: "ออก", uid: "CheckOut" },
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
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 border-1 border-default overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            จำนวนผู้เยี่ยมชมทั้งหมด
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            ผู้เยี่ยมชมที่เข้า
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {checkIn}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-b-2 border-default">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            ผู้เยี่ยมชมที่ออก
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {checkOut}
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
            searchPlaceholder="ค้นหาด้วยชื่อผู้เยี่ยมชม..."
            emptyContent="ไม่พบข้อมูลผู้เยี่ยมชม"
            itemName="ผู้เยี่ยมชม"
            onAddNew={onAddNew}
            onEdit={onEdit}
          />
        )}
      </div>
    </div>
  );
}
