"use client";

import React, { useCallback, useState } from "react";
import { useSalesOrdersOnline } from "@/app/api/sales/salesOrderOnline/core";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/app/api/chainWay/core";
import UISalesOrderOnline from "@/module/sales/salesOrderOnline/UISalesOrderOnline";
import { RFIDPrintDialog } from "@/components/chainWay";

function SalesOrderOnlineContent() {
  const { orders, loading, refetch } = useSalesOrdersOnline({ limit: 100 });
  const { hasPermission } = useMenu();

  const { print, printing, isConnected } = useRFIDContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isPrintingSlip, setIsPrintingSlip] = useState(false);

  const handlePrintSingle = useCallback(
    async (order, options = {}) => {
      if (!isConnected) {
        alert("Printer is not connected");
        return;
      }

      try {
        if (options.type === "packingSlip") {
          const itemLines =
            order.salesOrderLines?.filter((l) => l.lineType === "Item") || [];
          const totalPieces = itemLines.reduce(
            (sum, l) => sum + (l.quantity || 0),
            0,
          );

          if (totalPieces === 0) {
            alert("No items to print");
            return;
          }

          setIsPrintingSlip(true);

          try {
            const { printPackingSlips } =
              await import("@/lib/chainWay/packingSlipLabel");

            const result = await printPackingSlips(order, (current, total) => {
              console.log(`Printing ${current}/${total}`);
            });

            if (result.success) {
              alert(
                `พิมพ์ใบปะหน้า ${result.printed} ใบสำเร็จ (${order.number})`,
              );
            } else {
              throw new Error(result.error || "Print failed");
            }
          } catch (err) {
            console.error("Packing slip print error:", err);
            alert(`Print failed: ${err.message}`);
          } finally {
            setIsPrintingSlip(false);
          }

          return;
        }

        const lineItems =
          order.salesOrderLines?.filter((l) => l.lineType === "Item") || [];

        for (const line of lineItems) {
          await print(
            {
              number: line.itemNumber,
              displayName: line.description,
              displayName2: line.description2 || "",
              orderNumber: order.number,
              customerName: order.customerName,
            },
            {
              type: options.type || "thai",
              enableRFID: options.enableRFID || false,
            },
          );
        }
        alert(
          `Printed ${lineItems.length} items from ${order.number} successfully`,
        );
      } catch (err) {
        console.error("Print error:", err);
        alert(`Print failed: ${err.message}`);
      }
    },
    [print, isConnected],
  );

  const handlePrintMultiple = useCallback((orders) => {
    setSelectedOrders(orders);
    setDialogOpen(true);
  }, []);

  const handlePrintSuccess = useCallback((result) => {
    console.log("Print success:", result);
    setDialogOpen(false);
    setSelectedOrders([]);
  }, []);

  const handlePrintError = useCallback((error) => {
    console.error("Print error:", error);
    alert(`Print failed: ${error}`);
  }, []);

  if (!hasPermission("sales.salesOrderOnline.view")) {
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
      <UISalesOrderOnline
        orders={orders}
        loading={loading}
        onPrintSingle={handlePrintSingle}
        onPrintMultiple={handlePrintMultiple}
        printerConnected={isConnected}
        printing={printing || isPrintingSlip}
        onRefresh={refetch}
      />

      <RFIDPrintDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedOrders([]);
        }}
        items={selectedOrders.flatMap((order) =>
          (order.salesOrderLines || [])
            .filter((l) => l.lineType === "Item")
            .map((line) => ({
              number: line.itemNumber,
              displayName: line.description,
              displayName2: line.description2 || "",
              orderNumber: order.number,
              customerName: order.customerName,
            })),
        )}
        onSuccess={handlePrintSuccess}
        onError={handlePrintError}
      />
    </>
  );
}

export default function SalesOrderOnlinePage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000,
      }}
    >
      <SalesOrderOnlineContent />
    </RFIDProvider>
  );
}
