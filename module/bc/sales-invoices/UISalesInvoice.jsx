"use client";
import React from "react";
import { DataTable } from "@/components";
import { Loading } from "@/components";

const columns = [
  { name: "#", uid: "invoiceIndex" },
  { name: "Invoice No.", uid: "number" },
  { name: "Customer", uid: "displayName" },
  { name: "Total Amount", uid: "totalAmountDisplay" },
  { name: "Posting Date", uid: "postingDateDisplay" },
  { name: "Status", uid: "status" },
  { name: "Actions", uid: "actions" },
];

const statusOptions = [
  { name: "Paid", uid: "Paid" },
  { name: "Open", uid: "Open" },
  { name: "Draft", uid: "Draft" },
];

const statusColorMap = {
  Paid: "success",
  Open: "warning",
  Draft: "default",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function UISalesInvoice({
  invoices = [],
  loading,
  onView,
  onOpenInBC,
}) {
  const total = invoices.length;
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.totalAmountIncludingTax || 0),
    0
  );
  const paid = invoices.filter((inv) => inv.status === "Paid").length;
  const open = invoices.filter((inv) => inv.status === "Open").length;

  const normalized = Array.isArray(invoices)
    ? invoices.map((invoice, i) => ({
        ...invoice,
        invoiceIndex: i + 1,
        totalAmountDisplay: formatCurrency(invoice.totalAmountIncludingTax),
        postingDateDisplay: formatDate(invoice.postingDate),
      }))
    : [];

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2 overflow-hidden">
      <div className="xl:flex flex-col items-center justify-start w-full xl:w-[20%] h-full gap-2 overflow-auto hidden">
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Invoices
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {total}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Total Amount
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {formatCurrency(totalAmount)}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Paid Invoices
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {paid}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 border-1 rounded-xl">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            Open Invoices
          </div>
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            {open}
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
            searchPlaceholder="Search by invoice number or customer name..."
            emptyContent="No invoices found"
            itemName="invoices"
            onEdit={onView}
            onOpenInBC={onOpenInBC}
          />
        )}
      </div>
    </div>
  );
}
