/**
 * Category Packing Page
 * หน้าแสดงรายการ Items สำหรับพิมพ์ RFID Label
 */

"use client";

import React, { useCallback, useState } from "react";
import { useCatPackingItems } from "@/app/api/warehouse/catPacking/core";
import { useRFID } from "@/hooks/useRFID";
import { useMenu } from "@/hooks";
import UICatPacking from "@/module/warehouse/catPacking/UICatPacking";
import { RFIDPrintDialog } from "@/components/rfid/RFIDPrintButton";

export default function CatPackingPage() {
  const { items, loading, refetch } = useCatPackingItems({ limit: 500 });
  const { hasPermission } = useMenu();
  const { print, printing, isConnected } = useRFID({ autoConnect: true });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // พิมพ์ทีละชิ้น
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
        alert(`พิมพ์ไม่สำเร็จ: ${err.message}`);
      }
    },
    [print, isConnected]
  );

  // เปิด dialog พิมพ์หลายชิ้น
  const handlePrintMultiple = useCallback((items) => {
    setSelectedItems(items);
    setDialogOpen(true);
  }, []);

  if (!hasPermission("warehouse.catPacking.view")) return null;

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
        onSuccess={(result) => {
          console.log("Print success:", result);
        }}
        onError={(error) => {
          alert(`พิมพ์ไม่สำเร็จ: ${error}`);
        }}
      />
    </>
  );
}