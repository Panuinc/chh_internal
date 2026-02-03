"use client";

import React, { useCallback } from "react";
import { useRawMaterialItems } from "@/app/(pages)/warehouse/_hooks/useRawMaterial";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks";
import UIRawMaterial from "@/app/(pages)/warehouse/_components/rawMaterial/UIRawMaterial";
import { showToast } from "@/components";

function RawMaterialContent() {
  const { items, loading, refetch } = useRawMaterialItems({ limit: 500 });
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

  if (!hasPermission("warehouse.rawMaterial.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <UIRawMaterial
      items={items}
      loading={loading}
      onPrintWithQuantity={handlePrintWithQuantity}
      printerConnected={isConnected}
      printing={printing}
      onRefresh={refetch}
    />
  );
}

export default function RawMaterialPage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000,
      }}
    >
      <RawMaterialContent />
    </RFIDProvider>
  );
}
