"use client";

import React, { useCallback } from "react";
import { usePackingItems } from "@/features/warehouse";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks";
import { PackingList } from "@/features/warehouse";
import { showToast } from "@/components";

function PackingContent() {
  const { items, loading, refetch } = usePackingItems({ limit: 500 });
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
            `Printed ${item.number} successfully: ${totalPrinted} labels`,
          );
        } else {
          const errorMsg = result?.results?.[0]?.error || "Unknown error";
          showToast("danger", `Print failed: ${errorMsg}`);
        }
      } catch (err) {
        showToast("danger", `Print failed: ${err.message}`);
      }
    },
    [printBatch, isConnected],
  );

  if (!hasPermission("warehouse.packing.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <PackingList
      items={items}
      loading={loading}
      onPrintWithQuantity={handlePrintWithQuantity}
      printerConnected={isConnected}
      printing={printing}
      onRefresh={refetch}
    />
  );
}

export default function PackingPage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000,
      }}
    >
      <PackingContent />
    </RFIDProvider>
  );
}
