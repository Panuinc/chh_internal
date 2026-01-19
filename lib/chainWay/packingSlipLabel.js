export const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

const DOTS_PER_MM = 8;
export const LABEL = {
  WIDTH_MM: 100,
  HEIGHT_MM: 150,
  WIDTH_DOTS: 100 * DOTS_PER_MM,
  HEIGHT_DOTS: 150 * DOTS_PER_MM,
};

export const SECTIONS = {
  HEADER_HEIGHT: 160,
  GAP1_HEIGHT: 40,
  RECIPIENT_HEIGHT: 160,
  GAP2_HEIGHT: 40,
  TABLE_HEADER_HEIGHT: 40,
  TABLE_BODY_HEIGHT: 560,
  FOOTER_HEIGHT: 200,
};

function generateOrderQRUrl(order) {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
  return `${baseUrl}/sales/salesOrderOnline/${order.id}`;
}

export function calculateTotalPieces(order) {
  const itemLines = (order?.salesOrderLines || []).filter(
    (l) => l.lineType === "Item",
  );
  return itemLines.reduce((sum, line) => sum + (line.quantity || 0), 0);
}

export async function generateAllPackingSlips(order) {
  const totalPieces = calculateTotalPieces(order);

  if (totalPieces === 0) {
    return [];
  }

  try {
    const response = await fetch("/api/chainWay/packingSlip", {
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
      const labels = await generateAllPackingSlips(order);

      for (const labelCommand of labels) {
        const response = await fetch("/api/chainWay/command", {
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

export default {
  generateAllPackingSlips,
  printPackingSlips,
  calculateTotalPieces,
  COMPANY_INFO,
  LABEL,
  SECTIONS,
};
