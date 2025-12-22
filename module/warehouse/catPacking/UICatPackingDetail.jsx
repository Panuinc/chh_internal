"use client";
import React from "react";
import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function UICatPackingDetail({ item }) {
  const router = useRouter();

  if (!item) return null;

  return (
    <div className="flex flex-col w-full h-full gap-4 p-4 overflow-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-default-500 hover:text-default-700"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <Card className="w-full">
        <CardHeader className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">{item.displayName}</h2>
            <p className="text-default-500">Item No: {item.number}</p>
          </div>
          <Chip color={item.blocked ? "danger" : "success"} variant="flat">
            {item.blocked ? "Blocked" : "Active"}
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Item Number" value={item.number} />
            <DetailItem label="Display Name" value={item.displayName} />
            <DetailItem label="Display Name 2" value={item.displayName2 || "-"} />
            <DetailItem label="Type" value={item.type} />
            <DetailItem label="Item Category" value={item.itemCategoryCode || "-"} />
            <DetailItem
              label="Inventory Posting Group"
              value={item.inventoryPostingGroupCode}
            />
            <DetailItem label="Unit of Measure" value={item.unitOfMeasureCode} />
            <DetailItem
              label="Unit Price"
              value={item.unitPrice?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            />
            <DetailItem
              label="Unit Cost"
              value={item.unitCost?.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            />
            <DetailItem
              label="Inventory"
              value={item.inventory?.toLocaleString("th-TH")}
            />
            <DetailItem label="GTIN" value={item.gtin || "-"} />
            <DetailItem
              label="Last Modified"
              value={
                item.lastModifiedDateTime
                  ? new Date(item.lastModifiedDateTime).toLocaleString("th-TH")
                  : "-"
              }
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-default-500">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}