"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "ลำดับ", uid: "patrolIndex" },
  { name: "ข้อมูล QR Code", uid: "patrolQrCodeInfo" },
  { name: "หมายเหตุ", uid: "patrolNote" },
  { name: "รูปภาพ", uid: "patrolPicturePreview" },
  { name: "สร้างโดย", uid: "patrolCreatedByName" },
  { name: "วันที่สร้าง", uid: "patrolCreatedAt" },
];

export default function UIPatrol({ Patrols = [], loading, onAddNew }) {
  const total = Patrols.length;

  const normalized = Array.isArray(Patrols)
    ? Patrols.map((patrol, i) => ({
        ...patrol,
        id: patrol.patrolId,
        patrolIndex: i + 1,
        patrolQrCodeInfo: patrol.patrolQrCodeInfo || "-",
        patrolNote: patrol.patrolNote || "-",
        patrolPicturePreview: patrol.patrolPicture ? (
          <img
            src={`/api/uploads/${patrol.patrolPicture}`}
            alt="Patrol"
            className="w-14 h-14 object-cover rounded"
          />
        ) : (
          "-"
        ),
        patrolCreatedByName: patrol.createdByEmployee
          ? `${patrol.createdByEmployee.employeeFirstName} ${patrol.createdByEmployee.employeeLastName}`
          : patrol.patrolCreatedByName || "-",
        patrolCreatedAt: patrol.patrolCreatedAt
          ? new Date(patrol.patrolCreatedAt).toISOString().split("T")[0]
          : "-",
      }))
    : [];

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            จำนวนการลาดตระเวนทั้งหมด
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
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
            searchPlaceholder="ค้นหาด้วยข้อมูล QR code หรือหมายเหตุ..."
            emptyContent="ไม่พบข้อมูลการลาดตระเวน"
            itemName="การลาดตระเวน"
            onAddNew={onAddNew}
          />
        )}
      </div>
    </div>
  );
}
