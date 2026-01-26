"use client";

import React, { useCallback } from "react";
import { useCatRawMaterialItems } from "@/app/api/warehouse/catRawMaterial/core";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks";
import UICatRawMaterial from "@/module/warehouse/catRawMaterial/UICatRawMaterial";
import { showToast } from "@/components";

function CatRawMaterialContent() {
  const { items, loading, refetch } = useCatRawMaterialItems({ limit: 500 });
  const { hasPermission } = useMenu();
  const { printBatch, isConnected, printing } = useRFIDContext();

  const handlePrintWithQuantity = useCallback(
    async (item, quantity, options = {}) => {
      if (!isConnected) {
        showToast("warning", "Printer is not connected");
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
          showToast(
            "success",
            `พิมพ์ ${item.number} สำเร็จ ${totalPrinted} ใบ`,
          );
        } else {
          const errorMsg = result?.results?.[0]?.error || "Unknown error";
          showToast("danger", `พิมพ์ไม่สำเร็จ: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Print error:", err);
        showToast("danger", `Print failed: ${err.message}`);
      }
    },
    [printBatch, isConnected],
  );

  if (!hasPermission("warehouse.catRawMaterial.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <UICatRawMaterial
      items={items}
      loading={loading}
      onPrintWithQuantity={handlePrintWithQuantity}
      printerConnected={isConnected}
      printing={printing}
      onRefresh={refetch}
    />
  );
}

export default function CatRawMaterialPage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000,
      }}
    >
      <CatRawMaterialContent />
    </RFIDProvider>
  );
}
