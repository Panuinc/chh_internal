"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UISalesInvoice from "@/module/bc/sales-invoices/UISalesInvoice";
import { useSalesInvoices } from "@/app/api/bc/sales-invoices/core";
import { useMenu } from "@/hooks";

export default function SalesInvoicePage() {
  const router = useRouter();
  const { invoices, loading } = useSalesInvoices({
    includeLines: true,
  });
  const { hasPermission } = useMenu();

  const handleView = (item) => {
    if (!hasPermission("bc.sales-invoices.view")) return;
    router.push(`/bc/sales-invoices/${item.id}`);
  };

  const handleOpenInBC = (item) => {
    const bcUrl = `https://businesscentral.dynamics.com/?company=${encodeURIComponent(
      item.companyName || ""
    )}&page=132&filter=No. IS '${item.number}'`;
    window.open(bcUrl, "_blank");
  };

  return (
    <UISalesInvoice
      invoices={invoices}
      loading={loading}
      onView={hasPermission("bc.sales-invoices.view") ? handleView : null}
      onOpenInBC={handleOpenInBC}
    />
  );
}