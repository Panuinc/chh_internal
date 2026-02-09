/**
 * Thailand Post EMS Tracking Service
 * 
 * API Documentation: https://track.thailandpost.co.th/developerGuide
 * 
 * Thailand Post Tracking API v1:
 * - Base URL: https://trackapi.thailandpost.co.th/post/api/v1
 * - Authentication: Bearer Token
 * - Endpoints:
 *   - POST /track - Track parcels by barcode
 * 
 * Status Codes:
 * - 101: รับเข้าระบบ (Item received at origin)
 * - 102: ศูนย์คัดแยก (Item at sorting center)
 * - 103: ศูนย์แจกจ่าย (Item at delivery center)
 * - 104: นำจ่ายสำเร็จ (Delivery successful)
 * - 105: นำจ่ายไม่สำเร็จ (Delivery failed)
 */

import { createLogger } from "@/lib/logger.node";

const logger = createLogger("EMSService");

const THAILAND_POST_API_BASE = "https://trackapi.thailandpost.co.th/post/api/v1";

/**
 * Track EMS parcel by barcode
 * @param {string} barcode - EMS tracking number (e.g., EN123456789TH)
 * @returns {Promise<Object>} Tracking information
 */
export async function trackEMS(barcode) {
  const apiKey = process.env.THAILAND_POST_API_KEY;

  if (!apiKey) {
    logger.error("Thailand Post API key is not configured");
    throw new Error("Thailand Post API key is not configured");
  }

  if (!barcode || typeof barcode !== "string") {
    throw new Error("Invalid barcode provided");
  }

  // Validate EMS barcode format (should be like EN123456789TH, EK123456789TH, etc.)
  const emsPattern = /^[A-Z]{2}\d{9}[A-Z]{2}$/i;
  if (!emsPattern.test(barcode.trim())) {
    throw new Error("Invalid EMS barcode format. Expected format: EN123456789TH");
  }

  try {
    // Clean API key (remove quotes if present)
    const cleanApiKey = apiKey.replace(/^["']|["']$/g, "").trim();
    
    // Log request details for debugging (hide full API key)
    const maskedKey = cleanApiKey.substring(0, 10) + "..." + cleanApiKey.substring(cleanApiKey.length - 5);
    logger.info("Thailand Post API request", { 
      barcode: barcode.trim().toUpperCase(),
      apiKeyPreview: maskedKey,
      apiKeyLength: cleanApiKey.length 
    });

    const response = await fetch(`${THAILAND_POST_API_BASE}/track`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${cleanApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "all",
        language: "TH",
        barcode: [barcode.trim().toUpperCase()],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Thailand Post API error:", {
        status: response.status,
        body: errorText,
      });
      
      if (response.status === 401) {
        throw new Error("Authentication failed. Please check API key configuration.");
      }
      
      if (response.status === 403) {
        throw new Error("API access forbidden. Please verify your Thailand Post API key at https://track.thailandpost.co.th/developerGuide");
      }
      
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error(`Thailand Post API error: ${response.status}`);
    }

    const data = await response.json();
    logger.info("Thailand Post API response received", { barcode });

    // Check if response contains tracking data
    if (!data || !data.response || !data.response.items) {
      throw new Error("Invalid response from Thailand Post API");
    }

    const items = data.response.items[barcode.trim().toUpperCase()];

    if (!items || items.length === 0) {
      throw new Error("No tracking information found for this barcode");
    }

    return {
      barcode: barcode.trim().toUpperCase(),
      items: items,
      productName: items[0]?.product_name || "EMS",
    };
  } catch (error) {
    if (error.message?.includes("fetch failed")) {
      logger.error("Network error connecting to Thailand Post API:", error);
      throw new Error("Unable to connect to Thailand Post API. Please check your internet connection.");
    }
    
    logger.error("Error tracking EMS:", { barcode, error: error.message });
    throw error;
  }
}

/**
 * Validate EMS barcode format
 * @param {string} barcode - EMS tracking number
 * @returns {boolean} True if valid EMS barcode
 */
export function isValidEMSBarcode(barcode) {
  if (!barcode || typeof barcode !== "string") {
    return false;
  }
  
  const emsPattern = /^[A-Z]{2}\d{9}[A-Z]{2}$/i;
  return emsPattern.test(barcode.trim());
}

/**
 * Get status description in Thai
 * @param {number} statusCode - Delivery status code
 * @returns {string} Status description
 */
export function getStatusDescription(statusCode) {
  const descriptions = {
    101: "รับเข้าระบบ",
    102: "ศูนย์คัดแยก",
    103: "ศูนย์แจกจ่าย",
    104: "นำจ่ายสำเร็จ",
    105: "นำจ่ายไม่สำเร็จ",
  };
  
  return descriptions[statusCode] || "ไม่ทราบสถานะ";
}
