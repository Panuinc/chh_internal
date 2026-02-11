"use client";

import React, { useCallback, useMemo } from "react";
import {
  useFinishedGoodsItems,
  extractDimensionCodes,
} from "@/features/warehouse";
import { useMenu } from "@/hooks";
import { RFIDProvider, useRFIDContext } from "@/hooks";
import { FinishedGoodsList } from "@/features/warehouse";
import { showToast } from "@/components";

function useProjectNames(items) {
  const [projectNames, setProjectNames] = React.useState(new Map());
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!items || items.length === 0) return;

    const uniqueProjectCodes = new Set();
    items.forEach((item) => {
      const extracted = extractDimensionCodes(item.number);
      if (extracted.projectCode) {
        uniqueProjectCodes.add(extracted.projectCode);
      }
    });

    if (uniqueProjectCodes.size === 0) return;

    const fetchProjectNames = async () => {
      setLoading(true);
      try {
        const codes = Array.from(uniqueProjectCodes);
        const response = await fetch(
          `/api/warehouse/dimensionValues?codes=${codes.join(",")}&dimensionCode=PROJECT`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const nameMap = new Map();
            data.data.forEach((dim) => {
              nameMap.set(dim.code, dim.displayName);
            });
            setProjectNames(nameMap);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProjectNames();
  }, [items]);

  return { projectNames, loading };
}

function FinishedGoodsContent() {
  const { items, loading, refetch } = useFinishedGoodsItems({ limit: 500 });
  const { hasPermission } = useMenu();
  const { printBatch, isConnected, printing } = useRFIDContext();
  const { projectNames, loading: projectNamesLoading } = useProjectNames(items);

  const itemsWithProject = useMemo(() => {
    if (!items || items.length === 0) return [];

    return items.map((item) => {
      const extracted = extractDimensionCodes(item.number);
      return {
        ...item,
        projectCode: extracted.projectCode || null,
        projectName: extracted.projectCode
          ? projectNames.get(extracted.projectCode) || null
          : null,
        productCode: extracted.productCode || null,
      };
    });
  }, [items, projectNames]);

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

  if (!hasPermission("warehouse.finishedGoods.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <FinishedGoodsList
      items={itemsWithProject}
      loading={loading || projectNamesLoading}
      onPrintWithQuantity={handlePrintWithQuantity}
      printerConnected={isConnected}
      printing={printing}
      onRefresh={refetch}
    />
  );
}

export default function FinishedGoodsPage() {
  return (
    <RFIDProvider
      config={{
        autoConnect: true,
        pollInterval: 15000,
      }}
    >
      <FinishedGoodsContent />
    </RFIDProvider>
  );
}
