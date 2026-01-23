"use client";

import React, { useCallback, useState } from "react";
import { useCatFinishedGoodsItems } from "@/app/api/warehouse/catFinishedGoods/core";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks";
import UICatFinishedGoods from "@/module/warehouse/catFinishedGoods/UICatFinishedGoods";

function CatFinishedGoodsContent() {
  const { items, loading, refetch } = useCatFinishedGoodsItems({ limit: 500 });
  const { hasPermission } = useMenu();
  const { printBatch, isConnected, printing } = useRFIDContext();

  const handlePrintWithQuantity = useCallback(
    async (item, quantity, options = {}) => {
      if (!isConnected) {
        alert("Printer is not connected");
        return;
      }

      try {
        const result = await printBatch([item], {
          type: options.type || "thai-rfid",
          enableRFID: options.enableRFID !== false,
          quantity: quantity,
        });

        if (result?.success) {
          const totalPrinted = result.results?.[0]?.labels?.length || quantity;
          alert(`พิมพ์ ${item.number} สำเร็จ ${totalPrinted} ใบ`);
        } else {
          const errorMsg = result?.results?.[0]?.error || "Unknown error";
          alert(`พิมพ์ไม่สำเร็จ: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Print error:", err);
        alert(`Print failed: ${err.message}`);
      }
    },
    [printBatch, isConnected],
  );

  if (!hasPermission("warehouse.catFinishedGoods.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <UICatFinishedGoods
      items={items}
      loading={loading}
      onPrintWithQuantity={handlePrintWithQuantity}
      printerConnected={isConnected}
      printing={printing}
      onRefresh={refetch}
    />
  );
}

export default function CatFinishedGoodsPage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000,
      }}
    >
      <CatFinishedGoodsContent />
    </RFIDProvider>
  );
}
