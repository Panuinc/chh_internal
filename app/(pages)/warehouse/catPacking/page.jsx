/**
 * Cat Packing Page
 * หน้าจัดการ Category Packing Items พร้อมฟังก์ชันพิมพ์ RFID
 */

"use client";

import React, { useCallback, useState } from "react";
import { useCatPackingItems } from "@/app/api/warehouse/catPacking/core";
import { useRFID } from "@/hooks/useRFID";
import { useMenu } from "@/hooks";
import UICatPacking from "@/module/warehouse/catPacking/UICatPacking";
import { RFIDPrintDialog } from "@/components/rfid";

export default function CatPackingPage() {
  const { items, loading, refetch } = useCatPackingItems({ limit: 500 });
  const { hasPermission } = useMenu();
  const { print, printing, isConnected } = useRFID({ autoConnect: true });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // พิมพ์ label เดียว
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

  // เปิด dialog พิมพ์หลายรายการ
  const handlePrintMultiple = useCallback((items) => {
    setSelectedItems(items);
    setDialogOpen(true);
  }, []);

  // ตรวจสอบ permission
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
