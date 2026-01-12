"use client";

import React, { useCallback, useState } from "react";
import { useCatPackingItems } from "@/app/api/warehouse/catPacking/core";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks";
import UICatPacking from "@/module/warehouse/catPacking/UICatPacking";
import { RFIDPrintDialog } from "@/components/chainWay";

function CatPackingContent() {
  const { items, loading, refetch } = useCatPackingItems({ limit: 500 });
  const { hasPermission } = useMenu();

  const { print, printing, isConnected } = useRFIDContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handlePrintSingle = useCallback(
    async (item, options = {}) => {
      if (!isConnected) {
        alert("Printer is not connected");
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
            type: options.type || "thai",
            enableRFID: options.enableRFID || false,
          }
        );
        alert(`Printed ${item.number} successfully`);
      } catch (err) {
        console.error("Print error:", err);
        alert(`Print failed: ${err.message}`);
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
    setSelectedItems([]);
  }, []);

  const handlePrintError = useCallback((error) => {
    console.error("Print error:", error);
    alert(`Print failed: ${error}`);
  }, []);

  if (!hasPermission("warehouse.catPacking.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
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
        onClose={() => {
          setDialogOpen(false);
          setSelectedItems([]);
        }}
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
