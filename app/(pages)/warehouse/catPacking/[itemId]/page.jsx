"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components";
import { useCatPackingItem } from "@/app/api/warehouse/catPacking/core";
import { useMenu } from "@/hooks";
import UICatPackingDetail from "@/module/warehouse/catPacking/UICatPackingDetail";

export default function CatPackingDetailPage() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { itemId } = useParams();

  const { item, loading } = useCatPackingItem(itemId);

  useEffect(() => {
    if (!hasPermission("warehouse.catPacking.view")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  if (loading) return <Loading />;

  if (!item) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p>Item not found</p>
      </div>
    );
  }

  return <UICatPackingDetail item={item} />;
}