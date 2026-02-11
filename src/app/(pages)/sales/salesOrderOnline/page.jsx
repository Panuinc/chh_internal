"use client";

import React, { useCallback, useState } from "react";
import { useSalesOrdersOnline } from "@/features/sales";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks";
import { SalesOrderOnlineList } from "@/features/sales";
import { showToast } from "@/components";

function SalesOrderOnlineContent() {
  const { orders, loading, refetch } = useSalesOrdersOnline({ limit: 100 });
  const { hasPermission } = useMenu();
  const { print, printing, isConnected } = useRFIDContext();
  const [isPrintingSlip, setIsPrintingSlip] = useState(false);

  const handlePrintSingle = useCallback(
    async (order, options = {}) => {
      if (!isConnected) {
        showToast("warning", "Printer is not connected");
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
            showToast("warning", "No items to print");
            return;
          }

          setIsPrintingSlip(true);

          try {
            const { printPackingSlips } =
              await import("@/lib/chainWay/packingSlipLabel");
            const result = await printPackingSlips(order, () => {});

            if (result.success) {
              showToast(
                "success",
                `Printed ${result.printed} packing slips successfully (${order.number})`,
              );
            } else {
              throw new Error(result.error || "Print failed");
            }
          } catch (err) {
            showToast("danger", `Print failed: ${err.message}`);
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

        showToast(
          "success",
          `Printed ${lineItems.length} items from ${order.number} successfully`,
        );
      } catch (err) {
        showToast("danger", `Print failed: ${err.message}`);
      }
    },
    [print, isConnected],
  );

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
    <SalesOrderOnlineList
      orders={orders}
      loading={loading}
      onPrintSingle={handlePrintSingle}
      printerConnected={isConnected}
      printing={printing || isPrintingSlip}
      onRefresh={refetch}
    />
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
