/**
 * Packing Slip Label Generator for ChainWay/Zebra Printer
 * Size: 100mm x 150mm (800 x 1200 dots at 8 dots/mm)
 * Format: ZPL (Zebra Programming Language)
 * 
 * Layout (from top to bottom):
 * - Header (Logo + ผู้ส่ง): 2cm = 160 dots
 * - Gap: 0.5cm = 40 dots  
 * - Recipient (ผู้รับ + ที่อยู่): 2cm = 160 dots
 * - Gap: 0.5cm = 40 dots
 * - Table Header: 0.5cm = 40 dots
 * - Items Table: 7cm = 560 dots
 * - Footer (หมายเหตุ + QR): 2.5cm = 200 dots
 */

// Company info (sender)
export const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

// Label dimensions (dots at 203 DPI ≈ 8 dots/mm)
const DOTS_PER_MM = 8;
export const LABEL = {
  WIDTH_MM: 100,
  HEIGHT_MM: 150,
  WIDTH_DOTS: 100 * DOTS_PER_MM,  // 800
  HEIGHT_DOTS: 150 * DOTS_PER_MM, // 1200
};

// Section heights in dots (from layout spec)
export const SECTIONS = {
  HEADER_HEIGHT: 160,      // 2cm - Logo + ผู้ส่ง
  GAP1_HEIGHT: 40,         // 0.5cm
  RECIPIENT_HEIGHT: 160,   // 2cm - ผู้รับ + ที่อยู่
  GAP2_HEIGHT: 40,         // 0.5cm
  TABLE_HEADER_HEIGHT: 40, // 0.5cm
  TABLE_BODY_HEIGHT: 560,  // 7cm - Items table
  FOOTER_HEIGHT: 200,      // 2.5cm - หมายเหตุ + QR
};

/**
 * Generate QR Code URL for order
 */
function generateOrderQRUrl(order) {
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com");
  return `${baseUrl}/sales/salesOrderOnline/${order.id}`;
}

/**
 * Calculate total pieces from order
 */
export function calculateTotalPieces(order) {
  const itemLines = (order?.salesOrderLines || []).filter(
    (l) => l.lineType === "Item"
  );
  return itemLines.reduce((sum, line) => sum + (line.quantity || 0), 0);
}

/**
 * Generate all packing slip labels for an order via server API
 * @param {Object} order - Sales order data
 * @returns {Promise<string[]>} Array of ZPL command strings
 */
export async function generateAllPackingSlips(order) {
  const totalPieces = calculateTotalPieces(order);

  if (totalPieces === 0) {
    return [];
  }

  try {
    // Call server API to generate ZPL (handles logo loading, Thai text conversion)
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

/**
 * Print packing slips for order(s) via API
 * @param {Object|Object[]} orders - Single order or array of orders
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<{success: boolean, printed: number, total: number}>}
 */
export async function printPackingSlips(orders, onProgress) {
  const orderList = Array.isArray(orders) ? orders : [orders];
  
  let printed = 0;
  let total = 0;

  // Calculate total labels
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
        // Send via command API
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
        
        // Small delay between prints
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