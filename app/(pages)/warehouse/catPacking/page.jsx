"use client";

import React, { useCallback, useState } from "react";
import { useCatPackingItems } from "@/app/api/warehouse/catPacking/core";
import { useMenu, RFIDProvider, useRFIDContext } from "@/hooks";
import UICatPacking from "@/module/warehouse/catPacking/UICatPacking";
import { RFIDPrintDialog } from "@/components/rfid";

/**
 * Content component ที่ใช้ RFID Context
 */
function CatPackingContent() {
  const { items, loading, refetch } = useCatPackingItems({ limit: 500 });
  const { hasPermission } = useMenu();

  // ใช้ context - share state กับ components อื่น
  const { print, printing, isConnected } = useRFIDContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Debug log
  console.log("CatPackingContent render:", { isConnected, printing });

  const handlePrintSingle = useCallback(
    async (item, options = {}) => {
      console.log("handlePrintSingle called:", {
        item: item.number,
        options,
        isConnected,
      });

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
    console.log("handlePrintMultiple called:", items.length, "items");
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

/**
 * Main Page Component
 * ครอบด้วย RFIDProvider เพื่อ share state
 */
export default function CatPackingPage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000, // Check every 15 seconds
      }}
    >
      <CatPackingContent />
    </RFIDProvider>
  );
}