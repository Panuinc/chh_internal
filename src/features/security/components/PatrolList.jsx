"use client";
import React from "react";
import Image from "next/image";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "#", uid: "patrolIndex" },
  { name: "QR Code Info", uid: "patrolQrCodeInfo" },
  { name: "Notes", uid: "patrolNote" },
  { name: "Photo", uid: "patrolPicturePreview" },
  { name: "Created By", uid: "patrolCreatedByName" },
  { name: "Created At", uid: "patrolCreatedAt" },
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
          <Image
            src={`/api/uploads/${patrol.patrolPicture}`}
            alt="Patrol"
            width={56}
            height={56}
            className="object-cover rounded"
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
    <div className="flex flex-col w-full h-full overflow-hidden p-2 gap-2">
      <div className="hidden xl:flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-default-500">Total Patrols</span>
          <span className="text-xs font-semibold text-foreground bg-default-100 p-2 rounded">{total}</span>
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
            searchPlaceholder="Search by QR code info or notes..."
            emptyContent="No patrol records found"
            itemName="Patrol"
            onAddNew={onAddNew}
          />
        )}
      </div>
    </div>
  );
}
