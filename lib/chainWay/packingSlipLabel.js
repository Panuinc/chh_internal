import { API_ENDPOINTS } from "./config.js";
import { calculateTotalPieces } from "./utils.js";

export async function generatePackingSlipsViaAPI(order) {
  const totalPieces = calculateTotalPieces(order);

  if (totalPieces === 0) {
    return [];
  }

  try {
    const response = await fetch(API_ENDPOINTS.packingSlip, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order,
        totalPieces,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to generate labels");
    }

    return result.labels || [];
  } catch (error) {
    console.error("[PackingSlip] Generate error:", error);
    throw error;
  }
}

export async function printPackingSlips(orders, onProgress) {
  const orderList = Array.isArray(orders) ? orders : [orders];

  let printed = 0;
  let total = 0;

  for (const order of orderList) {
    total += calculateTotalPieces(order);
  }

  if (total === 0) {
    return { success: false, printed: 0, total: 0, error: "No items to print" };
  }

  try {
    for (const order of orderList) {
      const labels = await generatePackingSlipsViaAPI(order);

      for (const labelCommand of labels) {
        const response = await fetch(API_ENDPOINTS.command, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: labelCommand }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to send command");
        }

        printed++;
        onProgress?.(printed, total);

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return { success: true, printed, total };
  } catch (error) {
    return { success: false, printed, total, error: error.message };
  }
}

export function previewPackingSlip(order) {
  const itemLines = (order?.salesOrderLines || []).filter(
    (l) => l.lineType === "Item",
  );

  const totalPieces = itemLines.reduce(
    (sum, line) => sum + (line.quantity || 0),
    0,
  );

  return {
    orderNumber: order.number,
    customerName: order.customerName,
    shipToName: order.shipToName,
    shipToAddress: [
      order.shipToAddressLine1,
      order.shipToAddressLine2,
      `${order.shipToCity || ""} ${order.shipToPostCode || ""}`.trim(),
    ]
      .filter(Boolean)
      .join(", "),
    phoneNumber: order.phoneNumber,
    itemCount: itemLines.length,
    totalPieces,
    items: itemLines.map((line, index) => ({
      index: index + 1,
      itemNumber: line.itemNumber,
      description: line.description,
      description2: line.description2,
      quantity: line.quantity,
      unit: line.unitOfMeasureCode,
    })),
  };
}

export { calculateTotalPieces };

export default {
  generatePackingSlipsViaAPI,
  printPackingSlips,
  previewPackingSlip,
  calculateTotalPieces,
};
