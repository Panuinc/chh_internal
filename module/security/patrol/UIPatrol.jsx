"use client";
import React from "react";
import { DataTable } from "@/components";
import { LoadingState } from "@/components";

const columns = [
  { name: "ID", uid: "patrolIndex" },
  { name: "QR Code Info", uid: "patrolQrCodeInfo" },
  { name: "Note", uid: "patrolNote" },
  { name: "Picture", uid: "patrolPicturePreview" },
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
          <img
            src={`/${patrol.patrolPicture}`}
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
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-2/12 h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Patrols
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
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
            searchPlaceholder="Search by QR code info or note..."
            emptyContent="No patrols found"
            itemName="patrols"
            onAddNew={onAddNew}
          />
        )}
      </div>
    </div>
  );
}
