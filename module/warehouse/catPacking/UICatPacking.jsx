"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "#", uid: "index" },
  { name: "Item No.", uid: "number" },
  { name: "Display Name", uid: "displayName" },
  { name: "Category", uid: "itemCategoryCode" },
  { name: "Unit", uid: "unitOfMeasureCode" },
  { name: "Unit Price", uid: "unitPrice" },
  { name: "Inventory", uid: "inventory" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "Active" },
  { name: "Blocked", uid: "Blocked" },
];

const statusColorMap = {
  Active: "success",
  Blocked: "danger",
};

export default function UICatPacking({
  items = [],
  loading,
  onAddNew,
  onEdit,
  onView,
}) {
  const total = items.length;
  const active = items.filter((item) => !item.blocked).length;
  const blocked = items.filter((item) => item.blocked).length;

  const normalized = Array.isArray(items)
    ? items.map((item, i) => ({
        ...item,
        id: item.id,
        index: i + 1,
        status: item.blocked ? "Blocked" : "Active",
        unitPrice: item.unitPrice?.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || "0.00",
        inventory: item.inventory?.toLocaleString("th-TH") || "0",
      }))
    : [];

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Items (PK)
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-2xl font-bold">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Active Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-2xl font-bold text-success">
            {active}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Blocked Items
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-2xl font-bold text-danger">
            {blocked}
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
            searchPlaceholder="Search by item number or name..."
            emptyContent="No packing items found"
            itemName="items"
            onAddNew={onAddNew}
            onEdit={onEdit}
            onView={onView}
          />
        )}
      </div>
    </div>
  );
}