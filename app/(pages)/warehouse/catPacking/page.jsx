"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UICatPacking from "@/module/warehouse/catPacking/UICatPacking";
import { useCatPackingItems } from "@/app/api/warehouse/catPacking/core";
import { useMenu } from "@/hooks";

export default function CatPackingPage() {
  const router = useRouter();
  const { items, loading, refetch } = useCatPackingItems({ limit: 500 });
  const { hasPermission } = useMenu();

  const handleView = (item) => {
    if (!hasPermission("warehouse.catPacking.view")) return;
    router.push(`/warehouse/catPacking/${item.id}`);
  };

  return (
    <UICatPacking
      items={items}
      loading={loading}
      onView={hasPermission("warehouse.catPacking.view") ? handleView : null}
    />
  );
}