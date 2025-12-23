"use client";

import React, { useCallback, useState } from "react";
import { useCatPackingItems } from "@/app/api/warehouse/catPacking/core";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks/RFIDContext";
import UICatPacking from "@/module/warehouse/catPacking/UICatPacking";
import { RFIDPrintDialog } from "@/components/rfid";

function CatPackingContent() {
  const { items, loading, refetch } = useCatPackingItems({ limit: 500 });
  const { hasPermission } = useMenu();

  const { print, printing, isConnected } = useRFIDContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handlePrintSingle = useCallback(
    async (item, options = {}) => {
      if (!isConnected) {
        alert("Printer ไม่ได้เชื่อมต่อ");
        return;
      }

      try {
        await print(
          {
            number: item.number,
            displayName: item.displayName,
            displayName2: item.displayName2 || "",
          },
          {
            type: options.type || "barcode",
            enableRFID: options.enableRFID || false,
          }
        );
        alert(`พิมพ์ ${item.number} สำเร็จ`);
      } catch (err) {
        console.error("Print error:", err);
        alert(`พิมพ์ไม่สำเร็จ: ${err.message}`);
      }
    },
    [print, isConnected]
  );

  const handlePrintMultiple = useCallback((items) => {
    setSelectedItems(items);
    setDialogOpen(true);
  }, []);

  const handlePrintSuccess = useCallback((result) => {
    console.log("Print success:", result);
    setDialogOpen(false);
  }, []);

  const handlePrintError = useCallback((error) => {
    console.error("Print error:", error);
    alert(`พิมพ์ไม่สำเร็จ: ${error}`);
  }, []);

  if (!hasPermission("warehouse.catPacking.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return (
    <>
      <UICatPacking
        items={items}
        loading={loading}
        onPrintSingle={handlePrintSingle}
        onPrintMultiple={handlePrintMultiple}
        printerConnected={isConnected}
        printing={printing}
        onRefresh={refetch}
      />

      <RFIDPrintDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        items={selectedItems}
        onSuccess={handlePrintSuccess}
        onError={handlePrintError}
      />
    </>
  );
}

export default function CatPackingPage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000,
      }}
    >
      <CatPackingContent />
    </RFIDProvider>
  );
}
